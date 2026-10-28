import { Response, NextFunction } from 'express';
import { ComplianceService } from '../services/complianceService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class ComplianceController {
  static async getAllReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const reports = await ComplianceService.getAllReports();
      res.json({ success: true, data: reports });
    } catch (err) {
      next(err);
    }
  }

  static async generateReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { title, framework } = req.body;
      const reportTitle = title || `Compliance Audit ${new Date().toLocaleDateString()}`;
      const report = await ComplianceService.generateReport(
        reportTitle,
        framework || 'SOC2',
        req.user!.userId,
        req.user!.email
      );
      res.status(201).json({ success: true, message: 'Compliance report generated', data: report });
    } catch (err) {
      next(err);
    }
  }
}
