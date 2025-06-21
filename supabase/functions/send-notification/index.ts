
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

    const { profile_id, title, message, type, data, send_email, send_sms } = await req.json();

    // Insert notification
    const { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert([{
        profile_id,
        title,
        message,
        type,
        data
      }]);

    if (notificationError) throw notificationError;

    // Get user preferences and contact info
    if (send_email || send_sms) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('email, phone_number, individual_profiles(opt_in_newsletter, opt_in_sms)')
        .eq('id', profile_id)
        .single();

      if (profileError) throw profileError;

      // Send email if requested and user opted in
      if (send_email && profile.individual_profiles?.opt_in_newsletter) {
        // TODO: Integrate with SendGrid
        console.log('Would send email to:', profile.email);
      }

      // Send SMS if requested and user opted in
      if (send_sms && profile.individual_profiles?.opt_in_sms && profile.phone_number) {
        // TODO: Integrate with Twilio
        console.log('Would send SMS to:', profile.phone_number);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
