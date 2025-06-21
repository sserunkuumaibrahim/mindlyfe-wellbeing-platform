
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

    const { sender_id, recipient_id, content, message_type = 'text', conversation_id } = await req.json();

    console.log('Sending message:', { sender_id, recipient_id, content, message_type });

    // Generate conversation ID if not provided
    const finalConversationId = conversation_id || 
      (sender_id < recipient_id ? `${sender_id}${recipient_id}` : `${recipient_id}${sender_id}`);

    // Insert message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([{
        conversation_id: finalConversationId,
        sender_id,
        recipient_id,
        content,
        message_type
      }])
      .select()
      .single();

    if (messageError) throw messageError;

    // Send notification to recipient
    await supabase.from('notifications').insert([{
      profile_id: recipient_id,
      title: 'New Message',
      message: `You have a new message: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
      type: 'info',
      data: { message_id: message.id, sender_id }
    }]);

    console.log('Message sent successfully:', message.id);

    return new Response(
      JSON.stringify({ success: true, message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error sending message:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
