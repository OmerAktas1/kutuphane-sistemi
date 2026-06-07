import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore, selectIsAuthenticated, useIsAuthLoading } from '@/hooks/useAuthStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isLoading = useIsAuthLoading();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const token = useAuthStore((state) => state.token);

  // Debug logging (remove in production)
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    console.log('[ProtectedRoute] Auth state:', {
      isLoading,
      isAuthenticated,
      hasToken: !!token,
      path: window.location.pathname,
    });
  }

  // While auth is loading/hydrating, show nothing (prevent flash)
  if (isLoading) {
    console.log('[ProtectedRoute] Auth loading, waiting...');
    return null;
  }

  // Only redirect if definitively not authenticated
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, show protected content
  console.log('[ProtectedRoute] Authenticated, showing content');
  return <>{children}</>;
}