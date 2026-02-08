

# Tam Kontrol Mekanizmasi - Fotograf Yukleme, AI Analiz ve Topluluk Yeniden Tasarimi

Bu plan, ogrencilerin yasam alanlarina fotograf yuklemesi, gunluk kontrollerin AI tarafindan analiz edilip admine raporlanmasi ve topluluk sayfasinin gorsel paylasimli motivasyon platformuna donusturulmesini kapsamaktadir.

---

## 1. Depolama Altyapisi

Iki adet dosya deposu olusturulacak:
- **life-area-photos**: Yasam alani girisleri icin fotograf yukleme (ornek: antrenman selfie'si, yemek fotografi, kiyafet, temiz oda vs.)
- **community-images**: Topluluk paylasimlarina eklenen gorseller

Her iki depo da herkese acik (public) olacak, ancak yukleme/silme islemleri RLS ile korunacak.

---

## 2. Veritabani Degisiklikleri

### life_area_entries tablosu
- `photo_urls` (jsonb, default `'[]'`) -- Her giris icin birden fazla fotograf URL'si

### community_posts tablosu
- `image_url` (text, nullable) -- Paylasima eklenen gorsel
- `likes_count` (integer, default 0) -- Begeni sayisi
- `post_type` (text, default 'text') -- 'text', 'photo', 'milestone'

### Yeni tablo: community_likes
- `id` (uuid, PK)
- `post_id` (uuid, FK -> community_posts)
- `user_id` (uuid)
- `created_at` (timestamptz)
- Unique constraint: (post_id, user_id)
- RLS: Kullanici kendi like'larini yonetir, herkes gorebilir

### Yeni tablo: ai_analysis_reports
- `id` (uuid, PK)
- `user_id` (uuid)
- `analysis_date` (date)
- `area` (text, nullable) -- null ise genel analiz
- `summary` (text) -- AI tarafindan uretilen ozet
- `risk_level` (text) -- 'low', 'medium', 'high'
- `recommendations` (jsonb) -- AI onerileri
- `created_at` (timestamptz)
- RLS: Adminler tumunu gorur, ogrenciler sadece kendilerinkini gorur

---

## 3. Yasam Alanlari - Fotograf Yukleme

**LifeAreas.tsx** guncellenir:
- Her alan icin "Fotograf Ekle" butonu eklenir
- Ogrenci fotograf yukleyebilir (antrenman kaniti, yemek, kiyafet, oda temizligi vs.)
- Yuklemeler `life-area-photos` deposuna gider, URL `photo_urls` JSONB dizisine eklenir
- Yeni fotograf galerisi gorunumu: kucuk onizlemeler, tiklayinca buyuk goruntu
- Gecmis girislerde fotograflar da gosterilir

---

## 4. AI Analiz ve Raporlama Sistemi

### Edge Function: analyze-student

Bu fonksiyon belirli bir ogrencinin son 7 gunluk verilerini toplar ve AI ile analiz eder:

**Veri kaynaklari:**
- life_area_entries (son 7 gun, tum alanlar)
- checkins (son 7 gun, sabah + aksam)
- student_tasks (tamamlanan/bekleyen gorevler)

**AI Analizi:**
- Lovable AI (google/gemini-2.5-flash) kullanilarak ozet uretilir
- Risk seviyesi belirlenir (low/medium/high)
- Gelistirme onerileri olusturulur
- Sonuc `ai_analysis_reports` tablosuna kaydedilir

### Edge Function: analyze-all-students

Tum aktif ogrencileri iterate ederek tek tek analiz yapar. Admin tarafindan tetiklenir.

### Admin Paneli Guncellemesi

**AdminDashboard.tsx**'e eklenir:
- "AI Analiz Baslat" butonu -- tum ogrencileri analiz eder
- Son AI raporlarinin ozeti -- risk seviyesine gore sirali
- Yuksek riskli ogrenciler vurgulanir

**AdminStudentDetail.tsx**'e eklenir:
- "Analiz Et" butonu -- tek ogrenci icin AI analizi tetikler
- AI rapor gecmisi gosterilir (tarih, ozet, risk seviyesi, oneriler)
- Yasam alani fotograflari da goruntulenebilir

---

## 5. Topluluk Sayfasi Yeniden Tasarimi

Topluluk, ogrencilerin birbirini motive ettigi bir sosyal platform olarak yeniden tasarlanacak:

### Gorsel Tasarim
- Kartlar daha buyuk ve gorsel odakli
- Instagram tarzi gorsel paylasim alani
- Begeni butonu (kalp ikonu) ve sayaci
- Paylasim tipleri: metin, fotograf, donum noktasi (milestone)
- Motivasyon temalari: ates emojileri, basari rozetleri

### Ozellikler
- Fotograf paylasimi: Gorsel yukle + metin ekle
- Begeni sistemi: Kalp ikonu ile begeni, kullanici basina 1 begeni
- Paylasim tipleri: Normal metin, fotograf paylasimi, "Milestone" (ozel basari)
- Filtre: Tumu / Fotograflar / Milestones

### Sahte Veri
Topluluga 8-10 motivasyonel sahte paylasim eklenir:
- Antrenman fotograflari (placeholder gorsel URL'leri)
- "30 gun serisi!" milestone paylasimi
- Motivasyon mesajlari
- Begeni sayilari

---

## 6. Gunluk Kontrol Mekanizmasi

Mevcut check-in sistemine ek olarak yasam alanlari icin gunluk kontrol:

**LifeAreas.tsx** guncellenir:
- "Bugunun Durumu" ozet karti: Hangi alanlar dolduruldu, hangileri bos
- Kirmizi/yesil gostergeler: Doldurulmus alanlar yesil, eksikler kirmizi
- Bu veri AI analizinde kullanilir

---

## Teknik Uygulama Sirasi

1. Veritabani migrasyonu (depo + tablolar + RLS)
2. LifeAreas.tsx -- fotograf yukleme eklenmesi
3. Community.tsx -- yeniden tasarim + gorsel paylasim + begeni
4. Edge function: analyze-student
5. Edge function: analyze-all-students
6. AdminDashboard.tsx -- AI analiz tetikleme ve ozet goruntuleme
7. AdminStudentDetail.tsx -- ogrenci bazli AI raporu
8. Sahte veri eklenmesi (community_posts + community_likes + ai_analysis_reports)

---

## Dosya Degisiklikleri Ozeti

| Dosya | Islem |
|-------|-------|
| Migration SQL | Yeni: depo, tablolar, RLS |
| src/pages/student/LifeAreas.tsx | Fotograf yukleme + gunluk kontrol ozeti |
| src/pages/student/Community.tsx | Tam yeniden tasarim |
| supabase/functions/analyze-student/index.ts | Yeni: AI analiz fonksiyonu |
| supabase/functions/analyze-all-students/index.ts | Yeni: Toplu AI analiz |
| src/pages/admin/AdminDashboard.tsx | AI analiz butonu + ozet |
| src/pages/admin/AdminStudentDetail.tsx | Ogrenci AI raporu + fotograflar |

