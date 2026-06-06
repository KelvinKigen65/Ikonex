import { Router } from 'express';
import { getStudents, getStudent, createStudent, updateStudent, deleteStudent } from '../controllers/students.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/', getStudents);
router.get('/:id', getStudent);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), createStudent);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN'), updateStudent);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), deleteStudent);

export default router;