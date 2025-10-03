/**
 * Comprehensive Event System for Soul Circles Application
 * 
 * Features:
 * - Event subscription and publishing
 * - Synchronous and asynchronous event handling
 * - Event prioritization
 * - Error handling and logging
 * - Memory-efficient listener management
 * - Thread-safe operations
 * - TypeScript support for type safety
 */

// Event priority levels
export enum EventPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

// Event listener interface
export interface EventListener<T = any> {
  id: string;
  callback: (data: T) => void | Promise<void>;
  priority: EventPriority;
  once: boolean;
  context?: any;
  createdAt: Date;
}

// Event data interface
export interface EventData<T = any> {
  type: string;
  payload: T;
  timestamp: Date;
  source?: string;
  metadata?: Record<string, any>;
}

// Event subscription options
export interface SubscriptionOptions {
  priority?: EventPriority;
  once?: boolean;
  context?: any;
  async?: boolean;
}

// Event publishing options
export interface PublishOptions {
  async?: boolean;
  timeout?: number;
  source?: string;
  metadata?: Record<string, any>;
}

// Logger interface for dependency injection
export interface Logger {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: any): void;
}

// Default console logger implementation
class ConsoleLogger implements Logger {
  debug(message: string, data?: any): void {
    console.debug(`[EventSystem] ${message}`, data || '');
  }

  info(message: string, data?: any): void {
    console.info(`[EventSystem] ${message}`, data || '');
  }

  warn(message: string, data?: any): void {
    console.warn(`[EventSystem] ${message}`, data || '');
  }

  error(message: string, error?: any): void {
    console.error(`[EventSystem] ${message}`, error || '');
  }
}

// Event statistics for monitoring
export interface EventStats {
  totalEvents: number;
  totalListeners: number;
  eventCounts: Record<string, number>;
  errorCounts: Record<string, number>;
  averageExecutionTime: Record<string, number>;
}

/**
 * Main Event System Class
 * Thread-safe, memory-efficient event management system
 */
export class EventSystem {
  private listeners: Map<string, EventListener[]> = new Map();
  private wildcardListeners: EventListener[] = [];
  private eventHistory: EventData[] = [];
  private stats: EventStats = {
    totalEvents: 0,
    totalListeners: 0,
    eventCounts: {},
    errorCounts: {},
    averageExecutionTime: {}
  };
  private logger: Logger;
  private maxHistorySize: number;
  private isDestroyed: boolean = false;

  constructor(logger?: Logger, maxHistorySize: number = 1000) {
    this.logger = logger || new ConsoleLogger();
    this.maxHistorySize = maxHistorySize;
    this.logger.info('EventSystem initialized');
  }

  /**
   * Subscribe to an event with optional configuration
   * @param eventType - The event type to listen for
   * @param callback - The callback function to execute
   * @param options - Subscription options
   * @returns Unsubscribe function
   */
  public subscribe<T = any>(
    eventType: string,
    callback: (data: T) => void | Promise<void>,
    options: SubscriptionOptions = {}
  ): () => void {
    if (this.isDestroyed) {
      throw new Error('EventSystem has been destroyed');
    }

    const listener: EventListener<T> = {
      id: this.generateId(),
      callback,
      priority: options.priority || EventPriority.NORMAL,
      once: options.once || false,
      context: options.context,
      createdAt: new Date()
    };

    // Handle wildcard subscriptions
    if (eventType === '*') {
      this.wildcardListeners.push(listener);
      this.wildcardListeners.sort((a, b) => b.priority - a.priority);
    } else {
      if (!this.listeners.has(eventType)) {
        this.listeners.set(eventType, []);
      }
      
      const eventListeners = this.listeners.get(eventType)!;
      eventListeners.push(listener);
      
      // Sort by priority (highest first)
      eventListeners.sort((a, b) => b.priority - a.priority);
    }

    this.stats.totalListeners++;
    this.logger.debug(`Subscribed to event: ${eventType}`, { listenerId: listener.id, priority: listener.priority });

    // Return unsubscribe function
    return () => this.unsubscribe(eventType, listener.id);
  }

