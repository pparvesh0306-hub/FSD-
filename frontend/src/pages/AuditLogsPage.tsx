import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { AuditLog } from '../types';
import { ListFilter, Search, Shield, RefreshCw } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAuditLogs({
        search: search || undefined,
        action: actionFilter || undefined
      });
      if (res.success && res.data) setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ListFilter size={28} color="#06b6d4" />
            Immutable Audit Trail & Telemetry
          </h1>
          <p className="page-subtitle">Complete, tamper-evident security event logs across all identity elevation and governance operations</p>
        </div>
        <button onClick={fetchLogs} className="btn btn-secondary">
          <RefreshCw size={16} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleSearch} className="glass-panel" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            className="form-input"
            placeholder="Search description, email, or action code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ margin: 0 }}
          />
        </div>

        <select
          className="form-select"
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          style={{ width: 'auto', margin: 0 }}
        >
          <option value="">All Action Types</option>
          <option value="LOGIN">LOGIN</option>
          <option value="CREATE_REQUEST">CREATE_REQUEST</option>
          <option value="APPROVE_REQUEST">APPROVE_REQUEST</option>
          <option value="REJECT_REQUEST">REJECT_REQUEST</option>
          <option value="ACCESS_REVIEW">ACCESS_REVIEW</option>
          <option value="PRIVILEGED_ACCOUNT_CREATED">PRIVILEGED_ACCOUNT_CREATED</option>
          <option value="CLOUD_PLATFORM_SYNCED">CLOUD_PLATFORM_SYNCED</option>
        </select>

        <button type="submit" className="btn btn-primary">Filter Logs</button>
      </form>

      {/* Audit Log Table */}
      <div className="glass-panel">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>User / Operator</th>
                <th>Action Code</th>
                <th>Resource Target</th>
                <th>Log Description</th>
                <th>Client IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#{log.id}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 600 }}>{log.user_email}</td>
                  <td>
                    <span className="status-badge" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.3)', fontSize: '0.68rem' }}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {log.resource_type}:{log.resource_id}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{log.description}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>{log.ip_address}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No audit logs match the specified search parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
