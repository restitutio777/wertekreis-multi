import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Users, Search, MapPin, Heart, Eye, AlertCircle, CheckCircle, Loader, Filter, Home, SlidersHorizontal, X, MessageCircle } from 'lucide-react';
import { profileHelpers, Profile, isSupabaseConfigured, getLocalizedField } from '../lib/supabaseClient';
import { APP_CATEGORIES, isValidCategory } from '../constants/categories';

interface DiscoverUsersPageProps {
  onNavigate: (page: 'home' | 'map_search' | 'legal' | 'auth' | 'profile' | 'discover_users') => void;
  onViewProfile: (profileId: string) => void;
  user: any;
  onNavigateToAuth: (authFlow?: 'login' | 'signup' | 'forgotPassword' | 'resetPassword') => void;
  connectedUserIds: string[]; // Track connected users
}

export default function DiscoverUsersPage({ onNavigate, onViewProfile, user, onNavigateToAuth, connectedUserIds }: DiscoverUsersPageProps) {
  const { t, i18n } = useTranslation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<Profile | null>(null);

  // Get unique locations from profiles
  const uniqueLocations = Array.from(new Set(
    profiles
      .map(p => p.location_city)
      .filter(city => city && city.trim() !== '')
  )).sort();

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Load public profiles
  useEffect(() => {
    const loadProfiles = async () => {
      if (!isSupabaseConfigured) {
        setMessage({
          type: 'info',
          text: 'Supabase ist nicht konfiguriert. Bitte verbinde dich mit der Datenbank, um Profile zu laden.'
        });
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await profileHelpers.getPublicProfiles(50); // Load more profiles
        
        if (error) {
          console.error('Error loading profiles:', error);
          setMessage({
            type: 'error',
            text: `${t('errors.unexpectedError')}: ${error.message}`
          });
        } else {
          setProfiles(data || []);
          setFilteredProfiles(data || []);
          
          // Sort profiles by completeness (most complete first)
          const sortedProfiles = (data || []).sort((a, b) => {
            // Calculate completeness score for each profile
            const getCompletenessScore = (profile: Profile) => {
              let score = 0;
              
              // Bio (most important - 3 points)
              const bio = getLocalizedField(profile.bio, i18n.language);
              if (bio && bio.trim().length > 0) {
                score += 3;
              }
              
              // Interests (2 points)
              if (profile.interests && profile.interests.length > 0) {
                score += 2;
              }
              
              // Location (1 point)
              if (profile.location_city && profile.location_city.trim().length > 0) {
                score += 1;
              }
              
              return score;
            };
            
            const scoreA = getCompletenessScore(a);
            const scoreB = getCompletenessScore(b);
            
            // Sort by completeness score (higher first)
            if (scoreA !== scoreB) {
              return scoreB - scoreA;
            }
            
            // If scores are equal, sort alphabetically by display name or username
            const nameA = (a.display_name || a.username || '').toLowerCase();
            const nameB = (b.display_name || b.username || '').toLowerCase();
            return nameA.localeCompare(nameB);
          });
          
          setProfiles(sortedProfiles);
          setFilteredProfiles(sortedProfiles);
          
          if (data && data.length > 0) {
            setMessage({
              type: 'success',
              text: `${data.length} ${t('discover.publicProfilesFound')}`
            });
          } else {
            setMessage({
              type: 'info',
              text: t('discover.noPublicProfiles')
            });
          }
        }
      } catch (error) {
        console.error('Error loading profiles:', error);
        setMessage({
          type: 'error',
          text: t('errors.unexpectedError')
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfiles();
  }, []);

  // Filter profiles based on search and filters
  useEffect(() => {
    let filtered = profiles;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(profile => 
        (profile.display_name?.toLowerCase().includes(term)) ||
        (profile.username?.toLowerCase().includes(term)) ||
        (profile.bio?.toLowerCase().includes(term)) ||
        (profile.interests && Array.isArray(profile.interests) && 
         profile.interests.some(interest => 
           interest.toLowerCase().includes(term)
         )) ||
        (profile.location_city?.toLowerCase().includes(term)) ||
        (profile.location_country?.toLowerCase().includes(term))
      );
    }

    // Interest filter
    if (selectedInterest) {
      filtered = filtered.filter(profile => 
        profile.interests && Array.isArray(profile.interests) && 
        profile.interests.some(interest => 
          interest.toLowerCase() === selectedInterest.toLowerCase()
        )
      );
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(profile => 
        profile.location_city === selectedLocation
      );
    }

    setFilteredProfiles(filtered);
  }, [profiles, searchTerm, selectedInterest, selectedLocation]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedInterest('');
    setSelectedLocation('');
    setShowFilters(false);
  };

  const handleViewProfile = (profile: Profile) => {
    setViewingProfile(profile);
  };

  const handleBackToList = () => {
    setViewingProfile(null);
  };
  const hasActiveFilters = searchTerm || selectedInterest || selectedLocation;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-stone-600">Lade Profile...</p>
        </div>
      </div>
    );
  }

  // If viewing a specific profile, show profile detail view
  if (viewingProfile) {
    return (
      <div className="min-h-screen bg-cream relative">
        {/* Background Image with Overlay */}
        <div className="fixed inset-0 z-0">
          <img 
            src="/topglobe.jpg" 
            alt="Werte•Kreis Background" 
            className="w-full h-full object-cover object-center"
            style={{ 
              imageRendering: 'crisp-edges',
              filter: 'contrast(1.1) brightness(1.05) saturate(1.1)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-akaroa-100/70 via-akaroa-200/60 to-akaroa-300/70"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-rhino/8 via-transparent to-walnut/12"></div>
        </div>

        {/* Mobile Back Button */}
        <div className="fixed top-4 left-4 z-20 lg:hidden">
          <button
            onClick={handleBackToList}
            className="w-8 h-8 bg-rhino/20 backdrop-blur-md text-white rounded-full shadow-lg hover:bg-rhino/40 transition-all duration-200 flex items-center justify-center active:scale-95"
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-rhino-900/90 to-rhino-800/90 backdrop-blur-md shadow-xl border-b border-rhino-700/60 relative z-10">
          <div className="max-w-md mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackToList}
                  className="p-2 hover:bg-rhino-700/80 backdrop-blur-sm rounded-lg transition-all duration-200 active:scale-95 lg:flex hidden shadow-glass-button-sm"
                  title="Zurück zur Liste"
                >
                  <ArrowLeft size={20} className="text-cream" />
                </button>
                <div className="flex items-center space-x-3">
                  <Users size={24} className="text-cream" />
                  <h1 className="text-xl font-medium font-logo text-cream tracking-wide">
                    Gleichgesinnte
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md lg:max-w-3xl mx-auto px-3 py-6 pb-24 md:px-6 space-y-6 relative z-10">
          {/* Profile Content */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-sandstone-200">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-desert to-desert-700 rounded-full flex items-center justify-center shadow-lg mx-auto">
                <Users size={32} className="text-white" />
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold font-logo text-rhino">
                  {viewingProfile.display_name || viewingProfile.username || 'Unbekannt'}
                </h2>
                {viewingProfile.location_city && (
                  <p className="text-walnut mt-1">
                    {[viewingProfile.location_city, viewingProfile.location_country].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            {viewingProfile.bio && (
              <div className="mt-6 bg-akaroa-100/70 rounded-lg p-4 shadow-md border border-akaroa-200/50">
                <h3 className="font-medium font-logo text-rhino mb-2">{t('profile.aboutMe')}</h3>
                <p className="text-walnut leading-relaxed">{getLocalizedField(viewingProfile.bio, i18n.language)}</p>
              </div>
            )}

            {/* Contribution */}
            {viewingProfile.contribution && (
              <div className="mt-6 bg-desert/20 rounded-lg p-4 shadow-md border border-desert/30">
                <h3 className="font-medium font-logo text-rhino mb-2">{t('profile.myContribution')}</h3>
                <p className="text-walnut leading-relaxed">{getLocalizedField(viewingProfile.contribution, i18n.language)}</p>
              </div>
            )}

            {/* Interests */}
            {viewingProfile.interests && viewingProfile.interests.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium font-logo text-rhino mb-3">{t('profile.interests')}</h3>
                <div className="flex flex-wrap gap-2">
                  {viewingProfile.interests.filter(isValidCategory).map((interest) => (
                    <span
                      key={interest}
                      className="bg-akaroa-200 text-rhino px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {t(interest)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Connect Button */}
            {user && user.id !== viewingProfile.id && (
              <div className="mt-6 pt-6 border-t border-sandstone-300">
                {connectedUserIds && connectedUserIds.includes(viewingProfile.id) ? (
                  <div className="space-y-3">
                    <div className="bg-success-50/80 border border-success-200/70 rounded-lg p-3 text-center shadow-md">
                      <div className="flex items-center justify-center space-x-2 text-success-700">
                        <CheckCircle size={20} />
                        <span className="font-medium">{t('discover.alreadyConnected')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // This should trigger chat functionality
                        // For now, we'll navigate back to profile where chat is available
                        onNavigate('profile');
                      }}
                      className="w-full bg-desert/70 backdrop-blur-[8px] text-white py-3 px-6 rounded-xl font-semibold shadow-glass-button hover:shadow-glass-button-hover transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 border border-desert-600/50 hover:border-desert-600/60"
                    >
                      <MessageCircle size={20} />
                      <span>{t('discover.startChat')}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onViewProfile(viewingProfile.id)}
                    className="w-full bg-desert/70 backdrop-blur-[8px] text-white py-3 px-6 rounded-xl font-semibold shadow-glass-button hover:shadow-glass-button-hover transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 border border-desert-600/50 hover:border-desert-600/60"
                  >
                    <Heart size={20} />
                    <span>{t('discover.sendRequest')}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-cream relative">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/werte-kreis-app-bg.jpg" 
          alt="Werte•Kreis Background" 
          className="w-full h-full object-cover object-center"
          style={{ 
            imageRendering: 'crisp-edges',
            filter: 'contrast(1.1) brightness(1.05) saturate(1.1)'
          }}
        />
        {/* Minimal overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-akaroa-100/70 via-akaroa-200/60 to-akaroa-300/70"></div>
        {/* Very subtle accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-rhino/8 via-transparent to-walnut/12"></div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-rhino-900/90 to-rhino-800/90 backdrop-blur-md shadow-xl border-b border-rhino-700/60 relative z-10">
        <div className="max-w-md mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onNavigate('home')}
                className="p-2 hover:bg-rhino-700/80 backdrop-blur-sm rounded-lg transition-all duration-200 active:scale-95 lg:flex hidden shadow-glass-button-sm"
                title="Zurück zur Startseite"
              >
                <Home size={20} className="text-cream" />
              </button>
              <div className="flex items-center space-x-3">
                <Users size={24} className="text-cream" />
                <h1 className="text-2xl font-medium font-logo text-cream tracking-wide">{t('discover.title')}</h1>
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-all duration-200 backdrop-blur-sm shadow-glass-button-sm hover:shadow-glass-button ${
                showFilters || hasActiveFilters
                  ? 'bg-white/15 text-white hover:bg-white/25'
                  : 'bg-white/15 text-white hover:bg-white/25'
              } active:scale-95`}
            >
              <SlidersHorizontal size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md lg:max-w-3xl mx-auto px-3 py-6 md:p-6 space-y-6 relative z-10">
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

        {/* Message Display */}
        {message && (
          <div className={`rounded-lg p-4 flex items-center space-x-3 backdrop-blur-[5px] ${
            message.type === 'success' ? 'bg-success-50/80 text-success-700 border border-success-200/70' :
            message.type === 'error' ? 'bg-error-50/80 text-error-700 border border-error-200/70' :
            'bg-desert-50/80 text-desert-700 border border-desert-200/70'
          }`}>
            {message.type === 'success' && <CheckCircle size={20} className="text-success-600" />}
            {message.type === 'error' && <AlertCircle size={20} className="text-error-600" />}
            {message.type === 'info' && <AlertCircle size={20} className="text-desert-600" />}
            <span className="text-sm font-medium text-rhino">{message.text}</span>
          </div>
        )}

        {/* Supabase Connection Status */}
        {!isSupabaseConfigured && (
          <div className="bg-warning-50/80 backdrop-blur-[5px] border border-warning-200/70 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle size={20} className="text-warning-600" />
              <div>
                <p className="text-sm font-medium text-warning-700">{t('errors.databaseNotConnected')}</p>
                <p className="text-xs text-warning-600 mt-1">
                  {t('errors.clickConnectSupabase')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User Guide Section */}
        <div className="bg-akaroa-100/70 backdrop-blur-[10px] rounded-lg p-4 border border-sandstone-300/50 shadow-glass-card">
          {!user ? (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold font-logo text-rhino">{t('discover.joinCommunity')}</h3>
                <p className="text-sm text-desert leading-relaxed">
                  {t('discover.joinDescription')}
                </p>
              </div>
              
              {/* Discrete explanation for non-logged users */}
              <div className="bg-akaroa/60 rounded-lg p-4 border border-sandstone-300/40 shadow-md">
                <h4 className="text-base font-semibold font-logo text-rhino mb-3">💫 {t('discover.whatAwaits')}:</h4>
                <ul className="text-sm text-walnut space-y-2 text-left">
                  <li>• <strong>{t('discover.guide.browse')}:</strong> {t('discover.guide.browseDesc')}</li>
                  <li>• <strong>{t('discover.guide.filter')}:</strong> {t('discover.guide.filterDesc')}</li>
                  <li>• <strong>{t('discover.guide.contact')}:</strong> {t('discover.guide.contactDesc')}</li>
                  <li>• <strong>{t('discover.guide.network')}:</strong> {t('discover.guide.networkDesc')}</li>
                </ul>
              </div>
              
              <button
                onClick={() => onNavigateToAuth('signup')}
                className="bg-rhino/70 backdrop-blur-[8px] text-white py-3 px-8 rounded-xl font-semibold shadow-glass-button hover:shadow-glass-button-hover transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 mx-auto border border-rhino-700/50 hover:border-rhino-700/60"
              >
                <Users size={20} />
                <span>{t('discover.joinNow')}</span>
              </button>
              <p className="text-xs text-walnut">
                {t('discover.alreadyMember')}
                <button 
                  onClick={() => onNavigateToAuth('login')}
                  className="text-desert hover:text-desert/80 underline ml-1 font-medium"
                >
                  {t('discover.signInHere')}
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-desert text-center leading-relaxed">
                {t('discover.loggedInDescription')}
              </p>
              
              {/* Discrete explanation for logged-in users */}
              <div className="bg-akaroa/60 rounded-lg p-4 border border-sandstone-300/40 shadow-md">
                <h4 className="text-base font-semibold font-logo text-rhino mb-3">🔍 {t('discover.howItWorks')}:</h4>
                <ul className="text-sm text-walnut space-y-2">
                  <li>• <strong>{t('discover.guide.searchFilter')}:</strong> {t('discover.guide.searchFilterDesc')}</li>
                  <li>• <strong>{t('discover.guide.viewProfiles')}:</strong> {t('discover.guide.viewProfilesDesc')}</li>
                  <li>• <strong>{t('discover.guide.requestConnection')}:</strong> {t('discover.guide.requestConnectionDesc')}</li>
                  <li>• <strong>{t('discover.guide.chat')}:</strong> {t('discover.guide.chatDesc')}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        {/* Search Bar */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-sandstone-300">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-walnut" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
              placeholder={t('discover.searchPlaceholder')}
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-sandstone-300 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium font-logo text-rhino">{t('common.filter')}</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-desert hover:text-desert/80 underline"
                >
                  {t('common.clearAll')}
                </button>
              )}
            </div>

            {/* Interest Filter */}
            <div>
              <label className="block text-sm font-medium text-walnut mb-2">
                {t('map.interestArea')}
              </label>
              <select
                value={selectedInterest}
                onChange={(e) => setSelectedInterest(e.target.value)}
                className="w-full px-4 py-3 bg-cream/80 border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
              >
                <option value="">{t('map.allAreas')}</option>
                {APP_CATEGORIES.map((interest) => (
                  <option key={interest} value={interest}>
                    {t(interest)}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-walnut mb-2">
                {t('discover.city')}
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-3 bg-cream/80 border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
              >
                <option value="">{t('discover.allCities')}</option>
                {uniqueLocations.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-walnut">
          <span>
            {filteredProfiles.length} {t('discover.profilesFound')}
          </span>
          {hasActiveFilters && (
            <span className="text-desert">{t('discover.filtersActive')}</span>
          )}
        </div>

        {/* Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users size={48} className="text-walnut mx-auto mb-4" />
              <h3 className="font-medium font-logo text-rhino mb-2">
                {hasActiveFilters ? t('discover.noProfilesFound') : t('discover.noProfiles')}
              </h3>
              <p className="text-walnut text-sm">
                {hasActiveFilters 
                  ? t('discover.tryOtherFilters')
                  : t('discover.beFirstProfile')
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-desert hover:text-desert/80 underline text-sm"
                >
                  {t('common.resetFilters')}
                </button>
              )}
            </div>
          ) : (
            filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-sandstone-200 hover:border-sandstone-300/80 hover:shadow-lg transition-all duration-200 h-full flex flex-col group space-y-4 shadow-lg"
              >
                {/* Clean Profile Header */}
                <div>
                  <div 
                    onClick={() => handleViewProfile(profile)}
                    className="flex items-center justify-between cursor-pointer bg-akaroa-100/70 rounded-lg p-4 mb-4 shadow-md border border-akaroa-200/50"
                  >
                    <h3 className="text-lg font-semibold font-logo text-desert">
                      {profile.display_name || profile.username || 'Unbekannt'}
                    </h3>
                    <Eye size={18} className="text-desert" />
                  </div>
                  {profile.location_city && (
                    <p className="text-sm text-walnut mt-3">
                      {[profile.location_city, profile.location_country].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>

                {/* Essential Bio */}
                {profile.bio && (
                  <p className="text-rhino/70 text-sm line-clamp-3 leading-relaxed mt-2">
                    {getLocalizedField(profile.bio, i18n.language)}
                  </p>
                )}

                {/* Key Interests (Max 2) */}
                <div className="flex-1">
                  {profile.interests && profile.interests.length > 0 && (
                  <div>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.interests.filter(isValidCategory).slice(0, 2).map((interest) => (
                        <span
                          key={interest}
                          className="bg-akaroa-100 text-rhino/80 px-2 py-1 rounded text-xs font-medium"
                        >
                          {t(interest)}
                        </span>
                      ))}
                      {profile.interests.filter(isValidCategory).length > 2 && (
                        <span className="text-xs text-rhino/50 px-2 py-1">
                          +{profile.interests.filter(isValidCategory).length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Text */}
        <div className="bg-cream/90 backdrop-blur-sm rounded-lg p-4 border border-sandstone-300/50 shadow-lg">
          {!user ? (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold font-logo text-rhino">{t('discover.joinCommunity')}</h3>
                <p className="text-sm text-desert leading-relaxed">
                  {t('discover.joinDescription')}
                </p>
              </div>
              
              {/* Discrete explanation for non-logged users */}
              <div className="bg-akaroa/60 rounded-lg p-4 border border-sandstone-300/40 shadow-md">
                <h4 className="text-base font-semibold font-logo text-rhino mb-3">💫 {t('discover.whatAwaits')}:</h4>
                <ul className="text-sm text-walnut space-y-2 text-left">
                  <li>• <strong>{t('discover.guide.browse')}:</strong> {t('discover.guide.browseDesc')}</li>
                  <li>• <strong>{t('discover.guide.filter')}:</strong> {t('discover.guide.filterDesc')}</li>
                  <li>• <strong>{t('discover.guide.contact')}:</strong> {t('discover.guide.contactDesc')}</li>
                  <li>• <strong>{t('discover.guide.network')}:</strong> {t('discover.guide.networkDesc')}</li>
                </ul>
              </div>
              
              <button
                onClick={() => onNavigateToAuth('signup')}
                className="bg-rhino/70 backdrop-blur-[8px] text-white py-3 px-8 rounded-xl font-semibold shadow-glass-button hover:shadow-glass-button-hover transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 mx-auto border border-rhino-700/50 hover:border-rhino-700/60"
              >
                <Users size={20} />
                <span>{t('discover.joinNow')}</span>
              </button>
              <p className="text-xs text-walnut">
                {t('discover.alreadyMember')}
                <button 
                  onClick={() => onNavigateToAuth('login')}
                  className="text-desert hover:text-desert/80 underline ml-1 font-medium"
                >
                  {t('discover.signInHere')}
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-desert text-center leading-relaxed">
                {t('discover.loggedInDescription')}
              </p>
              
              {/* Discrete explanation for logged-in users */}
              <div className="bg-akaroa/60 rounded-lg p-4 border border-sandstone-300/40 shadow-md">
                <h4 className="text-base font-semibold font-logo text-rhino mb-3">🔍 {t('discover.howItWorks')}:</h4>
                <ul className="text-sm text-walnut space-y-2">
                  <li>• <strong>{t('discover.guide.searchFilter')}:</strong> {t('discover.guide.searchFilterDesc')}</li>
                  <li>• <strong>{t('discover.guide.viewProfiles')}:</strong> {t('discover.guide.viewProfilesDesc')}</li>
                  <li>• <strong>{t('discover.guide.requestConnection')}:</strong> {t('discover.guide.requestConnectionDesc')}</li>
                  <li>• <strong>{t('discover.guide.chat')}:</strong> {t('discover.guide.chatDesc')}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}