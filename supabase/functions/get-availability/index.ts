
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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { therapist_id } = await req.json();

    // Get therapist availability for the next 14 days
    const { data: availability, error } = await supabase
      .from('therapist_availability')
      .select('*')
      .eq('therapist_id', therapist_id)
      .eq('is_available', true);

    if (error) throw error;

    // Get existing booked sessions
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);

    const { data: bookedSessions, error: sessionsError } = await supabase
      .from('therapy_sessions')
      .select('scheduled_at, duration_minutes')
      .eq('therapist_id', therapist_id)
      .eq('status', 'scheduled')
      .gte('scheduled_at', startDate.toISOString())
      .lte('scheduled_at', endDate.toISOString());

    if (sessionsError) throw sessionsError;

    // Generate available slots
    const slots = [];
    const bookedTimes = new Set(bookedSessions?.map(session => session.scheduled_at) || []);

    for (let d = 0; d < 14; d++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + d);
      const dayOfWeek = currentDate.getDay();

      const dayAvailability = availability?.filter(avail => 
        avail.day_of_week === dayOfWeek || 
        (avail.specific_date && avail.specific_date === currentDate.toISOString().split('T')[0])
      ) || [];

      for (const avail of dayAvailability) {
        const startTime = new Date(`${currentDate.toISOString().split('T')[0]}T${avail.start_time}`);
        const endTime = new Date(`${currentDate.toISOString().split('T')[0]}T${avail.end_time}`);

        // Generate 60-minute slots
        for (let time = startTime; time < endTime; time.setHours(time.getHours() + 1)) {
          const slotTime = time.toISOString();
          
          if (!bookedTimes.has(slotTime) && time > new Date()) {
            slots.push({
              therapist_id,
              date: time.toISOString().split('T')[0],
              time: time.toTimeString().slice(0, 5),
              available: true
            });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ slots: slots.slice(0, 50) }), // Limit to 50 slots
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error getting availability:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
