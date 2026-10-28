import { AuditLogModel, getNextSequenceValue } from '../models';
import { AuditLog } from '../types';
import { delCache } from '../redis/redisClient';

export class AuditLogService {
  static async createLog(log: {
    userId?: number | null;
    userEmail: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    description: string;
    ipAddress?: string;
  }): Promise<AuditLog> {
    const ip = log.ipAddress || '127.0.0.1';
    const newId = await getNextSequenceValue('audit_logs');

    const created = await AuditLogModel.create({
      id: newId,
      user_id: log.userId || null,
      user_email: log.userEmail,
      action: log.action,
      resource_type: log.resourceType,
      resource_id: log.resourceId || 'N/A',
      description: log.description,
      ip_address: ip,
      created_at: new Date().toISOString()
    });

    const { _id, __v, ...newLog } = created.toObject() as any;

    await delCache('dashboard:stats');
    await delCache('audit_logs:*');
    return newLog as AuditLog;
  }

  static async getLogs(filter?: { action?: string; resourceType?: string; search?: string }): Promise<AuditLog[]> {
    const query: any = {};

    if (filter?.action) {
      query.action = new RegExp(`^${filter.action}$`, 'i');
    }
    if (filter?.resourceType) {
      query.resource_type = new RegExp(`^${filter.resourceType}$`, 'i');
    }
    if (filter?.search) {
      const searchRegex = new RegExp(filter.search, 'i');
      query.$or = [
        { description: searchRegex },
        { user_email: searchRegex },
        { action: searchRegex }
      ];
    }

    const logDocs = await AuditLogModel.find(query).sort({ created_at: -1 }).limit(200).lean();
    const logs: AuditLog[] = logDocs.map(({ _id, __v, ...l }: any) => l as AuditLog);

    return logs;
  }
}
