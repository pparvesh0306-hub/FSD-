import { Response, NextFunction } from 'express';
import { AccessRequestService } from '../services/accessRequestService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AccessRequestController {
  static async getAllRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const requests = await AccessRequestService.getAllRequests();
      res.json({ success: true, data: requests });
    } catch (err) {
      next(err);
    }
  }

  static async createRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { privileged_account_id, cloud_platform_id, access_level, justification, duration_hours } = req.body;
      if (!privileged_account_id || !cloud_platform_id || !access_level || !justification) {
        return res.status(400).json({ success: false, message: 'All request fields are required.' });
      }

      const request = await AccessRequestService.createRequest(
        req.user!.userId,
        req.user!.email,
        {
          privileged_account_id: Number(privileged_account_id),
          cloud_platform_id: Number(cloud_platform_id),
          access_level,
          justification,
          duration_hours: Number(duration_hours || 8)
        }
      );
      res.status(201).json({ success: true, message: 'Access request submitted', data: request });
    } catch (err) {
      next(err);
    }
  }

  static async getAllApprovals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const approvals = await AccessRequestService.getAllApprovals();
      res.json({ success: true, data: approvals });
    } catch (err) {
      next(err);
    }
  }

  static async approveRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const { comments } = req.body;
      const updated = await AccessRequestService.processDecision(
        id,
        'APPROVED',
        req.user!.userId,
        req.user!.email,
        comments
      );
      res.json({ success: true, message: 'Access request approved', data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async rejectRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const { comments } = req.body;
      const updated = await AccessRequestService.processDecision(
        id,
        'REJECTED',
        req.user!.userId,
        req.user!.email,
        comments
      );
      res.json({ success: true, message: 'Access request rejected', data: updated });
    } catch (err) {
      next(err);
    }
  }
}
