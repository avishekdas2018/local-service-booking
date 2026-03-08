import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import Sidebar from '../../components/SideBar';
import api from '../../api/axios';

export default function ProviderDashboard() {
  const { user, profile } = useAuth();

  const { data: bookingsData } = useQuery({
    queryKey: ['provider-bookings-all'],
    queryFn: () => api.get('/provider/bookings').then(r => r.data.bookings),
  });
  const bookings = bookingsData || [];

  const stats = {
    pending: bookings.filter(b => b.status === 'requested').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    inProgress: bookings.filter(b => b.status === 'in-progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  const recent = bookings.slice(0, 5);

  return (
    <div className="dashboard-layout">
      <Sidebar role="provider" />
      <main className="dashboard-content">
        <div className="page-header-row">
          <div>
            <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-muted">Here's an overview of your service activity</p>
          </div>
          {profile && (
            <span className={`avail-pill ${profile.isAvailable ? 'on' : 'off'}`}>
              {profile.isAvailable ? '● Available for Work' : '○ Currently Unavailable'}
            </span>
          )}
        </div>

        {profile && !profile.isApproved && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '1.3rem' }}>⏳</span>
            <div>
              <div style={{ fontWeight: 700, color: '#FCD34D' }}>Approval Pending</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Your profile is under review. You'll be notified once approved by the admin.</div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          {[
            { icon: '📬', label: 'New Requests', value: stats.pending, color: '#818CF8' },
            { icon: '✅', label: 'Confirmed', value: stats.confirmed, color: '#60A5FA' },
            { icon: '🔄', label: 'In Progress', value: stats.inProgress, color: '#FCD34D' },
            { icon: '🏆', label: 'Completed', value: stats.completed, color: '#34D399' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Profile completeness */}
        {profile && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontWeight: 700 }}>Profile Overview</h3>
              <Link to="/provider/profile" className="btn btn-outline btn-sm">Edit Profile</Link>
            </div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {[
                { label: 'Rating', value: profile.avgRating ? `${profile.avgRating} ⭐` : 'No ratings yet' },
                { label: 'Total Reviews', value: profile.totalReviews },
                { label: 'Jobs Done', value: profile.totalJobsCompleted },
                { label: 'Rate', value: `₹${profile.hourlyRate}/hr` },
                { label: 'City', value: profile.city || '—' },
              ].map(i => (
                <div key={i.label}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{i.label}</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{i.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent bookings */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 700 }}>Recent Bookings</h3>
            <Link to="/provider/bookings" className="btn btn-ghost btn-sm">View All →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px' }}>
              <div className="empty-icon">📋</div>
              <p>No bookings yet. Make sure your profile is complete and you're marked as available.</p>
            </div>
          ) : (
            <div className="booking-list">
              {recent.map(b => (
                <Link key={b._id} to={`/provider/bookings/${b._id}`} style={{ display: 'block' }}>
                  <div style={{ padding: '12px 16px', background: 'var(--bg-card2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', transition: 'var(--transition)' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                        <span>{b.category?.icon}</span>
                        <span style={{ fontWeight: 600 }}>{b.category?.name}</span>
                        <span className={`badge badge-${b.status}`}>{b.status}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        👤 {b.customer?.name} · 📅 {new Date(b.scheduledDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>₹{b.pricingSnapshot?.estimatedTotal}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
