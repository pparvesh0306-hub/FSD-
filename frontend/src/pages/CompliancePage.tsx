import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { ComplianceReport } from '../types';
import { ShieldAlert, Plus, CheckCircle2, AlertTriangle, FileText, Download } from 'lucide-react';

export const CompliancePage: React.FC = () => {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [selectedFramework, setSelectedFramework] = useState<string>('SOC2');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await apiService.getComplianceReports();
      if (res.success && res.data) setReports(res.data);
    } catch (err) {
      console.error('Failed to fetch compliance reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const title = `${selectedFramework} Identity & Access Control Compliance Audit`;
      const res = await apiService.generateComplianceReport(title, selectedFramework);
      if (res.success) {
        fetchReports();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShieldAlert size={28} color="#06b6d4" />
            SOC2 & ISO 27001 Compliance Reporting
          </h1>
          <p className="page-subtitle">Automated governance auditing & exportable compliance reports for regulatory frameworks</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="form-select"
            value={selectedFramework}
            onChange={e => setSelectedFramework(e.target.value)}
            style={{ margin: 0, width: 'auto' }}
          >
            <option value="SOC2">SOC2 Type II</option>
            <option value="ISO27001">ISO 27001 Annex A.9</option>
            <option value="HIPAA">HIPAA Security Rule</option>
            <option value="NIST">NIST SP 800-53</option>
          </select>
          <button onClick={handleGenerate} className="btn btn-primary" disabled={generating}>
            <Plus size={16} />
            <span>{generating ? 'Compiling Audit...' : 'Generate New Report'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {reports.map(rep => (
          <div key={rep.id} className="glass-panel glass-panel-glow" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <span className="status-badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.3)', marginBottom: '0.4rem' }}>
                    {rep.framework}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0.2rem 0' }}>{rep.title}</h3>
                </div>
                <span className="status-badge" style={{
                  background: rep.status === 'COMPLIANT' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: rep.status === 'COMPLIANT' ? '#10b981' : '#f59e0b',
                  borderColor: rep.status === 'COMPLIANT' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'
                }}>
                  {rep.status}
                </span>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1rem', borderRadius: '10px', margin: '1rem 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Total Audited Accounts</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.1rem' }}>{rep.summary?.totalAccounts || 38}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Pass Rate</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10b981', marginTop: '0.1rem' }}>{rep.summary?.passRate || '100%'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Active Reviews</div>
                    <div style={{ fontWeight: 700, marginTop: '0.1rem' }}>{rep.summary?.activeReviews || 12}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Policy Violations</div>
                    <div style={{ fontWeight: 700, color: rep.summary?.policyViolations ? '#ef4444' : '#10b981', marginTop: '0.1rem' }}>{rep.summary?.policyViolations || 0}</div>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                Generated by: <strong>{rep.generated_by_name || 'System Auto-Auditor'}</strong> on {new Date(rep.created_at).toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => alert(`Exporting ${rep.title} (PDF/JSON format)...`)}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              <Download size={16} />
              <span>Export Compliance Artifact (PDF)</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
