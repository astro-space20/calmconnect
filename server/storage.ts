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
  type InsertEmpathyCheckin
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  createThoughtJournal(journal: InsertThoughtJournal): Promise<ThoughtJournal>;
  
  // Empathy Check-ins
  getEmpathyCheckins(userId: string, limit?: number): Promise<EmpathyCheckin[]>;
  createEmpathyCheckin(checkin: InsertEmpathyCheckin): Promise<EmpathyCheckin>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private activities: Map<string, Activity>;
  private nutritionLogs: Map<string, NutritionLog>;
  private socialExposures: Map<string, SocialExposure>;
  private thoughtJournals: Map<string, ThoughtJournal>;
  private empathyCheckins: Map<string, EmpathyCheckin>;

  constructor() {
    this.users = new Map();
    this.activities = new Map();
    this.nutritionLogs = new Map();
    this.socialExposures = new Map();
    this.thoughtJournals = new Map();
    this.empathyCheckins = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Activities
  async getActivities(userId: string, limit = 50): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = { 
      ...insertActivity, 
      id, 
      createdAt: new Date() 
    };
    this.activities.set(id, activity);
    return activity;
  }

  // Nutrition Logs
  async getNutritionLogs(userId: string, limit = 50): Promise<NutritionLog[]> {
    return Array.from(this.nutritionLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createNutritionLog(insertLog: InsertNutritionLog): Promise<NutritionLog> {
    const id = randomUUID();
    const log: NutritionLog = { 
      ...insertLog, 
      id, 
      createdAt: new Date() 
    };
    this.nutritionLogs.set(id, log);
    return log;
  }

  // Social Exposures
  async getSocialExposures(userId: string, limit = 50): Promise<SocialExposure[]> {
    return Array.from(this.socialExposures.values())
      .filter(exposure => exposure.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createSocialExposure(insertExposure: InsertSocialExposure): Promise<SocialExposure> {
    const id = randomUUID();
    const exposure: SocialExposure = { 
      ...insertExposure, 
      id, 
      createdAt: new Date() 
    };
    this.socialExposures.set(id, exposure);
    return exposure;
  }

  async updateSocialExposure(id: string, updates: Partial<SocialExposure>): Promise<SocialExposure | undefined> {
    const existing = this.socialExposures.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.socialExposures.set(id, updated);
    return updated;
  }

  // Thought Journals
  async getThoughtJournals(userId: string, limit = 50): Promise<ThoughtJournal[]> {
    return Array.from(this.thoughtJournals.values())
      .filter(journal => journal.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createThoughtJournal(insertJournal: InsertThoughtJournal): Promise<ThoughtJournal> {
    const id = randomUUID();
    const journal: ThoughtJournal = { 
      ...insertJournal, 
      id, 
      createdAt: new Date() 
    };
    this.thoughtJournals.set(id, journal);
    return journal;
  }

  // Empathy Check-ins
  async getEmpathyCheckins(userId: string, limit = 50): Promise<EmpathyCheckin[]> {
    return Array.from(this.empathyCheckins.values())
      .filter(checkin => checkin.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createEmpathyCheckin(insertCheckin: InsertEmpathyCheckin): Promise<EmpathyCheckin> {
    const id = randomUUID();
    const checkin: EmpathyCheckin = { 
      ...insertCheckin, 
      id, 
      createdAt: new Date() 
    };
    this.empathyCheckins.set(id, checkin);
    return checkin;
  }
}

export const storage = new MemStorage();
