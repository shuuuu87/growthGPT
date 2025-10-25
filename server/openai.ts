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
          content: `You are an expert educator creating questions for students. Generate exactly 5 questions with one-word answers about the given topic. Each question should be clear and have a simple one-word answer. Format your response as a numbered list with "Q:" for question and "A:" for answer on the next line. Example:
1. Q: What is the capital of France?
   A: Paris
2. Q: What color is the sky?
   A: Blue`,
        },
        {
          role: "user",
          content: `Create 5 questions with one-word answers about "${topic}" in the subject of ${subject}. Make them educational, clear, and appropriate for students.`,
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
  
  // Try to parse the numbered list format
  const lines = text.split('\n').filter(line => line.trim());
  let currentQuestion = '';
  let currentAnswer = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Match question pattern (1. Q: or just Q:)
    if (trimmed.match(/^\d+\.\s*Q:/i) || trimmed.startsWith('Q:')) {
      if (currentQuestion && currentAnswer) {
        questions.push(createQuestion(currentQuestion, currentAnswer));
        currentQuestion = '';
        currentAnswer = '';
      }
      currentQuestion = trimmed.replace(/^\d+\.\s*Q:\s*/i, '').replace(/^Q:\s*/i, '').trim();
    }
    // Match answer pattern
    else if (trimmed.match(/^A:/i)) {
      currentAnswer = trimmed.replace(/^A:\s*/i, '').trim();
      if (currentQuestion && currentAnswer) {
        questions.push(createQuestion(currentQuestion, currentAnswer));
        currentQuestion = '';
        currentAnswer = '';
      }
    }
  }
  
  // Add the last question if exists
  if (currentQuestion && currentAnswer) {
    questions.push(createQuestion(currentQuestion, currentAnswer));
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
      question: `What is the main concept of ${topic}?`,
      options: ['concept', 'idea', 'theory', 'principle'],
      correctAnswer: 0,
    },
    {
      question: `Which term best describes ${topic}?`,
      options: ['term', 'word', 'phrase', 'label'],
      correctAnswer: 0,
    },
    {
      question: `What field does ${topic} belong to?`,
      options: ['field', 'area', 'domain', 'subject'],
      correctAnswer: 0,
    },
  ];
}
