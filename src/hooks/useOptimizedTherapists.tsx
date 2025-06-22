
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OptimizedTherapist {
  id: string;
  first_name: string;
  last_name: string;
  profile_photo_url?: string;
  specializations: string[];
  languages_spoken: string[];
  years_experience: number;
  bio?: string;
  license_number: string;
  license_body: string;
}

export const useOptimizedTherapists = () => {
  const [therapists, setTherapists] = useState<OptimizedTherapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTherapists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          profile_photo_url,
          therapist_profiles!inner(
            specializations,
            languages_spoken,
            years_experience,
            bio,
            license_number,
            license_body
          )
        `)
        .eq('role', 'therapist')
        .eq('is_active', true)
        .limit(10);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const formattedTherapists = (data || []).map(therapist => ({
        id: therapist.id,
        first_name: therapist.first_name,
        last_name: therapist.last_name,
        profile_photo_url: therapist.profile_photo_url,
        specializations: therapist.therapist_profiles?.specializations || [],
        languages_spoken: therapist.therapist_profiles?.languages_spoken || [],
        years_experience: therapist.therapist_profiles?.years_experience || 0,
        bio: therapist.therapist_profiles?.bio,
        license_number: therapist.therapist_profiles?.license_number || '',
        license_body: therapist.therapist_profiles?.license_body || ''
      }));

      setTherapists(formattedTherapists);
    } catch (error) {
      console.error('Error fetching therapists:', error);
      setError('Failed to load therapists');
      setTherapists([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTherapists();
  }, [fetchTherapists]);

  return {
    therapists,
    loading,
    error,
    refetch: fetchTherapists,
  };
};
