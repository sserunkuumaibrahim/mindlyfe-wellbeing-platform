import { Router } from 'express';
import { searchTherapists } from '../controllers/searchController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/therapists/search', authMiddleware, searchTherapists);

export default router;
