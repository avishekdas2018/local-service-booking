import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/useAuth';
import api from '../../api/axios';

export default function ProviderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['provider', id],
    queryFn: () => api.get(`/customer/providers/${id}`).then(r => r.data),
  });

  if (isLoading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!data) return null;

  const { profile, reviews } = data;
  const initials = profile.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Profile Header */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="provider-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>{initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{profile.user?.name}</h1>
                <span className={`avail-pill ${profile.isAvailable ? 'on' : 'off'}`}>
                  {profile.isAvailable ? '● Available' : '○ Unavailable'}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>📍 {profile.city}{profile.area ? `, ${profile.area}` : ''} · {profile.experience} years experience</p>
              <div className="rating-stars" style={{ fontSize: '1rem', marginBottom: '12px' }}>
                {'★'.repeat(Math.round(profile.avgRating || 0))}{'☆'.repeat(5 - Math.round(profile.avgRating || 0))}
                <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>{profile.avgRating?.toFixed(1) || '0.0'} ({profile.totalReviews} reviews)</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {profile.categories?.map(c => <span key={c._id} className="badge badge-confirmed">{c.icon} {c.name}</span>)}
              </div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', padding: '20px 28px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>₹{profile.hourlyRate}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>per hour</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{profile.totalJobsCompleted} jobs completed</div>
            </div>
          </div>
          {profile.bio && (
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>About</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>{profile.bio}</p>
            </div>
          )}
        </div>

        {/* Book CTA */}
        {user?.role === 'customer' && profile.isAvailable && (
          <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(16,185,129,0.05))', border: '1px solid rgba(99,102,241,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: '4px' }}>Ready to book {profile.user?.name.split(' ')[0]}?</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Estimated ₹{profile.hourlyRate}/hr · See full pricing before confirming</p>
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => navigate(`/book/${profile._id}`)}>Book Now →</button>
            </div>
          </div>
        )}
        {!user && (
          <div className="card" style={{ marginBottom: '24px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>Login to book this professional</p>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>Login to Book</button>
          </div>
        )}

        {/* Portfolio */}
        {profile.portfolio?.length > 0 && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Portfolio</h3>
            <div className="images-grid">
              {profile.portfolio.map((img, i) => <img key={i} src={img} alt={`portfolio-${i}`} />)}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Reviews ({reviews?.length || 0})</h3>
          {reviews?.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px' }}>
              <div className="empty-icon">⭐</div>
              <p>No reviews yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews?.map(r => (
                <div key={r._id} style={{ padding: '16px', background: 'var(--bg-card2)', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="provider-avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                        {r.customer?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontWeight: 600 }}>{r.customer?.name}</span>
                    </div>
                    <div className="rating-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  </div>
                  {r.comment && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
