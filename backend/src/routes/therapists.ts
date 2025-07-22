import { Router } from 'express';
import { searchTherapists } from '../controllers/therapistController';

const router = Router();

router.get('/search', searchTherapists);

export default router;
