import { storage } from './storage';
import type { Achievement, InsertAchievement, Activity, NutritionLog, SocialExposure, ThoughtJournal } from '@shared/schema';

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = [
  // Activity Achievements
  {
    type: 'activity_first',
    title: 'First Step',
    description: 'Completed your first activity',
    category: 'activity',
    icon: '🏃',
    milestone: 1
  },
  {
    type: 'activity_week_streak',
    title: 'Week Warrior',
    description: 'Completed activities for 7 days straight',
    category: 'activity',
    icon: '🔥',
    milestone: 7
  },
  {
    type: 'steps_milestone',
    title: 'Step Counter',
    description: 'Walked 10,000 steps in a day',
    category: 'activity',
    icon: '👟',
    milestone: 10000
  },
  {
    type: 'activity_minutes',
    title: 'Time Master',
    description: 'Accumulated 300 minutes of activity',
    category: 'activity',
    icon: '⏰',
    milestone: 300
  },

  // Social Achievements
  {
    type: 'social_first',
    title: 'Social Butterfly',
    description: 'Completed your first social exposure',
    category: 'social',
    icon: '🦋',
    milestone: 1
  },
  {
    type: 'social_courage',
    title: 'Courage Builder',
    description: 'Completed 10 social exposures',
    category: 'social',
    icon: '💪',
    milestone: 10
  },
  {
    type: 'energy_high',
    title: 'Energy Boost',
    description: 'Achieved 8+ energy level in social exposure',
    category: 'social',
    icon: '⚡',
    milestone: 8
  },

  // Nutrition Achievements
  {
    type: 'nutrition_first',
    title: 'Mindful Eater',
    description: 'Logged your first nutrition entry',
    category: 'nutrition',
    icon: '🥗',
    milestone: 1
  },
  {
    type: 'nutrition_week',
    title: 'Nutrition Navigator',
    description: 'Logged nutrition for 7 days',
    category: 'nutrition',
    icon: '📊',
    milestone: 7
  },
  {
    type: 'balanced_meal',
    title: 'Balanced Bowl',
    description: 'Created a perfectly balanced meal',
    category: 'nutrition',
    icon: '⚖️',
    milestone: 1
  },

  // Mental Health Achievements
  {
    type: 'thoughts_first',
    title: 'Thought Detective',
    description: 'Completed your first thought journal',
    category: 'mental_health',
    icon: '🕵️',
    milestone: 1
  },
  {
    type: 'thoughts_week',
    title: 'Mind Master',
    description: 'Thought journaling for 7 days',
    category: 'mental_health',
    icon: '🧠',
    milestone: 7
  },
  {
    type: 'reframe_expert',
    title: 'Reframe Expert',
    description: 'Successfully reframed 20 negative thoughts',
    category: 'mental_health',
    icon: '🔄',
    milestone: 20
  },

  // Overall Progress Achievements
  {
    type: 'wellness_warrior',
    title: 'Wellness Warrior',
    description: 'Tracked all 4 categories in one day',
    category: 'overall',
    icon: '🌟',
    milestone: 4
  },
  {
    type: 'consistency_king',
    title: 'Consistency King',
    description: 'Used the app for 30 days',
    category: 'overall',
    icon: '👑',
    milestone: 30
  }
];

export class AchievementService {
  // Initialize achievements for new user
  async initializeUserAchievements(userId: string): Promise<void> {
    const existingAchievements = await storage.getAchievements(userId);
    
    // Only create achievements that don't already exist
    for (const def of ACHIEVEMENT_DEFINITIONS) {
      const exists = existingAchievements.find(a => a.type === def.type);
      if (!exists) {
        await storage.createAchievement({
          userId,
          type: def.type,
          title: def.title,
          description: def.description,
          category: def.category,
          icon: def.icon,
          milestone: def.milestone,
          currentProgress: 0,
          isUnlocked: false,
        });
      }
    }
  }

