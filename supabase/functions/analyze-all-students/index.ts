import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await createClient(
      supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!
    ).auth.getUser(token);
    if (authErr || !user) throw new Error("Unauthorized");

    const { data: roles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", user.id);
    if (!roles?.some((r: any) => r.role === "admin")) throw new Error("Admin only");

    // Get all active students
    const { data: students } = await supabaseAdmin.from("profiles").select("user_id, full_name").in("status", ["active", "at-risk"]);
    if (!students || students.length === 0) {
      return new Response(JSON.stringify({ success: true, analyzed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Analyzing ${students.length} students...`);

    let analyzed = 0;
    let errors = 0;

    for (const student of students) {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/analyze-student`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
            apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
          },
          body: JSON.stringify({ student_id: student.user_id }),
        });

        if (res.ok) {
          analyzed++;
          console.log(`✓ Analyzed: ${student.full_name}`);
        } else {
          errors++;
          const errText = await res.text();
          console.error(`✗ Failed: ${student.full_name}: ${errText}`);
        }

        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 2000));
      } catch (e) {
        errors++;
        console.error(`✗ Error for ${student.full_name}:`, e);
      }
    }

    console.log(`Done: ${analyzed} analyzed, ${errors} errors`);

    return new Response(JSON.stringify({ success: true, analyzed, errors, total: students.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-all error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
