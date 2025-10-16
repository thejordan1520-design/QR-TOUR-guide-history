import React from 'react';

interface PayPalLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PayPalLogo: React.FC<PayPalLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${sizeClasses[size]} font-bold`}>
        <span className="text-blue-600">Pay</span>
        <span className="text-blue-500">Pal</span>
      </div>
    </div>
  );
};

export default PayPalLogo;