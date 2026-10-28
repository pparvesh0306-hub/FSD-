import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Settings, Save, Trash2, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [clearing, setClearing] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiService.getSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSettingChange = (key: string, newValue: string) => {
    setSettings(prev =>
      prev.map(s => (s.key === key ? { ...s, value: newValue } : s))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      const res = await apiService.updateSettings(settings);
      if (res.success) {
        setMessage('System settings updated successfully.');
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async () => {
    try {
      setClearing(true);
      setMessage('');
      const res = await apiService.clearCache();
      if (res.success) {
        setMessage('Redis telemetry & dashboard cache cleared successfully.');
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to clear cache');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Settings size={28} color="#06b6d4" />
            Governance System Settings
          </h1>
          <p className="page-subtitle">Configure PAM security thresholds, session expirations, auto-approvals, and cache engine</p>
        </div>
      </div>

      {message && (
        <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '8px', color: '#10b981', fontSize: '0.875rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Policy & Threshold Controls</h3>

          {settings.map(s => (
            <div key={s.key} className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-main)' }}>{s.key}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated {new Date(s.updated_at).toLocaleDateString()}</span>
              </label>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.1rem 0 0.5rem' }}>{s.description}</p>
              {s.key === 'ENFORCE_MFA_FOR_PRIVILEGED' ? (
                <select
                  className="form-select"
                  value={s.value}
                  onChange={e => handleSettingChange(s.key, e.target.value)}
                >
                  <option value="true">Enabled (Required for all elevation requests)</option>
                  <option value="false">Disabled</option>
                </select>
              ) : (
                <input
                  type="text"
                  className="form-input"
                  value={s.value}
                  onChange={e => handleSettingChange(s.key, e.target.value)}
                />
              )}
            </div>
          ))}

          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving System Policies...' : 'Save System Settings'}</span>
          </button>
        </div>
      </form>

      {/* Redis Cache Maintenance Panel */}
      <div className="glass-panel" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fca5a5' }}>Engine Maintenance & Redis Cache</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Purge invalidated Redis key-value cache stores across dashboard stats, account inventories, and cloud platform states.
        </p>

        <button onClick={handleClearCache} className="btn btn-danger" disabled={clearing}>
          <Trash2 size={16} />
          <span>{clearing ? 'Purging Cache...' : 'Flush All Redis Caches'}</span>
        </button>
      </div>

    </div>
  );
};
