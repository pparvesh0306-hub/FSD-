import { Response, NextFunction } from 'express';
import {
  UserModel,
  PrivilegedAccountModel,
  AccessRequestModel,
  AccessReviewModel,
  AuditLogModel,
  CloudPlatformModel,
  ComplianceReportModel
} from '../models';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { getCache, setCache } from '../redis/redisClient';

export class DashboardController {
  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const cacheKey = 'dashboard:stats';
      const cachedStats = await getCache(cacheKey);
      if (cachedStats) {
        return res.json({ success: true, cached: true, data: JSON.parse(cachedStats) });
      }

      const totalUsers = await UserModel.countDocuments();
      const activeUsers = await UserModel.countDocuments({ status: 'ACTIVE' });
      const privilegedAccounts = await PrivilegedAccountModel.countDocuments();
      const pendingApprovals = await AccessRequestModel.countDocuments({ status: 'PENDING' });
      const pendingAccessReviews = await AccessReviewModel.countDocuments({ status: 'PENDING' });

      const auditDocs = await AuditLogModel.find().sort({ created_at: -1 }).limit(10).lean();
      const recentAuditActivities = auditDocs.map(({ _id, __v, ...l }: any) => l);

      const cpDocs = await CloudPlatformModel.find().sort({ id: 1 }).lean();
      const cloudPlatforms = cpDocs.map(({ _id, __v, ...p }: any) => p);

      let complianceStatus = { status: 'COMPLIANT', passRate: '100%', violations: 0 };
      const latestReport = await ComplianceReportModel.find().sort({ created_at: -1 }).limit(1).lean();
      if (latestReport.length > 0) {
        const rep = latestReport[0] as any;
        complianceStatus = {
          status: rep.status,
          passRate: rep.summary?.passRate || '100%',
          violations: rep.summary?.violations ?? rep.summary?.policyViolations ?? 0
        };
      }

      const stats = {
        totalUsers,
        activeUsers,
        privilegedAccounts,
        pendingApprovals,
        pendingAccessReviews,
        complianceStatus,
        cloudPlatforms,
        recentAuditActivities
      };

      await setCache(cacheKey, JSON.stringify(stats), 60);

      res.json({ success: true, cached: false, data: stats });
    } catch (err) {
      next(err);
    }
  }
}
