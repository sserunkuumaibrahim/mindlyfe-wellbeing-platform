import { useCallback } from 'react';
import { useAnalytics } from './useAnalytics';

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