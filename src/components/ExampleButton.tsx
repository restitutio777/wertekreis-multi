import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}: ButtonProps) {
  const baseClasses = "font-semibold rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-opacity-40";
  
  const variantClasses = {
    primary: "bg-burnt-sienna text-pure-white hover:bg-burnt-sienna/80 active:bg-burnt-sienna/60 focus:ring-burnt-sienna disabled:opacity-50 disabled:cursor-not-allowed", // Lion
    secondary: "border border-burnt-sienna text-burnt-sienna hover:bg-burnt-sienna/10 active:bg-burnt-sienna/20 focus:ring-burnt-sienna disabled:opacity-50 disabled:cursor-not-allowed", // Lion
    tertiary: "text-deep-charcoal hover:bg-silver-200 active:bg-silver-200/70 focus:ring-deep-charcoal disabled:opacity-50 disabled:cursor-not-allowed" // Black, Silver-200
  };
  
  const sizeClasses = {
    sm: "text-body-sm px-3 py-2 h-8",
    md: "text-body px-4 py-2 h-10 md:h-10",
    lg: "text-body-lg px-6 py-3 h-12 md:h-10"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
}