  // Check and update achievements after user action
  async checkAndUpdateAchievements(userId: string): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];
    
    // Get user data for calculations
    const [activities, nutritionLogs, socialExposures, thoughtJournals] = await Promise.all([
      storage.getActivities(userId),
      storage.getNutritionLogs(userId),
      storage.getSocialExposures(userId),
      storage.getThoughtJournals(userId)
    ]);

    const achievements = await storage.getAchievements(userId);

    // Check each achievement type
    for (const achievement of achievements.filter(a => !a.isUnlocked)) {
      let progress = 0;
      let shouldUnlock = false;

      switch (achievement.type) {
        case 'activity_first':
          progress = activities.length > 0 ? 1 : 0;
          shouldUnlock = progress >= 1;
          break;

        case 'activity_week_streak':
          progress = this.calculateActivityStreak(activities);
          shouldUnlock = progress >= 7;
          break;

        case 'steps_milestone':
          progress = Math.max(...activities.map(a => a.steps || 0));
          shouldUnlock = progress >= 10000;
          break;

        case 'activity_minutes':
          progress = activities.reduce((sum, a) => sum + (a.duration || 0), 0);
          shouldUnlock = progress >= 300;
          break;

        case 'social_first':
          progress = socialExposures.length > 0 ? 1 : 0;
          shouldUnlock = progress >= 1;
          break;

        case 'social_courage':
          progress = socialExposures.filter(s => s.completed).length;
          shouldUnlock = progress >= 10;
          break;

        case 'energy_high':
          progress = Math.max(...socialExposures.map(s => s.actualEnergy || s.expectedEnergy || 0));
          shouldUnlock = progress >= 8;
          break;

        case 'nutrition_first':
          progress = nutritionLogs.length > 0 ? 1 : 0;
          shouldUnlock = progress >= 1;
          break;

        case 'nutrition_week':
          progress = this.calculateNutritionStreak(nutritionLogs);
          shouldUnlock = progress >= 7;
          break;

        case 'balanced_meal':
          progress = this.countBalancedMeals(nutritionLogs);
          shouldUnlock = progress >= 1;
          break;

        case 'thoughts_first':
          progress = thoughtJournals.length > 0 ? 1 : 0;
          shouldUnlock = progress >= 1;
          break;

        case 'thoughts_week':
          progress = this.calculateThoughtJournalStreak(thoughtJournals);
          shouldUnlock = progress >= 7;
          break;

        case 'reframe_expert':
          progress = thoughtJournals.filter(t => t.reframedThought && t.reframedThought.length > 10).length;
          shouldUnlock = progress >= 20;
          break;

        case 'wellness_warrior':
          progress = this.checkDailyWellness(activities, nutritionLogs, socialExposures, thoughtJournals);
          shouldUnlock = progress >= 4;
          break;

        case 'consistency_king':
          progress = this.calculateAppUsageDays(activities, nutritionLogs, socialExposures, thoughtJournals);
          shouldUnlock = progress >= 30;
          break;
      }

      // Update achievement progress
      const updatedAchievement = await storage.updateAchievementProgress(
        achievement.id, 
        progress, 
        shouldUnlock
      );

      if (shouldUnlock && updatedAchievement) {
        unlockedAchievements.push(updatedAchievement);
      }
    }

    return unlockedAchievements;
  }

  // Helper methods for calculations
  private calculateActivityStreak(activities: Activity[]): number {
    if (activities.length === 0) return 0;
    
    const sortedDates = activities
      .map(a => new Date(a.createdAt).toDateString())
      .filter((date, index, array) => array.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 1;
    const today = new Date().toDateString();
    
    if (sortedDates[0] !== today) {
      return 0; // No activity today, streak is broken
    }

    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const previousDate = new Date(sortedDates[i - 1]);
      const diffDays = (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private calculateNutritionStreak(nutritionLogs: NutritionLog[]): number {
    if (nutritionLogs.length === 0) return 0;
    
    const sortedDates = nutritionLogs
      .map(n => new Date(n.createdAt).toDateString())
      .filter((date, index, array) => array.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 1;
    const today = new Date().toDateString();
    
    if (sortedDates[0] !== today) {
      return 0;
    }

    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const previousDate = new Date(sortedDates[i - 1]);
      const diffDays = (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private calculateThoughtJournalStreak(thoughtJournals: ThoughtJournal[]): number {
    if (thoughtJournals.length === 0) return 0;
    
    const sortedDates = thoughtJournals
      .map(t => new Date(t.createdAt).toDateString())
      .filter((date, index, array) => array.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 1;
    const today = new Date().toDateString();
    
    if (sortedDates[0] !== today) {
      return 0;
    }

    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const previousDate = new Date(sortedDates[i - 1]);
      const diffDays = (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private countBalancedMeals(nutritionLogs: NutritionLog[]): number {
    return nutritionLogs.filter(log => {
      return log.protein >= 2 && log.complexCarbs >= 2 && log.healthyFats >= 2;
    }).length;
  }

  private checkDailyWellness(activities: Activity[], nutrition: NutritionLog[], social: SocialExposure[], thoughts: ThoughtJournal[]): number {
    const today = new Date().toDateString();
    
    const todayActivity = activities.some(a => new Date(a.createdAt).toDateString() === today);
    const todayNutrition = nutrition.some(n => new Date(n.createdAt).toDateString() === today);
    const todaySocial = social.some(s => new Date(s.createdAt).toDateString() === today);
    const todayThoughts = thoughts.some(t => new Date(t.createdAt).toDateString() === today);
    
    return [todayActivity, todayNutrition, todaySocial, todayThoughts].filter(Boolean).length;
  }

  private calculateAppUsageDays(activities: Activity[], nutrition: NutritionLog[], social: SocialExposure[], thoughts: ThoughtJournal[]): number {
    const allDates = new Set([
      ...activities.map(a => new Date(a.createdAt).toDateString()),
      ...nutrition.map(n => new Date(n.createdAt).toDateString()),
      ...social.map(s => new Date(s.createdAt).toDateString()),
      ...thoughts.map(t => new Date(t.createdAt).toDateString())
    ]);
    
    return allDates.size;
  }

  // Generate share text for achievement
  generateShareText(achievement: Achievement, userName?: string): string {
    const name = userName || 'Someone';
    const templates = {
      activity: [
        `${name} just unlocked "${achievement.title}" in CalmTrack! 🏃 Making progress one step at a time #MentalWellness #Progress`,
        `Another milestone reached! ${name} earned "${achievement.title}" 🎯 #AnxietySupport #WellnessJourney`,
        `${name} is crushing their wellness goals! Just unlocked "${achievement.title}" 💪 #HealthyMind #Progress`
      ],
      social: [
        `${name} is stepping out of their comfort zone! 🦋 Just earned "${achievement.title}" #SocialCourage #AnxietySupport`,
        `Building confidence one step at a time! ${name} unlocked "${achievement.title}" 🌟 #MentalHealth #Growth`,
        `${name} is proving that courage grows with practice! "${achievement.title}" achieved 💪 #SocialAnxiety #Progress`
      ],
      nutrition: [
        `${name} is nourishing their mind and body! 🥗 Just earned "${achievement.title}" #MindfulEating #Wellness`,
        `Fueling wellness from within! ${name} unlocked "${achievement.title}" 📊 #NutritionGoals #MentalHealth`,
        `${name} knows that good nutrition supports mental wellness! "${achievement.title}" achieved 🎯`
      ],
      mental_health: [
        `${name} is rewiring their thoughts for the better! 🧠 Just earned "${achievement.title}" #CBT #MentalHealth`,
        `Thought patterns don't define us! ${name} unlocked "${achievement.title}" 🔄 #Mindfulness #Growth`,
        `${name} is becoming their own thought detective! "${achievement.title}" achieved 🕵️ #AnxietyManagement`
      ],
      overall: [
        `${name} is committed to their wellness journey! 🌟 Just earned "${achievement.title}" #WellnessWarrior #Progress`,
        `Consistency is key! ${name} unlocked "${achievement.title}" 👑 #MentalWellness #Dedication`,
        `${name} is proving that small daily actions create big changes! "${achievement.title}" achieved 🎯`
      ]
    };

    const categoryTemplates = templates[achievement.category as keyof typeof templates] || templates.overall;
    return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
  }
}

export const achievementService = new AchievementService();