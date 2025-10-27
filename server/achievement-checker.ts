import { storage } from "./storage";
import { ACHIEVEMENT_DEFINITIONS, type AchievementCondition } from "./achievements";
import { QuizResult } from "@shared/schema";
import { db } from "./db";
import { quizResults, studyActivity, studySessions } from "@shared/schema";
import { eq, sql, and, desc, gte } from "drizzle-orm";

interface UserStats {
  userId: string;
  totalQuizzes: number;
  totalQuestions: number;
  perfectScores: number;
  consecutivePerfect: number;
  recentAccuracy: number[];
  allQuizResults: QuizResult[];
  uniqueTopics: Set<string>;
  streak: number;
  totalStudyTime: number;
  todayQuizzes: number;
}

export async function checkAndAwardAchievements(
  userId: string,
  latestQuizResult: QuizResult
): Promise<string[]> {
  const stats = await getUserStats(userId);
  const newlyUnlocked: string[] = [];

  for (const achievement of ACHIEVEMENT_DEFINITIONS) {
    const hasIt = await storage.hasAchievement(userId, achievement.id);
    if (hasIt) continue;

    const condition = achievement.condition as AchievementCondition;
    const earned = await checkCondition(condition, stats, latestQuizResult);

    if (earned) {
      await storage.awardAchievement(userId, achievement.id);
      newlyUnlocked.push(achievement.id);
    }
  }

  return newlyUnlocked;
}

async function getUserStats(userId: string): Promise<UserStats> {
  const allQuizResults = await storage.getUserQuizResults(userId);
  const sessions = await storage.getUserStudySessions(userId);
  const streak = await storage.getStreak(userId);
  const activities = await storage.getUserActivity(userId, 365);

  const totalStudyTime = activities.reduce((sum, a) => sum + a.studyTime, 0);
  
  const today = new Date().toISOString().split("T")[0];
  const todayQuizzes = allQuizResults.filter(
    (qr) => qr.createdAt && qr.createdAt.toISOString().split("T")[0] === today
  ).length;

  const uniqueTopics = new Set<string>();
  for (const session of sessions) {
    uniqueTopics.add(session.topic);
  }

  const perfectScores = allQuizResults.filter(
    (qr) => qr.score === qr.totalQuestions
  ).length;

  let consecutivePerfect = 0;
  for (const qr of allQuizResults) {
    if (qr.score === qr.totalQuestions) {
      consecutivePerfect++;
    } else {
      break;
    }
  }

  const recentAccuracy = allQuizResults
    .slice(0, 20)
    .map((qr) => (qr.score / qr.totalQuestions) * 100);

  const totalQuestions = allQuizResults.reduce((sum, qr) => sum + qr.totalQuestions, 0);

  return {
    userId,
    totalQuizzes: allQuizResults.length,
    totalQuestions,
    perfectScores,
    consecutivePerfect,
    recentAccuracy,
    allQuizResults,
    uniqueTopics,
    streak,
    totalStudyTime,
    todayQuizzes,
  };
}

async function checkCondition(
  condition: AchievementCondition,
  stats: UserStats,
  latestQuiz: QuizResult
): Promise<boolean> {
  switch (condition.type) {
    case "quizzes_completed":
      return stats.totalQuizzes >= condition.value;

    case "perfect_score":
      return stats.perfectScores >= condition.value;

    case "consecutive_perfect":
      return stats.consecutivePerfect >= condition.value;

    case "accuracy_average": {
      if (stats.recentAccuracy.length < condition.over) return false;
      const avg = stats.recentAccuracy.slice(0, condition.over).reduce((a, b) => a + b, 0) / condition.over;
      return avg >= condition.value;
    }

    case "accuracy_with_score": {
      const accuracy = (latestQuiz.score / latestQuiz.totalQuestions) * 100;
      return accuracy >= condition.accuracy && latestQuiz.score >= condition.minScore;
    }

    case "questions_answered":
      return stats.totalQuestions >= condition.value;

    case "quizzes_in_day":
      return stats.todayQuizzes >= condition.value;

    case "different_topics":
      return stats.uniqueTopics.size >= condition.value;

    case "questions_in_topic": {
      const topicQuizzes = stats.allQuizResults.filter((qr) => {
        return true;
      });
      const topicQuestions = topicQuizzes.reduce((sum, qr) => sum + qr.totalQuestions, 0);
      return topicQuestions >= condition.value;
    }

    case "streak_days":
      return stats.streak >= condition.value;

    case "study_time":
      return stats.totalStudyTime >= condition.value;

    case "leaderboard_position":
      return false;

    case "leaderboard_rank_one":
      return false;

    case "users_beaten":
      return false;

    case "quiz_time": {
      return false;
    }

    case "improvement":
      return false;

    case "exact_score": {
      const percentage = Math.round((latestQuiz.score / latestQuiz.totalQuestions) * 100);
      return percentage === condition.value || latestQuiz.score === condition.value;
    }

    case "study_hour": {
      const quizHour = latestQuiz.createdAt ? latestQuiz.createdAt.getHours() : -1;
      if (condition.hour === 0) {
        return quizHour === 0 || quizHour === 24;
      }
      return quizHour < condition.hour && stats.streak >= condition.days;
    }

    default:
      return false;
  }
}
