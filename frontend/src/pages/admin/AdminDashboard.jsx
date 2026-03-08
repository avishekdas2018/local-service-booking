import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/SideBar';
import api from '../../api/axios';

export default function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data.stats),
  });
  const stats = data || {};

  const STATS = [
    { icon: '👥', label: 'Customers', value: stats.totalUsers ?? '—', color: '#818CF8' },
    { icon: '🔧', label: 'Approved Providers', value: stats.totalProviders ?? '—', color: '#10B981' },
    { icon: '⏳', label: 'Pending Approvals', value: stats.pendingProviders ?? '—', color: '#F59E0B' },
    { icon: '🗂️', label: 'Active Categories', value: stats.totalCategories ?? '—', color: '#60A5FA' },
    { icon: '⭐', label: 'Total Reviews', value: stats.totalReviews ?? '—', color: '#F472B6' },
  ];

  const QUICK_LINKS = [
    { to: '/admin/providers', icon: '✅', label: 'Provider Approvals', desc: `${stats.pendingProviders ?? 0} pending` },
    { to: '/admin/categories', icon: '🗂️', label: 'Manage Categories', desc: `${stats.totalCategories ?? 0} active` },
    { to: '/admin/reviews', icon: '⭐', label: 'Review Moderation', desc: 'Moderate user reviews' },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />
      <main className="dashboard-content">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Platform overview and management</p>
        </div>

        <div className="stats-grid">
          {STATS.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {QUICK_LINKS.map(l => (
            <Link key={l.to} to={l.to} style={{ display: 'block', textDecoration: 'none' }}>
              <div className="card card-hover" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem', width: '52px', height: '52px', background: 'rgba(99,102,241,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{l.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>{l.label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{l.desc}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: 'var(--text-dim)' }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
