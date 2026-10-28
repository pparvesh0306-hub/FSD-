import { Router } from 'express';
import { CloudPlatformController } from '../controllers/cloudPlatformController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', CloudPlatformController.getAllPlatforms);
router.post('/:id/sync', requireRole(['Admin', 'Security Officer']), CloudPlatformController.syncPlatform);

export default router;
