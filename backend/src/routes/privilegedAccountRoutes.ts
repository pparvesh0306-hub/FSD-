import { Router } from 'express';
import { PrivilegedAccountController } from '../controllers/privilegedAccountController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', PrivilegedAccountController.getAllAccounts);
router.post('/', requireRole(['Admin', 'Security Officer']), PrivilegedAccountController.createAccount);
router.put('/:id', requireRole(['Admin', 'Security Officer']), PrivilegedAccountController.updateAccount);
router.delete('/:id', requireRole(['Admin']), PrivilegedAccountController.deleteAccount);

export default router;
