export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export const getStatusBadgeStyle = (status: string): { bg: string; text: string; border: string } => {
  const upper = (status || '').toUpperCase();
  switch (upper) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'COMPLIANT':
      return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
    case 'PENDING':
    case 'WARNING':
      return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
    case 'REJECTED':
    case 'REVOKED':
    case 'INACTIVE':
    case 'NON_COMPLIANT':
    case 'SUSPENDED':
      return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
    default:
      return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
  }
};

export const getProviderIconColor = (provider?: string): { color: string; bg: string } => {
  const p = (provider || '').toUpperCase();
  if (p.includes('AWS')) return { color: '#ff9900', bg: 'rgba(255, 153, 0, 0.15)' };
  if (p.includes('AZURE')) return { color: '#0089d6', bg: 'rgba(0, 137, 214, 0.15)' };
  if (p.includes('GCP') || p.includes('GOOGLE')) return { color: '#4285f4', bg: 'rgba(66, 133, 244, 0.15)' };
  return { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' };
};
