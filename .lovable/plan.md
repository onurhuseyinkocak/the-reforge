

## Build Error Analysis & Fix Plan

### Error Categories

**1. Edge Functions — TypeScript type issues (Deno)**

**`supabase/functions/check-achievements/index.ts`**
- `data?.streak ?? 0` and similar comparisons fail because `createClient` without a typed Database returns `{}` typed data, not numeric fields. Fix: cast `data` as `any` or use explicit type assertions like `Number(data?.streak ?? 0)`.
- `ctx: CheckContext` fails because `admin: ReturnType<typeof createClient>` resolves to a generic incompatible type. Fix: type `admin` as `any` in the interface.

**`supabase/functions/create-user/index.ts`** and **`promote-admin/index.ts`** and **`seed-demo-data/index.ts`**
- `err.message` on `unknown` type. Fix: cast `err` as `Error` or use `(err as any).message`.

**`supabase/functions/lemon-squeezy-webhook/index.ts`**
- `createHmac` doesn't exist in `deno.land/std@0.168.0/crypto/mod.ts`. Fix: use the Web Crypto API (`crypto.subtle.importKey` + `crypto.subtle.sign`) instead, which is natively available in Deno.

---

**2. Frontend TypeScript — `useSubscription.ts`**
- `subscriptions` table doesn't exist in `src/integrations/supabase/types.ts`. The Supabase client is typed with `Database` which has no `subscriptions` table, causing "Type instantiation is excessively deep" and "never" errors.
- Fix: Query with explicit type bypass using `supabase.from('subscriptions' as any)` or define a local type and cast the result. This avoids modifying the auto-generated types file.

---

**3. Frontend TypeScript — Framer Motion `ease` type**

**`src/pages/Apply.tsx`** (3 places) and **`src/pages/Pricing.tsx`** (cardVariants)
- `ease: [0.22, 1, 0.36, 1]` as a plain number array fails — Framer Motion expects `Easing[]` or `EasingFunction` type.
- Fix: Add `as const` to the array: `ease: [0.22, 1, 0.36, 1] as const`

**`src/pages/admin/AdminApplications.tsx`**
- `item` variant has `ease: "easeOut"` inside `transition` inside a `Variants` object. This fails as `show` property type incompatibility. Fix: use `as const` on the variants object.

---

### Files to Edit

1. `supabase/functions/check-achievements/index.ts` — Fix `CheckContext.admin` type + numeric comparisons
2. `supabase/functions/create-user/index.ts` — Fix `err` unknown type
3. `supabase/functions/promote-admin/index.ts` — Fix `err` unknown type
4. `supabase/functions/seed-demo-data/index.ts` — Fix `err` unknown type
5. `supabase/functions/lemon-squeezy-webhook/index.ts` — Replace `createHmac` with Web Crypto API
6. `src/hooks/useSubscription.ts` — Fix `subscriptions` table type error with `as any` cast
7. `src/pages/Apply.tsx` — Add `as const` to all 3 `ease` arrays in `stepTransition` and wherever used inline
8. `src/pages/Pricing.tsx` — Add `as const` to `cardVariants.visible.transition.ease`
9. `src/pages/admin/AdminApplications.tsx` — Add `as const` to `item` variant

### No Database Changes Required

All fixes are TypeScript-level. No schema migrations needed.

