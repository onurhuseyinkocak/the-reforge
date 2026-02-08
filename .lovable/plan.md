

# THE FORGE - Complete Rebuild Plan

## Admin Promotion Done
test@test.com has been successfully promoted to admin.

---

## What Already Exists (Will Be Updated)
- Auth system (login, register, forgot-password, AuthContext, ProtectedRoute)
- Dashboard layout with sidebar navigation
- Student pages: Dashboard, Check-in, Tasks, Progress, Messages, Profile
- Admin pages: Dashboard, Students, StudentDetail, Tasks, Messages, Payments
- Database tables: profiles, checkins, tasks, student_tasks, messages, payments, admin_notes, mentor_sessions, user_roles
- Forge theme (ember/dark) with design tokens

## What's New (To Be Built)

### 1. Application Flow (Major New Feature)
- **/apply** - Multi-step public form (no login required)
  - Step 1: Basic info (name, email, phone, age)
  - Step 2: Current situation rating 1-10 across life areas
  - Step 3: Commitment/motivation questions
  - Submit leads to "Application Under Review" page
- **/admin/applications** - Admin review queue (approve/reject)
- New `applications` database table
- Remove `/register` (enrollment is now application-based, not self-signup)

### 2. Life Areas Tracking (New Page)
- **/life-areas** - 7 tabs: Physical, Mental, Style, Environment, Social, Career, Finance
- Each tab tracks specific metrics (weight, mood, habits, goals, etc.)
- New `life_area_entries` database table

### 3. Resources Library (New Page)
- **/resources** - Phase-locked content library
- New `resources` database table with phase requirements

### 4. Community Feed (New Page)
- **/community** - Student feed, phase groups
- New `community_posts` database table

### 5. Enhanced Evening Check-in
- Add: day rating, priority review, gratitude fields
- Update existing `checkins` table with new columns

### 6. Enhanced Admin Features
- Admin broadcast messaging
- Application review with email notifications
- At-risk alerts (3+ days no check-in)

---

## Implementation Phases

### Phase 1: Database Schema Updates
Create migration for new tables and columns:
- `applications` table (name, email, phone, age, ratings JSON, commitment answers, status, created_at)
- `life_area_entries` table (user_id, area type enum, metrics JSON, date)
- `resources` table (title, description, url, type, phase_required, created_by)
- `community_posts` table (user_id, content, phase_group, likes, created_at)
- Add columns to `checkins`: `day_rating`, `priority_review`, `gratitude`
- RLS policies for all new tables

### Phase 2: Application Flow
- Create `/apply` page with 3-step form wizard
- Create "Application Under Review" confirmation page
- Create `/admin/applications` review page
- Update routing: remove `/register`, add `/apply`
- Edge function for sending approval emails (optional, can be deferred)

### Phase 3: Update Existing Pages
- Update DashboardLayout sidebar with new links (Life Areas, Resources, Community)
- Enhance student Dashboard with day counter
- Enhance Check-in evening form with new fields
- Update admin Dashboard with at-risk alerts (3+ days no check-in query)

### Phase 4: New Student Pages
- Build `/life-areas` with 7-tab interface and data entry forms
- Build `/resources` with phase-locked content cards
- Build `/community` with post feed and phase groups

### Phase 5: Admin Enhancements
- Add broadcast feature to `/admin/messages`
- Enhance `/admin/students` with better at-risk detection

### Phase 6: Re-seed Demo Data
- Update seed edge function with new table data (applications, life area entries, resources, community posts)

---

## Technical Details

### New Database Tables

```text
applications
+------------------+-------------------+
| Column           | Type              |
+------------------+-------------------+
| id               | uuid PK           |
| full_name        | text              |
| email            | text              |
| phone            | text              |
| age              | integer           |
| situation_ratings| jsonb             |
| commitment_answers| jsonb            |
| status           | text (pending/    |
|                  | approved/rejected)|
| reviewed_by      | uuid nullable     |
| reviewed_at      | timestamptz null  |
| created_at       | timestamptz       |
+------------------+-------------------+

life_area_entries
+------------------+-------------------+
| Column           | Type              |
+------------------+-------------------+
| id               | uuid PK           |
| user_id          | uuid              |
| area             | text (physical/   |
|                  | mental/style/etc) |
| metrics          | jsonb             |
| entry_date       | date              |
| created_at       | timestamptz       |
+------------------+-------------------+

resources
+------------------+-------------------+
| Column           | Type              |
+------------------+-------------------+
| id               | uuid PK           |
| title            | text              |
| description      | text              |
| content_url      | text              |
| content_type     | text              |
| phase_required   | integer           |
| created_by       | uuid              |
| created_at       | timestamptz       |
+------------------+-------------------+

community_posts
+------------------+-------------------+
| Column           | Type              |
+------------------+-------------------+
| id               | uuid PK           |
| user_id          | uuid              |
| content          | text              |
| phase_group      | integer           |
| created_at       | timestamptz       |
+------------------+-------------------+
```

### New/Updated Files
- `src/pages/Apply.tsx` (new - multi-step form)
- `src/pages/ApplicationSubmitted.tsx` (new - confirmation)
- `src/pages/student/LifeAreas.tsx` (new)
- `src/pages/student/Resources.tsx` (new)
- `src/pages/student/Community.tsx` (new)
- `src/pages/admin/AdminApplications.tsx` (new)
- Updated: `src/App.tsx` (new routes)
- Updated: `src/components/dashboard/DashboardLayout.tsx` (new sidebar links)
- Updated: `src/pages/student/CheckIn.tsx` (new evening fields)
- Updated: `src/pages/student/Dashboard.tsx` (day counter)
- Updated: `src/pages/admin/AdminDashboard.tsx` (at-risk alerts)
- Updated: `src/pages/admin/AdminMessages.tsx` (broadcast)
- Updated: `supabase/functions/seed-demo-data/index.ts` (new demo data)

### Route Changes
- Remove: `/register`
- Add: `/apply`, `/application-submitted`, `/life-areas`, `/resources`, `/community`, `/admin/applications`

