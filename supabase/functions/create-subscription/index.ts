
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUBSCRIPTION_PLANS = {
  professional_monthly: {
    amount: 200000, // UGX
    sessions_included: 4,
    duration_months: 1
  },
  organization_annual: {
    amount: 680000, // UGX per user per year
    sessions_included: 8,
    duration_months: 12
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { profile_id, organization_id, plan_type, num_users = 1 } = await req.json();

    console.log('Creating subscription:', { profile_id, organization_id, plan_type, num_users });

    const plan = SUBSCRIPTION_PLANS[plan_type as keyof typeof SUBSCRIPTION_PLANS];
    if (!plan) {
      throw new Error("Invalid subscription plan");
    }

    // Calculate total amount (for organization plans, multiply by number of users)
    const totalAmount = plan_type === 'organization_annual' ? plan.amount * num_users : plan.amount;
    const totalSessions = plan_type === 'organization_annual' ? plan.sessions_included * num_users : plan.sessions_included;

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.duration_months);

    // Create subscription
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .insert([{
        profile_id: plan_type === 'professional_monthly' ? profile_id : null,
        organization_id: plan_type === 'organization_annual' ? organization_id : null,
        plan_type,
        status: 'pending',
        sessions_included: totalSessions,
        sessions_used: 0,
        amount_ugx: totalAmount,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      }])
      .select()
      .single();

    if (subscriptionError) throw subscriptionError;

    // Create payment intent for subscription
    const { data: paymentData, error: paymentError } = await supabaseAdmin.functions.invoke('create-payment-intent', {
      body: {
        amount: totalAmount,
        currency: 'UGX',
        profile_id,
        payment_type: 'subscription',
        subscription_id: subscription.id
      }
    });

    if (paymentError) throw paymentError;

    // Send notification
    const notificationMessage = plan_type === 'professional_monthly' 
      ? `Your Professional Monthly subscription (${plan.sessions_included} sessions) is pending payment.`
      : `Your Organization Annual subscription (${totalSessions} sessions for ${num_users} users) is pending payment.`;

    await supabaseAdmin.from('notifications').insert([{
      profile_id,
      title: 'Subscription Created',
      message: notificationMessage,
      type: 'info',
      data: { subscription_id: subscription.id }
    }]);

    console.log('Subscription created successfully:', subscription.id);

    return new Response(
      JSON.stringify({
        success: true,
        subscription,
        payment_url: paymentData.payment_url,
        total_amount: totalAmount,
        sessions_included: totalSessions
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error creating subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
