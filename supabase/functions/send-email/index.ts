import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-custom-header, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "THE FORGE <noreply@theforge.app>"; // Update domain when ready

interface EmailPayload {
  to: string;
  subject: string;
  template: string; // 'welcome' | 'application_approved' | 'application_rejected' | 'streak_warning' | 'weekly_summary' | 'payment_reminder'
  data?: Record<string, any>;
}

// HTML email templates with THE FORGE branding (dark theme, ember accents)
function getEmailHTML(template: string, data: Record<string, any> = {}): string {
  const baseStyle = `
    body { background: #0a0a0a; color: #e8e0d8; font-family: 'Inter', -apple-system, sans-serif; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; padding-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .logo { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 0.15em; color: #fff; }
    .flame { color: #FF4500; }
    .content { padding: 32px 0; }
    h1 { font-size: 24px; color: #fff; margin-bottom: 16px; }
    p { font-size: 15px; line-height: 1.7; color: #a0a0a0; margin-bottom: 16px; }
    .cta { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #FF4500, #FF8C00); color: #000; font-weight: 700; text-decoration: none; border-radius: 12px; margin: 16px 0; }
    .stat { display: inline-block; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px 24px; margin: 4px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: #FF4500; }
    .stat-label { font-size: 12px; color: #666; margin-top: 4px; }
    .footer { padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; }
    .footer p { font-size: 12px; color: #444; }
  `;

  const header = `
    <div class="header">
      <div class="logo"><span class="flame">&#128293;</span> THE FORGE</div>
      <p style="font-size:12px;color:#666;margin:8px 0 0;letter-spacing:0.1em;">DİSİPLİN ATEŞTİR</p>
    </div>
  `;

  const footer = `
    <div class="footer">
      <p>THE FORGE — Disiplin Ateştir</p>
      <p>Bu emaili almak istemiyorsanız <a href="#" style="color:#FF4500;">buradan</a> çıkabilirsiniz.</p>
    </div>
  `;

  const templates: Record<string, string> = {
    welcome: `
      <h1>Hoş Geldin, ${data.name || "Savaşçı"}! &#128293;</h1>
      <p>THE FORGE'a katıldın. 24 haftalık dönüşüm yolculuğun başlıyor.</p>
      <p>İlk adımın: <strong>Sabah check-in'ini yap.</strong> Her gün, her sabah. İstisna yok.</p>
      <a href="${data.dashboardUrl || "#"}" class="cta">DASHBOARD'A GİT</a>
      <p style="margin-top:24px;">Unutma: Motivasyon bir yalan. Disiplin her şeydir.</p>
    `,
    application_approved: `
      <h1>Başvurun Onaylandı! &#9889;</h1>
      <p>${data.name || "Savaşçı"}, THE FORGE seni kabul etti.</p>
      <p>Artık ocağa girebilirsin. Aşağıdaki butona tıklayarak hesabına giriş yap ve yolculuğuna başla.</p>
      <a href="${data.loginUrl || "#"}" class="cta">GİRİŞ YAP</a>
      <p style="margin-top:24px;font-style:italic;">"Ateşten geçmeyen çelik olmaz."</p>
    `,
    application_rejected: `
      <h1>Başvurun Hakkında</h1>
      <p>${data.name || ""}, başvurunu inceledik ancak şu an için THE FORGE'a kabul edemiyoruz.</p>
      <p>Sebep: ${data.reason || "Kontenjan doluluk."}</p>
      <p>Tekrar başvurabilirsin. Hazır olduğunda biz buradayız.</p>
    `,
    streak_warning: `
      <h1>Streak'in Risk Altında! &#9888;&#65039;</h1>
      <p>${data.name || "Savaşçı"}, bugün check-in yapmadın.</p>
      <p>Mevcut streak'in: <strong>${data.streak || 0} gün</strong></p>
      <p>Bugün check-in yapmazsan streak'in sıfırlanacak. Bunu istemezsin.</p>
      <a href="${data.checkinUrl || "#"}" class="cta">CHECK-IN YAP</a>
      <p style="margin-top:24px;color:#FF4500;font-weight:600;">"Disiplin, hissetmesen bile yapman gereken şeydir."</p>
    `,
    weekly_summary: `
      <h1>Haftalık Özet &#128202;</h1>
      <p>${data.name || "Savaşçı"}, bu hafta neler yaptığına bakalım:</p>
      <div style="text-align:center;margin:24px 0;">
        <div class="stat"><div class="stat-value">${data.checkins || 0}/7</div><div class="stat-label">Check-in</div></div>
        <div class="stat"><div class="stat-value">${data.tasks || 0}</div><div class="stat-label">Görev</div></div>
        <div class="stat"><div class="stat-value">${data.streak || 0}</div><div class="stat-label">Streak</div></div>
        <div class="stat"><div class="stat-value">+${data.xp || 0}</div><div class="stat-label">XP</div></div>
      </div>
      <p>${(data.checkins || 0) >= 5 ? "Güçlü bir hafta geçirdin. Devam et!" : "Bu hafta biraz gevşedin. Gel toparla."}</p>
      <a href="${data.dashboardUrl || "#"}" class="cta">DASHBOARD</a>
    `,
    payment_reminder: `
      <h1>Ödeme Hatırlatması</h1>
      <p>${data.name || ""}, ${data.plan || "Çelik"} planının ödeme tarihi yaklaşıyor.</p>
      <p>Tutar: <strong>${data.amount || "₺999"}</strong></p>
      <p>Son tarih: <strong>${data.dueDate || ""}</strong></p>
      <p>Aboneliğinin kesintisiz devam etmesi için ödemenizi yapın.</p>
    `,
  };

  const content = templates[template] || `<p>${data.message || "THE FORGE bildirimi."}</p>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${baseStyle}</style></head><body><div class="container">${header}<div class="content">${content}</div>${footer}</div></body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check — only internal calls (other edge functions) or admin
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    const internalSecret = req.headers.get("x-internal-secret");

    // Allow internal calls from other edge functions
    if (internalSecret !== Deno.env.get("INTERNAL_FUNCTION_SECRET")) {
      // Otherwise verify admin JWT
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: corsHeaders }
        );
      }
      const supabaseAuth = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const {
        data: { user },
      } = await supabaseAuth.auth.getUser();
      if (!user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: corsHeaders }
        );
      }
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      if (!roleData || roleData.role !== "admin") {
        return new Response(
          JSON.stringify({ error: "Forbidden" }),
          { status: 403, headers: corsHeaders }
        );
      }
    }

    const { to, subject, template, data }: EmailPayload = await req.json();

    if (!to || !subject || !template) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const html = getEmailHTML(template, data || {});

    // Send via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend error:", result);
      return new Response(
        JSON.stringify({ error: "Email send failed", details: result }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Email error:", error);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
