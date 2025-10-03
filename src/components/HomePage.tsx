import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, MapPin, Calendar, Users, UserPlus, ChevronDown, Shield, Youtube, Sparkles, Mail, User } from 'lucide-react';
import SoulCirclesText from './SoulCirclesText';
import LanguageSelector from './LanguageSelector';

type AuthFlow = 'login' | 'signup' | 'forgotPassword' | 'resetPassword';

interface HomePageProps {
  onNavigate: (page: 'home' | 'map_search' | 'discover_users' | 'events' | 'legal' | 'auth' | 'profile') => void;
  onProfileCreate: (authFlow?: AuthFlow) => void;
}

export default function HomePage({ onNavigate, onProfileCreate }: HomePageProps) {
  const { t } = useTranslation();
  const belowFoldContentRef = React.useRef<HTMLDivElement>(null);
  const [belowFoldContentIsVisible, setBelowFoldContentIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBelowFoldContentIsVisible(true);
          observer.disconnect(); // Stop observing after first trigger
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the element is visible
    );

    if (belowFoldContentRef.current) {
      observer.observe(belowFoldContentRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-full flex items-center justify-center relative bg-cream lg:block lg:h-auto lg:py-0">
      {/* Scroll Indicator - moved to outermost container for proper centering */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce-subtle lg:hidden">
        <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-sandstone-300">
          <ChevronDown size={24} className="text-rhino drop-shadow-sm relative -top-px" />
        </div>
      </div>

      <div className="w-full h-full flex flex-col relative px-4 py-6 lg:h-auto lg:max-w-none lg:mx-0 lg:rounded-none lg:shadow-none lg:border-none lg:px-12 lg:py-10 lg:my-0">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 lg:rounded-none overflow-hidden lg:fixed lg:w-full lg:h-full lg:top-0 lg:left-0 lg:z-0">
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
          {/* Minimal overlay for text readability only */}
          <div className="absolute inset-0 bg-gradient-to-b from-akaroa-100/30 via-akaroa-200/20 to-akaroa-300/30"></div>
          {/* Very subtle accent overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-rhino/3 via-transparent to-walnut/5"></div>
        </div>
        
        {/* Above the fold content */}
        <div className="flex flex-col items-center justify-center relative z-10 min-h-[calc(100vh-120px)] lg:min-h-0 lg:pt-12">
          {/* Hero Glass Panel */}
          <div className="bg-cream/40 backdrop-blur-[20px] border-3 border-desert-300 shadow-glass-hero rounded-full p-4 sm:p-6 lg:p-14 w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[480px] lg:h-[480px] flex flex-col items-center justify-center mx-auto">
            <div className="text-center space-y-3 sm:space-y-4 lg:space-y-8 max-w-[90%] flex flex-col justify-center h-full">
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                <SoulCirclesText variant="monochrome" size="xl" className="relative z-10" />
              </div>
              
              <h2 className="text-sm sm:text-base lg:text-xl text-rhino font-medium leading-relaxed px-1 sm:px-2 lg:px-6 tracking-wide">
                {t('home.subtitle')}
              </h2>
            </div>
          </div>

          {/* Main CTAs */}
          <div className="text-center space-y-4 mt-4 sm:mt-6 lg:mt-12 w-full max-w-xs sm:max-w-sm lg:max-w-5xl relative z-10">
            <div className="flex flex-col lg:flex-row lg:space-x-6 lg:justify-center space-y-4 lg:space-y-0">
              {/* Primary CTA - Sign Up (moved to first position) */}
              <button
                onClick={() => onProfileCreate('signup')}
                className="group w-full lg:flex-1 lg:min-w-[200px] lg:max-w-[240px] bg-desert/70 backdrop-blur-[8px] text-white py-3 px-4 sm:py-4 sm:px-6 lg:py-4 lg:px-6 rounded-xl font-semibold shadow-glass-button-hover hover:shadow-glass-button-hover hover:bg-desert/80 transform hover:scale-[1.02] active:scale-[0.99] transition-all duration-500 flex items-center justify-center space-x-2 border border-desert-600/50 hover:border-desert-600/60 relative overflow-hidden min-h-[44px] sm:min-h-[48px] lg:min-h-[56px] whitespace-nowrap"
              >
                <UserPlus size={16} className="relative z-10 flex-shrink-0 sm:w-5 sm:h-5 lg:w-5 lg:h-5" />
                <span className="text-sm sm:text-base lg:text-base font-semibold tracking-wide relative z-10 ml-1">{t('home.joinNow')}</span>
              </button>

              {/* Secondary CTA - Discover Users */}
              <button
                onClick={() => onNavigate('discover_users')}
                className="group w-full lg:flex-1 lg:min-w-[260px] lg:max-w-[300px] bg-walnut/60 backdrop-blur-[8px] text-white py-3 px-4 sm:py-4 sm:px-6 lg:py-4 lg:px-8 rounded-xl font-semibold shadow-glass-button hover:shadow-glass-button-hover hover:bg-walnut/70 transform hover:scale-[1.02] active:scale-[0.99] transition-all duration-500 flex items-center justify-center space-x-2 sm:space-x-3 border border-walnut-700/50 hover:border-walnut-700/60 relative overflow-hidden min-h-[44px] sm:min-h-[48px] lg:min-h-[56px] whitespace-nowrap"
              >
                <Users size={16} className="relative z-10 flex-shrink-0 sm:w-5 sm:h-5 lg:w-5 lg:h-5" />
                <span className="text-sm sm:text-base lg:text-base font-semibold tracking-wide relative z-10">{t('home.discoverPeople')}</span>
              </button>

              {/* Tertiary CTA - Discover Places */}
              <button 
                onClick={() => onNavigate('map_search')}
                className="group w-full lg:flex-1 lg:min-w-[200px] lg:max-w-[240px] bg-rhino/60 backdrop-blur-[8px] text-white py-3 px-4 sm:py-4 sm:px-6 lg:py-4 lg:px-6 rounded-xl font-semibold shadow-glass-button hover:shadow-glass-button-hover hover:bg-rhino/70 transform hover:scale-[1.02] active:scale-[0.99] transition-all duration-500 flex items-center justify-center space-x-2 border border-rhino-700/50 hover:border-rhino-700/60 relative overflow-hidden min-h-[44px] sm:min-h-[48px] lg:min-h-[56px] whitespace-nowrap"
              >
                <MapPin size={16} className="relative z-10 flex-shrink-0 sm:w-5 sm:h-5 lg:w-5 lg:h-5" />
                <span className="text-sm sm:text-base lg:text-base font-semibold tracking-wide relative z-10 ml-1">{t('home.findPlaces')}</span>
              </button>
            </div>
          </div>


        </div>

        {/* Below the fold content */}
        <div 
          ref={belowFoldContentRef}
          className={`space-y-6 sm:space-y-8 lg:space-y-10 pt-8 sm:pt-12 lg:pt-16 transition-all duration-1000 ease-out relative z-10 ${
            belowFoldContentIsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Features Section */}
          <div className="space-y-6 sm:space-y-8">
            {/* Feature Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 bg-cream/60 backdrop-blur-[10px] p-4 sm:p-6 lg:p-8 rounded-2xl shadow-glass-summary border border-sandstone-300/50">
              {/* Authentische Verbindungen */}
              <button 
                onClick={() => onNavigate('discover_users')}
                className="bg-akaroa-100/50 backdrop-blur-[10px] rounded-2xl p-5 sm:p-6 lg:p-8 shadow-glass-card hover:shadow-glass-card-hover border border-sandstone-300/60 hover:border-sandstone-300/80 hover:bg-akaroa-100/60 transition-all duration-200 transform hover:scale-[1.03] h-full focus:outline-none focus:ring-2 focus:ring-rhino/50 min-h-[200px] sm:min-h-[220px] lg:min-h-[240px]"
              >
                <div className="flex flex-col items-center text-center space-y-4 sm:space-y-5 lg:space-y-6 h-full">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-desert-200 to-desert-400 rounded-full flex items-center justify-center shadow-sm">
                    <Heart size={20} className="text-rhino/60 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  </div>
                  <div className="space-y-2 flex-1 flex flex-col justify-center">
                    <h4 className="text-lg sm:text-xl lg:text-2xl font-semibold text-rhino leading-tight">{t('home.features.connections.title')}</h4>
                    <p className="text-sm sm:text-base lg:text-lg text-walnut leading-relaxed font-light">
                      {t('home.features.connections.description')}
                    </p>
                  </div>
                </div>
              </button>

              {/* Besondere Orte */}
              <button 
                onClick={() => onNavigate('map_search')}
                className="bg-akaroa-100/50 backdrop-blur-[10px] rounded-2xl p-5 sm:p-6 lg:p-8 shadow-glass-card hover:shadow-glass-card-hover border border-sandstone-300/60 hover:border-sandstone-300/80 hover:bg-akaroa-100/60 transition-all duration-200 transform hover:scale-[1.03] h-full focus:outline-none focus:ring-2 focus:ring-rhino/50 min-h-[200px] sm:min-h-[220px] lg:min-h-[240px]"
              >
                <div className="flex flex-col items-center text-center space-y-4 sm:space-y-5 lg:space-y-6 h-full">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-walnut-200 to-walnut-400 rounded-full flex items-center justify-center shadow-sm">
                    <MapPin size={20} className="text-rhino/60 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  </div>
                  <div className="space-y-2 flex-1 flex flex-col justify-center">
                    <h4 className="text-lg sm:text-xl lg:text-2xl font-semibold text-rhino leading-tight">{t('home.features.places.title')}</h4>
                    <p className="text-sm sm:text-base lg:text-lg text-walnut leading-relaxed font-light">
                      {t('home.features.places.description')}
                    </p>
                  </div>
                </div>
              </button>

              {/* Spirituelle Events */}
              <button 
                onClick={() => onNavigate('events')}
                className="bg-akaroa-100/50 backdrop-blur-[10px] rounded-2xl p-5 sm:p-6 lg:p-8 shadow-glass-card hover:shadow-glass-card-hover border border-sandstone-300/60 hover:border-sandstone-300/80 hover:bg-akaroa-100/60 transition-all duration-200 transform hover:scale-[1.03] h-full focus:outline-none focus:ring-2 focus:ring-rhino/50 min-h-[200px] sm:min-h-[220px] lg:min-h-[240px]"
              >
                <div className="flex flex-col items-center text-center space-y-4 sm:space-y-5 lg:space-y-6 h-full">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-desert-200 to-desert-400 rounded-full flex items-center justify-center shadow-sm">
                    <Calendar size={20} className="text-rhino/60 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  </div>
                  <div className="space-y-2 flex-1 flex flex-col justify-center">
                    <h4 className="text-lg sm:text-xl lg:text-2xl font-semibold text-rhino leading-tight">{t('home.features.events.title')}</h4>
                    <p className="text-sm sm:text-base lg:text-lg text-walnut leading-relaxed font-light">
                      {t('home.features.events.description')}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* App Summary Box */}
          <div className="bg-cream/70 backdrop-blur-[10px] rounded-xl p-6 shadow-glass-summary border border-sandstone-300/50">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-rhino">{t('home.whatWeOffer')}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-left">
                <ul className="space-y-3 text-sm text-walnut">
                  <li className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-desert rounded-full mt-2 flex-shrink-0"></span>
                    <span>{t('home.benefits.findLikeMinded')}</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-desert rounded-full mt-2 flex-shrink-0"></span>
                    <span>{t('home.benefits.shareSpaces')}</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-desert rounded-full mt-2 flex-shrink-0"></span>
                    <span>{t('home.benefits.discoverEvents')}</span>
                  </li>
                </ul>
                <ul className="space-y-3 text-sm text-walnut">
                  <li className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-desert rounded-full mt-2 flex-shrink-0"></span>
                    <span>{t('home.benefits.authenticConnect')}</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-desert rounded-full mt-2 flex-shrink-0"></span>
                    <span>{t('home.benefits.contribute')}</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="w-2 h-2 bg-desert rounded-full mt-2 flex-shrink-0"></span>
                    <span>{t('home.benefits.privacy')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Modern Footer */}
          <footer className="bg-rhino-900/70 backdrop-blur-[15px] text-cream/90 py-8 px-4 sm:px-6 lg:py-12 lg:px-8 rounded-2xl shadow-glass-footer border border-rhino-700/50 mt-8 sm:mt-12 lg:mt-16">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">
                
                {/* Branding & About Section */}
                <div className="space-y-4">
                  <div className="mb-4">
                    <div className="flex justify-center lg:justify-start">
                      <SoulCirclesText variant="monochrome" size="lg" className="mb-2 brightness-125 contrast-110" />
                    </div>
                  </div>
                  <p className="text-sm text-cream/80 leading-relaxed text-center lg:text-left max-w-xs lg:max-w-none">
                    {t('home.footer.description')}
                  </p>
                  <div className="pt-4 border-t border-cream/20 lg:mt-8">
                    <div className="text-center lg:text-left">
                      <p className="text-xs text-cream/60 font-medium">
                        {t('home.footer.connectWithLikeMinded')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation Section */}
                <div className="space-y-4 lg:border-l lg:border-cream/10 lg:pl-6">
                  <h3 className="text-lg font-semibold text-cream text-center lg:text-left">{t('home.footer.navigation')}</h3>
                  <ul className="space-y-2 lg:space-y-3">
                    <li>
                      <button
                        onClick={() => onNavigate('map_search')}
                        className="flex items-center justify-center lg:justify-start text-sm text-cream/80 hover:text-desert transition-colors duration-200 w-full py-1"
                      >
                        <MapPin size={16} className="inline mr-2 flex-shrink-0" />
                        <span>{t('navigation.mapSearch')}</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => onNavigate('discover_users')}
                        className="flex items-center justify-center lg:justify-start text-sm text-cream/80 hover:text-desert transition-colors duration-200 w-full py-1"
                      >
                        <Users size={16} className="inline mr-2 flex-shrink-0" />
                        <span>{t('navigation.discoverUsers')}</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => onNavigate('events')}
                        className="flex items-center justify-center lg:justify-start text-sm text-cream/80 hover:text-desert transition-colors duration-200 w-full py-1"
                      >
                        <Calendar size={16} className="inline mr-2 flex-shrink-0" />
                        <span>{t('navigation.events')}</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => onProfileCreate('login')}
                        className="flex items-center justify-center lg:justify-start text-sm text-cream/80 hover:text-desert transition-colors duration-200 w-full py-1"
                      >
                        <User size={16} className="inline mr-2 flex-shrink-0" />
                        <span>{t('navigation.profile')}</span>
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Legal & Contact Section */}
                <div className="space-y-4 lg:border-l lg:border-cream/10 lg:pl-6">
                  <h3 className="text-lg font-semibold text-cream text-center lg:text-left">{t('home.footer.legalAndContact')}</h3>
                  <ul className="space-y-2 lg:space-y-3">
                    <li>
                      <button
                        onClick={() => onNavigate('legal')}
                        className="flex items-center justify-center lg:justify-start text-sm text-cream/80 hover:text-desert transition-colors duration-200 w-full py-1"
                      >
                        <Shield size={16} className="inline mr-2 flex-shrink-0" />
                        <span>{t('navigation.legal')}</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => window.open('mailto:werte-im-wandel@mailbox.org', '_blank')}
                        className="flex items-center justify-center lg:justify-start text-sm text-cream/80 hover:text-desert transition-colors duration-200 w-full py-1"
                      >
                        <Mail size={16} className="inline mr-2 flex-shrink-0" />
                        <span>{t('home.footer.contact')}</span>
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Community & Support Section */}
                <div className="space-y-4 lg:border-l lg:border-cream/10 lg:pl-6">
                  <h3 className="text-lg font-semibold text-cream text-center lg:text-left">{t('home.footer.communityAndSupport')}</h3>
                  <ul className="space-y-2 lg:space-y-3">
                    <li>
                      <button
                        onClick={() => window.open('https://www.youtube.com/@werteimwandel', '_blank')}
                        className="flex items-center justify-center lg:justify-start text-sm text-cream/80 hover:text-desert transition-colors duration-200 w-full py-1"
                      >
                        <Youtube size={16} className="inline mr-2 flex-shrink-0" />
                        <span>{t('home.footer.youtubeChannel')}</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => window.open('https://buymeacoffee.com/werteimwandel', '_blank')}
                        className="flex items-center justify-center lg:justify-start text-sm text-cream/80 hover:text-desert transition-colors duration-200 w-full py-1"
                      >
                        <Heart size={16} className="inline mr-2 flex-shrink-0" />
                        <span>{t('home.footer.supportProject')}</span>
                      </button>
                    </li>
                  </ul>
                  <div className="pt-4 border-t border-cream/20 lg:mt-8">
                    <div className="text-center lg:text-left">
                      <p className="text-xs text-cream/60 font-medium">
                        <button
                          onClick={() => onNavigate('changelog')}
                          className="inline-flex bg-desert/20 backdrop-blur-[5px] hover:bg-desert/30 border border-desert/40 hover:border-desert/50 text-cream hover:text-white py-2 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] items-center space-x-2 shadow-glass-footer-button hover:shadow-glass-footer-button"
                        >
                          <Sparkles size={16} className="animate-pulse" />
                          <span>{t('home.footer.newInApp')}</span>
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Border with Additional Info */}
              <div className="mt-8 pt-6 border-t border-cream/20">
                <div className="text-center">
                  <p className="text-sm text-cream/70 font-medium p-4">
                    {t('home.footer.connectWithLikeMindedNearby')}
                  </p>
                  <div className="flex justify-center mt-4">
                    <LanguageSelector variant="flags" />
                  </div>
                  <p className="text-xs text-cream/60 mt-2">
                    {t('home.footer.copyright')}
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}