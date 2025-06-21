
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

    const { amount, currency = 'UGX', profile_id, session_id, payment_type = 'session' } = await req.json();

    console.log('Creating DPO payment intent:', { amount, currency, profile_id, session_id, payment_type });

    // Get user details
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email, first_name, last_name, phone_number')
      .eq('id', profile_id)
      .single();

    if (profileError) throw profileError;

    // Create DPO payment request
    const dpoApiUrl = "https://secure.3gdirectpay.com/API/v6/";
    const dpoApiKey = Deno.env.get("DPO_API_KEY");
    const dpoCompanyToken = Deno.env.get("DPO_COMPANY_TOKEN");

    if (!dpoApiKey || !dpoCompanyToken) {
      throw new Error("DPO API credentials not configured");
    }

    // Generate unique transaction reference
    const transactionRef = `MINDLYFE_${Date.now()}_${profile_id.substring(0, 8)}`;

    const dpoPaymentData = {
      companyToken: dpoCompanyToken,
      request: "createToken",
      transaction: {
        paymentAmount: amount,
        paymentCurrency: currency,
        companyRef: transactionRef,
        redirectURL: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-callback`,
        backURL: `${window?.location?.origin || 'https://app.mindlyfe.org'}/dashboard`,
        companyAccRef: profile_id,
        customerFirstName: profile.first_name,
        customerLastName: profile.last_name,
        customerEmail: profile.email,
        customerPhone: profile.phone_number || "",
      }
    };

    const dpoResponse = await fetch(dpoApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dpoPaymentData)
    });

    if (!dpoResponse.ok) {
      throw new Error(`DPO API error: ${dpoResponse.statusText}`);
    }

    const dpoResult = await dpoResponse.json();

    if (dpoResult.result !== "000") {
      throw new Error(`DPO payment creation failed: ${dpoResult.resultExplanation}`);
    }

    // Create invoice record
    const { error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert([{
        profile_id,
        session_id,
        amount: amount,
        currency: currency,
        status: 'pending',
        payment_type,
        // Store DPO transaction reference instead of Stripe ID
        stripe_payment_intent_id: transactionRef
      }]);

    if (invoiceError) throw invoiceError;

    console.log('DPO payment token created:', dpoResult.transToken);

    return new Response(
      JSON.stringify({
        payment_url: `https://secure.3gdirectpay.com/payv2.php?ID=${dpoResult.transToken}`,
        transaction_token: dpoResult.transToken,
        transaction_ref: transactionRef
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error creating DPO payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
