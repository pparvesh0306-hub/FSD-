import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { AccessReview } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Eye, CheckCircle2, ShieldOff, ShieldAlert } from 'lucide-react';

export const AccessReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'User';
  const canManage = role === 'Admin' || role === 'Security Officer';

  const [reviews, setReviews] = useState<AccessReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal state
  const [selectedReview, setSelectedReview] = useState<AccessReview | null>(null);
  const [actionType, setActionType] = useState<'APPROVED' | 'REVOKED'>('APPROVED');
  const [comments, setComments] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAccessReviews();
      if (res.success && res.data) setReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch access reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openReviewModal = (rev: AccessReview, type: 'APPROVED' | 'REVOKED') => {
    if (!canManage) return;
    setSelectedReview(rev);
    setActionType(type);
    setComments(type === 'APPROVED' ? 'Verified access requirement for active project role.' : 'Role transferred; unnecessary privilege revoked.');
    setIsModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview || !canManage) return;

    try {
      const res = await apiService.updateAccessReview(selectedReview.id, actionType, comments);
      if (res.success) {
        setIsModalOpen(false);
        setSelectedReview(null);
        fetchReviews();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to submit access review');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Eye size={28} color="#06b6d4" />
            {role === 'User' ? 'My Access Certification Reviews' : 'Periodic Access Certification Reviews'}
          </h1>
          <p className="page-subtitle">
            {role === 'User'
              ? 'View certification status and audit reviews for your assigned privileged cloud access'
              : 'Governance certification campaign to re-evaluate privilege necessity and revoke orphan permissions'}
          </p>
        </div>
      </div>

      <div className="glass-panel">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Review ID</th>
                <th>Target Identity</th>
                <th>Privileged Account</th>
                <th>Platform</th>
                <th>Access Level</th>
                <th>Review Status</th>
                <th>Assigned Reviewer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(rev => (
                <tr key={rev.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#{rev.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{rev.user_name || 'User'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rev.user_email}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#06b6d4' }}>{rev.account_name}</td>
                  <td>
                    <span className="status-badge" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                      {rev.platform_name || 'Cloud'}
                    </span>
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
                      {rev.access_level}
                    </span>
                  </td>
                  <td>
                    {rev.status === 'PENDING' && (
                      <span className="status-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }}>PENDING</span>
                    )}
                    {rev.status === 'APPROVED' && (
                      <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>CERTIFIED</span>
                    )}
                    {rev.status === 'REVOKED' && (
                      <span className="status-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.3)' }}>REVOKED</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{rev.reviewer_name || 'Security Lead'}</td>
                  <td>
                    {canManage && rev.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openReviewModal(rev, 'APPROVED')} className="btn btn-primary btn-sm">
                          <CheckCircle2 size={14} /> Certify
                        </button>
                        <button onClick={() => openReviewModal(rev, 'REVOKED')} className="btn btn-danger btn-sm">
                          <ShieldOff size={14} /> Revoke
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                        {rev.status === 'PENDING' ? 'Pending Certification' : `Completed ${rev.reviewed_at ? new Date(rev.reviewed_at).toLocaleDateString() : ''}`}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No access reviews found for your account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {isModalOpen && selectedReview && canManage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {actionType === 'APPROVED' ? 'Certify Privilege Access' : 'Revoke Privileged Access'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="modal-body">
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  <div><strong>User:</strong> {selectedReview.user_name} ({selectedReview.user_email})</div>
                  <div><strong>Account:</strong> {selectedReview.account_name}</div>
                  <div><strong>Privilege Level:</strong> {selectedReview.access_level}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Certification Comments / Audit Rationale</label>
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
                  className={actionType === 'APPROVED' ? 'btn btn-primary' : 'btn btn-danger'}
                >
                  Confirm {actionType === 'APPROVED' ? 'Certification' : 'Revocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
