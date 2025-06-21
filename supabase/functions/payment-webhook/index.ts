
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

    const body = await req.json();
    console.log('Processing DPO webhook:', body);

    // DPO webhook structure
    const { CompanyRef, TransactionToken, PnrID, CCDapproval, TransactionApproval } = body;

    // Verify the transaction with DPO
    const dpoApiUrl = "https://secure.3gdirectpay.com/API/v6/";
    const dpoCompanyToken = Deno.env.get("DPO_COMPANY_TOKEN");

    const verifyData = {
      companyToken: dpoCompanyToken,
      request: "verifyToken",
      transactionToken: TransactionToken
    };

    const verifyResponse = await fetch(dpoApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyData)
    });

    const verifyResult = await verifyResponse.json();

    if (verifyResult.result !== "000") {
      console.error('DPO verification failed:', verifyResult);
      return new Response("Transaction verification failed", { status: 400 });
    }

    // Check if payment was successful
    const paymentSuccessful = CCDapproval === "Y" && TransactionApproval === "Y";

    // Find the invoice by transaction reference
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('stripe_payment_intent_id', CompanyRef) // Using this field to store DPO transaction ref
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice not found:', CompanyRef);
      return new Response("Invoice not found", { status: 404 });
    }

    if (paymentSuccessful) {
      // Update invoice status to paid
      await supabaseAdmin
        .from('invoices')
        .update({ 
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', invoice.id);

      // If this is a subscription payment, activate the subscription
      if (invoice.payment_type === 'subscription' && invoice.subscription_id) {
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'active' })
          .eq('id', invoice.subscription_id);

        // Send subscription activation notification
        await supabaseAdmin.from('notifications').insert([{
          profile_id: invoice.profile_id,
          title: 'Subscription Activated',
          message: 'Your subscription has been activated successfully. You can now book sessions.',
          type: 'success'
        }]);
      }

      // Send payment confirmation notification
      await supabaseAdmin.from('notifications').insert([{
        profile_id: invoice.profile_id,
        title: 'Payment Confirmed',
        message: `Your payment of ${invoice.amount} ${invoice.currency} has been processed successfully.`,
        type: 'payment_confirmation'
      }]);

      console.log('Payment processed successfully for invoice:', invoice.id);
    } else {
      // Update invoice status to failed
      await supabaseAdmin
        .from('invoices')
        .update({ status: 'failed' })
        .eq('id', invoice.id);

      // Send payment failed notification
      await supabaseAdmin.from('notifications').insert([{
        profile_id: invoice.profile_id,
        title: 'Payment Failed',
        message: 'Your payment could not be processed. Please try again or contact support.',
        type: 'payment_failed'
      }]);

      console.log('Payment failed for invoice:', invoice.id);
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
