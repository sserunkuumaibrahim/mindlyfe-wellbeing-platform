import { useCallback } from 'react';
import { analytics } from '@/services/analytics/analyticsService';

// Main analytics hook
export function useAnalytics() {
  const trackEvent = useCallback((eventName: string, properties?: Record<string, unknown>) => {
    analytics.track(eventName, properties);
  }, []);
  
  const trackPageView = useCallback((page: string) => {
    analytics.trackPageView(page);
  }, []);
  
  const trackUserAction = useCallback((action: string, context?: Record<string, unknown>) => {
    analytics.trackUserAction(action, context);
  }, []);
  
  const trackError = useCallback((error: Error, context: string, additionalData?: Record<string, unknown>) => {
    analytics.trackError(error, context, additionalData);
  }, []);
  
  const trackConversion = useCallback((conversionType: string, value?: number, metadata?: Record<string, unknown>) => {
    analytics.trackConversion(conversionType, value, metadata);
  }, []);
  
  const trackFeatureUsage = useCallback((feature: string, action: string, metadata?: Record<string, unknown>) => {
    analytics.trackFeatureUsage(feature, action, metadata);
  }, []);
  
  const trackSearch = useCallback((query: string, results: number, filters?: Record<string, unknown>) => {
    analytics.trackSearch(query, results, filters);
  }, []);
  
  const trackBooking = useCallback((therapistId: string, sessionType: string, metadata?: Record<string, unknown>) => {
    analytics.trackBooking(therapistId, sessionType, metadata);
  }, []);
  
  const trackBookingCompleted = useCallback((bookingId: string, therapistId: string, sessionType: string, amount?: number) => {
    analytics.trackBookingCompleted(bookingId, therapistId, sessionType, amount);
  }, []);
  
  const trackUserRegistration = useCallback((userType: string, method?: string) => {
    analytics.trackUserRegistration(userType, method);
  }, []);
  
  const trackUserLogin = useCallback((method?: string) => {
    analytics.trackUserLogin(method);
  }, []);
  
  const trackProfileUpdate = useCallback((section: string, changes: string[]) => {
    analytics.trackProfileUpdate(section, changes);
  }, []);
  
  const trackMessageSent = useCallback((recipientType: string, messageType?: string) => {
    analytics.trackMessageSent(recipientType, messageType);
  }, []);
  
  const trackExperiment = useCallback((experimentName: string, variant: string, metadata?: Record<string, unknown>) => {
    analytics.trackExperiment(experimentName, variant, metadata);
  }, []);
  
  const trackExperimentConversion = useCallback((experimentName: string, variant: string, conversionType: string) => {
    analytics.trackExperimentConversion(experimentName, variant, conversionType);
  }, []);
  
  return {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackError,
    trackConversion,
    trackFeatureUsage,
    trackSearch,
    trackBooking,
    trackBookingCompleted,
    trackUserRegistration,
    trackUserLogin,
    trackProfileUpdate,
    trackMessageSent,
    trackExperiment,
    trackExperimentConversion
  };
}