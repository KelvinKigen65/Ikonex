import { Router } from 'express';
import { getResults, getDashboardStats } from '../controllers/results.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', getResults);
router.get('/dashboard', getDashboardStats);

export default router;