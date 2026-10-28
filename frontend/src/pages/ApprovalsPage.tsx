import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { AccessRequest, Approval } from '../types';
import { CheckCircle2, XCircle, Clock, MessageSquare, Shield } from 'lucide-react';

export const ApprovalsPage: React.FC = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Decision Modal State
  const [selectedReq, setSelectedReq] = useState<AccessRequest | null>(null);
  const [decisionType, setDecisionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [comments, setComments] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, appRes] = await Promise.all([
        apiService.getAccessRequests(),
        apiService.getApprovals()
      ]);

      if (reqRes.success && reqRes.data) setRequests(reqRes.data);
      if (appRes.success && appRes.data) setApprovals(appRes.data);
    } catch (err) {
      console.error('Failed to fetch approvals data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDecisionModal = (req: AccessRequest, type: 'APPROVE' | 'REJECT') => {
    setSelectedReq(req);
    setDecisionType(type);
    setComments(type === 'APPROVE' ? 'Approved based on change management policy.' : 'Justification details insufficient.');
    setIsModalOpen(true);
  };

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    try {
      if (decisionType === 'APPROVE') {
        await apiService.approveRequest(selectedReq.id, comments);
      } else {
        await apiService.rejectRequest(selectedReq.id, comments);
      }

      setIsModalOpen(false);
      setSelectedReq(null);
      fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to submit approval decision');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const processedRequests = requests.filter(r => r.status !== 'PENDING');

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CheckCircle2 size={28} color="#06b6d4" />
            Access Approvals Queue
          </h1>
          <p className="page-subtitle">Authorization workspace for security leads & approvers to review elevation requests</p>
        </div>
      </div>

      {/* Pending Approval Cards */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Clock size={18} color="#f59e0b" />
        Pending Authorization Requests ({pendingRequests.length})
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {pendingRequests.map(req => (
          <div key={req.id} className="glass-panel glass-panel-glow">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#06b6d4', fontWeight: 700 }}>#{req.id}</span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.1rem 0' }}>{req.account_name}</h4>
                <span className="status-badge" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.3)', fontSize: '0.68rem' }}>
                  {req.platform_name || 'Cloud'}
                </span>
              </div>
              <span className="status-badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
                {req.access_level}
              </span>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.75rem 0' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Requester: {req.user_name || 'User'} ({req.user_email})</div>
              <div>Duration: <strong>{req.duration_hours} hours</strong></div>
              <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: 'var(--text-main)' }}>"{req.justification}"</div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button onClick={() => openDecisionModal(req, 'APPROVE')} className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }}>
                <CheckCircle2 size={16} /> Approve
              </button>
              <button onClick={() => openDecisionModal(req, 'REJECT')} className="btn btn-danger" style={{ flex: 1, padding: '0.5rem' }}>
                <XCircle size={16} /> Reject
              </button>
            </div>
          </div>
        ))}

        {pendingRequests.length === 0 && (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            No pending elevation requests awaiting decision.
          </div>
        )}
      </div>

      {/* Processed Approval Decisions */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MessageSquare size={18} color="#10b981" />
        Recent Authorization Decisions
      </h3>

      <div className="glass-panel">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Target Account</th>
                <th>Requester</th>
                <th>Privilege Level</th>
                <th>Decision</th>
                <th>Approver</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {processedRequests.map(req => {
                const app = approvals.find(a => a.request_id === req.id);
                return (
                  <tr key={req.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#{req.id}</td>
                    <td style={{ fontWeight: 600 }}>{req.account_name}</td>
                    <td>{req.user_name}</td>
                    <td>
                      <span className="status-badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
                        {req.access_level}
                      </span>
                    </td>
                    <td>
                      {req.status === 'APPROVED' ? (
                        <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>APPROVED</span>
                      ) : (
                        <span className="status-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.3)' }}>REJECTED</span>
                      )}
                    </td>
                    <td>{app?.approver_name || 'System Approver'}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{app?.comments || 'No comments provided'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Modal */}
      {isModalOpen && selectedReq && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {decisionType === 'APPROVE' ? 'Approve Access Elevation' : 'Reject Access Elevation'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleSubmitDecision}>
              <div className="modal-body">
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  <div><strong>Account:</strong> {selectedReq.account_name}</div>
                  <div><strong>Requester:</strong> {selectedReq.user_name} ({selectedReq.user_email})</div>
                  <div><strong>Duration:</strong> {selectedReq.duration_hours} Hours</div>
                  <div style={{ marginTop: '0.4rem', color: '#06b6d4' }}><strong>Justification:</strong> {selectedReq.justification}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Approver Comments</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button
                  type="submit"
                  className={decisionType === 'APPROVE' ? 'btn btn-primary' : 'btn btn-danger'}
                >
                  Confirm {decisionType === 'APPROVE' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
