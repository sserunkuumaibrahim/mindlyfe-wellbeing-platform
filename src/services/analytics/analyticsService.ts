import { supabase } from '@/integrations/supabase/client';

// Types for analytics events
export interface AnalyticsEvent {
  id?: string;
  event_name: string;
  user_id?: string;
  session_id: string;
  properties: Record<string, unknown>;
  timestamp: string;
  page_url?: string;
  created_at?: string;
}

export interface UserMetrics {
  userId: string;
  sessionCount: number;
  totalTimeSpent: number;
  lastActive: string;
  favoriteFeatures: string[];
  conversionEvents: string[];
}

export interface BusinessMetrics {
  registrationRate: number;
  bookingConversionRate: number;
  userRetentionRate: number;
  averageSessionDuration: number;
  featureAdoptionRates: Record<string, number>;
}

class AnalyticsService {
  private sessionId: string;
  private sessionStartTime: number;
  private pageStartTime: number;
  private currentPage: string;
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.pageStartTime = Date.now();
    this.currentPage = window.location.pathname;
    
    // Start auto-flush interval (every 30 seconds)
    this.startAutoFlush();
    
    // Track page visibility changes
    this.setupVisibilityTracking();
    
    // Track page navigation
    this.setupNavigationTracking();
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private startAutoFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 30000); // Flush every 30 seconds
  }
  
  private setupVisibilityTracking(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('page_hidden', { page: this.currentPage });
        this.flushEvents(); // Flush immediately when page becomes hidden
      } else {
        this.track('page_visible', { page: this.currentPage });
      }
    });
    
    // Track when user leaves the page
    window.addEventListener('beforeunload', () => {
      this.trackPageDuration();
      this.flushEvents();
    });
  }
  
  private setupNavigationTracking(): void {
    // Track browser navigation
    window.addEventListener('popstate', () => {
      this.handlePageChange();
    });
    
    // Override pushState and replaceState to track SPA navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(() => analytics.handlePageChange(), 0);
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(() => analytics.handlePageChange(), 0);
    };
  }
  
  private handlePageChange(): void {
    const newPage = window.location.pathname;
    if (newPage !== this.currentPage) {
      // Track time spent on previous page
      this.trackPageDuration();
      
      // Update current page and start tracking new page
      this.currentPage = newPage;
      this.pageStartTime = Date.now();
      this.trackPageView(newPage);
    }
  }
  
  private trackPageDuration(): void {
    const duration = Date.now() - this.pageStartTime;
    this.track('page_duration', {
      page: this.currentPage,
      duration_ms: duration,
      duration_seconds: Math.round(duration / 1000)
    });
  }
  
  // Core tracking method
  async track(eventName: string, properties: Record<string, any> = {}): Promise<void> {
    try {
      const user = await supabase.auth.getUser();
      
      const event: AnalyticsEvent = {
        event_name: eventName,
        user_id: user.data.user?.id,
        session_id: this.sessionId,
        properties: {
          ...properties,
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          viewport_size: `${window.innerWidth}x${window.innerHeight}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          referrer: document.referrer
        },
        timestamp: new Date().toISOString(),
        page_url: window.location.href
      };
      
      // Add to queue for batch processing
      this.eventQueue.push(event);
      
      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics Event:', eventName, properties);
      }
      
      // Flush immediately for critical events
      if (this.isCriticalEvent(eventName)) {
        await this.flushEvents();
      }
      
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }
  
  private isCriticalEvent(eventName: string): boolean {
    const criticalEvents = [
      'user_registered',
      'user_login',
      'booking_completed',
      'payment_completed',
      'error_occurred',
      'session_ended'
    ];
    return criticalEvents.includes(eventName);
  }
  
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;
    
    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];
    
    try {
      // Use raw SQL query since analytics_events table may not be in types
      const { error } = await supabase.rpc('insert_analytics_event', {
        events: eventsToFlush
      });
      
      if (error) {
        console.error('Failed to flush analytics events:', error);
        // Re-add events to queue for retry
        this.eventQueue.unshift(...eventsToFlush);
      }
    } catch (error) {
      console.error('Error flushing analytics events:', error);
      // Re-add events to queue for retry
      this.eventQueue.unshift(...eventsToFlush);
    }
  }
  
  // Specific tracking methods
  trackPageView(page: string): void {
    this.track('page_view', { 
      page,
      page_title: document.title,
      session_duration: Date.now() - this.sessionStartTime
    });
  }
  
  trackUserAction(action: string, context: Record<string, any> = {}): void {
    this.track('user_action', { 
      action, 
      ...context,
      session_duration: Date.now() - this.sessionStartTime
    });
  }
  
  trackError(error: Error, context: string, additionalData: Record<string, any> = {}): void {
    this.track('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      context,
      ...additionalData
    });
  }
  
  trackConversion(conversionType: string, value?: number, metadata: Record<string, any> = {}): void {
    this.track('conversion', {
      conversion_type: conversionType,
      value,
      ...metadata
    });
  }
  
  trackFeatureUsage(feature: string, action: string, metadata: Record<string, any> = {}): void {
    this.track('feature_usage', {
      feature,
      action,
      ...metadata
    });
  }
  
  trackSearch(query: string, results: number, filters: Record<string, any> = {}): void {
    this.track('search', {
      query,
      results_count: results,
      filters
    });
  }
  
  trackBooking(therapistId: string, sessionType: string, metadata: Record<string, any> = {}): void {
    this.track('booking_attempt', {
      therapist_id: therapistId,
      session_type: sessionType,
      ...metadata
    });
  }
  
  trackBookingCompleted(bookingId: string, therapistId: string, sessionType: string, amount?: number): void {
    this.track('booking_completed', {
      booking_id: bookingId,
      therapist_id: therapistId,
      session_type: sessionType,
      amount
    });
  }
  
  trackUserRegistration(userType: string, method: string = 'email'): void {
    this.track('user_registered', {
      user_type: userType,
      registration_method: method,
      session_duration_at_registration: Date.now() - this.sessionStartTime
    });
  }
  
  trackUserLogin(method: string = 'email'): void {
    this.track('user_login', {
      login_method: method
    });
  }
  
  trackProfileUpdate(section: string, changes: string[]): void {
    this.track('profile_updated', {
      section,
      changes
    });
  }
  
  trackMessageSent(recipientType: string, messageType: string = 'text'): void {
    this.track('message_sent', {
      recipient_type: recipientType,
      message_type: messageType
    });
  }
  
  // Business metrics methods
  async getBusinessMetrics(startDate: Date, endDate: Date): Promise<BusinessMetrics> {
    try {
      // Use raw SQL query for analytics_events
      const { data: events, error } = await supabase.rpc('get_analytics_events', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
      
      if (error) throw error;
      
      const eventsArray = Array.isArray(events) ? events : [];
      return this.calculateBusinessMetrics(eventsArray);
    } catch (error) {
      console.error('Error fetching business metrics:', error);
      throw error;
    }
  }
  
  private calculateBusinessMetrics(events: any[]): BusinessMetrics {
    const registrations = events.filter(e => e.event_name === 'user_registered');
    const bookingAttempts = events.filter(e => e.event_name === 'booking_attempt');
    const bookingCompletions = events.filter(e => e.event_name === 'booking_completed');
    const sessions = [...new Set(events.map(e => e.session_id))];
    
    // Calculate session durations
    const sessionDurations = this.calculateSessionDurations(events);
    const avgSessionDuration = sessionDurations.length > 0 
      ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length 
      : 0;
    
    // Calculate feature adoption rates
    const featureUsageEvents = events.filter(e => e.event_name === 'feature_usage');
    const featureAdoptionRates = this.calculateFeatureAdoption(featureUsageEvents, sessions.length);
    
    return {
      registrationRate: this.calculateRegistrationRate(events),
      bookingConversionRate: bookingAttempts.length > 0 
        ? (bookingCompletions.length / bookingAttempts.length) * 100 
        : 0,
      userRetentionRate: this.calculateRetentionRate(events),
      averageSessionDuration: avgSessionDuration,
      featureAdoptionRates
    };
  }
  
  private calculateSessionDurations(events: any[]): number[] {
    const sessionEvents = events.reduce((acc, event) => {
      const sessionId = event.session_id;
      if (!acc[sessionId]) {
        acc[sessionId] = [];
      }
      acc[sessionId].push(new Date(event.timestamp).getTime());
      return acc;
    }, {} as Record<string, number[]>);
    
    return Object.values(sessionEvents)
      .map(timestamps => {
        if (timestamps.length < 2) return 0;
        const sorted = timestamps.sort((a, b) => a - b);
        return (sorted[sorted.length - 1] - sorted[0]) / 1000 / 60; // Duration in minutes
      })
      .filter(duration => duration > 0);
  }
  
  private calculateRegistrationRate(events: any[]): number {
    const pageViews = events.filter(e => e.event_name === 'page_view');
    const registrations = events.filter(e => e.event_name === 'user_registered');
    const uniqueVisitors = new Set(pageViews.map(e => e.session_id)).size;
    
    return uniqueVisitors > 0 ? (registrations.length / uniqueVisitors) * 100 : 0;
  }
  
  private calculateRetentionRate(events: any[]): number {
    // Simple retention calculation - users who had activity in multiple days
    const userDays = events.reduce((acc, event) => {
      if (!event.user_id) return acc;
      
      const day = new Date(event.timestamp).toDateString();
      if (!acc[event.user_id]) {
        acc[event.user_id] = new Set();
      }
      acc[event.user_id].add(day);
      return acc;
    }, {} as Record<string, Set<string>>);
    
    const totalUsers = Object.keys(userDays).length;
    const retainedUsers = Object.values(userDays).filter(days => days.size > 1).length;
    
    return totalUsers > 0 ? (retainedUsers / totalUsers) * 100 : 0;
  }
  
  private calculateFeatureAdoption(featureEvents: any[], totalSessions: number): Record<string, number> {
    const featureUsage = featureEvents.reduce((acc, event) => {
      const feature = event.properties?.feature;
      if (feature) {
        acc[feature] = (acc[feature] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(featureUsage).reduce((acc, [feature, usage]) => {
      acc[feature] = totalSessions > 0 ? (usage / totalSessions) * 100 : 0;
      return acc;
    }, {} as Record<string, number>);
  }
  
  // A/B Testing support
  trackExperiment(experimentName: string, variant: string, metadata: Record<string, any> = {}): void {
    this.track('experiment_exposure', {
      experiment_name: experimentName,
      variant,
      ...metadata
    });
  }
  
  trackExperimentConversion(experimentName: string, variant: string, conversionType: string): void {
    this.track('experiment_conversion', {
      experiment_name: experimentName,
      variant,
      conversion_type: conversionType
    });
  }
  
  // Cleanup method
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushEvents(); // Final flush
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  analytics.destroy();
});