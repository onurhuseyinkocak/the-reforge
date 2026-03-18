import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { action } = await req.json().catch(() => ({ action: "streak_warning" }));
  const results: string[] = [];
  const INTERNAL_SECRET = Deno.env.get("INTERNAL_FUNCTION_SECRET") || "";
  const FUNCTION_URL = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`;

  async function sendEmail(
    to: string,
    subject: string,
    template: string,
    data: Record<string, any>
  ) {
    await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": INTERNAL_SECRET,
      },
      body: JSON.stringify({ to, subject, template, data }),
    });
  }

  if (action === "streak_warning") {
    // Find users who haven't checked in today
    const today = new Date().toISOString().split("T")[0];
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, streak")
      .gt("streak", 0);

    if (allProfiles) {
      for (const profile of allProfiles) {
        const { data: todayCheckin } = await supabase
          .from("checkins")
          .select("id")
          .eq("user_id", profile.user_id)
          .eq("checkin_date", today)
          .limit(1);

        if (!todayCheckin || todayCheckin.length === 0) {
          const { data: userData } = await supabase.auth.admin.getUserById(
            profile.user_id
          );
          if (userData?.user?.email) {
            await sendEmail(
              userData.user.email,
              "⚠️ Streak'in Risk Altında!",
              "streak_warning",
              {
                name: profile.full_name,
                streak: profile.streak,
                checkinUrl: "https://theforge.app/check-in",
              }
            );
            results.push(`Streak warning sent to ${userData.user.email}`);
          }
        }
      }
    }
  }

  if (action === "weekly_summary") {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, streak, xp");

    if (profiles) {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      for (const profile of profiles) {
        const { count: checkinCount } = await supabase
          .from("checkins")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profile.user_id)
          .gte("checkin_date", weekAgo);

        const { count: taskCount } = await supabase
          .from("student_tasks")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profile.user_id)
          .eq("status", "completed")
          .gte("submitted_at", weekAgo);

        const { data: xpData } = await supabase
          .from("xp_log")
          .select("amount")
          .eq("user_id", profile.user_id)
          .gte("created_at", weekAgo);

        const weekXP =
          xpData?.reduce((sum: number, x: { amount: number }) => sum + x.amount, 0) || 0;

        const { data: userData } = await supabase.auth.admin.getUserById(
          profile.user_id
        );
        if (userData?.user?.email) {
          await sendEmail(
            userData.user.email,
            "📊 Haftalık Özetin Hazır",
            "weekly_summary",
            {
              name: profile.full_name,
              checkins: checkinCount || 0,
              tasks: taskCount || 0,
              streak: profile.streak,
              xp: weekXP,
              dashboardUrl: "https://theforge.app/dashboard",
            }
          );
          results.push(`Weekly summary sent to ${userData.user.email}`);
        }
      }
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      sent: results.length,
      details: results,
    }),
    { status: 200 }
  );
});
