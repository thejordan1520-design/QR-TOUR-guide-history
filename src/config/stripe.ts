import { API_CONFIG } from './api';

// Configuración de Stripe
export const STRIPE_CONFIG = {
  // IMPORTANTE: Cambia esto por tu clave pública real de Stripe
  publishableKey: 'pk_test_your_stripe_publishable_key_here',
  currency: 'usd',
  locale: 'es'
};

// Función para obtener la configuración de Stripe
export const getStripeOptions = () => ({
  apiKey: STRIPE_CONFIG.publishableKey,
  currency: STRIPE_CONFIG.currency,
  locale: STRIPE_CONFIG.locale
});

// Verificar si Stripe está configurado
export const isStripeConfigured = () => {
  return STRIPE_CONFIG.publishableKey && STRIPE_CONFIG.publishableKey !== 'pk_test_your_stripe_publishable_key_here';
};

// Función para crear un payment intent en tu backend
export const createPaymentIntent = async (amount: number, planId: string) => {
  try {
    const response = await fetch('${API_CONFIG.EXPRESS_API.baseUrl}/api/payments/stripe/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // Stripe usa centavos
        planId: planId,
        currency: 'usd',
      }),
    });
    
    const data = await response.json();
    return data.clientSecret;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Función para confirmar un pago con Stripe
export const confirmPayment = async (clientSecret: string, paymentMethod: any) => {
  try {
    const response = await fetch('${API_CONFIG.EXPRESS_API.baseUrl}/api/payments/stripe/confirm-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientSecret: clientSecret,
        paymentMethod: paymentMethod,
      }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

// Función para obtener el estado de un pago
export const getPaymentStatus = async (paymentIntentId: string) => {
  try {
    const response = await fetch(`${API_CONFIG.EXPRESS_API.baseUrl}/api/payments/stripe/status/${paymentIntentId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
}; 