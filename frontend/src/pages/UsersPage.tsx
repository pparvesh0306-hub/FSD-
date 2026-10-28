import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { User, Role } from '../types';
import { Users, Plus, Shield, Mail, Edit2, Trash2 } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: 'Password123!',
    role: 'User',
    department: 'DevOps'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, rRes] = await Promise.all([
        apiService.getUsers(),
        apiService.getRoles()
      ]);

      if (uRes.success && uRes.data) setUsers(uRes.data);
      if (rRes.success && rRes.data) setRoles(rRes.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiService.createUser(formData);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ full_name: '', email: '', password: 'Password123!', role: 'User', department: 'DevOps' });
        fetchData();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to deactivate/delete this user identity?')) return;
    try {
      const res = await apiService.deleteUser(id);
      if (res.success) {
        fetchData();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users size={28} color="#06b6d4" />
            User Identity & Role Governance
          </h1>
          <p className="page-subtitle">Directory of system users, role definitions, and permission entitlement assignments</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Provision New User</span>
        </button>
      </div>

      {/* Role Cards Overview */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {roles.map(r => (
          <div key={r.id} className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.name}</span>
              <Shield size={16} color="#06b6d4" />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{r.description}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="glass-panel">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Governance Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td>
                    <span className="status-badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{u.department}</td>
                  <td>
                    <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleDeleteUser(u.id)} className="btn btn-danger btn-sm" title="Delete User">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision User Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Provision User Identity</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Alice Smith"
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. alice@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Governance Role</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Security Officer">Security Officer</option>
                    <option value="Approver">Approver</option>
                    <option value="Auditor">Auditor</option>
                    <option value="User">User</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Provision User</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
