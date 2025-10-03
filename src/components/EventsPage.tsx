import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Plus, Star, Filter, Search, User, ExternalLink, MessageCircle, Heart, X, Save, Loader, CheckCircle, AlertCircle, Eye, CreditCard as Edit3, Trash2, Home } from 'lucide-react';
import { eventHelpers, rsvpHelpers, Event, NewEvent, authHelpers, isSupabaseConfigured, getLocalizedField } from '../lib/supabaseClient';
import { APP_CATEGORIES, isValidCategory } from '../constants/categories';
import { formatLocalizedDate, formatLocalizedTime } from '../utils/dateFormatting';

interface EventsPageProps {
  onNavigate: (page: 'home' | 'map_search' | 'discover_users' | 'events' | 'legal' | 'auth' | 'profile') => void;
}

export default function EventsPage({ onNavigate }: EventsPageProps) {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventFormData, setEventFormData] = useState<NewEvent>({
    title: { de: '', en: '', fr: '' },
    description: { de: '', en: '', fr: '' },
    event_date: '',
    event_time: '',
    location: { de: '', en: '', fr: '' },
    category: 'Gemeinschaft & echte Begegnung',
    created_by: '',
    image_url: '',
    max_attendees: undefined,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Load user and events
  useEffect(() => {
    const loadData = async () => {
      if (!isSupabaseConfigured) {
        setMessage({
          type: 'info',
          text: t('errors.supabaseNotConfigured')
        });
        setIsLoading(false);
        return;
      }

      try {
        // Get current user
        const { data: userData } = await authHelpers.getCurrentUser();
        setUser(userData.user);

        // Load events
        const { data: eventsData, error } = await eventHelpers.getEvents();
        
        if (error) {
          console.error('Error loading events:', error);
          setMessage({
            type: 'error',
            text: `${t('errors.unexpectedError')}: ${error.message}`
          });
        } else {
          setEvents(eventsData || []);
          setFilteredEvents(eventsData || []);
          
          if (eventsData && eventsData.length > 0) {
            setMessage({
              type: 'success',
              text: `${eventsData.length} ${t('events.eventsFound')}`
            });
          } else {
            setMessage({
              type: 'info',
              text: t('events.noEvents')
            });
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setMessage({
          type: 'error',
          text: t('errors.unexpectedError')
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter events based on category and search
  useEffect(() => {
    let filtered = events;

    // Category filter
    if (selectedCategory !== 'Alle') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        getLocalizedField(event.title, i18n.language).toLowerCase().includes(term) ||
        getLocalizedField(event.description, i18n.language).toLowerCase().includes(term) ||
        getLocalizedField(event.location, i18n.language).toLowerCase().includes(term) ||
        event.category.toLowerCase().includes(term)
      );
    }

    setFilteredEvents(filtered);
  }, [events, selectedCategory, searchTerm, i18n.language]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setMessage({ type: 'error', text: t('errors.loginRequired') });
      return;
    }

    const currentTitle = getLocalizedField(eventFormData.title, i18n.language);
    const currentDescription = getLocalizedField(eventFormData.description, i18n.language);
    const currentLocation = getLocalizedField(eventFormData.location, i18n.language);
    
    if (!currentTitle.trim() || !currentDescription.trim() || !eventFormData.event_date || !eventFormData.event_time || !currentLocation.trim()) {
      setMessage({ type: 'error', text: t('errors.fillAllFields') });
      return;
    }

    setIsCreating(true);
    setMessage(null);

    try {
      const eventData = {
        ...eventFormData,
        created_by: user.id
      };

      const { data, error } = await eventHelpers.createEvent(eventData);

      if (error) {
        console.error('Error creating event:', error);
        setMessage({ type: 'error', text: `${t('errors.unexpectedError')}: ${error.message}` });
      } else {
        setMessage({ type: 'success', text: t('events.eventCreated') });
        
        // Reset form
        setEventFormData({
          title: { de: '', en: '', fr: '' },
          description: { de: '', en: '', fr: '' },
          event_date: '',
          event_time: '',
          location: { de: '', en: '', fr: '' },
          category: 'Gemeinschaft & echte Begegnung',
          created_by: user.id,
          image_url: '',
          max_attendees: undefined,
        });
        setShowCreateForm(false);

        // Reload events
        const { data: eventsData } = await eventHelpers.getEvents();
        setEvents(eventsData || []);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setMessage({ type: 'error', text: t('errors.unexpectedError') });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRSVP = async (eventId: string, status: 'attending' | 'maybe' | 'not_attending') => {
    if (!user) {
      setMessage({ type: 'error', text: t('errors.loginRequired') });
      return;
    }

    try {
      const { error } = await rsvpHelpers.createOrUpdateRSVP(eventId, user.id, status);
      
      if (error) {
        setMessage({ type: 'error', text: `${t('errors.unexpectedError')}: ${error.message}` });
      } else {
        setMessage({ 
          type: 'success', 
          text: status === 'attending' ? t('events.rsvp.attending') : 
                status === 'maybe' ? t('events.rsvp.maybe') : t('events.rsvp.notAttending')
        });
        
        // Reload events to update RSVP counts
        const { data: eventsData } = await eventHelpers.getEvents();
        setEvents(eventsData || []);
      }
    } catch (error) {
      console.error('Error with RSVP:', error);
      setMessage({ type: 'error', text: t('errors.unexpectedError') });
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventFormData({
      title: typeof event.title === 'string' ? { de: event.title, en: '', fr: '' } : event.title,
      description: typeof event.description === 'string' ? { de: event.description, en: '', fr: '' } : event.description,
      event_date: event.event_date,
      event_time: event.event_time,
      location: typeof event.location === 'string' ? { de: event.location, en: '', fr: '' } : event.location,
      category: event.category,
      website_link: event.website_link || '',
      contact_info: event.contact_info || '',
      max_attendees: event.max_attendees || undefined,
      image_url: event.image_url || '',
      created_by: event.created_by || ''
    });
    setShowEventForm(true);
    setShowEventDetail(false);
  };

  const formatDate = (dateString: string) => {
    return formatLocalizedDate(dateString);
  };

  const formatTime = (timeString: string) => {
    return formatLocalizedTime(timeString);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center relative">
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
          <div className="absolute inset-0 bg-gradient-to-b from-akaroa-100/60 via-akaroa-200/60 to-akaroa-300/70"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-rhino/8 via-transparent to-walnut/12"></div>
        </div>

        <div className="relative z-10 text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rhino mx-auto"></div>
          <p className="text-rhino font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

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
      <div className="bg-gradient-to-r from-rhino-900/70 to-rhino-800/70 backdrop-blur-[15px] shadow-glass-nav border-b border-rhino-700/50 relative z-10">
        <div className="max-w-md mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onNavigate('home')}
                className="p-2 hover:bg-rhino-700/80 backdrop-blur-[5px] rounded-lg transition-all duration-200 active:scale-95 lg:flex hidden shadow-glass-button-sm"
                title="Zurück zur Startseite"
              >
                <Home size={20} className="text-cream" />
              </button>
              <div className="flex items-center space-x-3">
                <Calendar size={24} className="text-cream" />
                <h1 className="text-2xl font-medium font-logo text-cream tracking-wide">{t('events.title')}</h1>
              </div>
            </div>
            
            {user && (
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  // Scroll to form after a brief delay to allow form to render
                  setTimeout(() => {
                    const formElement = document.querySelector('[data-event-form]');
                    if (formElement) {
                      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }}
                className={`p-2 rounded-lg transition-all duration-200 backdrop-blur-[5px] shadow-glass-button-sm hover:shadow-glass-button ${
                  showCreateForm 
                    ? 'bg-white/15 text-white hover:bg-white/25'
                    : 'bg-white/15 text-white hover:bg-white/25'
                } active:scale-95`}
              >
                <Plus size={24} />
              </button>
            )}
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
                <h3 className="text-lg font-semibold font-logo text-rhino">{t('events.discoverDescription')}</h3>
                <p className="text-sm text-desert leading-relaxed">
                  {t('events.discoverDescription')}
                </p>
              </div>
              
              <div className="bg-akaroa/60 rounded-lg p-4 border border-sandstone-300/40 shadow-md">
                <h4 className="text-base font-semibold font-logo text-rhino mb-3">💫 {t('events.guide.discover')}:</h4>
                <ul className="text-sm text-walnut space-y-2 text-left">
                  <li>• <strong>{t('events.guide.discover')}:</strong> {t('events.guide.discoverDesc')}</li>
                  <li>• <strong>{t('events.guide.participate')}:</strong> {t('events.guide.participateDesc')}</li>
                  <li>• <strong>{t('events.guide.create')}:</strong> {t('events.guide.createDesc')}</li>
                  <li>• <strong>{t('events.guide.filter')}:</strong> {t('events.guide.filterDesc')}</li>
                </ul>
              </div>
              
              <button
                onClick={() => onNavigate('auth')}
                className="bg-rhino/70 backdrop-blur-[8px] text-white py-3 px-8 rounded-xl font-semibold shadow-glass-button hover:shadow-glass-button-hover transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 mx-auto border border-rhino-700/50 hover:border-rhino-700/60"
              >
                <User size={20} />
                <span>{t('events.loginToCreate')}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-desert text-center leading-relaxed">
                {t('events.loggedInDescription')}
              </p>
              
              <div className="bg-akaroa/60 rounded-lg p-4 border border-sandstone-300/40 shadow-md">
                <h4 className="text-base font-semibold font-logo text-rhino mb-3">🔍 {t('events.guide.discover')}:</h4>
                <ul className="text-sm text-walnut space-y-2">
                  <li>• <strong>{t('events.guide.discover')}:</strong> {t('events.guide.discoverDesc')}</li>
                  <li>• <strong>{t('events.guide.participate')}:</strong> {t('events.guide.participateDesc')}</li>
                  <li>• <strong>{t('events.guide.create')}:</strong> {t('events.guide.createDesc')}</li>
                  <li>• <strong>{t('events.guide.filter')}:</strong> {t('events.guide.filterDesc')}</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Create Event Form */}
        {showCreateForm && user && (
          <div data-event-form className="bg-cream/70 backdrop-blur-[15px] rounded-xl p-6 shadow-glass-card border border-sandstone-300/50">
            <div className="flex items-center space-x-3 mb-6">
              <Plus size={20} className="text-rhino" />
              <h3 className="font-medium font-logo text-rhino">{t('events.createEvent')}</h3>
            </div>
            
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-walnut mb-2">
                  {t('events.eventTitle')} *
                </label>
                <input
                  type="text"
                  value={getLocalizedField(eventFormData.title, i18n.language)}
                  onChange={(e) => setEventFormData(prev => ({ 
                    ...prev, 
                    title: { ...prev.title, [i18n.language]: e.target.value }
                  }))}
                  className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
                  placeholder={t('events.titlePlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-walnut mb-2">
                  {t('events.description')} *
                </label>
                <textarea
                  value={getLocalizedField(eventFormData.description, i18n.language)}
                  onChange={(e) => setEventFormData(prev => ({ 
                    ...prev, 
                    description: { ...prev.description, [i18n.language]: e.target.value }
                  }))}
                  className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200 resize-none"
                  rows={3}
                  placeholder={t('events.descriptionPlaceholder')}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-walnut mb-2">
                    {t('events.date')} *
                  </label>
                  <input
                    type="date"
                    value={eventFormData.event_date}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, event_date: e.target.value }))}
                    className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-walnut mb-2">
                    {t('events.time')} *
                  </label>
                  <input
                    type="time"
                    value={eventFormData.event_time}
                    onChange={(e) => setEventFormData(prev => ({ ...prev, event_time: e.target.value }))}
                    className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-walnut mb-2">
                  {t('events.location')} *
                </label>
                <input
                  type="text"
                  value={getLocalizedField(eventFormData.location, i18n.language)}
                  onChange={(e) => setEventFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, [i18n.language]: e.target.value }
                  }))}
                  className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
                  placeholder={t('events.locationPlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-walnut mb-2">
                  {t('events.category')}
                </label>
                <select
                  value={eventFormData.category}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
                >
                  <option value="">{t('events.selectCategory')}</option>
                  {APP_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {t(category)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-walnut mb-2">
                  {t('events.website')} ({t('common.optional')})
                </label>
                <input
                  type="url"
                  value={eventFormData.website_link || ''}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, website_link: e.target.value }))}
                  className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-walnut mb-2">
                  {t('events.contact')} ({t('common.optional')})
                </label>
                <input
                  type="text"
                  value={eventFormData.contact_info || ''}
                  onChange={(e) => setEventFormData(prev => ({ ...prev, contact_info: e.target.value }))}
                  className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
                  placeholder={t('events.contactPlaceholder')}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-walnut/10 text-walnut py-3 px-6 rounded-lg font-medium hover:bg-walnut/20 transition-colors duration-200"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 bg-rhino/70 backdrop-blur-[8px] text-cream py-3 px-6 rounded-lg font-medium shadow-glass-button hover:shadow-glass-button-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 border border-rhino-700/50 hover:border-rhino-700/60 transform hover:scale-[1.02] disabled:transform-none"
                >
                  {isCreating ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      <span>{t('events.creating')}</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>{t('events.createEvent')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-cream/70 backdrop-blur-[15px] rounded-xl p-4 shadow-glass-card border border-sandstone-300/50 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-walnut" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
              placeholder={t('events.searchEvents')}
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-walnut mb-2">
              {t('events.category')}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
            >
              <option value="Alle">{t('common.all')}</option>
              {APP_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {isValidCategory(category) ? t(category) : category}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-walnut">
            <span>
              {filteredEvents.length} {t('events.eventsFound')}
            </span>
            {(selectedCategory !== 'Alle' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedCategory('Alle');
                  setSearchTerm('');
                }}
                className="text-desert hover:text-desert/80 underline"
              >
                {t('common.resetFilters')}
              </button>
            )}
          </div>
        </div>

        {/* Events List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredEvents.length === 0 ? (
            <div className="bg-cream/70 backdrop-blur-[15px] rounded-xl p-8 shadow-glass-card border border-sandstone-300/50 text-center">
              <Calendar size={48} className="text-walnut mx-auto mb-4" />
              <p className="text-walnut text-sm">
                {searchTerm || selectedCategory !== 'Alle' 
                  ? t('events.tryOtherFilters')
                  : t('events.noEvents')
                }
              </p>
              {!searchTerm && selectedCategory === 'Alle' && (
                <div className="mt-6">
                  {user ? (
                    <button
                      onClick={() => {
                        setShowCreateForm(true);
                        // Scroll to form after a brief delay to allow form to render
                        setTimeout(() => {
                          const formElement = document.querySelector('[data-event-form]');
                          if (formElement) {
                            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 100);
                      }}
                      className="bg-rhino/70 backdrop-blur-[8px] text-white py-3 px-6 rounded-lg font-medium shadow-glass-button hover:shadow-glass-button-hover transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 mx-auto border border-rhino-700/50 hover:border-rhino-700/60"
                    >
                      <Plus size={18} />
                      <span>{t('events.createEvent')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate('auth')}
                      className="bg-rhino/70 backdrop-blur-[8px] text-white py-3 px-6 rounded-lg font-medium shadow-glass-button hover:shadow-glass-button-hover transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 mx-auto border border-rhino-700/50 hover:border-rhino-700/60"
                    >
                      <User size={18} />
                      <span>{t('events.loginToCreate')}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white/90 backdrop-blur-[10px] rounded-xl p-6 shadow-glass-card border border-sandstone-200/80 hover:shadow-glass-card-hover transition-all duration-200 flex flex-col"
              >
                {/* Event Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold font-logo text-rhino mb-2">
                    {getLocalizedField(event.title, i18n.language)}
                  </h3>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-desert/20 text-desert px-2 py-1 rounded text-xs font-medium">
                      {isValidCategory(event.category) ? t(event.category) : event.category}
                    </span>
                  </div>
                  
                  {/* Date, Time, and Location */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4 text-sm text-walnut">
                      <div className="flex items-center space-x-1">
                        <Calendar size={16} className="text-rhino" />
                        <span>{formatDate(event.event_date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={16} className="text-rhino" />
                        <span>{formatTime(event.event_time)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-walnut">
                      <MapPin size={16} className="text-rhino" />
                      <span>{getLocalizedField(event.location, i18n.language)}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="flex-1 mb-4">
                  <p className="text-walnut text-sm mb-4 line-clamp-3">
                    {getLocalizedField(event.description, i18n.language)}
                  </p>
                </div>

                {/* Creator and Attendees Info */}
                <div className="flex items-center justify-between mb-4 text-sm text-walnut">
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-walnut" />
                    <span>
                      {event.creator_profile?.display_name || event.creator_profile?.username || t('common.unknown')}
                    </span>
                  </div>
                  {event.rsvp_count && (
                    <div className="flex items-center space-x-1 text-desert">
                      <Users size={16} />
                      <span className="font-medium">{event.rsvp_count?.[0]?.count || 0}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowEventDetail(true);
                    }}
                    className="flex-1 bg-desert/10 text-desert py-2 px-4 rounded-lg font-medium hover:bg-desert/20 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Eye size={16} />
                    <span>{t('events.details')}</span>
                  </button>
                  
                  {user && (
                    <button
                      onClick={() => handleRSVP(event.id, 'attending')}
                      className="flex-1 bg-success-50 text-success-700 py-2 px-4 rounded-lg font-medium hover:bg-success-100 transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <Heart size={16} />
                      <span>{t('events.attend')}</span>
                    </button>
                  )}
                  
                  {event.website_link && (
                    <button
                      onClick={() => window.open(event.website_link, '_blank')}
                      className="bg-desert/10 text-desert py-2 px-3 rounded-lg hover:bg-desert/20 transition-colors duration-200"
                    >
                      <ExternalLink size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      {showEventDetail && selectedEvent && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-cream/90 backdrop-blur-[15px] rounded-xl max-w-md w-full shadow-glass-card my-8 max-h-[90vh] overflow-y-auto border border-sandstone-300/50">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-sandstone-300/50 bg-akaroa-100/60 backdrop-blur-[10px] shadow-glass-summary">
              <div className="flex items-center space-x-3">
                <Calendar size={20} className="text-rhino" />
                <h3 className="font-medium font-logo text-rhino">{t('events.details')}</h3>
              </div>
              <button
                onClick={() => setShowEventDetail(false)}
                className="p-2 hover:bg-akaroa-100/70 backdrop-blur-[5px] rounded-lg transition-all duration-200 shadow-glass-button-sm"
              >
                <X size={20} className="text-walnut" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="text-rhino">
                <h2 className="text-xl font-semibold font-logo mb-4">{getLocalizedField(selectedEvent.title, i18n.language)}</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3">
                    <Calendar size={18} className="text-rhino" />
                    <span className="text-walnut">{formatDate(selectedEvent.event_date)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock size={18} className="text-rhino" />
                    <span className="text-walnut">{formatTime(selectedEvent.event_time)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin size={18} className="text-rhino" />
                    <span className="text-walnut">{getLocalizedField(selectedEvent.location, i18n.language)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star size={18} className="text-rhino" />
                    <span className="text-walnut">
                      {isValidCategory(selectedEvent.category) ? t(selectedEvent.category) : t('events.unknownCategory')}
                    </span>
                  </div>
                </div>

                <div className="bg-akaroa-100/70 backdrop-blur-[5px] rounded-lg p-4 shadow-glass-summary border border-akaroa-200/50">
                  <h4 className="font-medium font-logo text-rhino mb-2">{t('events.description')}</h4>
                  <p className="text-walnut leading-relaxed">{getLocalizedField(selectedEvent.description, i18n.language)}</p>
                </div>

                <div className="bg-desert/20 backdrop-blur-[5px] rounded-lg p-4 shadow-glass-summary border border-desert/30">
                  <h4 className="font-medium font-logo text-rhino mb-2">{t('events.organizer')}</h4>
                  <p className="text-walnut">
                    {selectedEvent.creator_profile?.display_name || selectedEvent.creator_profile?.username || t('common.unknown')}
                  </p>
                  {selectedEvent.contact_info && (
                    <p className="text-sm text-walnut mt-1">
                      {t('events.contact')}: {selectedEvent.contact_info}
                    </p>
                  )}
                </div>

                {selectedEvent.rsvp_count && (
                  <div className="flex items-center space-x-2 text-success-700 bg-success-50/80 backdrop-blur-[5px] rounded-lg p-3 shadow-glass-summary border border-success-200/50">
                    <Users size={18} />
                    <span className="font-medium">{selectedEvent.rsvp_count?.[0]?.count || 0} {t('events.peopleAttending')}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Edit and Delete buttons for event creator */}
                {user && selectedEvent.created_by === user.id && (
                  <div className="flex space-x-2 mb-4">
                    <button
                      onClick={() => handleEditEvent(selectedEvent)}
                      className="flex-1 bg-desert/10 text-desert py-2 px-4 rounded-lg font-medium hover:bg-desert/20 transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <Edit3 size={16} />
                      <span>{t('common.edit')}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t('events.confirmDelete'))) {
                          // TODO: Implement delete functionality
                          setMessage({ type: 'info', text: t('events.deleteComingSoon') });
                        }
                      }}
                      className="flex-1 bg-error-50 text-error-700 py-2 px-4 rounded-lg font-medium hover:bg-error-100 transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <Trash2 size={16} />
                      <span>{t('common.delete')}</span>
                    </button>
                  </div>
                )}

                {user && (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        handleRSVP(selectedEvent.id, 'attending');
                        setShowEventDetail(false);
                      }}
                      className="bg-success-50 text-success-700 py-3 px-4 rounded-lg font-medium hover:bg-success-100 transition-colors duration-200 text-sm"
                    >
                      {t('events.attend')}
                    </button>
                    <button
                      onClick={() => {
                        handleRSVP(selectedEvent.id, 'maybe');
                        setShowEventDetail(false);
                      }}
                      className="bg-warning-50 text-warning-700 py-3 px-4 rounded-lg font-medium hover:bg-warning-100 transition-colors duration-200 text-sm"
                    >
                      {t('events.maybe')}
                    </button>
                    <button
                      onClick={() => {
                        handleRSVP(selectedEvent.id, 'not_attending');
                        setShowEventDetail(false);
                      }}
                      className="bg-error-50 text-error-700 py-3 px-4 rounded-lg font-medium hover:bg-error-100 transition-colors duration-200 text-sm"
                    >
                      {t('events.notAttending')}
                    </button>
                  </div>
                )}

                {selectedEvent.website_link && (
                  <button
                    onClick={() => window.open(selectedEvent.website_link, '_blank')}
                    className="w-full bg-desert/20 backdrop-blur-[5px] text-desert py-3 px-6 rounded-lg font-medium hover:bg-desert/30 transition-all duration-200 flex items-center justify-center space-x-2 shadow-glass-button hover:shadow-glass-button-hover border border-desert/30 hover:border-desert/40"
                  >
                    <ExternalLink size={18} />
                    <span>{t('events.visitWebsite')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}