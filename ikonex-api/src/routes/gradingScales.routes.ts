import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { getGradingScales, updateGradingScales } from '../controllers/gradingScales.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('SUPER_ADMIN', 'ADMIN'));

router.get('/', getGradingScales);
router.put('/', updateGradingScales);

export default router;
