import {
  ComplianceReportModel,
  PrivilegedAccountModel,
  AccessReviewModel,
  AccessRequestModel,
  UserModel,
  getNextSequenceValue
} from '../models';
import { ComplianceReport } from '../types';
import { delCache, getCache, setCache } from '../redis/redisClient';
import { AuditLogService } from './auditLogService';

export class ComplianceService {
  static async getAllReports(): Promise<ComplianceReport[]> {
    const cached = await getCache('compliance_reports:all');
    if (cached) return JSON.parse(cached);

    const reportDocs = await ComplianceReportModel.find().sort({ created_at: -1 }).lean();
    const reports: ComplianceReport[] = [];

    const userDocs = await UserModel.find().select('id full_name').lean();
    const userMap = new Map(userDocs.map(u => [u.id, u.full_name]));

    for (const doc of reportDocs) {
      const { _id, __v, ...rep } = doc as any;
      reports.push({
        ...rep,
        generated_by_name: rep.generated_by ? userMap.get(rep.generated_by) || 'System Auditor' : 'System Auto-Auditor'
      });
    }

    await setCache('compliance_reports:all', JSON.stringify(reports), 120);
    return reports;
  }

  static async generateReport(
    title: string,
    framework: string = 'SOC2',
    adminId: number,
    adminEmail: string
  ): Promise<ComplianceReport> {
    const totalAccounts = await PrivilegedAccountModel.countDocuments();
    const pendingReviews = await AccessReviewModel.countDocuments({ status: 'PENDING' });
    const approvedRequests = await AccessRequestModel.countDocuments({ status: 'APPROVED' });
    const rejectedRequests = await AccessRequestModel.countDocuments({ status: 'REJECTED' });

    const violations = pendingReviews > 5 ? 2 : 0;
    const status = violations === 0 ? 'COMPLIANT' : 'WARNING';
    const passRate = totalAccounts > 0 ? `${(((totalAccounts - violations) / totalAccounts) * 100).toFixed(1)}%` : '100%';

    const summary = {
      totalAccounts,
      activeReviews: pendingReviews,
      approvedRequests,
      rejectedRequests,
      policyViolations: violations,
      passRate,
      generatedAt: new Date().toISOString()
    };

    const newId = await getNextSequenceValue('compliance_reports');
    const created = await ComplianceReportModel.create({
      id: newId,
      title,
      generated_by: adminId,
      status,
      framework,
      summary,
      created_at: new Date().toISOString()
    });

    const { _id, __v, ...report } = created.toObject() as any;

    await delCache('compliance_reports:all');

    await AuditLogService.createLog({
      userId: adminId,
      userEmail: adminEmail,
      action: 'COMPLIANCE_REPORT_GENERATED',
      resourceType: 'COMPLIANCE_REPORT',
      resourceId: String(report.id),
      description: `Generated ${framework} compliance report '${title}' - Status: ${status}`
    });

    return report as ComplianceReport;
  }
}
