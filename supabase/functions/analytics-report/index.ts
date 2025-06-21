
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

    const { report_type, start_date, end_date, user_id } = await req.json();

    console.log('Generating analytics report:', { report_type, start_date, end_date, user_id });

    let reportData = {};

    switch (report_type) {
      case 'session_analytics': {
        // Get session statistics
        const { data: sessions, error } = await supabaseAdmin
          .from('therapy_sessions')
          .select('status, scheduled_at, duration_minutes, session_type')
          .gte('scheduled_at', start_date)
          .lte('scheduled_at', end_date)
          .eq(user_id ? 'client_id' : '', user_id || '');

        if (error) throw error;

        reportData = {
          total_sessions: sessions?.length || 0,
          completed_sessions: sessions?.filter(s => s.status === 'completed').length || 0,
          cancelled_sessions: sessions?.filter(s => s.status === 'cancelled').length || 0,
          virtual_sessions: sessions?.filter(s => s.session_type === 'virtual').length || 0,
          in_person_sessions: sessions?.filter(s => s.session_type === 'in_person').length || 0,
          average_duration: sessions?.reduce((sum, s) => sum + s.duration_minutes, 0) / (sessions?.length || 1) || 0
        };
        break;
      }

      case 'therapist_performance': {
        // Get therapist performance metrics
        const { data: sessions, error } = await supabaseAdmin
          .from('therapy_sessions')
          .select('therapist_id, status, scheduled_at, profiles!therapy_sessions_therapist_id_fkey(first_name, last_name)')
          .gte('scheduled_at', start_date)
          .lte('scheduled_at', end_date);

        if (error) throw error;

        const therapistStats = {};
        sessions?.forEach(session => {
          const therapistId = session.therapist_id;
          if (!therapistStats[therapistId]) {
            therapistStats[therapistId] = {
              therapist_name: `${session.profiles.first_name} ${session.profiles.last_name}`,
              total_sessions: 0,
              completed_sessions: 0,
              cancelled_sessions: 0
            };
          }
          therapistStats[therapistId].total_sessions++;
          if (session.status === 'completed') therapistStats[therapistId].completed_sessions++;
          if (session.status === 'cancelled') therapistStats[therapistId].cancelled_sessions++;
        });

        reportData = { therapist_performance: Object.values(therapistStats) };
        break;
      }

      case 'revenue_analytics': {
        // Get revenue statistics
        const { data: invoices, error } = await supabaseAdmin
          .from('invoices')
          .select('amount, currency, status, created_at, payment_type')
          .gte('created_at', start_date)
          .lte('created_at', end_date);

        if (error) throw error;

        const paidInvoices = invoices?.filter(i => i.status === 'paid') || [];
        const totalRevenue = paidInvoices.reduce((sum, i) => sum + Number(i.amount), 0);

        reportData = {
          total_revenue: totalRevenue,
          total_invoices: invoices?.length || 0,
          paid_invoices: paidInvoices.length,
          pending_invoices: invoices?.filter(i => i.status === 'pending').length || 0,
          failed_invoices: invoices?.filter(i => i.status === 'failed').length || 0,
          session_payments: invoices?.filter(i => i.payment_type === 'session').length || 0,
          subscription_payments: invoices?.filter(i => i.payment_type === 'subscription').length || 0
        };
        break;
      }

      case 'user_engagement': {
        // Get user engagement metrics
        const { data: profiles, error: profilesError } = await supabaseAdmin
          .from('profiles')
          .select('created_at, last_login_at, role')
          .gte('created_at', start_date)
          .lte('created_at', end_date);

        const { data: messages, error: messagesError } = await supabaseAdmin
          .from('messages')
          .select('created_at, sender_id')
          .gte('created_at', start_date)
          .lte('created_at', end_date);

        if (profilesError || messagesError) throw profilesError || messagesError;

        reportData = {
          new_users: profiles?.length || 0,
          individual_users: profiles?.filter(p => p.role === 'individual').length || 0,
          therapist_users: profiles?.filter(p => p.role === 'therapist').length || 0,
          organization_users: profiles?.filter(p => p.role === 'org_admin').length || 0,
          total_messages: messages?.length || 0,
          active_users: new Set(messages?.map(m => m.sender_id)).size || 0
        };
        break;
      }

      default:
        throw new Error('Invalid report type');
    }

    console.log('Report generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        report_type,
        start_date,
        end_date,
        data: reportData,
        generated_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error generating analytics report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
