import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loader from './Loader';

// Wraps admin-only routes - redirects non-admins back to the home page
const AdminRoute = () => {
  const { isAdmin, loading, isAuthenticated } = useAuth();

  if (loading) return <Loader fullscreen label="Checking permissions" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default AdminRoute;
