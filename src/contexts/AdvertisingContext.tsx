import React, { createContext, useContext, ReactNode } from 'react';
import { useAdvertisingSystem } from '../hooks/useAdvertisingSystem';
import AdvertisementBanner from '../components/AdvertisementBanner';

interface AdvertisingContextType {
  currentAd: any;
  isVisible: boolean;
  handleAdClick: () => void;
  closeAdvertisement: () => void;
}

const AdvertisingContext = createContext<AdvertisingContextType | undefined>(undefined);

interface AdvertisingProviderProps {
  children: ReactNode;
}

export const AdvertisingProvider: React.FC<AdvertisingProviderProps> = ({ children }) => {
  const { currentAd, isVisible, handleAdClick, closeAdvertisement } = useAdvertisingSystem();

  const value: AdvertisingContextType = {
    currentAd,
    isVisible,
    handleAdClick,
    closeAdvertisement
  };

  return (
    <AdvertisingContext.Provider value={value}>
      {children}
      {/* Banner de publicidad global */}
      {currentAd && (
        <AdvertisementBanner
          advertisement={currentAd}
          isVisible={isVisible}
          onClose={closeAdvertisement}
          onClick={handleAdClick}
        />
      )}
    </AdvertisingContext.Provider>
  );
};

export const useAdvertisingContext = () => {
  const context = useContext(AdvertisingContext);
  if (context === undefined) {
    throw new Error('useAdvertisingContext must be used within an AdvertisingProvider');
  }
  return context;
};



