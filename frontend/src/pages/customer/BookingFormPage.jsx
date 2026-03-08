import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function BookingFormPage() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=form, 2=confirm
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [form, setForm] = useState({
    address: '', city: '', area: '', scheduledDate: '', notes: '', estimatedHours: 1,
  });

  const { data: catData } = useQuery({ queryKey: ['categories-bf'], queryFn: () => api.get('/customer/categories').then(r => r.data.categories) });
  const [categoryId, setCategoryId] = useState('');

  const { data: profileData } = useQuery({
    queryKey: ['provider-bf', providerId],
    queryFn: () => api.get(`/customer/providers/${providerId}`).then(r => r.data.profile),
  });

  const profile = profileData;
  const hourlyRate = profile?.hourlyRate || 0;
  const total = hourlyRate * form.estimatedHours;
  const tax = Math.round(total * 0.18);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('providerId', profile.user._id);
      fd.append('providerProfileId', providerId);
      fd.append('categoryId', categoryId);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('customerImage', image);
      const res = await api.post('/customer/bookings', fd);
      toast.success('Booking request sent!');
      navigate(`/my-bookings/${res.data.booking._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="spinner-wrap"><div className="spinner" /></div>;

  const initials = profile.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="page-header">
          <h1>Book a Professional</h1>
          <p>Fill in the details for your service request</p>
        </div>

        {/* Provider mini-card */}
        <div className="card" style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="provider-avatar">{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{profile.user?.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {profile.categories?.map(c => c.name).join(', ')} · {profile.city}
            </div>
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent)' }}>₹{hourlyRate}<span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>/hr</span></div>
        </div>

        {step === 1 ? (
          <div className="card">
            <h2 style={{ fontWeight: 700, marginBottom: '24px' }}>Service Details</h2>
            <div className="form-grid form-grid-2" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Service Category *</label>
                <select className="form-input" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                  <option value="">Select category</option>
                  {(catData || []).map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Hours *</label>
                <input className="form-input" type="number" min="1" max="8" value={form.estimatedHours}
                  onChange={e => setForm({ ...form, estimatedHours: +e.target.value })} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Service Address *</label>
              <input className="form-input" placeholder="e.g. 123 Main Street, Apartment 4B" value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })} required />
            </div>
            <div className="form-grid form-grid-2" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input className="form-input" placeholder="e.g. Mumbai" value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Area / Locality</label>
                <input className="form-input" placeholder="e.g. Andheri" value={form.area}
                  onChange={e => setForm({ ...form, area: e.target.value })} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Preferred Date & Time *</label>
              <input className="form-input" type="datetime-local" value={form.scheduledDate}
                onChange={e => setForm({ ...form, scheduledDate: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Notes / Problem Description</label>
              <textarea className="form-input" rows={3} placeholder="Describe the issue or special instructions..."
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Upload Photo (Optional)</label>
              <label className="upload-area">
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setImage(e.target.files[0])} />
                {image ? <p style={{ color: 'var(--accent)' }}>✓ {image.name}</p> : <p>📷 Click to attach a photo of the issue</p>}
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary btn-lg" onClick={() => {
                if (!categoryId || !form.address || !form.city || !form.scheduledDate) return toast.error('Please fill all required fields');
                setStep(2);
              }}>Review & Confirm →</button>
            </div>
          </div>
        ) : (
          <div className="card">
            <h2 style={{ fontWeight: 700, marginBottom: '24px' }}>Review Your Booking</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {[
                ['Provider', profile.user?.name],
                ['Address', form.address],
                ['City / Area', `${form.city}${form.area ? ', ' + form.area : ''}`],
                ['Scheduled', new Date(form.scheduledDate).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })],
                ['Notes', form.notes || '—'],
                ['Image', image ? image.name : 'None'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ minWidth: '120px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{k}</span>
                  <span style={{ fontSize: '0.9rem' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Pricing Panel */}
            <div className="pricing-panel" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Price Estimate</h3>
              <div className="pricing-row"><span>Hourly Rate</span><span>₹{hourlyRate}</span></div>
              <div className="pricing-row"><span>Estimated Hours</span><span>× {form.estimatedHours}</span></div>
              <div className="pricing-row"><span>Service Fee</span><span>₹{total}</span></div>
              <div className="pricing-row"><span>GST (18%)</span><span>₹{tax}</span></div>
              <div className="pricing-row"><span>Total Estimate</span><span style={{ color: 'var(--accent)' }}>₹{total + tax}</span></div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>* Final amount may vary based on actual work done. No payment charged until job is complete.</p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-outline" onClick={() => setStep(1)}>← Edit Details</button>
              <button className="btn btn-success btn-lg" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Sending...' : '✅ Confirm Booking Request'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
