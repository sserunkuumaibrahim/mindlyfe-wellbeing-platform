
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
        setError(null);
        
        console.log('Fetching profile for user:', user.id);
        
        // Fetch main profile with error handling
        const { data: mainProfile, error: mainError } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_uid', user.id)
          .single();

        if (mainError) {
          console.error('Error fetching main profile:', mainError);
          throw new Error(`Failed to fetch profile: ${mainError.message}`);
        }

        if (!mainProfile) {
          throw new Error('Profile not found');
        }
        
        // Convert string dates to Date objects for type compatibility
        const profileWithDates = {
          ...mainProfile,
          date_of_birth: mainProfile.date_of_birth ? new Date(mainProfile.date_of_birth) : null,
          created_at: new Date(mainProfile.created_at),
          updated_at: new Date(mainProfile.updated_at),
          last_login_at: mainProfile.last_login_at ? new Date(mainProfile.last_login_at) : null,
          locked_until: mainProfile.locked_until ? new Date(mainProfile.locked_until) : null,
          password_changed_at: new Date(mainProfile.password_changed_at),
        };
        
        setProfile(profileWithDates as User);

        // Fetch role-specific profile with error handling
        let roleData = null;
        
        try {
          if (mainProfile.role === 'individual') {
            const { data, error } = await supabase
              .from('individual_profiles')
              .select('*')
              .eq('id', mainProfile.id)
              .single();
            
            if (error && error.code !== 'PGRST116') {
              console.error('Error fetching individual profile:', error);
            } else {
              roleData = data;
            }
          } else if (mainProfile.role === 'therapist') {
            const { data, error } = await supabase
              .from('therapist_profiles')
              .select('*')
              .eq('id', mainProfile.id)
              .single();
            
            if (error && error.code !== 'PGRST116') {
              console.error('Error fetching therapist profile:', error);
            } else {
              roleData = data;
            }
          } else if (mainProfile.role === 'org_admin') {
            const { data, error } = await supabase
              .from('organization_profiles')
              .select('*')
              .eq('id', mainProfile.id)
              .single();
            
            if (error && error.code !== 'PGRST116') {
              console.error('Error fetching organization profile:', error);
            } else {
              roleData = data;
            }
          }
        } catch (roleError) {
          console.error('Error fetching role-specific profile:', roleError);
          // Don't throw here, just continue without role profile
        }

        setRoleProfile(roleData);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Omit<User, 'created_at' | 'updated_at'>>) => {
    if (!user || !profile) {
      throw new Error('User or profile not available');
    }

    try {
      // Convert Date objects back to strings for database
      const dbUpdates: Record<string, any> = {};
      
      Object.keys(updates).forEach(key => {
        const value = updates[key as keyof typeof updates];
        if (value instanceof Date) {
          if (key === 'date_of_birth') {
            dbUpdates[key] = value.toISOString().split('T')[0];
          } else {
            dbUpdates[key] = value.toISOString();
          }
        } else {
          dbUpdates[key] = value;
        }
      });

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', profile.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      setProfile(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Profile update error:', err);
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
