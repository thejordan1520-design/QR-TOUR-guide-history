import React, { ReactNode, useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children?: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Memoizar la lógica de redirección para evitar loops infinitos
  const redirectPath = useMemo(() => {
    if (loading) return null;
    // Permitir siempre la pantalla de login del admin
    if (location.pathname === '/admin/login') {
      return null;
    }
    
    if (!user) {
      const isAdminPath = location.pathname.startsWith('/admin');
      return isAdminPath ? '/admin/login' : '/';
    }
    
    if (requireAdmin && !user.is_admin) {
      return '/admin/login';
    }
    
    return null;
  }, [loading, user, requireAdmin, location.pathname]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (redirectPath && location.pathname !== redirectPath) {
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;