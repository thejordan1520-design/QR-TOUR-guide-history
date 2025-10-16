import React, { useState } from 'react';
import { X, Smartphone, Camera, QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import QRScanner from '../QRScanner';

interface QRInstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QRInstructionModal: React.FC<QRInstructionModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [showQRScanner, setShowQRScanner] = useState(false);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{t('how_to_scan_qr')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1 */}
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
              <span className="text-blue-600 font-bold text-lg">1</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">{t('open_camera')}</h3>
              <p className="text-gray-600 text-sm mb-3">
                {t('open_camera_description')}
              </p>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center">
                <Smartphone className="h-16 w-16 text-gray-400" />
              </div>
            </div>
          </div>
          {/* Step 2 */}
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 rounded-full p-3 flex-shrink-0">
              <span className="text-green-600 font-bold text-lg">2</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">{t('focus_qr_code')}</h3>
              <p className="text-gray-600 text-sm mb-3">
                {t('focus_qr_code_description')}
              </p>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center">
                <div className="relative">
                  <QrCode className="h-16 w-16 text-gray-400" />
                  <div className="absolute inset-0 border-2 border-green-500 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          {/* Step 3 */}
          <div className="flex items-start space-x-4">
            <div className="bg-orange-100 rounded-full p-3 flex-shrink-0">
              <span className="text-orange-600 font-bold text-lg">3</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">{t('tap_notification')}</h3>
              <p className="text-gray-600 text-sm mb-3">
                {t('tap_notification_description')}
              </p>
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Camera className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {t('open_link_description')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Tips */}
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">{t('useful_tips')}</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• {t('tip_1')}</li>
              <li>• {t('tip_2')}</li>
              <li>• {t('tip_3')}</li>
              <li>• {t('tip_4')}</li>
            </ul>
          </div>
        </div>
        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={() => setShowQRScanner(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-teal-600 transition-all duration-200"
          >
            Escanear ahora
          </button>
          <QRScanner open={showQRScanner} onClose={() => setShowQRScanner(false)} />
        </div>
      </div>
    </div>
  );
};

export default QRInstructionModal;