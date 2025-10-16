import React from 'react';
import { MessageSquare } from 'lucide-react';
import UserFeedbackList from '../components/UserFeedbackList';
import { useAuth } from '../hooks/useAuth';

const UserFeedback: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Debes iniciar sesión para ver tus sugerencias</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <MessageSquare className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Notificaciones
            </h1>
          </div>
          <p className="text-gray-600">
            Aquí puedes ver todas tus notificaciones, sugerencias enviadas y respuestas del administrador.
          </p>
        </div>

        {/* Lista de feedback */}
        <UserFeedbackList userId={user.id} />
      </div>
    </div>
  );
};

export default UserFeedback;
