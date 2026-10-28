import { Router } from 'express';
import { AccessReviewController } from '../controllers/accessReviewController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/rbacMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', AccessReviewController.getAllReviews);
router.post('/', requireRole(['Admin', 'Security Officer']), AccessReviewController.createReview);
router.put('/:id', requireRole(['Admin', 'Security Officer']), AccessReviewController.updateReview);

export default router;
