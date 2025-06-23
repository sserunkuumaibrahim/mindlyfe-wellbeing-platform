import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/services/analytics/analyticsService';

// Main analytics hook
export function useAnalytics() {
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    analytics.track(eventName, properties);
  }, []);
  
  const trackPageView = useCallback((page: string) => {
    analytics.trackPageView(page);
  }, []);
  
  const trackUserAction = useCallback((action: string, context?: Record<string, any>) => {
    analytics.trackUserAction(action, context);
  }, []);
  
  const trackError = useCallback((error: Error, context: string, additionalData?: Record<string, any>) => {
    analytics.trackError(error, context, additionalData);
  }, []);
  
  const trackConversion = useCallback((conversionType: string, value?: number, metadata?: Record<string, any>) => {
    analytics.trackConversion(conversionType, value, metadata);
  }, []);
  
  const trackFeatureUsage = useCallback((feature: string, action: string, metadata?: Record<string, any>) => {
    analytics.trackFeatureUsage(feature, action, metadata);
  }, []);
  
  const trackSearch = useCallback((query: string, results: number, filters?: Record<string, any>) => {
    analytics.trackSearch(query, results, filters);
  }, []);
  
  const trackBooking = useCallback((therapistId: string, sessionType: string, metadata?: Record<string, any>) => {
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
  
  const trackExperiment = useCallback((experimentName: string, variant: string, metadata?: Record<string, any>) => {
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

// Page tracking hook - automatically tracks page views
export function usePageTracking(pageName?: string) {
  const location = useLocation();
  const { trackPageView } = useAnalytics();
  
  useEffect(() => {
    const page = pageName || location.pathname;
    trackPageView(page);
  }, [location.pathname, pageName, trackPageView]);
}

// Feature usage tracking hook
export function useFeatureTracking(featureName: string) {
  const { trackFeatureUsage } = useAnalytics();
  
  const trackFeatureAction = useCallback((action: string, metadata?: Record<string, any>) => {
    trackFeatureUsage(featureName, action, metadata);
  }, [featureName, trackFeatureUsage]);
  
  const trackFeatureView = useCallback((metadata?: Record<string, any>) => {
    trackFeatureUsage(featureName, 'view', metadata);
  }, [featureName, trackFeatureUsage]);
  
  const trackFeatureInteraction = useCallback((interactionType: string, metadata?: Record<string, any>) => {
    trackFeatureUsage(featureName, `interaction_${interactionType}`, metadata);
  }, [featureName, trackFeatureUsage]);
  
  // Track feature view on mount
  useEffect(() => {
    trackFeatureView();
  }, [trackFeatureView]);
  
  return {
    trackFeatureAction,
    trackFeatureView,
    trackFeatureInteraction
  };
}

// Form tracking hook
export function useFormTracking(formName: string) {
  const { trackUserAction } = useAnalytics();
  const startTimeRef = useRef<number>(Date.now());
  
  const trackFormStart = useCallback(() => {
    startTimeRef.current = Date.now();
    trackUserAction('form_started', { form_name: formName });
  }, [formName, trackUserAction]);
  
  const trackFormFieldInteraction = useCallback((fieldName: string, action: string) => {
    trackUserAction('form_field_interaction', {
      form_name: formName,
      field_name: fieldName,
      action
    });
  }, [formName, trackUserAction]);
  
  const trackFormSubmit = useCallback((success: boolean, errors?: string[]) => {
    const timeSpent = Date.now() - startTimeRef.current;
    trackUserAction('form_submitted', {
      form_name: formName,
      success,
      errors,
      time_spent_ms: timeSpent,
      time_spent_seconds: Math.round(timeSpent / 1000)
    });
  }, [formName, trackUserAction]);
  
  const trackFormAbandonment = useCallback((lastField?: string) => {
    const timeSpent = Date.now() - startTimeRef.current;
    trackUserAction('form_abandoned', {
      form_name: formName,
      last_field: lastField,
      time_spent_ms: timeSpent,
      time_spent_seconds: Math.round(timeSpent / 1000)
    });
  }, [formName, trackUserAction]);
  
  // Track form start on mount
  useEffect(() => {
    trackFormStart();
    
    // Track form abandonment on unmount (if not submitted)
    return () => {
      // Only track abandonment if form was not submitted
      // This is a simple heuristic - you might want to make this more sophisticated
      const timeSpent = Date.now() - startTimeRef.current;
      if (timeSpent > 5000) { // Only if user spent more than 5 seconds
        trackFormAbandonment();
      }
    };
  }, [trackFormStart, trackFormAbandonment]);
  
  return {
    trackFormStart,
    trackFormFieldInteraction,
    trackFormSubmit,
    trackFormAbandonment
  };
}

// Search tracking hook
export function useSearchTracking() {
  const { trackSearch, trackUserAction } = useAnalytics();
  
  const trackSearchQuery = useCallback((query: string, results: number, filters?: Record<string, any>) => {
    trackSearch(query, results, filters);
  }, [trackSearch]);
  
  const trackSearchResultClick = useCallback((query: string, resultId: string, position: number) => {
    trackUserAction('search_result_clicked', {
      query,
      result_id: resultId,
      position
    });
  }, [trackUserAction]);
  
  const trackSearchFilterUsed = useCallback((filterType: string, filterValue: string, query?: string) => {
    trackUserAction('search_filter_used', {
      filter_type: filterType,
      filter_value: filterValue,
      query
    });
  }, [trackUserAction]);
  
  const trackSearchNoResults = useCallback((query: string, filters?: Record<string, any>) => {
    trackUserAction('search_no_results', {
      query,
      filters
    });
  }, [trackUserAction]);
  
  return {
    trackSearchQuery,
    trackSearchResultClick,
    trackSearchFilterUsed,
    trackSearchNoResults
  };
}

// Error tracking hook
export function useErrorTracking() {
  const { trackError } = useAnalytics();
  
  const trackApiError = useCallback((endpoint: string, error: Error, statusCode?: number) => {
    trackError(error, 'api_error', {
      endpoint,
      status_code: statusCode
    });
  }, [trackError]);
  
  const trackValidationError = useCallback((formName: string, fieldName: string, errorMessage: string) => {
    trackError(new Error(errorMessage), 'validation_error', {
      form_name: formName,
      field_name: fieldName
    });
  }, [trackError]);
  
  const trackJavaScriptError = useCallback((error: Error, componentName?: string) => {
    trackError(error, 'javascript_error', {
      component_name: componentName
    });
  }, [trackError]);
  
  return {
    trackApiError,
    trackValidationError,
    trackJavaScriptError
  };
}

// Performance tracking hook
export const usePerformanceTracking = () => {
  const analytics = useAnalytics();
  
  const trackPerformance = useCallback(<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    return operation()
      .then(result => {
        const duration = performance.now() - startTime;
        analytics.trackUserAction('performance_metric', {
          operation: operationName,
          duration,
          success: true
        });
        return result;
      })
      .catch(error => {
        const duration = performance.now() - startTime;
        analytics.trackError(`Performance error in ${operationName}`, {
          operation: operationName,
          duration,
          error: error.message
        });
        throw error;
      });
  }, [analytics]);
  
  return { trackPerformance };
};

// A/B Testing hook
export function useABTesting(experimentName: string, variants: string[]) {
  const { trackExperiment, trackExperimentConversion } = useAnalytics();
  const [variant, setVariant] = useState<string>('');
  
  useEffect(() => {
    // Simple random variant assignment
    // In production, you'd want to use a more sophisticated assignment strategy
    const assignedVariant = variants[Math.floor(Math.random() * variants.length)];
    setVariant(assignedVariant);
    
    // Track experiment exposure
    trackExperiment(experimentName, assignedVariant);
  }, [experimentName, variants, trackExperiment]);
  
  const trackConversion = useCallback((conversionType: string) => {
    if (variant) {
      trackExperimentConversion(experimentName, variant, conversionType);
    }
  }, [experimentName, variant, trackExperimentConversion]);
  
  return {
    variant,
    trackConversion
  };
}

// User journey tracking hook
export function useUserJourney() {
  const { trackUserAction } = useAnalytics();
  
  const trackJourneyStep = useCallback((step: string, metadata?: Record<string, any>) => {
    trackUserAction('journey_step', {
      step,
      ...metadata
    });
  }, [trackUserAction]);
  
  const trackJourneyCompletion = useCallback((journeyName: string, totalSteps: number, completedSteps: number) => {
    trackUserAction('journey_completed', {
      journey_name: journeyName,
      total_steps: totalSteps,
      completed_steps: completedSteps,
      completion_rate: (completedSteps / totalSteps) * 100
    });
  }, [trackUserAction]);
  
  const trackJourneyAbandonment = useCallback((journeyName: string, abandonedAtStep: string, totalSteps: number, completedSteps: number) => {
    trackUserAction('journey_abandoned', {
      journey_name: journeyName,
      abandoned_at_step: abandonedAtStep,
      total_steps: totalSteps,
      completed_steps: completedSteps,
      completion_rate: (completedSteps / totalSteps) * 100
    });
  }, [trackUserAction]);
  
  return {
    trackJourneyStep,
    trackJourneyCompletion,
    trackJourneyAbandonment
  };
}

// Import React for useState
import { useState } from 'react';