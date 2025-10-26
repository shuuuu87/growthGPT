interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export async function generateMCQQuestions(topic: string, subject: string): Promise<MCQQuestion[]> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.REPLIT_DOMAINS || "http://localhost:5000",
        "X-Title": "Growth GPT",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct:free",
        messages: [
          {
            role: "system",
            content: `You are an expert educator creating multiple choice questions for students. Generate exactly 5 questions about the given topic. Each question should have 4 answer options (A, B, C, D) with only ONE correct answer. The wrong answers should be plausible but clearly incorrect. Format your response exactly like this:

1. Q: What is the capital of France?
   A: London
   B: Paris
   C: Berlin
   D: Madrid
   CORRECT: B

2. Q: What gas do plants absorb during photosynthesis?
   A: Oxygen
   B: Nitrogen
   C: Carbon Dioxide
   D: Hydrogen
   CORRECT: C`,
          },
          {
            role: "user",
            content: `Create 5 multiple choice questions about "${topic}" in the subject of ${subject}. Make them educational, clear, and appropriate for students. Each question must have 4 different answer options with only one correct answer.`,
          },
        ],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    
    const questions = parseQuestionsFromText(content, topic);
    
    if (questions.length === 0) {
      throw new Error("No questions were generated");
    }

    return questions;
  } catch (error: any) {
    console.error("Error generating MCQ questions:", error);
    throw new Error("Failed to generate quiz questions: " + error.message);
  }
}

function parseQuestionsFromText(text: string, topic: string): MCQQuestion[] {
  const questions: MCQQuestion[] = [];
  
  const lines = text.split('\n');
  let currentQuestion = '';
  let currentOptions: string[] = [];
  let correctAnswer = -1;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.match(/^\d+\.\s*Q:/i) || trimmed.startsWith('Q:')) {
      if (currentQuestion && currentOptions.length === 4 && correctAnswer >= 0) {
        questions.push({
          question: currentQuestion,
          options: currentOptions,
          correctAnswer: correctAnswer,
        });
      }
      currentQuestion = trimmed.replace(/^\d+\.\s*Q:\s*/i, '').replace(/^Q:\s*/i, '').trim();
      currentOptions = [];
      correctAnswer = -1;
    }
    else if (trimmed.match(/^[A-D]:/i)) {
      const optionText = trimmed.replace(/^[A-D]:\s*/i, '').trim();
      currentOptions.push(optionText);
    }
    else if (trimmed.match(/^CORRECT:\s*[A-D]/i)) {
      const correctLetter = trimmed.replace(/^CORRECT:\s*/i, '').trim().toUpperCase();
      correctAnswer = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);
    }
  }
  
  if (currentQuestion && currentOptions.length === 4 && correctAnswer >= 0) {
    questions.push({
      question: currentQuestion,
      options: currentOptions,
      correctAnswer: correctAnswer,
    });
  }
  
  if (questions.length === 0) {
    return createFallbackQuestions(topic);
  }
  
  return questions.slice(0, 5);
}

function createFallbackQuestions(topic: string): MCQQuestion[] {
  return [
    {
      question: `What is the primary focus when studying ${topic}?`,
      options: ['Understanding core concepts and principles', 'Memorizing dates only', 'Learning unrelated subjects', 'Ignoring practical applications'],
      correctAnswer: 0,
    },
    {
      question: `Why is learning about ${topic} important?`,
      options: ['It builds foundational knowledge', 'It has no practical use', 'It only matters for tests', 'It should be avoided'],
      correctAnswer: 0,
    },
    {
      question: `What approach is best for mastering ${topic}?`,
      options: ['Regular practice and review', 'Cramming before exams', 'Avoiding difficult concepts', 'Skipping fundamentals'],
      correctAnswer: 0,
    },
  ];
}
