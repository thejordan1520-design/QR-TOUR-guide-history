import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import PayPalPayment from './PayPalPayment';
import PayPalBasicPlanButton from './PayPalBasicPlanButton';
import CardPayment from './CardPayment';
import PayPalLogo from '../ui/PayPalLogo';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    price: number;
    features: string[];
  };
  onSuccess: (details: any) => void;
}

type PaymentMethod = 'card' | 'paypal';

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSuccess
}) => {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePaymentSuccess = (details: any) => {
    setPaymentStatus('success');
    setTimeout(() => {
      onSuccess(details);
      onClose();
    }, 2000);
  };

  const handlePaymentError = (error: any) => {
    setPaymentStatus('error');
    setErrorMessage(error.message || 'Error en el pago');
  };

  const handlePaymentCancel = () => {
    setPaymentStatus('idle');
    setErrorMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

        {/* Payment Methods Selection */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {t('payment.selectMethod')}
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setSelectedMethod('card')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                selectedMethod === 'card'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-800">{t('payment.card.title')}</div>
                <div className="text-sm text-gray-500">{t('payment.card.subtitle')}</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedMethod('paypal')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                selectedMethod === 'paypal'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <PayPalLogo />
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-800">{t('payment.paypal.title')}</div>
                <div className="text-sm text-gray-500">{t('payment.paypal.subtitle')}</div>
              </div>
            </button>
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
              <p className="text-gray-600">{errorMessage}</p>
              <button
                onClick={handlePaymentCancel}
                className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {t('payment.tryAgain')}
              </button>
            </div>
          )}

          {/* Payment Component */}
          {paymentStatus === 'idle' && (
            <div>
              {selectedMethod === 'card' ? (
                <CardPayment
                  amount={plan.price}
                  planId={plan.id}
                  planName={plan.name}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              ) : (
                // Usar botón específico para plan básico de $5 USD
                plan.price === 5 ? (
                  <PayPalBasicPlanButton
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    onCancel={handlePaymentCancel}
                  />
                ) : (
                  <PayPalPayment
                    amount={plan.price}
                    planId={plan.id}
                    planName={plan.name}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    onCancel={handlePaymentCancel}
                  />
                )
              )}
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

export default PaymentModal; 