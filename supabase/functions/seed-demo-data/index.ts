import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Block execution in production
    const environment = Deno.env.get('ENVIRONMENT') || Deno.env.get('ENV') || '';
    if (environment.toLowerCase() === 'production' || environment.toLowerCase() === 'prod') {
      return new Response(JSON.stringify({ error: 'Seed function is disabled in production' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: caller }, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Verify admin role using service role client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', caller.id).single();
    if (!roleData || roleData.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: admin role required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const demoUsers = [
      { email: 'admin@theforge.com', password: 'forge2024', name: 'Kaan Yıldırım', role: 'admin' },
      { email: 'ahmet@test.com', password: 'test1234', name: 'Ahmet Kaya', role: 'student' },
      { email: 'mehmet@test.com', password: 'test1234', name: 'Mehmet Demir', role: 'student' },
      { email: 'can@test.com', password: 'test1234', name: 'Can Yılmaz', role: 'student' },
      { email: 'emre@test.com', password: 'test1234', name: 'Emre Çelik', role: 'student' },
      { email: 'baris@test.com', password: 'test1234', name: 'Barış Özkan', role: 'student' },
    ];

    const createdUsers: any[] = [];

    for (const u of demoUsers) {
      // Check if user already exists
      const { data: { users: existing } } = await supabase.auth.admin.listUsers();
      const alreadyExists = existing?.find((e: any) => e.email === u.email);

      if (alreadyExists) {
        createdUsers.push({ id: alreadyExists.id, email: u.email, role: u.role, name: u.name });
        console.log(`User ${u.email} already exists`);
        continue;
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.name },
      });

      if (error) {
        console.error(`Error creating ${u.email}:`, error.message);
        continue;
      }

      createdUsers.push({ id: data.user.id, email: u.email, role: u.role, name: u.name });
      console.log(`Created user: ${u.email}`);
    }

    // Get admin and student IDs
    const adminUser = createdUsers.find(u => u.role === 'admin');
    const students = createdUsers.filter(u => u.role === 'student');

    if (!adminUser) {
      return new Response(JSON.stringify({ error: 'Admin user not created' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Add admin role
    await supabase.from('user_roles').upsert(
      { user_id: adminUser.id, role: 'admin' },
      { onConflict: 'user_id,role' }
    );

    // Update profiles with detailed info
    const profileUpdates = [
      { user_id: students[0]?.id, full_name: 'Ahmet Kaya', phone: '+90 555 111 2233', bio: 'İstanbul\'dan yazılımcı. 5 yıldır tech sektöründe.', goals: 'Fiziksel ve mental disiplin kazanmak, sabah rutini oluşturmak', current_phase: 2, current_week: 12, streak: 45, status: 'active', mentor_id: adminUser.id },
      { user_id: students[1]?.id, full_name: 'Mehmet Demir', phone: '+90 555 222 3344', bio: 'Ankara\'dan girişimci. Startup kurucusu.', goals: 'Liderlik becerilerimi geliştirmek, stres yönetimi', current_phase: 1, current_week: 6, streak: 12, status: 'active', mentor_id: adminUser.id },
      { user_id: students[2]?.id, full_name: 'Can Yılmaz', phone: '+90 555 333 4455', bio: 'İzmir\'den mühendis. Motivasyon arıyorum.', goals: 'Daha disiplinli bir yaşam, spor alışkanlığı', current_phase: 1, current_week: 3, streak: 3, status: 'at-risk', mentor_id: adminUser.id },
      { user_id: students[3]?.id, full_name: 'Emre Çelik', phone: '+90 555 444 5566', bio: 'Bursa\'dan öğretmen. Kendimi geliştirmek istiyorum.', goals: 'Sabah rutini ve spor alışkanlığı, mental dayanıklılık', current_phase: 3, current_week: 20, streak: 78, status: 'active', mentor_id: adminUser.id },
      { user_id: students[4]?.id, full_name: 'Barış Özkan', phone: '+90 555 555 6677', bio: 'Antalya\'dan sporcu. Yaşam koçluğu arıyorum.', goals: 'Mental dayanıklılık, kariyer değişikliği', current_phase: 1, current_week: 2, streak: 0, status: 'inactive', mentor_id: adminUser.id },
    ];

    // Update admin profile
    await supabase.from('profiles').update({
      full_name: 'Kaan Yıldırım', phone: '+90 555 000 1122',
      bio: 'THE FORGE kurucusu ve baş mentor', goals: 'Öğrencileri dönüştürmek',
      current_phase: 3, current_week: 24, streak: 365, status: 'active',
    }).eq('user_id', adminUser.id);

    for (const p of profileUpdates) {
      if (!p.user_id) continue;
      await supabase.from('profiles').update(p).eq('user_id', p.user_id);
    }

    // Insert check-ins for each student
    const today = new Date();
    const checkins: any[] = [];

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Ahmet - consistent
      if (students[0]?.id) {
        checkins.push({
          user_id: students[0].id, checkin_date: dateStr, checkin_type: 'morning',
          wake_time: `0${5 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 4) * 15 || '00'}`,
          sleep_rating: 6 + Math.floor(Math.random() * 4),
          energy_rating: 7 + Math.floor(Math.random() * 3),
          routine_done: Math.random() > 0.15,
          priorities: ['Proje geliştir', 'Antrenman', 'Kitap oku'],
        });
        if (Math.random() > 0.2) {
          checkins.push({
            user_id: students[0].id, checkin_date: dateStr, checkin_type: 'evening',
            workout_done: Math.random() > 0.2,
            nutrition_rating: 6 + Math.floor(Math.random() * 4),
            reflection: ['Verimli bir gün geçti.', 'Antrenman zorladı ama iyi hissettirdi.', 'Bugün odaklanmakta zorlandım.', 'Hedeflerime bir adım daha yaklaştım.', 'Erken kalkmak işe yarıyor.'][Math.floor(Math.random() * 5)],
          });
        }
      }

      // Mehmet - moderate
      if (students[1]?.id && Math.random() > 0.3) {
        checkins.push({
          user_id: students[1].id, checkin_date: dateStr, checkin_type: 'morning',
          wake_time: `0${6 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 4) * 15 || '00'}`,
          sleep_rating: 5 + Math.floor(Math.random() * 4),
          energy_rating: 5 + Math.floor(Math.random() * 4),
          routine_done: Math.random() > 0.4,
          priorities: ['Yatırımcı toplantısı', 'MVP geliştir', 'Networking'],
        });
      }

      // Can - at-risk, sparse
      if (students[2]?.id && Math.random() > 0.6) {
        checkins.push({
          user_id: students[2].id, checkin_date: dateStr, checkin_type: 'morning',
          wake_time: `0${7 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 4) * 15 || '00'}`,
          sleep_rating: 4 + Math.floor(Math.random() * 3),
          energy_rating: 3 + Math.floor(Math.random() * 4),
          routine_done: Math.random() > 0.7,
          priorities: ['İş teslim', 'Spor dene', 'Düzen kur'],
        });
      }

      // Emre - very consistent
      if (students[3]?.id) {
        checkins.push({
          user_id: students[3].id, checkin_date: dateStr, checkin_type: 'morning',
          wake_time: '05:00',
          sleep_rating: 8 + Math.floor(Math.random() * 2),
          energy_rating: 8 + Math.floor(Math.random() * 2),
          routine_done: true,
          priorities: ['Ders planı', 'CrossFit', 'Meditasyon'],
        });
        checkins.push({
          user_id: students[3].id, checkin_date: dateStr, checkin_type: 'evening',
          workout_done: true,
          nutrition_rating: 8 + Math.floor(Math.random() * 2),
          reflection: ['Harika bir gün! Her şey yolunda.', 'Öğrencilerime ilham vermeye devam.', 'CrossFit PR kırdım bugün!', 'Disiplin = Özgürlük.'][Math.floor(Math.random() * 4)],
        });
      }
    }

    // Insert checkins in batches
    for (let i = 0; i < checkins.length; i += 20) {
      const batch = checkins.slice(i, i + 20);
      await supabase.from('checkins').upsert(batch, { onConflict: 'user_id,checkin_date,checkin_type' });
    }

    // Assign tasks to students
    const { data: tasks } = await supabase.from('tasks').select('id, phase, week').order('week');
    if (tasks && tasks.length > 0) {
      const studentTasks: any[] = [];

      // Ahmet - phase 2, most done
      if (students[0]?.id) {
        tasks.forEach((t, idx) => {
          studentTasks.push({
            task_id: t.id, user_id: students[0].id,
            status: idx < 3 ? 'approved' : idx === 3 ? 'submitted' : idx === 4 ? 'in_progress' : 'pending',
            submitted_at: idx < 4 ? new Date(Date.now() - (5 - idx) * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
          });
        });
      }

      // Mehmet - phase 1
      if (students[1]?.id) {
        tasks.filter(t => t.week <= 4).forEach((t, idx) => {
          studentTasks.push({
            task_id: t.id, user_id: students[1].id,
            status: idx < 1 ? 'approved' : idx === 1 ? 'in_progress' : 'pending',
            submitted_at: idx < 1 ? new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() : null,
          });
        });
      }

      // Can - struggling
      if (students[2]?.id) {
        tasks.filter(t => t.week <= 2).forEach((t) => {
          studentTasks.push({ task_id: t.id, user_id: students[2].id, status: 'pending' });
        });
      }

      // Emre - phase 3, almost all done
      if (students[3]?.id) {
        tasks.forEach((t, idx) => {
          studentTasks.push({
            task_id: t.id, user_id: students[3].id,
            status: idx < 5 ? 'approved' : 'submitted',
            submitted_at: new Date(Date.now() - (6 - idx) * 14 * 24 * 60 * 60 * 1000).toISOString(),
          });
        });
      }

      // Barış - inactive
      if (students[4]?.id) {
        tasks.filter(t => t.week <= 1).forEach(t => {
          studentTasks.push({ task_id: t.id, user_id: students[4].id, status: 'pending' });
        });
      }

      await supabase.from('student_tasks').upsert(studentTasks, { onConflict: 'task_id,user_id' });
    }

    // Messages between admin and students
    const msgs: any[] = [];
    if (students[0]?.id) {
      msgs.push(
        { sender_id: adminUser.id, receiver_id: students[0].id, content: 'Ahmet, bu haftaki performansın mükemmel! Streak\'in 45 güne ulaşmış, gurur duyuyorum. 🔥', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { sender_id: students[0].id, receiver_id: adminUser.id, content: 'Teşekkürler hocam! Sabah rutini artık otomatik hale geldi. Soğuk duş challenge\'a da başladım.', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString() },
        { sender_id: adminUser.id, receiver_id: students[0].id, content: 'Soğuk duş harika bir adım. İlk hafta zor olacak ama 21 gün sonra bambaşka hissedeceksin. Faz 2\'deki ilerlemen çok iyi.', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { sender_id: students[0].id, receiver_id: adminUser.id, content: 'Bugünkü antrenman videomu gönderdim, form kontrolü yapar mısınız?', created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
      );
    }
    if (students[2]?.id) {
      msgs.push(
        { sender_id: adminUser.id, receiver_id: students[2].id, content: 'Can, son 5 gündür check-in yapmamışsın. Her şey yolunda mı?', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { sender_id: students[2].id, receiver_id: adminUser.id, content: 'Hocam iş yoğunluğundan fırsat bulamadım, özür dilerim. Yarın başlıyorum tekrar.', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { sender_id: adminUser.id, receiver_id: students[2].id, content: 'Yoğunluk bahane değil, disiplin. En zor zamanlarda bile 5 dakika ayırabilirsin. Yarın sabah 6\'da check-in bekliyorum. 💪', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 1800000).toISOString() },
      );
    }
    if (students[3]?.id) {
      msgs.push(
        { sender_id: adminUser.id, receiver_id: students[3].id, content: 'Emre, 78 gün streak! THE FORGE\'un en disiplinli öğrencisisin. Faz 3\'e geçişin muhteşem oldu.', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { sender_id: students[3].id, receiver_id: adminUser.id, content: 'Hocam bu program hayatımı değiştirdi. Öğrencilerim bile fark ediyor değişimi. CrossFit\'te de PR\'larım art arda geliyor!', created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
      );
    }

    if (msgs.length > 0) {
      await supabase.from('messages').insert(msgs);
    }

    // Payments
    const payments: any[] = [];
    for (const s of students) {
      if (!s?.id) continue;
      const isPaid1 = s.email !== 'baris@test.com' && s.email !== 'can@test.com';
      payments.push({
        user_id: s.id, amount: 5000, currency: 'TRY',
        status: isPaid1 ? 'paid' : 'overdue',
        due_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paid_at: isPaid1 ? new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString() : null,
        description: 'Aylık ödeme - Ocak',
      });

      const isPaid2 = s.email === 'ahmet@test.com' || s.email === 'emre@test.com';
      payments.push({
        user_id: s.id, amount: 5000, currency: 'TRY',
        status: isPaid2 ? 'paid' : s.email === 'baris@test.com' ? 'overdue' : 'pending',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paid_at: isPaid2 ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() : null,
        description: 'Aylık ödeme - Şubat',
      });
    }
    await supabase.from('payments').insert(payments);

    // Mentor sessions
    const sessions = students.filter(s => s?.id && s.email !== 'baris@test.com').map((s, i) => ({
      student_id: s.id, mentor_id: adminUser.id,
      scheduled_at: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 60, status: 'scheduled',
    }));
    await supabase.from('mentor_sessions').insert(sessions);

    // Admin notes
    const notes: any[] = [];
    if (students[0]?.id) notes.push({ student_id: students[0].id, admin_id: adminUser.id, content: 'Ahmet çok iyi ilerliyor. Faz 2 geçişi sorunsuz oldu. Soğuk duş challenge\'a kendi isteğiyle başladı.' });
    if (students[2]?.id) notes.push(
      { student_id: students[2].id, admin_id: adminUser.id, content: 'Can son hafta düşüşte. İş yoğunluğunu bahane ediyor. Ekstra motivasyon gerekiyor.' },
      { student_id: students[2].id, admin_id: adminUser.id, content: 'Telefon görüşmesi yaptık. Sabah rutinine tekrar başlayacağına söz verdi. Takip edilmeli.' },
    );
    if (students[3]?.id) notes.push({ student_id: students[3].id, admin_id: adminUser.id, content: 'Emre programın yıldız öğrencisi. Referans olarak kullanılabilir. Mezuniyet sonrası mentor adayı.' });
    if (students[4]?.id) notes.push({ student_id: students[4].id, admin_id: adminUser.id, content: 'Barış 2 haftadır inactive. Ödeme de gecikmiş durumda. Son bir deneme olarak aranacak, yoksa programdan çıkarılabilir.' });

    if (notes.length > 0) {
      await supabase.from('admin_notes').insert(notes);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Demo data seeded successfully!',
      users_created: createdUsers.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Seed error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
