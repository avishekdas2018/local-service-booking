import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Sidebar from '../../components/SideBar';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ProviderProfilePage() {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [form, setForm] = useState({ bio: '', city: '', area: '', hourlyRate: '', experience: '', categories: [] });

  const { data: catData } = useQuery({ queryKey: ['categories-p'], queryFn: () => api.get('/customer/categories').then(r => r.data.categories) });
  const { data: profile, refetch } = useQuery({ queryKey: ['my-profile'], queryFn: () => api.get('/provider/profile').then(r => r.data.profile) });

  useEffect(() => {
    if (profile) {
      setForm({
        bio: profile.bio || '',
        city: profile.city || '',
        area: profile.area || '',
        hourlyRate: profile.hourlyRate || '',
        experience: profile.experience || '',
        categories: profile.categories?.map(c => c._id) || [],
      });
    }
  }, [profile]);

  const toggleCat = (id) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(id) ? f.categories.filter(c => c !== id) : [...f.categories, id],
    }));
  };

  const handleAvailability = async () => {
    try {
      const res = await api.patch('/provider/availability');
      toast.success(`You are now ${res.data.isAvailable ? 'available' : 'unavailable'}`);
      refetch();
      qc.invalidateQueries(['my-profile']);
    } catch { toast.error('Failed to toggle availability'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'categories') v.forEach(id => fd.append('categories', id));
        else fd.append(k, v);
      });
      portfolioFiles.forEach(f => fd.append('portfolio', f));
      await api.put('/provider/profile', fd);
      toast.success('Profile updated!');
      refetch();
      setPortfolioFiles([]);
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  const categories = catData || [];

  return (
    <div className="dashboard-layout">
      <Sidebar role="provider" />
      <main className="dashboard-content">
        <div className="page-header-row">
          <div className="page-header">
            <h1>My Profile</h1>
            <p>Keep your profile up to date to attract more customers</p>
          </div>
          {profile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Availability:</span>
              <label className="toggle">
                <input type="checkbox" checked={profile.isAvailable} onChange={handleAvailability} />
                <span className="toggle-slider" />
              </label>
              <span className={profile.isAvailable ? 'text-accent' : 'text-muted'} style={{ fontWeight: 600 }}>
                {profile.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          )}
        </div>

        {/* Approval status */}
        {profile && (
          <div style={{ marginBottom: '24px' }}>
            <span className={`badge badge-${profile.isApproved ? 'approved' : 'pending'}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
              {profile.isApproved ? '✓ Profile Approved' : '⏳ Pending Approval'}
            </span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Bio & Experience</h3>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Professional Bio</label>
              <textarea className="form-input" rows={4} placeholder="Describe your experience and specialties..."
                value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
            </div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Hourly Rate (₹)</label>
                <input className="form-input" type="number" min="0" placeholder="e.g. 500"
                  value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input className="form-input" type="number" min="0" placeholder="e.g. 5"
                  value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Location</h3>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" placeholder="e.g. Mumbai"
                  value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Area / Locality</label>
                <input className="form-input" placeholder="e.g. Andheri"
                  value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Services Offered</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>Select all categories that apply to your work</p>
            <div className="category-grid">
              {categories.map(c => (
                <div key={c._id} className={`category-item ${form.categories.includes(c._id) ? 'active' : ''}`}
                  onClick={() => toggleCat(c._id)}>
                  <div className="cat-icon">{c.icon}</div>
                  <div className="cat-name">{c.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Portfolio Images</h3>
            {profile?.portfolio?.length > 0 && (
              <div className="images-grid" style={{ marginBottom: '16px' }}>
                {profile.portfolio.map((img, i) => <img key={i} src={img} alt={`portfolio-${i}`} />)}
              </div>
            )}
            <label className="upload-area">
              <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                onChange={e => setPortfolioFiles(Array.from(e.target.files))} />
              {portfolioFiles.length > 0
                ? <p style={{ color: 'var(--accent)' }}>✓ {portfolioFiles.length} file(s) selected</p>
                : <p>📷 Click to upload portfolio images (max 5)</p>}
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Saving...' : '💾 Save Profile'}
          </button>
        </form>
      </main>
    </div>
  );
}
