import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secure-jwt-secret-key-change-in-production";

// Configure Google OAuth Strategy
export function configureGoogleAuth() {
  // Use the exact domain from the environment
  const baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN || '3c4542c3-83b5-4cd9-8c60-67bcbb5508fe-00-3aqqb8a3bgmtw.riker.replit.dev'}`;
  
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${baseUrl}/api/auth/google/callback`
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      const googleId = profile.id;
      const email = profile.emails?.[0]?.value;
      const name = profile.displayName;
      const profileImage = profile.photos?.[0]?.value;

      if (!email) {
        return done(new Error("No email found in Google profile"), null);
      }

      // Check if user already exists
      let user = await storage.getUserByGoogleId(googleId);
      
      if (!user) {
        // Check if user exists by email
        user = await storage.getUserByEmail(email);
        
        if (user) {
          // Update existing user with Google ID
          user = await storage.updateUserGoogleId(user.id, googleId);
        } else {
          // Create new user
          user = await storage.createUser({
            googleId,
            email,
            name: name || "Google User",
            profileImage,
            authProvider: 'google',
            emailVerified: true,
            isVerified: true
          });
        }
      }

      return done(null, user);
    } catch (error) {
      console.error("Google Auth Error:", error);
      return done(error, null);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

export function generateJWTFromUser(user: any): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      name: user.name,
      timestamp: Date.now() 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyJWT(token: string): { userId: string; email: string; name: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { 
      userId: decoded.userId, 
      email: decoded.email,
      name: decoded.name 
    };
  } catch (error) {
    return null;
  }
}