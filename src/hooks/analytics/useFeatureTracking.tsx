import { useEffect, useCallback } from 'react';
import { useAnalytics } from './useAnalytics';

// Feature usage tracking hook
export function useFeatureTracking(featureName: string) {
  const { trackFeatureUsage } = useAnalytics();
  
  const trackFeatureAction = useCallback((action: string, metadata?: Record<string, unknown>) => {
    trackFeatureUsage(featureName, action, metadata);
  }, [featureName, trackFeatureUsage]);
  
  const trackFeatureView = useCallback((metadata?: Record<string, unknown>) => {
    trackFeatureUsage(featureName, 'view', metadata);
  }, [featureName, trackFeatureUsage]);
  
  const trackFeatureInteraction = useCallback((interactionType: string, metadata?: Record<string, unknown>) => {
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