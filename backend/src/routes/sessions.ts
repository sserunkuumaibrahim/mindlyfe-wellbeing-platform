import { Router } from 'express';
import { getSessions, bookSession } from '../controllers/sessionController';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';

const router = Router();

router.get('/', authMiddleware, getSessions);
router.post('/book', authMiddleware, roleMiddleware(['individual']), bookSession);

export default router;
