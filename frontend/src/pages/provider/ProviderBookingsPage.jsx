import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../../components/SideBar';
import api from '../../api/axios';

const COLS = [
  { status: 'requested', label: 'Requested', color: '#818CF8' },
  { status: 'confirmed', label: 'Confirmed', color: '#60A5FA' },
  { status: 'in-progress', label: 'In Progress', color: '#FCD34D' },
  { status: 'completed', label: 'Completed', color: '#34D399' },
];

export default function ProviderBookingsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState('kanban');

  const { data, isLoading } = useQuery({
    queryKey: ['provider-bookings'],
    queryFn: () => api.get('/provider/bookings').then(r => r.data.bookings),
    refetchInterval: 30000,
  });
  const bookings = data || [];

  return (
    <div className="dashboard-layout">
      <Sidebar role="provider" />
      <main className="dashboard-content">
        <div className="page-header-row">
          <div className="page-header">
            <h1>Bookings</h1>
            <p>Manage all your incoming and active service requests</p>
          </div>
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-card)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            {['kanban', 'list'].map(v => (
              <button key={v} className={`btn btn-sm ${view === v ? 'btn-primary' : 'btn-ghost'}`}
                style={{ textTransform: 'capitalize' }} onClick={() => setView(v)}>
                {v === 'kanban' ? '⊞ Kanban' : '☰ List'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : view === 'kanban' ? (
          <div className="kanban">
            {COLS.map(col => {
              const colBookings = bookings.filter(b => b.status === col.status);
              return (
                <div key={col.status} className="kanban-col">
                  <div className="kanban-header">
                    <span style={{ color: col.color }}>{col.label}</span>
                    <span style={{ background: col.color + '22', color: col.color, padding: '2px 8px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>{colBookings.length}</span>
                  </div>
                  <div className="kanban-body">
                    {colBookings.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-dim)', fontSize: '0.8rem' }}>Empty</div>
                    ) : colBookings.map(b => (
                      <div key={b._id} className="kanban-card" onClick={() => navigate(`/provider/bookings/${b._id}`)}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                          <span>{b.category?.icon}</span>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.category?.name}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>👤 {b.customer?.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>📅 {new Date(b.scheduledDate).toLocaleDateString('en-IN')}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>📍 {b.city}</span>
                          <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.9rem' }}>₹{b.pricingSnapshot?.estimatedTotal}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="booking-list">
            {bookings.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📋</div><h3>No bookings yet</h3></div>
            ) : bookings.map(b => (
              <div key={b._id} className="card card-hover" style={{ cursor: 'pointer' }} onClick={() => navigate(`/provider/bookings/${b._id}`)}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                      <span>{b.category?.icon}</span><span style={{ fontWeight: 700 }}>{b.category?.name}</span>
                      <span className={`badge badge-${b.status}`}>{b.status}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>👤 {b.customer?.name} · 📍 {b.city} · 📅 {new Date(b.scheduledDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--accent)' }}>₹{b.pricingSnapshot?.estimatedTotal}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
