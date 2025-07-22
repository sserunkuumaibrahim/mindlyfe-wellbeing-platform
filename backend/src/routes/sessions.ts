import { Router } from 'express';
import { bookSession } from '../controllers/sessionController';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';

const router = Router();

router.post('/book', authMiddleware, roleMiddleware(['individual']), bookSession);

export default router;
