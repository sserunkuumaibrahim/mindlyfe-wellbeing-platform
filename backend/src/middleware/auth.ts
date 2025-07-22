// Authentication Middleware for PostgreSQL Backend
import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { pool } from '../database';
import { AuthenticatedRequest, JWTPayload, User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to authenticate JWT tokens
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    if (decoded.type !== 'access') {
      res.status(401).json({ message: 'Invalid token type' });
      return;
    }

    // Check if session is still valid
    const client = await pool.connect();
    try {
      const sessionResult = await client.query(
        'SELECT id FROM public.user_sessions WHERE profile_id = $1 AND expires_at > NOW() AND is_active = true',
        [decoded.userId]
      );

      if (sessionResult.rows.length === 0) {
        res.status(401).json({ message: 'Session expired' });
        return;
      }

      // Get user profile for role information
      const profileResult = await client.query(
        'SELECT role FROM public.profiles WHERE id = $1 AND is_active = true',
        [decoded.userId]
      );

      if (profileResult.rows.length === 0) {
        res.status(401).json({ message: 'User not found' });
        return;
      }

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: profileResult.rows[0].role
      };

      next();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ message: 'Invalid or expired token' });
    return;
  }
};

// Middleware to check user roles
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

// Middleware to check if user is admin
export const requireAdmin = requireRole(['admin']);

// Middleware to check if user is therapist or admin
export const requireTherapist = requireRole(['therapist', 'admin']);

// Middleware to check if user is organization or admin
export const requireOrganization = requireRole(['org_admin', 'admin']);

// Middleware to check if user is organization admin
export const requireOrgAdmin = requireRole(['org_admin']);

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next(); // Continue without authentication
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    if (decoded.type === 'access') {
      const client = await pool.connect();
      try {
        const sessionResult = await client.query(
          'SELECT id FROM public.user_sessions WHERE profile_id = $1 AND expires_at > NOW() AND is_active = true',
          [decoded.userId]
        );

        if (sessionResult.rows.length > 0) {
          const profileResult = await client.query(
            'SELECT role FROM public.profiles WHERE id = $1 AND is_active = true',
            [decoded.userId]
          );

          req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: profileResult.rows[0]?.role
          };
        }
      } finally {
        client.release();
      }
    }
  } catch (error: unknown) {
    // Ignore token errors for optional auth
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Optional auth token error:', errorMessage);
  }

  next();
};

// Middleware to validate user owns resource
export const requireOwnership = (userIdField: string = 'user_id') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      next();
      return;
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (!resourceUserId) {
      res.status(400).json({ message: 'Resource user ID not provided' });
      return;
    }

    if (req.user.userId !== resourceUserId) {
      res.status(403).json({ message: 'Access denied: not resource owner' });
      return;
    }

    next();
  };
};

// Rate limiting middleware
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number, windowMs: number) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const key = req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    const record = rateLimitStore.get(key);
    
    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (record.count >= maxRequests) {
      return res.status(429).json({ 
        message: 'Too many requests', 
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    record.count++;
    next();
  };
};

// Clean up expired rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export type { AuthenticatedRequest };

// Alias for compatibility with existing code
export const authMiddleware = authenticateToken;