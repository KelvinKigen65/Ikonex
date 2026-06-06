import { Router } from 'express';
import { getSubjects, createSubject, updateSubject, deleteSubject, assignSubjectToStream } from '../controllers/subjects.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/', getSubjects);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), createSubject);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN'), updateSubject);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteSubject);
router.post('/assign', authorize('SUPER_ADMIN', 'ADMIN'), assignSubjectToStream);

export default router;