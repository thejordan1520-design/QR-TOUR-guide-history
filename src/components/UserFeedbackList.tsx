import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useUserFeedback } from '../hooks/useUserFeedback';
import FeedbackResponseNotification from './FeedbackResponseNotification';

interface UserFeedbackListProps {
  userId: string;
}

const UserFeedbackList: React.FC<UserFeedbackListProps> = ({ userId }) => {
  const {
    feedback,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    loadFeedback,
    refreshFeedback
  } = useUserFeedback(userId, 10);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState<{
    feedbackId: string;
    adminResponse: string;
    respondedAt: string;
    destinationTitle?: string;
  } | null>(null);

  // Detectar nuevas respuestas del admin
  useEffect(() => {
    feedback.forEach(item => {
      if (item.admin_response && item.responded_at) {
        // Verificar si es una respuesta reciente (últimos 5 minutos)
        const responseTime = new Date(item.responded_at);
        const now = new Date();
        const timeDiff = now.getTime() - responseTime.getTime();
        const minutesDiff = timeDiff / (1000 * 60);

        if (minutesDiff <= 5) {
          // Mostrar notificación
          setNotificationData({
            feedbackId: item.id,
            adminResponse: item.admin_response,
            respondedAt: item.responded_at,
            destinationTitle: item.destination_title
          });
          setShowNotification(true);
        }
      }
    });
  }, [feedback]);

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingBadge = (rating: number) => {
    const badges = {
      5: { text: 'Excelente', color: 'bg-green-100 text-green-800' },
      4: { text: 'Bueno', color: 'bg-blue-100 text-blue-800' },
      3: { text: 'Regular', color: 'bg-yellow-100 text-yellow-800' },
      2: { text: 'Malo', color: 'bg-orange-100 text-orange-800' },
      1: { text: 'Muy malo', color: 'bg-red-100 text-red-800' }
    };
    
    const badge = badges[rating as keyof typeof badges];
    return (
      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
    setNotificationData(null);
  };

  const handleViewDetails = () => {
    // Scroll to the specific feedback item
    if (notificationData) {
      const element = document.getElementById(`feedback-${notificationData.feedbackId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    handleNotificationClose();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={refreshFeedback}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No has enviado sugerencias aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notificación de respuesta del admin */}
      {showNotification && notificationData && (
        <FeedbackResponseNotification
          feedbackId={notificationData.feedbackId}
          adminResponse={notificationData.adminResponse}
          respondedAt={notificationData.respondedAt}
          destinationTitle={notificationData.destinationTitle}
          onClose={handleNotificationClose}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* Lista de feedback */}
      <div className="space-y-4">
        {feedback.map((item) => (
          <div
            key={item.id}
            id={`feedback-${item.id}`}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {item.destination_title || 'Sugerencia General'}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex">
                    {getRatingStars(item.rating)}
                  </div>
                  {getRatingBadge(item.rating)}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {formatDate(item.created_at)}
                </p>
                {item.category && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                    {item.category}
                  </span>
                )}
              </div>
            </div>

            {/* Comentario */}
            <div className="mb-4">
              <p className="text-gray-700">{item.comment}</p>
            </div>

            {/* Respuesta del admin */}
            {item.admin_response && (
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h4 className="text-sm font-medium text-gray-900">
                    Respuesta del Administrador
                  </h4>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-gray-700">{item.admin_response}</p>
                  {item.responded_at && (
                    <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>Respondido el {formatDate(item.responded_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Estado */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  item.admin_response 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.admin_response ? 'Respondido' : 'Pendiente'}
                </span>
                {item.is_public && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Público
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => loadFeedback(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          
          <span className="px-3 py-2 text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          
          <button
            onClick={() => loadFeedback(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default UserFeedbackList;
