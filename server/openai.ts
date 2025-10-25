// Using OpenRouter.ai with Llama 3.3 70B model
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "HTTP-Referer": process.env.REPLIT_DOMAINS || "http://localhost:5000",
    "X-Title": "Growth GPT",
  },
});

interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export async function generateMCQQuestions(topic: string, subject: string): Promise<MCQQuestion[]> {
  try {
    const response = await openai.chat.completions.create({
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
      max_completion_tokens: 1024,
    });

    const content = response.choices[0].message.content || "";
    
    // Parse the response to extract questions and answers
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
  
  // Try to parse the multiple choice format
  const lines = text.split('\n');
  let currentQuestion = '';
  let currentOptions: string[] = [];
  let correctAnswer = -1;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Match question pattern (1. Q: or just Q:)
    if (trimmed.match(/^\d+\.\s*Q:/i) || trimmed.startsWith('Q:')) {
      // Save previous question if complete
      if (currentQuestion && currentOptions.length === 4 && correctAnswer >= 0) {
        questions.push({
          question: currentQuestion,
          options: currentOptions,
          correctAnswer: correctAnswer,
        });
      }
      // Reset for new question
      currentQuestion = trimmed.replace(/^\d+\.\s*Q:\s*/i, '').replace(/^Q:\s*/i, '').trim();
      currentOptions = [];
      correctAnswer = -1;
    }
    // Match option patterns (A:, B:, C:, D:)
    else if (trimmed.match(/^[A-D]:/i)) {
      const optionText = trimmed.replace(/^[A-D]:\s*/i, '').trim();
      currentOptions.push(optionText);
    }
    // Match correct answer pattern (CORRECT: B)
    else if (trimmed.match(/^CORRECT:\s*[A-D]/i)) {
      const correctLetter = trimmed.replace(/^CORRECT:\s*/i, '').trim().toUpperCase();
      correctAnswer = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);
    }
  }
  
  // Add the last question if complete
  if (currentQuestion && currentOptions.length === 4 && correctAnswer >= 0) {
    questions.push({
      question: currentQuestion,
      options: currentOptions,
      correctAnswer: correctAnswer,
    });
  }
  
  // If parsing failed, create fallback questions
  if (questions.length === 0) {
    return createFallbackQuestions(topic);
  }
  
  return questions.slice(0, 5); // Return max 5 questions
}

function createQuestion(questionText: string, correctAnswer: string): MCQQuestion {
  // Create a multiple choice question with the correct answer and 3 distractors
  const options = [correctAnswer.toLowerCase()];
  
  // Add simple distractors based on answer type
  const answer = correctAnswer.toLowerCase();
  
  // Generate context-appropriate distractors
  if (!isNaN(Number(answer))) {
    // Numeric answer - add nearby numbers
    const num = Number(answer);
    options.push(String(num + 1), String(num - 1), String(num * 2));
  } else if (answer.length <= 3) {
    // Short answer - add generic options
    options.push('yes', 'no', 'none');
  } else {
    // Text answer - add generic distractors
    options.push('unknown', 'none', 'other');
  }
  
  // Shuffle options and find correct answer index
  const shuffled = Array.from(new Set(options)).slice(0, 4);
  const correctIndex = shuffled.findIndex(opt => opt.toLowerCase() === answer);
  
  return {
    question: questionText,
    options: shuffled,
    correctAnswer: correctIndex >= 0 ? correctIndex : 0,
  };
}

function createFallbackQuestions(topic: string): MCQQuestion[] {
  // Fallback questions in case parsing fails
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
