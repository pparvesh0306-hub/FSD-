import { Router } from 'express';
import { AccessRequestController } from '../controllers/accessRequestController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', AccessRequestController.getAllApprovals);
router.post('/:id/approve', requireRole(['Admin', 'Approver']), AccessRequestController.approveRequest);
router.post('/:id/reject', requireRole(['Admin', 'Approver']), AccessRequestController.rejectRequest);

export default router;
