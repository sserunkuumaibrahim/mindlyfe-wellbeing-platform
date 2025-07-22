import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from './useAnalytics';

// Page tracking hook - automatically tracks page views
export function usePageTracking(pageName?: string) {
  const location = useLocation();
  const { trackPageView } = useAnalytics();
  
  useEffect(() => {
    const page = pageName || location.pathname;
    trackPageView(page);
  }, [location.pathname, pageName, trackPageView]);
}