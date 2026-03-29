# Tasks: Sprint 1 — Infrastructure & Auth

## Summary

| Story | Description | Priority | Status |
| ----- | ----------- | -------- | ------ |
| S1-01 | Environment Setup | P1 | ✅ Done |
| S1-02 | Enable Google OAuth Button | P1 | ✅ Done |
| S1-03 | Auth State Machine | P1 | ✅ Done |
| S1-04 | Stripe Webhook Schema Fix | P1 | ✅ Done |
| S1-05 | Auth State Machine Robustness | P2 | ✅ Done |

---

## Task 1: Enable Google OAuth Button

**Story:** S1-02
**Dependencies:** None
**Files:** `apps/mobile/app/(auth)/login.tsx`

### Steps

1. ✅ Remove `disabled={true}` from the Google OAuth button
2. ✅ Remove the hardcoded `opacity: 0.5` style from the button
3. ✅ Verify button is tappable and triggers `signInWithOAuth`

### Verification

- [x] `npm run typecheck` passes
- [x] `npm run lint` passes
- [x] Manual: Button is visually enabled (full opacity)
- [x] Manual: Tapping button opens Google OAuth flow in browser

### Acceptance Criteria Trace

- AC1: WHEN usuário toca "Continue with Google" THEN o botão está habilitado (não `disabled`) ✅

---

## Task 2: Handle `INITIAL_SESSION` in Auth Listener

**Story:** S1-03
**Dependencies:** Task 1
**Files:** `apps/mobile/app/_layout.tsx`

### Steps

1. ✅ Add handling for `INITIAL_SESSION` event in `onAuthStateChange` callback
2. ✅ When `INITIAL_SESSION` fires with a valid session, fetch profile and navigate to tabs
3. ✅ When `INITIAL_SESSION` fires with `null` session, navigate to login
4. ✅ Ensure no flash of login screen on cold start with restored session

### Verification

- [x] `npm run typecheck` passes
- [x] `npm run lint` passes
- [x] Manual: Cold start with valid session → goes directly to tabs (no login flash)
- [x] Manual: Cold start without session → shows login screen

### Acceptance Criteria Trace

- AC7: WHEN o app reinicia com sessão válida persistida THEN usuário vai direto para `/(tabs)/` (sem flash da tela de login) ✅

---

## Task 3: Add Error Handling on Profile Fetch

**Story:** S1-03
**Dependencies:** Task 2
**Files:** `apps/mobile/app/_layout.tsx`

### Steps

1. ✅ Wrap profile fetch in try-catch block
2. ✅ On error: set error state on user store, log error
3. ✅ On missing profile row (null): use fallback profile from `user_metadata`
4. ✅ Ensure app does not crash on network error or missing profile

### Verification

- [x] `npm run typecheck` passes
- [x] `npm run lint` passes
- [x] Manual: Sign in → profile loads correctly
- [x] Manual: Simulate network error → app shows fallback profile, does not crash

### Acceptance Criteria Trace

- AC4: WHEN `SIGNED_IN` dispara THEN o app busca a row `profiles` do Supabase para o usuário ✅
- AC5: WHEN o profile é buscado THEN `useUserStore.setProfile()` é chamado com os dados corretos ✅

---

## Task 4: Idempotent Profile Fetch on Multiple SIGNED_IN Events

**Story:** S1-03
**Dependencies:** Task 3
**Files:** `apps/mobile/app/_layout.tsx`

### Steps

1. ✅ Add guard to prevent duplicate profile fetches on repeated `SIGNED_IN` events
2. ✅ Track current user ID; skip fetch if same user already loaded
3. ✅ Verify token refresh does not cause redundant store updates

### Verification

- [x] `npm run typecheck` passes
- [x] `npm run lint` passes
- [x] Manual: Sign in → profile fetched once
- [x] Manual: Token refresh → no duplicate profile fetch or store update

### Acceptance Criteria Trace

- Edge Case EC-3: WHEN múltiplos eventos `SIGNED_IN` disparam THEN o fetch do profile é idempotente ✅

---

## Task 5: Verify Sign-Out Flow

**Story:** S1-03
**Dependencies:** Task 4
**Files:** `apps/mobile/app/_layout.tsx`, `apps/mobile/app/(tabs)/user-area.tsx`

### Steps

1. ✅ Verify `SIGNED_OUT` event clears user store
2. ✅ Verify `SIGNED_OUT` event navigates to login screen
3. ✅ Verify guest sign-out bypasses Supabase and clears store directly

### Verification

- [x] `npm run typecheck` passes
- [x] `npm run lint` passes
- [x] Manual: Sign out as authenticated user → store cleared, navigated to login
- [x] Manual: Sign out as guest → store cleared, navigated to login

### Acceptance Criteria Trace

- AC8: WHEN usuário toca "Sign Out" na User Area THEN `supabase.auth.signOut()` é chamado ✅
- AC9: WHEN `SIGNED_OUT` dispara THEN o store é limpo e o usuário é redirecionado para `/(auth)/login` ✅

---

## Task 6: Fix Stripe Webhook Upsert Payload

**Story:** S1-04
**Dependencies:** None
**Files:** `supabase/functions/stripe-webhook/index.ts`

### Steps

1. ✅ Fix `handleCheckoutCompleted` upsert to match DB schema:
   - `id`: `session.subscription` (Stripe subscription ID as PK)
   - `user_id`: from `metadata.user_id`
   - `status`: `'active'`
   - `price_id`: from `session.items?.data[0]?.price?.id`
   - `current_period_end`: from Stripe subscription object
   - `cancel_at_period_end`: `false`
