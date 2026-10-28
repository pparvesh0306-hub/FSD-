import mongoose, { Schema, Document } from 'mongoose';
import {
  User,
  Role,
  Permission,
  CloudPlatform,
  PrivilegedAccount,
  AccessRequest,
  Approval,
  AccessReview,
  AuditLog,
  ComplianceReport,
  SystemSetting
} from '../types';

// Counter Model for Auto-Incrementing Numeric IDs
export interface ICounter extends Document {
  _id: any;
  seq: number;
}

const CounterSchema: Schema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

export const CounterModel = mongoose.model<ICounter>('Counter', CounterSchema);

export async function getNextSequenceValue(sequenceName: string): Promise<number> {
  const sequenceDocument = await CounterModel.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.seq;
}

export async function initializeCounterIfNotExist(sequenceName: string, initialSeq: number): Promise<void> {
  const existing = await CounterModel.findById(sequenceName);
  if (!existing) {
    await CounterModel.create({ _id: sequenceName, seq: initialSeq });
  } else if (existing.seq < initialSeq) {
    existing.seq = initialSeq;
    await existing.save();
  }
}

// User Model
export interface IUserDocument extends Omit<User, 'id'>, Document {
  id: number;
}

const UserSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  full_name: { type: String, required: true },
  role: { type: String, required: true, default: 'User' },
  status: { type: String, required: true, default: 'ACTIVE' },
  department: { type: String, default: 'Engineering' },
  created_at: { type: String, default: () => new Date().toISOString() },
  updated_at: { type: String, default: () => new Date().toISOString() }
});

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);

// Role Model
export interface IRoleDocument extends Omit<Role, 'id'>, Document {
  id: number;
}

const RoleSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  description: { type: String },
  created_at: { type: String, default: () => new Date().toISOString() },
  updated_at: { type: String, default: () => new Date().toISOString() }
});

export const RoleModel = mongoose.model<IRoleDocument>('Role', RoleSchema);

// Permission Model
export interface IPermissionDocument extends Omit<Permission, 'id'>, Document {
  id: number;
}

const PermissionSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  created_at: { type: String, default: () => new Date().toISOString() }
});

export const PermissionModel = mongoose.model<IPermissionDocument>('Permission', PermissionSchema);

// RolePermission Model
export interface IRolePermissionDocument extends Document {
  role_id: number;
  permission_id: number;
}

const RolePermissionSchema: Schema = new Schema({
  role_id: { type: Number, required: true },
  permission_id: { type: Number, required: true }
});

RolePermissionSchema.index({ role_id: 1, permission_id: 1 }, { unique: true });

export const RolePermissionModel = mongoose.model<IRolePermissionDocument>('RolePermission', RolePermissionSchema);

// CloudPlatform Model
export interface ICloudPlatformDocument extends Omit<CloudPlatform, 'id'>, Document {
  id: number;
}

const CloudPlatformSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  provider: { type: String, required: true, enum: ['AWS', 'Azure', 'GCP'] },
  status: { type: String, default: 'ACTIVE' },
  user_count: { type: Number, default: 0 },
  privileged_account_count: { type: Number, default: 0 },
  region: { type: String, default: 'us-east-1' },
  last_sync_at: { type: String, default: () => new Date().toISOString() },
  created_at: { type: String, default: () => new Date().toISOString() }
});

export const CloudPlatformModel = mongoose.model<ICloudPlatformDocument>('CloudPlatform', CloudPlatformSchema);

// PrivilegedAccount Model
export interface IPrivilegedAccountDocument extends Omit<PrivilegedAccount, 'id'>, Document {
  id: number;
}

const PrivilegedAccountSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  user_id: { type: Number, default: null },
  cloud_platform_id: { type: Number, required: true },
  account_name: { type: String, required: true },
  account_type: { type: String, required: true },
  access_level: { type: String, required: true },
  status: { type: String, default: 'ACTIVE' },
  last_accessed_at: { type: String },
  created_at: { type: String, default: () => new Date().toISOString() },
  updated_at: { type: String, default: () => new Date().toISOString() }
});

