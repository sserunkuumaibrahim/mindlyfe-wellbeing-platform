import { useCallback } from 'react';
import { useAnalytics } from './useAnalytics';

// Performance tracking hook
export const usePerformanceTracking = () => {
  const analytics = useAnalytics();
  
  const trackPerformance = useCallback((operationName: string, operation: () => Promise<unknown>): Promise<unknown> => {
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
        analytics.trackError(new Error(`Performance error in ${operationName}`), 'performance_error', {
          operation: operationName,
          duration,
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      });
  }, [analytics]);
  
  return { trackPerformance };
};