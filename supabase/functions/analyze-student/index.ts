import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    ).auth.getUser(token);
    if (authErr || !user) throw new Error("Unauthorized");

    // Check admin role
    const { data: roles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", user.id);
    const isAdmin = roles?.some((r: any) => r.role === "admin");
    if (!isAdmin) throw new Error("Admin only");

    const { student_id } = await req.json();
    if (!student_id) throw new Error("student_id required");

    // Fetch student data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const since = sevenDaysAgo.toISOString().split("T")[0];

    const [profileRes, checkinsRes, lifeRes, tasksRes] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("user_id", student_id).maybeSingle(),
      supabaseAdmin.from("checkins").select("*").eq("user_id", student_id).gte("checkin_date", since).order("checkin_date", { ascending: false }),
      supabaseAdmin.from("life_area_entries").select("*").eq("user_id", student_id).gte("entry_date", since).order("entry_date", { ascending: false }),
      supabaseAdmin.from("student_tasks").select("*, tasks(title)").eq("user_id", student_id),
    ]);

    const profile = profileRes.data;
    const checkins = checkinsRes.data || [];
    const lifeEntries = lifeRes.data || [];
    const tasks = tasksRes.data || [];

    const completedTasks = tasks.filter((t: any) => t.status === "approved").length;
    const pendingTasks = tasks.filter((t: any) => t.status === "pending").length;
    const submittedTasks = tasks.filter((t: any) => t.status === "submitted").length;

    const prompt = `Sen bir kişisel gelişim koçu analizcisisin. Aşağıdaki öğrenci verilerini analiz et ve Türkçe olarak özet rapor hazırla.

ÖĞRENCİ: ${profile?.full_name || "Bilinmiyor"}
Durum: ${profile?.status}, Faz: ${profile?.current_phase}, Hafta: ${profile?.current_week}, Seri: ${profile?.streak}

SON 7 GÜN CHECK-IN VERİLERİ (${checkins.length} giriş):
${checkins.map((c: any) => `${c.checkin_date} (${c.checkin_type}): Enerji=${c.energy_rating || "-"}, Uyku=${c.sleep_rating || "-"}, Beslenme=${c.nutrition_rating || "-"}, Gün=${c.day_rating || "-"}, Antrenman=${c.workout_done ? "Evet" : "Hayır"}, Rutin=${c.routine_done ? "Evet" : "Hayır"}`).join("\n")}

YAŞAM ALANI GİRİŞLERİ (${lifeEntries.length} giriş):
${lifeEntries.map((l: any) => `${l.entry_date} - ${l.area}: ${JSON.stringify(l.metrics)}`).join("\n")}

GÖREV DURUMU: ${completedTasks} tamamlandı, ${submittedTasks} incelemede, ${pendingTasks} bekliyor

Yanıtını şu formatta ver: Kısa genel özet (3-4 cümle), güçlü yönler, gelişim alanları ve 3 somut öneri.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        tools: [{
          type: "function",
          function: {
            name: "student_analysis",
            description: "Return structured student analysis",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "3-4 cümle genel özet" },
                risk_level: { type: "string", enum: ["low", "medium", "high"], description: "Risk seviyesi" },
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      area: { type: "string" },
                      suggestion: { type: "string" },
                      priority: { type: "string", enum: ["low", "medium", "high"] },
                    },
                    required: ["area", "suggestion", "priority"],
                  },
                },
              },
              required: ["summary", "risk_level", "recommendations"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "student_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let analysis;
    try {
      analysis = JSON.parse(toolCall.function.arguments);
    } catch {
      // Fallback: use content
      analysis = {
        summary: aiData.choices?.[0]?.message?.content || "Analiz yapılamadı",
        risk_level: "medium",
        recommendations: [],
      };
    }

    // Save report
    const { data: report, error: saveErr } = await supabaseAdmin.from("ai_analysis_reports").insert({
      user_id: student_id,
      analysis_date: new Date().toISOString().split("T")[0],
      summary: analysis.summary,
      risk_level: analysis.risk_level,
      recommendations: analysis.recommendations,
    }).select().single();

    if (saveErr) {
      console.error("Save error:", saveErr);
      throw new Error("Report save failed");
    }

    console.log(`Analysis complete for ${student_id}: risk=${analysis.risk_level}`);

    return new Response(JSON.stringify({ success: true, report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-student error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
