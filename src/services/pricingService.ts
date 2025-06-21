
import { supabase } from '@/integrations/supabase/client';

export const pricingService = {
  async getPricingPlans() {
    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_ugx');

    if (error) throw error;
    return data;
  },

  async createSubscription(planId: string, profileId: string, organizationId?: string) {
    const { data: plan, error: planError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError) throw planError;

    const endDate = new Date();
    if (plan.billing_cycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        profile_id: profileId,
        organization_id: organizationId,
        plan_type: plan.name,
        amount_ugx: plan.price_ugx,
        sessions_included: plan.sessions_included,
        end_date: endDate.toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return subscription;
  },

  async getUserSubscription(profileId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('profile_id', profileId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};
