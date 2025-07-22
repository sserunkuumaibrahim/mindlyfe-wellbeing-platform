import { useState, useEffect, useCallback } from 'react';
import { useAnalytics } from './useAnalytics';

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