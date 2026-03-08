import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';


export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const dashboardLink = () => {
    if (!user) return null;
    if (user.role === 'admin') return { to: '/admin', label: 'Admin Panel' };
    if (user.role === 'provider') return { to: '/provider', label: 'Dashboard' };
    return { to: '/my-bookings', label: 'My Bookings' };
  };

  const dash = dashboardLink();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">⚡ LocalPro</Link>
        <div className="navbar-links">
          <Link to="/browse">Browse</Link>
          {dash && <Link to={dash.to}>{dash.label}</Link>}
          {user ? (
            <>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '8px 4px' }}>
                Hi, {user.name.split(' ')[0]}
              </span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
