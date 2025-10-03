import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { ArrowLeft, Compass, Plus, X, MapPin, Save, Loader, AlertCircle, CheckCircle, Navigation, Users, Home } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase, Place, NewPlace, profileHelpers, isSupabaseConfigured, getLocalizedField, createLocalizedField } from '../lib/supabaseClient';
import { APP_CATEGORIES, isValidCategory } from '../constants/categories';
import { formatLocalizedDate } from '../utils/dateFormatting';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker for special places
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      <div style="color: white; font-size: 12px;">📍</div>
    </div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

interface MapSearchPageProps {
  onNavigate: (page: 'home' | 'map_search' | 'legal' | 'discover_users') => void;
}

// Component to handle map clicks for adding places
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to handle map view changes without re-rendering
function ChangeView({ center, radius }: { center: [number, number]; radius: number }) {
  const map = useMap();
  
  // Calculate appropriate zoom level based on radius
  const getZoomLevel = (radiusKm: number): number => {
    if (radiusKm <= 10) return 12;      // Very close zoom for small radius
    if (radiusKm <= 25) return 11;      // Close zoom for small-medium radius
    if (radiusKm <= 50) return 10;      // Medium zoom for medium radius
    if (radiusKm <= 100) return 9;      // Medium-wide zoom
    if (radiusKm <= 200) return 8;      // Wide zoom
    if (radiusKm <= 500) return 7;      // Very wide zoom for very large radius
    return 6;                           // Maximum wide zoom for very large radius
  };
  
  useEffect(() => {
    const newZoomLevel = getZoomLevel(radius);
    map.setView(center, newZoomLevel);
  }, [center, radius, map]);
  
  return null;
}

