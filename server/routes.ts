import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerWearableRoutes } from "./wearable-routes";
import { analyzeCBTEntry, getInsightSummary, getDetailedAnalysis } from "./ai-analysis";
import { getPersonalizedGuidance, getPostExerciseFeedback } from "./cbt-ai-guidance";
import { getMoodSupportWithContext } from "./mood-ai-support";
import { getPreExposureMotivation, getPostExposureSupport, getDailyExposureMotivation } from "./social-exposure-ai";
import { geminiAI } from './gemini-ai';
import { achievementService } from "./achievements";
import { 
  insertActivitySchema,
  insertNutritionLogSchema,
  insertSocialExposureSchema,
  insertThoughtJournalSchema,
  insertEmpathyCheckinSchema,
  insertCounsellorSchema,
  insertCounsellingBookingSchema,
  phoneAuthSchema,
  otpVerifySchema,
  insertSocialShareSchema,
  type Achievement,
  type InsertAchievement
} from "@shared/schema";
import { verifyJWT } from "./auth";
import authenticateEmailUser from "./auth-middleware";
import { emailAuthService } from './email-auth';
import { 
  emailRegistrationSchema,
  emailLoginSchema, 
  emailVerificationSchema 
} from '@shared/schema';
import { configureGoogleAuth, generateJWTFromUser } from "./google-auth";
import passport from "passport";

