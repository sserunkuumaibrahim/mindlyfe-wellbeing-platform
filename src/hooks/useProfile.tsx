
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { User, IndividualProfile, TherapistProfile, OrganizationProfile } from '@/types/user';

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [roleProfile, setRoleProfile] = useState<IndividualProfile | TherapistProfile | OrganizationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setRoleProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Fetch main profile
        const { data: mainProfile, error: mainError } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_uid', user.id)
          .single();

        if (mainError) throw mainError;
        
        setProfile(mainProfile);

        // Fetch role-specific profile
        let roleData = null;
        if (mainProfile.role === 'individual') {
          const { data, error } = await supabase
            .from('individual_profiles')
            .select('*')
            .eq('id', mainProfile.id)
            .single();
          if (error && error.code !== 'PGRST116') throw error;
          roleData = data;
        } else if (mainProfile.role === 'therapist') {
          const { data, error } = await supabase
            .from('therapist_profiles')
            .select('*')
            .eq('id', mainProfile.id)
            .single();
          if (error && error.code !== 'PGRST116') throw error;
          roleData = data;
        } else if (mainProfile.role === 'org_admin') {
          const { data, error } = await supabase
            .from('organization_profiles')
            .select('*')
            .eq('id', mainProfile.id)
            .single();
          if (error && error.code !== 'PGRST116') throw error;
          roleData = data;
        }

        setRoleProfile(roleData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<User>) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  return {
    profile,
    roleProfile,
    loading,
    error,
    updateProfile,
  };
};