export default function MapSearchPage({ onNavigate }: MapSearchPageProps) {
  const { t, i18n } = useTranslation();
  const [radius, setRadius] = useState(333);
  const [selectedInterest, setSelectedInterest] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [showAddPlaceForm, setShowAddPlaceForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [tempMarkerPosition, setTempMarkerPosition] = useState<[number, number] | null>(null);
  const [totalPublicProfilesCount, setTotalPublicProfilesCount] = useState<number | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.4449, 8.3485]); // Default to Warstein, Germany
  const [newPlace, setNewPlace] = useState<NewPlace>({
    name: { de: '', en: '', fr: '' },
    description: { de: '', en: '', fr: '' },
    latitude: 51.4449,
    longitude: 8.3485,
    interest: ''
  });

  // Helper function to calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Get user's current location
  useEffect(() => {
    const getCurrentLocation = () => {
      console.log('🗺️ MapSearchPage: Starting geolocation process...');
      
      if (!navigator.geolocation) {
        console.error('❌ Geolocation not supported by this browser');
        setMessage({
          type: 'info',
          text: t('map.geolocationNotSupported')
        });
        setIsLoadingLocation(false);
        return;
      }

      console.log('📍 Geolocation API available, requesting position...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          console.log('✅ Geolocation success!');
          console.log('📍 Raw position data:', {
            latitude,
            longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp).toISOString()
          });
          
          const userPos: [number, number] = [latitude, longitude];
          
          console.log('🎯 Setting user location to:', userPos);
          console.log('🗺️ Setting map center to:', userPos);
          
          setUserLocation(userPos);
          setMapCenter(userPos);
          
          // Update new place coordinates to user's location
          setNewPlace(prev => ({
            ...prev,
            latitude,
            longitude
          }));
          
          console.log('💾 Updated newPlace coordinates:', { latitude, longitude });
          
          setMessage({
            type: 'success',
            text: t('map.locationFound')
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.warn('❌ Geolocation error occurred:');
          console.warn('Error code:', error.code);
          console.warn('Error message:', error.message);
          console.warn('Full error object:', error);
          
          let errorMessage = t('map.locationError');
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += ' ' + t('map.locationDenied');
              console.log('🚫 User denied geolocation permission');
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += ' ' + t('map.locationUnavailable');
              console.log('📍 Position unavailable (GPS/network issue)');
              break;
            case error.TIMEOUT:
              errorMessage += ' ' + t('map.locationTimeout');
              console.log('⏰ Geolocation request timed out');
              break;
            default:
              errorMessage += ' ' + t('errors.unexpectedError');
              console.log('❓ Unknown geolocation error');
              break;
          }
          
          console.log('🗺️ Falling back to default location (Paris)');
          
          setMessage({
            type: 'info',
            text: errorMessage + ' ' + t('map.showingDefault')
          });
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 600000 // 10 minutes
        }
      );
      
      console.log('⚙️ Geolocation options:', {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 600000
      });
    };

    getCurrentLocation();
  }, [t]);

  // Debug map center changes
  useEffect(() => {
    console.log('🗺️ Map center changed to:', mapCenter);
  }, [mapCenter]);
  
  // Debug user location changes
  useEffect(() => {
    console.log('👤 User location changed to:', userLocation);
  }, [userLocation]);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fetch places from Supabase
  const fetchPlacesAndProfiles = async () => {
    if (!isSupabaseConfigured) {
      setMessage({
        type: 'info',
        text: t('errors.supabaseNotConfigured')
      });
      return;
    }

    setIsLoading(true);
    setIsLoadingProfiles(true);
    
    try {
      // Fetch places
      let query = supabase.from('places').select('*');
      
      if (selectedInterest) {
        query = query.eq('interest', selectedInterest);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching places:', error);
        setMessage({
          type: 'error',
          text: `${t('errors.unexpectedError')}: ${error.message}`
        });
        setPlaces([]);
      } else {
        let filteredPlaces = data || [];
        
        // Filter places by radius if user location is available
        if (userLocation && filteredPlaces.length > 0) {
          filteredPlaces = filteredPlaces.filter(place => {
            const distance = calculateDistance(
              userLocation[0], 
              userLocation[1], 
              place.latitude, 
              place.longitude
            );
            return distance <= radius;
          });
          
          if (filteredPlaces.length !== (data || []).length) {
            setMessage({
              type: 'info',
              text: t('map.placesInRadius', { count: filteredPlaces.length, total: (data || []).length, radius })
            });
          } else if (filteredPlaces.length > 0) {
            setMessage({
              type: 'success',
              text: t('map.placesInRadiusSuccess', { count: filteredPlaces.length, radius })
            });
          }
        } else if (filteredPlaces.length > 0) {
          setMessage({
            type: 'success',
            text: t('map.placesLoaded', { count: filteredPlaces.length })
          });
        } else {
          setMessage({
            type: 'info',
            text: t('map.noPlaces')
          });
        }
        
        setPlaces(filteredPlaces);
      }
      
      // Fetch public profiles count
      try {
        const { data: profilesData, error: profilesError } = await profileHelpers.getPublicProfiles(1000); // Get up to 1000 profiles for count
        
        if (profilesError) {
          console.error('Error loading public profiles:', profilesError);
          setTotalPublicProfilesCount(null);
        } else {
          const profileCount = profilesData?.length || 0;
          setTotalPublicProfilesCount(profileCount);
          console.log(`📊 Found ${profileCount} public profiles`);
        }
      } catch (profileError) {
        console.error('Error fetching public profiles:', profileError);
        setTotalPublicProfilesCount(null);
      }
      
    } catch (error) {
      console.error('Error fetching places:', error);
      setMessage({
        type: 'error',
        text: t('errors.unexpectedError')
      });
      setPlaces([]);
    } finally {
      setIsLoading(false);
      setIsLoadingProfiles(false);
    }
  };

  // Add new place to Supabase
  const handleAddPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const currentName = getLocalizedField(newPlace.name, i18n.language);
    const currentDescription = getLocalizedField(newPlace.description, i18n.language);
    
    if (!currentName.trim()) {
      setMessage({ type: 'error', text: t('map.validation.nameRequired') });
      return;
    }
    
    if (!currentDescription.trim()) {
      setMessage({ type: 'error', text: t('map.validation.descriptionRequired') });
      return;
    }
    
    if (!newPlace.interest) {
      setMessage({ type: 'error', text: t('map.validation.interestRequired') });
      return;
    }

    if (!isSupabaseConfigured) {
      setMessage({
        type: 'error',
        text: t('errors.supabaseNotConfigured')
      });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      console.log('Adding place:', newPlace);
      
      const { data, error } = await supabase
        .from('places')
        .insert([newPlace])
        .select();

      if (error) {
        console.error('Error adding place:', error);
        setMessage({
          type: 'error',
          text: `${t('map.errorAddingPlace')}: ${error.message || t('errors.unknownDatabaseError')}`
        });
      } else {
        console.log('Place added successfully:', data);
        
        // Reset form and close it
        setNewPlace({
          name: { de: '', en: '', fr: '' },
          description: { de: '', en: '', fr: '' },
          latitude: userLocation ? userLocation[0] : mapCenter[0],
          longitude: userLocation ? userLocation[1] : mapCenter[1],
          interest: ''
        });
        setShowAddPlaceForm(false);
        
        setMessage({
          type: 'success',
          text: t('map.placeAdded')
        });
        
        // Refresh places list
        fetchPlacesAndProfiles();
      }
    } catch (error) {
      console.error('Error adding place:', error);
      
      // More detailed error handling
      let errorMessage = t('map.unexpectedErrorAdding');
      
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage += `: ${error}`;
      }
      
      // Check for specific error types
      if (error && typeof error === 'object' && 'code' in error) {
        switch (error.code) {
          case '23505':
            errorMessage = t('map.placeAlreadyExists');
            break;
          case '42501':
            errorMessage = t('map.noPermissionToAdd');
            break;
          case 'PGRST301':
            errorMessage = t('map.databaseConnectionFailed');
            break;
        }
      }
      
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle map click to set coordinates
  const handleMapClick = (lat: number, lng: number) => {
    if (showAddPlaceForm) {
      setTempMarkerPosition([lat, lng]);
      setNewPlace(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng
      }));
      setMessage({
        type: 'info',
        text: t('map.positionSet')
      });
    }
  };

  // Handle opening the add place form
  const handleOpenAddPlaceForm = () => {
    // Set initial position to map center
    setTempMarkerPosition(mapCenter);
    setNewPlace(prev => ({
      ...prev,
      latitude: mapCenter[0],
      longitude: mapCenter[1]
    }));
    setShowAddPlaceForm(true);
    
    // Scroll to form after a brief delay
    setTimeout(() => {
      const formElement = document.querySelector('[data-place-form]');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handle closing the add place form
  const handleCloseAddPlaceForm = () => {
    setShowAddPlaceForm(false);
    setTempMarkerPosition(null);
    setNewPlace({
      name: { de: '', en: '', fr: '' },
      description: { de: '', en: '', fr: '' },
      latitude: mapCenter[0],
      longitude: mapCenter[1],
      interest: ''
    });
  };

  // Load places and profiles on component mount
  useEffect(() => {
    fetchPlacesAndProfiles();
  }, [selectedInterest, radius, userLocation]);

  if (isLoadingLocation) {
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
          <p className="text-rhino font-medium">{t('map.detectingLocation')}</p>
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
        <div className="absolute inset-0 bg-gradient-to-b from-akaroa-100/60 via-akaroa-200/60 to-akaroa-300/70"></div>
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
                title={t('common.backToHome')}
              >
                <Home size={20} className="text-cream" />
              </button>
              <div className="flex items-center space-x-3">
                <MapPin size={24} className="text-cream" />
                <h1 className="text-2xl font-medium font-logo text-cream tracking-wide">{t('map.title')}</h1>
              </div>
            </div>
            
            <button
              onClick={() => {
                handleOpenAddPlaceForm();
              }}
              className={`p-2 rounded-lg transition-all duration-200 backdrop-blur-[5px] shadow-glass-button-sm hover:shadow-glass-button ${
                showAddPlaceForm 
                  ? 'bg-white/15 text-white hover:bg-white/25'
                  : 'bg-white/15 text-white hover:bg-white/25'
              } active:scale-95`}
             title="Besonderen Ort hinzufügen"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md lg:max-w-5xl mx-auto px-3 py-6 pb-24 md:px-6 space-y-6 relative z-10">
        {/* Desktop Navigation Button */}
        <div className="lg:flex hidden">
          <button
            onClick={() => onNavigate('home')}
            className="bg-akaroa-100/70 backdrop-blur-[8px] text-rhino hover:bg-akaroa-200/80 rounded-lg transition-all duration-200 p-2 flex items-center space-x-2 shadow-glass-button hover:shadow-glass-button-hover border border-sandstone-300/50 hover:border-sandstone-300/60 transform hover:scale-[1.02]"
            title={t('common.backToHome')}
          >
            <Home size={20} />
            <span className="text-sm font-medium">{t('common.home')}</span>
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
          <div className="space-y-3">
            <p className="text-sm text-desert text-center leading-relaxed">
              {t('map.mapDescription')}
            </p>
            
            <div className="bg-akaroa/60 rounded-lg p-4 border border-sandstone-300/40 shadow-md">
              <h4 className="text-base font-semibold font-logo text-rhino mb-3">🗺️ {t('map.whatYouCanDo')}:</h4>
              <ul className="text-sm text-walnut space-y-2">
                <li>• <strong>{t('map.guide.discover')}:</strong> {t('map.guide.discoverDesc')}</li>
                <li>• <strong>{t('map.guide.adjustRadius')}:</strong> {t('map.guide.adjustRadiusDesc')}</li>
                <li>• <strong>{t('map.guide.filterInterests')}:</strong> {t('map.guide.filterInterestsDesc')}</li>
                <li>• <strong>{t('map.guide.shareOwnPlaces')}:</strong> {t('map.guide.shareOwnPlacesDesc')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Search Controls */}
        <div className="bg-cream/70 backdrop-blur-[15px] rounded-xl p-4 shadow-glass-card border border-sandstone-300/50 space-y-4">
          {/* Radius Control */}
          <div>
            <label className="block text-sm font-medium text-walnut mb-2">
              {t('map.radius')}: {radius} km
            </label>
            <input
              type="range"
              min="5"
              max="1000"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-akaroa-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-walnut mt-1">
              <span>5 km</span>
              <span>1000 km</span>
            </div>
          </div>

          {/* Interest Filter */}
          <div>
            <label className="block text-sm font-medium text-walnut mb-2">
              {t('map.interestArea')}
            </label>
            <select
              value={selectedInterest}
              onChange={(e) => setSelectedInterest(e.target.value)}
              className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
            >
              <option value="">{t('map.allAreas')}</option>
              {APP_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {t(category)}
                </option>
              ))}
            </select>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-walnut">
              {places.length} {t('map.placesFound')}
            </span>
            {!isLoadingProfiles && totalPublicProfilesCount !== null && (
              <span className="text-desert">
                {totalPublicProfilesCount === 0 
                  ? t('map.noPublicProfiles')
                  : totalPublicProfilesCount === 1 
                    ? t('map.oneLikeMinded')
                    : t('map.likeMindedCount', { count: totalPublicProfilesCount })
                }
              </span>
            )}
            {isLoadingProfiles && (
              <span className="text-walnut text-xs flex items-center space-x-1">
                <Loader size={12} className="animate-spin" />
                <span>{t('map.loadingCommunity')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-cream/70 backdrop-blur-[15px] rounded-xl overflow-hidden shadow-glass-card border border-sandstone-300/50">
          <div className="h-80 lg:h-96 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-cream/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Loader size={24} className="animate-spin text-rhino mx-auto" />
                  <p className="text-sm text-rhino">{t('common.loading')}</p>
                </div>
              </div>
            )}
            
            <MapContainer
              center={mapCenter}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
              className="rounded-xl"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <ChangeView center={mapCenter} radius={radius} />
              <MapClickHandler onMapClick={handleMapClick} />
              
              {/* User Location Marker */}
              {userLocation && (
                <Marker position={userLocation} icon={createCustomIcon('#E07A5F')}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-medium text-rhino">{t('map.yourLocation')}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {showAddPlaceForm && tempMarkerPosition && (
                <Marker
                  position={tempMarkerPosition}
                  icon={createCustomIcon('#007bff')}
                >
                  <Popup>
                    <div className="text-center">
                      <p className="font-medium text-rhino">{t('map.newPlacePosition')}</p>
                      <p className="text-sm text-walnut">{t('map.clickToAdjust')}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Place Markers */}
              {places.map((place) => (
                <Marker
                  key={place.id}
                  position={[place.latitude, place.longitude]}
                  icon={createCustomIcon('#6F481C')}
                >
                  <Popup>
                    <div className="space-y-2 min-w-[200px]">
                      <h3 className="font-semibold text-rhino">
                        {getLocalizedField(place.name, i18n.language)}
                      </h3>
                      <p className="text-sm text-walnut">
                        {getLocalizedField(place.description, i18n.language)}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-desert">
                        <span className="bg-desert/20 px-2 py-1 rounded">
                          {isValidCategory(place.interest) ? t(place.interest) : place.interest}
                        </span>
                      </div>
                      <p className="text-xs text-walnut">
                        {t('map.addedOn')} {formatLocalizedDate(place.created_at)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Add Place Form */}
        {showAddPlaceForm && (
          <div data-place-form className="bg-cream/70 backdrop-blur-[15px] rounded-xl p-6 shadow-glass-card border border-sandstone-300/50">
            <div className="flex items-center space-x-3 mb-6">
              <Plus size={20} className="text-rhino" />
              <h3 className="font-medium font-logo text-rhino">{t('map.addPlace')}</h3>
              <div className="flex-1"></div>
              <button
                onClick={handleCloseAddPlaceForm}
                className="p-1 hover:bg-akaroa-100/70 backdrop-blur-[5px] rounded-lg transition-all duration-200 shadow-glass-button-sm"
              >
                <X size={18} className="text-walnut" />
              </button>
            </div>
            
            <div className="mb-4 bg-desert/20 backdrop-blur-[5px] rounded-lg p-3 shadow-glass-summary border border-desert/30">
              <p className="text-sm text-desert text-center">
                {t('map.addPlaceInstructions')}
              </p>
            </div>
            
            <form onSubmit={handleAddPlace} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-walnut mb-2">
                  {t('map.placeName')} *
                </label>
                <input
                  type="text"
                  value={getLocalizedField(newPlace.name, i18n.language)}
                  onChange={(e) => setNewPlace(prev => ({ 
                    ...prev, 
                    name: { ...prev.name, [i18n.language]: e.target.value }
                  }))}
                  className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
                  placeholder={t('map.placeNamePlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-walnut mb-2">
                  {t('map.placeDescription')} *
                </label>
                <textarea
                  value={getLocalizedField(newPlace.description, i18n.language)}
                  onChange={(e) => setNewPlace(prev => ({ 
                    ...prev, 
                    description: { ...prev.description, [i18n.language]: e.target.value }
                  }))}
                  className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200 resize-none"
                  rows={3}
                  placeholder={t('map.placeDescriptionPlaceholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-walnut mb-2">
                  {t('map.interestArea')} *
                </label>
                <select
                  value={newPlace.interest}
                  onChange={(e) => setNewPlace(prev => ({ ...prev, interest: e.target.value }))}
                  className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">{t('map.selectArea')}</option>
                  {APP_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {t(category)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-akaroa-100/70 backdrop-blur-[5px] rounded-lg p-3 shadow-glass-summary border border-akaroa-200/50">
                <p className="text-sm text-walnut">
                  <strong>{t('map.currentPosition')}:</strong> {newPlace.latitude.toFixed(4)}, {newPlace.longitude.toFixed(4)}
                </p>
                <p className="text-xs text-walnut mt-1">
                  {t('map.clickToSetPosition')}
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseAddPlaceForm}
                  className="flex-1 bg-walnut/10 text-walnut py-3 px-6 rounded-lg font-medium hover:bg-walnut/20 transition-colors duration-200"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-rhino/70 backdrop-blur-[8px] text-cream py-3 px-6 rounded-lg font-medium shadow-glass-button hover:shadow-glass-button-hover transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 border border-rhino-700/50 hover:border-rhino-700/60 transform hover:scale-[1.02] disabled:transform-none"
                >
                  {isSaving ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      <span>{t('common.saving')}</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>{t('common.add')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Location Access Prompt */}
        {!userLocation && !isLoadingLocation && (
          <div className="bg-desert/20 backdrop-blur-[10px] rounded-lg p-4 shadow-glass-card border border-desert/30 text-center">
            <div className="space-y-3">
              <Navigation size={32} className="text-desert mx-auto" />
              <div>
                <h3 className="font-medium font-logo text-rhino mb-2">{t('map.allowLocationForBetter')}</h3>
                <p className="text-sm text-walnut leading-relaxed">
                  {t('map.allowLocationDescription')}
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-desert/70 backdrop-blur-[8px] text-white py-3 px-6 rounded-xl font-semibold shadow-glass-button hover:shadow-glass-button-hover transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2 mx-auto border border-desert-600/50 hover:border-desert-600/60"
              >
                <Navigation size={18} />
                <span>{t('map.allowLocationForReal')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Places List */}
        {places.length > 0 && (
          <div className="bg-cream/70 backdrop-blur-[15px] rounded-xl p-6 shadow-glass-card border border-sandstone-300/50">
            <h3 className="font-medium font-logo text-rhino mb-4">{t('map.nearbyPlaces')}</h3>
            <div className="space-y-3">
              {places.slice(0, 5).map((place) => (
                <div key={place.id} className="bg-akaroa-100/70 backdrop-blur-[5px] rounded-lg p-4 shadow-glass-summary border border-akaroa-200/50">
                  <h4 className="font-medium text-rhino mb-1">
                    {getLocalizedField(place.name, i18n.language)}
                  </h4>
                  <p className="text-sm text-walnut mb-2">
                    {getLocalizedField(place.description, i18n.language)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-desert/20 text-desert px-2 py-1 rounded">
                      {isValidCategory(place.interest) ? t(place.interest) : place.interest}
                    </span>
                    {userLocation && (
                      <span className="text-xs text-walnut">
                        {calculateDistance(
                          userLocation[0], 
                          userLocation[1], 
                          place.latitude, 
                          place.longitude
                        ).toFixed(1)} km
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {places.length > 5 && (
                <p className="text-sm text-walnut text-center">
                  {t('map.andMorePlaces', { count: places.length - 5 })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Community Info */}
        {!isLoadingProfiles && totalPublicProfilesCount !== null && totalPublicProfilesCount > 0 && (
          <div className="bg-success-50/80 backdrop-blur-[10px] rounded-lg p-4 shadow-glass-card border border-success-200/50 text-center">
            <Users size={24} className="text-success-600 mx-auto mb-2" />
            <p className="text-sm text-success-700 font-medium">
              {t('map.youAreNotAlone')}
            </p>
            <p className="text-xs text-success-600 mt-1">
              {totalPublicProfilesCount === 1 
                ? t('map.oneLikeMinded')
                : t('map.likeMindedCount', { count: totalPublicProfilesCount })
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}