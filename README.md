# Multi-Cloud Privileged Account Governance Platform (MERN Stack)

A enterprise-grade Multi-Cloud Privileged Account Governance Platform for managing, auditing, and reviewing identity access across AWS, Azure, and GCP.

## 🛠️ Technology Stack Summary

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: MongoDB + Mongoose
- **Supporting**: Redis (Caching & Session Store)
- **API**: REST API
- **Containerization**: Docker & Docker Compose

---

## 🔑 Demo Accounts

All demo accounts pre-seeded into MongoDB:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@example.com` | `Password123!` |
| **Security Officer** | `security@example.com` | `Password123!` |
| **Approver** | `approver@example.com` | `Password123!` |
| **Auditor** | `auditor@example.com` | `Password123!` |
| **User** | `user@example.com` | `Password123!` |

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```
*(or run `npm install` inside both `backend` and `frontend` folders)*

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure environment configuration includes:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/multi_cloud_governance
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=super_secret_jwt_key_identity_governance_2026_x90
VITE_API_URL=http://localhost:5000/api
```

### 3. Build & Verify TypeScript Compilation
```bash
npm run build
```

### 4. Running Locally
Start backend and frontend development servers:
```bash
# Start Backend REST API
npm run dev:backend

# Start Frontend App
npm run dev:frontend
```

---

## 🐳 Docker Setup

Run entire MERN stack (MongoDB, Redis, Backend, Frontend) with persistent volume:
```bash
docker-compose up --build -d
```

Access services at:
- **Frontend App**: [http://localhost:3000](http://localhost:3000) (or Vite dev at [http://localhost:5173](http://localhost:5173))
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **MongoDB**: `mongodb://localhost:27017/multi_cloud_governance`
- **Redis**: `localhost:6379`

---

## 📋 Main Platform Modules

- **Dashboard**: System overview stats, active users, cloud accounts, pending access reviews & real-time audit activity feed.
- **Users**: User lifecycle management with department & RBAC assignments.
- **Roles & Permissions**: Role matrix configuration with granular permission controls.
- **Privileged Accounts**: Multi-cloud privileged identity tracking for AWS, Azure, GCP.
- **Access Requests**: Just-in-time access elevation requests with custom justification & timeframe.
- **Approval Management**: Dual-approval workflow for DevOps and Security Officers.
- **Access Reviews**: Periodic access recertification and automatic revocation.
- **Audit Logs**: Immutable activity logs for security auditing.
- **Compliance Reports**: Automated compliance report generation (SOC2, ISO27001, HIPAA).
- **Cloud Platforms**: Synchronize and manage cloud environment connections.
