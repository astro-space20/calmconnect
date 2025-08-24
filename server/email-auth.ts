import bcrypt from 'bcrypt';
import { storage } from './storage';
import { generateEmailJWT } from './auth';
import { emailService } from './email-service';
import { 
  emailRegistrationSchema,
  emailLoginSchema,
  emailVerificationSchema,
  type EmailRegistration,
  type EmailLogin,
  type EmailVerification 
} from '@shared/schema';

const SALT_ROUNDS = 12;

export class EmailAuthService {
  // Generate 6-digit verification code
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  // Verify password
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Register new user with email/password
  async registerUser(data: EmailRegistration): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      // Validate input
      const validatedData = emailRegistrationSchema.parse(data);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return { success: false, message: 'An account with this email already exists' };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(validatedData.password);

      // Create user
      const user = await storage.createUser({
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        authProvider: 'email',
        emailVerified: false,
        isVerified: false
      });

      // Generate verification code
      const verificationCode = this.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await storage.createEmailVerificationCode({
        email: validatedData.email,
        verificationCode,
        expiresAt,
        attempts: 0,
        isUsed: false
      });

      // Send verification email (mock for now)
      await this.sendVerificationEmail(validatedData.email, verificationCode);

      return { 
        success: true, 
        message: `Account created successfully. Your verification code is: ${verificationCode} (expires in 15 minutes)`,
        userId: user.id 
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.message || 'Registration failed. Please try again.' 
      };
    }
  }

  // Login with email/password
  async loginUser(data: EmailLogin): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
    try {
      // Validate input
      const validatedData = emailLoginSchema.parse(data);

      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user || !user.password) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Check if email is verified
      if (!user.emailVerified) {
        return { 
          success: false, 
          message: 'Please verify your email address before logging in. Check your inbox for verification code.' 
        };
      }

      // Update last login
      await storage.updateUserLastLogin(user.id);

      // Generate JWT token for email authentication
      const token = generateEmailJWT(user.id, user.email || '');

      return { 
        success: true, 
        message: 'Login successful', 
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profileImage: user.profileImage
        }
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.message || 'Login failed. Please try again.' 
      };
    }
  }

  // Verify email with code
  async verifyEmail(data: EmailVerification): Promise<{ success: boolean; message: string }> {
    try {
      // Validate input
      const validatedData = emailVerificationSchema.parse(data);

      // Find valid verification code
      const verification = await storage.getValidEmailVerificationCode(
        validatedData.email, 
        validatedData.verificationCode
      );

      if (!verification) {
        return { 
          success: false, 
          message: 'Invalid or expired verification code' 
        };
      }

      // Mark code as used
      await storage.markEmailVerificationAsUsed(verification.id);

      // Update user as verified
      await storage.updateUserVerification(verification.email, true);

      // User is already updated by updateUserVerification above

      return { 
        success: true, 
        message: 'Email verified successfully! You can now log in.' 
      };
    } catch (error: any) {
      console.error('Email verification error:', error);
      return { 
        success: false, 
        message: error.message || 'Email verification failed. Please try again.' 
      };
    }
  }

  // Resend verification code
  async resendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (user.emailVerified) {
        return { success: false, message: 'Email is already verified' };
      }

      // Generate new verification code
      const verificationCode = this.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await storage.createEmailVerificationCode({
        email,
        verificationCode,
        expiresAt,
        attempts: 0,
        isUsed: false
      });

      // Send verification email
      await this.sendVerificationEmail(email, verificationCode);

      return { 
        success: true, 
        message: `New verification code: ${verificationCode} (expires in 15 minutes)` 
      };
    } catch (error: any) {
      console.error('Resend verification error:', error);
      return { 
        success: false, 
        message: 'Failed to resend verification code. Please try again.' 
      };
    }
  }

  // Send verification email using email service
  private async sendVerificationEmail(email: string, code: string): Promise<void> {
    await emailService.sendVerificationEmail(email, code);
  }

  // Cleanup expired verification codes (should be run periodically)
  async cleanupExpiredCodes(): Promise<void> {
    await storage.cleanupExpiredEmailVerifications();
  }
}

export const emailAuthService = new EmailAuthService();