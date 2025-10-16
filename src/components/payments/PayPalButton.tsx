import React, { useEffect, useRef } from 'react';

interface PayPalButtonProps {
  planId: string;
  amount: number;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  className?: string;
}

// Variable global para controlar si el script ya se cargó
let paypalScriptLoaded = false;
let paypalLoadingPromise: Promise<void> | null = null;

const loadPayPalSDK = (): Promise<void> => {
  if (paypalScriptLoaded) {
    return Promise.resolve();
  }

  if (paypalLoadingPromise) {
    return paypalLoadingPromise;
  }

  // Verificar si ya existe el script
  const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
  if (existingScript) {
    paypalScriptLoaded = true;
    return Promise.resolve();
  }

  paypalLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=BAA21mVbxxx4RJXjzPpeI3fumdQzVzZlMibRFYp_f9-yW28iilQYGOog89uEizQUrzR8niX_nmTpOK1n6c&components=hosted-buttons&disable-funding=venmo&currency=USD';
    script.crossOrigin = 'anonymous';
    script.async = true;
    
    script.onload = () => {
      console.log('PayPal SDK loaded successfully');
      paypalScriptLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      console.error('Error loading PayPal SDK');
      paypalLoadingPromise = null;
      reject(new Error('Error loading PayPal SDK'));
    };
    
    document.head.appendChild(script);
  });

  return paypalLoadingPromise;
};

const PayPalButton: React.FC<PayPalButtonProps> = ({ 
  planId,
  amount,
  onSuccess,
  onError,
  className = ''
}) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const buttonRendered = useRef(false);
  const buttonInstance = useRef<any>(null);

  useEffect(() => {
    const initializeButton = async () => {
      try {
        await loadPayPalSDK();
        
        if (window.paypal && paypalRef.current) {
          initializePayPal();
          }
        } catch (error) {
        console.error('Error loading PayPal SDK:', error);
        onError(error);
      }
    };

    initializeButton();

    return () => {
      // Cleanup
      if (paypalRef.current) {
        paypalRef.current.innerHTML = '';
        buttonRendered.current = false;
        buttonInstance.current = null;
      }
    };
  }, [planId, amount]);

  // Reinicializar el botón cuando cambie el estado de error
  useEffect(() => {
    if (paypalRef.current && window.paypal) {
      // Pequeño delay para permitir que el estado se actualice
      setTimeout(() => {
      initializePayPal();
      }, 200);
    }
  }, [onError]); // Se ejecuta cuando cambia la función onError (que indica un cambio de estado)

  const initializePayPal = () => {
    if (window.paypal && paypalRef.current) {
      // Limpiar el contenedor antes de renderizar
      paypalRef.current.innerHTML = '';
      
      // Pequeño delay para evitar conflictos
      setTimeout(() => {
        try {
          // Determinar el hostedButtonId según el plan
          const hostedButtonId = amount === 5 ? "44Y3KXT9JUVNN" : "MEQSSPD9ZK2CU";
          
          console.log(`Initializing PayPal button for plan ${planId} with amount $${amount}, using hostedButtonId: ${hostedButtonId}`);
          
          // Destruir instancia anterior si existe
          if (buttonInstance.current) {
            try {
              buttonInstance.current.close();
            } catch (e) {
              console.log('No previous button instance to close');
            }
          }
          
          buttonInstance.current = window.paypal.HostedButtons({
            hostedButtonId: hostedButtonId,
            onApprove: (data: any, actions: any) => {
              // Manejar aprobación del pago
              console.log('PayPal payment approved:', data);
              onSuccess(data);
            },
            onError: (error: any) => {
              console.error('PayPal payment error:', error);
              onError(error);
            },
            onCancel: (data: any) => {
              console.log('PayPal payment cancelled:', data);
              onError(new Error('Payment cancelled by user'));
            }
          });
          
          buttonInstance.current.render(paypalRef.current);
          buttonRendered.current = true;
          console.log('PayPal button rendered successfully');
        } catch (error) {
          console.error('Error initializing PayPal button:', error);
          onError(error);
        }
      }, 100);
    }
  };

  return (
    <div className={`paypal-button-container ${className}`}>
      <div ref={paypalRef} className="paypal-button-wrapper"></div>
    </div>
  );
};

// Declarar la interfaz global de PayPal
declare global {
  interface Window {
    paypal: any;
  }
}

export default PayPalButton;