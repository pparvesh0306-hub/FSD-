import { PrivilegedAccountModel, UserModel, CloudPlatformModel, getNextSequenceValue } from '../models';
import { PrivilegedAccount } from '../types';
import { delCache, getCache, setCache } from '../redis/redisClient';
import { AuditLogService } from './auditLogService';

export class PrivilegedAccountService {
  static async getAllAccounts(): Promise<PrivilegedAccount[]> {
    const cached = await getCache('privileged_accounts:all');
    if (cached) return JSON.parse(cached);

    const accDocs = await PrivilegedAccountModel.find().sort({ id: 1 }).lean();
    const accounts: PrivilegedAccount[] = [];

    const userDocs = await UserModel.find().select('id full_name email').lean();
    const userMap = new Map(userDocs.map(u => [u.id, u]));

    const platformDocs = await CloudPlatformModel.find().select('id name provider').lean();
    const platformMap = new Map(platformDocs.map(p => [p.id, p]));

    for (const doc of accDocs) {
      const { _id, __v, ...acc } = doc as any;
      const user = acc.user_id ? userMap.get(acc.user_id) : null;
      const platform = platformMap.get(acc.cloud_platform_id);

      accounts.push({
        ...acc,
        user_name: user?.full_name || 'Unassigned',
        user_email: user?.email || '',
        platform_name: platform?.name || 'Unknown Cloud',
        provider: platform?.provider || 'Cloud'
      });
    }

    await setCache('privileged_accounts:all', JSON.stringify(accounts), 120);
    return accounts;
  }

  static async createAccount(
    data: {
      user_id?: number | null;
      cloud_platform_id: number;
      account_name: string;
      account_type: string;
      access_level: string;
    },
    adminEmail: string,
    adminId: number
  ): Promise<PrivilegedAccount> {
    const newId = await getNextSequenceValue('privileged_accounts');
    const created = await PrivilegedAccountModel.create({
      id: newId,
      user_id: data.user_id || null,
      cloud_platform_id: data.cloud_platform_id,
      account_name: data.account_name,
      account_type: data.account_type,
      access_level: data.access_level,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const { _id, __v, ...account } = created.toObject() as any;

    await CloudPlatformModel.updateOne(
      { id: data.cloud_platform_id },
      { $inc: { privileged_account_count: 1 } }
    );

    await delCache('privileged_accounts:all');
    await delCache('cloud_platforms:all');
    await delCache('dashboard:stats');

    await AuditLogService.createLog({
      userId: adminId,
      userEmail: adminEmail,
      action: 'PRIVILEGED_ACCOUNT_CREATED',
      resourceType: 'PRIVILEGED_ACCOUNT',
      resourceId: String(account.id),
      description: `Created privileged account '${data.account_name}' (${data.account_type}) with access level '${data.access_level}'`
    });

    return account as PrivilegedAccount;
  }

  static async updateAccount(
    id: number,
    data: Partial<PrivilegedAccount>,
    adminEmail: string,
    adminId: number
  ): Promise<PrivilegedAccount> {
    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (data.user_id !== undefined) updatePayload.user_id = data.user_id;
    if (data.access_level !== undefined) updatePayload.access_level = data.access_level;
    if (data.status !== undefined) updatePayload.status = data.status;

    const updated = await PrivilegedAccountModel.findOneAndUpdate(
      { id },
      { $set: updatePayload },
      { new: true }
    ).lean();

    if (!updated) throw { status: 404, message: 'Privileged account not found' };
    const { _id, __v, ...account } = updated as any;

    await delCache('privileged_accounts:all');
    await delCache('dashboard:stats');

    await AuditLogService.createLog({
      userId: adminId,
      userEmail: adminEmail,
      action: 'PRIVILEGED_ACCOUNT_UPDATED',
      resourceType: 'PRIVILEGED_ACCOUNT',
      resourceId: String(id),
      description: `Updated status/access for privileged account #${id} to ${account.status} (${account.access_level})`
    });

    return account as PrivilegedAccount;
  }

  static async deleteAccount(id: number, adminEmail: string, adminId: number): Promise<void> {
    const res = await PrivilegedAccountModel.deleteOne({ id });
    if (res.deletedCount === 0) throw { status: 404, message: 'Privileged account not found' };

    await delCache('privileged_accounts:all');
    await delCache('dashboard:stats');

    await AuditLogService.createLog({
      userId: adminId,
      userEmail: adminEmail,
      action: 'PRIVILEGED_ACCOUNT_DELETED',
      resourceType: 'PRIVILEGED_ACCOUNT',
      resourceId: String(id),
      description: `Deleted privileged account #${id}`
    });
  }
}
