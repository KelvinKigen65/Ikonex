import { Router } from 'express';
import { getStreams, getStream, createStream, updateStream, deleteStream } from '../controllers/streams.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), getStreams);
router.get('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), getStream);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), createStream);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), updateStream);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), deleteStream);

export default router;
