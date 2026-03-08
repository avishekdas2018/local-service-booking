import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Sidebar from '../../components/SideBar';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('customer');
  const [loading, setLoading] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [showBanModal, setShowBanModal] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', tab],
    queryFn: () => api.get(`/admin/users?role=${tab}`).then(r => r.data.users),
  });
  const users = data || [];

  const startEdit = (u) => {
    setEditingUser(u._id);
    setEditForm({ name: u.name, email: u.email, phone: u.phone || '' });
  };

  const saveEdit = async (id) => {
    setLoading(id + '-edit');
    try {
      await api.put(`/admin/users/${id}`, editForm);
      toast.success('User updated');
      setEditingUser(null);
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(''); }
  };

  const deleteUser = async (id) => {
    setLoading(id + '-delete');
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      setShowDeleteConfirm(null);
      refetch();
      qc.invalidateQueries(['admin-stats']);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(''); }
  };

  const banUser = async (id) => {
    setLoading(id + '-ban');
    try {
      await api.patch(`/admin/users/${id}/ban`, { reason: banReason || 'Violation of platform policies' });
      toast.success('Provider banned');
      setShowBanModal(null);
      setBanReason('');
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(''); }
  };

  const unbanUser = async (id) => {
    setLoading(id + '-unban');
    try {
      await api.patch(`/admin/users/${id}/unban`);
      toast.success('Provider unbanned');
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(''); }
  };

  const toggleActive = async (u) => {
    setLoading(u._id + '-active');
    try {
      await api.put(`/admin/users/${u._id}`, { name: u.name, email: u.email, isActive: !u.isActive });
      toast.success(u.isActive ? 'User deactivated' : 'User activated');
      refetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(''); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />
      <main className="dashboard-content">
        <div className="page-header-row">
          <div className="page-header">
            <h1>User Management</h1>
            <p>View, edit, and manage all platform users</p>
          </div>
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-card)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            {[
              { value: 'customer', icon: '🏠', label: 'Customers' },
              { value: 'provider', icon: '🔧', label: 'Providers' },
              { value: 'admin', icon: '🛡️', label: 'Admins' },
            ].map(t => (
              <button key={t.value}
                className={`btn btn-sm ${tab === t.value ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTab(t.value)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <h3>No {tab}s found</h3>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={thStyle}>USER</th>
                  <th style={thStyle}>EMAIL</th>
                  {tab === 'provider' && <th style={thStyle}>DETAILS</th>}
                  <th style={thStyle}>STATUS</th>
                  <th style={thStyle}>JOINED</th>
                  <th style={thStyle}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const pp = u.providerProfile;
                  const isBanned = pp?.isBanned;
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      {/* Name */}
                      <td style={tdStyle}>
                        {editingUser === u._id ? (
                          <input className="form-input" style={{ width: '140px', padding: '4px 8px', fontSize: '0.85rem' }}
                            value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="provider-avatar" style={{ width: '36px', height: '36px', fontSize: '0.75rem', flexShrink: 0 }}>
                              {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{u.name}</div>
                              {u.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📱 {u.phone}</div>}
                            </div>
                          </div>
                        )}
                      </td>
                      {/* Email */}
                      <td style={tdStyle}>
                        {editingUser === u._id ? (
                          <input className="form-input" style={{ width: '180px', padding: '4px 8px', fontSize: '0.85rem' }}
                            value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</span>
                        )}
                      </td>
                      {/* Provider details */}
                      {tab === 'provider' && (
                        <td style={tdStyle}>
                          {pp ? (
                            <div style={{ fontSize: '0.8rem' }}>
                              <div>₹{pp.hourlyRate}/hr · {pp.experience}yr exp</div>
                              <div style={{ color: 'var(--text-muted)' }}>{pp.city}{pp.area ? ', ' + pp.area : ''}</div>
                              <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                                {pp.categories?.map(c => (
                                  <span key={c._id} className="badge badge-confirmed" style={{ fontSize: '0.7rem' }}>{c.name}</span>
                                ))}
                              </div>
                            </div>
                          ) : (<span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No profile</span>)}
                        </td>
                      )}
                      {/* Status */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className={`badge badge-${u.isActive ? 'approved' : 'cancelled'}`} style={{ fontSize: '0.7rem' }}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {tab === 'provider' && pp && (
                            <>
                              <span className={`badge badge-${pp.isApproved ? 'confirmed' : 'pending'}`} style={{ fontSize: '0.7rem' }}>
                                {pp.isApproved ? 'Approved' : 'Pending'}
                              </span>
                              {isBanned && (
                                <span className="badge badge-cancelled" style={{ fontSize: '0.7rem' }}>🚫 Banned</span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      {/* Joined */}
                      <td style={tdStyle}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </td>
                      {/* Actions */}
                      <td style={tdStyle}>
                        {editingUser === u._id ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-success btn-sm" onClick={() => saveEdit(u._id)}
                              disabled={loading === u._id + '-edit'}>Save</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditingUser(null)}>Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button className="btn btn-outline btn-sm" onClick={() => startEdit(u)}>✏️ Edit</button>
                            {u.role !== 'admin' && (
                              <button className="btn btn-sm"
                                style={{ color: u.isActive ? 'var(--warning)' : 'var(--success)', borderColor: u.isActive ? 'var(--warning)' : 'var(--success)', background: 'transparent', border: '1px solid' }}
                                onClick={() => toggleActive(u)} disabled={loading === u._id + '-active'}>
                                {u.isActive ? '⏸ Deactivate' : '▶ Activate'}
                              </button>
                            )}
                            {tab === 'provider' && pp && !isBanned && (
                              <button className="btn btn-danger btn-sm" onClick={() => setShowBanModal(u._id)}
                                disabled={loading === u._id + '-ban'}>🚫 Ban</button>
                            )}
                            {tab === 'provider' && pp && isBanned && (
                              <button className="btn btn-success btn-sm" onClick={() => unbanUser(u._id)}
                                disabled={loading === u._id + '-unban'}>✅ Unban</button>
                            )}
                            {u.role !== 'admin' && (
                              <button className="btn btn-danger btn-sm" style={{ opacity: 0.7 }}
                                onClick={() => setShowDeleteConfirm(u._id)}>🗑️</button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Ban Modal */}
        {showBanModal && (
          <div style={overlayStyle}>
            <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '12px', color: 'var(--danger)' }}>🚫 Ban Provider</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                This will deactivate the provider's account and hide their listing from search results.
              </p>
              <div className="form-group">
                <label className="form-label">Reason for ban</label>
                <textarea className="form-input" rows={3} placeholder="Explain why..."
                  value={banReason} onChange={e => setBanReason(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button className="btn btn-danger" onClick={() => banUser(showBanModal)}
                  disabled={loading.includes('-ban')}>Confirm Ban</button>
                <button className="btn btn-ghost" onClick={() => { setShowBanModal(null); setBanReason(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div style={overlayStyle}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--danger)' }}>Delete User?</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                This will permanently remove the user and all their associated bookings and reviews. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-danger" onClick={() => deleteUser(showDeleteConfirm)}
                  disabled={loading.includes('-delete')}>Yes, Delete</button>
                <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const thStyle = { padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' };
const tdStyle = { padding: '12px', verticalAlign: 'middle' };
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