export const PrivilegedAccountModel = mongoose.model<IPrivilegedAccountDocument>('PrivilegedAccount', PrivilegedAccountSchema);

// AccessRequest Model
export interface IAccessRequestDocument extends Omit<AccessRequest, 'id'>, Document {
  id: number;
}

const AccessRequestSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  user_id: { type: Number, required: true },
  privileged_account_id: { type: Number, required: true },
  cloud_platform_id: { type: Number, required: true },
  access_level: { type: String, required: true },
  justification: { type: String, required: true },
  duration_hours: { type: Number, required: true, default: 8 },
  status: { type: String, required: true, default: 'PENDING', enum: ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'] },
  created_at: { type: String, default: () => new Date().toISOString() },
  updated_at: { type: String, default: () => new Date().toISOString() }
});

export const AccessRequestModel = mongoose.model<IAccessRequestDocument>('AccessRequest', AccessRequestSchema);

// Approval Model
export interface IApprovalDocument extends Omit<Approval, 'id'>, Document {
  id: number;
}

const ApprovalSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  request_id: { type: Number, required: true },
  approver_id: { type: Number, required: true },
  decision: { type: String, required: true, enum: ['APPROVED', 'REJECTED'] },
  comments: { type: String },
  decided_at: { type: String, default: () => new Date().toISOString() },
  created_at: { type: String, default: () => new Date().toISOString() }
});

export const ApprovalModel = mongoose.model<IApprovalDocument>('Approval', ApprovalSchema);

// AccessReview Model
export interface IAccessReviewDocument extends Omit<AccessReview, 'id'>, Document {
  id: number;
}

const AccessReviewSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  user_id: { type: Number, required: true },
  privileged_account_id: { type: Number, required: true },
  cloud_platform_id: { type: Number, required: true },
  access_level: { type: String, required: true },
  reviewer_id: { type: Number, default: null },
  status: { type: String, required: true, default: 'PENDING', enum: ['PENDING', 'APPROVED', 'REVOKED'] },
  comments: { type: String },
  reviewed_at: { type: String, default: null },
  created_at: { type: String, default: () => new Date().toISOString() },
  updated_at: { type: String, default: () => new Date().toISOString() }
});

export const AccessReviewModel = mongoose.model<IAccessReviewDocument>('AccessReview', AccessReviewSchema);

// AuditLog Model
export interface IAuditLogDocument extends Omit<AuditLog, 'id'>, Document {
  id: number;
}

const AuditLogSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  user_id: { type: Number, default: null },
  user_email: { type: String, required: true },
  action: { type: String, required: true },
  resource_type: { type: String, required: true },
  resource_id: { type: String, default: 'N/A' },
  description: { type: String, required: true },
  ip_address: { type: String, default: '127.0.0.1' },
  created_at: { type: String, default: () => new Date().toISOString() }
});

export const AuditLogModel = mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);

// ComplianceReport Model
export interface IComplianceReportDocument extends Omit<ComplianceReport, 'id'>, Document {
  id: number;
}

const ComplianceReportSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  generated_by: { type: Number, default: null },
  status: { type: String, required: true, enum: ['COMPLIANT', 'NON_COMPLIANT', 'WARNING'], default: 'COMPLIANT' },
  framework: { type: String, default: 'SOC2' },
  summary: { type: Schema.Types.Mixed, required: true },
  created_at: { type: String, default: () => new Date().toISOString() }
});

export const ComplianceReportModel = mongoose.model<IComplianceReportDocument>('ComplianceReport', ComplianceReportSchema);

// SystemSetting Model
export interface ISystemSettingDocument extends Omit<SystemSetting, 'id'>, Document {
  id: number;
}

const SystemSettingSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
  description: { type: String },
  updated_at: { type: String, default: () => new Date().toISOString() }
});

export const SystemSettingModel = mongoose.model<ISystemSettingDocument>('SystemSetting', SystemSettingSchema);
