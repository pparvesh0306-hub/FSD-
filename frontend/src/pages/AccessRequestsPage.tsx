import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { AccessRequest, PrivilegedAccount } from '../types';
import { FileCheck, Plus, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const AccessRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [accounts, setAccounts] = useState<PrivilegedAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    privileged_account_id: '',
    access_level: 'Full Admin',
    justification: '',
    duration_hours: '4'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, accRes] = await Promise.all([
        apiService.getAccessRequests(),
        apiService.getPrivilegedAccounts()
      ]);

      if (reqRes.success && reqRes.data) setRequests(reqRes.data);
      if (accRes.success && accRes.data) {
        setAccounts(accRes.data);
        const firstId = accRes.data[0]?.id;
        if (firstId !== undefined) {
          setFormData(prev => ({ ...prev, privileged_account_id: String(firstId) }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch access requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedAcc = accounts.find(a => String(a.id) === formData.privileged_account_id);
      const payload = {
        privileged_account_id: Number(formData.privileged_account_id),
        cloud_platform_id: selectedAcc ? selectedAcc.cloud_platform_id : 1,
        access_level: formData.access_level,
        justification: formData.justification,
        duration_hours: Number(formData.duration_hours)
      };

      const res = await apiService.createAccessRequest(payload);
      if (res.success) {
        setIsModalOpen(false);
        setFormData(prev => ({ ...prev, justification: '' }));
        fetchData();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to submit access request');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}><CheckCircle2 size={12} /> APPROVED</span>;
      case 'REJECTED':
        return <span className="status-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.3)' }}><XCircle size={12} /> REJECTED</span>;
      case 'PENDING':
        return <span className="status-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }}><Clock size={12} /> PENDING</span>;
      default:
        return <span className="status-badge" style={{ background: 'rgba(100, 116, 139, 0.15)', color: '#64748b', borderColor: 'rgba(100, 116, 139, 0.3)' }}>{status}</span>;
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FileCheck size={28} color="#06b6d4" />
            Privilege Elevation Requests
          </h1>
          <p className="page-subtitle">Just-In-Time temporary cloud access elevation requests & automated ticket approvals</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Request Elevated Access</span>
        </button>
      </div>

      <div className="glass-panel">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Requester</th>
                <th>Target Account</th>
                <th>Platform</th>
                <th>Requested Privilege</th>
                <th>Duration</th>
                <th>Justification</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#{req.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{req.user_name || 'User'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.user_email}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#06b6d4' }}>{req.account_name}</td>
                  <td>
                    <span className="status-badge" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                      {req.platform_name || 'Cloud'}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
                      {req.access_level}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{req.duration_hours} hours</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '280px' }}>{req.justification}</td>
                  <td>{getStatusBadge(req.status)}</td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No access requests submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Submit Privilege Elevation Request</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleCreateRequest}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Target Privileged Account</label>
                  <select
                    className="form-select"
                    value={formData.privileged_account_id}
                    onChange={e => setFormData({ ...formData, privileged_account_id: e.target.value })}
                    required
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.account_name} ({a.platform_name || 'Cloud'})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Requested Privilege Level</label>
                  <select
                    className="form-select"
                    value={formData.access_level}
                    onChange={e => setFormData({ ...formData, access_level: e.target.value })}
                  >
                    <option value="Full Admin">Full Admin</option>
                    <option value="Security Admin">Security Admin</option>
                    <option value="DevOps Lead">DevOps Lead</option>
                    <option value="Read-Only">Read-Only</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Duration (Hours)</label>
                  <select
                    className="form-select"
                    value={formData.duration_hours}
                    onChange={e => setFormData({ ...formData, duration_hours: e.target.value })}
                  >
                    <option value="2">2 Hours (Auto-Approval Threshold)</option>
                    <option value="4">4 Hours</option>
                    <option value="8">8 Hours (Standard Shift)</option>
                    <option value="12">12 Hours (Emergency Maintenance)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Business Justification / Ticket Reference</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Describe business reason and reference Jira/ServiceNow ticket #..."
                    value={formData.justification}
                    onChange={e => setFormData({ ...formData, justification: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
