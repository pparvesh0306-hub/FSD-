import bcrypt from 'bcryptjs';
import { UserModel, getNextSequenceValue } from '../models';
import { User } from '../types';
import { delCache, getCache, setCache } from '../redis/redisClient';
import { AuditLogService } from './auditLogService';

export class UserService {
  static async getAllUsers(): Promise<User[]> {
    const cached = await getCache('users:all');
    if (cached) return JSON.parse(cached);

    const userDocs = await UserModel.find().sort({ id: 1 }).select('-password_hash').lean();
    const users: User[] = userDocs.map(({ _id, __v, ...u }: any) => u as User);

    await setCache('users:all', JSON.stringify(users), 120);
    return users;
  }

  static async getUserById(id: number): Promise<User> {
    const userDoc = await UserModel.findOne({ id }).select('-password_hash').lean();
    if (!userDoc) throw { status: 404, message: 'User not found' };

    const { _id, __v, ...user } = userDoc as any;
    return user as User;
  }

  static async createUser(
    data: { email: string; password?: string; full_name: string; role: string; department?: string },
    adminEmail: string,
    adminId: number
  ): Promise<User> {
    const existing = await UserModel.findOne({ email: data.email.toLowerCase().trim() });
    if (existing) {
      throw { status: 409, message: 'A user with this email address already exists.' };
    }

    const defaultPassword = data.password || 'Password123!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    const department = data.department || 'Engineering';
    const newId = await getNextSequenceValue('users');

    const created = await UserModel.create({
      id: newId,
      email: data.email.toLowerCase().trim(),
      password_hash: passwordHash,
      full_name: data.full_name,
      role: data.role || 'User',
      status: 'ACTIVE',
      department,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const userObj = created.toObject();
    const { password_hash, _id, __v, ...newUser } = userObj as any;

    await delCache('users:all');
    await delCache('dashboard:stats');

    await AuditLogService.createLog({
      userId: adminId,
      userEmail: adminEmail,
      action: 'USER_CREATED',
      resourceType: 'USER',
      resourceId: String(newUser.id),
      description: `Created new user ${newUser.full_name} (${newUser.email}) with role ${newUser.role}`
    });

    return newUser as User;
  }

  static async updateUser(id: number, data: Partial<User>, adminEmail: string, adminId: number): Promise<User> {
    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (data.full_name !== undefined) updatePayload.full_name = data.full_name;
    if (data.role !== undefined) updatePayload.role = data.role;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.department !== undefined) updatePayload.department = data.department;

    const updated = await UserModel.findOneAndUpdate(
      { id },
      { $set: updatePayload },
      { new: true }
    ).select('-password_hash').lean();

    if (!updated) throw { status: 404, message: 'User not found' };

    const { _id, __v, ...updatedUser } = updated as any;

    await delCache('users:all');
    await delCache(`user:profile:${id}`);
    await delCache('dashboard:stats');

    await AuditLogService.createLog({
      userId: adminId,
      userEmail: adminEmail,
      action: 'USER_UPDATED',
      resourceType: 'USER',
      resourceId: String(id),
      description: `Updated profile details for user #${id} (${updatedUser.email})`
    });

    return updatedUser as User;
  }

  static async deleteUser(id: number, adminEmail: string, adminId: number): Promise<void> {
    const res = await UserModel.deleteOne({ id });
    if (res.deletedCount === 0) throw { status: 404, message: 'User not found' };

    await delCache('users:all');
    await delCache(`user:profile:${id}`);
    await delCache('dashboard:stats');

    await AuditLogService.createLog({
      userId: adminId,
      userEmail: adminEmail,
      action: 'USER_DELETED',
      resourceType: 'USER',
      resourceId: String(id),
      description: `Deleted user record #${id}`
    });
  }
}
