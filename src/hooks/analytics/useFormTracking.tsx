import { useEffect, useCallback, useRef } from 'react';
import { useAnalytics } from './useAnalytics';

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