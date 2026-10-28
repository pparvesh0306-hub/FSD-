export interface User {
  id: number;
  email: string;
  password_hash?: string;
  full_name: string;
  role: string;
  status: string;
  department: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  created_at: string;
}

export interface CloudPlatform {
  id: number;
  name: string;
  provider: 'AWS' | 'Azure' | 'GCP';
  status: string;
  user_count: number;
  privileged_account_count: number;
  region: string;
  last_sync_at: string;
  created_at: string;
}

export interface PrivilegedAccount {
  id: number;
  user_id: number | null;
  user_name?: string;
  user_email?: string;
  cloud_platform_id: number;
  platform_name?: string;
  provider?: string;
  account_name: string;
  account_type: string;
  access_level: string;
  status: string;
  last_accessed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AccessRequest {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  privileged_account_id: number;
  account_name?: string;
  cloud_platform_id: number;
  platform_name?: string;
  access_level: string;
  justification: string;
  duration_hours: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  created_at: string;
  updated_at: string;
}

export interface Approval {
  id: number;
  request_id: number;
  approver_id: number;
  approver_name?: string;
  decision: 'APPROVED' | 'REJECTED';
  comments?: string;
  decided_at: string;
  created_at: string;
}

export interface AccessReview {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  privileged_account_id: number;
  account_name?: string;
  cloud_platform_id: number;
  platform_name?: string;
  access_level: string;
  reviewer_id?: number | null;
  reviewer_name?: string;
  status: 'PENDING' | 'APPROVED' | 'REVOKED';
  comments?: string;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number | null;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  description: string;
  ip_address: string;
  created_at: string;
}

export interface ComplianceReport {
  id: number;
  title: string;
  generated_by: number | null;
  generated_by_name?: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'WARNING';
  framework: string;
  summary: Record<string, any>;
  created_at: string;
}

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description: string;
  updated_at: string;
}

export interface AuthPayload {
  userId: number;
  email: string;
  role: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  cached?: boolean;
}
