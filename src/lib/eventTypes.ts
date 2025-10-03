/**
 * Event Type Definitions for Soul Circles Application
 * 
 * This file defines all the event types used throughout the application
 * for type safety and better developer experience.
 */

// User-related events
export interface UserEvents {
  'user:login': { userId: string; email: string; timestamp: Date };
  'user:logout': { userId: string; timestamp: Date };
  'user:register': { userId: string; email: string; username?: string };
  'user:profile:update': { userId: string; changes: Record<string, any> };
  'user:profile:view': { viewerId: string; profileId: string };
}

// Connection-related events
export interface ConnectionEvents {
  'connection:request:sent': { 
    senderId: string; 
    receiverId: string; 
    proposalType: string; 
    message?: string 
  };
  'connection:request:received': { 
    senderId: string; 
    receiverId: string; 
    requestId: string 
  };
  'connection:request:accepted': { 
    requestId: string; 
    senderId: string; 
    receiverId: string 
  };
  'connection:request:rejected': { 
    requestId: string; 
    senderId: string; 
    receiverId: string 
  };
  'connection:established': { 
    userId1: string; 
    userId2: string; 
    connectionType: string 
  };
}

// Place-related events
export interface PlaceEvents {
  'place:added': { 
    placeId: number; 
    name: string; 
    location: { lat: number; lng: number }; 
    interest: string;
    addedBy?: string;
  };
  'place:viewed': { 
    placeId: number; 
    viewerId?: string; 
    location: { lat: number; lng: number } 
  };
  'place:search': { 
    query: string; 
    filters: Record<string, any>; 
    results: number 
  };
}

// Navigation events
export interface NavigationEvents {
  'navigation:page:change': { 
    from: string; 
    to: string; 
    userId?: string; 
    timestamp: Date 
  };
  'navigation:back': { currentPage: string; previousPage?: string };
  'navigation:external:link': { url: string; source: string };
}

// UI events
export interface UIEvents {
  'ui:modal:open': { modalType: string; data?: any };
  'ui:modal:close': { modalType: string; action?: string };
  'ui:notification:show': { 
    type: 'success' | 'error' | 'info' | 'warning'; 
    message: string; 
    duration?: number 
  };
  'ui:notification:dismiss': { notificationId: string };
  'ui:theme:change': { theme: 'light' | 'dark' | 'auto' };
  'ui:search:focus': { component: string };
  'ui:search:blur': { component: string; query: string };
}

// Map events
export interface MapEvents {
  'map:center:change': { 
    lat: number; 
    lng: number; 
    zoom: number; 
    source: 'user' | 'auto' | 'search' 
  };
  'map:marker:click': { 
    placeId: number; 
    location: { lat: number; lng: number } 
  };
  'map:location:found': { 
    lat: number; 
    lng: number; 
    accuracy: number 
  };
  'map:location:error': { 
    error: string; 
    code?: number 
  };
}

// Error events
export interface ErrorEvents {
  'error:network': { 
    url: string; 
    method: string; 
    status?: number; 
    message: string 
  };
  'error:auth': { 
    action: string; 
    error: string; 
    userId?: string 
  };
  'error:validation': { 
    field: string; 
    value: any; 
    rule: string; 
    message: string 
  };
  'error:unexpected': { 
    component: string; 
    error: Error; 
    context?: Record<string, any> 
  };
}

// Analytics events
export interface AnalyticsEvents {
  'analytics:page:view': { 
    page: string; 
    userId?: string; 
    duration?: number 
  };
  'analytics:feature:used': { 
    feature: string; 
    userId?: string; 
    metadata?: Record<string, any> 
  };
  'analytics:conversion': { 
    type: 'signup' | 'profile_complete' | 'connection_made'; 
    userId: string; 
    value?: number 
  };
}

// System events
export interface SystemEvents {
  'system:ready': { timestamp: Date; version: string };
  'system:error': { error: Error; component: string; severity: 'low' | 'medium' | 'high' | 'critical' };
  'system:performance': { 
    metric: string; 
    value: number; 
    threshold?: number 
  };
  'system:maintenance': { 
    type: 'start' | 'end'; 
    message?: string 
  };
}

// Combined event types for type safety
export type AllEvents = 
  & UserEvents 
  & ConnectionEvents 
  & PlaceEvents 
  & NavigationEvents 
  & UIEvents 
  & MapEvents 
  & ErrorEvents 
  & AnalyticsEvents 
  & SystemEvents;

// Event type names for runtime validation
export const EVENT_TYPES = {
  // User events
  USER_LOGIN: 'user:login' as const,
  USER_LOGOUT: 'user:logout' as const,
  USER_REGISTER: 'user:register' as const,
  USER_PROFILE_UPDATE: 'user:profile:update' as const,
  USER_PROFILE_VIEW: 'user:profile:view' as const,

  // Connection events
  CONNECTION_REQUEST_SENT: 'connection:request:sent' as const,
  CONNECTION_REQUEST_RECEIVED: 'connection:request:received' as const,
  CONNECTION_REQUEST_ACCEPTED: 'connection:request:accepted' as const,
  CONNECTION_REQUEST_REJECTED: 'connection:request:rejected' as const,
  CONNECTION_ESTABLISHED: 'connection:established' as const,

  // Place events
  PLACE_ADDED: 'place:added' as const,
  PLACE_VIEWED: 'place:viewed' as const,
  PLACE_SEARCH: 'place:search' as const,

  // Navigation events
  NAVIGATION_PAGE_CHANGE: 'navigation:page:change' as const,
  NAVIGATION_BACK: 'navigation:back' as const,
  NAVIGATION_EXTERNAL_LINK: 'navigation:external:link' as const,

  // UI events
  UI_MODAL_OPEN: 'ui:modal:open' as const,
  UI_MODAL_CLOSE: 'ui:modal:close' as const,
  UI_NOTIFICATION_SHOW: 'ui:notification:show' as const,
  UI_NOTIFICATION_DISMISS: 'ui:notification:dismiss' as const,
  UI_THEME_CHANGE: 'ui:theme:change' as const,
  UI_SEARCH_FOCUS: 'ui:search:focus' as const,
  UI_SEARCH_BLUR: 'ui:search:blur' as const,

  // Map events
  MAP_CENTER_CHANGE: 'map:center:change' as const,
  MAP_MARKER_CLICK: 'map:marker:click' as const,
  MAP_LOCATION_FOUND: 'map:location:found' as const,
  MAP_LOCATION_ERROR: 'map:location:error' as const,

  // Error events
  ERROR_NETWORK: 'error:network' as const,
  ERROR_AUTH: 'error:auth' as const,
  ERROR_VALIDATION: 'error:validation' as const,
  ERROR_UNEXPECTED: 'error:unexpected' as const,

  // Analytics events
  ANALYTICS_PAGE_VIEW: 'analytics:page:view' as const,
  ANALYTICS_FEATURE_USED: 'analytics:feature:used' as const,
  ANALYTICS_CONVERSION: 'analytics:conversion' as const,

  // System events
  SYSTEM_READY: 'system:ready' as const,
  SYSTEM_ERROR: 'system:error' as const,
  SYSTEM_PERFORMANCE: 'system:performance' as const,
  SYSTEM_MAINTENANCE: 'system:maintenance' as const,
} as const;

// Type-safe event emitter
export type EventType = keyof AllEvents;
export type EventPayload<T extends EventType> = AllEvents[T];