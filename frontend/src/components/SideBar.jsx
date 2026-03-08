import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const providerLinks = [
  { to: '/provider', label: 'Dashboard', icon: '📊', end: true },
  { to: '/provider/profile', label: 'My Profile', icon: '👤' },
  { to: '/provider/bookings', label: 'Bookings', icon: '📋' },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/providers', label: 'Provider Approvals', icon: '✅' },
  { to: '/admin/categories', label: 'Categories', icon: '🗂️' },
  { to: '/admin/reviews', label: 'Review Moderation', icon: '⭐' },
];

export default function Sidebar({ role }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const links = role === 'admin' ? adminLinks : providerLinks;

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div style={{ padding: '0 12px 16px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
        <NavLink to="/" style={{ fontSize: '1.2rem', fontWeight: 800, background: 'linear-gradient(135deg, #818CF8, #10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ⚡ LocalPro
        </NavLink>
      </div>
      <span className="sidebar-title">Navigation</span>
      {links.map(l => (
        <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span>{l.icon}</span> {l.label}
        </NavLink>
      ))}
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
        <NavLink to="/browse" className="sidebar-link"><span>🔍</span> Browse</NavLink>
        <button className="sidebar-link" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
