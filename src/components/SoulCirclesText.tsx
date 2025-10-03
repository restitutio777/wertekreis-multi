import React from 'react';

interface SoulCirclesTextProps {
  variant?: 'primary' | 'light' | 'monochrome';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export default function SoulCirclesText({ 
  variant = 'primary',
  size = 'xl',
  className = '' 
}: SoulCirclesTextProps) {
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-2xl';
      case 'md':
        return 'text-3xl';
      case 'lg':
        return 'text-4xl';
      case 'xl':
        return 'text-3xl sm:text-4xl lg:text-5xl';
      case '2xl':
        return 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl';
      default:
        return 'text-3xl sm:text-4xl lg:text-5xl';
    }
  };

  const getTextClasses = () => {
    const baseClasses = `font-logo font-normal tracking-tight leading-tight ${getSizeClasses()}`;
    
    if (variant === 'monochrome') {
      return `${baseClasses} text-desert`;
    }
    
    return `${baseClasses} bg-gradient-to-r bg-clip-text text-transparent`;
  };

  const getBulletColor = () => {
    switch (variant) {
      case 'monochrome':
        return '#A76825'; // desert color
      case 'light':
        return '#273F5B'; // rhino color
      case 'primary':
      default:
        return '#6F481C'; // walnut color
    }
  };
  const getGradientStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundImage: 'linear-gradient(135deg, #273F5B 0%, #6F481C 35%, #A76825 65%, #D2BCA1 100%)'
        };
      case 'light':
        return {
          backgroundImage: 'linear-gradient(135deg, #273F5B 0%, #6F481C 30%, #FEFCF8 50%, #A76825 70%, #7F715F 100%)'
        };
      default:
        return {};
    }
  };

  if (variant === 'monochrome') {
    return (
      <h1 className={`${getTextClasses()} ${className}`} style={{
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        fontFeatureSettings: '"kern" 1',
        textSizeAdjust: '100%',
        filter: 'contrast(1.1)'
      }}>
        <span>Werte</span>
        <span style={{ color: getBulletColor() }}>•</span>
        <span>Kreis</span>
      </h1>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Fallback solid text for better readability */}
      <h1 
        className={`${getTextClasses()} absolute inset-0 text-rhino opacity-90`}
        aria-hidden="true"
        style={{
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          fontFeatureSettings: '"kern" 1',
          textSizeAdjust: '100%',
          filter: 'contrast(1.1)'
        }}
      >
        <span>Werte</span>
        <span style={{ color: getBulletColor() }}>•</span>
        <span>Kreis</span>
      </h1>
      
      {/* Main gradient text with optimized rendering */}
      <h1 
        className={`${getTextClasses()} relative z-10 drop-shadow-sm`}
        style={{
          ...getGradientStyle(),
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          fontFeatureSettings: '"kern" 1',
          textSizeAdjust: '100%',
          filter: 'contrast(1.15) brightness(1.05)',
          textShadow: '0 0 1px rgba(0,0,0,0.1)'
        }}
      >
        <span>Werte</span>
        <span 
          style={{
            WebkitTextFillColor: getBulletColor(),
            WebkitTextStroke: '0',
            color: getBulletColor()
          }}
        >
          •
        </span>
        <span>Kreis</span>
      </h1>
    </div>
  );
}