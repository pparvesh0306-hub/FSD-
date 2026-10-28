import { Response, NextFunction } from 'express';
import { SystemSettingModel } from '../models';
import { isUsingMongo } from '../database/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { flushCache, getRedisStatus } from '../redis/redisClient';
import { AuditLogService } from '../services/auditLogService';

export class SettingsController {
  static async getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settingDocs = await SystemSettingModel.find().sort({ id: 1 }).lean();
      const settings = settingDocs.map(({ _id, __v, ...s }: any) => s);

      const redisStatus = getRedisStatus();
      res.json({
        success: true,
        data: {
          settings,
          system: {
            redis: redisStatus,
            mongoConnected: isUsingMongo(),
            nodeVersion: process.version,
            uptimeSeconds: Math.floor(process.uptime())
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { settings } = req.body;
      if (!Array.isArray(settings)) {
        return res.status(400).json({ success: false, message: 'Settings array is required.' });
      }

      for (const item of settings) {
        await SystemSettingModel.updateOne(
          { key: item.key },
          { $set: { value: item.value, updated_at: new Date().toISOString() } }
        );
      }

      await AuditLogService.createLog({
        userId: req.user!.userId,
        userEmail: req.user!.email,
        action: 'SETTINGS_UPDATED',
        resourceType: 'SYSTEM_SETTINGS',
        description: 'Updated system security and session governance parameters'
      });

      res.json({ success: true, message: 'System settings updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async clearCache(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await flushCache();
      await AuditLogService.createLog({
        userId: req.user!.userId,
        userEmail: req.user!.email,
        action: 'CACHE_CLEARED',
        resourceType: 'REDIS_CACHE',
        description: 'Flushed Redis system cache stores'
      });
      res.json({ success: true, message: 'Redis cache flushed successfully' });
    } catch (err) {
      next(err);
    }
  }
}
