import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-custom-header, content-type, x-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify webhook signature
    const secret = Deno.env.get("LEMON_SQUEEZY_WEBHOOK_SECRET");
    const signature = req.headers.get("x-signature");
    const rawBody = await req.text();

    if (secret && signature) {
      const hmac = createHmac("sha256", secret);
      hmac.update(rawBody);
      const digest = hmac.toString();
      if (digest !== signature) {
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: corsHeaders }
        );
      }
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const data = payload.data;
    const attrs = data?.attributes;

    // Extract user email from custom data or customer email
    const userEmail =
      payload.meta?.custom_data?.user_email || attrs?.user_email;

    if (!userEmail) {
      console.error("No user email found in webhook payload");
      return new Response(
        JSON.stringify({ error: "No user email" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Find user by email
    const { data: userData } = await supabase.auth.admin.listUsers();
    const user = userData?.users?.find(
      (u: { email?: string }) => u.email === userEmail
    );

    if (!user) {
      console.error(`User not found for email: ${userEmail}`);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Determine plan from variant/product name
    const variantName = attrs?.variant_name?.toLowerCase() || "";
    const productName = attrs?.product_name?.toLowerCase() || "";
    let plan = "celik"; // default
    if (
      variantName.includes("kilic") ||
      productName.includes("kilic") ||
      variantName.includes("sword")
    ) {
      plan = "kilic";
    } else if (
      variantName.includes("ates") ||
      productName.includes("ates") ||
      variantName.includes("fire")
    ) {
      plan = "ates";
    }

    switch (eventName) {
      case "subscription_created": {
        await supabase.from("subscriptions").upsert(
          {
            user_id: user.id,
            lemon_squeezy_id: data.id,
            lemon_squeezy_customer_id: attrs?.customer_id?.toString(),
            plan,
            status: attrs?.status === "on_trial" ? "trial" : "active",
            current_period_start: attrs?.current_period_start,
            current_period_end: attrs?.current_period_end,
            trial_ends_at: attrs?.trial_ends_at,
          },
          { onConflict: "lemon_squeezy_id" }
        );

        await supabase
          .from("profiles")
          .update({
            subscription_plan: plan,
            subscription_status: "active",
          })
          .eq("user_id", user.id);
        break;
      }

      case "subscription_updated": {
        const status =
          attrs?.status === "on_trial"
            ? "trial"
            : attrs?.status === "cancelled"
              ? "cancelled"
              : attrs?.status === "expired"
                ? "expired"
                : attrs?.status === "paused"
                  ? "paused"
                  : attrs?.status === "past_due"
                    ? "past_due"
                    : "active";

        await supabase
          .from("subscriptions")
          .update({
            status,
            plan,
            current_period_start: attrs?.current_period_start,
            current_period_end: attrs?.current_period_end,
            cancel_at: attrs?.cancelled ? attrs?.ends_at : null,
          })
          .eq("lemon_squeezy_id", data.id);

        await supabase
          .from("profiles")
          .update({
            subscription_plan:
              status === "cancelled" || status === "expired" ? "free" : plan,
            subscription_status: status,
          })
          .eq("user_id", user.id);
        break;
      }

      case "subscription_cancelled": {
        await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancel_at: attrs?.ends_at,
          })
          .eq("lemon_squeezy_id", data.id);

        // Don't immediately downgrade — wait until period ends
        // The subscription_updated event with status "expired" handles that
        break;
      }

      case "subscription_expired": {
        await supabase
          .from("subscriptions")
          .update({
            status: "expired",
          })
          .eq("lemon_squeezy_id", data.id);

        await supabase
          .from("profiles")
          .update({
            subscription_plan: "free",
            subscription_status: "expired",
          })
          .eq("user_id", user.id);
        break;
      }

      default:
        console.log(`Unhandled event: ${eventName}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
