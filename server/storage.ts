import { 
  type User, 
  type InsertUser,
  type Activity,
  type InsertActivity,
  type NutritionLog,
  type InsertNutritionLog,
  type SocialExposure,
  type InsertSocialExposure,
  type ThoughtJournal,
  type InsertThoughtJournal,
  type EmpathyCheckin,
  type InsertEmpathyCheckin,
  type OtpCode,
  type InsertOtp,
  type Counsellor,
  type InsertCounsellor,
  type CounsellingBooking,
  type InsertCounsellingBooking,
  users,
  activities,
  nutritionLogs,
  socialExposures,
  thoughtJournals,
  empathyCheckins,
  otpCodes,
  counsellors,
  counsellingBookings
} from "@shared/schema";
import { db } from "./db";
import { eq, and, lt, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByPhoneHash(phoneHash: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserVerification(id: string, isVerified: boolean): Promise<User | undefined>;
  updateUserGoogleId(id: string, googleId: string): Promise<User | undefined>;
  updateUserLastLogin(id: string): Promise<void>;
  
  // OTP Codes
  createOtpCode(otp: InsertOtp): Promise<OtpCode>;
  getValidOtpCode(phoneHash: string, otpCode: string): Promise<OtpCode | undefined>;
  markOtpAsUsed(id: string): Promise<void>;
  incrementOtpAttempts(id: string): Promise<void>;
  cleanupExpiredOtps(): Promise<void>;
  
  // Activities
  getActivities(userId: string, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Nutrition Logs
  getNutritionLogs(userId: string, limit?: number): Promise<NutritionLog[]>;
  createNutritionLog(log: InsertNutritionLog): Promise<NutritionLog>;
  
  // Social Exposures
  getSocialExposures(userId: string, limit?: number): Promise<SocialExposure[]>;
  createSocialExposure(exposure: InsertSocialExposure): Promise<SocialExposure>;
  updateSocialExposure(id: string, exposure: Partial<SocialExposure>): Promise<SocialExposure | undefined>;
  
  // Thought Journals
  getThoughtJournals(userId: string, limit?: number): Promise<ThoughtJournal[]>;
  getThoughtJournal(id: string): Promise<ThoughtJournal | undefined>;
  createThoughtJournal(journal: InsertThoughtJournal): Promise<ThoughtJournal>;
  
  // Empathy Check-ins
  getEmpathyCheckins(userId: string, limit?: number): Promise<EmpathyCheckin[]>;
  createEmpathyCheckin(checkin: InsertEmpathyCheckin): Promise<EmpathyCheckin>;

  // Counsellors
  getCounsellors(): Promise<Counsellor[]>;
  getCounsellor(id: string): Promise<Counsellor | undefined>;
  createCounsellor(counsellor: InsertCounsellor): Promise<Counsellor>;

  // Counselling Bookings
  getCounsellingBookings(userId: string): Promise<CounsellingBooking[]>;
  createCounsellingBooking(booking: InsertCounsellingBooking): Promise<CounsellingBooking>;
  updateCounsellingBooking(id: string, updates: Partial<CounsellingBooking>): Promise<CounsellingBooking | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByPhoneHash(phoneHash: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumberHash, phoneHash));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        createdAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUserVerification(id: string, isVerified: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isVerified, lastLoginAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserGoogleId(id: string, googleId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ googleId, lastLoginAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
  }

  // OTP Codes
  async createOtpCode(insertOtp: InsertOtp): Promise<OtpCode> {
    const [otp] = await db
      .insert(otpCodes)
      .values({
        ...insertOtp,
        createdAt: new Date(),
      })
      .returning();
    return otp;
  }

  async getValidOtpCode(phoneHash: string, otpCode: string): Promise<OtpCode | undefined> {
    const now = new Date();
    const [otp] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.phoneNumberHash, phoneHash),
          eq(otpCodes.otpCode, otpCode),
          eq(otpCodes.isUsed, false),
          lt(otpCodes.attempts, 3)
        )
      );
    
    // Check expiration manually since Drizzle date comparison can be tricky
    if (otp && new Date(otp.expiresAt) > now) {
      return otp;
    }
    
    return undefined;
  }

  async markOtpAsUsed(id: string): Promise<void> {
    await db
      .update(otpCodes)
      .set({ isUsed: true })
      .where(eq(otpCodes.id, id));
  }

  async incrementOtpAttempts(id: string): Promise<void> {
    await db
      .update(otpCodes)
      .set({ attempts: sql`${otpCodes.attempts} + 1` })
      .where(eq(otpCodes.id, id));
  }

  async cleanupExpiredOtps(): Promise<void> {
    await db
      .delete(otpCodes)
      .where(lt(otpCodes.expiresAt, new Date()));
  }

  // Activities
  async getActivities(userId: string, limit = 50): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(activities.createdAt)
      .limit(limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values({
        ...insertActivity,
        createdAt: new Date(),
      })
      .returning();
    return activity;
  }

  // Nutrition Logs
  async getNutritionLogs(userId: string, limit = 50): Promise<NutritionLog[]> {
    return await db
      .select()
      .from(nutritionLogs)
      .where(eq(nutritionLogs.userId, userId))
      .orderBy(nutritionLogs.createdAt)
      .limit(limit);
  }

  async createNutritionLog(insertLog: InsertNutritionLog): Promise<NutritionLog> {
    const [log] = await db
      .insert(nutritionLogs)
      .values({
        ...insertLog,
        createdAt: new Date(),
      })
      .returning();
    return log;
  }

  // Social Exposures
  async getSocialExposures(userId: string, limit = 50): Promise<SocialExposure[]> {
    return await db
      .select()
      .from(socialExposures)
      .where(eq(socialExposures.userId, userId))
      .orderBy(socialExposures.createdAt)
      .limit(limit);
  }

  async createSocialExposure(insertExposure: InsertSocialExposure): Promise<SocialExposure> {
    const [exposure] = await db
      .insert(socialExposures)
      .values({
        ...insertExposure,
        createdAt: new Date(),
      })
      .returning();
    return exposure;
  }

  async updateSocialExposure(id: string, updates: Partial<SocialExposure>): Promise<SocialExposure | undefined> {
    const [exposure] = await db
      .update(socialExposures)
      .set(updates)
      .where(eq(socialExposures.id, id))
      .returning();
    return exposure || undefined;
  }

  // Thought Journals
  async getThoughtJournals(userId: string, limit = 50): Promise<ThoughtJournal[]> {
    return await db
      .select()
      .from(thoughtJournals)
      .where(eq(thoughtJournals.userId, userId))
      .orderBy(thoughtJournals.createdAt)
      .limit(limit);
  }

  async getThoughtJournal(id: string): Promise<ThoughtJournal | undefined> {
    const [journal] = await db
      .select()
      .from(thoughtJournals)
      .where(eq(thoughtJournals.id, id));
    return journal || undefined;
  }

  async createThoughtJournal(insertJournal: InsertThoughtJournal): Promise<ThoughtJournal> {
    const [journal] = await db
      .insert(thoughtJournals)
      .values({
        ...insertJournal,
        createdAt: new Date(),
      })
      .returning();
    return journal;
  }

  // Empathy Check-ins
  async getEmpathyCheckins(userId: string, limit = 50): Promise<EmpathyCheckin[]> {
    return await db
      .select()
      .from(empathyCheckins)
      .where(eq(empathyCheckins.userId, userId))
      .orderBy(empathyCheckins.createdAt)
      .limit(limit);
  }

  async createEmpathyCheckin(insertCheckin: InsertEmpathyCheckin): Promise<EmpathyCheckin> {
    const [checkin] = await db
      .insert(empathyCheckins)
      .values({
        ...insertCheckin,
        createdAt: new Date(),
      })
      .returning();
    return checkin;
  }

  // Counsellors
  async getCounsellors(): Promise<Counsellor[]> {
    const result = await db.select().from(counsellors).where(eq(counsellors.isActive, true));
    return result;
  }

  async getCounsellor(id: string): Promise<Counsellor | undefined> {
    const [counsellor] = await db
      .select()
      .from(counsellors)
      .where(and(eq(counsellors.id, id), eq(counsellors.isActive, true)));
    return counsellor || undefined;
  }

  async createCounsellor(insertCounsellor: InsertCounsellor): Promise<Counsellor> {
    const [counsellor] = await db
      .insert(counsellors)
      .values({
        ...insertCounsellor,
        isActive: true,
        createdAt: new Date(),
      })
      .returning();
    return counsellor;
  }

  // Counselling Bookings
  async getCounsellingBookings(userId: string): Promise<CounsellingBooking[]> {
    const result = await db
      .select()
      .from(counsellingBookings)
      .where(eq(counsellingBookings.userId, userId))
      .orderBy(sql`created_at DESC`)
      .limit(20);
    return result;
  }

  async createCounsellingBooking(insertBooking: InsertCounsellingBooking): Promise<CounsellingBooking> {
    const [booking] = await db
      .insert(counsellingBookings)
      .values({
        ...insertBooking,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return booking;
  }

  async updateCounsellingBooking(id: string, updates: Partial<CounsellingBooking>): Promise<CounsellingBooking | undefined> {
    const [booking] = await db
      .update(counsellingBookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(counsellingBookings.id, id))
      .returning();
    return booking || undefined;
  }

  // Wearable Devices
  async getWearableDevices(userId: string): Promise<WearableDevice[]> {
    return await db
      .select()
      .from(wearableDevices)
      .where(eq(wearableDevices.userId, userId));
  }

  async getWearableDevice(userId: string, deviceType: string): Promise<WearableDevice | undefined> {
    const [device] = await db
      .select()
      .from(wearableDevices)
      .where(and(eq(wearableDevices.userId, userId), eq(wearableDevices.deviceType, deviceType)));
    return device || undefined;
  }

  async createWearableDevice(device: InsertWearableDevice): Promise<WearableDevice> {
    const [newDevice] = await db
      .insert(wearableDevices)
      .values(device)
      .returning();
    return newDevice;
  }

  async updateWearableDevice(id: string, updates: Partial<InsertWearableDevice>): Promise<WearableDevice | undefined> {
    const [device] = await db
      .update(wearableDevices)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(wearableDevices.id, id))
      .returning();
    return device || undefined;
  }

  async updateDeviceLastSync(userId: string, deviceType: string): Promise<void> {
    await db
      .update(wearableDevices)
      .set({ lastSyncAt: new Date(), updatedAt: new Date() })
      .where(and(eq(wearableDevices.userId, userId), eq(wearableDevices.deviceType, deviceType)));
  }

  async disconnectWearableDevice(id: string): Promise<void> {
    await db
      .update(wearableDevices)
      .set({ isConnected: false, accessToken: null, refreshToken: null, updatedAt: new Date() })
      .where(eq(wearableDevices.id, id));
  }

  // Sleep Data
  async createSleepData(sleepDataEntry: InsertSleepData): Promise<SleepData> {
    const [newSleepData] = await db
      .insert(sleepData)
      .values(sleepDataEntry)
      .returning();
    return newSleepData;
  }

  async getSleepData(userId: string, startDate?: Date, endDate?: Date): Promise<SleepData[]> {
    let query = db
      .select()
      .from(sleepData)
      .where(eq(sleepData.userId, userId));

    if (startDate && endDate) {
      query = query.where(
        and(
          eq(sleepData.userId, userId),
          sql`${sleepData.bedTime} >= ${startDate}`,
          sql`${sleepData.bedTime} <= ${endDate}`
        )
      );
    }

    return await query.orderBy(sql`${sleepData.bedTime} DESC`);
  }

  // Heart Rate Data  
  async createHeartRateData(heartRateEntry: InsertHeartRateData): Promise<HeartRateData> {
    const [newHeartRateData] = await db
      .insert(heartRateData)
      .values(heartRateEntry)
      .returning();
    return newHeartRateData;
  }

  async getHeartRateData(userId: string, startDate?: Date, endDate?: Date): Promise<HeartRateData[]> {
    let query = db
      .select()
      .from(heartRateData)
      .where(eq(heartRateData.userId, userId));

    if (startDate && endDate) {
      query = query.where(
        and(
          eq(heartRateData.userId, userId),
          sql`${heartRateData.recordedAt} >= ${startDate}`,
          sql`${heartRateData.recordedAt} <= ${endDate}`
        )
      );
    }

    return await query.orderBy(sql`${heartRateData.recordedAt} DESC`);
  }
}

export const storage = new DatabaseStorage();
