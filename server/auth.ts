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

export function verifyJWT(token: string): { userId: string; phoneNumber: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { userId: decoded.userId, phoneNumber: decoded.phoneNumber };
  } catch (error) {
    return null;
  }
}

// Mock SMS service - In production, replace with actual SMS provider
export async function sendOTPSMS(phoneNumber: string, otpCode: string): Promise<boolean> {
  console.log(`[SMS Service] Sending OTP ${otpCode} to ${phoneNumber}`);
  
  // Simulate SMS sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In production, integrate with SMS providers like:
  // - Twilio
  // - AWS SNS
  // - Firebase Auth
  // - MessageBird
  // etc.
  
  return true; // Always return success for demo
}

export function isValidPhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
}