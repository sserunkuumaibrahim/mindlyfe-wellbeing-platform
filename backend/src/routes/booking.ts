import { Router } from 'express';
import { bookSession } from '../controllers/bookingController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/sessions/book', authMiddleware, bookSession);

export default router;
