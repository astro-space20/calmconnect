import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from './auth';
import { storage } from './storage';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    [key: string]: any;
  };
}

export const authenticateEmailUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authorization token provided' 
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = verifyJWT(token);
      
      if (!decoded || !decoded.email) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token format' 
        });
      }
      
      // Get user from database to ensure they still exist and are verified
      const user = await storage.getUserByEmail(decoded.email);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      if (!user.emailVerified) {
        return res.status(401).json({ 
          success: false, 
          message: 'Email not verified' 
        });
      }

      // Attach user info to request
      req.user = {
        id: user.id,
        email: user.email || '',
        name: user.name,
        profileImage: user.profileImage
      };

      next();
    } catch (jwtError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

export default authenticateEmailUser;