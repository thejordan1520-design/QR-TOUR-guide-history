import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// import { useLanguage } from '../contexts/LanguageContext'; // Removed - using react-i18next
import { useAuth } from '../contexts/AuthContext';

const AccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const { t } = useTranslation();
  const { user, signInWithEmail } = useAuth();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const from = searchParams.get('from');

  useEffect(() => {
    // If already authenticated, redirect
    if (user) {
      navigate(from || '/', { replace: true });
      return;
    }

    // Validate token
    const validateToken = async () => {
      if (!token) {
        setValidatingToken(false);
        return;
      }

      // Simulate token validation (in real app this would be an API call)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, any non-empty token is valid
      if (token.length > 5) {
        setTokenValid(true);
        // Token validation logic - this would need to be implemented
        console.log('Token validation needed:', token);
        
        // Redirect after successful validation
        setTimeout(() => {
          navigate(from || '/', { replace: true });
        }, 2000);
      }
      
      setValidatingToken(false);
    };

    validateToken();
  }, [token, user, navigate, from]);

  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('access.validating')}
          </h1>
          <p className="text-gray-600">
            {t('access.verifying_token')}
          </p>
        </div>
      </div>
    );
  }

  if (tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-green-100 rounded-full p-4 inline-block mb-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('access.access_activated')}
          </h1>
          <p className="text-gray-600 mb-6">
            {t('access.premium_access_activated')}
          </p>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-center space-x-2 text-green-700">
              <Clock className="h-5 w-5" />
              <span className="font-semibold">{t('access.premium_access_duration')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid or expired token
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="bg-red-100 rounded-full p-4 inline-block mb-6">
          <AlertCircle className="h-16 w-16 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('access.expired')}
        </h1>
        <p className="text-gray-600 mb-8">
          {t('access.token_expired_or_invalid')}
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/subscribe')}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>{t('access.renew')}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors duration-200"
          >
            {t('access.back_to_home')}
          </button>
        </div>

        {/* Sample QR Access Instructions */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
          <h3 className="font-semibold text-gray-900 mb-2">{t('access.qr_code_access')}</h3>
          <p className="text-sm text-gray-600">
            {t('access.qr_code_instructions')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessPage;