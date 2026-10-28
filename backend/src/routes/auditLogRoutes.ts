import { Router } from 'express';
import { AuditLogController } from '../controllers/auditLogController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['Admin', 'Security Officer', 'Auditor']), AuditLogController.getLogs);

export default router;
