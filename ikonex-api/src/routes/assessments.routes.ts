import { Router } from 'express';
import { getAssessments, createAssessment, updateAssessment, deleteAssessment, bulkSubmitScores, getScores } from '../controllers/assessments.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/', getAssessments);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), createAssessment);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), updateAssessment);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), deleteAssessment);
router.post('/scores/bulk', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), bulkSubmitScores);
router.get('/:assessmentId/scores', getScores);

export default router;