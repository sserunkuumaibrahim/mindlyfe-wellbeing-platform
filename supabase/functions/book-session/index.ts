
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

    const { therapist_id, client_id, scheduled_at, duration_minutes, session_type } = await req.json();

    console.log('Booking session:', { therapist_id, client_id, scheduled_at, duration_minutes, session_type });

    // Check for scheduling conflicts
    const { data: conflicts, error: conflictError } = await supabaseAdmin
      .from('therapy_sessions')
      .select('id')
      .eq('therapist_id', therapist_id)
      .eq('status', 'scheduled')
      .gte('scheduled_at', new Date(scheduled_at).toISOString())
      .lt('scheduled_at', new Date(new Date(scheduled_at).getTime() + duration_minutes * 60000).toISOString());

    if (conflictError) throw conflictError;
    
    if (conflicts && conflicts.length > 0) {
      return new Response(
        JSON.stringify({ error: "Time slot is no longer available" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if client is part of organization
    const { data: orgMember, error: orgError } = await supabaseAdmin
      .from('organization_members')
      .select('organization_id, sessions_used')
      .eq('profile_id', client_id)
      .single();

    let shouldChargeDirectly = true;
    let sessionCost = 76000; // Standard UGX price per session

    if (!orgError && orgMember) {
      // User is part of organization - check annual limits (8 sessions per year)
      const { data: orgSubscription, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .select('sessions_included, sessions_used')
        .eq('organization_id', orgMember.organization_id)
        .eq('status', 'active')
        .single();

      if (!subError && orgSubscription) {
        if (orgSubscription.sessions_used < orgSubscription.sessions_included) {
          shouldChargeDirectly = false; // Covered by org subscription
          sessionCost = 0;
        }
      }
    } else {
      // Check individual professional subscription (4 sessions per month)
      const { data: professionalSub, error: profError } = await supabaseAdmin
        .from('subscriptions')
        .select('sessions_included, sessions_used')
        .eq('profile_id', client_id)
        .eq('plan_type', 'professional_monthly')
        .eq('status', 'active')
        .single();

      if (!profError && professionalSub) {
        // Check if subscription is still valid for current month
        const now = new Date();
        const subStartDate = new Date(professionalSub.start_date);
        const monthsDiff = (now.getFullYear() - subStartDate.getFullYear()) * 12 + 
                          (now.getMonth() - subStartDate.getMonth());
        
        // Reset sessions_used if it's a new month
        if (monthsDiff > 0) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ sessions_used: 0 })
            .eq('profile_id', client_id)
            .eq('plan_type', 'professional_monthly');
          
          professionalSub.sessions_used = 0;
        }

        if (professionalSub.sessions_used < professionalSub.sessions_included) {
          shouldChargeDirectly = false; // Covered by professional subscription
          sessionCost = 0;
        }
      }
    }

    // Generate Google Meet link
    const meetUrl = `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`;

    // Create session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('therapy_sessions')
      .insert([{
        client_id,
        therapist_id,
        scheduled_at,
        duration_minutes,
        session_type,
        google_meet_url: meetUrl,
        status: 'scheduled'
      }])
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Create invoice only if direct payment is needed
    if (shouldChargeDirectly && sessionCost > 0) {
      const { error: invoiceError } = await supabaseAdmin
        .from('invoices')
        .insert([{
          profile_id: client_id,
          session_id: session.id,
          amount: sessionCost,
          currency: 'UGX',
          status: 'pending',
          payment_type: 'session'
        }]);

      if (invoiceError) throw invoiceError;
    } else {
      // Update session usage counters
      if (orgMember) {
        // Update organization subscription usage
        await supabaseAdmin
          .from('subscriptions')
          .update({ 
            sessions_used: orgMember.sessions_used + 1
          })
          .eq('organization_id', orgMember.organization_id)
          .eq('status', 'active');

        // Update member usage
        await supabaseAdmin
          .from('organization_members')
          .update({ 
            sessions_used: orgMember.sessions_used + 1
          })
          .eq('profile_id', client_id);
      } else {
        // Update professional subscription usage
        await supabaseAdmin
          .from('subscriptions')
          .update({ 
            sessions_used: supabaseAdmin.raw('sessions_used + 1')
          })
          .eq('profile_id', client_id)
          .eq('plan_type', 'professional_monthly')
          .eq('status', 'active');
      }
    }

    // Send notifications
    await Promise.all([
      // Notify client
      supabaseAdmin.from('notifications').insert([{
        profile_id: client_id,
        title: 'Session Booked',
        message: `Your therapy session has been scheduled for ${new Date(scheduled_at).toLocaleString()}`,
        type: 'booking_confirmation',
        data: { session_id: session.id }
      }]),
      // Notify therapist
      supabaseAdmin.from('notifications').insert([{
        profile_id: therapist_id,
        title: 'New Session Booking',
        message: `You have a new session scheduled for ${new Date(scheduled_at).toLocaleString()}`,
        type: 'new_booking',
        data: { session_id: session.id }
      }])
    ]);

    console.log('Session booked successfully:', session.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        session,
        payment_required: shouldChargeDirectly && sessionCost > 0,
        amount: sessionCost
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error booking session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
