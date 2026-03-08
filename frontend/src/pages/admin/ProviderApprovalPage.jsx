import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Sidebar from '../../components/SideBar';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ProviderApprovalPage() {
  const qc = useQueryClient();
  const [loading, setLoading] = useState('');
  const [view, setView] = useState('pending'); // 'all' | 'pending'

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-providers', view],
    queryFn: () => api.get(view === 'pending' ? '/admin/providers/pending' : '/admin/providers').then(r => r.data.providers),
  });
  const providers = data || [];

  const approve = async (id) => {
    setLoading(id + '-approve');
    try {
      await api.patch(`/admin/providers/${id}/approve`);
      toast.success('Provider approved ✅');
      refetch(); qc.invalidateQueries(['admin-stats']);
    } catch { toast.error('Failed'); }
    finally { setLoading(''); }
  };

  const reject = async (id) => {
    const reason = prompt('Reason for rejection (optional):') || 'Does not meet requirements';
    setLoading(id + '-reject');
    try {
      await api.patch(`/admin/providers/${id}/reject`, { reason });
      toast.success('Provider rejected');
      refetch(); qc.invalidateQueries(['admin-stats']);
    } catch { toast.error('Failed'); }
    finally { setLoading(''); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />
      <main className="dashboard-content">
        <div className="page-header-row">
          <div className="page-header">
            <h1>Provider Approvals</h1>
            <p>Review and approve service professional profiles</p>
          </div>
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-card)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            {['pending', 'all'].map(v => (
              <button key={v} className={`btn btn-sm ${view === v ? 'btn-primary' : 'btn-ghost'}`}
                style={{ textTransform: 'capitalize' }} onClick={() => setView(v)}>
                {v === 'pending' ? '⏳ Pending' : '📋 All'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : providers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>No {view === 'pending' ? 'pending' : ''} providers</h3>
            <p>{view === 'pending' ? 'All provider requests have been reviewed.' : 'No providers registered yet.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {providers.map(p => (
              <div key={p._id} className="card">
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {/* Avatar */}
                  <div className="provider-avatar" style={{ width: '52px', height: '52px', fontSize: '1.2rem', flexShrink: 0 }}>
                    {p.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700 }}>{p.user?.name}</span>
                      <span className={`badge badge-${p.isApproved ? 'approved' : 'pending'}`}>
                        {p.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>
                      📧 {p.user?.email} · 📅 Registered {new Date(p.user?.createdAt).toLocaleDateString('en-IN')}
                    </div>
                    {p.city && <div style={{ fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>📍 {p.city}{p.area ? ', ' + p.area : ''}</div>}
                    {p.bio && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', maxWidth: '500px' }}>{p.bio}</p>}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {p.categories?.map(c => <span key={c._id} className="badge badge-confirmed">{c.name}</span>)}
                    </div>
                    {p.rejectionReason && (
                      <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--danger)' }}>Rejection reason: {p.rejectionReason}</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>₹{p.hourlyRate}/hr · {p.experience}yr exp</div>
                    {!p.isApproved ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-success btn-sm" onClick={() => approve(p._id)} disabled={loading === p._id + '-approve'}>✅ Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => reject(p._id)} disabled={loading === p._id + '-reject'}>✕ Reject</button>
                      </div>
                    ) : (
                      <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => reject(p._id)}>Revoke</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
