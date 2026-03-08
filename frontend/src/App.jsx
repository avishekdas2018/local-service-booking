import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Navbar from './components/NavBar';


// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer

import HomePage from './pages/customer/HomePage';
import BrowsePage from './pages/customer/BrowsePage';
import ProviderDetailPage from './pages/customer/ProviderDetailPage';
import BookingFormPage from './pages/customer/BookingFormPage';
import MyBookingsPage from './pages/customer/MyBookingsPage';
import BookingDetailPage from './pages/customer/BookingDetailPage';

// Provider
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderProfilePage from './pages/provider/ProviderProfilePage';
import ProviderBookingsPage from './pages/provider/ProviderBookingsPage';
import JobDetailPage from './pages/provider/JobDetailPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import ProviderApprovalPage from './pages/admin/ProviderApprovalPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import ReviewModerationPage from './pages/admin/ReviewModerationPage';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/providers/:id" element={<ProviderDetailPage />} />

        {/* Customer */}
        <Route path="/book/:providerId" element={<ProtectedRoute roles={['customer']}><BookingFormPage /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute roles={['customer']}><MyBookingsPage /></ProtectedRoute>} />
        <Route path="/my-bookings/:id" element={<ProtectedRoute roles={['customer']}><BookingDetailPage /></ProtectedRoute>} />

        {/* Provider */}
        <Route path="/provider" element={<ProtectedRoute roles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
        <Route path="/provider/profile" element={<ProtectedRoute roles={['provider']}><ProviderProfilePage /></ProtectedRoute>} />
        <Route path="/provider/bookings" element={<ProtectedRoute roles={['provider']}><ProviderBookingsPage /></ProtectedRoute>} />
        <Route path="/provider/bookings/:id" element={<ProtectedRoute roles={['provider']}><JobDetailPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/providers" element={<ProtectedRoute roles={['admin']}><ProviderApprovalPage /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute roles={['admin']}><CategoriesPage /></ProtectedRoute>} />
        <Route path="/admin/reviews" element={<ProtectedRoute roles={['admin']}><ReviewModerationPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
