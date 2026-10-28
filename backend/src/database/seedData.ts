import bcrypt from 'bcryptjs';
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

const passwordHash = bcrypt.hashSync('Password123!', 10);

export const SEED_USERS: User[] = [
  { id: 1, email: 'admin@example.com', password_hash: passwordHash, full_name: 'System Administrator', role: 'Admin', status: 'ACTIVE', department: 'Cybersecurity', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 2, email: 'security@example.com', password_hash: passwordHash, full_name: 'Sarah Conner', role: 'Security Officer', status: 'ACTIVE', department: 'Information Security', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 3, email: 'approver@example.com', password_hash: passwordHash, full_name: 'Alex Morgan', role: 'Approver', status: 'ACTIVE', department: 'DevOps Leadership', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 4, email: 'auditor@example.com', password_hash: passwordHash, full_name: 'David Vance', role: 'Auditor', status: 'ACTIVE', department: 'Compliance & Risk', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 5, email: 'user@example.com', password_hash: passwordHash, full_name: 'Jordan Lee', role: 'User', status: 'ACTIVE', department: 'Cloud Development', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

export const SEED_ROLES: Role[] = [
  { id: 1, name: 'Admin', description: 'Full administrative access to manage users, roles, privileged accounts, and compliance', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 2, name: 'Security Officer', description: 'Responsible for security auditing, access reviews, and governance policy compliance', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 3, name: 'Approver', description: 'Authorized to approve or reject elevation of privilege access requests', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 4, name: 'Auditor', description: 'Read-only audit access to system logs, governance reports, and history', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 5, name: 'User', description: 'Standard user who can request elevated privileges and view owned access', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

export const SEED_PERMISSIONS: Permission[] = [
  { id: 1, code: 'users:manage', name: 'Manage Users', description: 'Create, update, and deactivate system users', category: 'User Management', created_at: new Date().toISOString() },
  { id: 2, code: 'roles:manage', name: 'Manage Roles', description: 'Configure roles and assign permission matrices', category: 'Access Control', created_at: new Date().toISOString() },
  { id: 3, code: 'privileged:manage', name: 'Manage Privileged Accounts', description: 'Create and assign cloud privileged accounts', category: 'Privileged Access', created_at: new Date().toISOString() },
  { id: 4, code: 'requests:create', name: 'Create Access Requests', description: 'Submit requests for temporary elevated cloud access', category: 'Access Requests', created_at: new Date().toISOString() },
  { id: 5, code: 'requests:approve', name: 'Approve Access Requests', description: 'Approve or reject pending access elevation requests', category: 'Approvals', created_at: new Date().toISOString() },
  { id: 6, code: 'reviews:perform', name: 'Perform Access Reviews', description: 'Conduct periodic reviews and revoke unnecessary privileges', category: 'Governance', created_at: new Date().toISOString() },
  { id: 7, code: 'audit:view', name: 'View Audit Logs', description: 'Inspect immutable audit logs across all platform activities', category: 'Audit & Compliance', created_at: new Date().toISOString() },
  { id: 8, code: 'compliance:generate', name: 'Generate Compliance Reports', description: 'Compile and export SOC2/ISO compliance reports', category: 'Audit & Compliance', created_at: new Date().toISOString() }
];

export const SEED_ROLE_PERMISSIONS = [
  { role_id: 1, permission_id: 1 }, { role_id: 1, permission_id: 2 }, { role_id: 1, permission_id: 3 }, { role_id: 1, permission_id: 4 }, { role_id: 1, permission_id: 5 }, { role_id: 1, permission_id: 6 }, { role_id: 1, permission_id: 7 }, { role_id: 1, permission_id: 8 },
  { role_id: 2, permission_id: 3 }, { role_id: 2, permission_id: 6 }, { role_id: 2, permission_id: 7 }, { role_id: 2, permission_id: 8 },
  { role_id: 3, permission_id: 4 }, { role_id: 3, permission_id: 5 },
  { role_id: 4, permission_id: 7 }, { role_id: 4, permission_id: 8 },
  { role_id: 5, permission_id: 4 }
];

export const SEED_CLOUD_PLATFORMS: CloudPlatform[] = [
  { id: 1, name: 'AWS Production Cloud', provider: 'AWS', status: 'ACTIVE', user_count: 142, privileged_account_count: 18, region: 'us-east-1', last_sync_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 2, name: 'Microsoft Azure Enterprise', provider: 'Azure', status: 'ACTIVE', user_count: 98, privileged_account_count: 12, region: 'eastus2', last_sync_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 3, name: 'Google Cloud Infrastructure', provider: 'GCP', status: 'ACTIVE', user_count: 64, privileged_account_count: 8, region: 'us-central1', last_sync_at: new Date().toISOString(), created_at: new Date().toISOString() }
];

export const SEED_PRIVILEGED_ACCOUNTS: PrivilegedAccount[] = [
  { id: 1, user_id: 1, cloud_platform_id: 1, account_name: 'aws-root-admin', account_type: 'Root', access_level: 'Full Admin', status: 'ACTIVE', last_accessed_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 2, user_id: 1, cloud_platform_id: 2, account_name: 'azure-global-admin', account_type: 'IAM Admin', access_level: 'Full Admin', status: 'ACTIVE', last_accessed_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 3, user_id: 2, cloud_platform_id: 1, account_name: 'aws-secops-admin', account_type: 'IAM Admin', access_level: 'Security Admin', status: 'ACTIVE', last_accessed_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 4, user_id: 3, cloud_platform_id: 3, account_name: 'gcp-devops-lead', account_type: 'Service Account', access_level: 'Full Admin', status: 'ACTIVE', last_accessed_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 5, user_id: 5, cloud_platform_id: 1, account_name: 'aws-prod-deployer', account_type: 'Break-Glass', access_level: 'Read-Only', status: 'ACTIVE', last_accessed_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 6, user_id: 5, cloud_platform_id: 2, account_name: 'azure-db-admin-temp', account_type: 'IAM Admin', access_level: 'Read-Only', status: 'ACTIVE', last_accessed_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

export const SEED_ACCESS_REQUESTS: AccessRequest[] = [
  { id: 1, user_id: 5, privileged_account_id: 1, cloud_platform_id: 1, access_level: 'Full Admin', justification: 'Hotfix deployment for production billing API service degradation', duration_hours: 4, status: 'PENDING', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 2, user_id: 5, privileged_account_id: 2, cloud_platform_id: 2, access_level: 'Security Admin', justification: 'Routine audit of Azure key vault secrets and access policies', duration_hours: 8, status: 'APPROVED', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 3, user_id: 2, privileged_account_id: 4, cloud_platform_id: 3, access_level: 'Full Admin', justification: 'Emergency maintenance on GCP Kubernetes cluster control plane', duration_hours: 12, status: 'REJECTED', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

export const SEED_APPROVALS: Approval[] = [
  { id: 1, request_id: 2, approver_id: 3, decision: 'APPROVED', comments: 'Approved based on change management ticket #CHG-9402', decided_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 2, request_id: 3, approver_id: 3, decision: 'REJECTED', comments: 'Justification lacks approved ticket reference. Please resubmit with details.', decided_at: new Date().toISOString(), created_at: new Date().toISOString() }
];

export const SEED_ACCESS_REVIEWS: AccessReview[] = [
  { id: 1, user_id: 5, privileged_account_id: 1, cloud_platform_id: 1, access_level: 'Full Admin', reviewer_id: 2, status: 'PENDING', comments: 'Quarterly IAM access review for production cloud accounts', reviewed_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 2, user_id: 5, privileged_account_id: 2, cloud_platform_id: 2, access_level: 'Read-Only', reviewer_id: 2, status: 'APPROVED', comments: 'Access verified necessary for DB read duties', reviewed_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 3, user_id: 3, privileged_account_id: 4, cloud_platform_id: 3, access_level: 'Full Admin', reviewer_id: 2, status: 'REVOKED', comments: 'DevOps Lead role transferred; account privilege revoked.', reviewed_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  { id: 1, user_id: 1, user_email: 'admin@example.com', action: 'LOGIN', resource_type: 'AUTH', resource_id: '1', description: 'User logged in successfully', ip_address: '192.168.1.10', created_at: new Date().toISOString() },
  { id: 2, user_id: 5, user_email: 'user@example.com', action: 'CREATE_REQUEST', resource_type: 'ACCESS_REQUEST', resource_id: '1', description: 'Submitted access request for AWS Root Admin access', ip_address: '192.168.1.45', created_at: new Date().toISOString() },
  { id: 3, user_id: 3, user_email: 'approver@example.com', action: 'APPROVE_REQUEST', resource_type: 'ACCESS_REQUEST', resource_id: '2', description: 'Approved access request #2 with comments: Approved CHG-9402', ip_address: '192.168.1.88', created_at: new Date().toISOString() },
  { id: 4, user_id: 2, user_email: 'security@example.com', action: 'ACCESS_REVIEW', resource_type: 'PRIVILEGED_ACCOUNT', resource_id: '4', description: 'Revoked privileged access for gcp-devops-lead', ip_address: '192.168.1.22', created_at: new Date().toISOString() }
];

export const SEED_COMPLIANCE_REPORTS: ComplianceReport[] = [
  { id: 1, title: 'Q3 SOC2 Type II Cloud Identity Governance Audit', generated_by: 2, status: 'COMPLIANT', framework: 'SOC2', summary: { totalAccounts: 38, activeReviews: 15, violations: 0, passRate: '100%' }, created_at: new Date().toISOString() },
  { id: 2, title: 'ISO 27001 Annex A.9 Access Control Assessment', generated_by: 4, status: 'WARNING', framework: 'ISO27001', summary: { totalAccounts: 38, activeReviews: 12, violations: 2, passRate: '94.7%' }, created_at: new Date().toISOString() }
];

export const SEED_SYSTEM_SETTINGS: SystemSetting[] = [
  { id: 1, key: 'SESSION_TIMEOUT_MINUTES', value: '60', description: 'Automatic JWT session expiration duration in minutes', updated_at: new Date().toISOString() },
  { id: 2, key: 'AUTO_APPROVAL_THRESHOLD_HOURS', value: '2', description: 'Maximum duration in hours for auto-approving read-only access', updated_at: new Date().toISOString() },
  { id: 3, key: 'ENFORCE_MFA_FOR_PRIVILEGED', value: 'true', description: 'Require MFA verification before granting elevated cloud access', updated_at: new Date().toISOString() },
  { id: 4, key: 'MAX_PENDING_REQUESTS_PER_USER', value: '3', description: 'Prevent spam by capping open pending access requests per user', updated_at: new Date().toISOString() }
];
