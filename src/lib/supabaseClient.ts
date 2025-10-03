import { createClient } from '@supabase/supabase-js';

// Check if Supabase is configured
export const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Initialize Supabase client only if configured
export const supabase = isSupabaseConfigured ? createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
) : null;

// Clear Supabase tokens from localStorage
export const clearSupabaseTokens = () => {
  if (typeof window !== 'undefined') {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Helper function to get localized field from JSONB
export const getLocalizedField = (field: Record<string, string> | string | null | undefined, language: string = 'de'): string => {
  if (!field) return '';
  
  // If it's already a string (legacy data), return as is
  if (typeof field === 'string') {
    return field;
  }
  
  // If it's a JSONB object, get the localized version
  if (typeof field === 'object' && field !== null) {
    return field[language] || field['de'] || field['en'] || Object.values(field)[0] || '';
  }
  
  return '';
};

// Helper function to create localized field object
export const createLocalizedField = (value: string, language: string = 'de'): Record<string, string> => {
  return { [language]: value };
};

// Database Types
export interface Profile {
  id: string;
  username?: string;
  display_name?: string;
  bio?: Record<string, string> | string;
  contribution?: Record<string, string> | string;
  avatar_url?: string;
  interests?: string[];
  location_city?: string;
  location_country?: string;
  privacy_level?: 'public' | 'friends' | 'private';
  email_notifications?: boolean;
  data_processing_consent?: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewProfile {
  id: string;
  username?: string;
  display_name?: string;
  bio?: Record<string, string>;
  contribution?: Record<string, string>;
  avatar_url?: string;
  interests?: string[];
  location_city?: string;
  location_country?: string;
  privacy_level?: 'public' | 'friends' | 'private';
  email_notifications?: boolean;
  data_processing_consent?: boolean;
}

export interface Place {
  id: number;
  created_at: string;
  name: Record<string, string> | string;
  description: Record<string, string> | string;
  latitude: number;
  longitude: number;
  interest: string;
}

export interface NewPlace {
  name: Record<string, string>;
  description: Record<string, string>;
  latitude: number;
  longitude: number;
  interest: string;
}

export interface Event {
  id: string;
  created_at?: string;
  updated_at?: string;
  title: Record<string, string> | string;
  description: Record<string, string> | string;
  event_date: string;
  event_time: string;
  location: Record<string, string> | string;
  image_url?: string;
  category: string;
  website_link?: string;
  contact_info?: string;
  max_attendees?: number;
  created_by?: string;
  creator_profile?: Profile;
  rsvp_count?: { count: number }[];
}

export interface NewEvent {
  title: Record<string, string>;
  description: Record<string, string>;
  event_date: string;
  event_time: string;
  location: Record<string, string>;
  image_url?: string;
  category: string;
  website_link?: string;
  contact_info?: string;
  max_attendees?: number;
  created_by: string;
}

export interface ConnectionRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  proposal_type: 'Silent Walk' | 'Tea & Soul Talk' | 'Book Circle' | 'Just Connect';
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface NewConnectionRequest {
  sender_id: string;
  receiver_id: string;
  proposal_type: 'Silent Walk' | 'Tea & Soul Talk' | 'Book Circle' | 'Just Connect';
  message?: string;
}

// Auth helpers
export const authHelpers = {
  async signUp(email: string, password: string, metadata?: any) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
  },

  async signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  async signOut() {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase.auth.signOut();
  },

  async getCurrentUser() {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase.auth.getUser();
  },

  async resetPasswordForEmail(email: string) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase.auth.resetPasswordForEmail(email);
  },

  async updatePassword(password: string) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase.auth.updateUser({ password });
  },

  onAuthStateChange(callback: (event: any, session: any) => void) {
    if (!supabase) throw new Error('Supabase not configured');
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Profile helpers
export const profileHelpers = {
  async getProfile(userId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
  },

  async updateProfile(userId: string, updates: Partial<NewProfile>) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
  },

  async createProfile(profile: NewProfile) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('profiles')
      .insert([profile]);
  },

  async getPublicProfiles(limit: number = 50) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('profiles')
      .select('*')
      .eq('privacy_level', 'public')
      .limit(limit);
  },

  async deleteProfile(userId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    
    // Refresh the session to ensure we have a valid access token
    const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession();
    
    if (sessionError || !sessionData.session?.access_token) {
      console.error('Failed to refresh session:', sessionError);
      throw new Error('Authentication failed. Please sign in again.');
    }

    console.log('Session refreshed successfully, proceeding with account deletion');

    // Call the edge function to delete the user
    const user = sessionData.session.user;
    if (!user) throw new Error('User not authenticated after session refresh');

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionData.session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      } catch (parseError) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    return await response.json();
  }
};

