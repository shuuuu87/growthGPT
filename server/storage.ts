// Reference: javascript_database and javascript_log_in_with_replit blueprints
import {
  users,
  studySessions,
  quizResults,
  goals,
  studyActivity,
  type User,
  type UpsertUser,
  type StudySession,
  type InsertStudySession,
  type QuizResult,
  type InsertQuizResult,
  type Goal,
  type InsertGoal,
  type StudyActivity,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Study sessions
  getUserStudySessions(userId: string): Promise<StudySession[]>;
  createStudySession(userId: string, session: InsertStudySession): Promise<StudySession>;
  getStudySession(id: string): Promise<StudySession | undefined>;
  completeStudySession(id: string): Promise<StudySession>;

  // Quiz results
  createQuizResult(userId: string, result: InsertQuizResult): Promise<QuizResult>;
  getUserQuizResults(userId: string): Promise<QuizResult[]>;

  // Goals
  getUserGoals(userId: string): Promise<Goal[]>;
  createGoal(userId: string, goal: InsertGoal): Promise<Goal>;
  completeGoal(id: string): Promise<Goal>;

  // Study activity
  getUserActivity(userId: string, days: number): Promise<StudyActivity[]>;
  upsertActivity(userId: string, date: string, studyTime: number, score: number): Promise<void>;
  getStreak(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Study sessions
  async getUserStudySessions(userId: string): Promise<StudySession[]> {
    return await db
      .select()
      .from(studySessions)
      .where(eq(studySessions.userId, userId))
      .orderBy(desc(studySessions.createdAt));
  }

  async createStudySession(userId: string, session: InsertStudySession): Promise<StudySession> {
    const [newSession] = await db
      .insert(studySessions)
      .values({ ...session, userId })
      .returning();
    return newSession;
  }

  async getStudySession(id: string): Promise<StudySession | undefined> {
    const [session] = await db.select().from(studySessions).where(eq(studySessions.id, id));
    return session;
  }

  async completeStudySession(id: string): Promise<StudySession> {
    const [session] = await db
      .update(studySessions)
      .set({ completed: true, completedAt: new Date() })
      .where(eq(studySessions.id, id))
      .returning();
    return session;
  }

  // Quiz results
  async createQuizResult(userId: string, result: InsertQuizResult): Promise<QuizResult> {
    const [newResult] = await db
      .insert(quizResults)
      .values({ ...result, userId })
      .returning();
    return newResult;
  }

  async getUserQuizResults(userId: string): Promise<QuizResult[]> {
    return await db
      .select()
      .from(quizResults)
      .where(eq(quizResults.userId, userId))
      .orderBy(desc(quizResults.createdAt));
  }

  // Goals
  async getUserGoals(userId: string): Promise<Goal[]> {
    return await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }

  async createGoal(userId: string, goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db
      .insert(goals)
      .values({ ...goal, userId })
      .returning();
    return newGoal;
  }

  async completeGoal(id: string): Promise<Goal> {
    const [goal] = await db
      .update(goals)
      .set({ completed: true, completedAt: new Date() })
      .where(eq(goals.id, id))
      .returning();
    return goal;
  }

  // Study activity
  async getUserActivity(userId: string, days: number): Promise<StudyActivity[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    return await db
      .select()
      .from(studyActivity)
      .where(
        and(
          eq(studyActivity.userId, userId),
          gte(studyActivity.date, startDateStr)
        )
      )
      .orderBy(studyActivity.date);
  }

  async upsertActivity(userId: string, date: string, studyTime: number, score: number): Promise<void> {
    await db
      .insert(studyActivity)
      .values({ userId, date, studyTime, score })
      .onConflictDoUpdate({
        target: [studyActivity.userId, studyActivity.date],
        set: {
          studyTime: sql`${studyActivity.studyTime} + ${studyTime}`,
          score: sql`${studyActivity.score} + ${score}`,
        },
      });
  }

  async getStreak(userId: string): Promise<number> {
    const activities = await db
      .select()
      .from(studyActivity)
      .where(eq(studyActivity.userId, userId))
      .orderBy(desc(studyActivity.date));

    if (activities.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if there's activity today or yesterday
    const latestDate = new Date(activities[0].date);
    latestDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Streak broken if last activity was more than 1 day ago
    if (daysDiff > 1) return 0;

    let currentDate = new Date(today);
    if (daysDiff === 1) {
      // If last activity was yesterday, start counting from yesterday
      currentDate.setDate(currentDate.getDate() - 1);
    }

    for (const activity of activities) {
      const activityDate = new Date(activity.date);
      activityDate.setHours(0, 0, 0, 0);

      if (activityDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }
}

export const storage = new DatabaseStorage();
