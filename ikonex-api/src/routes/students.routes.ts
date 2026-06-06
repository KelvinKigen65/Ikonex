import { Router } from 'express';
import { getStudents, getStudent, createStudent, updateStudent, deleteStudent } from '../controllers/students.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), getStudents);
router.get('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), getStudent);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), createStudent);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), updateStudent);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), deleteStudent);

export default router;
