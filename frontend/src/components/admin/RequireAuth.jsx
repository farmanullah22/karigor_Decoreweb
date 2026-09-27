import { Navigate, useLocation } from 'react-router-dom';

import { LoadingBlock } from '../common/States';
import { useAuth } from '../../context/AuthContext';

/**
 * Route guard for the admin area:
 * - waits for the stored-session restore to finish,
 * - redirects unauthenticated visitors to /admin/login,
 * - remembers the intended destination so login can return there.
 */
export default function RequireAuth({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <LoadingBlock label="Checking your session…" minHeight="100vh" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}
