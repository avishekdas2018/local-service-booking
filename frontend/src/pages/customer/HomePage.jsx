import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

const HERO_STATS = [
  { label: 'Verified Pros', value: '500+' },
  { label: 'Services Booked', value: '10K+' },
  { label: 'Cities Served', value: '50+' },
];

export default function HomePage() {
  const [selectedCat, setSelectedCat] = useState(null);
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  const { data: catData } = useQuery({
    queryKey: ['public-categories'],
    queryFn: () => api.get('/customer/categories').then(r => r.data.categories),
    retry: false,
  });
  const categories = catData || [];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCat) params.set('category', selectedCat);
    if (city) params.set('city', city);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div style={{ paddingTop: '64px' }}>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-eyebrow">Trusted Local Services</div>
            <h1 className="hero-title">
              Find the Right <span>Professional</span> for Any Job
            </h1>
            <p className="hero-sub">
              Connect with verified local service pros for plumbing, electrical, cleaning, and more — all in one place.
            </p>
            {/* Search bar */}
            <div style={{ background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', maxWidth: '680px', margin: '0 auto 40px' }}>
              <div className="form-group" style={{ flex: '1', minWidth: '160px' }}>
                <label className="form-label">Your City</label>
                <input className="form-input" placeholder="e.g. Mumbai" value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: '1', minWidth: '160px' }}>
                <label className="form-label">Service Type</label>
                <select className="form-input" value={selectedCat || ''} onChange={e => setSelectedCat(e.target.value || null)}>
                  <option value="">All Services</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleSearch} style={{ flexShrink: 0 }}>Search →</button>
            </div>
            {/* Stats */}
            <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {HERO_STATS.map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)' }}>{s.value}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Browse by Category</h2>
            <p style={{ color: 'var(--text-muted)' }}>Pick a service to find the right professional</p>
          </div>
          <div className="category-grid">
            {categories.length > 0
              ? categories.map(c => (
                <div key={c._id} className="category-item" onClick={() => navigate(`/browse?category=${c._id}`)}>
                  <div className="cat-icon">{c.icon}</div>
                  <div className="cat-name">{c.name}</div>
                </div>
              ))
              : [1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="category-item" style={{ opacity: 0.3 }}><div className="cat-icon">🔧</div><div className="cat-name">Loading...</div></div>)
            }
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>How It Works</h2>
            <p style={{ color: 'var(--text-muted)' }}>Book a pro in 3 easy steps</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[
              { step: '01', icon: '🔍', title: 'Browse & Filter', desc: 'Search providers by service, city, or area and view their profiles and pricing.' },
              { step: '02', icon: '📅', title: 'Book Instantly', desc: 'Pick your date, add notes and photos. See the full price before you confirm.' },
              { step: '03', icon: '✅', title: 'Job Done', desc: 'Track your booking live. Rate and review once the job is complete.' },
            ].map(s => (
              <div key={s.step} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-light)', letterSpacing: '2px', marginBottom: '12px' }}>STEP {s.step}</div>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{s.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>Ready to get started?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>Join thousands of happy customers today.</p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">Find a Professional →</Link>
            <Link to="/register" className="btn btn-outline btn-lg" onClick={() => { }}>I'm a Professional</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '60px 0 0' }}>
        <div className="container">
          {/* Main footer grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', paddingBottom: '48px' }}>
            {/* Brand */}
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--primary-light), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>⚡ LocalPro</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '20px' }}>Your trusted platform for finding verified local service professionals. Quality work, transparent pricing, every time.</p>
              {/* Social icons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {['𝕏', 'f', 'in', '▶'].map((icon, i) => (
                  <a key={i} href="#" style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, transition: 'var(--transition)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary-light)'; e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Services</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Plumbing', 'Electrical', 'House Cleaning', 'Carpentry', 'Painting', 'AC Repair'].map(s => (
                  <li key={s}><Link to="/browse" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', transition: 'var(--transition)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-light)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>{s}</Link></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[{ label: 'About Us', to: '#' }, { label: 'How It Works', to: '#' }, { label: 'Become a Pro', to: '/register' }, { label: 'Pricing', to: '#' }, { label: 'Careers', to: '#' }, { label: 'Blog', to: '#' }].map(l => (
                  <li key={l.label}><Link to={l.to} style={{ color: 'var(--text-muted)', fontSize: '0.9rem', transition: 'var(--transition)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-light)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>{l.label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Contact & Support */}
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Support</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <span>📧</span> support@localpro.in
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <span>📞</span> +91 1800-200-300
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <span>📍</span> Mumbai, India
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <span>🕐</span> Mon–Sat, 9 AM – 8 PM
                </li>
              </ul>
              <div style={{ marginTop: '20px' }}>
                {['Help Center', 'Privacy Policy', 'Terms of Service'].map(l => (
                  <a key={l} href="#" style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', transition: 'var(--transition)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-light)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>{l}</a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid var(--border)', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>© {new Date().getFullYear()} LocalPro. All rights reserved.</p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Made with 💜 by Avishek Das</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
