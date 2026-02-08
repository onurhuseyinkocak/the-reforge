

# Health Check & Fix Plan

## Issues Found

### 1. Broken Link: Login page links to /register (404)
- **File:** `src/pages/Login.tsx` line 90
- **Problem:** The `/register` route was removed from `App.tsx` but Login still links to it. Users see a 404.
- **Fix:** Change the link from `/register` to `/apply` and update text from "Kayit ol" to "Basvur".

### 2. Community page join will fail
- **File:** `src/pages/student/Community.tsx` line 20
- **Problem:** The query does `profiles!community_posts_user_id_fkey(full_name, current_phase)` but the FK `community_posts_user_id_fkey` points to `auth.users`, not `profiles`. Supabase can't resolve this join.
- **Fix:** Add a separate FK from `community_posts.user_id` to `profiles.user_id` via a new migration, OR change the query to use a two-step approach (fetch posts, then fetch profiles separately). The simplest fix is adding a FK to profiles and updating the join hint.

### 3. Dead file: Register.tsx
- **File:** `src/pages/Register.tsx`
- **Problem:** No route points to it. It's unused dead code.
- **Fix:** Delete the file to keep the codebase clean.

### 4. Resources page join issue
- **File:** `src/pages/student/Resources.tsx`
- **Problem:** The `resources` table has `created_by` column but no FK to profiles, so if we ever need to show who created a resource, it won't work. Currently not an issue since the query doesn't join.
- **Fix:** No action needed now.

---

## Implementation Steps

### Step 1: Database migration
Add a FK from `community_posts.user_id` to `profiles.user_id` so the join works:
```sql
ALTER TABLE public.community_posts 
  ADD CONSTRAINT community_posts_profile_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
```

### Step 2: Fix Community.tsx join
Update the select query to use the new FK hint:
```
profiles!community_posts_profile_fkey(full_name, current_phase)
```

### Step 3: Fix Login.tsx link
Change `/register` to `/apply` and update the link text.

### Step 4: Delete Register.tsx
Remove the dead file.

### Step 5: Verify all routes
Final route map after fixes:
- `/` -- Landing page (Index)
- `/login` -- Login page (links to /apply)
- `/apply` -- Application form (public)
- `/application-submitted` -- Confirmation
- `/forgot-password` -- Password reset
- `/dashboard`, `/check-in`, `/life-areas`, `/tasks`, `/progress`, `/resources`, `/community`, `/messages`, `/profile` -- Student routes (protected)
- `/admin`, `/admin/applications`, `/admin/students`, `/admin/students/:id`, `/admin/tasks`, `/admin/messages`, `/admin/payments` -- Admin routes (protected, role=admin)

All routes have corresponding components and imports in App.tsx. Sidebar links in DashboardLayout match the routes for both student and admin roles.

