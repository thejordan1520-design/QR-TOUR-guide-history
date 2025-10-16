import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Eye, EyeOff } from 'lucide-react';
import { API_CONFIG } from '../../config/api';

interface CardPaymentProps {
  amount: number;
  planId: string;
  planName: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
}

interface CardFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  email: string;
}

const CardPayment: React.FC<CardPaymentProps> = ({
  amount,
  planId,
  planName,
  onSuccess,
  onError
}) => {
  const { t } = useTranslation();
  const [showCvv, setShowCvv] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      throw new Error('Número de tarjeta inválido');
    }
    if (!formData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      throw new Error('Fecha de expiración inválida');
    }
    if (!formData.cvv.match(/^\d{3,4}$/)) {
      throw new Error('CVV inválido');
    }
    if (!formData.cardholderName.trim()) {
      throw new Error('Nombre del titular requerido');
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Email inválido');
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsProcessing(true);
      validateForm();

      const response = await fetch('${API_CONFIG.EXPRESS_API.baseUrl}/api/payments/card/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          planId,
          planName,
          cardData: {
            ...formData,
            cardNumber: formData.cardNumber.replace(/\s/g, ''),
            processor: 'paypal'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Error al procesar el pago');
      }

      const result = await response.json();
      onSuccess(result);
    } catch (error) {
      console.error('Payment error:', error);
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {t('payment.card.title')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('payment.card.description')}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">{planName}</span>
              <span className="text-xl font-bold text-blue-600">${amount}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          {/* Número de tarjeta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de tarjeta
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
                placeholder="1234 5678 9012 3456"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={19}
                required
              />
            </div>
          </div>

          {/* Fecha de expiración y CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de expiración
              </label>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: formatExpiryDate(e.target.value) }))}
                placeholder="MM/YY"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={5}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <div className="relative">
                <input
                  type={showCvv ? 'text' : 'password'}
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  className="w-full pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={4}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCvv(!showCvv)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCvv ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Nombre del titular */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del titular
            </label>
            <input
              type="text"
              name="cardholderName"
              value={formData.cardholderName}
              onChange={handleInputChange}
              placeholder="Como aparece en la tarjeta"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            </div>
            
          {/* Botón de pago */}
            <button
            type="submit"
              disabled={isProcessing}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Procesando pago...
          </div>
            ) : (
              `Pagar $${amount}`
        )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 mb-2">
            🔒 Pago seguro procesado por PayPal
          </p>
          <p className="text-xs text-gray-400">
            Tus datos están protegidos con encriptación SSL
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardPayment; 