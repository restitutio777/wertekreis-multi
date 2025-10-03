/**
 * React Hooks for Event System Integration
 * 
 * Provides React-specific hooks for working with the event system
 * in a clean, declarative way that follows React best practices.
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { EventSystem, EventPriority, SubscriptionOptions, PublishOptions } from '../lib/eventSystem';
import { AllEvents, EventType, EventPayload } from '../lib/eventTypes';

// Global event system instance
import { globalEventSystem } from '../lib/eventSystem';

/**
 * Hook for subscribing to events with automatic cleanup
 * @param eventType - The event type to listen for
 * @param callback - The callback function
 * @param options - Subscription options
 * @param deps - Dependency array for the callback
 */
export function useEventListener<T extends EventType>(
  eventType: T,
  callback: (data: EventPayload<T>) => void | Promise<void>,
  options: SubscriptionOptions = {},
  deps: React.DependencyList = []
): void {
  const callbackRef = useRef(callback);
  const optionsRef = useRef(options);

  // Update refs when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
    optionsRef.current = options;
  });

  useEffect(() => {
    const unsubscribe = globalEventSystem.subscribe(
      eventType,
      (data) => callbackRef.current(data),
      optionsRef.current
    );

    return unsubscribe;
  }, [eventType, ...deps]);
}

/**
 * Hook for publishing events
 * @returns Function to publish events
 */
export function useEventPublisher() {
  return useCallback(
    <T extends EventType>(
      eventType: T,
      payload: EventPayload<T>,
      options?: PublishOptions
    ) => {
      return globalEventSystem.publish(eventType, payload, options);
    },
    []
  );
}

/**
 * Hook for one-time event listening with Promise support
 * @param eventType - The event type to wait for
 * @param options - Subscription options
 * @returns Promise that resolves with event data
 */
export function useEventOnce<T extends EventType>(
  eventType: T,
  options: Omit<SubscriptionOptions, 'once'> = {}
): Promise<EventPayload<T>> {
  return globalEventSystem.once(eventType, undefined, options);
}

/**
 * Hook for managing event subscriptions with state
 * @param eventType - The event type to listen for
 * @param initialValue - Initial state value
 * @param options - Subscription options
 * @returns [currentValue, setValue] tuple
 */
export function useEventState<T extends EventType, V = EventPayload<T>>(
  eventType: T,
  initialValue: V,
  options: SubscriptionOptions = {}
): [V, (value: V) => void] {
  const [value, setValue] = useState<V>(initialValue);
  const publish = useEventPublisher();

  useEventListener(
    eventType,
    (data) => {
      setValue(data as V);
    },
    options
  );

  const setValueAndPublish = useCallback(
    (newValue: V) => {
      setValue(newValue);
      publish(eventType, newValue as EventPayload<T>);
    },
    [eventType, publish]
  );

  return [value, setValueAndPublish];
}

/**
 * Hook for collecting multiple events into an array
 * @param eventType - The event type to collect
 * @param maxItems - Maximum number of items to keep
 * @param options - Subscription options
 * @returns Array of collected events
 */
export function useEventCollector<T extends EventType>(
  eventType: T,
  maxItems: number = 100,
  options: SubscriptionOptions = {}
): EventPayload<T>[] {
  const [events, setEvents] = useState<EventPayload<T>[]>([]);

  useEventListener(
    eventType,
    (data) => {
      setEvents(prev => {
        const newEvents = [...prev, data];
        return newEvents.slice(-maxItems);
      });
    },
    options
  );

  return events;
}

/**
 * Hook for debounced event publishing
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced publish function
 */
export function useDebouncedEventPublisher(delay: number = 300) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const publish = useEventPublisher();

  return useCallback(
    <T extends EventType>(
      eventType: T,
      payload: EventPayload<T>,
      options?: PublishOptions
    ) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        publish(eventType, payload, options);
      }, delay);
    },
    [delay, publish]
  );
}

/**
 * Hook for event system statistics
 * @param refreshInterval - How often to refresh stats (ms)
 * @returns Current event system statistics
 */
export function useEventStats(refreshInterval: number = 5000) {
  const [stats, setStats] = useState(() => globalEventSystem.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(globalEventSystem.getStats());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return stats;
}

/**
 * Hook for event history
 * @param eventType - Optional filter by event type
 * @param limit - Maximum number of events
 * @param refreshInterval - How often to refresh history (ms)
 * @returns Event history array
 */
export function useEventHistory(
  eventType?: EventType,
  limit: number = 50,
  refreshInterval: number = 1000
) {
  const [history, setHistory] = useState(() => 
    globalEventSystem.getHistory(eventType, limit)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setHistory(globalEventSystem.getHistory(eventType, limit));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [eventType, limit, refreshInterval]);

  return history;
}

/**
 * Hook for conditional event listening
 * @param eventType - The event type to listen for
 * @param callback - The callback function
 * @param condition - Whether to listen for events
 * @param options - Subscription options
 */
export function useConditionalEventListener<T extends EventType>(
  eventType: T,
  callback: (data: EventPayload<T>) => void | Promise<void>,
  condition: boolean,
  options: SubscriptionOptions = {}
): void {
  useEventListener(
    eventType,
    callback,
    options,
    [condition]
  );

  // Only subscribe when condition is true
  useEffect(() => {
    if (!condition) {
      return;
    }

    const unsubscribe = globalEventSystem.subscribe(eventType, callback, options);
    return unsubscribe;
  }, [eventType, condition]);
}

/**
 * Hook for event-driven side effects
 * @param eventType - The event type to listen for
 * @param effect - The side effect function
 * @param deps - Dependency array
 */
export function useEventEffect<T extends EventType>(
  eventType: T,
  effect: (data: EventPayload<T>) => void | (() => void),
  deps: React.DependencyList = []
): void {
  useEventListener(eventType, effect, {}, deps);
}

/**
 * Custom hook for creating a scoped event system
 * @param scope - Scope identifier for the event system
 * @returns Scoped event system instance
 */
export function useScopedEventSystem(scope: string): EventSystem {
  const eventSystemRef = useRef<EventSystem>();

  if (!eventSystemRef.current) {
    eventSystemRef.current = new EventSystem(undefined, 500);
  }

  useEffect(() => {
    return () => {
      eventSystemRef.current?.destroy();
    };
  }, []);

  return eventSystemRef.current;
}

/**
 * USAGE EXAMPLES:
 * 
 * // Basic event listener
 * useEventListener('user:login', (user) => {
 *   console.log('User logged in:', user);
 * });
 * 
 * // Event publisher
 * const publish = useEventPublisher();
 * const handleLogin = () => {
 *   publish('user:login', { userId: '123', email: 'user@example.com' });
 * };
 * 
 * // Event state management
 * const [currentUser, setCurrentUser] = useEventState('user:login', null);
 * 
 * // Collect notifications
 * const notifications = useEventCollector('ui:notification:show', 10);
 * 
 * // Debounced search
 * const debouncedPublish = useDebouncedEventPublisher(500);
 * const handleSearch = (query) => {
 *   debouncedPublish('place:search', { query, filters: {}, results: 0 });
 * };
 * 
 * // Conditional listening
 * useConditionalEventListener(
 *   'connection:request:received',
 *   handleNewRequest,
 *   isLoggedIn
 * );
 * 
 * // Event-driven effects
 * useEventEffect('navigation:page:change', ({ to }) => {
 *   analytics.track('page_view', { page: to });
 * });
 */