import { useQuery } from '@tanstack/react-query';
import Sidebar from '../../components/SideBar';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function ReviewModerationPage() {
  //const qc = useQueryClient();
  const [loading, setLoading] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'visible' | 'hidden'

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => api.get('/admin/reviews').then(r => r.data.reviews),
  });
  const reviews = (data || []).filter(r => {
    if (filter === 'visible') return !r.isModerated;
    if (filter === 'hidden') return r.isModerated;
    return true;
  });

  const moderate = async (id) => {
    setLoading(id);
    try {
      await api.patch(`/admin/reviews/${id}/moderate`);
      toast.success('Review visibility toggled');
      refetch();
    } catch { toast.error('Failed'); }
    finally { setLoading(''); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />
      <main className="dashboard-content">
        <div className="page-header-row">
          <div className="page-header">
            <h1>Review Moderation</h1>
            <p>Show or hide customer reviews across the platform</p>
          </div>
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-card)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            {['all', 'visible', 'hidden'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                style={{ textTransform: 'capitalize' }} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : reviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⭐</div>
            <h3>No reviews</h3>
            <p>Reviews will appear here once customers start rating providers.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reviews.map(r => (
              <div key={r._id} className="card" style={{ opacity: r.isModerated ? 0.6 : 1, borderColor: r.isModerated ? 'var(--danger)' : 'var(--border)' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <div className="rating-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>by <strong style={{ color: 'var(--text)' }}>{r.customer?.name}</strong></span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>for <strong style={{ color: 'var(--text)' }}>{r.provider?.name}</strong></span>
                      {r.isModerated && <span className="badge badge-cancelled">Hidden</span>}
                    </div>
                    {r.comment ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '6px' }}>"{r.comment}"</p>
                    ) : (
                      <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontStyle: 'italic' }}>No comment</p>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Posted {new Date(r.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      {r.moderationNote && <span style={{ color: 'var(--danger)', marginLeft: '8px' }}>Note: {r.moderationNote}</span>}
                    </div>
                  </div>
                  <button
                    className={`btn btn-sm ${r.isModerated ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => moderate(r._id)}
                    disabled={loading === r._id}
                  >
                    {r.isModerated ? '👁 Show' : '🚫 Hide'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
