import { Router } from 'express';
import { getStreams, getStream, createStream, updateStream, deleteStream } from '../controllers/streams.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();
router.use(authenticate);

router.get('/', getStreams);
router.get('/:id', getStream);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), createStream);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN'), updateStream);
router.delete('/:id', authorize('SUPER_ADMIN'), deleteStream);

export default router;