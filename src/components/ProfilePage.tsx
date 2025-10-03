import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, User, CreditCard as Edit, Save, X, Loader, CheckCircle, 
  AlertCircle, Mail, MapPin, Heart, Calendar, Users, MessageCircle, 
  Send, Plus, Eye, Trash2, Home, LogOut 
} from 'lucide-react';
import { 
  profileHelpers, authHelpers, eventHelpers, connectionRequestHelpers, 
  rsvpHelpers, Profile, Event, isSupabaseConfigured, getLocalizedField, 
  createLocalizedField 
} from '../lib/supabaseClient';
import { APP_CATEGORIES, isValidCategory } from '../constants/categories';
import { formatLocalizedDate, formatLocalizedTime } from '../utils/dateFormatting';
import ConnectRequestModal from './ConnectRequestModal';
import ChatWindow from './ChatWindow';

// Types
interface ProfileFormData {
  display_name: string;
  bio: { de: string; en: string; fr: string };
  contribution: { de: string; en: string; fr: string };
  interests: string[];
  location_city: string;
  location_country: string;
  privacy_level: 'public' | 'friends' | 'private';
  email_notifications: boolean;
}

interface ProfilePageProps {
  onNavigate: (page: 'home' | 'map_search' | 'discover_users' | 'events' | 'legal' | 'auth' | 'profile') => void;
  onSignOut: () => void;
  viewingProfileId?: string | null;
  onViewProfile: (profileId: string | null) => void;
  connectedUserIds: string[];
}

interface MessageState {
  type: 'success' | 'error' | 'info';
  text: string;
}

// Connection Item Component
function ConnectionItem({ 
  connection, 
  otherUserId, 
  currentUserId, 
  onStartChat 
}: {
  connection: any;
  otherUserId: string;
  currentUserId: string;
  onStartChat: (userId: string, userName: string) => void;
}) {
  const { t } = useTranslation();
  const [otherUserName, setOtherUserName] = useState<string>('Lade...');
  
  useEffect(() => {
    const loadOtherUserName = async () => {
      try {
        const { data: otherProfile } = await profileHelpers.getProfile(otherUserId);
        setOtherUserName(otherProfile?.display_name || otherProfile?.username || 'Unbekannter Nutzer');
      } catch (error) {
        console.error('Error loading other user profile:', error);
        setOtherUserName('Unbekannter Nutzer');
      }
    };
    
    loadOtherUserName();
  }, [otherUserId]);
  
  return (
    <div className="bg-akaroa-100/70 rounded-lg p-4 border border-akaroa-200/50 flex items-center justify-between">
      <div className="flex-1">
        <p className="font-medium text-rhino">{otherUserName}</p>
        <p className="text-sm text-walnut">{connection.proposal_type}</p>
      </div>
      <button
        onClick={() => onStartChat(otherUserId, otherUserName)}
        className="bg-desert/10 text-desert py-2 px-3 rounded-lg hover:bg-desert/20 transition-colors duration-200 flex items-center space-x-1"
        title="Chat starten"
      >
        <MessageCircle size={16} />
        <span className="text-sm">Chat</span>
      </button>
    </div>
  );
}

// Loading Component
function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center relative">
      <div className="fixed inset-0 z-0">
        <img 
          src="/topglobe copy.jpg" 
          alt="Werte•Kreis Background" 
          className="w-full h-full object-cover object-center"
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
        <p className="text-rhino font-medium">{message}</p>
      </div>
    </div>
  );
}

// Error Screen Component
function ErrorScreen({ message, onNavigateHome }: { message: string; onNavigateHome: () => void }) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center relative">
      <div className="fixed inset-0 z-0">
        <img 
          src="/topglobe copy.jpg" 
          alt="Werte•Kreis Background" 
          className="w-full h-full object-cover object-center"
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
        <AlertCircle size={48} className="text-error-600 mx-auto" />
        <h3 className="font-medium text-rhino">{message}</h3>
        <button
          onClick={onNavigateHome}
          className="bg-rhino text-white py-2 px-4 rounded-lg font-medium hover:bg-rhino-700 transition-colors duration-200"
        >
          Zurück zur Startseite
        </button>
      </div>
    </div>
  );
}

