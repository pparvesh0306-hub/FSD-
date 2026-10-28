import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { PrivilegedAccount, CloudPlatform, User } from '../types';
import { KeyRound, Plus, Filter, Search, Edit2, Trash2, Shield, RefreshCw } from 'lucide-react';

export const PrivilegedAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<PrivilegedAccount[]>([]);
  const [platforms, setPlatforms] = useState<CloudPlatform[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterPlatform, setFilterPlatform] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PrivilegedAccount | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    user_id: '',
    cloud_platform_id: '1',
    account_name: '',
    account_type: 'IAM Admin',
    access_level: 'Full Admin'
  });

  const [editData, setEditData] = useState({
    access_level: '',
    status: 'ACTIVE'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accRes, platRes, userRes] = await Promise.all([
        apiService.getPrivilegedAccounts(),
        apiService.getCloudPlatforms(),
        apiService.getUsers()
      ]);

      if (accRes.success && accRes.data) setAccounts(accRes.data);
      if (platRes.success && platRes.data) setPlatforms(platRes.data);
      if (userRes.success && userRes.data) setUsers(userRes.data);
    } catch (err) {
      console.error('Failed to fetch privileged accounts data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        user_id: formData.user_id ? Number(formData.user_id) : null,
        cloud_platform_id: Number(formData.cloud_platform_id),
        account_name: formData.account_name,
        account_type: formData.account_type,
        access_level: formData.access_level
      };

      const res = await apiService.createPrivilegedAccount(payload);
      if (res.success) {
        setIsCreateOpen(false);
        setFormData({ user_id: '', cloud_platform_id: '1', account_name: '', account_type: 'IAM Admin', access_level: 'Full Admin' });
        fetchData();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to create privileged account');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    try {
      const res = await apiService.updatePrivilegedAccount(selectedAccount.id, editData);
      if (res.success) {
        setIsEditOpen(false);
        setSelectedAccount(null);
        fetchData();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to update privileged account');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this privileged account?')) return;
    try {
      const res = await apiService.deletePrivilegedAccount(id);
      if (res.success) {
        fetchData();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to delete account');
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchesPlatform = filterPlatform === 'ALL' || String(acc.cloud_platform_id) === filterPlatform;
    const matchesSearch =
      acc.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.user_name && acc.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (acc.platform_name && acc.platform_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPlatform && matchesSearch;
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <KeyRound size={28} color="#06b6d4" />
            Privileged Cloud Accounts
          </h1>
          <p className="page-subtitle">Inventory and lifecycle management of root, break-glass, and administrative cloud accounts</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Register Privileged Account</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            className="form-input"
            placeholder="Search account name, assigned user, platform..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ margin: 0 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="#64748b" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Platform:</span>
          <select
            className="form-select"
            value={filterPlatform}
            onChange={e => setFilterPlatform(e.target.value)}
            style={{ width: 'auto', margin: 0 }}
          >
            <option value="ALL">All Platforms</option>
            {platforms.map(p => (
              <option key={p.id} value={String(p.id)}>{p.name} ({p.provider})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="glass-panel">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Account Identifier</th>
                <th>Cloud Provider</th>
                <th>Account Type</th>
                <th>Access Level</th>
                <th>Assigned User</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map(acc => (
                <tr key={acc.id}>
                  <td style={{ fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Shield size={16} color="#06b6d4" />
                      <span>{acc.account_name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                      {acc.provider || acc.platform_name || 'Cloud'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{acc.account_type}</td>
                  <td>
                    <span className="status-badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
                      {acc.access_level}
                    </span>
                  </td>
                  <td>
                    {acc.user_name && acc.user_name !== 'Unassigned' ? (
                      <div>
                        <div style={{ fontWeight: 600 }}>{acc.user_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{acc.user_email}</div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                      {acc.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setSelectedAccount(acc);
                          setEditData({ access_level: acc.access_level, status: acc.status });
                          setIsEditOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        title="Edit Account"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(acc.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete Account"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No privileged accounts match the specified criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Account Modal */}
      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Register Privileged Cloud Account</h3>
              <button onClick={() => setIsCreateOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Account Name / IAM ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. aws-prod-admin, azure-breakglass"
                    value={formData.account_name}
                    onChange={e => setFormData({ ...formData, account_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Cloud Platform</label>
                  <select
                    className="form-select"
                    value={formData.cloud_platform_id}
                    onChange={e => setFormData({ ...formData, cloud_platform_id: e.target.value })}
                  >
                    {platforms.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.provider})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Account Category</label>
                  <select
                    className="form-select"
                    value={formData.account_type}
                    onChange={e => setFormData({ ...formData, account_type: e.target.value })}
                  >
                    <option value="Root">Root Admin</option>
                    <option value="IAM Admin">IAM Admin</option>
                    <option value="Break-Glass">Break-Glass Emergency</option>
                    <option value="Service Account">Service Account</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Access Privilege Level</label>
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
                  <label className="form-label">Assigned User (Optional)</label>
                  <select
                    className="form-select"
                    value={formData.user_id}
                    onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {isEditOpen && selectedAccount && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Edit Privileged Account: {selectedAccount.account_name}</h3>
              <button onClick={() => setIsEditOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Access Level</label>
                  <select
                    className="form-select"
                    value={editData.access_level}
                    onChange={e => setEditData({ ...editData, access_level: e.target.value })}
                  >
                    <option value="Full Admin">Full Admin</option>
                    <option value="Security Admin">Security Admin</option>
                    <option value="DevOps Lead">DevOps Lead</option>
                    <option value="Read-Only">Read-Only</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editData.status}
                    onChange={e => setEditData({ ...editData, status: e.target.value })}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="REVOKED">REVOKED</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
