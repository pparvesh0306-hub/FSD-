import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', requireRole(['Admin']), UserController.createUser);
router.put('/:id', requireRole(['Admin']), UserController.updateUser);
router.delete('/:id', requireRole(['Admin']), UserController.deleteUser);

export default router;
