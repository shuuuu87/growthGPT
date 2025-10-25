import { sql, relations } from "drizzle-orm";
import {
  index,
  uniqueIndex,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  text,
  date,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Study sessions table
export const studySessions = pgTable("study_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  topic: text("topic").notNull(),
  subject: varchar("subject").notNull(),
  estimatedTime: integer("estimated_time").notNull(), // in minutes
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quiz results table
export const quizResults = pgTable("quiz_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id").notNull().references(() => studySessions.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  questions: jsonb("questions").notNull(), // Store questions, options, correct answers
  userAnswers: jsonb("user_answers").notNull(), // Store user's answers
  createdAt: timestamp("created_at").defaultNow(),
});

// Goals table
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  type: varchar("type").notNull(), // 'daily' or 'weekly'
  targetDate: date("target_date").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Study activity table for tracking daily study
export const studyActivity = pgTable("study_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  studyTime: integer("study_time").notNull().default(0), // in minutes
  score: integer("score").notNull().default(0),
}, (table) => ({
  userDateUnique: uniqueIndex("user_date_unique").on(table.userId, table.date),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  studySessions: many(studySessions),
  quizResults: many(quizResults),
  goals: many(goals),
  studyActivity: many(studyActivity),
}));

export const studySessionsRelations = relations(studySessions, ({ one, many }) => ({
  user: one(users, {
    fields: [studySessions.userId],
    references: [users.id],
  }),
  quizResults: many(quizResults),
}));

export const quizResultsRelations = relations(quizResults, ({ one }) => ({
  user: one(users, {
    fields: [quizResults.userId],
    references: [users.id],
  }),
  session: one(studySessions, {
    fields: [quizResults.sessionId],
    references: [studySessions.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));

export const studyActivityRelations = relations(studyActivity, ({ one }) => ({
  user: one(users, {
    fields: [studyActivity.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertStudySessionSchema = createInsertSchema(studySessions).omit({
  id: true,
  createdAt: true,
  userId: true,
  completedAt: true,
});

export const insertQuizResultSchema = createInsertSchema(quizResults).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  userId: true,
  completedAt: true,
});

// TypeScript types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type StudyActivity = typeof studyActivity.$inferSelect;
