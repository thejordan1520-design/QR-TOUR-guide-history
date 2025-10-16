import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle, HelpCircle, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  const { user } = useAuth();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-2 rounded-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">{t('brand')}</span>
            </div>
            <p className="text-gray-400 text-sm max-w-md">{t('footer.description')}</p>
          </div>

          {/* Contact Section */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.contact')}</h3>
            <a
              href="https://wa.me/18092195141"
              className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors duration-200 group"
            >
              <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              <span>{t('footer.whatsapp')}</span>
            </a>
            <a
              href={`mailto:${t('footer.email')}`}
              className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors duration-200 group"
            >
              <span className="h-5 w-5 group-hover:scale-110 transition-transform duration-200">📧</span>
              <span>{t('footer.email')}</span>
            </a>
            <div className="text-gray-400 text-sm">
              <p>{t('footer.support')}</p>
              <p>{t('footer.immediate_response')}</p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.faq')}</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-start space-x-2">
                <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">{t('faq.how_to_use_qr')}</p>
                  <p>{t('faq.how_to_use_qr_description')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">{t('faq.how_long_access')}</p>
                  <p>{t('faq.how_long_access_description')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">{t('faq.available_languages')}</p>
                  <p>{t('faq.available_languages_description')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">{t('faq.technical_issues')}</p>
                  <p>{t('faq.technical_issues_description')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center w-full">
          <p className="text-gray-400 text-sm">
            © 2025 {t('footer.all_rights_reserved')}.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/testimonios" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">Testimonios</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">{t('footer.terms_of_service')}</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">{t('footer.privacy_policy')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;