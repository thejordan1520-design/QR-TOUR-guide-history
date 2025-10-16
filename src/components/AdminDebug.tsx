import React from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';

const AdminDebug: React.FC = () => {
  const { isAuthenticated, isLoading, error, user } = useAdminAuth();

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Debug Admin Auth</h3>
      <div className="space-y-2">
        <p><strong>Loading:</strong> {isLoading ? 'Sí' : 'No'}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Sí' : 'No'}</p>
        <p><strong>Error:</strong> {error || 'Ninguno'}</p>
        <p><strong>User:</strong> {user ? user.email : 'Ninguno'}</p>
      </div>
    </div>
  );
};

export default AdminDebug;

