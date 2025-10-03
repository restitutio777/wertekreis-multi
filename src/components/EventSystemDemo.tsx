/**
 * Event System Demo Component
 * 
 * Demonstrates the comprehensive event system capabilities
 * with practical examples for the Soul Circles application.
 */

import React, { useState } from 'react';
import { 
  useEventListener, 
  useEventPublisher, 
  useEventStats, 
  useEventHistory,
  useEventCollector,
  useDebouncedEventPublisher 
} from '../hooks/useEvents';
import { EVENT_TYPES } from '../lib/eventTypes';
import { EventPriority } from '../lib/eventSystem';
import { Play, Pause, BarChart3, History, Bell, Search, Users, MapPin } from 'lucide-react';

export default function EventSystemDemo() {
  const [isListening, setIsListening] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);
  
  const publish = useEventPublisher();
  const debouncedPublish = useDebouncedEventPublisher(500);
  const stats = useEventStats(2000);
  const history = useEventHistory(undefined, 20, 2000);
  const recentNotifications = useEventCollector('ui:notification:show', 5);

  // Listen to various events
  useEventListener(
    EVENT_TYPES.USER_LOGIN,
    (data) => {
      console.log('User logged in:', data);
      setNotifications(prev => [...prev, `User ${data.email} logged in`]);
    },
    { priority: EventPriority.HIGH }
  );

  useEventListener(
    EVENT_TYPES.CONNECTION_REQUEST_SENT,
    (data) => {
      console.log('Connection request sent:', data);
      setNotifications(prev => [...prev, `Connection request sent to user ${data.receiverId}`]);
    }
  );

  useEventListener(
    EVENT_TYPES.PLACE_ADDED,
    (data) => {
      console.log('New place added:', data);
      setNotifications(prev => [...prev, `New place "${data.name}" added`]);
    }
  );

  useEventListener(
    EVENT_TYPES.UI_NOTIFICATION_SHOW,
    (data) => {
      console.log('Notification shown:', data);
    },
    { priority: EventPriority.NORMAL },
    [isListening]
  );

  // Event handlers
  const handleUserLogin = () => {
    publish(EVENT_TYPES.USER_LOGIN, {
      userId: `user_${Date.now()}`,
      email: `user${Math.floor(Math.random() * 1000)}@example.com`,
      timestamp: new Date()
    });
  };

  const handleConnectionRequest = () => {
    publish(EVENT_TYPES.CONNECTION_REQUEST_SENT, {
      senderId: 'current_user',
      receiverId: `user_${Math.floor(Math.random() * 1000)}`,
      proposalType: 'Tea & Soul Talk',
      message: 'Would love to connect and share some meaningful conversation!'
    });
  };

  const handlePlaceAdd = () => {
    const places = ['Meditation Garden', 'Quiet Library Corner', 'Peaceful Park Bench', 'Spiritual Bookstore'];
    const interests = ['Meditation', 'Philosophy', 'Mystik', 'Anthroposophie'];
    
    publish(EVENT_TYPES.PLACE_ADDED, {
      placeId: Math.floor(Math.random() * 10000),
      name: places[Math.floor(Math.random() * places.length)],
      location: {
        lat: 48.8566 + (Math.random() - 0.5) * 0.1,
        lng: 2.3522 + (Math.random() - 0.5) * 0.1
      },
      interest: interests[Math.floor(Math.random() * interests.length)],
      addedBy: 'current_user'
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedPublish(EVENT_TYPES.PLACE_SEARCH, {
      query,
      filters: { interest: 'all', radius: 25 },
      results: Math.floor(Math.random() * 20)
    });
  };

  const handleNotification = (type: 'success' | 'error' | 'info' | 'warning') => {
    const messages = {
      success: 'Operation completed successfully!',
      error: 'Something went wrong.',
      info: 'Here\'s some useful information.',
      warning: 'Please be aware of this.'
    };

    publish(EVENT_TYPES.UI_NOTIFICATION_SHOW, {
      type,
      message: messages[type],
      duration: 3000
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold font-logo text-stone-800">Event System Demo</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Comprehensive event management system with subscription, publishing, prioritization, 
            and real-time monitoring capabilities.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold font-logo text-stone-800">Event Controls</h2>
            <button
              onClick={() => setIsListening(!isListening)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isListening 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {isListening ? <Pause size={18} /> : <Play size={18} />}
              <span>{isListening ? 'Listening' : 'Paused'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* User Login */}
            <button
              onClick={handleUserLogin}
              className="flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-3 rounded-lg hover:bg-purple-200 transition-colors duration-200"
            >
              <Users size={18} />
              <span>Simulate Login</span>
            </button>

            {/* Connection Request */}
            <button
              onClick={handleConnectionRequest}
              className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-200 transition-colors duration-200"
            >
              <Users size={18} />
              <span>Send Connection</span>
            </button>

            {/* Add Place */}
            <button
              onClick={handlePlaceAdd}
              className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-3 rounded-lg hover:bg-green-200 transition-colors duration-200"
            >
              <MapPin size={18} />
              <span>Add Place</span>
            </button>

            {/* Show Notification */}
            <div className="relative">
              <select
                onChange={(e) => handleNotification(e.target.value as any)}
                className="w-full bg-amber-100 text-amber-700 px-4 py-3 rounded-lg hover:bg-amber-200 transition-colors duration-200 appearance-none cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Show Notification</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
              </select>
              <Bell size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-700 pointer-events-none" />
            </div>
          </div>

          {/* Search Demo */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Debounced Search (500ms delay)
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Search for places..."
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Statistics */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <BarChart3 size={24} className="text-purple-600" />
              <h3 className="text-xl font-semibold font-logo text-stone-800">Event Statistics</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-stone-600">Total Events:</span>
                <span className="font-semibold text-stone-800">{stats.totalEvents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-600">Active Listeners:</span>
                <span className="font-semibold text-stone-800">{stats.totalListeners}</span>
              </div>
              
              {Object.keys(stats.eventCounts).length > 0 && (
                <div>
                  <h4 className="font-medium font-logo text-stone-700 mb-2">Event Counts:</h4>
                  <div className="space-y-1">
                    {Object.entries(stats.eventCounts).map(([event, count]) => (
                      <div key={event} className="flex justify-between text-sm">
                        <span className="text-stone-600 truncate">{event}:</span>
                        <span className="font-medium text-stone-800">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(stats.averageExecutionTime).length > 0 && (
                <div>
                  <h4 className="font-medium font-logo text-stone-700 mb-2">Avg Execution Time (ms):</h4>
                  <div className="space-y-1">
                    {Object.entries(stats.averageExecutionTime).map(([event, time]) => (
                      <div key={event} className="flex justify-between text-sm">
                        <span className="text-stone-600 truncate">{event}:</span>
                        <span className="font-medium text-stone-800">{time.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Event History */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <History size={24} className="text-blue-600" />
              <h3 className="text-xl font-semibold font-logo text-stone-800">Recent Events</h3>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-stone-500 text-center py-8">No events yet</p>
              ) : (
                history.slice().reverse().map((event, index) => (
                  <div key={index} className="border border-stone-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-stone-800 text-sm">{event.type}</span>
                      <span className="text-xs text-stone-500">
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className="text-xs text-stone-600 bg-stone-50 rounded p-2 overflow-x-auto">
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Bell size={24} className="text-green-600" />
              <h3 className="text-xl font-semibold font-logo text-stone-800">Live Notifications</h3>
            </div>
            <button
              onClick={clearNotifications}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-stone-500 text-center py-4">No notifications</p>
            ) : (
              notifications.slice().reverse().map((notification, index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <span className="text-green-800 text-sm">{notification}</span>
                </div>
              ))
            )}
          </div>

          {/* Recent Event-Based Notifications */}
          {recentNotifications.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium font-logo text-stone-700 mb-3">Event-Based Notifications:</h4>
              <div className="space-y-2">
                {recentNotifications.slice().reverse().map((notification, index) => (
                  <div key={index} className={`border rounded-lg p-3 ${
                    notification.type === 'success' ? 'bg-green-50 border-green-200' :
                    notification.type === 'error' ? 'bg-red-50 border-red-200' :
                    notification.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <span className={`text-sm ${
                      notification.type === 'success' ? 'text-green-800' :
                      notification.type === 'error' ? 'text-red-800' :
                      notification.type === 'warning' ? 'text-amber-800' :
                      'text-blue-800'
                    }`}>
                      {notification.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Documentation */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold font-logo text-stone-800 mb-4">Key Features Demonstrated</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium font-logo text-stone-700 mb-2">Event Management:</h4>
              <ul className="text-sm text-stone-600 space-y-1">
                <li>• Event subscription with priorities</li>
                <li>• Synchronous and asynchronous publishing</li>
                <li>• Automatic listener cleanup</li>
                <li>• Memory-efficient operations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium font-logo text-stone-700 mb-2">Advanced Features:</h4>
              <ul className="text-sm text-stone-600 space-y-1">
                <li>• Real-time statistics monitoring</li>
                <li>• Event history tracking</li>
                <li>• Debounced event publishing</li>
                <li>• Type-safe event definitions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}