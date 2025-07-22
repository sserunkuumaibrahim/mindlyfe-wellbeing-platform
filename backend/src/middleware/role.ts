import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

export const roleMiddleware = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { role } = req.user;

    if (!roles.includes(role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    next();
  };
};