import { Router } from 'express';
import { RoleController } from '../controllers/roleController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', RoleController.getAllRoles);
router.post('/', requireRole(['Admin']), RoleController.createRole);
router.put('/:id', requireRole(['Admin']), RoleController.updateRole);
router.delete('/:id', requireRole(['Admin']), RoleController.deleteRole);

export default router;
