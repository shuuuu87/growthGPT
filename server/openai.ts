// Reference: javascript_openai blueprint
import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export async function generateMCQQuestions(topic: string, subject: string): Promise<MCQQuestion[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an expert educator creating multiple-choice questions for students. Generate exactly 5 high-quality MCQ questions about the given topic. Each question should have 4 options with exactly one correct answer. Respond with JSON in this format: { "questions": [{ "question": "question text", "options": ["option1", "option2", "option3", "option4"], "correctAnswer": 0 }] } where correctAnswer is the index (0-3) of the correct option.`,
        },
        {
          role: "user",
          content: `Create 5 MCQ questions about "${topic}" in the subject of ${subject}. Make them educational, clear, and appropriate for students.`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error("Invalid response format from AI");
    }

    return result.questions;
  } catch (error: any) {
    console.error("Error generating MCQ questions:", error);
    throw new Error("Failed to generate quiz questions: " + error.message);
  }
}
