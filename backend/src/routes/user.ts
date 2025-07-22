import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { 
  getUserProfile, 
  updateUserProfile, 
  changePassword,
  updateNotificationSettings,
  getNotificationSettings
} from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Dashboard route
router.get('/users/:userId/dashboard', authMiddleware, getDashboardData);

// Profile routes
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);

// Password management
router.put('/change-password', authMiddleware, changePassword);

// Notification settings
router.get('/settings/notifications', authMiddleware, getNotificationSettings);
router.put('/settings/notifications', authMiddleware, updateNotificationSettings);

export default router;
