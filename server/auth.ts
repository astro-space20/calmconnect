import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const PHONE_ENCRYPTION_KEY = process.env.PHONE_ENCRYPTION_KEY || 'phone-encryption-key-change-this';

export function encryptPhoneNumber(phoneNumber: string): string {
  return CryptoJS.AES.encrypt(phoneNumber, PHONE_ENCRYPTION_KEY).toString();
}

export function decryptPhoneNumber(encryptedPhone: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedPhone, PHONE_ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function hashPhoneNumber(phoneNumber: string): string {
  return CryptoJS.SHA256(phoneNumber + PHONE_ENCRYPTION_KEY).toString();
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateJWT(userId: string, phoneNumber: string): string {
  return jwt.sign(
    { userId, phoneNumber, timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Email authentication JWT
export function generateEmailJWT(userId: string, email: string): string {
  return jwt.sign(
    { userId, email, type: 'email', timestamp: Date.now() },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyJWT(token: string): { userId: string; phoneNumber?: string; email?: string; type?: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Handle both phone and email authentication tokens
    if (decoded.type === 'email') {
      return { userId: decoded.userId, email: decoded.email, type: decoded.type };
    } else {
      // Legacy phone authentication
      return { userId: decoded.userId, phoneNumber: decoded.phoneNumber };
    }
  } catch (error) {
    return null;
  }
}

// SMS service with Twilio integration
export async function sendOTPSMS(phoneNumber: string, otpCode: string): Promise<boolean> {
  try {
    // Check if Twilio credentials are available
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && twilioPhone) {
      // Use Twilio for real SMS delivery
      const { default: twilio } = await import('twilio');
      const client = twilio(accountSid, authToken);

      const message = await client.messages.create({
        body: `Your CalmTrack verification code is: ${otpCode}. This code expires in 5 minutes.`,
        from: twilioPhone,
        to: phoneNumber,
      });

      console.log(`[SMS Service] OTP ${otpCode} sent via Twilio to ${phoneNumber} (SID: ${message.sid})`);
      return true;
    } else {
      // Development mode - log the OTP when Twilio is not configured
      console.log(`[SMS Service] Sending OTP ${otpCode} to ${phoneNumber}`);
      console.log('Note: Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER for real SMS delivery');
      
      // Simulate SMS sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }
  } catch (error) {
    console.error('SMS sending failed:', error);
    return false;
  }
}

export function isValidPhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
}