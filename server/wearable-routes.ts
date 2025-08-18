import { Express } from 'express';
import { storage } from './storage';
import { verifyJWT } from './auth';

// Middleware to authenticate JWT tokens
const authenticateJWT = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
};
import { WearableDeviceManager } from './wearable-integrations';
import { insertWearableDeviceSchema } from '@shared/schema';

const wearableManager = new WearableDeviceManager();

export function registerWearableRoutes(app: Express) {
  // Get all connected devices for a user
  app.get('/api/wearables', authenticateJWT, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const devices = await storage.getWearableDevices(userId);
      
      // Hide sensitive tokens from response
      const sanitizedDevices = devices.map(device => ({
        ...device,
        accessToken: device.accessToken ? '***' : null,
        refreshToken: device.refreshToken ? '***' : null
      }));
      
      res.json(sanitizedDevices);
    } catch (error) {
      console.error('Error fetching wearable devices:', error);
      res.status(500).json({ message: 'Failed to fetch wearable devices' });
    }
  });

  // Connect a new wearable device
  app.post('/api/wearables/connect', authenticateJWT, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const { deviceType } = req.body;

      if (!deviceType || !['fitbit', 'google_fit', 'apple_health', 'garmin', 'samsung_health'].includes(deviceType)) {
        return res.status(400).json({ message: 'Invalid device type' });
      }

      // Check if device is already connected
      const existingDevice = await storage.getWearableDevice(userId, deviceType);
      if (existingDevice && existingDevice.isConnected) {
        return res.status(400).json({ message: 'Device already connected' });
      }

      // Get authorization URL
      const authUrl = await wearableManager.connectDevice(userId, deviceType);
      
      res.json({ authUrl });
    } catch (error) {
      console.error('Error connecting wearable device:', error);
      res.status(500).json({ message: 'Failed to connect wearable device' });
    }
  });

  // Fitbit OAuth callback
  app.get('/api/wearables/fitbit/callback', async (req, res) => {
    try {
      const { code, state: userId } = req.query;

      if (!code || !userId) {
        return res.redirect('/activity?error=missing_parameters');
      }

      // Exchange code for tokens
      const fitbit = wearableManager['fitbit'];
      const tokens = await fitbit.exchangeCodeForTokens(code as string);

      // Store device in database
      const device = await storage.createWearableDevice({
        userId: userId as string,
        deviceType: 'fitbit',
        deviceName: 'Fitbit Device',
        isConnected: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
        lastSyncAt: new Date()
      });

      // Perform initial sync
      await wearableManager.syncDeviceData(userId as string, 'fitbit', tokens.accessToken);

      res.redirect('/activity?connected=fitbit');
    } catch (error) {
      console.error('Fitbit callback error:', error);
      res.redirect('/activity?error=connection_failed');
    }
  });

  // Google Fit OAuth callback
  app.get('/api/wearables/googlefit/callback', async (req, res) => {
    try {
      const { code, state: userId } = req.query;

      if (!code || !userId) {
        return res.redirect('/activity?error=missing_parameters');
      }

      // Exchange code for tokens (reuse Google OAuth client)
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          code: code as string,
          redirect_uri: `${process.env.BASE_URL || 'http://localhost:5000'}/api/wearables/googlefit/callback`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const tokens = await response.json();

      // Store device in database
      await storage.createWearableDevice({
        userId: userId as string,
        deviceType: 'google_fit',
        deviceName: 'Google Fit',
        isConnected: true,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        lastSyncAt: new Date()
      });

      // Perform initial sync
      await wearableManager.syncDeviceData(userId as string, 'google_fit', tokens.access_token);

      res.redirect('/activity?connected=google_fit');
    } catch (error) {
      console.error('Google Fit callback error:', error);
      res.redirect('/activity?error=connection_failed');
    }
  });

  // Sync data from a specific device
  app.post('/api/wearables/:deviceId/sync', authenticateJWT, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const { deviceId } = req.params;

      const devices = await storage.getWearableDevices(userId);
      const device = devices.find(d => d.id === deviceId);

      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }

      if (!device.isConnected || !device.accessToken) {
        return res.status(400).json({ message: 'Device not connected or missing access token' });
      }

      // Sync data
      await wearableManager.syncDeviceData(userId, device.deviceType, device.accessToken);

      res.json({ message: 'Sync completed successfully' });
    } catch (error) {
      console.error('Error syncing device data:', error);
      res.status(500).json({ message: 'Failed to sync device data' });
    }
  });

  // Disconnect a wearable device
  app.delete('/api/wearables/:deviceId', authenticateJWT, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const { deviceId } = req.params;

      const devices = await storage.getWearableDevices(userId);
      const device = devices.find(d => d.id === deviceId && d.userId === userId);

      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }

      await storage.disconnectWearableDevice(deviceId);

      res.json({ message: 'Device disconnected successfully' });
    } catch (error) {
      console.error('Error disconnecting device:', error);
      res.status(500).json({ message: 'Failed to disconnect device' });
    }
  });

  // Get sleep data
  app.get('/api/wearables/sleep', authenticateJWT, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const sleepData = await storage.getSleepData(userId, start, end);
      res.json(sleepData);
    } catch (error) {
      console.error('Error fetching sleep data:', error);
      res.status(500).json({ message: 'Failed to fetch sleep data' });
    }
  });

  // Get heart rate data
  app.get('/api/wearables/heartrate', authenticateJWT, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const heartRateData = await storage.getHeartRateData(userId, start, end);
      res.json(heartRateData);
    } catch (error) {
      console.error('Error fetching heart rate data:', error);
      res.status(500).json({ message: 'Failed to fetch heart rate data' });
    }
  });

  // Manual data upload (for Apple Health exports, etc.)
  app.post('/api/wearables/upload', authenticateJWT, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      const { deviceType, dataType, data } = req.body;

      if (!deviceType || !dataType || !data) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Process uploaded data based on type
      let processedCount = 0;

      if (dataType === 'sleep') {
        for (const entry of data) {
          await storage.createSleepData({
            userId,
            deviceType,
            bedTime: new Date(entry.bedTime),
            wakeTime: new Date(entry.wakeTime),
            totalSleepMinutes: entry.totalSleepMinutes,
            deepSleepMinutes: entry.deepSleepMinutes,
            lightSleepMinutes: entry.lightSleepMinutes,
            remSleepMinutes: entry.remSleepMinutes,
            restfulness: entry.restfulness
          });
          processedCount++;
        }
      } else if (dataType === 'heartrate') {
        for (const entry of data) {
          await storage.createHeartRateData({
            userId,
            deviceType,
            heartRate: entry.heartRate,
            context: entry.context,
            recordedAt: new Date(entry.recordedAt)
          });
          processedCount++;
        }
      } else if (dataType === 'activities') {
        for (const entry of data) {
          await storage.createActivity({
            userId,
            type: entry.type,
            duration: entry.duration,
            steps: entry.steps,
            feeling: entry.feeling || '😊',
            notes: `Imported from ${deviceType}`,
            metadata: {
              deviceType,
              heartRate: entry.heartRate,
              caloriesBurned: entry.caloriesBurned,
              distance: entry.distance
            }
          });
          processedCount++;
        }
      }

      res.json({ 
        message: `Successfully imported ${processedCount} ${dataType} entries`,
        processedCount 
      });
    } catch (error) {
      console.error('Error uploading wearable data:', error);
      res.status(500).json({ message: 'Failed to upload wearable data' });
    }
  });
}