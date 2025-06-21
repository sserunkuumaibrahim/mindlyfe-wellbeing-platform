
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
      console.error("Webhook signature verification failed:", err);
      return new Response("Webhook signature verification failed", { status: 400 });
    }

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        
        // Update invoice status
        await supabaseAdmin
          .from('invoices')
          .update({ 
            status: 'paid',
            paid_at: new Date().toISOString(),
            stripe_invoice_id: invoice.id
          })
          .eq('stripe_invoice_id', invoice.id);

        // Send payment confirmation notification
        const { data: invoiceData } = await supabaseAdmin
          .from('invoices')
          .select('profile_id, amount, currency')
          .eq('stripe_invoice_id', invoice.id)
          .single();

        if (invoiceData) {
          await supabaseAdmin.from('notifications').insert([{
            profile_id: invoiceData.profile_id,
            title: 'Payment Confirmed',
            message: `Your payment of ${invoiceData.amount} ${invoiceData.currency} has been processed successfully.`,
            type: 'payment_confirmation'
          }]);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        
        // Update invoice status
        await supabaseAdmin
          .from('invoices')
          .update({ status: 'failed' })
          .eq('stripe_invoice_id', invoice.id);

        // Send payment failed notification
        const { data: invoiceData } = await supabaseAdmin
          .from('invoices')
          .select('profile_id')
          .eq('stripe_invoice_id', invoice.id)
          .single();

        if (invoiceData) {
          await supabaseAdmin.from('notifications').insert([{
            profile_id: invoiceData.profile_id,
            title: 'Payment Failed',
            message: 'Your payment could not be processed. Please update your payment method.',
            type: 'payment_failed'
          }]);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Update subscription status in database
        await supabaseAdmin
          .from('subscriptions')
          .update({ 
            status: subscription.status === 'active' ? 'active' : 'pending',
            stripe_subscription_id: subscription.id
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Mark subscription as cancelled
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
