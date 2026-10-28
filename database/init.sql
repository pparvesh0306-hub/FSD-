-- Multi-Cloud Privileged Account Governance Platform
-- Database Initialization Script

DROP TABLE IF EXISTS compliance_reports CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS access_reviews CASCADE;
DROP TABLE IF EXISTS approvals CASCADE;
DROP TABLE IF EXISTS access_requests CASCADE;
DROP TABLE IF EXISTS privileged_accounts CASCADE;
DROP TABLE IF EXISTS cloud_platforms CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'User',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    department VARCHAR(100) DEFAULT 'Engineering',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Roles Table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Permissions Table
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Role Permissions Mapping
CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- User Roles Mapping
CREATE TABLE user_roles (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Cloud Platforms Table
CREATE TABLE cloud_platforms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- AWS, Azure, GCP
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    user_count INTEGER DEFAULT 0,
    privileged_account_count INTEGER DEFAULT 0,
    region VARCHAR(50) DEFAULT 'us-east-1',
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Privileged Accounts Table
CREATE TABLE privileged_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    cloud_platform_id INTEGER REFERENCES cloud_platforms(id) ON DELETE CASCADE,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(100) NOT NULL, -- Root, IAM Admin, Service Account, Break-Glass
    access_level VARCHAR(50) NOT NULL, -- Full Admin, Read-Only, Security Admin, Billing Admin
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SUSPENDED
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Access Requests Table
CREATE TABLE access_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    privileged_account_id INTEGER REFERENCES privileged_accounts(id) ON DELETE CASCADE,
    cloud_platform_id INTEGER REFERENCES cloud_platforms(id) ON DELETE CASCADE,
    access_level VARCHAR(50) NOT NULL,
    justification TEXT NOT NULL,
    duration_hours INTEGER NOT NULL DEFAULT 8,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, EXPIRED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Approvals Table
CREATE TABLE approvals (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES access_requests(id) ON DELETE CASCADE,
    approver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    decision VARCHAR(50) NOT NULL, -- APPROVED, REJECTED
    comments TEXT,
    decided_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Access Reviews Table
CREATE TABLE access_reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    privileged_account_id INTEGER REFERENCES privileged_accounts(id) ON DELETE CASCADE,
    cloud_platform_id INTEGER REFERENCES cloud_platforms(id) ON DELETE CASCADE,
    access_level VARCHAR(50) NOT NULL,
    reviewer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REVOKED
    comments TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    description TEXT NOT NULL,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Compliance Reports Table
CREATE TABLE compliance_reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    generated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLIANT', -- COMPLIANT, NON_COMPLIANT, WARNING
    framework VARCHAR(100) DEFAULT 'SOC2', -- SOC2, ISO27001, HIPAA, CIS
    summary JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Settings Table
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal query speed
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_privileged_accounts_user ON privileged_accounts(user_id);
CREATE INDEX idx_access_requests_user ON access_requests(user_id);
CREATE INDEX idx_access_requests_status ON access_requests(status);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Initial Demo Data Seed
-- Password hash for 'Password123!' -> $2a$10$e8w.xM09L0tH1xV5K8JkU.eB9b.vGk0q5jV6Y8W8k3N9X5Z0W1Y2S
INSERT INTO users (email, password_hash, full_name, role, status, department) VALUES
('admin@example.com', '$2a$10$e8w.xM09L0tH1xV5K8JkU.eB9b.vGk0q5jV6Y8W8k3N9X5Z0W1Y2S', 'System Administrator', 'Admin', 'ACTIVE', 'Cybersecurity'),
('security@example.com', '$2a$10$e8w.xM09L0tH1xV5K8JkU.eB9b.vGk0q5jV6Y8W8k3N9X5Z0W1Y2S', 'Sarah Conner', 'Security Officer', 'ACTIVE', 'Information Security'),
('approver@example.com', '$2a$10$e8w.xM09L0tH1xV5K8JkU.eB9b.vGk0q5jV6Y8W8k3N9X5Z0W1Y2S', 'Alex Morgan', 'Approver', 'ACTIVE', 'DevOps Leadership'),
('auditor@example.com', '$2a$10$e8w.xM09L0tH1xV5K8JkU.eB9b.vGk0q5jV6Y8W8k3N9X5Z0W1Y2S', 'David Vance', 'Auditor', 'ACTIVE', 'Compliance & Risk'),
('user@example.com', '$2a$10$e8w.xM09L0tH1xV5K8JkU.eB9b.vGk0q5jV6Y8W8k3N9X5Z0W1Y2S', 'Jordan Lee', 'User', 'ACTIVE', 'Cloud Development');

-- Roles Seed
INSERT INTO roles (name, description) VALUES
('Admin', 'Full administrative access to manage users, roles, privileged accounts, and compliance'),
('Security Officer', 'Responsible for security auditing, access reviews, and governance policy compliance'),
('Approver', 'Authorized to approve or reject elevation of privilege access requests'),
('Auditor', 'Read-only audit access to system logs, governance reports, and history'),
('User', 'Standard user who can request elevated privileges and view owned access');

-- Permissions Seed
INSERT INTO permissions (code, name, description, category) VALUES
('users:manage', 'Manage Users', 'Create, update, and deactivate system users', 'User Management'),
('roles:manage', 'Manage Roles', 'Configure roles and assign permission matrices', 'Access Control'),
('privileged:manage', 'Manage Privileged Accounts', 'Create and assign cloud privileged accounts', 'Privileged Access'),
('requests:create', 'Create Access Requests', 'Submit requests for temporary elevated cloud access', 'Access Requests'),
('requests:approve', 'Approve Access Requests', 'Approve or reject pending access elevation requests', 'Approvals'),
('reviews:perform', 'Perform Access Reviews', 'Conduct periodic reviews and revoke unnecessary privileges', 'Governance'),
('audit:view', 'View Audit Logs', 'Inspect immutable audit logs across all platform activities', 'Audit & Compliance'),
('compliance:generate', 'Generate Compliance Reports', 'Compile and export SOC2/ISO compliance reports', 'Audit & Compliance');

-- Role Permissions Seed
-- Admin has all permissions (1-8)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
-- Security Officer (3, 6, 7, 8)
(2, 3), (2, 6), (2, 7), (2, 8),
-- Approver (4, 5)
(3, 4), (3, 5),
-- Auditor (7, 8)
(4, 7), (4, 8),
-- User (4)
(5, 4);

-- User Roles Seed
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

-- Cloud Platforms Seed
INSERT INTO cloud_platforms (name, provider, status, user_count, privileged_account_count, region) VALUES
('AWS Production Cloud', 'AWS', 'ACTIVE', 142, 18, 'us-east-1'),
('Microsoft Azure Enterprise', 'Azure', 'ACTIVE', 98, 12, 'eastus2'),
('Google Cloud Infrastructure', 'GCP', 'ACTIVE', 64, 8, 'us-central1');

-- Privileged Accounts Seed
INSERT INTO privileged_accounts (user_id, cloud_platform_id, account_name, account_type, access_level, status) VALUES
(1, 1, 'aws-root-admin', 'Root', 'Full Admin', 'ACTIVE'),
(1, 2, 'azure-global-admin', 'IAM Admin', 'Full Admin', 'ACTIVE'),
(2, 1, 'aws-secops-admin', 'IAM Admin', 'Security Admin', 'ACTIVE'),
(3, 3, 'gcp-devops-lead', 'Service Account', 'Full Admin', 'ACTIVE'),
(5, 1, 'aws-prod-deployer', 'Break-Glass', 'Read-Only', 'ACTIVE'),
(5, 2, 'azure-db-admin-temp', 'IAM Admin', 'Read-Only', 'ACTIVE');

-- Access Requests Seed
INSERT INTO access_requests (user_id, privileged_account_id, cloud_platform_id, access_level, justification, duration_hours, status) VALUES
(5, 1, 1, 'Full Admin', 'Hotfix deployment for production billing API service degradation', 4, 'PENDING'),
(5, 2, 2, 'Security Admin', 'Routine audit of Azure key vault secrets and access policies', 8, 'APPROVED'),
(2, 3, 3, 'Full Admin', 'Emergency maintenance on GCP Kubernetes cluster control plane', 12, 'REJECTED');

-- Approvals Seed
INSERT INTO approvals (request_id, approver_id, decision, comments) VALUES
(2, 3, 'APPROVED', 'Approved based on change management ticket #CHG-9402'),
(3, 3, 'REJECTED', 'Justification lacks approved ticket reference. Please resubmit with details.');

-- Access Reviews Seed
INSERT INTO access_reviews (user_id, privileged_account_id, cloud_platform_id, access_level, reviewer_id, status, comments) VALUES
(5, 1, 1, 'Full Admin', 2, 'PENDING', 'Quarterly IAM access review for production cloud accounts'),
(5, 2, 2, 'Read-Only', 2, 'APPROVED', 'Access verified necessary for DB read duties'),
(3, 3, 3, 'Full Admin', 2, 'REVOKED', 'DevOps Lead role transferred; account privilege revoked.');

-- Audit Logs Seed
INSERT INTO audit_logs (user_id, user_email, action, resource_type, resource_id, description, ip_address) VALUES
(1, 'admin@example.com', 'LOGIN', 'AUTH', '1', 'User logged in successfully', '192.168.1.10'),
(5, 'user@example.com', 'CREATE_REQUEST', 'ACCESS_REQUEST', '1', 'Submitted access request for AWS Root Admin access', '192.168.1.45'),
(3, 'approver@example.com', 'APPROVE_REQUEST', 'ACCESS_REQUEST', '2', 'Approved access request #2 with comments: Approved CHG-9402', '192.168.1.88'),
(2, 'security@example.com', 'ACCESS_REVIEW', 'PRIVILEGED_ACCOUNT', '3', 'Revoked privileged access for gcp-devops-lead', '192.168.1.22');

-- Compliance Reports Seed
INSERT INTO compliance_reports (title, generated_by, status, framework, summary) VALUES
('Q3 SOC2 Type II Cloud Identity Governance Audit', 2, 'COMPLIANT', 'SOC2', '{"totalAccounts": 38, "activeReviews": 15, "violations": 0, "passRate": "100%"}'),
('ISO 27001 Annex A.9 Access Control Assessment', 4, 'WARNING', 'ISO27001', '{"totalAccounts": 38, "activeReviews": 12, "violations": 2, "passRate": "94.7%"}');

-- System Settings Seed
INSERT INTO system_settings (key, value, description) VALUES
('SESSION_TIMEOUT_MINUTES', '60', 'Automatic JWT session expiration duration in minutes'),
('AUTO_APPROVAL_THRESHOLD_HOURS', '2', 'Maximum duration in hours for auto-approving read-only access'),
('ENFORCE_MFA_FOR_PRIVILEGED', 'true', 'Require MFA verification before granting elevated cloud access'),
('MAX_PENDING_REQUESTS_PER_USER', '3', 'Prevent spam by capping open pending access requests per user');
