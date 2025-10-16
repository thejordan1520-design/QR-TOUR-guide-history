import React, { useState } from 'react';

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const Select: React.FC<SelectProps> = ({ children, value, onValueChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child, {
              onClick: () => setIsOpen(!isOpen),
              isOpen,
              selectedValue
            });
          }
          if (child.type === SelectContent && isOpen) {
            return React.cloneElement(child, {
              onValueChange: handleValueChange,
              selectedValue
            });
          }
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger: React.FC<SelectTriggerProps & { onClick?: () => void; isOpen?: boolean; selectedValue?: string }> = ({ 
  children, 
  className = '',
  onClick,
  isOpen,
  selectedValue
}) => {
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      onClick={onClick}
    >
      {children}
      <svg
        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

const SelectContent: React.FC<SelectContentProps & { onValueChange?: (value: string) => void; selectedValue?: string }> = ({ 
  children, 
  className = '',
  onValueChange,
  selectedValue
}) => {
  return (
    <div className={`absolute z-50 mt-1 w-full bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 ${className}`}>
      <div className="py-1">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === SelectItem) {
            return React.cloneElement(child, {
              onSelect: onValueChange,
              isSelected: child.props.value === selectedValue
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

const SelectItem: React.FC<SelectItemProps & { onSelect?: (value: string) => void; isSelected?: boolean }> = ({ 
  children, 
  value, 
  className = '',
  onSelect,
  isSelected
}) => {
  return (
    <button
      type="button"
      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
        isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
      } ${className}`}
      onClick={() => onSelect?.(value)}
    >
      {children}
    </button>
  );
};

const SelectValue: React.FC<SelectValueProps & { selectedValue?: string }> = ({ 
  placeholder, 
  className = '',
  selectedValue
}) => {
  return (
    <span className={`${className}`}>
      {selectedValue || placeholder}
    </span>
  );
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };

