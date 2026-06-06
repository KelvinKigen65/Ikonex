import { Router } from 'express';
import {
  getResults,
  getDashboardStats,
  getStudentReportCard,
  getClassReport,
} from '../controllers/results.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/report-card', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), getStudentReportCard);
router.get('/class-report', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), getClassReport);
router.get('/', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), getResults);
router.get('/dashboard', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), getDashboardStats);

export default router;
