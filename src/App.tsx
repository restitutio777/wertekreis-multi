import React, { useState, useEffect } from 'react';
import { Suspense, lazy } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { MapPin, User, Users, Calendar } from 'lucide-react';
import DesignSystemShowcase from './components/DesignSystemShowcase';
import { authHelpers, isSupabaseConfigured, clearSupabaseTokens, connectionRequestHelpers } from './lib/supabaseClient';

// Lazy load page components for code splitting
const HomePage = lazy(() => import('./components/HomePage'));
const MapSearchPage = lazy(() => import('./components/MapSearchPage'));
const DiscoverUsersPage = lazy(() => import('./components/DiscoverUsersPage'));
const LegalPage = lazy(() => import('./components/LegalPage'));
const AuthPage = lazy(() => import('./components/AuthPage'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const EventsPage = lazy(() => import('./components/EventsPage'));
const ChangelogPage = lazy(() => import('./components/ChangelogPage'));

type Page = 'home' | 'map_search' | 'discover_users' | 'events' | 'legal' | 'auth' | 'profile' | 'changelog' | 'design_system';
type AuthFlow = 'login' | 'signup' | 'forgotPassword' | 'resetPassword';

// SEO Meta-Daten für jede Seite
const getPageSEO = (page: Page) => {
  const seoData = {
    home: {
      title: 'Werte•Kreis: Spirituelle Community & Gleichgesinnte App',
      description: 'Werte•Kreis: Finde spirituelle Menschen in deiner Nähe. Knüpfe authentische Verbindungen, entdecke Events & Kraftorte. Jetzt App herunterladen!'
    },
    map_search: {
      title: 'Spirituelle Orte entdecken: Kraftplätze finden | Werte•Kreis',
      description: 'Entdecke spirituelle Orte und Kraftplätze in deiner Umgebung. Finde magische Orte für Meditation, Reflexion und spirituelle Praxis mit Werte•Kreis.'
    },
    discover_users: {
      title: 'Gleichgesinnte finden: Spirituelle Menschen verbinden | Werte•Kreis',
      description: 'Finde spirituelle Menschen in deiner Nähe. Vernetze dich mit Gleichgesinnten für tiefe Gespräche und authentische Verbindungen über Werte•Kreis.'
    },
    events: {
      title: 'Wertvolle Events finden: Meditation & Workshops | Werte•Kreis',
      description: 'Entdecke wertvolle Events wie Meditationen, Workshops und Retreats in deiner Region. Melde dich an und erlebe seelenvolle Momente mit Werte•Kreis.'
    },
    legal: {
      title: 'Datenschutz & Impressum | Werte•Kreis',
      description: 'Datenschutzerklärung und Impressum der Werte•Kreis App. Erfahre mehr über unsere Datenschutzrichtlinien und rechtlichen Informationen.'
    },
    auth: {
      title: 'Anmelden & Registrieren | Werte•Kreis',
      description: 'Melde dich bei Werte•Kreis an oder registriere dich kostenlos. Werde Teil der spirituellen Community und finde Gleichgesinnte in deiner Nähe.'
    },
    profile: {
      title: 'Mein Profil | Werte•Kreis',
      description: 'Verwalte dein Werte•Kreis Profil. Bearbeite deine Interessen, verwalte Verbindungen und entdecke neue spirituelle Kontakte in deiner Community.'
    },
    changelog: {
      title: 'Neu in der App | Werte•Kreis',
      description: 'Entdecke die neuesten Features und Verbesserungen in der Werte•Kreis App. Erfahre, was sich verändert hat und wie du das Beste aus der App herausholen kannst.'
    }
  };
  
  return seoData[page] || seoData.home;
};
function App() {
  const { t, i18n, ready } = useTranslation();

// Loading component for Suspense fallback
  const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-cream via-akaroa-100 to-akaroa-200 flex items-center justify-center">
    <div className="relative z-10 text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rhino mx-auto"></div>
      <p className="text-rhino font-medium">{t('common.loading')}</p>
    </div>
  </div>
);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [initialAuthFlow, setInitialAuthFlow] = useState<AuthFlow>('login');
  const [connectedUserIds, setConnectedUserIds] = useState<string[]>([]);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (!isSupabaseConfigured) {
        setIsLoadingAuth(false);
        return;
      }

      try {
        const { data, error } = await authHelpers.getCurrentUser();
        if (error) {
          // If there's an auth error, especially refresh token issues, clear tokens and sign out
          console.log('Auth error detected, signing out:', error);
          
          // Clear stale tokens if it's a refresh token error
          if (error.message?.includes('Invalid Refresh Token') || 
              error.message?.includes('refresh_token_not_found') ||
              error.message?.includes('session_not_found') ||
              error.message?.includes('Session from session_id claim in JWT does not exist')) {
            clearSupabaseTokens();
          }
          
          await authHelpers.signOut();
          setUser(null);
          
          // Force page reload for session errors to completely reset client state
          if (error.message?.includes('session_not_found') ||
              error.message?.includes('Session from session_id claim in JWT does not exist')) {
            window.location.reload();
            return;
          }
        } else if (data.user) {
          setUser(data.user);
          
          // Load connected users when user is authenticated
          try {
            const { data: connectionsData } = await connectionRequestHelpers.getAcceptedConnections(data.user.id);
            if (connectionsData) {
              const connectedIds = connectionsData.map(conn => 
                conn.sender_id === data.user.id ? conn.receiver_id : conn.sender_id
              );
              setConnectedUserIds(connectedIds);
            }
          } catch (error) {
            console.error('Error loading connected users:', error);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Clear any stale session and tokens on unexpected errors
        try {
          clearSupabaseTokens();
          await authHelpers.signOut();
          setUser(null);
        } catch (signOutError) {
          console.error('Error signing out after auth check failure:', signOutError);
        }
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    if (isSupabaseConfigured) {
      const { data: { subscription } } = authHelpers.onAuthStateChange((event, session) => {
        if (event === 'TOKEN_REFRESHED' && !session?.user) {
          // If token refresh failed, clear the user state
          console.log('Token refresh failed, clearing user state');
          setUser(null);
          setConnectedUserIds([]);
        } else {
          setUser(session?.user || null);
          
          // Load connected users when user signs in
          if (session?.user) {
            connectionRequestHelpers.getAcceptedConnections(session.user.id)
              .then(({ data }) => {
                if (data) {
                  const connectedIds = data.map(conn => 
                    conn.sender_id === session.user.id ? conn.receiver_id : conn.sender_id
                  );
                  setConnectedUserIds(connectedIds);
                }
              })
              .catch(error => console.error('Error loading connected users:', error));
          } else {
            setConnectedUserIds([]);
          }
        }
        
        // Redirect to profile after successful login
        if (event === 'SIGNED_IN' && session?.user) {
          setCurrentPage('profile');
        }
        
        // Redirect to home after logout
        if (event === 'SIGNED_OUT') {
          setCurrentPage('home');
          setConnectedUserIds([]);
        }
      });

      return () => { subscription.unsubscribe(); };
    }
  }, []);

  const handleAuthSuccess = () => {
    setCurrentPage('profile');
  };

  const handleSignOut = () => {
    const performSignOut = async () => {
      try {
        await authHelpers.signOut();
        setUser(null);
        setConnectedUserIds([]);
        setCurrentPage('home');
      } catch (error) {
        console.error('Error signing out:', error);
        // Still clear local state even if Supabase signout fails
        setUser(null);
        setConnectedUserIds([]);
        setCurrentPage('home');
      }
    };
    
    performSignOut();
  };

  const handleProfileCreate = (authFlow: AuthFlow = 'signup') => {
    if (user) {
      setViewingProfileId(null); // Ensure we're viewing own profile
      setCurrentPage('profile');
    } else {
      setInitialAuthFlow(authFlow);
      setCurrentPage('auth');
    }
  };

  const handleNavigateToAuth = (authFlow: AuthFlow = 'login') => {
    setInitialAuthFlow(authFlow);
    setCurrentPage('auth');
  };

  const handleViewProfile = (profileId: string | null = null) => {
    setViewingProfileId(profileId);
    setCurrentPage('profile');
  };

  // URL-based routing and language management
  const getPath = (page: Page, lang: string = i18n.language) => {
    return `/${lang}/${page}`;
  };

  const navigateTo = (page: Page, lang: string = i18n.language) => {
    const newPath = getPath(page, lang);
    window.history.pushState({ page, lang }, '', newPath);
    setCurrentPage(page);
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
        if (event.state.lang && i18n.language !== event.state.lang) {
          i18n.changeLanguage(event.state.lang);
        }
      } else {
        // Fallback for initial load or unknown state
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        
        let langFromUrl = 'de';
        let pageFromUrl: Page = 'home';
        
        if (pathSegments.length === 0) {
          langFromUrl = 'de';
          pageFromUrl = 'home';
        } else if (pathSegments.length === 1) {
          const segment = pathSegments[0];
          if (['de', 'en', 'fr'].includes(segment)) {
            langFromUrl = segment;
            pageFromUrl = 'home';
          } else {
            langFromUrl = 'de';
            pageFromUrl = segment as Page;
          }
        } else {
          langFromUrl = pathSegments[0] || 'de';
          pageFromUrl = (pathSegments[1] || 'home') as Page;
        }
        
        // Validate page and language
        const validPages: Page[] = ['home', 'map_search', 'discover_users', 'events', 'legal', 'auth', 'profile', 'changelog', 'design_system'];
        if (!validPages.includes(pageFromUrl)) {
          pageFromUrl = 'home';
        }
        if (!['de', 'en', 'fr'].includes(langFromUrl)) {
          langFromUrl = 'de';
        }
        
        setCurrentPage(pageFromUrl);
        if (i18n.language !== langFromUrl) {
          i18n.changeLanguage(langFromUrl);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [i18n]);

  // Initial URL parsing on load
  useEffect(() => {
    if (ready) { // Ensure i18n is ready before parsing URL
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      
      // Handle different URL patterns
      let langFromUrl = 'de';
      let pageFromUrl: Page = 'home';
      
      if (pathSegments.length === 0) {
        // Root URL: /
        langFromUrl = 'de';
        pageFromUrl = 'home';
      } else if (pathSegments.length === 1) {
        // Could be /de or /home
        const segment = pathSegments[0];
        if (['de', 'en', 'fr'].includes(segment)) {
          // It's a language: /de
          langFromUrl = segment;
          pageFromUrl = 'home';
        } else {
          // It's a page without language: /home
          langFromUrl = 'de';
          pageFromUrl = segment as Page;
        }
      } else {
        // Full path: /de/home
        langFromUrl = pathSegments[0] || 'de';
        pageFromUrl = (pathSegments[1] || 'home') as Page;
      }
      
      // Validate page
      const validPages: Page[] = ['home', 'map_search', 'discover_users', 'events', 'legal', 'auth', 'profile', 'changelog', 'design_system'];
      if (!validPages.includes(pageFromUrl)) {
        pageFromUrl = 'home';
      }
      
      // Validate language
      if (!['de', 'en', 'fr'].includes(langFromUrl)) {
        langFromUrl = 'de';
      }

      if (i18n.language !== langFromUrl) {
        i18n.changeLanguage(langFromUrl);
      }
      setCurrentPage(pageFromUrl);
      
      // Update URL to ensure consistent format
      const correctPath = getPath(pageFromUrl, langFromUrl);
      if (window.location.pathname !== correctPath) {
        window.history.replaceState({ page: pageFromUrl, lang: langFromUrl }, '', correctPath);
      }
    }
  }, [ready, i18n]);

  // Update URL when language changes via selector
  useEffect(() => {
    navigateTo(currentPage, i18n.language);
  }, [i18n.language]);

  // Aktuelle SEO-Daten basierend auf der aktuellen Seite
  const currentSEO = getPageSEO(currentPage);
  
  // Generate canonical URL for current page and language
  const getCanonicalUrl = (page: Page, lang: string) => {
    const baseUrl = 'https://wertekreis.org';
    return `${baseUrl}/${lang}/${page}`;
  };
  
  const canonicalUrl = getCanonicalUrl(currentPage, i18n.resolvedLanguage || 'de');

  const renderPage = () => {
    return (
      <Suspense fallback={<PageLoader />}>
        {(() => {
          switch (currentPage) {
            case 'home':
              return <HomePage onNavigate={navigateTo} onProfileCreate={handleProfileCreate} />;
            case 'map_search':
              return <MapSearchPage onNavigate={navigateTo} />;
            case 'discover_users':
              return <DiscoverUsersPage onNavigate={navigateTo} onViewProfile={handleViewProfile} user={user} onNavigateToAuth={handleNavigateToAuth} connectedUserIds={connectedUserIds || []} />;
            case 'events':
              return <EventsPage onNavigate={navigateTo} />;
            case 'legal':
              return <LegalPage onNavigate={navigateTo} />;
            case 'auth':
              return <AuthPage onNavigate={navigateTo} onAuthSuccess={handleAuthSuccess} initialAuthFlow={initialAuthFlow} />;
            case 'profile':
              return <ProfilePage onNavigate={navigateTo} onSignOut={handleSignOut} viewingProfileId={viewingProfileId} onViewProfile={handleViewProfile} connectedUserIds={connectedUserIds} />;
            case 'changelog':
              return <ChangelogPage onNavigate={navigateTo} />;
            case 'design_system':
              return <DesignSystemShowcase />;
            default:
              return <HomePage onNavigate={navigateTo} onProfileCreate={handleProfileCreate} />;
          }
        })()}
      </Suspense>
    );
  };

  if (isLoadingAuth || !ready) { // Wait for i18n to be ready
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-akaroa-100 to-akaroa-200 flex items-center justify-center">
        <div className="relative z-10 text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rhino mx-auto"></div>
          <p className="text-rhino font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <div className="bg-cream flex flex-col relative">
      <Helmet>
        <html lang={i18n.resolvedLanguage} />
        <title>{currentSEO.title}</title>
        <meta name="description" content={currentSEO.description} />
        <meta property="og:title" content={currentSEO.title} />
        <meta property="og:description" content={currentSEO.description} />
        <meta property="twitter:title" content={currentSEO.title} />
        <meta property="twitter:description" content={currentSEO.description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:locale" content={i18n.resolvedLanguage === 'de' ? 'de_DE' : i18n.resolvedLanguage === 'fr' ? 'fr_FR' : 'en_US'} />
        {/* Hreflang tags for SEO */}
        {i18n.languages.map(lang => (
          <link
            key={lang}
            rel="alternate"
            hrefLang={lang}
            href={`https://wertekreis.org/${lang}/${currentPage}`}
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`https://wertekreis.org/de/${currentPage}`} />
      </Helmet>
      
      <main className="flex-1 pb-20 relative z-10">
        {renderPage()}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-cream/70 backdrop-blur-[12px] shadow-glass-nav border-t border-sandstone-300/50 z-20">
        <div className="flex justify-around items-center py-2 px-6 max-w-md mx-auto">
          <button
            onClick={() => navigateTo('map_search')}
            className={`flex flex-col items-center space-y-0.5 p-2 rounded-xl transition-all duration-200 ${
              currentPage === 'map_search'
                ? 'text-rhino bg-rhino/10'
                : 'text-walnut hover:text-rhino hover:bg-rhino/10'
            }`}
          >
            <MapPin size={20} />
            <span className="text-xxs font-medium">{t('navigation.mapSearch')}</span>
          </button>
          
          <button
            onClick={() => navigateTo('discover_users')}
            className={`flex flex-col items-center space-y-0.5 p-2 rounded-xl transition-all duration-200 ${
              currentPage === 'discover_users'
                ? 'text-rhino bg-rhino/10'
                : 'text-walnut hover:text-rhino hover:bg-rhino/10'
            }`}
          >
            <Users size={20} />
            <span className="text-xxs font-medium">{t('navigation.discoverUsers')}</span>
          </button>
          
          <button
            onClick={() => navigateTo('events')}
            className={`flex flex-col items-center space-y-0.5 p-2 rounded-xl transition-all duration-200 ${
              currentPage === 'events'
                ? 'text-rhino bg-rhino/10'
                : 'text-walnut hover:text-rhino hover:bg-rhino/10'
            }`}
          >
            <Calendar size={20} />
            <span className="text-xxs font-medium">{t('navigation.events')}</span>
          </button>
          
          <button
            onClick={() => user ? navigateTo('profile') : handleNavigateToAuth('login')}
            className={`flex flex-col items-center space-y-0.5 p-2 rounded-xl transition-all duration-200 ${
              currentPage === 'profile' || currentPage === 'auth'
                ? 'text-rhino bg-rhino/10'
                : 'text-walnut hover:text-rhino hover:bg-rhino/10'
            }`}
          >
            <User size={20} />
            <span className="text-xxs font-medium">
              {user ? t('navigation.profile') : t('navigation.login')}
            </span>
          </button>
        </div>
      </nav>
      </div>
    </HelmetProvider>
  );
}

export default App;