import React from 'react';
import { useTranslation } from 'react-i18next';

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: () => void;
  link?: string;
}

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ServicesModal: React.FC<ServicesModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  
  const services: Service[] = [
    {
      icon: <span role="img" aria-label="Guía">🧑‍🏫</span>,
      title: t('services.request_guide'),
      description: t('services.request_guide_desc'),
      link: 'https://wa.me/18092195141?text=Quiero%20un%20gu%C3%ADa%20tur%C3%ADstico%20para%20mi%20tour',
    },
    {
      icon: <span role="img" aria-label="Transporte">🚗</span>,
      title: t('services.request_transport'),
      description: t('services.request_transport_desc'),
      link: 'https://wa.me/18092195141?text=Solicito%20transporte%20o%20taxi%20para%20mi%20tour',
    },
    {
      icon: <span role="img" aria-label="Contacto">📞</span>,
      title: t('services.direct_contact'),
      description: t('services.direct_contact_desc'),
      link: 'tel:+18095550000',
    },
    {
      icon: <span role="img" aria-label="Emergencia">🚨</span>,
      title: t('services.emergency'),
      description: t('services.emergency_desc'),
      link: 'tel:911',
    },
  ];
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative text-center">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">{t('additionalServicesTitle')}</h2>
        <div className="space-y-6">
          {services.map((service, idx) => (
            <a
              key={idx}
              href={service.link}
              target={service.link?.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="block bg-blue-50 hover:bg-blue-100 rounded-xl p-4 transition-all duration-200 text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{service.icon}</div>
                <div>
                  <div className="font-semibold text-blue-900">{service.title}</div>
                  <div className="text-gray-600 text-sm">{service.description}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesModal;
