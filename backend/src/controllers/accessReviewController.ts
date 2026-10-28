import { Response, NextFunction } from 'express';
import { AccessReviewService } from '../services/accessReviewService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AccessReviewController {
  static async getAllReviews(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const reviews = await AccessReviewService.getAllReviews(req.user?.userId, req.user?.role);
      res.json({ success: true, data: reviews });
    } catch (err) {
      next(err);
    }
  }

  static async createReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { user_id, privileged_account_id, cloud_platform_id, access_level, comments } = req.body;
      if (!user_id || !privileged_account_id || !cloud_platform_id || !access_level) {
        return res.status(400).json({ success: false, message: 'All access review fields are required.' });
      }

      const review = await AccessReviewService.createReview(
        {
          user_id: Number(user_id),
          privileged_account_id: Number(privileged_account_id),
          cloud_platform_id: Number(cloud_platform_id),
          access_level,
          comments
        },
        req.user!.userId,
        req.user!.email
      );
      res.status(201).json({ success: true, message: 'Access review created', data: review });
    } catch (err) {
      next(err);
    }
  }

  static async updateReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const { status, comments } = req.body;
      if (!status || !['APPROVED', 'REVOKED'].includes(status)) {
        return res.status(400).json({ success: false, message: "Status must be 'APPROVED' or 'REVOKED'." });
      }

      const updated = await AccessReviewService.updateReviewStatus(
        id,
        status,
        req.user!.userId,
        req.user!.email,
        comments
      );
      res.json({ success: true, message: `Access review marked as ${status}`, data: updated });
    } catch (err) {
      next(err);
    }
  }
}
