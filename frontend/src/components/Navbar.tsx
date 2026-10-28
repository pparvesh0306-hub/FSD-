import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Shield, LogOut, User as UserIcon, Bell, Database } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '0.85rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(6, 182, 212, 0.1)', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            <Database size={16} color="#06b6d4" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#06b6d4' }}>Active Governance Engine</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button className="btn btn-secondary btn-sm" style={{ position: 'relative' }} title="Notifications">
            <Bell size={16} />
            <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
          </button>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.25rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{user.full_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                  <span className="status-badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.3)', padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>
                    {user.role}
                  </span>
                </div>
              </div>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
                {user.full_name.charAt(0)}
              </div>
              <button onClick={logout} className="btn btn-secondary btn-sm" title="Sign Out" style={{ padding: '0.5rem' }}>
                <LogOut size={16} color="#ef4444" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
