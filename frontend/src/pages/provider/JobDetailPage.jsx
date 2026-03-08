import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../../components/SideBar';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState('');
  const [imageType, setImageType] = useState('before');
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const { data: booking, isLoading, refetch } = useQuery({
    queryKey: ['provider-booking', id],
    queryFn: () => api.get('/provider/bookings').then(r => r.data.bookings.find(b => b._id === id)),
  });

  const action = async (endpoint, body = {}) => {
    setLoading(true);
    try {
      await api.patch(`/provider/bookings/${id}/${endpoint}`, body);
      toast.success('Updated!');
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setLoading(true);
    try {
      await api.post(`/provider/bookings/${id}/notes`, { note });
      setNote('');
      toast.success('Note added');
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const uploadImages = async () => {
    if (!imageFiles.length) return toast.error('Select images first');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('type', imageType);
      imageFiles.forEach(f => fd.append('images', f));
      await api.post(`/provider/bookings/${id}/images`, fd);
      toast.success('Images uploaded!');
      setImageFiles([]);
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  if (isLoading) return <div className="dashboard-layout"><Sidebar role="provider" /><div className="dashboard-content"><div className="spinner-wrap"><div className="spinner" /></div></div></div>;
  if (!booking) return <div className="dashboard-layout"><Sidebar role="provider" /><div className="dashboard-content"><div className="empty-state"><h3>Booking not found</h3></div></div></div>;

  const buttons = {
    requested: [
      { label: '✅ Accept', cls: 'btn-success', fn: () => action('accept') },
      { label: '✕ Reject', cls: 'btn-danger', fn: () => action('reject', { reason: 'Rejected by provider' }) },
    ],
    confirmed: [{ label: '▶ Start Job', cls: 'btn-warning', fn: () => action('start') }],
    'in-progress': [{ label: '✓ Mark Complete', cls: 'btn-success', fn: () => action('complete') }],
  };
  const actionBtns = buttons[booking.status] || [];

  return (
    <div className="dashboard-layout">
      <Sidebar role="provider" />
      <main className="dashboard-content">
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: '16px' }} onClick={() => navigate('/provider/bookings')}>← Back to Bookings</button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
          <div>
            {/* Booking Info */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{booking.category?.icon}</span>
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{booking.category?.name}</h1>
                  </div>
                  <span className={`badge badge-${booking.status}`} style={{ fontSize: '0.85rem' }}>{booking.status}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>₹{booking.pricingSnapshot?.estimatedTotal}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>estimated</div>
                </div>
              </div>
              {[
                ['Customer', booking.customer?.name],
                ['Email', booking.customer?.email],
                ['Address', booking.address],
                ['City / Area', `${booking.city}${booking.area ? ', ' + booking.area : ''}`],
                ['Scheduled', new Date(booking.scheduledDate).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })],
                ['Customer Notes', booking.notes || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ minWidth: '110px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{k}</span>
                  <span style={{ fontSize: '0.9rem' }}>{v}</span>
                </div>
              ))}
              {booking.customerImage && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Customer Photo:</div>
                  <img src={booking.customerImage} alt="customer upload" style={{ width: '120px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {actionBtns.length > 0 && (
              <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Actions</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {actionBtns.map(btn => (
                    <button key={btn.label} className={`btn ${btn.cls} btn-lg`} onClick={btn.fn} disabled={loading}>{btn.label}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Work Notes */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Work Notes</h3>
              {booking.workNotes?.map((n, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-card2)', borderRadius: '8px', marginBottom: '8px' }}>
                  <p style={{ fontSize: '0.9rem', marginBottom: '4px' }}>{n.note}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(n.addedAt).toLocaleString()}</p>
                </div>
              ))}
              {['confirmed', 'in-progress', 'completed'].includes(booking.status) && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                  <input className="form-input" placeholder="Add a work note..." value={note} onChange={e => setNote(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addNote()} style={{ flex: 1 }} />
                  <button className="btn btn-outline" onClick={addNote} disabled={loading}>Add</button>
                </div>
              )}
            </div>

            {/* Images */}
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Before / After Photos</h3>
              {booking.beforeImages?.length > 0 && (
                <><div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem' }}>Before</div>
                  <div className="images-grid" style={{ marginBottom: '16px' }}>{booking.beforeImages.map((img, i) => <img key={i} src={img} alt="before" />)}</div></>
              )}
              {booking.afterImages?.length > 0 && (
                <><div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem' }}>After</div>
                  <div className="images-grid" style={{ marginBottom: '16px' }}>{booking.afterImages.map((img, i) => <img key={i} src={img} alt="after" />)}</div></>
              )}
              {['in-progress', 'completed'].includes(booking.status) && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-input" value={imageType} onChange={e => setImageType(e.target.value)}>
                      <option value="before">Before</option>
                      <option value="after">After</option>
                    </select>
                  </div>
                  <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                    <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => setImageFiles(Array.from(e.target.files))} />
                    📷 {imageFiles.length > 0 ? `${imageFiles.length} selected` : 'Select Images'}
                  </label>
                  <button className="btn btn-primary" onClick={uploadImages} disabled={loading}>Upload</button>
                </div>
              )}
            </div>
          </div>

          {/* Status sidebar */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Job Timeline</h3>
            <div className="timeline">
              {['requested', 'confirmed', 'in-progress', 'completed'].map((s, i, arr) => {
                const hist = booking.statusHistory?.find(h => h.status === s);
                const statusOrder = ['requested', 'confirmed', 'in-progress', 'completed', 'cancelled'];
                const curIndex = statusOrder.indexOf(booking.status);
                const sIndex = statusOrder.indexOf(s);
                const isDone = curIndex > sIndex || booking.status === s;
                return (
                  <div key={s} className="timeline-item">
                    {i < arr.length - 1 && <div className={`timeline-line ${isDone ? 'done' : ''}`} />}
                    <div className={`timeline-dot ${isDone ? 'done' : ''}`}>{isDone ? '✓' : i + 1}</div>
                    <div className="timeline-body">
                      <div className="timeline-title" style={{ textTransform: 'capitalize' }}>{s.replace('-', ' ')}</div>
                      {hist && <div className="timeline-time">{new Date(hist.changedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</div>}
                    </div>
                  </div>
                );
              })}
              {booking.status === 'cancelled' && (
                <div className="timeline-item">
                  <div className="timeline-dot" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>✕</div>
                  <div className="timeline-body"><div className="timeline-title" style={{ color: 'var(--danger)' }}>Cancelled</div></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
