
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { profile_id, organization_id, plan_type } = await req.json();

    console.log('Creating subscription:', { profile_id, organization_id, plan_type });

    // Define plan details
    const planDetails = {
      'professional_monthly': {
        amount_ugx: 200000,
        sessions_included: 4,
        interval: 'month'
      },
      'organization_annual': {
        amount_ugx: 680000,
        sessions_included: 8,
        interval: 'year'
      }
    };

    const plan = planDetails[plan_type as keyof typeof planDetails];
    if (!plan) {
      throw new Error('Invalid plan type');
    }

    // Get user details
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', profile_id)
      .single();

    if (profileError) throw profileError;

    // Create or get Stripe customer
    let customer;
    try {
      const customers = await stripe.customers.list({
        email: profile.email,
        limit: 1
      });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: profile.email,
          name: `${profile.first_name} ${profile.last_name}`,
        });
      }
    } catch (error) {
      throw new Error(`Failed to create/get customer: ${error.message}`);
    }

    // Create subscription in database first
    const endDate = new Date();
    if (plan.interval === 'month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .insert([{
        profile_id: organization_id ? null : profile_id,
        organization_id: organization_id || null,
        plan_type,
        amount_ugx: plan.amount_ugx,
        sessions_included: plan.sessions_included,
        sessions_used: 0,
        end_date: endDate.toISOString(),
        status: 'pending'
      }])
      .select()
      .single();

    if (subError) throw subError;

    // Create Stripe subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price_data: {
          currency: 'ugx',
          product_data: {
            name: `Mindlyfe ${plan_type.replace('_', ' ').toUpperCase()}`,
          },
          unit_amount: plan.amount_ugx * 100, // Convert to cents
          recurring: {
            interval: plan.interval as 'month' | 'year'
          },
        },
      }],
      metadata: {
        subscription_id: subscription.id,
        profile_id,
        organization_id: organization_id || '',
        plan_type
      }
    });

    // Update subscription with Stripe ID
    await supabaseAdmin
      .from('subscriptions')
      .update({ 
        stripe_subscription_id: stripeSubscription.id,
        status: stripeSubscription.status === 'active' ? 'active' :subscriptions.status
      })
      .eq('id', subscription.id);

    console.log('Subscription created:', subscription.id);

    return new Response(
      JSON.stringify({
        subscription_id: subscription.id,
        stripe_subscription_id: stripeSubscription.id,
        client_secret: stripeSubscription.latest_invoice?.payment_intent?.client_secret
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
