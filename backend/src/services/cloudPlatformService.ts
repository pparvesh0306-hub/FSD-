import { CloudPlatformModel } from '../models';
import { CloudPlatform } from '../types';
import { delCache, getCache, setCache } from '../redis/redisClient';
import { AuditLogService } from './auditLogService';

export class CloudPlatformService {
  static async getAllPlatforms(): Promise<CloudPlatform[]> {
    const cached = await getCache('cloud_platforms:all');
    if (cached) return JSON.parse(cached);

    const platformDocs = await CloudPlatformModel.find().sort({ id: 1 }).lean();
    const platforms: CloudPlatform[] = platformDocs.map(({ _id, __v, ...p }: any) => p as CloudPlatform);

    await setCache('cloud_platforms:all', JSON.stringify(platforms), 120);
    return platforms;
  }

  static async syncPlatform(id: number, userId: number, userEmail: string): Promise<CloudPlatform> {
    const updatedDoc = await CloudPlatformModel.findOneAndUpdate(
      { id },
      { $set: { last_sync_at: new Date().toISOString() } },
      { new: true }
    ).lean();

    if (!updatedDoc) throw { status: 404, message: 'Cloud platform not found' };

    const { _id, __v, ...updated } = updatedDoc as any;

    await delCache('cloud_platforms:all');
    await delCache('dashboard:stats');

    await AuditLogService.createLog({
      userId,
      userEmail,
      action: 'CLOUD_PLATFORM_SYNCED',
      resourceType: 'CLOUD_PLATFORM',
      resourceId: String(id),
      description: `Synchronized cloud identity IAM policies and user roles for ${updated.name}`
    });

    return updated as CloudPlatform;
  }
}
