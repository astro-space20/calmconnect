import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull().unique(),
  phoneNumberHash: text("phone_number_hash").notNull(),
  name: text("name"),
  isVerified: boolean("is_verified").default(false).notNull(),
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

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // walking, yoga, swimming, tai chi, meditation, steps, other
  duration: integer("duration"), // minutes (null for steps tracking)
  steps: integer("steps"), // daily steps count (null for time-based activities)
  feeling: text("feeling").notNull(), // emoji or scale
  notes: text("notes"),
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
