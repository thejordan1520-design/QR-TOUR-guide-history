import React, { useState } from 'react';
import { Star, MessageSquare, Send, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { feedbackService } from '../../services/supabaseServices';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  destinationId?: string;
  destinationTitle?: string;
}

interface FeedbackData {
  rating: number;
  comment: string;
  category: 'general' | 'bug' | 'feature' | 'improvement' | 'other';
  isPublic: boolean;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  destinationId,
  destinationTitle
}) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FeedbackData>({
    rating: 0,
    comment: '',
    category: 'suggestion',
    isPublic: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const categories = [
    { value: 'suggestion', label: 'Sugerencia', icon: '💡' },
    { value: 'bug', label: 'Algo no está bien', icon: '⚠️' },
    { value: 'compliment', label: 'Elogio', icon: '👍' }
  ];

  const ratingEmojis = [
    { value: 1, emoji: '😞', label: 'Muy malo' },
    { value: 2, emoji: '😕', label: 'Malo' },
    { value: 3, emoji: '😐', label: 'Neutral' },
    { value: 4, emoji: '😊', label: 'Bueno' },
    { value: 5, emoji: '😍', label: 'Excelente' }
  ];

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleInputChange = (field: keyof FeedbackData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setSubmitResult({
        type: 'error',
        message: 'Debes iniciar sesión para enviar feedback'
      });
      return;
    }

    if (formData.rating === 0) {
      setSubmitResult({
        type: 'error',
        message: 'Por favor selecciona una calificación'
      });
      return;
    }

    if (formData.comment.trim().length < 10) {
      setSubmitResult({
        type: 'error',
        message: 'El comentario debe tener al menos 10 caracteres'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Detectar idioma actual
      const currentLanguage = i18n.language || 'es';
      
      console.log(`📝 Enviando feedback en idioma: ${currentLanguage}`);
      
      // Enviar feedback usando el servicio de Supabase
      const { data, error } = await feedbackService.createFeedback({
        userId: user.id,
        destinationId,
        destinationTitle,
        rating: formData.rating,
        comment: formData.comment,
        category: formData.category,
        isPublic: formData.isPublic,
        language: currentLanguage // ✅ Pasar idioma actual
      });

      if (error) {
        throw new Error(error.message || 'Error al enviar feedback');
      }

      setSubmitResult({
        type: 'success',
        message: '¡Gracias por tu feedback! Lo revisaremos pronto.'
      });

      // Resetear formulario
      setFormData({
        rating: 0,
        comment: '',
        category: 'suggestion',
        isPublic: false
      });

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitResult({
        type: 'error',
        message: 'Error al enviar feedback. Inténtalo de nuevo.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Tu Feedback
              </h2>
              <p className="text-sm text-gray-500">
                Nos gustaría tu feedback para mejorar nuestro sitio web.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿Cuál es tu opinión sobre esta página? *
            </label>
            <div className="flex gap-3 justify-center">
              {ratingEmojis.map((rating) => (
                <button
                  key={rating.value}
                  type="button"
                  onClick={() => handleRatingChange(rating.value)}
                  className={`p-3 rounded-full transition-all ${
                    formData.rating === rating.value
                      ? 'bg-orange-100 border-2 border-orange-400 scale-110'
                      : 'hover:bg-gray-100 hover:scale-105'
                  }`}
                  title={rating.label}
                >
                  <span className="text-3xl">{rating.emoji}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Muy malo</span>
              <span>Excelente</span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Por favor selecciona tu categoría de feedback a continuación.
            </label>
            <div className="grid grid-cols-1 gap-3">
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleInputChange('category', category.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.category === category.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="text-sm font-medium">{category.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Por favor deja tu feedback a continuación: *
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe tu experiencia, sugerencias o problemas..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 10 caracteres ({formData.comment.length}/10)
            </p>
          </div>


          {/* Submit Result */}
          {submitResult && (
            <div className={`p-4 rounded-lg flex items-center gap-2 ${
              submitResult.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {submitResult.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm">{submitResult.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.rating === 0 || formData.comment.trim().length < 10}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
