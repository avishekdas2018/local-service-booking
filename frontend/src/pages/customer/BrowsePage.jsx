import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

function ProviderCard({ p }) {
  const navigate = useNavigate();
  const initials = p.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';
  return (
    <div className="provider-card" onClick={() => navigate(`/providers/${p._id}`)}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div className="provider-avatar">{initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>{p.user?.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '6px' }}>📍 {p.city}{p.area ? `, ${p.area}` : ''}</div>
          <div className="rating-stars">
            {'★'.repeat(Math.round(p.avgRating || 0))}{'☆'.repeat(5 - Math.round(p.avgRating || 0))}
            <span style={{ color: 'var(--text-muted)', marginLeft: '4px', fontSize: '0.8rem' }}>({p.totalReviews || 0})</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>₹{p.hourlyRate}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/hour</div>
        </div>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.bio}</p>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {p.categories?.map(c => <span key={c._id} className="badge badge-confirmed">{c.icon} {c.name}</span>)}
      </div>
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.experience} yrs exp · {p.totalJobsCompleted} jobs done</span>
        <span className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); navigate(`/providers/${p._id}`); }}>View Profile →</span>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    area: '',
    minRate: '',
    maxRate: '',
  });

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/customer/categories').then(r => r.data.categories),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['providers', filters],
    queryFn: () => {
      const p = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) p.set(k, v); });
      return api.get(`/customer/providers?${p}`).then(r => r.data.providers);
    },
  });

  const providers = data || [];
  const categories = catData || [];

  const updateFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Browse Professionals</h1>
          <p>Find verified service providers in your area</p>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="form-group" style={{ flex: '2', minWidth: '200px' }}>
            <label className="form-label">Category</label>
            <select className="form-input" value={filters.category} onChange={e => updateFilter('category', e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: '1', minWidth: '140px' }}>
            <label className="form-label">City</label>
            <input className="form-input" placeholder="e.g. Mumbai" value={filters.city} onChange={e => updateFilter('city', e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: '1', minWidth: '140px' }}>
            <label className="form-label">Area</label>
            <input className="form-input" placeholder="e.g. Andheri" value={filters.area} onChange={e => updateFilter('area', e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: '1', minWidth: '100px' }}>
            <label className="form-label">Min Rate (₹)</label>
            <input className="form-input" type="number" placeholder="0" value={filters.minRate} onChange={e => updateFilter('minRate', e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: '1', minWidth: '100px' }}>
            <label className="form-label">Max Rate (₹)</label>
            <input className="form-input" type="number" placeholder="9999" value={filters.maxRate} onChange={e => updateFilter('maxRate', e.target.value)} />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ category: '', city: '', area: '', minRate: '', maxRate: '' })}>Clear</button>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : providers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No providers found</h3>
            <p>Try adjusting your filters or search in a different city.</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>{providers.length} professional{providers.length !== 1 ? 's' : ''} found</p>
            <div className="provider-grid">
              {providers.map(p => <ProviderCard key={p._id} p={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
