import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, loading } = useAuth();

  // Solo mostrar en desarrollo
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded text-xs max-w-xs">
      <div className="font-bold">Auth Debug (Dev Only)</div>
      <div>Authenticated: {user ? 'Yes' : 'No'}</div>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      {user && (
        <div>
          <div>User: {user.user_metadata?.full_name || user.email || 'N/A'}</div>
          <div>Email: {user.email}</div>
          <div>Admin: {user.user_metadata?.is_admin ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default AuthDebug; 