// Background Component
function BackgroundImage() {
  return (
    <div className="fixed inset-0 z-0">
      <img 
        src="/topglobe copy.jpg" 
        alt="Werte•Kreis Background" 
        className="w-full h-full object-cover object-center"
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
  );
}

// Header Component
function ProfileHeader({ 
  isOwnProfile, 
  viewingProfileId, 
  isEditing, 
  onNavigateHome, 
  onViewProfile, 
  onToggleEdit 
}: {
  isOwnProfile: boolean;
  viewingProfileId?: string | null;
  isEditing: boolean;
  onNavigateHome: () => void;
  onViewProfile: (profileId: string | null) => void;
  onToggleEdit: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-rhino-900/70 to-rhino-800/70 backdrop-blur-[15px] shadow-glass-nav border-b border-rhino-700/50 relative z-10">
      <div className="max-w-md mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {viewingProfileId && (
              <button
                onClick={() => onViewProfile(null)}
                className="p-2 hover:bg-rhino-700/80 backdrop-blur-[5px] rounded-lg transition-all duration-200 active:scale-95 shadow-glass-button-sm"
                title="Zurück zu meinem Profil"
              >
                <ArrowLeft size={20} className="text-cream" />
              </button>
            )}
            <button
              onClick={onNavigateHome}
              className="p-2 hover:bg-rhino-700/80 backdrop-blur-[5px] rounded-lg transition-all duration-200 active:scale-95 lg:flex hidden shadow-glass-button-sm"
              title={t('common.backToHome')}
            >
              <Home size={20} className="text-cream" />
            </button>
            <div className="flex items-center space-x-3">
              <User size={24} className="text-cream" />
              <h1 className="text-2xl font-medium font-logo text-cream tracking-wide">
                {isOwnProfile ? t('profile.myProfile') : t('profile.userProfile')}
              </h1>
            </div>
          </div>
          
          {isOwnProfile && (
            <button
              onClick={onToggleEdit}
              className="p-2 rounded-lg transition-all duration-200 backdrop-blur-[5px] shadow-glass-button-sm hover:shadow-glass-button bg-white/15 text-white hover:bg-white/25 active:scale-95"
            >
              {isEditing ? <X size={24} /> : <Edit size={24} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Message Display Component
function MessageDisplay({ message }: { message: MessageState | null }) {
  if (!message) return null;

  return (
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
  );
}

// Supabase Status Component
function SupabaseStatus() {
  const { t } = useTranslation();

  if (isSupabaseConfigured) return null;

  return (
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
  );
}

// Profile Edit Form Component
function ProfileEditForm({ 
  editForm, 
  setEditForm, 
  onSave, 
  onCancel, 
  isSaving 
}: {
  editForm: ProfileFormData;
  setEditForm: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const { t, i18n } = useTranslation();

  return (
    <div className="bg-cream/70 backdrop-blur-[15px] rounded-xl p-6 shadow-glass-card border border-sandstone-300/50">
      <div className="flex items-center space-x-3 mb-6">
        <Edit size={20} className="text-rhino" />
        <h3 className="font-medium font-logo text-rhino">{t('profile.editProfile')}</h3>
      </div>

      <form onSubmit={onSave} className="space-y-6">
        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-walnut mb-2">
            {t('profile.displayName')} *
          </label>
          <input
            type="text"
            value={editForm.display_name}
            onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
            className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
            placeholder={t('profile.displayNamePlaceholder')}
            required
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-walnut mb-2">
            {t('profile.bio')}
          </label>
          <textarea
            value={getLocalizedField(editForm.bio, i18n.language)}
            onChange={(e) => setEditForm(prev => ({ 
              ...prev, 
              bio: { ...prev.bio, [i18n.language]: e.target.value }
            }))}
            className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200 resize-none"
            rows={4}
            placeholder={t('profile.bioPlaceholder')}
          />
        </div>

        {/* Contribution */}
        <div>
          <label className="block text-sm font-medium text-walnut mb-2">
            {t('profile.contribution')}
          </label>
          <div className="bg-desert/10 rounded-lg p-3 mb-3 border border-desert/20">
            <p className="text-sm text-desert">
              {t('profile.contributionHelper')}
            </p>
          </div>
          <textarea
            value={getLocalizedField(editForm.contribution, i18n.language)}
            onChange={(e) => setEditForm(prev => ({ 
              ...prev, 
              contribution: { ...prev.contribution, [i18n.language]: e.target.value }
            }))}
            className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200 resize-none"
            rows={3}
            placeholder={t('profile.contributionPlaceholder')}
          />
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-walnut mb-2">
              {t('profile.city')}
            </label>
            <input
              type="text"
              value={editForm.location_city}
              onChange={(e) => setEditForm(prev => ({ ...prev, location_city: e.target.value }))}
              className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
              placeholder={t('profile.cityPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-walnut mb-2">
              {t('profile.country')}
            </label>
            <input
              type="text"
              value={editForm.location_country}
              onChange={(e) => setEditForm(prev => ({ ...prev, location_country: e.target.value }))}
              className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
              placeholder={t('profile.countryPlaceholder')}
            />
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-walnut mb-2">
            {t('profile.interests')}
          </label>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            {APP_CATEGORIES.map((category) => (
              <label key={category} className="flex items-center space-x-3 p-3 bg-akaroa-100/70 rounded-lg border border-akaroa-200/50 hover:bg-akaroa-100/80 transition-colors duration-200">
                <input
                  type="checkbox"
                  checked={editForm.interests.includes(category)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setEditForm(prev => ({ ...prev, interests: [...prev.interests, category] }));
                    } else {
                      setEditForm(prev => ({ ...prev, interests: prev.interests.filter(i => i !== category) }));
                    }
                  }}
                  className="w-4 h-4 text-rhino border-sandstone-300 rounded focus:ring-rhino"
                />
                <span className="text-sm text-walnut">{t(category)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div>
          <label className="block text-sm font-medium text-walnut mb-2">
            {t('profile.privacyLevel')}
          </label>
          <select
            value={editForm.privacy_level}
            onChange={(e) => setEditForm(prev => ({ ...prev, privacy_level: e.target.value as any }))}
            className="w-full px-4 py-3 bg-cream/80 backdrop-blur-[5px] border border-sandstone-300/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-rhino focus:border-transparent transition-all duration-200"
          >
            <option value="public">{t('profile.privacy.public')}</option>
            <option value="friends">{t('profile.privacy.friends')}</option>
            <option value="private">{t('profile.privacy.private')}</option>
          </select>
          <p className="text-xs text-walnut mt-1">
            {editForm.privacy_level === 'public' && t('profile.privacyHelp.public')}
            {editForm.privacy_level === 'friends' && t('profile.privacyHelp.friends')}
            {editForm.privacy_level === 'private' && t('profile.privacyHelp.private')}
          </p>
        </div>

        {/* Email Notifications */}
        <div className="flex items-center space-x-3 p-3 bg-akaroa-100/70 rounded-lg border border-akaroa-200/50">
          <input
            type="checkbox"
            id="email_notifications"
            checked={editForm.email_notifications}
            onChange={(e) => setEditForm(prev => ({ ...prev, email_notifications: e.target.checked }))}
            className="w-4 h-4 text-rhino border-sandstone-300 rounded focus:ring-rhino"
          />
          <label htmlFor="email_notifications" className="text-sm text-walnut">
            {t('profile.emailNotifications')}
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
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
                <span>{t('common.save')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Profile Display Component
function ProfileDisplay({ 
  profile, 
  user, 
  isOwnProfile, 
  isConnected, 
  onShowConnectModal, 
  onShowChatWindow 
}: {
  profile: Profile;
  user: any;
  isOwnProfile: boolean;
  isConnected: boolean;
  onShowConnectModal: () => void;
  onShowChatWindow: () => void;
}) {
  const { t, i18n } = useTranslation();

  return (
    <div className="bg-cream/70 backdrop-blur-[15px] rounded-xl p-6 shadow-glass-card border border-sandstone-300/50">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-desert to-desert-700 rounded-full flex items-center justify-center shadow-lg mx-auto">
          <User size={32} className="text-white" />
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold font-logo text-rhino">
            {profile.display_name || profile.username || t('common.unknown')}
          </h2>
          {profile.location_city && (
            <p className="text-walnut mt-1 flex items-center justify-center space-x-1">
              <MapPin size={16} />
              <span>{[profile.location_city, profile.location_country].filter(Boolean).join(', ')}</span>
            </p>
          )}
        </div>

        {/* Action Buttons for other users */}
        {!isOwnProfile && user && (
          <div className="flex space-x-3 justify-center">
            {isConnected ? (
              <button
                onClick={onShowChatWindow}
                className="bg-success-50 text-success-700 py-2 px-4 rounded-lg font-medium hover:bg-success-100 transition-colors duration-200 flex items-center space-x-2"
              >
                <MessageCircle size={16} />
                <span>{t('discover.startChat')}</span>
              </button>
            ) : (
              <button
                onClick={onShowConnectModal}
                className="bg-desert/70 backdrop-blur-[8px] text-white py-2 px-4 rounded-lg font-medium shadow-glass-button hover:shadow-glass-button-hover transition-all duration-200 flex items-center space-x-2 border border-desert-600/50"
              >
                <Heart size={16} />
                <span>{t('discover.sendRequest')}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Profile Sections Component
function ProfileSections({ profile }: { profile: Profile }) {
  const { t, i18n } = useTranslation();

  return (
    <>
      {/* Bio Section */}
      {profile.bio && getLocalizedField(profile.bio, i18n.language).trim() && (
        <div className="bg-akaroa-100/70 backdrop-blur-[10px] rounded-lg p-4 border border-sandstone-300/50 shadow-glass-card">
          <h4 className="font-medium font-logo text-rhino mb-2">{t('profile.aboutMe')}</h4>
          <p className="text-walnut leading-relaxed">
            {getLocalizedField(profile.bio, i18n.language)}
          </p>
        </div>
      )}

      {/* Contribution Section */}
      {profile.contribution && getLocalizedField(profile.contribution, i18n.language).trim() && (
        <div className="bg-akaroa-100/70 backdrop-blur-[10px] rounded-lg p-4 border border-sandstone-300/50 shadow-glass-card">
          <h4 className="font-medium font-logo text-rhino mb-2">{t('profile.myContribution')}</h4>
          <p className="text-walnut leading-relaxed">
            {getLocalizedField(profile.contribution, i18n.language)}
          </p>
        </div>
      )}

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <div className="bg-cream/70 backdrop-blur-[15px] rounded-xl p-6 shadow-glass-card border border-sandstone-300/50">
          <h4 className="font-medium font-logo text-rhino mb-3">{t('profile.interests')}</h4>
          <div className="flex flex-wrap gap-2">
            {profile.interests.filter(isValidCategory).map((interest) => (
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
    </>
  );
}

// Connection Requests Component
function ConnectionRequests({ 
  incomingRequests, 
  onAcceptRequest, 
  onRejectRequest 
}: {
  incomingRequests: any[];
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
}) {
  const { t } = useTranslation();

  if (incomingRequests.length === 0) return null;

  return (
    <div className="bg-cream/70 backdrop-blur-[15px] rounded-xl p-6 shadow-glass-card border border-sandstone-300/50">
      <h4 className="font-medium font-logo text-rhino mb-4 flex items-center space-x-2">
        <Heart size={18} />
        <span>{t('profile.connectionRequests')}</span>
      </h4>
      <div className="space-y-3">
        {incomingRequests.map((request) => (
          <div key={request.id} className="bg-akaroa-100/70 rounded-lg p-4 border border-akaroa-200/50">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-rhino">
                {request.sender_profile?.display_name || request.sender_profile?.username || t('common.unknown')}
              </h5>
              <span className="text-xs bg-desert/20 text-desert px-2 py-1 rounded">
                {request.proposal_type}
              </span>
            </div>
            {request.message && (
              <p className="text-sm text-walnut mb-3 italic">"{request.message}"</p>
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => onAcceptRequest(request.id)}
                className="flex-1 bg-success-50 text-success-700 py-2 px-3 rounded-lg font-medium hover:bg-success-100 transition-colors duration-200 text-sm"
              >
                {t('profile.accept')}
              </button>
              <button
                onClick={() => onRejectRequest(request.id)}
                className="flex-1 bg-error-50 text-error-700 py-2 px-3 rounded-lg font-medium hover:bg-error-100 transition-colors duration-200 text-sm"
              >
                {t('profile.reject')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Connections List Component
function ConnectionsList({ 
  connections, 
  user, 
  onStartChat 
}: {
  connections: any[];
  user: any;
  onStartChat: (userId: string, userName: string) => void;
}) {
  const { t } = useTranslation();

  if (connections.length === 0) return null;

  return (
    <div className="bg-cream/70 backdrop-blur-[15px] rounded-xl p-6 shadow-glass-card border border-sandstone-300/50">
      <h4 className="font-medium font-logo text-rhino mb-4 flex items-center space-x-2">
        <Users size={18} />
        <span>{t('profile.myConnections')}</span>
      </h4>
      <div className="space-y-3">
        {connections.slice(0, 5).map((connection) => {
          const otherUserId = connection.sender_id === user.id ? connection.receiver_id : connection.sender_id;
          
          return (
            <ConnectionItem 
              key={connection.id}
              connection={connection}
              otherUserId={otherUserId}
              currentUserId={user.id}
              onStartChat={onStartChat}
            />
          );
        })}
        {connections.length > 5 && (
          <p className="text-sm text-walnut text-center">
            {t('profile.andMoreConnections', { count: connections.length - 5 })}
          </p>
        )}
      </div>
    </div>
  );
}

// Created Events Component
function CreatedEvents({ 
  createdEvents, 
  onNavigateToEvents 
}: {
  createdEvents: Event[];
  onNavigateToEvents: () => void;
}) {
  const { t, i18n } = useTranslation();

  if (createdEvents.length === 0) return null;

  return (
    <div className="bg-cream/70 backdrop-blur-[15px] rounded-xl p-6 shadow-glass-card border border-sandstone-300/50">
      <h4 className="font-medium font-logo text-rhino mb-4 flex items-center space-x-2">
        <Calendar size={18} />
        <span>{t('profile.myEvents')}</span>
      </h4>
      <div className="space-y-3">
        {createdEvents.slice(0, 3).map((event) => (
          <div key={event.id} className="bg-akaroa-100/70 rounded-lg p-4 border border-akaroa-200/50">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-rhino">
                {getLocalizedField(event.title, i18n.language)}
              </h5>
              <div className="flex space-x-1">
                <button
                  onClick={onNavigateToEvents}
                  className="bg-desert/10 text-desert p-1 rounded hover:bg-desert/20 transition-colors duration-200"
                >
                  <Edit size={14} />
                </button>
              </div>
            </div>
            <p className="text-sm text-walnut">
              {formatLocalizedDate(event.event_date)} • {formatLocalizedTime(event.event_time)}
            </p>
            <p className="text-sm text-walnut mt-1">
              {getLocalizedField(event.location, i18n.language)}
            </p>
            {event.rsvp_count && event.rsvp_count[0] && (
              <p className="text-xs text-success-700 mt-2 flex items-center space-x-1">
                <Users size={12} />
                <span>{event.rsvp_count[0].count} {t('events.peopleAttending')}</span>
              </p>
            )}
          </div>
        ))}
        {createdEvents.length > 3 && (
          <p className="text-sm text-walnut text-center">
            {t('profile.andMoreEvents', { count: createdEvents.length - 3 })}
          </p>
        )}
      </div>
    </div>
  );
}

// RSVP Events Component
function RSVPEvents({ rsvpEvents }: { rsvpEvents: any[] }) {
  const { t, i18n } = useTranslation();

  if (rsvpEvents.length === 0) return null;

  return (
    <div className="bg-cream/70 backdrop-blur-[15px] rounded-xl p-6 shadow-glass-card border border-sandstone-300/50">
      <h4 className="font-medium font-logo text-rhino mb-4 flex items-center space-x-2">
        <Calendar size={18} />
        <span>{t('profile.myRSVPs')}</span>
      </h4>
      <div className="space-y-3">
        {rsvpEvents.slice(0, 3).map((rsvp) => (
          <div key={rsvp.id} className="bg-akaroa-100/70 rounded-lg p-4 border border-akaroa-200/50">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-rhino">
                {getLocalizedField(rsvp.event?.title, i18n.language)}
              </h5>
              <span className={`text-xs px-2 py-1 rounded ${
                rsvp.status === 'attending' ? 'bg-success-50 text-success-700' :
                rsvp.status === 'maybe' ? 'bg-warning-50 text-warning-700' :
                'bg-error-50 text-error-700'
              }`}>
                {rsvp.status === 'attending' ? t('events.attend') :
                 rsvp.status === 'maybe' ? t('events.maybe') : t('events.notAttending')}
              </span>
            </div>
            <p className="text-sm text-walnut">
              {formatLocalizedDate(rsvp.event?.event_date)} • {formatLocalizedTime(rsvp.event?.event_time)}
            </p>
            <p className="text-sm text-walnut mt-1">
              {getLocalizedField(rsvp.event?.location, i18n.language)}
            </p>
          </div>
        ))}
        {rsvpEvents.length > 3 && (
          <p className="text-sm text-walnut text-center">
            {t('profile.andMoreRSVPs', { count: rsvpEvents.length - 3 })}
          </p>
        )}
      </div>
    </div>
  );
}

// Account Actions Component
function AccountActions({ 
  onSignOut, 
  onDeleteAccount, 
  isDeleting 
}: {
  onSignOut: () => void;
  onDeleteAccount: () => void;
  isDeleting: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-cream/70 backdrop-blur-[15px] rounded-xl p-6 shadow-glass-card border border-sandstone-300/50 space-y-4">
      <h4 className="font-medium font-logo text-rhino mb-4">{t('profile.accountActions')}</h4>
      
      <button
        onClick={onSignOut}
        className="w-full bg-walnut/70 backdrop-blur-[8px] text-white py-3 px-6 rounded-lg font-medium shadow-glass-button hover:shadow-glass-button-hover transition-all duration-200 border border-walnut-700/50 flex items-center justify-center space-x-2"
      >
        <LogOut size={18} />
        <span>{t('profile.signOut')}</span>
      </button>
      
      <p className="text-xs text-walnut leading-relaxed">
        {t('profile.deleteAccountInfo')}
      </p>
      
      <button
        onClick={onDeleteAccount}
        disabled={isDeleting}
        className="w-full bg-sandstone-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-sandstone-600 transition-colors duration-200 text-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? (
          <>
            <Loader size={16} className="animate-spin" />
            <span>{t('profile.deleting')}</span>
          </>
        ) : (
          <>
            <Trash2 size={16} />
            <span>{t('profile.deleteAccount')}</span>
          </>
        )}
      </button>
    </div>
  );
}

// Main ProfilePage Component
export default function ProfilePage({ 
  onNavigate, 
  onSignOut, 
  viewingProfileId, 
  onViewProfile, 
  connectedUserIds 
}: ProfilePageProps) {
  const { t, i18n } = useTranslation();
  
  // State management
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showChatWindow, setShowChatWindow] = useState(false);
  
  // Data state
  const [connections, setConnections] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [rsvpEvents, setRSVPEvents] = useState<any[]>([]);
  
  // Form state
  const [editForm, setEditForm] = useState<ProfileFormData>({
    display_name: '',
    bio: { de: '', en: '', fr: '' },
    contribution: { de: '', en: '', fr: '' },
    interests: [],
    location_city: '',
    location_country: '',
    privacy_level: 'public',
    email_notifications: true
  });

  // Computed values
  const isOwnProfile = user && profile && user.id === profile.id;
  const isConnected = profile && connectedUserIds.includes(profile.id);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Create default profile for new users
  const createDefaultProfile = async (userData: any) => {
    const newProfile = {
      id: userData.id,
      username: userData.user_metadata?.username || userData.email?.split('@')[0] || '',
      display_name: userData.user_metadata?.display_name || userData.user_metadata?.username || '',
      bio: { de: '', en: '', fr: '' },
      contribution: { de: '', en: '', fr: '' },
      interests: [],
      location_city: '',
      location_country: '',
      privacy_level: 'public' as const,
      email_notifications: true,
      data_processing_consent: false
    };
    
    const { error: createError } = await profileHelpers.createProfile(newProfile);
    
    if (createError) {
      console.error('Error creating profile:', createError);
      setMessage({ type: 'error', text: `${t('errors.unexpectedError')}: ${createError.message}` });
      return null;
    }
    
    console.log('Profile created successfully');
    setProfile(newProfile);
    setEditForm({
      display_name: newProfile.display_name,
      bio: newProfile.bio,
      contribution: newProfile.contribution,
      interests: newProfile.interests,
      location_city: newProfile.location_city,
      location_country: newProfile.location_country,
      privacy_level: newProfile.privacy_level,
      email_notifications: newProfile.email_notifications
    });
    setIsEditing(true);
    setMessage({ type: 'success', text: 'Profil erstellt! Bitte vervollständige deine Angaben.' });
    
    return newProfile;
  };

  // Load additional user data (connections, events, etc.)
  const loadAdditionalData = async (userId: string) => {
    try {
      // Load all data in parallel
      const [
        incomingData,
        outgoingData,
        connectionsData,
        eventsData,
        rsvpData
      ] = await Promise.allSettled([
        connectionRequestHelpers.getIncomingRequests(userId),
        connectionRequestHelpers.getOutgoingRequests(userId),
        connectionRequestHelpers.getAcceptedConnections(userId),
        eventHelpers.getUserEvents(userId),
        rsvpHelpers.getUserRSVPs(userId)
      ]);

      // Set data with error handling
      if (incomingData.status === 'fulfilled') {
        setIncomingRequests(incomingData.value.data || []);
      }
      if (outgoingData.status === 'fulfilled') {
        setOutgoingRequests(outgoingData.value.data || []);
      }
      if (connectionsData.status === 'fulfilled') {
        setConnections(connectionsData.value.data || []);
      }
      if (eventsData.status === 'fulfilled') {
        setCreatedEvents(eventsData.value.data || []);
      }
      if (rsvpData.status === 'fulfilled') {
        setRSVPEvents(rsvpData.value.data || []);
      }
    } catch (error) {
      console.error('Error loading additional data:', error);
    }
  };

  // Main data loading effect
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      
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
        
        if (!userData.user) {
          setMessage({ type: 'error', text: t('errors.noUserFound') });
          setIsLoading(false);
          return;
        }
        
        setUser(userData.user);

        // Determine which profile to load
        const profileId = viewingProfileId || userData.user.id;
        
        if (!profileId) {
          setMessage({ type: 'error', text: t('errors.noUserFound') });
          setIsLoading(false);
          return;
        }

        // Load profile
        const { data: profileData, error: profileError } = await profileHelpers.getProfile(profileId);
        
        if (profileError) {
          console.error('Error loading profile:', profileError);
          
          // Create profile for new users
          if (profileError.code === 'PGRST116' && userData.user && profileId === userData.user.id) {
            console.log('Profile not found, creating new profile for user:', userData.user.id);
            await createDefaultProfile(userData.user);
          } else {
            setMessage({ type: 'error', text: `${t('errors.unexpectedError')}: ${profileError.message}` });
          }
        } else if (profileData) {
          setProfile(profileData);
          
          // Initialize edit form with current data
          setEditForm({
            display_name: profileData.display_name || '',
            bio: typeof profileData.bio === 'object' ? profileData.bio : { de: profileData.bio || '', en: '', fr: '' },
            contribution: typeof profileData.contribution === 'object' ? profileData.contribution : { de: profileData.contribution || '', en: '', fr: '' },
            interests: profileData.interests || [],
            location_city: profileData.location_city || '',
            location_country: profileData.location_country || '',
            privacy_level: profileData.privacy_level || 'public',
            email_notifications: profileData.email_notifications !== false
          });
        }

        // Load additional data only for own profile
        if (userData.user && profileId === userData.user.id) {
          await loadAdditionalData(profileId);
        }

      } catch (error) {
        console.error('Error loading user data:', error);
        setMessage({ type: 'error', text: t('errors.unexpectedError') });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [viewingProfileId, connectedUserIds, t]);

  // Event handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const updates = {
        display_name: editForm.display_name,
        bio: editForm.bio,
        contribution: editForm.contribution,
        interests: editForm.interests,
        location_city: editForm.location_city,
        location_country: editForm.location_country,
        privacy_level: editForm.privacy_level,
        email_notifications: editForm.email_notifications
      };

      const { error } = await profileHelpers.updateProfile(user.id, updates);

      if (error) {
        console.error('Error updating profile:', error);
        setMessage({ type: 'error', text: `${t('errors.unexpectedError')}: ${error.message}` });
      } else {
        setMessage({ type: 'success', text: t('profile.profileUpdated') });
        setIsEditing(false);
        
        // Reload profile data
        const { data: updatedProfile } = await profileHelpers.getProfile(user.id);
        if (updatedProfile) {
          setProfile(updatedProfile);
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: t('errors.unexpectedError') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !window.confirm(t('profile.confirmDelete'))) return;

    setIsDeleting(true);
    try {
      await profileHelpers.deleteProfile(user.id);
      setMessage({ type: 'success', text: t('profile.accountDeleted') });
      setTimeout(() => {
        onSignOut();
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({ type: 'error', text: t('errors.unexpectedError') });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { error } = await connectionRequestHelpers.updateRequestStatus(requestId, 'accepted');
      if (error) {
        setMessage({ type: 'error', text: `${t('errors.unexpectedError')}: ${error.message}` });
      } else {
        setMessage({ type: 'success', text: t('profile.connectionAccepted') });
        // Reload requests
        if (user) {
          const { data: incomingData } = await connectionRequestHelpers.getIncomingRequests(user.id);
          setIncomingRequests(incomingData || []);
          const { data: connectionsData } = await connectionRequestHelpers.getAcceptedConnections(user.id);
          setConnections(connectionsData || []);
        }
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      setMessage({ type: 'error', text: t('errors.unexpectedError') });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await connectionRequestHelpers.updateRequestStatus(requestId, 'rejected');
      if (error) {
        setMessage({ type: 'error', text: `${t('errors.unexpectedError')}: ${error.message}` });
      } else {
        setMessage({ type: 'success', text: t('profile.connectionRejected') });
        // Reload requests
        if (user) {
          const { data: incomingData } = await connectionRequestHelpers.getIncomingRequests(user.id);
          setIncomingRequests(incomingData || []);
        }
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      setMessage({ type: 'error', text: t('errors.unexpectedError') });
    }
  };

  const handleStartChat = (userId: string, userName: string) => {
    onViewProfile(userId);
    setShowChatWindow(true);
  };

  // Render loading state
  if (isLoading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  // Render error state
  if (!profile) {
    return <ErrorScreen message={t('profile.profileNotFound')} onNavigateHome={() => onNavigate('home')} />;
  }

  return (
    <div className="min-h-screen bg-cream relative">
      <BackgroundImage />

      <ProfileHeader
        isOwnProfile={!!isOwnProfile}
        viewingProfileId={viewingProfileId}
        isEditing={isEditing}
        onNavigateHome={() => onNavigate('home')}
        onViewProfile={onViewProfile}
        onToggleEdit={() => setIsEditing(!isEditing)}
      />

      <div className="max-w-md lg:max-w-3xl mx-auto px-3 py-6 pb-24 md:px-6 space-y-6 relative z-10">
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

        <MessageDisplay message={message} />
        <SupabaseStatus />

        {/* Main Content */}
        {isEditing && isOwnProfile ? (
          <ProfileEditForm
            editForm={editForm}
            setEditForm={setEditForm}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditing(false)}
            isSaving={isSaving}
          />
        ) : (
          <div className="space-y-6">
            <ProfileDisplay
              profile={profile}
              user={user}
              isOwnProfile={!!isOwnProfile}
              isConnected={!!isConnected}
              onShowConnectModal={() => setShowConnectModal(true)}
              onShowChatWindow={() => setShowChatWindow(true)}
            />

            <ProfileSections profile={profile} />

            {/* Own Profile Sections */}
            {isOwnProfile && (
              <>
                <ConnectionRequests
                  incomingRequests={incomingRequests}
                  onAcceptRequest={handleAcceptRequest}
                  onRejectRequest={handleRejectRequest}
                />

                <ConnectionsList
                  connections={connections}
                  user={user}
                  onStartChat={handleStartChat}
                />

                <CreatedEvents
                  createdEvents={createdEvents}
                  onNavigateToEvents={() => onNavigate('events')}
                />

                <RSVPEvents rsvpEvents={rsvpEvents} />

                <AccountActions
                  onSignOut={onSignOut}
                  onDeleteAccount={handleDeleteAccount}
                  isDeleting={isDeleting}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showConnectModal && profile && user && (
        <ConnectRequestModal
          receiverProfileId={profile.id}
          receiverName={profile.display_name || profile.username || t('common.unknown')}
          currentUserId={user.id}
          onClose={() => setShowConnectModal(false)}
          onSendSuccess={() => {
            setShowConnectModal(false);
            setMessage({ type: 'success', text: t('connection.requestSent') });
          }}
        />
      )}

      {showChatWindow && user && profile && (
        <ChatWindow
          currentUserId={user.id}
          otherUserId={viewingProfileId || profile.id}
          otherUserName={profile.display_name || profile.username || 'Unbekannter Nutzer'}
          onClose={() => setShowChatWindow(false)}
        />
      )}
    </div>
  );
}