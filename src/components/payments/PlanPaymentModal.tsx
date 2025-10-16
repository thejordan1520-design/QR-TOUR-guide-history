import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import PayPalLogo from '../ui/PayPalLogo';
import PayPalButton from './PayPalButton';

interface PlanPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    price: number;
    features: string[];
    duration: number;
  };
  onSuccess: (details: any) => void;
  onError?: (error: any) => void;
}

const PlanPaymentModal: React.FC<PlanPaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSuccess,
  onError
}) => {
  const { t } = useTranslation();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const handlePayPalSuccess = (details: any) => {
    console.log('PayPal payment successful:', details);
    setPaymentStatus('success');
    onSuccess(details);
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal payment error:', error);
    
    // Si es una cancelación del usuario, no mostrar como error
    if (error.message === 'Payment cancelled by user') {
      setErrorMessage('');
      setPaymentStatus('idle');
      return;
    }
    
    // Solo mostrar error para errores reales
    setErrorMessage('Error en el pago de PayPal. Inténtalo de nuevo.');
    setPaymentStatus('error');
    
    // Llamar a la función onError del padre si existe
    if (onError) {
      onError(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {t('payment.title')} - {plan.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Plan Summary */}
        <div className="p-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-800">{plan.name}</h3>
              <p className="text-gray-600">{t('payment.planDetails')}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">${plan.price}</div>
              <div className="text-sm text-gray-500">{t('payment.oneTime')}</div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('payment.features')}:</h4>
            <ul className="space-y-1">
              {plan.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  {feature}
                </li>
              ))}
              {plan.features.length > 3 && (
                <li className="text-sm text-gray-500">
                  +{plan.features.length - 3} {t('payment.moreFeatures')}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Payment Section */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {t('payment.selectMethod')}
          </h3>

          {/* PayPal Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-4">
              <PayPalLogo />
              <span className="ml-2 text-sm text-gray-600">{t('payment.paypal.description')}</span>
            </div>
            
            {/* PayPal Button Container */}
            {(plan.price === 5 || plan.price === 15) ? (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium text-gray-800">{plan.name}</div>
                    <div className="text-2xl font-bold text-blue-600">${plan.price}</div>
                  </div>
                  <div className="w-48">
                    <PayPalButton
                      planId={plan.id}
                      amount={plan.price}
                      onSuccess={handlePayPalSuccess}
                      onError={handlePayPalError}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  PayPal - Pago rápido y seguro con tu cuenta PayPal
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">PayPal disponible para planes de $5 y $15</p>
              </div>
            )}
          </div>

          {/* Payment Status */}
          {paymentStatus === 'success' && (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-800 mb-2">
                {t('payment.success.title')}
              </h3>
              <p className="text-gray-600">{t('payment.success.message')}</p>
            </div>
          )}

          {paymentStatus === 'error' && (
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">
                {t('payment.error.title')}
              </h3>
              <p className="text-gray-600 mb-4">{errorMessage}</p>
              <button
                onClick={() => {
                  setPaymentStatus('idle');
                  setErrorMessage('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">
              {t('payment.secure')} 🔒 SSL Encriptado
            </p>
            <p className="text-xs text-gray-400">
              {t('payment.terms')} • {t('payment.privacy')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanPaymentModal;