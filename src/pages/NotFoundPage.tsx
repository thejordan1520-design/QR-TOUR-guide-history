import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowLeft, QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="bg-gray-100 rounded-full p-6 inline-block mb-6">
            <MapPin className="h-16 w-16 text-gray-400" />
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-4">{t('not_found_page.title')}</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('not_found_page.subtitle')}</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{t('not_found_page.description')}</p>

          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 space-x-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{t('not_found_page.back_to_home')}</span>
            </Link>

            <Link
              to="/subscribe"
              className="inline-flex items-center justify-center w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl border border-gray-200 transition-colors duration-200 space-x-2"
            >
              <QrCode className="h-5 w-5" />
              <span>{t('not_found_page.get_access')}</span>
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="font-semibold text-gray-900 mb-3">{t('not_found_page.help_title')}</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>{t('not_found_page.help_point_1')}</p>
            <p>{t('not_found_page.help_point_2')}</p>
            <p>{t('not_found_page.help_point_3')}</p>
          </div>
          
          <a
            href="https://wa.me/18092195141"
            className="inline-flex items-center justify-center w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {t('not_found_page.support_whatsapp')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;