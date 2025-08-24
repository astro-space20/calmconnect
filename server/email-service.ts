import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Check if email credentials are configured
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    if (!emailUser || !emailPassword) {
      console.log('Email credentials not configured - using mock email service');
      return;
    }

    try {
      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPassword // Use App Password for Gmail
        }
      });

      console.log('Email service initialized with Gmail SMTP');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  async sendVerificationEmail(to: string, code: string): Promise<boolean> {
    if (!this.transporter) {
      // Fallback to console logging if email service is not configured
      console.log(`
========================================
EMAIL VERIFICATION CODE
========================================
To: ${to}
Subject: Verify your CalmConnect account

Your verification code is: ${code}

This code will expire in 15 minutes.

If you didn't create an account with CalmConnect, please ignore this email.
========================================
      `);
      return true;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'Verify your CalmConnect account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">CalmConnect Email Verification</h2>
            <p>Hello!</p>
            <p>Thank you for registering with CalmConnect. Please use the verification code below to complete your registration:</p>
            
            <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h1 style="color: #4F46E5; font-size: 32px; margin: 0; letter-spacing: 4px;">${code}</h1>
            </div>
            
            <p><strong>This code will expire in 15 minutes.</strong></p>
            
            <p>If you didn't create an account with CalmConnect, please ignore this email.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 14px;">
              This is an automated message from CalmConnect. Please do not reply to this email.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      
      // Fallback to console logging
      console.log(`
========================================
EMAIL VERIFICATION CODE (FALLBACK)
========================================
To: ${to}
Subject: Verify your CalmConnect account

Your verification code is: ${code}

This code will expire in 15 minutes.

If you didn't create an account with CalmConnect, please ignore this email.
========================================
      `);
      return false;
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
    if (!this.transporter) {
      console.log(`Password reset token for ${to}: ${resetToken}`);
      return true;
    }

    try {
      const resetUrl = `${process.env.BASE_URL || 'https://calmconnect-g7wfxf7cvq-el.a.run.app'}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'Reset your CalmConnect password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">CalmConnect Password Reset</h2>
            <p>Hello!</p>
            <p>You requested a password reset for your CalmConnect account. Click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
            
            <p><strong>This link will expire in 1 hour.</strong></p>
            
            <p>If you didn't request a password reset, please ignore this email.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 14px;">
              This is an automated message from CalmConnect. Please do not reply to this email.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
