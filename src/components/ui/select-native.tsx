// Componente Select nativo para evitar problemas con Shadcn UI
import React from 'react';
import { Label } from './label';

interface SelectNativeProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const SelectNative: React.FC<SelectNativeProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecciona una opción",
  className = "",
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      {label && <Label className="font-semibold">{label}</Label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectNative;



