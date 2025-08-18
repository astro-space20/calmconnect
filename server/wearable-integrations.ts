import { Request, Response } from 'express';
import { storage } from './storage';

// Types for wearable device data
export interface WearableDevice {
  id: string;
  name: string;
  type: 'fitbit' | 'apple_health' | 'google_fit' | 'garmin' | 'samsung_health';
  isConnected: boolean;
  lastSyncAt?: Date;
  accessToken?: string;
  refreshToken?: string;
}

export interface ActivityData {
  deviceType: string;
  activityType: string;
  duration: number; // minutes
  steps?: number;
  heartRate?: number;
  caloriesBurned?: number;
  distance?: number; // meters
  timestamp: Date;
}

export interface SleepData {
  deviceType: string;
  bedTime: Date;
  wakeTime: Date;
  totalSleepMinutes: number;
  deepSleepMinutes?: number;
  lightSleepMinutes?: number;
  remSleepMinutes?: number;
  restfulness: number; // 1-10 scale
}

export interface HeartRateData {
  deviceType: string;
  timestamp: Date;
  heartRate: number;
  context: 'resting' | 'active' | 'exercise';
}

// Fitbit API Integration
export class FitbitIntegration {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.FITBIT_CLIENT_ID || '';
    this.clientSecret = process.env.FITBIT_CLIENT_SECRET || '';
    this.redirectUri = `${process.env.BASE_URL || 'http://localhost:5000'}/api/wearables/fitbit/callback`;
  }

  getAuthUrl(userId: string): string {
    const scopes = ['activity', 'heartrate', 'sleep', 'profile'];
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
      state: userId
    });
    
    return `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        code: code,
        redirect_uri: this.redirectUri
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token
    };
  }

  async getActivityData(accessToken: string, date: string): Promise<ActivityData[]> {
    const response = await fetch(`https://api.fitbit.com/1/user/-/activities/date/${date}.json`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Fitbit activity data');
    }

    const data = await response.json();
    const activities: ActivityData[] = [];

    // Add daily summary
    if (data.summary) {
      activities.push({
        deviceType: 'fitbit',
        activityType: 'daily_summary',
        duration: data.summary.activeMinutes || 0,
        steps: data.summary.steps,
        caloriesBurned: data.summary.caloriesOut,
        distance: data.summary.distances?.[0]?.distance * 1000, // Convert km to meters
        timestamp: new Date(date)
      });
    }

    // Add individual activities
    if (data.activities) {
      for (const activity of data.activities) {
        activities.push({
          deviceType: 'fitbit',
          activityType: activity.name.toLowerCase(),
          duration: activity.duration / 60000, // Convert ms to minutes
          caloriesBurned: activity.calories,
          distance: activity.distance * 1000, // Convert km to meters
          timestamp: new Date(`${date}T${activity.startTime}`)
        });
      }
    }

    return activities;
  }

  async getSleepData(accessToken: string, date: string): Promise<SleepData[]> {
    const response = await fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Fitbit sleep data');
    }

    const data = await response.json();
    const sleepSessions: SleepData[] = [];

    if (data.sleep) {
      for (const session of data.sleep) {
        sleepSessions.push({
          deviceType: 'fitbit',
          bedTime: new Date(session.startTime),
          wakeTime: new Date(session.endTime),
          totalSleepMinutes: session.minutesAsleep,
          deepSleepMinutes: session.levels?.summary?.deep?.minutes,
          lightSleepMinutes: session.levels?.summary?.light?.minutes,
          remSleepMinutes: session.levels?.summary?.rem?.minutes,
          restfulness: Math.round((session.efficiency / 100) * 10) // Convert percentage to 1-10 scale
        });
      }
    }

    return sleepSessions;
  }
}

// Apple Health Integration (using Apple Health Kit Web API when available)
export class AppleHealthIntegration {
  // Note: Apple Health Kit requires native iOS integration
  // This is a placeholder for when Apple releases web APIs
  // Currently, users would need to manually export their data
  
  async importHealthData(healthKitData: any): Promise<ActivityData[]> {
    // Process exported Apple Health data
    // This would handle XML exports from the Health app
    const activities: ActivityData[] = [];
    
    // Parse HealthKit XML export format
    // Implementation would depend on Apple's data format
    
    return activities;
  }
}

// Google Fit Integration
export class GoogleFitIntegration {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    this.redirectUri = `${process.env.BASE_URL || 'http://localhost:5000'}/api/wearables/googlefit/callback`;
  }

  getAuthUrl(userId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.sleep.read'
    ];
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
      state: userId,
      access_type: 'offline'
    });
    
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async getFitnessData(accessToken: string, startTime: number, endTime: number): Promise<ActivityData[]> {
    const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        aggregateBy: [
          { dataTypeName: 'com.google.step_count.delta' },
          { dataTypeName: 'com.google.active_minutes' },
          { dataTypeName: 'com.google.calories.expended' }
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day
        startTimeMillis: startTime,
        endTimeMillis: endTime
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Google Fit data');
    }

    const data = await response.json();
    const activities: ActivityData[] = [];

    // Process aggregated fitness data
    if (data.bucket) {
      for (const bucket of data.bucket) {
        const activity: Partial<ActivityData> = {
          deviceType: 'google_fit',
          activityType: 'daily_summary',
          timestamp: new Date(parseInt(bucket.startTimeMillis))
        };

        for (const dataset of bucket.dataset) {
          for (const point of dataset.point) {
            if (dataset.dataSourceId.includes('step_count')) {
              activity.steps = point.value[0].intVal;
            } else if (dataset.dataSourceId.includes('active_minutes')) {
              activity.duration = point.value[0].intVal;
            } else if (dataset.dataSourceId.includes('calories')) {
              activity.caloriesBurned = point.value[0].fpVal;
            }
          }
        }

        if (activity.steps || activity.duration || activity.caloriesBurned) {
          activities.push(activity as ActivityData);
        }
      }
    }

    return activities;
  }
}

// Generic wearable device manager
export class WearableDeviceManager {
  private fitbit: FitbitIntegration;
  private googleFit: GoogleFitIntegration;
  private appleHealth: AppleHealthIntegration;

  constructor() {
    this.fitbit = new FitbitIntegration();
    this.googleFit = new GoogleFitIntegration();
    this.appleHealth = new AppleHealthIntegration();
  }

  async connectDevice(userId: string, deviceType: string): Promise<string> {
    switch (deviceType) {
      case 'fitbit':
        return this.fitbit.getAuthUrl(userId);
      case 'google_fit':
        return this.googleFit.getAuthUrl(userId);
      default:
        throw new Error(`Unsupported device type: ${deviceType}`);
    }
  }

  async syncDeviceData(userId: string, deviceType: string, accessToken: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    let activities: ActivityData[] = [];

    try {
      switch (deviceType) {
        case 'fitbit':
          activities = await this.fitbit.getActivityData(accessToken, today);
          break;
        case 'google_fit':
          const startTime = new Date().setHours(0, 0, 0, 0);
          const endTime = new Date().setHours(23, 59, 59, 999);
          activities = await this.googleFit.getFitnessData(accessToken, startTime, endTime);
          break;
        default:
          throw new Error(`Unsupported device type: ${deviceType}`);
      }

      // Store activities in database
      for (const activity of activities) {
        await storage.createActivity({
          userId,
          type: activity.activityType,
          duration: activity.duration,
          steps: activity.steps,
          feeling: '😊', // Default feeling, can be updated by user
          notes: `Synced from ${deviceType}`,
          metadata: {
            deviceType,
            heartRate: activity.heartRate,
            caloriesBurned: activity.caloriesBurned,
            distance: activity.distance
          }
        });
      }

      // Update last sync time
      await storage.updateDeviceLastSync(userId, deviceType);
    } catch (error) {
      console.error(`Failed to sync ${deviceType} data for user ${userId}:`, error);
      throw error;
    }
  }
}