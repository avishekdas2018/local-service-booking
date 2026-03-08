import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

const STATUS_TABS = ['all', 'requested', 'confirmed', 'in-progress', 'completed', 'cancelled'];

const STATUS_COLORS = {
  requested: '#818CF8', confirmed: '#60A5FA', 'in-progress': '#FCD34D',
  completed: '#34D399', cancelled: '#FCA5A5',
};

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings', activeTab],
    queryFn: async () => {
      const url = activeTab === 'all' ? '/customer/bookings' : `/customer/bookings?status=${activeTab}`;
      const response = await api.get(url);
      return response.data.bookings;
    },
  });
  const bookings = data || [];

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>My Bookings</h1>
          <p>Track and manage all your service bookings</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px', background: 'var(--bg-card)', padding: '6px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          {STATUS_TABS.map(t => (
            <button key={t} className={`btn btn-sm ${activeTab === t ? 'btn-primary' : 'btn-ghost'}`}
              style={{ textTransform: 'capitalize' }} onClick={() => setActiveTab(t)}>
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No bookings found</h3>
            <p>Start by browsing local professionals.</p>
            <Link to="/browse" className="btn btn-primary" style={{ marginTop: '16px' }}>Browse Professionals</Link>
          </div>
        ) : (
          <div className="booking-list">
            {bookings.map(b => (
              <div key={b._id} className="card card-hover" style={{ cursor: 'pointer' }} onClick={() => navigate(`/my-bookings/${b._id}`)}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{b.category?.icon || '🔧'}</span>
                      <span style={{ fontWeight: 700 }}>{b.category?.name}</span>
                      <span className={`badge badge-${b.status}`}>{b.status}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>
                      👤 {b.provider?.name} · 📍 {b.city}{b.area ? ', ' + b.area : ''}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      📅 {new Date(b.scheduledDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.1rem' }}>₹{b.pricingSnapshot?.estimatedTotal || '—'}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>estimated</div>
                    {b.status === 'completed' && !b.hasReview && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--warning)', display: 'block', marginTop: '4px' }}>⭐ Leave a review</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
