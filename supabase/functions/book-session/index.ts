
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

    // Create invoice
    const { error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert([{
        profile_id: client_id,
        session_id: session.id,
        amount: 120.00,
        currency: 'USD',
        status: 'pending'
      }]);

    if (invoiceError) throw invoiceError;

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

    return new Response(
      JSON.stringify({ success: true, session }),
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
