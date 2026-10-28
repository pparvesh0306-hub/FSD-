import axios from 'axios';
import {
  ApiResponse,
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
  DashboardStats
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Bearer Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('governance_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto redirect if on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('governance_token');
        localStorage.removeItem('governance_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || { success: false, message: error.message });
  }
);

export const apiService = {
  // Auth
  login: async (email: string, password?: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  logout: async (): Promise<ApiResponse> => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
  getMe: async (): Promise<ApiResponse<User>> => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  // Dashboard Stats
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },

  // Users
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    const res = await api.get('/users');
    return res.data;
  },
  createUser: async (data: any): Promise<ApiResponse<User>> => {
    const res = await api.post('/users', data);
    return res.data;
  },
  updateUser: async (id: number, data: any): Promise<ApiResponse<User>> => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },
  deleteUser: async (id: number): Promise<ApiResponse> => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },

  // Roles & Permissions
  getRoles: async (): Promise<ApiResponse<Role[]>> => {
    const res = await api.get('/roles');
    return res.data;
  },
  createRole: async (data: any): Promise<ApiResponse<Role>> => {
    const res = await api.post('/roles', data);
    return res.data;
  },
  updateRole: async (id: number, data: any): Promise<ApiResponse<Role>> => {
    const res = await api.put(`/roles/${id}`, data);
    return res.data;
  },
  deleteRole: async (id: number): Promise<ApiResponse> => {
    const res = await api.delete(`/roles/${id}`);
    return res.data;
  },
  getPermissions: async (): Promise<ApiResponse<Permission[]>> => {
    const res = await api.get('/permissions');
    return res.data;
  },

  // Privileged Accounts
  getPrivilegedAccounts: async (): Promise<ApiResponse<PrivilegedAccount[]>> => {
    const res = await api.get('/privileged-accounts');
    return res.data;
  },
  createPrivilegedAccount: async (data: any): Promise<ApiResponse<PrivilegedAccount>> => {
    const res = await api.post('/privileged-accounts', data);
    return res.data;
  },
  updatePrivilegedAccount: async (id: number, data: any): Promise<ApiResponse<PrivilegedAccount>> => {
    const res = await api.put(`/privileged-accounts/${id}`, data);
    return res.data;
  },
  deletePrivilegedAccount: async (id: number): Promise<ApiResponse> => {
    const res = await api.delete(`/privileged-accounts/${id}`);
    return res.data;
  },

  // Access Requests & Approvals
  getAccessRequests: async (): Promise<ApiResponse<AccessRequest[]>> => {
    const res = await api.get('/access-requests');
    return res.data;
  },
  createAccessRequest: async (data: any): Promise<ApiResponse<AccessRequest>> => {
    const res = await api.post('/access-requests', data);
    return res.data;
  },
  getApprovals: async (): Promise<ApiResponse<Approval[]>> => {
    const res = await api.get('/approvals');
    return res.data;
  },
  approveRequest: async (id: number, comments?: string): Promise<ApiResponse<AccessRequest>> => {
    const res = await api.post(`/approvals/${id}/approve`, { comments });
    return res.data;
  },
  rejectRequest: async (id: number, comments?: string): Promise<ApiResponse<AccessRequest>> => {
    const res = await api.post(`/approvals/${id}/reject`, { comments });
    return res.data;
  },

  // Access Reviews
  getAccessReviews: async (): Promise<ApiResponse<AccessReview[]>> => {
    const res = await api.get('/access-reviews');
    return res.data;
  },
  createAccessReview: async (data: any): Promise<ApiResponse<AccessReview>> => {
    const res = await api.post('/access-reviews', data);
    return res.data;
  },
  updateAccessReview: async (id: number, status: 'APPROVED' | 'REVOKED', comments?: string): Promise<ApiResponse<AccessReview>> => {
    const res = await api.put(`/access-reviews/${id}`, { status, comments });
    return res.data;
  },

  // Audit Logs
  getAuditLogs: async (params?: { action?: string; resourceType?: string; search?: string }): Promise<ApiResponse<AuditLog[]>> => {
    const res = await api.get('/audit-logs', { params });
    return res.data;
  },

  // Compliance Reports
  getComplianceReports: async (): Promise<ApiResponse<ComplianceReport[]>> => {
    const res = await api.get('/compliance-reports');
    return res.data;
  },
  generateComplianceReport: async (title?: string, framework?: string): Promise<ApiResponse<ComplianceReport>> => {
    const res = await api.post('/compliance-reports', { title, framework });
    return res.data;
  },

  // Cloud Platforms
  getCloudPlatforms: async (): Promise<ApiResponse<CloudPlatform[]>> => {
    const res = await api.get('/cloud-platforms');
    return res.data;
  },
  syncCloudPlatform: async (id: number): Promise<ApiResponse<CloudPlatform>> => {
    const res = await api.post(`/cloud-platforms/${id}/sync`);
    return res.data;
  },

  // System Settings
  getSettings: async (): Promise<ApiResponse<any>> => {
    const res = await api.get('/settings');
    return res.data;
  },
  updateSettings: async (settings: any[]): Promise<ApiResponse> => {
    const res = await api.put('/settings', { settings });
    return res.data;
  },
  clearCache: async (): Promise<ApiResponse> => {
    const res = await api.post('/settings/clear-cache');
    return res.data;
  }
};
