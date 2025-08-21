import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, decimal, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  googleId: text("google_id").unique(),
  email: text("email").unique(),
  password: text("password"), // For email/password auth
  name: text("name"),
  profileImage: text("profile_image"),
  phoneNumber: text("phone_number").unique(),
  phoneNumberHash: text("phone_number_hash"),
  isVerified: boolean("is_verified").default(true).notNull(),
  emailVerified: boolean("email_verified").default(false),
  authProvider: text("auth_provider").default("email"), // 'email', 'google', or 'phone'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

export const otpCodes = pgTable("otp_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumberHash: text("phone_number_hash").notNull(),
  otpCode: text("otp_code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Email verification codes
export const emailVerificationCodes = pgTable("email_verification_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  verificationCode: text("verification_code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // walking, yoga, swimming, tai chi, meditation, steps, other
  duration: integer("duration"), // minutes (null for steps tracking)
  steps: integer("steps"), // daily steps count (null for time-based activities)
  feeling: text("feeling").notNull(), // emoji or scale
  notes: text("notes"),
  metadata: jsonb("metadata"), // Device data: heartRate, caloriesBurned, distance, deviceType
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wearableDevices = pgTable("wearable_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  deviceType: text("device_type").notNull(), // fitbit, apple_health, google_fit, garmin, samsung_health
  deviceName: text("device_name").notNull(),
  isConnected: boolean("is_connected").default(true).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sleepData = pgTable("sleep_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  deviceType: text("device_type").notNull(),
  bedTime: timestamp("bed_time").notNull(),
  wakeTime: timestamp("wake_time").notNull(),
  totalSleepMinutes: integer("total_sleep_minutes").notNull(),
  deepSleepMinutes: integer("deep_sleep_minutes"),
  lightSleepMinutes: integer("light_sleep_minutes"),
  remSleepMinutes: integer("rem_sleep_minutes"),
  restfulness: integer("restfulness").notNull(), // 1-10 scale
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const heartRateData = pgTable("heart_rate_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  deviceType: text("device_type").notNull(),
  heartRate: integer("heart_rate").notNull(),
  context: text("context").notNull(), // resting, active, exercise
  recordedAt: timestamp("recorded_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nutritionLogs = pgTable("nutrition_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  protein: integer("protein").default(0), // 0-3 scale
  complexCarbs: integer("complex_carbs").default(0),
  healthyFats: integer("healthy_fats").default(0),
  omega3: integer("omega3").default(0),
  magnesium: integer("magnesium").default(0),
  bVitamins: integer("b_vitamins").default(0),
  caffeine: integer("caffeine").default(0), // mg
  sugar: integer("sugar").default(0), // grams
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const socialExposures = pgTable("social_exposures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  expectedEnergy: integer("expected_energy").notNull(), // 1-10
  actualEnergy: integer("actual_energy"), // 1-10, filled after
  feelings: text("feelings"), // comma-separated
  wentWell: text("went_well"),
  tryDifferently: text("try_differently"),
  completed: integer("completed").default(0), // 0 or 1
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const thoughtJournals = pgTable("thought_journals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  situation: text("situation").notNull(),
  negativeThought: text("negative_thought").notNull(),
  emotion: text("emotion").notNull(),
  emotionIntensity: integer("emotion_intensity").notNull(), // 1-10
  evidenceFor: text("evidence_for"),
  evidenceAgainst: text("evidence_against"),
  reframedThought: text("reframed_thought"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const empathyCheckins = pgTable("empathy_checkins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  mood: text("mood").notNull(), // happy, neutral, sad, anxious
  showedCompassion: integer("showed_compassion").notNull(), // 1-5 scale
  proudOf: text("proud_of"),
  reflection: text("reflection"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const counsellors = pgTable("counsellors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  experience: integer("experience").notNull(), // years of experience
  degree: text("degree").notNull(),
  specializations: jsonb("specializations").notNull(), // array of specializations
  availableWeekdays: jsonb("available_weekdays").notNull(), // array of weekday availability
  availableWeekends: boolean("available_weekends").default(false).notNull(),
  sessionDuration: integer("session_duration").notNull(), // minutes
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }).notNull(),
  bio: text("bio"),
  profileImage: text("profile_image"), // URL to image
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const counsellorTimeSlots = pgTable("counsellor_time_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  counsellorId: varchar("counsellor_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday to Saturday)
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const counsellingBookings = pgTable("counselling_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  counsellorId: varchar("counsellor_id").notNull(),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").notNull(), // minutes
  status: text("status").notNull(), // pending, confirmed, completed, cancelled
  notes: text("notes"), // user's notes about what they want to discuss
  sessionNotes: text("session_notes"), // counsellor's session notes
  totalCost: decimal("total_cost", { precision: 8, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Achievements and social sharing
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // activity_streak, social_milestone, nutrition_goal, thought_journal_streak, weekly_complete
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // activity, social, nutrition, mental_health, overall
  icon: text("icon").notNull(), // emoji or icon name
  milestone: integer("milestone").notNull(), // the achievement threshold (e.g., 7 for 7-day streak)
  currentProgress: integer("current_progress").default(0).notNull(),
  isUnlocked: boolean("is_unlocked").default(false).notNull(),
  unlockedAt: timestamp("unlocked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const socialShares = pgTable("social_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  achievementId: varchar("achievement_id").notNull(),
  platform: text("platform").notNull(), // twitter, facebook, instagram, linkedin, clipboard
  shareText: text("share_text").notNull(),
  shareUrl: text("share_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true,
});

export const insertOtpSchema = createInsertSchema(otpCodes).omit({
  id: true,
  createdAt: true,
});

// Authentication schemas
export const phoneAuthSchema = z.object({
  phoneNumber: z.string().min(10).max(15).regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
});

export const otpVerifySchema = z.object({
  phoneNumber: z.string().min(10).max(15).regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  otpCode: z.string().length(6, "OTP must be 6 digits"),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
}).refine((data) => {
  // Either duration OR steps should be provided, not both
  return (data.duration && !data.steps) || (!data.duration && data.steps);
}, {
  message: "Provide either duration for time-based activities or steps for step tracking"
});

export const insertNutritionLogSchema = createInsertSchema(nutritionLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSocialExposureSchema = createInsertSchema(socialExposures).omit({
  id: true,
  createdAt: true,
});

export const insertThoughtJournalSchema = createInsertSchema(thoughtJournals).omit({
  id: true,
  createdAt: true,
});

export const insertEmpathyCheckinSchema = createInsertSchema(empathyCheckins).omit({
  id: true,
  createdAt: true,
});

export const insertCounsellorSchema = createInsertSchema(counsellors).omit({
  id: true,
  createdAt: true,
});

export const insertCounsellorTimeSlotSchema = createInsertSchema(counsellorTimeSlots).omit({
  id: true,
  createdAt: true,
});

export const insertCounsellingBookingSchema = createInsertSchema(counsellingBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
  unlockedAt: true,
});

export const insertSocialShareSchema = createInsertSchema(socialShares).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type OtpCode = typeof otpCodes.$inferSelect;
export type InsertOtp = z.infer<typeof insertOtpSchema>;
export type PhoneAuth = z.infer<typeof phoneAuthSchema>;
export type OtpVerify = z.infer<typeof otpVerifySchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type NutritionLog = typeof nutritionLogs.$inferSelect;
export type InsertNutritionLog = z.infer<typeof insertNutritionLogSchema>;

export type SocialExposure = typeof socialExposures.$inferSelect;
export type InsertSocialExposure = z.infer<typeof insertSocialExposureSchema>;

export type ThoughtJournal = typeof thoughtJournals.$inferSelect;
export type InsertThoughtJournal = z.infer<typeof insertThoughtJournalSchema>;

export type EmpathyCheckin = typeof empathyCheckins.$inferSelect;
export type InsertEmpathyCheckin = z.infer<typeof insertEmpathyCheckinSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type SocialShare = typeof socialShares.$inferSelect;
export type InsertSocialShare = z.infer<typeof insertSocialShareSchema>;

export type Counsellor = typeof counsellors.$inferSelect;
export type InsertCounsellor = z.infer<typeof insertCounsellorSchema>;
export type CounsellorTimeSlot = typeof counsellorTimeSlots.$inferSelect;
export type InsertCounsellorTimeSlot = z.infer<typeof insertCounsellorTimeSlotSchema>;
export type CounsellingBooking = typeof counsellingBookings.$inferSelect;
export type InsertCounsellingBooking = z.infer<typeof insertCounsellingBookingSchema>;

export const insertWearableDeviceSchema = createInsertSchema(wearableDevices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSleepDataSchema = createInsertSchema(sleepData).omit({
  id: true,
  createdAt: true,
});

export const insertHeartRateDataSchema = createInsertSchema(heartRateData).omit({
  id: true,
  createdAt: true,
});

export type WearableDevice = typeof wearableDevices.$inferSelect;
export type InsertWearableDevice = z.infer<typeof insertWearableDeviceSchema>;
export type SleepData = typeof sleepData.$inferSelect;
export type InsertSleepData = z.infer<typeof insertSleepDataSchema>;
export type HeartRateData = typeof heartRateData.$inferSelect;
export type InsertHeartRateData = z.infer<typeof insertHeartRateDataSchema>;

// Email verification schemas
export const insertEmailVerificationCodeSchema = createInsertSchema(emailVerificationCodes).omit({
  id: true,
  createdAt: true,
});

export const emailRegistrationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
});

export const emailLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const emailVerificationSchema = z.object({
  email: z.string().email(),
  verificationCode: z.string().length(6, "Verification code must be 6 digits"),
});

export type EmailVerificationCode = typeof emailVerificationCodes.$inferSelect;
export type InsertEmailVerificationCode = z.infer<typeof insertEmailVerificationCodeSchema>;
export type EmailRegistration = z.infer<typeof emailRegistrationSchema>;
export type EmailLogin = z.infer<typeof emailLoginSchema>;
export type EmailVerification = z.infer<typeof emailVerificationSchema>;
