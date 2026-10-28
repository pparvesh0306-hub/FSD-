import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { PrivilegedAccountsPage } from './pages/PrivilegedAccountsPage';
import { AccessRequestsPage } from './pages/AccessRequestsPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { AccessReviewsPage } from './pages/AccessReviewsPage';
import { UsersPage } from './pages/UsersPage';
import { CloudPlatformsPage } from './pages/CloudPlatformsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { CompliancePage } from './pages/CompliancePage';
import { SettingsPage } from './pages/SettingsPage';

const rolePathsMap: Record<string, string[]> = {
  'Admin': ['/', '/privileged-accounts', '/access-requests', '/approvals', '/access-reviews', '/users', '/cloud-platforms', '/audit-logs', '/compliance', '/settings'],
  'Security Officer': ['/', '/privileged-accounts', '/access-requests', '/access-reviews', '/audit-logs', '/compliance'],
  'Approver': ['/', '/access-requests', '/approvals', '/privileged-accounts', '/access-reviews'],
  'Auditor': ['/', '/audit-logs', '/compliance', '/access-reviews'],
  'User': ['/', '/access-requests', '/privileged-accounts', '/access-reviews']
};

const ProtectedLayout: React.FC<{ children: React.ReactNode; path: string }> = ({ children, path }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'var(--text-muted)' }}>
        Authenticating Aegis Governance Engine...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role || 'User';
  const allowedPaths = rolePathsMap[role] || rolePathsMap['User'];

  if (path !== '/' && !allowedPaths.includes(path)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        {children}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedLayout path="/">
            <Dashboard />
          </ProtectedLayout>
        }
      />
      <Route
        path="/privileged-accounts"
        element={
          <ProtectedLayout path="/privileged-accounts">
            <PrivilegedAccountsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/access-requests"
        element={
          <ProtectedLayout path="/access-requests">
            <AccessRequestsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/approvals"
        element={
          <ProtectedLayout path="/approvals">
            <ApprovalsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/access-reviews"
        element={
          <ProtectedLayout path="/access-reviews">
            <AccessReviewsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedLayout path="/users">
            <UsersPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/cloud-platforms"
        element={
          <ProtectedLayout path="/cloud-platforms">
            <CloudPlatformsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedLayout path="/audit-logs">
            <AuditLogsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/compliance"
        element={
          <ProtectedLayout path="/compliance">
            <CompliancePage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedLayout path="/settings">
            <SettingsPage />
          </ProtectedLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
