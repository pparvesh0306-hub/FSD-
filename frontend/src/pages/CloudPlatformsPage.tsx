import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { CloudPlatform } from '../types';
import { Cloud, RefreshCw, CheckCircle2, Shield, Radio } from 'lucide-react';

export const CloudPlatformsPage: React.FC = () => {
  const [platforms, setPlatforms] = useState<CloudPlatform[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingId, setSyncingId] = useState<number | null>(null);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      const res = await apiService.getCloudPlatforms();
      if (res.success && res.data) setPlatforms(res.data);
    } catch (err) {
      console.error('Failed to fetch cloud platforms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const handleSync = async (id: number) => {
    try {
      setSyncingId(id);
      const res = await apiService.syncCloudPlatform(id);
      if (res.success) {
        fetchPlatforms();
      }
    } catch (err: any) {
      alert(err?.message || 'Cloud sync failed');
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Cloud size={28} color="#06b6d4" />
            Cloud Infrastructure Platform Sync
          </h1>
          <p className="page-subtitle">Telemetry & IAM role synchronization connectors for AWS, Azure, and GCP multi-cloud accounts</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {platforms.map(p => (
          <div key={p.id} className="glass-panel glass-panel-glow" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span className="status-badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.3)', marginBottom: '0.4rem' }}>
                    {p.provider}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{p.name}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontSize: '0.78rem', fontWeight: 600 }}>
                  <Radio size={14} className="pulse" />
                  <span>ONLINE</span>
                </div>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Region / Data Center</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.region}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Identities Discovered</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.user_count}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Privileged Roles</span>
                  <span style={{ fontWeight: 700, color: '#06b6d4' }}>{p.privileged_account_count}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-dim)', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span>Last Synchronization</span>
                  <span>{new Date(p.last_sync_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleSync(p.id)}
              className="btn btn-secondary"
              disabled={syncingId === p.id}
              style={{ width: '100%' }}
            >
              <RefreshCw size={16} className={syncingId === p.id ? 'spin' : ''} />
              <span>{syncingId === p.id ? 'Synchronizing IAM Policies...' : 'Sync Cloud IAM State'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
