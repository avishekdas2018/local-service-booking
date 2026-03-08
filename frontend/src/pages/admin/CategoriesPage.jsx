import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Sidebar from '../../components/SideBar';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ICONS = ['🔧', '⚡', '🧹', '🪚', '🖌️', '🐛', '❄️', '🔌', '🏠', '🚿', '🛁', '🌿', '🔐', '📦', '🚗'];

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [loading, setLoading] = useState('');
  const [modal, setModal] = useState(null); // null | 'create' | category object
  const [form, setForm] = useState({ name: '', description: '', icon: '🔧', isActive: true });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/admin/categories').then(r => r.data.categories),
  });
  const categories = data || [];

  const openCreate = () => { setForm({ name: '', description: '', icon: '🔧', isActive: true }); setModal('create'); };
  const openEdit = (cat) => { setForm({ name: cat.name, description: cat.description, icon: cat.icon, isActive: cat.isActive }); setModal(cat); };

  const save = async () => {
    if (!form.name.trim()) return toast.error('Name required');
    setLoading('save');
    try {
      if (modal === 'create') {
        await api.post('/admin/categories', form);
        toast.success('Category created!');
      } else {
        await api.put(`/admin/categories/${modal._id}`, form);
        toast.success('Category updated!');
      }
      refetch(); qc.invalidateQueries(['admin-stats']); setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(''); }
  };

  const del = async (id) => {
    if (!confirm('Delete this category?')) return;
    setLoading('del-' + id);
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Deleted');
      refetch(); qc.invalidateQueries(['admin-stats']);
    } catch { toast.error('Failed'); }
    finally { setLoading(''); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />
      <main className="dashboard-content">
        <div className="page-header-row">
          <div className="page-header">
            <h1>Service Categories</h1>
            <p>Manage the service categories available on the platform</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ New Category</button>
        </div>

        {isLoading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Icon</th><th>Name</th><th>Description</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontSize: '1.4rem' }}>{c.icon}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '240px' }}>{c.description || '—'}</td>
                    <td><span className={`badge badge-${c.isActive ? 'approved' : 'cancelled'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(c._id)} disabled={loading === 'del-' + c._id}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {modal && (
          <div className="modal-overlay" onClick={() => setModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{modal === 'create' ? 'New Category' : 'Edit Category'}</h3>
                <button className="modal-close" onClick={() => setModal(null)}>×</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" placeholder="e.g. Plumbing" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {ICONS.map(ic => (
                      <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })}
                        style={{ fontSize: '1.4rem', padding: '6px', borderRadius: '8px', border: `2px solid ${form.icon === ic ? 'var(--primary)' : 'var(--border)'}`, background: form.icon === ic ? 'rgba(99,102,241,0.1)' : 'transparent', cursor: 'pointer' }}>
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                    Active (visible on platform)
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={save} disabled={loading === 'save'}>{loading === 'save' ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
