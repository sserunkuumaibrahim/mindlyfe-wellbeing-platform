import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/users/:userId/dashboard', authMiddleware, getDashboardData);

export default router;
