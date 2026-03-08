import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ALL_STATUSES = ['requested', 'confirmed', 'in-progress', 'completed', 'cancelled'];

function StatusTimeline({ statusHistory, currentStatus }) {
  const reached = ALL_STATUSES.indexOf(currentStatus);
  return (
    <div className="timeline">
      {ALL_STATUSES.filter(s => s !== 'cancelled').map((s, i) => {
        const isCancelled = currentStatus === 'cancelled';
        const hist = statusHistory?.find(h => h.status === s);
        const isDone = reached > i || (s === currentStatus && s !== 'cancelled');
        const isActive = s === currentStatus;
        return (
          <div key={s} className="timeline-item">
            {i < ALL_STATUSES.filter(x => x !== 'cancelled').length - 1 && (
              <div className={`timeline-line ${isDone ? 'done' : ''}`} />
            )}
            <div className={`timeline-dot ${isDone ? 'done' : ''} ${isActive && !isDone ? 'active' : ''}`}>
              {isDone ? '✓' : i + 1}
            </div>
            <div className="timeline-body">
              <div className="timeline-title" style={{ textTransform: 'capitalize' }}>{s.replace('-', ' ')}</div>
              {hist && <div className="timeline-time">{new Date(hist.changedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>}
              {hist?.reason && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{hist.reason}</div>}
            </div>
          </div>
        );
      })}
      {currentStatus === 'cancelled' && (
        <div className="timeline-item">
          <div className="timeline-dot" style={{ borderColor: 'var(--danger)', background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}>✕</div>
          <div className="timeline-body">
            <div className="timeline-title" style={{ color: 'var(--danger)' }}>Cancelled</div>
            {statusHistory?.find(h => h.status === 'cancelled') && (
              <div className="timeline-time">{new Date(statusHistory.find(h => h.status === 'cancelled').changedAt).toLocaleString()}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-picker">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" className={s <= (hover || value) ? 'filled' : ''}
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => onChange(s)}>★</button>
      ))}
    </div>
  );
}

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [cancelLoading, setCancelLoading] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => api.get(`/customer/bookings/${id}`).then(r => r.data.booking),
  });

  const booking = data;

  const canCancel = ['requested', 'confirmed'].includes(booking?.status);
  const canReschedule = ['requested', 'confirmed'].includes(booking?.status);
  const canReview = booking?.status === 'completed' && !booking?.hasReview;

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await api.patch(`/customer/bookings/${id}/cancel`, { reason: 'Cancelled by customer' });
      toast.success('Booking cancelled');
      setShowCancelConfirm(false);
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setCancelLoading(false); }
  };

  const handleReschedule = async () => {
    if (!newDate) return toast.error('Select a new date');
    setRescheduleLoading(true);
    try {
      await api.patch(`/customer/bookings/${id}/reschedule`, { newDate });
      toast.success('Booking rescheduled!');
      setShowReschedule(false);
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setRescheduleLoading(false); }
  };

  const handleReview = async () => {
    setReviewLoading(true);
    try {
      await api.post(`/customer/bookings/${id}/review`, review);
      toast.success('Review submitted! Thank you 🎉');
      setShowReview(false);
      refetch();
      qc.invalidateQueries(['my-bookings']);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setReviewLoading(false); }
  };

  if (isLoading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!booking) return null;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '860px' }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: '16px' }} onClick={() => navigate('/my-bookings')}>← Back</button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
          <div>
            {/* Header card */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.8rem' }}>{booking.category?.icon || '🔧'}</span>
                <div>
                  <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>{booking.category?.name}</h1>
                  <span className={`badge badge-${booking.status}`}>{booking.status}</span>
                </div>
              </div>
              {[
                ['Provider', booking.provider?.name],
                ['Address', booking.address],
                ['City / Area', `${booking.city}${booking.area ? ', ' + booking.area : ''}`],
                ['Scheduled', new Date(booking.scheduledDate).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })],
                ['Notes', booking.notes || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ minWidth: '100px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{k}</span>
                  <span style={{ fontSize: '0.9rem' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="pricing-panel" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '12px' }}>Pricing</h3>
              <div className="pricing-row"><span>Rate</span><span>₹{booking.pricingSnapshot?.hourlyRate}/hr</span></div>
              <div className="pricing-row"><span>Est. Hours</span><span>{booking.pricingSnapshot?.estimatedHours}h</span></div>
              <div className="pricing-row"><span>Total Estimate</span><span style={{ color: 'var(--accent)' }}>₹{booking.pricingSnapshot?.estimatedTotal}</span></div>
            </div>

            {/* Work Notes */}
            {booking.workNotes?.length > 0 && (
              <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '12px' }}>Work Notes from Provider</h3>
                {booking.workNotes.map((n, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-card2)', borderRadius: '8px', marginBottom: '8px' }}>
                    <p style={{ fontSize: '0.9rem', marginBottom: '4px' }}>{n.note}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(n.addedAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Before/After Images */}
            {(booking.beforeImages?.length > 0 || booking.afterImages?.length > 0) && (
              <div className="card" style={{ marginBottom: '20px' }}>
                {booking.beforeImages?.length > 0 && (<><h3 style={{ fontWeight: 700, marginBottom: '10px' }}>Before</h3><div className="images-grid">{booking.beforeImages.map((img, i) => <img key={i} src={img} alt="before" />)}</div></>)}
                {booking.afterImages?.length > 0 && (<><h3 style={{ fontWeight: 700, margin: '16px 0 10px' }}>After</h3><div className="images-grid">{booking.afterImages.map((img, i) => <img key={i} src={img} alt="after" />)}</div></>)}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {canReschedule && <button className="btn btn-outline" onClick={() => setShowReschedule(!showReschedule)}>📅 Reschedule</button>}
              {canCancel && !showCancelConfirm && <button className="btn btn-danger" onClick={() => setShowCancelConfirm(true)}>✕ Cancel Booking</button>}
              {canReview && <button className="btn btn-warning" onClick={() => setShowReview(!showReview)}>⭐ Leave Review</button>}
            </div>

            {/* Cancel confirmation */}
            {showCancelConfirm && (
              <div className="card" style={{ marginTop: '16px', border: '1px solid var(--danger)' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--danger)' }}>Cancel this booking?</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>This action cannot be undone. The provider will be notified.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-danger" onClick={handleCancel} disabled={cancelLoading}>{cancelLoading ? 'Cancelling...' : 'Yes, Cancel Booking'}</button>
                  <button className="btn btn-ghost" onClick={() => setShowCancelConfirm(false)}>Go Back</button>
                </div>
              </div>
            )}

            {/* Reschedule form */}
            {showReschedule && (
              <div className="card" style={{ marginTop: '16px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '12px' }}>Select New Date & Time</h3>
                <input className="form-input" type="datetime-local" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ marginBottom: '12px' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" onClick={handleReschedule} disabled={rescheduleLoading}>Confirm Reschedule</button>
                  <button className="btn btn-ghost" onClick={() => setShowReschedule(false)}>Cancel</button>
                </div>
              </div>
            )}

            {/* Review form */}
            {showReview && (
              <div className="card" style={{ marginTop: '16px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Rate Your Experience</h3>
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Rating</label>
                  <StarPicker value={review.rating} onChange={r => setReview({ ...review, rating: r })} />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Comment (Optional)</label>
                  <textarea className="form-input" rows={3} placeholder="Share your experience..." value={review.comment} onChange={e => setReview({ ...review, comment: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary" onClick={handleReview} disabled={reviewLoading}>{reviewLoading ? 'Submitting...' : 'Submit Review'}</button>
                  <button className="btn btn-ghost" onClick={() => setShowReview(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div>
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Booking Timeline</h3>
              <StatusTimeline statusHistory={booking.statusHistory} currentStatus={booking.status} />
            </div>
            {booking.rescheduleHistory?.length > 0 && (
              <div className="card" style={{ marginTop: '16px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '12px' }}>Reschedule History</h3>
                {booking.rescheduleHistory.map((r, i) => (
                  <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {new Date(r.oldDate).toLocaleDateString()} → {new Date(r.newDate).toLocaleDateString()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
