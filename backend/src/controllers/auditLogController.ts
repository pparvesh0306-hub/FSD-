import { Response, NextFunction } from 'express';
import { AuditLogService } from '../services/auditLogService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AuditLogController {
  static async getLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { action, resourceType, search } = req.query;
      const logs = await AuditLogService.getLogs({
        action: action as string,
        resourceType: resourceType as string,
        search: search as string
      });
      res.json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  }
}
