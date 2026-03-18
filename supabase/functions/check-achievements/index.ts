import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AchievementDef {
  key: string;
  check: (ctx: CheckContext) => Promise<boolean>;
}

interface CheckContext {
  userId: string;
  admin: ReturnType<typeof createClient>;
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    key: "first_checkin",
    check: async ({ userId, admin }) => {
      const { count } = await admin
        .from("checkins")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      return (count ?? 0) >= 1;
    },
  },
  {
    key: "week_streak_7",
    check: async ({ userId, admin }) => {
      const { data } = await admin
        .from("profiles")
        .select("streak")
        .eq("user_id", userId)
        .single();
      return (data?.streak ?? 0) >= 7;
    },
  },
  {
    key: "week_streak_30",
    check: async ({ userId, admin }) => {
      const { data } = await admin
        .from("profiles")
        .select("streak")
        .eq("user_id", userId)
        .single();
      return (data?.streak ?? 0) >= 30;
    },
  },
  {
    key: "phase_2",
    check: async ({ userId, admin }) => {
      const { data } = await admin
        .from("profiles")
        .select("current_phase")
        .eq("user_id", userId)
        .single();
      return (data?.current_phase ?? 1) >= 2;
    },
  },
  {
    key: "phase_3",
    check: async ({ userId, admin }) => {
      const { data } = await admin
        .from("profiles")
        .select("current_phase")
        .eq("user_id", userId)
        .single();
      return (data?.current_phase ?? 1) >= 3;
    },
  },
  {
    key: "first_guild",
    check: async ({ userId, admin }) => {
      const { count } = await admin
        .from("guild_members")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_active", true);
      return (count ?? 0) >= 1;
    },
  },
  {
    key: "community_first_post",
    check: async ({ userId, admin }) => {
      const { count } = await admin
        .from("community_posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      return (count ?? 0) >= 1;
    },
  },
  {
    key: "tasks_10",
    check: async ({ userId, admin }) => {
      const { count } = await admin
        .from("student_tasks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "completed");
      return (count ?? 0) >= 10;
    },
  },
  {
    key: "forged",
    check: async ({ userId, admin }) => {
      const { data } = await admin
        .from("profiles")
        .select("current_week")
        .eq("user_id", userId)
        .single();
      return (data?.current_week ?? 0) >= 24;
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }
    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(supabaseUrl, anonKey);
    const {
      data: { user },
      error: authErr,
    } = await anonClient.auth.getUser(token);
    if (authErr || !user) {
      throw new Error("Unauthorized");
    }

    // Parse body
    const { user_id } = await req.json();
    if (!user_id) {
      throw new Error("user_id is required");
    }

    // Auth check: user can only check own achievements, unless admin
    const admin = createClient(supabaseUrl, serviceRoleKey);
    if (user.id !== user_id) {
      const { data: roles } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const isAdmin = roles?.some((r: any) => r.role === "admin");
      if (!isAdmin) {
        throw new Error("Forbidden: can only check your own achievements");
      }
    }

    // Get already-unlocked achievements
    const { data: existing } = await admin
      .from("achievements")
      .select("achievement_key")
      .eq("user_id", user_id);
    const unlockedKeys = new Set(
      (existing || []).map((a: any) => a.achievement_key)
    );

    // Check each definition
    const ctx: CheckContext = { userId: user_id, admin };
    const newlyUnlocked: string[] = [];

    for (const def of ACHIEVEMENT_DEFS) {
      if (unlockedKeys.has(def.key)) continue;
      try {
        const met = await def.check(ctx);
        if (met) {
          const { error: insertErr } = await admin
            .from("achievements")
            .insert({ user_id, achievement_key: def.key });
          if (!insertErr) {
            newlyUnlocked.push(def.key);
          }
        }
      } catch {
        // Skip individual check failures
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        newly_unlocked: newlyUnlocked,
        total_unlocked: unlockedKeys.size + newlyUnlocked.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    const status = error.message === "Unauthorized" || error.message?.startsWith("Forbidden") ? 403 : 400;
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status,
      }
    );
  }
});
