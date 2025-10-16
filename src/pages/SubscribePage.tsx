import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubscribePage } from '../hooks/useSubscribePage';
import PlanPaymentModal from '../components/payments/PlanPaymentModal';
import { CheckCircle, Star, CreditCard } from 'lucide-react';
import PayPalLogo from '../components/ui/PayPalLogo';

const SubscribePage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Usar el hook optimizado para cargar datos de suscripción
  const { plans } = useSubscribePage(t);

  // Detectar parámetros URL para auto-abrir modal de pago
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('plan');
    const autoPay = urlParams.get('autoPay');

    if (planId && autoPay === 'true' && plans.length > 0) {
      // Buscar el plan específico
      const targetPlan = plans.find(plan => plan.id === planId);
      if (targetPlan) {
        setSelectedPlan(targetPlan);
        setShowPaymentModal(true);
        setPaymentStatus('idle');
        
        // Limpiar la URL después de abrir el modal
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [plans]);


  const handleCardClick = (plan: any) => {
    setSelectedPlan(plan);
    setPaymentStatus('idle');
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (details: any) => {
    setPaymentStatus('success');
    console.log('Payment successful:', details);
    alert(t('subscribe.paymentSuccess'));
    setShowPaymentModal(false);
  };

  const handlePaymentError = (error: any) => {
    setPaymentStatus('error');
    console.error('Payment error:', error);
    alert(t('subscribe.paymentError'));
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'purple': return 'bg-purple-500';
      case 'gold': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriceColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'green': return 'text-green-600';
      case 'purple': return 'text-purple-600';
      case 'gold': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getDurationText = (duration: number) => {
    if (duration <= 24) return `${duration}h`;
    if (duration <= 168) return `${duration/24}d`;
    if (duration <= 720) return `${duration/24}d`;
    return `${duration/8760}año`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('subscribe.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subscribe.subtitle')}
          </p>
        </div>

        {/* Payment Status Messages */}
        {paymentStatus === 'success' && (
          <div className="max-w-md mx-auto mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-800">{t('subscribe.paymentSuccess')}</p>
            </div>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="max-w-md mx-auto mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{t('subscribe.paymentError')}</p>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 cursor-pointer ${
                selectedPlan?.id === plan.id ? 'ring-4 ring-blue-500' : ''
              }`}
              onClick={() => handleCardClick(plan)}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-white px-3 py-1 rounded-bl-lg text-sm font-semibold flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  {t('plans.popular')}
                </div>
              )}

              {/* Header */}
              <div className={`p-6 ${getColorClasses(plan.color)} text-white`}>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="ml-2 text-lg opacity-90">
                    / {getDurationText(plan.duration)}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="p-6">
                <ul className="space-y-3">
                  {plan.features.slice(0, 5).map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 5 && (
                    <li className="text-gray-500 text-sm">
                      +{plan.features.length - 5} {t('plans.features.more_features')}
                    </li>
                  )}
                </ul>

                {/* Action Button */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(plan);
                    }}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      plan.popular
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : `bg-gray-100 hover:bg-gray-200 ${getPriceColor(plan.color)}`
                    }`}
                  >
                    {t('subscribe.selectPlan')}
                  </button>

                  {/* Botón desbloquear audios con link de admin (paypal_link) */}
                  <a
                    href={(plan as any).paypal_link || '#'}
                    onClick={(e) => {
                      if (!(plan as any).paypal_link) {
                        e.preventDefault();
                        alert(t('plans.no_payment_link'));
                      } else {
                        e.stopPropagation();
                      }
                    }}
                    className="w-full text-center py-3 px-4 rounded-lg font-semibold transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {t('plans.unlock_audios')}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('payment.methods')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer">
              <div className="flex items-center mb-4">
                <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-800">{t('payment.credit_card')}</h3>
                  <p className="text-gray-600 text-sm">{t('payment.credit_card_description')}</p>
                </div>
              </div>
            </div>
            
            <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer">
              <div className="flex items-center mb-4">
                <PayPalLogo className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-800">{t('payment.paypal')}</h3>
                  <p className="text-gray-600 text-sm">{t('payment.paypal_description')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PlanPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          plan={selectedPlan}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
    </div>
  );
};

export default SubscribePage;