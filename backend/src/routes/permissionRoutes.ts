import { Router } from 'express';
import { RoleController } from '../controllers/roleController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);
router.get('/', RoleController.getAllPermissions);

export default router;