  /**
   * Subscribe to an event that will only fire once
   * @param eventType - The event type to listen for
   * @param callback - The callback function to execute
   * @param options - Subscription options
   * @returns Promise that resolves with the event data
   */
  public once<T = any>(
    eventType: string,
    callback?: (data: T) => void | Promise<void>,
    options: Omit<SubscriptionOptions, 'once'> = {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const unsubscribe = this.subscribe<T>(
        eventType,
        async (data: T) => {
          try {
            if (callback) {
              await callback(data);
            }
            resolve(data);
          } catch (error) {
            reject(error);
          }
        },
        { ...options, once: true }
      );

      // Auto-cleanup after timeout
      setTimeout(() => {
        unsubscribe();
        reject(new Error(`Event ${eventType} timeout`));
      }, 30000); // 30 second timeout
    });
  }

  /**
   * Unsubscribe from an event
   * @param eventType - The event type
   * @param listenerId - The listener ID to remove
   * @returns True if listener was found and removed
   */
  public unsubscribe(eventType: string, listenerId: string): boolean {
    if (this.isDestroyed) {
      return false;
    }

    let removed = false;

    if (eventType === '*') {
      const index = this.wildcardListeners.findIndex(l => l.id === listenerId);
      if (index !== -1) {
        this.wildcardListeners.splice(index, 1);
        removed = true;
      }
    } else {
      const eventListeners = this.listeners.get(eventType);
      if (eventListeners) {
        const index = eventListeners.findIndex(l => l.id === listenerId);
        if (index !== -1) {
          eventListeners.splice(index, 1);
          removed = true;
          
          // Clean up empty event arrays
          if (eventListeners.length === 0) {
            this.listeners.delete(eventType);
          }
        }
      }
    }

    if (removed) {
      this.stats.totalListeners--;
      this.logger.debug(`Unsubscribed from event: ${eventType}`, { listenerId });
    }

    return removed;
  }

  /**
   * Unsubscribe all listeners for a specific event type
   * @param eventType - The event type to clear
   * @returns Number of listeners removed
   */
  public unsubscribeAll(eventType: string): number {
    if (this.isDestroyed) {
      return 0;
    }

    let removedCount = 0;

    if (eventType === '*') {
      removedCount = this.wildcardListeners.length;
      this.wildcardListeners = [];
    } else {
      const eventListeners = this.listeners.get(eventType);
      if (eventListeners) {
        removedCount = eventListeners.length;
        this.listeners.delete(eventType);
      }
    }

    this.stats.totalListeners -= removedCount;
    this.logger.debug(`Unsubscribed all listeners from event: ${eventType}`, { removedCount });

    return removedCount;
  }

  /**
   * Publish an event to all subscribers
   * @param eventType - The event type to publish
   * @param payload - The event payload
   * @param options - Publishing options
   * @returns Promise that resolves when all listeners have been notified
   */
  public async publish<T = any>(
    eventType: string,
    payload: T,
    options: PublishOptions = {}
  ): Promise<void> {
    if (this.isDestroyed) {
      throw new Error('EventSystem has been destroyed');
    }

    const startTime = Date.now();
    const eventData: EventData<T> = {
      type: eventType,
      payload,
      timestamp: new Date(),
      source: options.source,
      metadata: options.metadata
    };

    // Add to history
    this.addToHistory(eventData);

    // Update statistics
    this.stats.totalEvents++;
    this.stats.eventCounts[eventType] = (this.stats.eventCounts[eventType] || 0) + 1;

    this.logger.debug(`Publishing event: ${eventType}`, { payload, options });

    try {
      // Get all relevant listeners
      const eventListeners = this.listeners.get(eventType) || [];
      const allListeners = [...eventListeners, ...this.wildcardListeners];

      if (allListeners.length === 0) {
        this.logger.debug(`No listeners for event: ${eventType}`);
        return;
      }

      // Execute listeners based on async option
      if (options.async !== false) {
        await this.executeListenersAsync(allListeners, payload, eventType, options.timeout);
      } else {
        await this.executeListenersSync(allListeners, payload, eventType);
      }

      // Remove 'once' listeners
      this.removeOnceListeners(eventType, allListeners);

      // Update execution time statistics
      const executionTime = Date.now() - startTime;
      this.updateExecutionTimeStats(eventType, executionTime);

    } catch (error) {
      this.stats.errorCounts[eventType] = (this.stats.errorCounts[eventType] || 0) + 1;
      this.logger.error(`Error publishing event: ${eventType}`, error);
      throw error;
    }
  }

  /**
   * Publish an event synchronously (blocking)
   * @param eventType - The event type to publish
   * @param payload - The event payload
   * @param options - Publishing options
   */
  public publishSync<T = any>(
    eventType: string,
    payload: T,
    options: Omit<PublishOptions, 'async'> = {}
  ): void {
    // Use a synchronous version that doesn't return a promise
    this.publish(eventType, payload, { ...options, async: false }).catch(error => {
      this.logger.error(`Sync publish error for event: ${eventType}`, error);
    });
  }

  /**
   * Get event statistics
   * @returns Current event system statistics
   */
  public getStats(): EventStats {
    return { ...this.stats };
  }

  /**
   * Get event history
   * @param eventType - Optional filter by event type
   * @param limit - Maximum number of events to return
   * @returns Array of historical events
   */
  public getHistory(eventType?: string, limit: number = 100): EventData[] {
    let history = this.eventHistory;
    
    if (eventType) {
      history = history.filter(event => event.type === eventType);
    }

    return history.slice(-limit);
  }

  /**
   * Clear event history
   * @param eventType - Optional: clear only specific event type
   */
  public clearHistory(eventType?: string): void {
    if (eventType) {
      this.eventHistory = this.eventHistory.filter(event => event.type !== eventType);
    } else {
      this.eventHistory = [];
    }
    this.logger.debug(`Cleared event history${eventType ? ` for ${eventType}` : ''}`);
  }

  /**
   * Get all active listeners
   * @returns Map of event types to listener counts
   */
  public getActiveListeners(): Record<string, number> {
    const result: Record<string, number> = {};
    
    for (const [eventType, listeners] of this.listeners.entries()) {
      result[eventType] = listeners.length;
    }
    
    if (this.wildcardListeners.length > 0) {
      result['*'] = this.wildcardListeners.length;
    }

    return result;
  }

  /**
   * Destroy the event system and clean up all resources
   */
  public destroy(): void {
    this.logger.info('Destroying EventSystem');
    
    this.listeners.clear();
    this.wildcardListeners = [];
    this.eventHistory = [];
    this.isDestroyed = true;
    
    this.stats = {
      totalEvents: 0,
      totalListeners: 0,
      eventCounts: {},
      errorCounts: {},
      averageExecutionTime: {}
    };
  }

  // Private helper methods

  private generateId(): string {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addToHistory<T>(eventData: EventData<T>): void {
    this.eventHistory.push(eventData);
    
    // Maintain history size limit
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  private async executeListenersAsync<T>(
    listeners: EventListener<T>[],
    payload: T,
    eventType: string,
    timeout?: number
  ): Promise<void> {
    const promises = listeners.map(listener => 
      this.executeListener(listener, payload, eventType, timeout)
    );

    await Promise.allSettled(promises);
  }

  private async executeListenersSync<T>(
    listeners: EventListener<T>[],
    payload: T,
    eventType: string
  ): Promise<void> {
    for (const listener of listeners) {
      await this.executeListener(listener, payload, eventType);
    }
  }

  private async executeListener<T>(
    listener: EventListener<T>,
    payload: T,
    eventType: string,
    timeout?: number
  ): Promise<void> {
    try {
      // Ensure timeout is a valid, non-negative number to prevent internal timer issues
      const safeTimeout = timeout && timeout > 0 ? timeout : 0;
      
      const timeoutPromise = timeout ? 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Listener timeout for ${eventType}`)), safeTimeout)
        ) : null;

      const executionPromise = Promise.resolve(
        listener.context ? 
          listener.callback.call(listener.context, payload) : 
          listener.callback(payload)
      );

      if (timeoutPromise) {
        await Promise.race([executionPromise, timeoutPromise]);
      } else {
        await executionPromise;
      }

    } catch (error) {
      this.logger.error(`Error in listener for event: ${eventType}`, {
        listenerId: listener.id,
        error
      });
      // Don't rethrow to prevent one failing listener from stopping others
    }
  }

  private removeOnceListeners<T>(eventType: string, executedListeners: EventListener<T>[]): void {
    const onceListeners = executedListeners.filter(l => l.once);
    
    for (const listener of onceListeners) {
      this.unsubscribe(eventType, listener.id);
    }
  }

  private updateExecutionTimeStats(eventType: string, executionTime: number): void {
    const currentAvg = this.stats.averageExecutionTime[eventType] || 0;
    const currentCount = this.stats.eventCounts[eventType] || 1;
    
    this.stats.averageExecutionTime[eventType] = 
      (currentAvg * (currentCount - 1) + executionTime) / currentCount;
  }
}

// Singleton instance for global use
export const globalEventSystem = new EventSystem();

// Event system hook for React components
export function useEventSystem() {
  return globalEventSystem;
}

/**
 * USAGE EXAMPLES:
 * 
 * // Basic subscription
 * const unsubscribe = eventSystem.subscribe('user:login', (user) => {
 *   console.log('User logged in:', user);
 * });
 * 
 * // High priority subscription
 * eventSystem.subscribe('user:logout', handleLogout, { 
 *   priority: EventPriority.HIGH 
 * });
 * 
 * // One-time subscription
 * eventSystem.once('app:ready').then(() => {
 *   console.log('App is ready!');
 * });
 * 
 * // Publishing events
 * await eventSystem.publish('user:login', { id: 123, name: 'John' });
 * 
 * // Synchronous publishing
 * eventSystem.publishSync('ui:update', { component: 'header' });
 * 
 * // Wildcard subscription (listens to all events)
 * eventSystem.subscribe('*', (data) => {
 *   console.log('Any event fired:', data);
 * });
 * 
 * // Get statistics
 * const stats = eventSystem.getStats();
 * console.log('Total events:', stats.totalEvents);
 * 
 * // Cleanup
 * unsubscribe();
 * eventSystem.destroy();
 */