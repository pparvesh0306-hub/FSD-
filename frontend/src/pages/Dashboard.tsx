import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { DashboardStats } from '../types';
import {
  Users,
  Shield,
  Clock,
  CheckSquare,
  AlertTriangle,
  Cloud,
  ArrowUpRight,
  Activity,
  RefreshCw,
  Plus,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await apiService.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={36} color="#06b6d4" className="spin" style={{ marginBottom: '1rem' }} />
          <div style={{ color: 'var(--text-muted)' }}>Loading Multi-Cloud Identity Governance Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Activity size={28} color="#06b6d4" />
            Governance Command Center
          </h1>
          <p className="page-subtitle">Real-time privileged identity monitoring & access telemetry across multi-cloud environments</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchStats} className="btn btn-secondary" disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            <span>Sync Stats</span>
          </button>
          <Link to="/access-requests" className="btn btn-primary">
            <Plus size={16} />
            <span>Elevate Privilege</span>
          </Link>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="glass-panel glass-panel-glow">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Users</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-main)' }}>{stats?.totalUsers || 0}</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>{stats?.activeUsers || 0} Active Identities</div>
            </div>
            <div style={{ padding: '0.65rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              <Users size={24} color="#06b6d4" />
            </div>
          </div>
        </div>

        <div className="glass-panel glass-panel-glow">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Privileged Accounts</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-main)' }}>{stats?.privilegedAccounts || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Across AWS, Azure & GCP</div>
            </div>
            <div style={{ padding: '0.65rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '10px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
              <Shield size={24} color="#8b5cf6" />
            </div>
          </div>
        </div>

        <div className="glass-panel glass-panel-glow">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pending Approvals</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: stats?.pendingApprovals ? '#f59e0b' : 'var(--text-main)' }}>{stats?.pendingApprovals || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Awaiting decision</div>
            </div>
            <div style={{ padding: '0.65rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <Clock size={24} color="#f59e0b" />
            </div>
          </div>
        </div>

        <div className="glass-panel glass-panel-glow">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Access Reviews</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-main)' }}>{stats?.pendingAccessReviews || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Quarterly audits pending</div>
            </div>
            <div style={{ padding: '0.65rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <CheckSquare size={24} color="#10b981" />
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row - Cloud Platforms & Compliance */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        
        {/* Cloud Platforms Overview (Span 2) */}
        <div className="glass-panel" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cloud size={20} color="#06b6d4" />
              Connected Cloud Environments
            </h3>
            <Link to="/cloud-platforms" style={{ fontSize: '0.8rem', color: '#06b6d4', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Manage Platforms <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {stats?.cloudPlatforms.map(platform => (
              <div key={platform.id} style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{platform.name}</span>
                  <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)', padding: '0.15rem 0.5rem', fontSize: '0.68rem' }}>
                    {platform.provider}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.35rem 0' }}>
                  <span>Identities Managed</span>
                  <strong style={{ color: 'var(--text-main)' }}>{platform.user_count}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.35rem 0' }}>
                  <span>Privileged Accounts</span>
                  <strong style={{ color: '#06b6d4' }}>{platform.privileged_account_count}</strong>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  Region: {platform.region}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Widget */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#10b981" />
                Compliance Score
              </h3>
              <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                {stats?.complianceStatus?.status || 'COMPLIANT'}
              </span>
            </div>

            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: '3rem', fontWeight: 900, background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stats?.complianceStatus?.passRate || '100%'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Audit Compliance Pass Rate</div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Policy Violations</span>
              <strong style={{ color: stats?.complianceStatus?.violations ? '#ef4444' : '#10b981', fontSize: '1rem' }}>
                {stats?.complianceStatus?.violations || 0}
              </strong>
            </div>
          </div>

          <Link to="/compliance" className="btn btn-secondary" style={{ marginTop: '1.25rem', width: '100%' }}>
            View Full SOC2 / ISO Audit Reports
          </Link>
        </div>

      </div>

      {/* Audit Activity Stream */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="#8b5cf6" />
            Recent Security & Privilege Audit Stream
          </h3>
          <Link to="/audit-logs" style={{ fontSize: '0.8rem', color: '#06b6d4', textDecoration: 'none', fontWeight: 600 }}>
            View Audit Trail →
          </Link>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User / Operator</th>
                <th>Action</th>
                <th>Target Resource</th>
                <th>Description</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentAuditActivities?.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 600 }}>{log.user_email}</td>
                  <td>
                    <span className="status-badge" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.3)', fontSize: '0.7rem' }}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {log.resource_type}:{log.resource_id}
                    </span>
                  </td>
                  <td>{log.description}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>{log.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
