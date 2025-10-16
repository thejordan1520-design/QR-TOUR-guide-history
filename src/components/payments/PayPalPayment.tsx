import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { getPayPalOptions } from '../../config/paypal';
import { API_CONFIG } from '../../config/api';

interface PayPalPaymentProps {
  amount: number;
  currency: string;
  planId: string;
  planName: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

const PayPalPayment: React.FC<PayPalPaymentProps> = ({
  amount,
  currency,
  planId,
  planName,
  onSuccess,
  onError,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  useEffect(() => {
    // Verificar si PayPal está cargado
    const checkPayPalLoaded = () => {
      if (window.paypal) {
        setPaypalLoaded(true);
      } else {
        setTimeout(checkPayPalLoaded, 100);
      }
    };
    checkPayPalLoaded();
  }, []);

  const createOrder = async (data: any, actions: any) => {
      setIsProcessing(true);
      
    // Crear orden de PayPal usando Live (dinero real) con configuración avanzada
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          description: planName,
          amount: {
            currency_code: currency,
            value: amount.toString()
          },
          custom_id: planId
        }
      ],
      application_context: {
        brand_name: 'QR Tour',
        landing_page: 'LOGIN',
        user_action: 'PAY_NOW',
        return_url: `${window.location.origin}/subscribe?success=true`,
        cancel_url: `${window.location.origin}/subscribe?canceled=true`,
        shipping_preference: 'NO_SHIPPING',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
        }
      }
    };

    try {
      const order = await actions.order.create(orderData);
      return order;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      setIsProcessing(false);
      throw error;
    }
  };

  const onApprove = async (data: any, actions: any) => {
    try {
      console.log('🎯 PayPal onApprove iniciado para order:', data.orderID);
      
      // Crear transacción pendiente en nuestro backend
      const createTransactionResponse = await fetch(`${API_CONFIG.EXPRESS_API.baseUrl}/api/payments/paypal/create-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paypalOrderId: data.orderID,
          userEmail: 'user@example.com', // TODO: Obtener del contexto de usuario
          planId,
          planName,
          amount,
          currency
        })
      });
      
      if (!createTransactionResponse.ok) {
        throw new Error('Error creando transacción pendiente');
      }

      console.log('✅ Transacción pendiente creada, esperando confirmación de PayPal...');
      
      // Mostrar mensaje de éxito temporal
      setIsProcessing(false);
      onSuccess({
        orderID: data.orderID,
        status: 'PENDING_CONFIRMATION',
        message: 'Pago procesado. Recibirás confirmación por email cuando PayPal confirme la transacción.'
      });
      
    } catch (error) {
      console.error('Error en proceso de pago PayPal:', error);
      setIsProcessing(false);
      onError(error);
    }
  };

  const handleError = (err: any) => {
    console.error('PayPal error:', err);
    setIsProcessing(false);
    onError(err);
  };

  const handleCancel = () => {
    setIsProcessing(false);
    onCancel();
  };

  const paypalOptions = getPayPalOptions();

  if (!paypalLoaded) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando PayPal...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PayPalScriptProvider options={paypalOptions}>
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
          onError={handleError}
          onCancel={handleCancel}
          forceReRender={[amount, planId]}
            style={{
              layout: 'vertical',
              color: 'blue',
              shape: 'rect',
              label: 'pay'
            }}
          />
        </PayPalScriptProvider>

      {isProcessing && (
        <div className="mt-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Procesando pago...</p>
        </div>
      )}
      
      <p className="text-sm text-gray-500 mt-4 text-center">
        Paga con PayPal o tarjeta de crédito/débito
      </p>
    </div>
  );
};

export default PayPalPayment; 