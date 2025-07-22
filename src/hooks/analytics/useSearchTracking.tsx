import { useCallback } from 'react';
import { useAnalytics } from './useAnalytics';

// Search tracking hook
export function useSearchTracking() {
  const { trackSearch, trackUserAction } = useAnalytics();
  
  const trackSearchQuery = useCallback((query: string, results: number, filters?: Record<string, unknown>) => {
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
  
  const trackSearchNoResults = useCallback((query: string, filters?: Record<string, unknown>) => {
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