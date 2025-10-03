import React from 'react';

interface InputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export default function Input({
  id,
  label,
  type = 'text',
  placeholder,
  helperText,
  error,
  value,
  onChange,
  disabled = false,
  required = false,
  className = '',
}: InputProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <label 
        htmlFor={id}
        className="block text-deep-charcoal text-body-sm font-medium mb-2"
      >
        {label}{required && <span className="text-dark-teal-navy ml-1">*</span>} {/* Russet */}
      </label>
      
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className={`w-full h-14 px-4 py-4 rounded-md border ${
          error 
            ? 'border-burnt-sienna focus:border-burnt-sienna focus:shadow-[0_0_0_3px_rgba(167,138,83,0.3)]' // Lion
            : 'border-silver-200 focus:border-burnt-sienna focus:shadow-focus' // Silver-200, Lion
        } focus:outline-none placeholder-silver-500 placeholder-opacity-50 ${ // Silver-500
          disabled ? 'bg-silver-200 text-opacity-50 cursor-not-allowed' : 'bg-silver-100' // Silver-200, Silver-100
        }`}
      />
      
      {(helperText || error) && (
        <p className={`mt-1 text-micro ${ // Black, Battleship Gray
          error ? 'text-burnt-sienna' : 'text-silver-500 text-opacity-70' // Lion, Silver-500
        }`}>
          {error || helperText} {/* This text color will be updated in DesignSystemShowcase */}
        </p>
      )}
    </div>
  );
}