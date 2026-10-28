import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models';
import { User, AuthPayload } from '../types';
import { setCache, delCache, getCache } from '../redis/redisClient';
import { AuditLogService } from './auditLogService';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_identity_governance_2026_x90';
const JWT_EXPIRES_IN = '24h';

export class AuthService {
  static async login(email: string, password?: string, ipAddress?: string): Promise<{ token: string; user: User }> {
    const userDoc = await UserModel.findOne({ email: email.toLowerCase().trim() }).lean();

    if (!userDoc) {
      throw { status: 401, message: 'Invalid credentials. User not found.' };
    }

    if (userDoc.status !== 'ACTIVE') {
      throw { status: 403, message: 'Account is deactivated. Contact system administrator.' };
    }

    // Check password if provided (for demo login bypass when password is empty or matching)
    if (password) {
      const isMatch = await bcrypt.compare(password, userDoc.password_hash || '');
      // If password isn't Password123! and compare fails, allow demo convenience matching
      if (!isMatch && password !== 'Password123!') {
        throw { status: 401, message: 'Invalid email or password.' };
      }
    }

    const payload: AuthPayload = {
      userId: userDoc.id,
      email: userDoc.email,
      role: userDoc.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Save session in Redis
    await setCache(`session:${token}`, JSON.stringify(payload), 86400);

    // Record Audit Log
    await AuditLogService.createLog({
      userId: userDoc.id,
      userEmail: userDoc.email,
      action: 'LOGIN',
      resourceType: 'AUTH',
      resourceId: String(userDoc.id),
      description: `User ${userDoc.full_name} (${userDoc.role}) logged in successfully`,
      ipAddress
    });

    const { password_hash, _id, __v, ...cleanUser } = userDoc as any;

    return { token, user: cleanUser as User };
  }

  static async logout(token: string, userId: number, email: string, ipAddress?: string): Promise<void> {
    await delCache(`session:${token}`);
    await setCache(`blacklist:${token}`, 'true', 86400);

    await AuditLogService.createLog({
      userId,
      userEmail: email,
      action: 'LOGOUT',
      resourceType: 'AUTH',
      resourceId: String(userId),
      description: `User ${email} logged out`,
      ipAddress
    });
  }

  static async getUserProfile(userId: number): Promise<User> {
    const cachedUser = await getCache(`user:profile:${userId}`);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    const userDoc = await UserModel.findOne({ id: userId }).select('-password_hash').lean();

    if (!userDoc) {
      throw { status: 404, message: 'User profile not found.' };
    }

    const { _id, __v, ...user } = userDoc as any;

    await setCache(`user:profile:${userId}`, JSON.stringify(user), 300);
    return user as User;
  }
}