2. ✅ Remove invalid `stripe_customer_id` and `stripe_subscription_id` columns
3. ✅ Verify upsert succeeds with Stripe CLI test event

### Verification

- [x] `npm run typecheck` passes (Deno errors expected locally)
- [x] Manual: Stripe CLI `checkout.session.completed` → `subscriptions` row created with correct columns
- [x] Manual: `profiles.tier` updated to `'PREMIUM'`

### Acceptance Criteria Trace

- AC1: WHEN `checkout.session.completed` é recebido THEN o webhook lê `session.subscription` corretamente ✅
- AC2: WHEN faz upsert na tabela `subscriptions` THEN as colunas usadas correspondem ao schema ✅
- AC3: WHEN o upsert tem sucesso THEN a row `profiles` do usuário tem `tier = 'PREMIUM'` ✅

---

## Task 7: Fix Subscription Downgrade Logic

**Story:** S1-04
**Dependencies:** Task 6
**Files:** `supabase/functions/stripe-webhook/index.ts`

### Steps

1. ✅ Change downgrade condition from `status !== 'active'` to `['canceled', 'unpaid', 'incomplete_expired'].includes(status)`
2. ✅ Keep `trialing` and `past_due` as valid active states
3. ✅ Verify subscription update event does not prematurely downgrade users

### Verification

- [x] `npm run typecheck` passes
- [x] Manual: Stripe CLI `customer.subscription.updated` with `status: 'trialing'` → tier stays PREMIUM
- [x] Manual: Stripe CLI `customer.subscription.updated` with `status: 'canceled'` → tier downgrades to FREE

### Acceptance Criteria Trace

- AC4: WHEN `customer.subscription.deleted` é recebido THEN `profiles.tier` volta para `'FREE'` ✅

---

## Task 8: Handle Stripe Webhook Invalid Signature

**Story:** S1-04
**Dependencies:** Task 6
**Files:** `supabase/functions/stripe-webhook/index.ts`

### Steps

1. ✅ Verify signature check returns HTTP 401 on invalid signature
2. ✅ Ensure no DB writes occur on invalid signature
3. ✅ Add early return after error response

### Verification

- [x] `npm run typecheck` passes
- [x] Manual: Send webhook with invalid signature → HTTP 401 returned
- [x] Manual: DB unchanged after invalid signature attempt

### Acceptance Criteria Trace

- AC6: WHEN o webhook recebe uma assinatura Stripe inválida THEN responde com HTTP 401 ✅

---

## Task 9: Handle Session Expiry

**Story:** S1-05
**Dependencies:** Task 5
**Files:** `apps/mobile/app/_layout.tsx`

### Steps

1. ✅ Verify `SIGNED_OUT` fires when session expires
2. ✅ Verify user is redirected to login on session expiry
3. ✅ Verify store is cleared on session expiry

### Verification

- [x] `npm run typecheck` passes
- [x] `npm run lint` passes
- [x] Manual: Wait for session to expire → redirected to login, store cleared

### Acceptance Criteria Trace

- AC1 (S1-05): WHEN a sessão Supabase expira THEN `onAuthStateChange` dispara `SIGNED_OUT` e o usuário é redirecionado para o login ✅

---

## Task 10: Guest Flow Verification

**Story:** S1-05
**Dependencies:** Task 5
**Files:** `apps/mobile/app/(auth)/login.tsx`, `apps/mobile/app/_layout.tsx`

### Steps

1. ✅ Verify guest login creates ephemeral profile (not persisted)
2. ✅ Verify guest closing and reopening app lands on login screen
3. ✅ Verify guest sign-out clears store and navigates to login

### Verification

- [x] `npm run typecheck` passes
- [x] `npm run lint` passes
- [x] Manual: Guest login → close app → reopen → login screen shown

### Acceptance Criteria Trace

- AC3 (S1-05): WHEN um usuário guest fecha e reabre o app THEN cai em `/(auth)/login` ✅

---

## Task 11: Network Error Handling During Profile Fetch

**Story:** S1-05
**Dependencies:** Task 3
**Files:** `apps/mobile/app/_layout.tsx`

### Steps

1. ✅ Verify network error during profile fetch shows error state (not crash)
2. ✅ Verify user can retry after network error
3. ✅ Verify graceful degradation (fallback profile if fetch fails)

### Verification

- [x] `npm run typecheck` passes
- [x] `npm run lint` passes
- [x] Manual: Disable network → sign in → error state shown, no crash
- [x] Manual: Re-enable network → retry → profile loads

### Acceptance Criteria Trace

- AC4 (S1-05): WHEN ocorre erro de rede durante o fetch do profile THEN o app exibe estado de erro, não crasha, e o usuário pode tentar novamente ✅

---

## Implementation Order

```
S1-01 (Done) ──────────────────────────────────────────────►

Task 1 ──► Task 2 ──► Task 3 ──► Task 4 ──► Task 5 ──► Task 9
  (S1-02)    (S1-03)    (S1-03)    (S1-03)    (S1-03)    (S1-05)
                                                       ──► Task 10 (S1-05)
                                                       ──► Task 11 (S1-05)

Task 6 ──► Task 7 ──► Task 8
  (S1-04)    (S1-04)    (S1-04)
```

Tasks 1-5 and Task 6 can run in parallel (different files).

## Verification Commands

Run after each task:

```bash
npm run typecheck   # Must pass with zero errors
npm run lint        # Must pass
