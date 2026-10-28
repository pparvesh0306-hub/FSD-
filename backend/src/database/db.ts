import '../config/env';
import mongoose from 'mongoose';
import dns from 'dns';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  SEED_USERS,
  SEED_ROLES,
  SEED_PERMISSIONS,
  SEED_ROLE_PERMISSIONS,
  SEED_CLOUD_PLATFORMS,
  SEED_PRIVILEGED_ACCOUNTS,
  SEED_ACCESS_REQUESTS,
  SEED_APPROVALS,
  SEED_ACCESS_REVIEWS,
  SEED_AUDIT_LOGS,
  SEED_COMPLIANCE_REPORTS,
  SEED_SYSTEM_SETTINGS
} from './seedData';
import {
  UserModel,
  RoleModel,
  PermissionModel,
  RolePermissionModel,
  CloudPlatformModel,
  PrivilegedAccountModel,
  AccessRequestModel,
  ApprovalModel,
  AccessReviewModel,
  AuditLogModel,
  ComplianceReportModel,
  SystemSettingModel,
  initializeCounterIfNotExist
} from '../models';

// Configure DNS for optimal Node.js resolution on Windows
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // ignore
}

let isMongoConnected = false;
let memoryServer: MongoMemoryServer | null = null;

// Attach Mongoose Connection Event Listeners
mongoose.connection.on('connected', () => {
  isMongoConnected = true;
  console.log('[Mongoose Event] Connected to MongoDB database server.');
});

mongoose.connection.on('error', (err) => {
  isMongoConnected = false;
  console.error('[Mongoose Event] Database connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
  console.warn('[Mongoose Event] Disconnected from MongoDB database server.');
});

export const getMongoUri = (): string => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }
  return 'mongodb://localhost:27017/multi_cloud_governance';
};

export const sanitizeUri = (uri: string): string => {
  return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
};

export const initDatabase = async (): Promise<boolean> => {
  const mongoUri = getMongoUri();
  const safeUri = sanitizeUri(mongoUri);

  console.log(`[MongoDB] Attempting initial connection to ${safeUri}...`);

  try {
    // Attempt connecting to primary MongoDB Atlas database
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 6000
    });

    isMongoConnected = true;
    console.log(`[MongoDB] ✅ Connection established successfully to MongoDB Atlas (${safeUri})`);

    // Seed database if empty
    await seedDatabaseIfEmpty();
    return true;
  } catch (err: any) {
    console.warn(`[MongoDB] ⚠️ Could not connect to primary MongoDB Atlas cluster (${err.message})`);
    console.log(`[MongoDB] 🔄 Starting MongoMemoryServer fallback to guarantee connection readiness...`);

    try {
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      
      await mongoose.connect(memoryUri);
      isMongoConnected = true;
      console.log(`[MongoDB] ✅ Connection established successfully to MongoMemoryServer (${memoryUri})`);

      // Seed fallback in-memory database
      await seedDatabaseIfEmpty();
      return true;
    } catch (fallbackErr: any) {
      isMongoConnected = false;
      console.error(`[MongoDB] ❌ Failed to initialize database:`, fallbackErr.message);
      throw fallbackErr;
    }
  }
};

export const isUsingMongo = () => isMongoConnected;

async function seedDatabaseIfEmpty(): Promise<void> {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('[MongoDB] Database empty. Seeding initial demo data into MongoDB...');

      await UserModel.insertMany(SEED_USERS);
      await RoleModel.insertMany(SEED_ROLES);
      await PermissionModel.insertMany(SEED_PERMISSIONS);
      await RolePermissionModel.insertMany(SEED_ROLE_PERMISSIONS);
      await CloudPlatformModel.insertMany(SEED_CLOUD_PLATFORMS);
      await PrivilegedAccountModel.insertMany(SEED_PRIVILEGED_ACCOUNTS);
      await AccessRequestModel.insertMany(SEED_ACCESS_REQUESTS);
      await ApprovalModel.insertMany(SEED_APPROVALS);
      await AccessReviewModel.insertMany(SEED_ACCESS_REVIEWS);
      await AuditLogModel.insertMany(SEED_AUDIT_LOGS);
      await ComplianceReportModel.insertMany(SEED_COMPLIANCE_REPORTS);
      await SystemSettingModel.insertMany(SEED_SYSTEM_SETTINGS);

      // Initialize auto-increment sequence counters to match highest seed ID
      await initializeCounterIfNotExist('users', Math.max(...SEED_USERS.map(u => u.id)));
      await initializeCounterIfNotExist('roles', Math.max(...SEED_ROLES.map(r => r.id)));
      await initializeCounterIfNotExist('permissions', Math.max(...SEED_PERMISSIONS.map(p => p.id)));
      await initializeCounterIfNotExist('cloud_platforms', Math.max(...SEED_CLOUD_PLATFORMS.map(c => c.id)));
      await initializeCounterIfNotExist('privileged_accounts', Math.max(...SEED_PRIVILEGED_ACCOUNTS.map(a => a.id)));
      await initializeCounterIfNotExist('access_requests', Math.max(...SEED_ACCESS_REQUESTS.map(r => r.id)));
      await initializeCounterIfNotExist('approvals', Math.max(...SEED_APPROVALS.map(a => a.id)));
      await initializeCounterIfNotExist('access_reviews', Math.max(...SEED_ACCESS_REVIEWS.map(r => r.id)));
      await initializeCounterIfNotExist('audit_logs', Math.max(...SEED_AUDIT_LOGS.map(l => l.id)));
      await initializeCounterIfNotExist('compliance_reports', Math.max(...SEED_COMPLIANCE_REPORTS.map(r => r.id)));
      await initializeCounterIfNotExist('system_settings', Math.max(...SEED_SYSTEM_SETTINGS.map(s => s.id)));

      console.log('[MongoDB] ✅ Demo data successfully seeded into database!');
    }
  } catch (err: any) {
    console.error('[MongoDB] Error during seeding:', err.message);
  }
}
