import { Router } from 'express';
import { getSubjects, createSubject, updateSubject, deleteSubject, assignSubjectToStream } from '../controllers/subjects.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), getSubjects);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), createSubject);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), updateSubject);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), deleteSubject);
router.post('/assign', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), assignSubjectToStream);

export default router;