// Helper function to format journals as conversation
function formatJournalsAsConversation(journals: any[], weeks: number): string {
  if (journals.length === 0) {
    return `No thought journal entries found for the past ${weeks} week${weeks > 1 ? 's' : ''}.`;
  }

  const header = `# Thought Journal Conversation - Past ${weeks} Week${weeks > 1 ? 's' : ''}\n`;
  const subtitle = `Generated on: ${new Date().toLocaleString()}\n`;
  const entryCount = `Total entries: ${journals.length}\n\n`;
  const divider = '='.repeat(50) + '\n\n';

  let conversation = header + subtitle + entryCount + divider;

  // Sort journals by date (oldest first) to show progression
  const sortedJournals = [...journals].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  sortedJournals.forEach((journal, index) => {
    const entryDate = new Date(journal.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    conversation += `## Entry ${index + 1} - ${entryDate}\n\n`;
    conversation += `**Situation:** ${journal.situation}\n\n`;
    conversation += `**Negative Thought:** ${journal.negativeThought}\n\n`;
    conversation += `**Emotion:** ${journal.emotion} (Intensity: ${journal.emotionIntensity}/10)\n\n`;
    
    if (journal.evidenceFor) {
      conversation += `**Evidence Supporting the Thought:** ${journal.evidenceFor}\n\n`;
    }
    
    if (journal.evidenceAgainst) {
      conversation += `**Evidence Against the Thought:** ${journal.evidenceAgainst}\n\n`;
    }
    
    if (journal.reframedThought) {
      conversation += `**Reframed Thought:** ${journal.reframedThought}\n\n`;
    }
    
    conversation += '-'.repeat(30) + '\n\n';
  });

  // Add summary section
  conversation += `## Summary\n\n`;
  conversation += `This document contains your thought journal entries from the past ${weeks} week${weeks > 1 ? 's' : ''}. `;
  conversation += `Each entry represents a moment of self-reflection using Cognitive Behavioral Therapy (CBT) techniques. `;
  conversation += `You can see your journey of challenging negative thoughts and working toward more balanced thinking patterns.\n\n`;
  conversation += `Remember: This is your personal growth journey. Each entry shows your commitment to understanding and improving your mental well-being.\n\n`;
  conversation += `Keep up the excellent work! 🌱`;

  return conversation;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Configure Google OAuth only if credentials are available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    try {
      configureGoogleAuth();
      app.use(passport.initialize());

      // Google OAuth Routes
      app.get("/api/auth/google", 
        passport.authenticate("google", { scope: ["profile", "email"] })
      );
    } catch (error) {
      console.warn("Google OAuth configuration failed:", error);
    }
  } else {
    console.log("Google OAuth credentials not configured - skipping Google OAuth setup");
  }

  // Google OAuth callback route (only if OAuth is configured)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get("/api/auth/google/callback",
      passport.authenticate("google", { session: false }),
      async (req: any, res) => {
        try {
          const user = req.user;
          if (!user) {
            console.error("Google OAuth callback: No user found");
            return res.redirect("/login?error=auth_failed");
          }

          console.log("Google OAuth callback successful for user:", user.email);

          // Generate JWT token
          const token = generateJWTFromUser(user);

          // Redirect to frontend with token
          res.redirect(`/?token=${token}`);
        } catch (error) {
          console.error("Google auth callback error:", error);
          res.redirect("/login?error=auth_failed");
        }
      }
    );
  }

  // Get current user route (for both Google OAuth and email auth)
  app.get("/api/auth/user", verifyJWT, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not found in token" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return safe user data
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        authProvider: user.authProvider
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { phoneNumber } = phoneAuthSchema.parse(req.body);
      const phoneHash = hashPhoneNumber(phoneNumber);
      const encryptedPhone = encryptPhoneNumber(phoneNumber);
      
      // Check if user exists, create if not
      let user = await storage.getUserByPhoneHash(phoneHash);
      if (!user) {
        user = await storage.createUser({
          phoneNumber: encryptedPhone,
          phoneNumberHash: phoneHash,
          name: null,
          isVerified: false,
        });
      }

      // Generate and store OTP
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      await storage.createOtpCode({
        phoneNumberHash: phoneHash,
        otpCode,
        expiresAt,
        attempts: 0,
        isUsed: false,
      });

      // Send OTP via SMS
      const sent = await sendOTPSMS(phoneNumber, otpCode);
      if (!sent) {
        return res.status(500).json({ message: "Failed to send OTP" });
      }

      res.json({ 
        message: "OTP sent successfully",
        otpSent: true,
        // In development, include OTP for testing
        ...(process.env.NODE_ENV === 'development' && { otpCode })
      });
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(400).json({ message: "Invalid phone number" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { phoneNumber, otpCode } = otpVerifySchema.parse(req.body);
      const phoneHash = hashPhoneNumber(phoneNumber);

      // Get valid OTP
      const validOtp = await storage.getValidOtpCode(phoneHash, otpCode);
      if (!validOtp) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Mark OTP as used
      await storage.markOtpAsUsed(validOtp.id);

      // Get user and update verification
      const user = await storage.getUserByPhoneHash(phoneHash);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user verification and last login
      await storage.updateUserVerification(user.id, true);

      // Generate JWT token
      const token = generateJWT(user.id, phoneNumber);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          phoneNumber: phoneNumber.replace(/(.{3}).*(.{4})/, '$1****$2'), // Masked phone number
          name: user.name,
          isVerified: true,
        },
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(400).json({ message: "Invalid OTP format" });
    }
  });

  app.post("/api/auth/verify-token", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: "Token required" });
      }

      const decoded = verifyJWT(token);
      if (!decoded) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const user = await storage.getUser(decoded.userId);
      if (!user || !user.isVerified) {
        return res.status(401).json({ message: "User not found or not verified" });
      }

      res.json({
        valid: true,
        user: {
          id: user.id,
          phoneNumber: decoded.phoneNumber.replace(/(.{3}).*(.{4})/, '$1****$2'),
          name: user.name,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(401).json({ message: "Invalid token" });
    }
  });

  // Authentication Middleware
  const authenticateUser = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await storage.getUser(decoded.userId);
    if (!user || !user.isVerified) {
      return res.status(401).json({ message: 'User not found or not verified' });
    }

    req.user = { id: user.id, phoneNumber: decoded.phoneNumber };
    next();
  };

  // Activities
  app.get("/api/activities", authenticateUser, async (req: any, res) => {
    try {
      const activities = await storage.getActivities(req.user.id);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", authenticateUser, async (req: any, res) => {
    try {
      const validatedData = insertActivitySchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const activity = await storage.createActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity data" });
    }
  });

  // Nutrition Logs
  app.get("/api/nutrition-logs", authenticateUser, async (req: any, res) => {
    try {
      const logs = await storage.getNutritionLogs(req.user.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch nutrition logs" });
    }
  });

  app.post("/api/nutrition-logs", authenticateUser, async (req: any, res) => {
    try {
      const validatedData = insertNutritionLogSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const log = await storage.createNutritionLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      res.status(400).json({ message: "Invalid nutrition log data" });
    }
  });

  // Social Exposures
  app.get("/api/social-exposures", authenticateUser, async (req: any, res) => {
    try {
      const exposures = await storage.getSocialExposures(req.user.id);
      res.json(exposures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch social exposures" });
    }
  });

  app.post("/api/social-exposures", authenticateUser, async (req: any, res) => {
    try {
      const validatedData = insertSocialExposureSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const exposure = await storage.createSocialExposure(validatedData);
      res.status(201).json(exposure);
    } catch (error) {
      res.status(400).json({ message: "Invalid social exposure data" });
    }
  });

  app.patch("/api/social-exposures/:id", authenticateUser, async (req: any, res) => {
    try {
      const { id } = req.params;
      const exposure = await storage.updateSocialExposure(id, req.body);
      if (!exposure) {
        return res.status(404).json({ message: "Social exposure not found" });
      }
      res.json(exposure);
    } catch (error) {
      res.status(400).json({ message: "Failed to update social exposure" });
    }
  });

  // Thought Journals
  app.get("/api/thought-journals", authenticateUser, async (req: any, res) => {
    try {
      const journals = await storage.getThoughtJournals(req.user.id);
      res.json(journals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch thought journals" });
    }
  });

  app.post("/api/thought-journals", authenticateUser, async (req: any, res) => {
    try {
      const validatedData = insertThoughtJournalSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const journal = await storage.createThoughtJournal(validatedData);
      
      // Perform AI analysis on the entry
      const analysis = analyzeCBTEntry(
        validatedData.situation,
        validatedData.negativeThought,
        validatedData.emotion,
        validatedData.emotionIntensity
      );
      
      res.status(201).json({ 
        journal, 
        analysis 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid thought journal data" });
    }
  });

  // Empathy Check-ins
  app.get("/api/empathy-checkins", authenticateUser, async (req: any, res) => {
    try {
      const checkins = await storage.getEmpathyCheckins(req.user.id);
      res.json(checkins);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch empathy check-ins" });
    }
  });

  app.post("/api/empathy-checkins", authenticateUser, async (req: any, res) => {
    try {
      const validatedData = insertEmpathyCheckinSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const checkin = await storage.createEmpathyCheckin(validatedData);
      res.status(201).json(checkin);
    } catch (error) {
      res.status(400).json({ message: "Invalid empathy check-in data" });
    }
  });

  // AI Analysis for existing thought journal entry
  app.post("/api/thought-journals/:id/analyze", authenticateUser, async (req: any, res) => {
    try {
      const { id } = req.params;
      const journal = await storage.getThoughtJournal(id);
      
      if (!journal || journal.userId !== req.user.id) {
        return res.status(404).json({ message: "Thought journal not found" });
      }
      
      const analysis = analyzeCBTEntry(
        journal.situation,
        journal.negativeThought,
        journal.emotion,
        journal.emotionIntensity
      );
      
      res.json({ analysis });
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze thought journal" });
    }
  });

  // Get insights summary for all thought journals
  app.get("/api/thought-journals/insights", authenticateUser, async (req: any, res) => {
    try {
      const journals = await storage.getThoughtJournals(req.user.id);
      const insights = await getInsightSummary(journals);
      res.json({ insights });
    } catch (error) {
      res.status(500).json({ message: "Failed to get insights" });
    }
  });

  // Get detailed analysis across multiple thought journals
  app.get("/api/thought-journals/detailed-analysis", authenticateUser, async (req: any, res) => {
    try {
      const journals = await storage.getThoughtJournals(req.user.id);
      const analysis = getDetailedAnalysis(journals);
      res.json({ analysis });
    } catch (error) {
      res.status(500).json({ message: "Failed to get detailed analysis" });
    }
  });

  // Download thought journal conversations for different time periods
  app.get("/api/thought-journals/download/:weeks", authenticateUser, async (req: any, res) => {
    try {
      const { weeks } = req.params;
      const weeksNumber = parseInt(weeks);
      
      if (![1, 2, 3].includes(weeksNumber)) {
        return res.status(400).json({ message: "Invalid time period. Use 1, 2, or 3 weeks" });
      }
      
      const daysBack = weeksNumber * 7;
      const journals = await storage.getThoughtJournalsByDateRange(req.user.id, daysBack);
      
      const conversationText = formatJournalsAsConversation(journals, weeksNumber);
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="thought-journal-${weeksNumber}-weeks.txt"`);
      res.send(conversationText);
      
    } catch (error) {
      console.error('Error downloading thought journals:', error);
      res.status(500).json({ message: "Failed to download thought journals" });
    }
  });

  // CBT Exercise AI Guidance
  app.post("/api/cbt-exercises/guidance", authenticateUser, async (req: any, res) => {
    try {
      const { exerciseType, currentMood, anxietyLevel } = req.body;
      
      // Get user's recent thought journals and exercise history
      const recentJournals = await storage.getThoughtJournals(req.user.id);
      
      const userState = {
        currentMood: currentMood || "neutral",
        anxietyLevel: anxietyLevel || 5,
        exerciseHistory: [], // Could be extended to track exercise history
        recentThoughtJournals: recentJournals.slice(-10) // Last 10 entries
      };
      
      // Use Gemini AI for CBT guidance
      const geminiGuidance = await geminiAI.generateCBTGuidance(exerciseType, 'pre', `Mood: ${currentMood}, Anxiety: ${anxietyLevel}`);
      
      res.json({ guidance: {
        preExerciseGuidance: geminiGuidance.preExerciseGuidance,
        duringExerciseGuidance: ["Follow the guided instructions", "Be patient and kind with yourself"],
        postExerciseGuidance: ["Take a moment to notice any changes", "Appreciate the time you've dedicated to self-care"]
      }});
    } catch (error) {
      console.error('CBT guidance error:', error);
      // Fallback to original guidance
      const guidance = getPersonalizedGuidance(exerciseType, userState);
      res.json({ guidance });
    }
  });

  app.post("/api/cbt-exercises/feedback", authenticateUser, async (req: any, res) => {
    try {
      const { exerciseType, durationMinutes, effectiveness, mood } = req.body;
      
      const feedback = getPostExerciseFeedback(
        exerciseType,
        durationMinutes || 5,
        effectiveness || 5,
        mood || "neutral"
      );
      
      res.json({ feedback });
    } catch (error) {
      res.status(500).json({ message: "Failed to get exercise feedback" });
    }
  });

  // Mood Check-in AI Support
  app.post("/api/mood-support", authenticateUser, async (req: any, res) => {
    try {
      const { moodEmoji, userName } = req.body;
      
      if (!moodEmoji) {
        return res.status(400).json({ message: "Mood emoji is required" });
      }
      
      // Use Gemini AI for mood support
      const support = await geminiAI.generateMoodSupport(moodEmoji, 5, userName);
      res.json({ support });
    } catch (error) {
      console.error('Mood support error:', error);
      res.status(500).json({ message: "Failed to get mood support" });
    }
  });

  // Social Exposure AI Motivation
  app.post("/api/social-exposures/motivation", authenticateUser, async (req: any, res) => {
    try {
      const { exposureType, anxietyLevel, description, isFirstTime } = req.body;
      
      // Get user's recent exposure history
      const recentExposures = await storage.getSocialExposures(req.user.id);
      const exposureHistory = recentExposures.slice(-10); // Last 10 exposures
      
      const recentAttempts = exposureHistory.filter(exp => 
        exp.title.toLowerCase().includes(exposureType.toLowerCase()) ||
        exposureType.toLowerCase().includes(exp.title.toLowerCase())
      ).length;
      
      const successRate = recentAttempts > 0 ? 
        exposureHistory.filter(exp => exp.completed === 1).length / recentAttempts : 0;
      
      const context = {
        exposureType: exposureType || "conversation",
        anxietyLevel: anxietyLevel || 5,
        description: description || "",
        isFirstTime: isFirstTime || false,
        recentAttempts,
        successRate
      };
      
      // Use Gemini AI for social exposure motivation
      const motivation = await geminiAI.generateSocialSupport(
        exposureType, 
        'pre', 
        anxietyLevel
      );
      res.json({ motivation });
    } catch (error) {
      console.error('Social exposure motivation error:', error);
      res.status(500).json({ message: "Failed to get exposure motivation" });
    }
  });

  app.post("/api/social-exposures/feedback", authenticateUser, async (req: any, res) => {
    try {
      const { 
        exposureType, 
        anxietyLevel, 
        description, 
        isFirstTime, 
        completed, 
        beforeAnxiety, 
        afterAnxiety, 
        notes 
      } = req.body;
      
      // Get user's recent exposure history for context
      const recentExposures = await storage.getSocialExposures(req.user.id);
      const exposureHistory = recentExposures.slice(-10);
      
      const recentAttempts = exposureHistory.filter(exp => 
        exp.title.toLowerCase().includes(exposureType.toLowerCase()) ||
        exposureType.toLowerCase().includes(exp.title.toLowerCase())
      ).length;
      
      const successRate = recentAttempts > 0 ? 
        exposureHistory.filter(exp => exp.completed === 1).length / recentAttempts : 0;
      
      const context = {
        exposureType: exposureType || "conversation",
        anxietyLevel: anxietyLevel || 5,
        description: description || "",
        isFirstTime: isFirstTime || false,
        recentAttempts,
        successRate
      };
      
      // Use Gemini AI for post-exposure feedback
      const feedback = await geminiAI.generateSocialSupport(
        exposureType,
        'post', 
        afterAnxiety || anxietyLevel,
        completed
      );
      
      res.json({ feedback });
    } catch (error) {
      res.status(500).json({ message: "Failed to get exposure feedback" });
    }
  });

  app.get("/api/social-exposures/daily-motivation", authenticateUser, async (req: any, res) => {
    try {
      const exposures = await storage.getSocialExposures(req.user.id);
      const user = await storage.getUser(req.user.id);
      
      const recentExposures = exposures.map(exp => ({
        completed: exp.completed === 1,
        anxietyBefore: exp.expectedEnergy || 5,
        createdAt: exp.createdAt
      }));
      
      // Use Gemini AI for daily encouragement
      const motivation = await geminiAI.generateDailyEncouragement({ recentExposures });
      res.json({ motivation });
    } catch (error) {
      res.status(500).json({ message: "Failed to get daily motivation" });
    }
  });

  // AI Counsellor Chat
  app.post("/api/ai-counsellor/chat", authenticateUser, async (req: any, res) => {
    try {
      const { message, journalEntry, conversationHistory } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const response = await geminiAI.generateCounsellorResponse(
        message,
        journalEntry,
        conversationHistory || []
      );
      
      res.json({ response });
    } catch (error) {
      console.error('AI counsellor chat error:', error);
      res.status(500).json({ message: "Failed to get counsellor response" });
    }
  });

  // Counsellors
  app.get("/api/counsellors", async (req, res) => {
    try {
      const counsellors = await storage.getCounsellors();
      res.json(counsellors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch counsellors" });
    }
  });

  app.get("/api/counsellors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const counsellor = await storage.getCounsellor(id);
      if (!counsellor) {
        return res.status(404).json({ message: "Counsellor not found" });
      }
      res.json(counsellor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch counsellor" });
    }
  });

  app.post("/api/counsellors", async (req, res) => {
    try {
      const validatedData = insertCounsellorSchema.parse(req.body);
      const counsellor = await storage.createCounsellor(validatedData);
      res.status(201).json(counsellor);
    } catch (error) {
      res.status(400).json({ message: "Invalid counsellor data" });
    }
  });

  // Counselling Bookings
  app.get("/api/counselling-bookings", authenticateUser, async (req: any, res) => {
    try {
      const bookings = await storage.getCounsellingBookings(req.user.id);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/counselling-bookings", authenticateUser, async (req: any, res) => {
    try {
      const validatedData = insertCounsellingBookingSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // Calculate total cost based on counsellor's rate and session duration
      const counsellor = await storage.getCounsellor(validatedData.counsellorId);
      if (!counsellor) {
        return res.status(404).json({ message: "Counsellor not found" });
      }

      const totalCost = (parseFloat(counsellor.hourlyRate) / 60) * counsellor.sessionDuration;
      
      const booking = await storage.createCounsellingBooking({
        ...validatedData,
        duration: counsellor.sessionDuration,
        totalCost: totalCost.toString()
      });

      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ message: "Invalid booking data" });
    }
  });

  app.patch("/api/counselling-bookings/:id", authenticateUser, async (req: any, res) => {
    try {
      const { id } = req.params;
      const booking = await storage.updateCounsellingBooking(id, req.body);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(400).json({ message: "Failed to update booking" });
    }
  });

  // Register wearable device routes
  registerWearableRoutes(app);

  // Email/Password Authentication Routes
  
  // Register with email/password
  app.post('/api/auth/register', async (req, res) => {
    try {
      const result = await emailAuthService.registerUser(req.body);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Registration route error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Registration failed. Please try again.' 
      });
    }
  });

  // Login with email/password
  app.post('/api/auth/login', async (req, res) => {
    try {
      const result = await emailAuthService.loginUser(req.body);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('Login route error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Login failed. Please try again.' 
      });
    }
  });

  // Verify email
  app.post('/api/auth/verify-email', async (req, res) => {
    try {
      const result = await emailAuthService.verifyEmail(req.body);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Email verification route error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Email verification failed. Please try again.' 
      });
    }
  });

  // Resend verification code
  app.post('/api/auth/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;
      const result = await emailAuthService.resendVerificationCode(email);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Resend verification route error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to resend verification code. Please try again.' 
      });
    }
  });

  // User profile route for email authentication
  app.get('/api/user/profile', authenticateEmailUser, async (req: any, res) => {
    try {
      const user = req.user;
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage
      });
    } catch (error) {
      console.error('User profile route error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch user profile' 
      });
    }
  });

  // Achievement Routes
  app.get("/api/achievements", authenticateUser, async (req: any, res) => {
    try {
      const achievements = await storage.getAchievements(req.user.id);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // Initialize achievements for new user
  app.post("/api/achievements/initialize", authenticateUser, async (req: any, res) => {
    try {
      await achievementService.initializeUserAchievements(req.user.id);
      const achievements = await storage.getAchievements(req.user.id);
      res.json({ message: "Achievements initialized", achievements });
    } catch (error) {
      res.status(500).json({ message: "Failed to initialize achievements" });
    }
  });

  // Check and update achievements (called after user actions)
  app.post("/api/achievements/check", authenticateUser, async (req: any, res) => {
    try {
      const unlockedAchievements = await achievementService.checkAndUpdateAchievements(req.user.id);
      res.json({ 
        message: unlockedAchievements.length > 0 ? "New achievements unlocked!" : "No new achievements",
        unlockedAchievements 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check achievements" });
    }
  });

  // Social sharing routes
  app.post("/api/social-shares", authenticateUser, async (req: any, res) => {
    try {
      const shareData = insertSocialShareSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const socialShare = await storage.createSocialShare(shareData);
      res.status(201).json(socialShare);
    } catch (error) {
      res.status(400).json({ message: "Failed to create social share" });
    }
  });

  app.get("/api/social-shares", authenticateUser, async (req: any, res) => {
    try {
      const socialShares = await storage.getSocialShares(req.user.id);
      res.json(socialShares);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch social shares" });
    }
  });

  // Generate share content for achievement
  app.post("/api/achievements/:id/share-text", authenticateUser, async (req: any, res) => {
    try {
      const { id } = req.params;
      const achievements = await storage.getAchievements(req.user.id);
      const achievement = achievements.find(a => a.id === id);
      
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }

      if (!achievement.isUnlocked) {
        return res.status(400).json({ message: "Cannot share locked achievement" });
      }

      const user = await storage.getUser(req.user.id);
      const shareText = achievementService.generateShareText(achievement, user?.name);
      
      res.json({ shareText, achievement });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate share text" });
    }
  });

  return httpServer;
}
