import { Router } from 'express';
import { SettingsController } from '../controllers/settingsController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', SettingsController.getSettings);
router.put('/', requireRole(['Admin']), SettingsController.updateSettings);
router.post('/clear-cache', requireRole(['Admin']), SettingsController.clearCache);

export default router;
