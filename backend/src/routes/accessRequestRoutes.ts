import { Router } from 'express';
import { AccessRequestController } from '../controllers/accessRequestController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', AccessRequestController.getAllRequests);
router.post('/', AccessRequestController.createRequest);

export default router;
