import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./localAuth";
import { generateMCQQuestions } from "./openrouter";
import { insertStudySessionSchema, insertQuizResultSchema, insertGoalSchema, insertUserSchema, loginSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import passport from "passport";
import { getRandomAvatar } from "@shared/avatars";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.post('/api/register', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        profileImageUrl: getRandomAvatar(),
      });

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    } catch (error: any) {
      console.error("Error registering user:", error);
      
      if (error.code === '23505') {
        if (error.detail?.includes('username')) {
          return res.status(400).json({ message: "Username already exists" });
        }
        if (error.detail?.includes('email')) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }
      
      if (error.issues) {
        return res.status(400).json({ message: error.issues[0]?.message || "Validation error" });
      }
      
      res.status(400).json({ message: error.message || "Failed to register" });
    }
  });

  app.post('/api/login', (req, res, next) => {
    try {
      loginSchema.parse(req.body);
      
      passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
          return res.status(500).json({ message: "An error occurred during login" });
        }
        if (!user) {
          return res.status(401).json({ message: info?.message || "Invalid username or password" });
        }
        
        req.login(user, (loginErr) => {
          if (loginErr) {
            return res.status(500).json({ message: "Login failed" });
          }
          const { password, ...userWithoutPassword } = user;
          res.json(userWithoutPassword);
        });
      })(req, res, next);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.logout({ keepSessionInfo: false }, (err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          return res.status(500).json({ message: "Failed to destroy session" });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/user/avatar', isAuthenticated, async (req: any, res) => {
    try {
      console.log('[AVATAR UPDATE] Starting avatar update for user:', req.user.id);
      console.log('[AVATAR UPDATE] Request body:', req.body);
      
      const userId = req.user.id;
      const { profileImageUrl } = req.body;

      if (!profileImageUrl || typeof profileImageUrl !== 'string') {
        console.log('[AVATAR UPDATE] Invalid profileImageUrl:', profileImageUrl);
        return res.status(400).json({ message: "Invalid profile image URL" });
      }

      console.log('[AVATAR UPDATE] Updating avatar to:', profileImageUrl);
      await storage.updateUserAvatar(userId, profileImageUrl);
      
      console.log('[AVATAR UPDATE] Fetching updated user');
      const updatedUser = await storage.getUserById(userId);
      
      if (!updatedUser) {
        console.log('[AVATAR UPDATE] User not found after update');
        return res.status(404).json({ message: "User not found" });
      }

      // Update the session with the new user data
      req.user = updatedUser;

      const { password, ...userWithoutPassword } = updatedUser;
      console.log('[AVATAR UPDATE] Sending response with updated user');
      res.setHeader('Content-Type', 'application/json');
      return res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("[AVATAR UPDATE] Error:", error);
      return res.status(500).json({ message: error.message || "Failed to update profile image" });
    }
  });

  // Study sessions routes
  app.get("/api/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sessions = await storage.getUserStudySessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.post("/api/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertStudySessionSchema.parse(req.body);
      const session = await storage.createStudySession(userId, validatedData);
      res.json(session);
    } catch (error: any) {
      console.error("Error creating session:", error);
      res.status(400).json({ message: error.message || "Failed to create session" });
    }
  });

  // Quiz routes
  app.get("/api/quiz/:sessionId", isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getStudySession(sessionId);

      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (session.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Check if questions are already generated, otherwise generate new ones
      let questions = session.questions;
      if (!questions) {
        questions = await generateMCQQuestions(session.topic, session.subject);
        await storage.storeQuizQuestions(sessionId, questions);
      }

      res.json({ questions });
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      res.status(500).json({ message: "Failed to generate quiz" });
    }
  });

  app.post("/api/quiz/:sessionId/submit", isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const { answers } = req.body;
      const userId = req.user.id;

      const session = await storage.getStudySession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (session.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Get stored questions for grading
      const questions = session.questions;
      if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ message: "Quiz questions not found" });
      }

      console.log("Grading quiz:");
      console.log("Answers received:", JSON.stringify(answers));
      console.log("Questions count:", questions.length);

      // Calculate score by comparing user answers with correct answers
      let score = 0;
      questions.forEach((q: any, idx: number) => {
        const userAnswer = answers[idx];
        const correctAnswer = q.correctAnswer;
        const isCorrect = userAnswer === correctAnswer;
        
        console.log(`Question ${idx}: user=${userAnswer}, correct=${correctAnswer}, match=${isCorrect}`);
        
        if (isCorrect) {
          score++;
        }
      });

      console.log("Final score:", score, "out of", questions.length);

      // Store quiz result
      const quizResult = await storage.createQuizResult(userId, {
        sessionId,
        score,
        totalQuestions: questions.length,
        questions,
        userAnswers: answers,
      });

      // Mark session as completed
      await storage.completeStudySession(sessionId);

      // Update study activity
      const today = new Date().toISOString().split("T")[0];
      await storage.upsertActivity(userId, today, session.estimatedTime, score);

      res.json({
        score,
        totalQuestions: questions.length,
        percentage: Math.round((score / questions.length) * 100),
      });
    } catch (error: any) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  // Activity routes
  app.get("/api/activity/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const activity = await storage.getUserActivity(userId, 7);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  app.get("/api/activity/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const activity = await storage.getUserActivity(userId, 7);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // Streak route
  app.get("/api/streak", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const streak = await storage.getStreak(userId);
      res.json({ streak });
    } catch (error) {
      console.error("Error fetching streak:", error);
      res.status(500).json({ message: "Failed to fetch streak" });
    }
  });

  // Goals routes
  app.get("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const goals = await storage.getUserGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(userId, validatedData);
      res.json(goal);
    } catch (error: any) {
      console.error("Error creating goal:", error);
      res.status(400).json({ message: error.message || "Failed to create goal" });
    }
  });

  app.patch("/api/goals/:goalId/complete", isAuthenticated, async (req: any, res) => {
    try {
      const { goalId } = req.params;
      const goal = await storage.completeGoal(goalId);
      res.json(goal);
    } catch (error) {
      console.error("Error completing goal:", error);
      res.status(500).json({ message: "Failed to complete goal" });
    }
  });

  // Leaderboard route
  app.get("/api/leaderboard", isAuthenticated, async (req: any, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      
      // Calculate scores and streaks for all users
      const leaderboardData = await Promise.all(
        allUsers.map(async (user) => {
          const activity = await storage.getUserActivity(user.id, 365);
          const totalScore = activity.reduce((sum, a) => sum + a.score, 0);
          const streak = await storage.getStreak(user.id);
          
          return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
            totalScore,
            streak,
          };
        })
      );

      // Sort by total score descending
      leaderboardData.sort((a, b) => b.totalScore - a.totalScore);

      res.json(leaderboardData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // User profile route
  app.get("/api/users/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
