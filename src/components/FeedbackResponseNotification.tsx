import React, { useState, useEffect } from 'react';
import { CheckCircle, X, MessageSquare, Clock } from 'lucide-react';

interface FeedbackResponseNotificationProps {
  feedbackId: string;
  adminResponse: string;
  respondedAt: string;
  destinationTitle?: string;
  onClose: () => void;
  onViewDetails?: () => void;
}

const FeedbackResponseNotification: React.FC<FeedbackResponseNotificationProps> = ({
  feedbackId,
  adminResponse,
  respondedAt,
  destinationTitle,
  onClose,
  onViewDetails
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-close after 10 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
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

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right-full duration-300">
      <div className="bg-white rounded-lg shadow-lg border border-green-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                ¡El admin respondió a tu sugerencia!
              </h4>
              <button
                onClick={handleClose}
                className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {destinationTitle && (
              <p className="text-xs text-gray-500 mt-1">
                Destino: {destinationTitle}
              </p>
            )}
            
            <div className="mt-2 p-3 bg-green-50 rounded-md">
              <div className="flex items-start space-x-2">
                <MessageSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 line-clamp-3">
                  {adminResponse}
                </p>
              </div>
            </div>
            
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{formatDate(respondedAt)}</span>
              </div>
              
              {onViewDetails && (
                <button
                  onClick={onViewDetails}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  Ver detalles
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackResponseNotification;
