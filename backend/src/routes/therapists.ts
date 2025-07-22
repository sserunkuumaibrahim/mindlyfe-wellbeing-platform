import { Router } from 'express';
import { getAllTherapists, searchTherapists } from '../controllers/therapistController';

const router = Router();

router.get('/', getAllTherapists);
router.get('/search', searchTherapists);

export default router;
