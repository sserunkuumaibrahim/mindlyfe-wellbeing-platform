
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/services/apiClient';
import { User } from '@/types/user';

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Fetching profile for user:', user.id);
      
      const data = await apiClient.user.profile();

      setProfile(data);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching profile:', err);
      setError('Failed to fetch profile. Please try again.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user, fetchProfile]);

  const updateProfile = async (updatedFields: Partial<User>) => {
    if (!profile) return;

    try {
      const updatedProfile = await apiClient.user.updateProfile(updatedFields);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      return null;
    }
  };

  return { profile, loading, error, fetchProfile, updateProfile };
};
