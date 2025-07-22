import { useCallback } from 'react';
import { useAnalytics } from './useAnalytics';

// User journey tracking hook
export function useUserJourney() {
  const { trackUserAction } = useAnalytics();
  
  const trackJourneyStep = useCallback((step: string, metadata?: Record<string, unknown>) => {
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