import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { useToast } from './Toast';

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isInitializing, user } = useAuthStore();
  const { showToast } = useToast();
  const location = useLocation();
  const hasToasted = useRef(false);

  // Show toast only once via effect, never during render
  useEffect(() => {
    if (isInitializing) return;

    if (!isAuthenticated && !hasToasted.current) {
      hasToasted.current = true;
      showToast('Please log in to access this page', 'warning');
    } else if (isAuthenticated && allowedRoles && !allowedRoles.includes(user?.role) && !hasToasted.current) {
      hasToasted.current = true;
      showToast('You do not have permission to access this page', 'error');
    }
  }, [isAuthenticated, isInitializing, allowedRoles, user?.role, showToast]);

  // Reset toast ref when location changes
  useEffect(() => {
    hasToasted.current = false;
  }, [location.pathname]);

  // Show nothing while auth is initializing
  if (isInitializing) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--color-bg)',
      }}>
        <div className="btn__spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
