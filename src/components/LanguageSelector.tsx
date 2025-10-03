import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'flags';
}

export default function LanguageSelector({ className = '', variant = 'dropdown' }: LanguageSelectorProps) {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  if (variant === 'flags') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`text-2xl hover:scale-110 transition-transform duration-200 ${
              i18n.language === lang.code ? 'ring-2 ring-desert rounded-full' : 'opacity-70 hover:opacity-100'
            }`}
            title={lang.name}
          >
            {lang.flag}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-rhino focus:outline-none focus:ring-2 focus:ring-desert focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      <Globe size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-rhino pointer-events-none" />
    </div>
  );
}