// Event helpers
export const eventHelpers = {
  async getEvents() {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('events')
      .select(`
        *,
        creator_profile:profiles!events_created_by_fkey(*),
        rsvp_count:event_rsvps(count)
      `)
      .order('event_date', { ascending: true });
  },

  async createEvent(event: NewEvent) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('events')
      .insert([event])
      .select();
  },

  async updateEvent(eventId: string, updates: Partial<NewEvent>) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId);
  },

  async deleteEvent(eventId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
  },

  async getUserEvents(userId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('events')
      .select(`
        *,
        creator_profile:profiles!events_created_by_fkey(*),
        rsvp_count:event_rsvps(count)
      `)
      .eq('created_by', userId)
      .order('event_date', { ascending: true });
  },

  async getUserCreatedEvents(userId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('events')
      .select(`
        *,
        creator_profile:profiles!events_created_by_fkey(*),
        rsvp_count:event_rsvps(count)
      `)
      .eq('created_by', userId)
      .order('event_date', { ascending: true });
  }
};

// RSVP helpers
export const rsvpHelpers = {
  async createOrUpdateRSVP(eventId: string, userId: string, status: 'attending' | 'maybe' | 'not_attending') {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('event_rsvps')
      .upsert([{
        event_id: eventId,
        user_id: userId,
        status
      }]);
  },

  async getUserRSVPs(userId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('event_rsvps')
      .select(`
        *,
        event:events(*)
      `)
      .eq('user_id', userId);
  }
};

// Connection request helpers
export const connectionRequestHelpers = {
  async sendRequest(senderId: string, receiverId: string, proposalType: 'Silent Walk' | 'Tea & Soul Talk' | 'Book Circle' | 'Just Connect', message?: string) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('connection_requests')
      .insert([{
        sender_id: senderId,
        receiver_id: receiverId,
        proposal_type: proposalType,
        message
      }]);
  },

  async getIncomingRequests(userId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('connection_requests')
      .select(`
        *,
        sender_profile:profiles!connection_requests_sender_id_fkey(*)
      `)
      .eq('receiver_id', userId)
      .eq('status', 'pending');
  },

  async getOutgoingRequests(userId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('connection_requests')
      .select(`
        *,
        receiver_profile:profiles!connection_requests_receiver_id_fkey(*)
      `)
      .eq('sender_id', userId);
  },

  async updateRequestStatus(requestId: string, status: 'accepted' | 'rejected') {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('connection_requests')
      .update({ status })
      .eq('id', requestId);
  },

  async checkExistingRequest(senderId: string, receiverId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('connection_requests')
      .select('*')
      .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
      .single();
  },

  async getAcceptedConnections(userId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('connection_requests')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted');
  },

  async getRequests(userId: string) {
    if (!supabase) throw new Error('Supabase not configured');
    return await supabase
      .from('connection_requests')
      .select(`
        *,
        sender_profile:profiles!connection_requests_sender_id_fkey(*),
        receiver_profile:profiles!connection_requests_receiver_id_fkey(*)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
  }
};