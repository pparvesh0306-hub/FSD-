import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  KeyRound,
  FileCheck,
  CheckCircle2,
  Eye,
  Users,
  Cloud,
  ListFilter,
  ShieldAlert,
  Settings,
  Shield
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'User';

  const allNavItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/privileged-accounts', label: 'Privileged Accounts', icon: KeyRound },
    { path: '/access-requests', label: 'Access Requests', icon: FileCheck },
    { path: '/approvals', label: 'Approvals', icon: CheckCircle2 },
    { path: '/access-reviews', label: 'Access Reviews', icon: Eye },
    { path: '/users', label: 'Users & Roles', icon: Users },
    { path: '/cloud-platforms', label: 'Cloud Platforms', icon: Cloud },
    { path: '/audit-logs', label: 'Audit Logs', icon: ListFilter },
    { path: '/compliance', label: 'Compliance Reports', icon: ShieldAlert },
    { path: '/settings', label: 'System Settings', icon: Settings }
  ];

  // Explicit Role-Based Navigation Specifications
  const rolePathsMap: Record<string, string[]> = {
    'Admin': [
      '/',
      '/privileged-accounts',
      '/access-requests',
      '/approvals',
      '/access-reviews',
      '/users',
      '/cloud-platforms',
      '/audit-logs',
      '/compliance',
      '/settings'
    ],
    'Security Officer': [
      '/',
      '/privileged-accounts',
      '/access-requests',
      '/access-reviews',
      '/audit-logs',
      '/compliance'
    ],
    'Approver': [
      '/',
      '/access-requests',
      '/approvals',
      '/privileged-accounts',
      '/access-reviews'
    ],
    'Auditor': [
      '/',
      '/audit-logs',
      '/compliance',
      '/access-reviews'
    ],
    'User': [
      '/',
      '/access-requests',
      '/privileged-accounts',
      '/access-reviews'
    ]
  };

  const allowedPaths = rolePathsMap[role] || rolePathsMap['User'];

  const filteredNavItems = allowedPaths
    .map(path => allNavItems.find(item => item.path === path))
    .filter((item): item is typeof allNavItems[0] => item !== undefined);

  return (
    <aside style={{ width: '260px', background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
          <Shield size={24} color="#000" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AEGIS
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
            CLOUD IDENTITY GOVERNANCE
          </div>
        </div>
      </div>

      <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        {filteredNavItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`
              }
              style={({ isActive }) => ({
                justifyContent: 'flex-start',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                color: isActive ? '#06b6d4' : 'var(--text-muted)',
                borderColor: isActive ? 'rgba(6, 182, 212, 0.4)' : 'transparent',
                boxShadow: 'none'
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
        Aegis PAM v1.0.0 • Multi-Cloud
      </div>
    </aside>
  );
};
