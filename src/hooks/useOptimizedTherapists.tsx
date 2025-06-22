
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

      if (!data || data.length === 0) {
        // Show sample data for demo purposes
        setTherapists([
          {
            id: 'sample-1',
            first_name: 'Dr. Sarah',
            last_name: 'Johnson',
            specializations: ['Anxiety', 'Depression', 'Trauma'],
            languages_spoken: ['English', 'Spanish'],
            years_experience: 8,
            bio: 'Experienced therapist specializing in anxiety and depression management.',
            license_number: 'LIC-001',
            license_body: 'Uganda Psychology Board'
          },
          {
            id: 'sample-2',
            first_name: 'Dr. Michael',
            last_name: 'Smith',
            specializations: ['Couples Therapy', 'Family Therapy'],
            languages_spoken: ['English'],
            years_experience: 12,
            bio: 'Specializing in relationship and family counseling.',
            license_number: 'LIC-002',
            license_body: 'Uganda Psychology Board'
          }
        ]);
        return;
      }

      const formattedTherapists = data.map(therapist => ({
        id: therapist.id,
        first_name: therapist.first_name,
        last_name: therapist.last_name,
        profile_photo_url: therapist.profile_photo_url,
        specializations: therapist.therapist_profiles?.specializations || ['General'],
        languages_spoken: therapist.therapist_profiles?.languages_spoken || ['English'],
        years_experience: therapist.therapist_profiles?.years_experience || 0,
        bio: therapist.therapist_profiles?.bio,
        license_number: therapist.therapist_profiles?.license_number || 'N/A',
        license_body: therapist.therapist_profiles?.license_body || 'N/A'
      }));

      setTherapists(formattedTherapists);
    } catch (error) {
      console.error('Error fetching therapists:', error);
      setError('Failed to load therapists');
      // Fallback to sample data
      setTherapists([
        {
          id: 'sample-1',
          first_name: 'Dr. Sarah',
          last_name: 'Johnson',
          specializations: ['Anxiety', 'Depression'],
          languages_spoken: ['English'],
          years_experience: 8,
          bio: 'Experienced therapist',
          license_number: 'LIC-001',
          license_body: 'Uganda Psychology Board'
        }
      ]);
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
