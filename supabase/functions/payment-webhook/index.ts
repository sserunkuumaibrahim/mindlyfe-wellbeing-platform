
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature!,
        Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response("Webhook signature verification failed", { status: 400 });
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        // Update invoice status
        const { error: updateError } = await supabaseAdmin
          .from('invoices')
          .update({ 
            status: 'paid',
            paid_at: new Date().toISOString(),
            stripe_payment_intent_id: paymentIntent.id
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        if (updateError) throw updateError;

        // Send confirmation notification
        const { data: invoice } = await supabaseAdmin
          .from('invoices')
          .select('profile_id, session_id')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single();

        if (invoice) {
          await supabaseAdmin.from('notifications').insert([{
            profile_id: invoice.profile_id,
            title: 'Payment Confirmed',
            message: 'Your payment has been processed successfully.',
            type: 'payment_confirmation',
            data: { session_id: invoice.session_id }
          }]);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        
        // Update invoice status
        await supabaseAdmin
          .from('invoices')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', failedPayment.id);

        // Send failure notification
        const { data: failedInvoice } = await supabaseAdmin
          .from('invoices')
          .select('profile_id')
          .eq('stripe_payment_intent_id', failedPayment.id)
          .single();

        if (failedInvoice) {
          await supabaseAdmin.from('notifications').insert([{
            profile_id: failedInvoice.profile_id,
            title: 'Payment Failed',
            message: 'Your payment could not be processed. Please try again.',
            type: 'payment_failed'
          }]);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
