import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertActivitySchema,
  insertNutritionLogSchema,
  insertSocialExposureSchema,
  insertThoughtJournalSchema,
  insertEmpathyCheckinSchema,
  phoneAuthSchema,
  otpVerifySchema
} from "@shared/schema";
import { 
  encryptPhoneNumber, 
  hashPhoneNumber, 
  generateOTP, 
  generateJWT, 
  sendOTPSMS, 
  verifyJWT 
} from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Authentication Routes
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
      res.status(201).json(journal);
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

  return httpServer;
}
