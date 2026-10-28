import {
  AccessRequestModel,
  ApprovalModel,
  UserModel,
  PrivilegedAccountModel,
  CloudPlatformModel,
  getNextSequenceValue
} from '../models';
import { AccessRequest, Approval } from '../types';
import { delCache, getCache, setCache } from '../redis/redisClient';
import { AuditLogService } from './auditLogService';

export class AccessRequestService {
  static async getAllRequests(): Promise<AccessRequest[]> {
    const cached = await getCache('access_requests:all');
    if (cached) return JSON.parse(cached);

    const reqDocs = await AccessRequestModel.find().sort({ created_at: -1 }).lean();
    const requests: AccessRequest[] = [];

    const userDocs = await UserModel.find().select('id full_name email').lean();
    const userMap = new Map(userDocs.map(u => [u.id, u]));

    const accountDocs = await PrivilegedAccountModel.find().select('id account_name').lean();
    const accountMap = new Map(accountDocs.map(a => [a.id, a]));

    const platformDocs = await CloudPlatformModel.find().select('id name').lean();
    const platformMap = new Map(platformDocs.map(p => [p.id, p]));

    for (const doc of reqDocs) {
      const { _id, __v, ...req } = doc as any;
      const user = userMap.get(req.user_id);
      const acc = accountMap.get(req.privileged_account_id);
      const cp = platformMap.get(req.cloud_platform_id);

      requests.push({
        ...req,
        user_name: user?.full_name || 'Unknown User',
        user_email: user?.email || '',
        account_name: acc?.account_name || 'Account',
        platform_name: cp?.name || 'Cloud Platform'
      });
    }

    await setCache('access_requests:all', JSON.stringify(requests), 60);
    return requests;
  }

  static async createRequest(
    userId: number,
    userEmail: string,
    data: {
      privileged_account_id: number;
      cloud_platform_id: number;
      access_level: string;
      justification: string;
      duration_hours: number;
    }
  ): Promise<AccessRequest> {
    const newId = await getNextSequenceValue('access_requests');
    const created = await AccessRequestModel.create({
      id: newId,
      user_id: userId,
      privileged_account_id: data.privileged_account_id,
      cloud_platform_id: data.cloud_platform_id,
      access_level: data.access_level,
      justification: data.justification,
      duration_hours: data.duration_hours,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const { _id, __v, ...req } = created.toObject() as any;

    await delCache('access_requests:all');
    await delCache('dashboard:stats');

    await AuditLogService.createLog({
      userId,
      userEmail,
      action: 'ACCESS_REQUEST_CREATED',
      resourceType: 'ACCESS_REQUEST',
      resourceId: String(req.id),
      description: `Submitted access elevation request for level '${data.access_level}' (${data.duration_hours}h duration). Justification: ${data.justification}`
    });

    return req as AccessRequest;
  }

  static async getAllApprovals(): Promise<Approval[]> {
    const cached = await getCache('approvals:all');
    if (cached) return JSON.parse(cached);

    const appDocs = await ApprovalModel.find().sort({ decided_at: -1 }).lean();
    const approvals: Approval[] = [];

    const userDocs = await UserModel.find().select('id full_name').lean();
    const userMap = new Map(userDocs.map(u => [u.id, u]));

    for (const doc of appDocs) {
      const { _id, __v, ...app } = doc as any;
      const approver = userMap.get(app.approver_id);

      approvals.push({
        ...app,
        approver_name: approver?.full_name || 'System Approver'
      });
    }

    await setCache('approvals:all', JSON.stringify(approvals), 60);
    return approvals;
  }

  static async processDecision(
    requestId: number,
    decision: 'APPROVED' | 'REJECTED',
    approverId: number,
    approverEmail: string,
    comments?: string
  ): Promise<AccessRequest> {
    const updatedReqDoc = await AccessRequestModel.findOneAndUpdate(
      { id: requestId },
      { $set: { status: decision, updated_at: new Date().toISOString() } },
      { new: true }
    ).lean();

    if (!updatedReqDoc) throw { status: 404, message: 'Access request not found' };

    const { _id, __v, ...updatedReq } = updatedReqDoc as any;

    const newApprovalId = await getNextSequenceValue('approvals');
    await ApprovalModel.create({
      id: newApprovalId,
      request_id: requestId,
      approver_id: approverId,
      decision,
      comments: comments || '',
      decided_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    });

    await delCache('access_requests:all');
    await delCache('approvals:all');
    await delCache('dashboard:stats');

    await AuditLogService.createLog({
      userId: approverId,
      userEmail: approverEmail,
      action: decision === 'APPROVED' ? 'ACCESS_REQUEST_APPROVED' : 'ACCESS_REQUEST_REJECTED',
      resourceType: 'ACCESS_REQUEST',
      resourceId: String(requestId),
      description: `Decision '${decision}' for access request #${requestId}. Comments: ${comments || 'None'}`
    });

    return updatedReq as AccessRequest;
  }
}
