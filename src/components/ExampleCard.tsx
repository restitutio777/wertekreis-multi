import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export default function Card({ 
  title, 
  children, 
  className = '',
  interactive = false 
}: CardProps) {
  const baseClasses = "bg-silver-100 rounded-lg p-6 shadow-subtle border border-silver-500 border-opacity-25"; // Silver-100, Silver-500
  const interactiveClasses = interactive 
    ? "hover:shadow-medium cursor-pointer transition-shadow hover:border-burnt-sienna" // Lion
    : "";

  return (
    <div className={`${baseClasses} ${interactiveClasses} ${className}`}>
      {title && <h3 className="text-h3 text-text-primary mb-3">{title}</h3>}
      {children}
    </div>
  );
}