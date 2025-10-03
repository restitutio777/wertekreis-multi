import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sparkles, CheckCircle, Zap, Shield, Wrench, Home, Mail, Heart } from 'lucide-react';
import { changelog, getLastUpdateDate } from '../data/changelog';
import { formatLocalizedDate } from '../utils/dateFormatting';

interface ChangelogPageProps {
  onNavigate: (page: 'home' | 'map_search' | 'discover_users' | 'events' | 'legal' | 'auth' | 'profile' | 'changelog') => void;
}

export default function ChangelogPage({ onNavigate }: ChangelogPageProps) {
  const { t, i18n } = useTranslation();
  const recentUpdates = changelog.slice(0, 5); // Show last 5 updates
  const lastUpdateDate = getLastUpdateDate();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Sparkles size={18} className="text-desert" />;
      case 'improvement':
        return <Zap size={18} className="text-success-600" />;
      case 'bugfix':
        return <Wrench size={18} className="text-warning-600" />;
      case 'security':
        return <Shield size={18} className="text-rhino" />;
      default:
        return <CheckCircle size={18} className="text-walnut" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature':
        return t('changelog.types.feature');
      case 'improvement':
        return t('changelog.types.improvement');
      case 'bugfix':
        return t('changelog.types.bugfix');
      case 'security':
        return t('changelog.types.security');
      default:
        return t('changelog.types.update');
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'bg-desert/10 text-desert border-desert/20';
      case 'improvement':
        return 'bg-success-50 text-success-700 border-success-200';
      case 'bugfix':
        return 'bg-warning-50 text-warning-700 border-warning-200';
      case 'security':
        return 'bg-rhino/10 text-rhino border-rhino/20';
      default:
        return 'bg-walnut/10 text-walnut border-walnut/20';
    }
  };

  return (
    <div className="min-h-screen bg-cream relative">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/topglobe copy.jpg" 
          alt="Werte•Kreis Background" 
          className="w-full h-full object-cover object-center sm:object-center lg:object-center"
          style={{ 
            imageRendering: 'crisp-edges',
            filter: 'contrast(1.1) brightness(1.05) saturate(1.1)',
            transform: 'scale(1.1)',
            transformOrigin: 'center center'
          }}
        />
        {/* Minimal overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-akaroa-100/60 via-akaroa-200/60 to-akaroa-300/70"></div>
        {/* Very subtle accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-rhino/8 via-transparent to-walnut/12"></div>
      </div>

      {/* Header */}
      <div className="bg-rhino-900/70 backdrop-blur-[15px] shadow-glass-nav border-b border-rhino-700/50 relative z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('home')}
              className="p-2 hover:bg-rhino-800/80 backdrop-blur-[5px] rounded-lg transition-all duration-200 lg:flex hidden shadow-glass-button-sm"
              title="Zurück zur Startseite"
            >
              <Home size={20} className="text-cream" />
            </button>
            <div className="flex items-center space-x-3">
              <Sparkles size={24} className="text-cream" />
              <h1 className="text-xl font-light font-logo text-cream">{t('changelog.title')}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md lg:max-w-3xl mx-auto px-3 py-6 pb-24 md:px-6 space-y-6 relative z-10">
        {/* Desktop Navigation Button */}
        <div className="lg:flex hidden">
          <button
            onClick={() => onNavigate('home')}
            className="bg-akaroa-100/70 backdrop-blur-[8px] text-rhino hover:bg-akaroa-200/80 rounded-lg transition-all duration-200 p-2 flex items-center space-x-2 shadow-glass-button hover:shadow-glass-button-hover border border-sandstone-300/50 hover:border-sandstone-300/60 transform hover:scale-[1.02]"
            title="Zurück zur Startseite"
          >
            <Home size={20} />
            <span className="text-sm font-medium">Startseite</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="bg-akaroa/70 backdrop-blur-[15px] rounded-xl p-6 shadow-glass-card border border-sandstone-300/50 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-desert to-desert-700 rounded-full shadow-lg mb-4">
            <Sparkles size={24} className="text-white" />
          </div>
          <p className="text-walnut leading-relaxed mb-4">
            {t('changelog.description')}
          </p>
          <div className="inline-flex items-center space-x-2 bg-desert/10 text-desert px-3 py-1 rounded-full text-sm">
            <CheckCircle size={14} />
            <span>{t('changelog.lastUpdated', { date: formatLocalizedDate(lastUpdateDate, { year: 'numeric', month: 'long', day: 'numeric' }) })}</span>
          </div>
        </div>

        {/* Updates List */}
        <div className="space-y-4">
          {recentUpdates.length === 0 ? (
            <div className="bg-akaroa/60 backdrop-blur-[15px] rounded-xl p-8 shadow-glass-card border border-sandstone-300/50 text-center">
              <Sparkles size={48} className="text-walnut mx-auto mb-4" />
              <h3 className="font-medium font-logo text-rhino mb-2">{t('changelog.noUpdates')}</h3>
              <p className="text-walnut text-sm">
                {t('changelog.checkBackSoon')}
              </p>
            </div>
          ) : (
            recentUpdates.map((update, index) => (
              <div
                key={`${update.date}-${index}`}
                className="bg-akaroa/70 backdrop-blur-[15px] rounded-xl p-6 shadow-glass-card border border-sandstone-300/50 hover:shadow-glass-card-hover transition-all duration-200"
              >
                {/* Update Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getTypeIcon(update.type)}
                      <h3 className="text-lg font-semibold font-logo text-rhino">
                        {update.title[i18n.language] || update.title['de'] || 'Update'}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-walnut">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeBadgeColor(update.type)}`}>
                        {getTypeLabel(update.type)}
                      </span>
                      <span>{formatLocalizedDate(update.date, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      {update.version && (
                        <span className="bg-rhino/10 text-rhino px-2 py-1 rounded-full text-xs font-medium">
                          v{update.version}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <p className="text-walnut leading-relaxed">
                    {update.description[i18n.language] || update.description['de'] || 'Keine Beschreibung verfügbar'}
                  </p>
                </div>

                {/* Benefits */}
                {update.benefits && update.benefits.length > 0 && (
                  <div className="bg-desert/20 backdrop-blur-[5px] rounded-lg p-4 shadow-glass-summary border border-desert/30">
                    <ul className="space-y-2">
                      {(update.benefits[i18n.language] || update.benefits['de'] || []).map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-start space-x-3">
                          <div className="w-1.5 h-1.5 bg-desert rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-walnut text-sm leading-relaxed">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-desert/20 backdrop-blur-[10px] rounded-lg p-4 shadow-glass-card border border-desert/30">
          <p className="text-sm text-desert text-center leading-relaxed">
            {t('changelog.feedbackMessage')}
          </p>
          <div className="flex justify-center items-center space-x-4 mt-3">
            <Mail size={16} className="text-desert" />
            <button
              onClick={() => window.open('mailto:werte-im-wandel@mailbox.org', '_blank')}
              className="text-desert hover:text-desert/80 font-medium text-sm transition-colors duration-200"
            >
              werte-im-wandel@mailbox.org
            </button>
            <div className="w-px h-4 bg-desert/30"></div>
            <button
              onClick={() => window.open('https://buymeacoffee.com/werteimwandel', '_blank')}
              className="flex items-center space-x-2 text-desert hover:text-desert/80 font-medium text-sm transition-colors duration-200"
            >
              <Heart size={16} className="text-desert" />
              <span>{t('changelog.support')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}