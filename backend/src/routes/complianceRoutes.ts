import { Router } from 'express';
import { ComplianceController } from '../controllers/complianceController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', requireRole(['Admin', 'Security Officer', 'Auditor']), ComplianceController.getAllReports);
router.post('/', requireRole(['Admin', 'Security Officer', 'Auditor']), ComplianceController.generateReport);

export default router;
