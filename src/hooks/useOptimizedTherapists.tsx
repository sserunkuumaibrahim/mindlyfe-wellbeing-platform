import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/services/apiClient';

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

      // Use the API client to fetch therapists
      const data = await apiRequest<OptimizedTherapist[]>('/therapists');
      setTherapists(data || []);
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
