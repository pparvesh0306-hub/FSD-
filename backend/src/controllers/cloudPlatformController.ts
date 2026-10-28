import { Response, NextFunction } from 'express';
import { CloudPlatformService } from '../services/cloudPlatformService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class CloudPlatformController {
  static async getAllPlatforms(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const platforms = await CloudPlatformService.getAllPlatforms();
      res.json({ success: true, data: platforms });
    } catch (err) {
      next(err);
    }
  }

  static async syncPlatform(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const synced = await CloudPlatformService.syncPlatform(id, req.user!.userId, req.user!.email);
      res.json({ success: true, message: 'Cloud platform synced successfully', data: synced });
    } catch (err) {
      next(err);
    }
  }
}
