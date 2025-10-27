import { Achievement } from "@shared/schema";

export type AchievementCondition = 
  | { type: "quizzes_completed", value: number }
  | { type: "perfect_score", value: number }
  | { type: "consecutive_perfect", value: number }
  | { type: "accuracy_average", value: number, over: number }
  | { type: "accuracy_with_score", accuracy: number, minScore: number }
  | { type: "questions_answered", value: number }
  | { type: "quizzes_in_day", value: number }
  | { type: "different_topics", value: number }
  | { type: "questions_in_topic", value: number, topic: string }
  | { type: "streak_days", value: number }
  | { type: "study_time", value: number }
  | { type: "leaderboard_position", value: number }
  | { type: "leaderboard_rank_one", value: boolean }
  | { type: "users_beaten", value: number }
  | { type: "quiz_time", maxTime: number, minQuestions: number, minAccuracy: number }
  | { type: "improvement", value: number }
  | { type: "exact_score", value: number }
  | { type: "study_hour", hour: number, days: number };

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, never>[] = [
  // STUDY MILESTONES - Common to Rare
  {
    id: "first_steps",
    name: "First Steps",
    description: "Complete your first quiz",
    category: "milestone",
    rarity: "common",
    icon: "🎯",
    condition: { type: "quizzes_completed", value: 1 },
  },
  {
    id: "getting_started",
    name: "Getting Started",
    description: "Complete 10 quizzes",
    category: "milestone",
    rarity: "common",
    icon: "📚",
    condition: { type: "quizzes_completed", value: 10 },
  },
  {
    id: "dedicated_learner",
    name: "Dedicated Learner",
    description: "Complete 50 quizzes",
    category: "milestone",
    rarity: "uncommon",
    icon: "📖",
    condition: { type: "quizzes_completed", value: 50 },
  },
  {
    id: "study_master",
    name: "Study Master",
    description: "Complete 100 quizzes",
    category: "milestone",
    rarity: "rare",
    icon: "🎓",
    condition: { type: "quizzes_completed", value: 100 },
  },
  {
    id: "legend",
    name: "Legend",
    description: "Complete 500 quizzes",
    category: "milestone",
    rarity: "legendary",
    icon: "👑",
    condition: { type: "quizzes_completed", value: 500 },
  },
  {
    id: "topic_explorer",
    name: "Topic Explorer",
    description: "Study 5 different topics",
    category: "milestone",
    rarity: "common",
    icon: "🗺️",
    condition: { type: "different_topics", value: 5 },
  },
  {
    id: "renaissance_mind",
    name: "Renaissance Mind",
    description: "Study 20 different topics",
    category: "milestone",
    rarity: "epic",
    icon: "🧠",
    condition: { type: "different_topics", value: 20 },
  },

  // ACCURACY & PERFORMANCE - Common to Legendary
  {
    id: "perfect_score",
    name: "Perfect Score",
    description: "Get 100% on any quiz",
    category: "accuracy",
    rarity: "common",
    icon: "⭐",
    condition: { type: "perfect_score", value: 1 },
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Get 100% on 5 quizzes",
    category: "accuracy",
    rarity: "uncommon",
    icon: "💫",
    condition: { type: "perfect_score", value: 5 },
  },
  {
    id: "flawless",
    name: "Flawless",
    description: "Get 100% on 10 consecutive quizzes",
    category: "accuracy",
    rarity: "epic",
    icon: "💎",
    condition: { type: "consecutive_perfect", value: 10 },
  },
  {
    id: "sharp_mind",
    name: "Sharp Mind",
    description: "Maintain 90%+ average over 20 quizzes",
    category: "accuracy",
    rarity: "rare",
    icon: "🧩",
    condition: { type: "accuracy_average", value: 90, over: 20 },
  },
  {
    id: "genius",
    name: "Genius",
    description: "Score 95%+ on a 20-question quiz",
    category: "accuracy",
    rarity: "rare",
    icon: "🌟",
    condition: { type: "accuracy_with_score", accuracy: 95, minScore: 19 },
  },
  {
    id: "quick_thinker",
    name: "Quick Thinker",
    description: "Complete quiz in under 2 minutes with 90%+",
    category: "speed",
    rarity: "uncommon",
    icon: "⚡",
    condition: { type: "quiz_time", maxTime: 120, minQuestions: 10, minAccuracy: 90 },
  },

  // STREAKS & CONSISTENCY - Uncommon to Legendary
  {
    id: "week_warrior",
    name: "Week Warrior",
    description: "7-day study streak",
    category: "streak",
    rarity: "uncommon",
    icon: "🔥",
    condition: { type: "streak_days", value: 7 },
  },
  {
    id: "month_master",
    name: "Month Master",
    description: "30-day study streak",
    category: "streak",
    rarity: "rare",
    icon: "🔥",
    condition: { type: "streak_days", value: 30 },
  },
  {
    id: "unstoppable",
    name: "Unstoppable",
    description: "100-day study streak",
    category: "streak",
    rarity: "epic",
    icon: "🔥",
    condition: { type: "streak_days", value: 100 },
  },
  {
    id: "golden_streak",
    name: "Golden Streak",
    description: "Never miss a day for 365 days",
    category: "streak",
    rarity: "legendary",
    icon: "🏆",
    condition: { type: "streak_days", value: 365 },
  },
  {
    id: "morning_scholar",
    name: "Morning Scholar",
    description: "Study 7 days in a row before 9am",
    category: "streak",
    rarity: "rare",
    icon: "🌅",
    condition: { type: "study_hour", hour: 9, days: 7 },
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Study 7 days in a row after 10pm",
    category: "streak",
    rarity: "rare",
    icon: "🦉",
    condition: { type: "study_hour", hour: 22, days: 7 },
  },

  // VOLUME & DEDICATION - Common to Epic
  {
    id: "question_crusher",
    name: "Question Crusher",
    description: "Answer 100 questions",
    category: "volume",
    rarity: "common",
    icon: "💪",
    condition: { type: "questions_answered", value: 100 },
  },
  {
    id: "answer_machine",
    name: "Answer Machine",
    description: "Answer 1,000 questions",
    category: "volume",
    rarity: "rare",
    icon: "🤖",
    condition: { type: "questions_answered", value: 1000 },
  },
  {
    id: "quiz_marathon",
    name: "Quiz Marathon",
    description: "Complete 10 quizzes in one day",
    category: "volume",
    rarity: "uncommon",
    icon: "🏃",
    condition: { type: "quizzes_in_day", value: 10 },
  },
  {
    id: "study_session",
    name: "Study Session",
    description: "Study for 30 minutes straight",
    category: "volume",
    rarity: "common",
    icon: "⏰",
    condition: { type: "study_time", value: 30 },
  },
  {
    id: "deep_dive",
    name: "Deep Dive",
    description: "Complete 50 questions on single topic",
    category: "volume",
    rarity: "uncommon",
    icon: "🏊",
    condition: { type: "questions_in_topic", value: 50, topic: "any" },
  },

  // IMPROVEMENT & GROWTH - Uncommon to Rare
  {
    id: "rising_star",
    name: "Rising Star",
    description: "Improve score by 20% on same topic",
    category: "improvement",
    rarity: "uncommon",
    icon: "📈",
    condition: { type: "improvement", value: 20 },
  },
  {
    id: "comeback_kid",
    name: "Comeback Kid",
    description: "Score 90%+ after getting below 50%",
    category: "improvement",
    rarity: "uncommon",
    icon: "🎯",
    condition: { type: "improvement", value: 40 },
  },
  {
    id: "mastery",
    name: "Mastery",
    description: "Go from 60% to 95%+ on a topic",
    category: "improvement",
    rarity: "rare",
    icon: "🏅",
    condition: { type: "improvement", value: 35 },
  },

  // LEADERBOARD & SOCIAL - Uncommon to Epic
  {
    id: "top_ten",
    name: "Top 10",
    description: "Reach top 10 on leaderboard",
    category: "leaderboard",
    rarity: "uncommon",
    icon: "🥉",
    condition: { type: "leaderboard_position", value: 10 },
  },
  {
    id: "top_five",
    name: "Top 5",
    description: "Reach top 5 on leaderboard",
    category: "leaderboard",
    rarity: "rare",
    icon: "🥈",
    condition: { type: "leaderboard_position", value: 5 },
  },
  {
    id: "number_one",
    name: "#1 Spot",
    description: "Reach #1 on leaderboard",
    category: "leaderboard",
    rarity: "epic",
    icon: "🥇",
    condition: { type: "leaderboard_rank_one", value: true },
  },
  {
    id: "competitive",
    name: "Competitive",
    description: "Beat 10 different users' scores",
    category: "leaderboard",
    rarity: "uncommon",
    icon: "⚔️",
    condition: { type: "users_beaten", value: 10 },
  },

  // SPEED - Common to Rare
  {
    id: "lightning_fast",
    name: "Lightning Fast",
    description: "Complete 10-question quiz in under 60 seconds",
    category: "speed",
    rarity: "uncommon",
    icon: "⚡",
    condition: { type: "quiz_time", maxTime: 60, minQuestions: 10, minAccuracy: 70 },
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Answer 100 questions in under 10 minutes",
    category: "speed",
    rarity: "rare",
    icon: "🏎️",
    condition: { type: "quiz_time", maxTime: 600, minQuestions: 100, minAccuracy: 75 },
  },

  // FUN & QUIRKY - Common to Rare
  {
    id: "lucky_sevens",
    name: "Lucky Number Seven",
    description: "Score exactly 77%",
    category: "fun",
    rarity: "uncommon",
    icon: "🎰",
    condition: { type: "exact_score", value: 77 },
  },
  {
    id: "perfectionist_100",
    name: "Century",
    description: "Score exactly 100 points",
    category: "fun",
    rarity: "uncommon",
    icon: "💯",
    condition: { type: "exact_score", value: 100 },
  },
  {
    id: "midnight_scholar",
    name: "Midnight Scholar",
    description: "Complete quiz at exactly midnight",
    category: "fun",
    rarity: "rare",
    icon: "🌙",
    condition: { type: "study_hour", hour: 0, days: 1 },
  },

  // SPECIAL - Epic to Legendary
  {
    id: "early_adopter",
    name: "Early Adopter",
    description: "One of the first 100 users",
    category: "special",
    rarity: "epic",
    icon: "🌱",
    condition: { type: "quizzes_completed", value: 1 },
  },
  {
    id: "perfect_week",
    name: "Perfect Week",
    description: "100% accuracy on all quizzes for 7 days",
    category: "special",
    rarity: "legendary",
    icon: "✨",
    condition: { type: "consecutive_perfect", value: 50 },
  },
];

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case "common":
      return "text-gray-400 dark:text-gray-500";
    case "uncommon":
      return "text-green-500 dark:text-green-400";
    case "rare":
      return "text-blue-500 dark:text-blue-400";
    case "epic":
      return "text-purple-500 dark:text-purple-400";
    case "legendary":
      return "text-yellow-500 dark:text-yellow-400";
    default:
      return "text-gray-400";
  }
}

export function getRarityBadgeColor(rarity: string): string {
  switch (rarity) {
    case "common":
      return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    case "uncommon":
      return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
    case "rare":
      return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300";
    case "epic":
      return "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300";
    case "legendary":
      return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
  }
}
