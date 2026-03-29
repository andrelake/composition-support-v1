# Security Fixes — Sprint 1

**Feature:** security-fixes
**Sprint:** 1 (Infrastructure & Auth)
**Derived from:** Security Report — Composition Support (Sprint 1)
**Date:** 2026-03-29
**Findings:** 3 (1 High, 2 Medium)

---

## Problem Statement

A security review of Sprint 1 infrastructure identified 3 actionable findings:
the Stripe webhook silently corrupts billing records by omitting required columns,
the webhook returns the wrong HTTP status for missing signatures, and guest
identity relies on a hardcoded magic string that is fragile and one refactor
away from a persistence bug.

---

## Goals

- [ ] Webhook populates all `subscriptions` columns on `checkout.session.completed`
- [ ] Webhook returns HTTP 401 (not 400) when `stripe-signature` header is absent
- [ ] Guest identity uses per-session UUIDs; persistence guard and sign-out
      detection are decoupled from the guest id string

---

## Out of Scope

| Item | Reason |
| ---- | ------ |
| Stripe Checkout UI | Sprint 2 |
| Webhook retry/idempotency hardening | Sprint 4 |
| Rate limiting on webhook endpoint | Sprint 4 |

---

## Architecture

### Component Map

```
┌─────────────────────────────────────────────────────────────┐
│                    stripe-webhook/index.ts                    │
├─────────────────────────────────────────────────────────────┤
│  serve()                                                     │
│  ├── signature guard: 400 → 401                [Task 2]     │
│  ├── checkout.session.completed                              │
│  │   └── handleCheckoutCompleted()                           │
│  │       ├── stripe.subscriptions.retrieve()   [Task 1]     │
│  │       └── supabase.upsert(subscriptions)    [Task 1]     │
│  ├── customer.subscription.updated  (unchanged)             │
│  ├── customer.subscription.deleted   (unchanged)            │
│  └── invoice.payment_failed          (unchanged)            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Mobile App (Guest Flow)                   │
├─────────────────────────────────────────────────────────────┤
│  login.tsx:41                                                │
│  └── id: `guest-${crypto.randomUUID()}`        [Task 3a]    │
├─────────────────────────────────────────────────────────────┤
│  user-area.tsx:25                                            │
│  └── !profile?.email (instead of id === 'guest')[Task 3b]   │
├─────────────────────────────────────────────────────────────┤
│  useUserStore.ts:40                                          │
│  └── id.startsWith('guest-') (instead of ===)  [Task 3c]    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow: Webhook (Task 1)

```
BEFORE:
checkout.session.completed
  → handleCheckoutCompleted(session)
    → upsert({ id, user_id, status })
      // price_id = NULL, current_period_end = NULL ← silent data loss

AFTER:
checkout.session.completed
  → handleCheckoutCompleted(session)
    → stripe.subscriptions.retrieve(subscriptionId)
    → upsert({
         id: subscriptionId,
         user_id: userId,
         status: 'active',
         price_id: subscription.items.data[0]?.price?.id ?? null,
         current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
         cancel_at_period_end: subscription.cancel_at_period_end,
       })
```

### Data Flow: Guest Identity (Task 3)

```
BEFORE:
login.tsx: id = 'guest' (fixed, predictable)
  → useUserStore persist guard: id === 'guest'
  → user-area.tsx sign-out: id === 'guest'

AFTER:
login.tsx: id = `guest-${crypto.randomUUID()}` (unique per session)
  → useUserStore persist guard: id.startsWith('guest-')
  → user-area.tsx sign-out: !profile?.email (semantic check)
```

---

## Technical Decisions

### D-1: Retrieve Full Subscription on Checkout (H-01)

**Decision:** Call `stripe.subscriptions.retrieve(subscriptionId)` inside
`handleCheckoutCompleted` before the upsert.

**Rationale:** The `checkout.session.completed` event carries only the
subscription ID — not `price_id`, `current_period_end`, or
`cancel_at_period_end`. These fields require a separate API call. Without it,
the `subscriptions` row is created with NULLs for columns that downstream
features (tier expiry checks, billing display) depend on.

**Risk:** Adds ~200ms latency to the webhook handler. Acceptable — Stripe
expects responses within 30s, and the retrieve call is <1s.

### D-2: HTTP 401 for Missing Signature (M-01)

**Decision:** Change the missing-signature guard from `status: 400` to
`status: 401`.

**Rationale:** An absent `stripe-signature` header is an authentication
failure. The invalid-signature case (line 38) already returns 401. The
inconsistency (400 vs 401) creates false positives in monitoring/alerting
that distinguish client errors from auth failures.

### D-3: Guest UUID + Semantic Detection (M-03)

**Decision:** Use `crypto.randomUUID()` with a `guest-` prefix for guest ids;
detect guests by `!profile?.email` in the UI and `startsWith('guest-')` in
the store.

**Rationale:**
- `crypto.randomUUID()` is available globally in Expo SDK 52+ (RN 0.73+).
- The `guest-` prefix preserves the distinction from Supabase UUIDs (which
  are format `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` without prefix).
- Email-based detection is semantically correct: a guest is a user without
  a Supabase-verified email. It works regardless of the id format.
- The store guard uses `startsWith('guest-')` so any future guest id
  generation strategy is covered.

---

## Edge Cases

| ID | Scenario | Handling |
| -- | -------- | -------- |
| E-1 | `stripe.subscriptions.retrieve()` throws (network error) | Error is logged; subscription row still has `id + user_id + status` (better than crash, `price_id`/`current_period_end` remain NULL — acceptable degradation) |
| E-2 | `subscription.items.data` is empty array | `price_id` falls back to `null` via `?? null` |
| E-3 | Guest profile has empty email (existing behavior) | `!profile?.email` is `true` → correct guest detection |
| E-4 | `crypto.randomUUID()` unavailable | Expo SDK 52+ requires RN 0.73+ which ships it globally; not a real risk |
| E-5 | Stripe sends duplicate `checkout.session.completed` | `upsert` on `id` is naturally idempotent (no change) |

---

## Tasks

### Task 1: Webhook — Retrieve Full Stripe Subscription (H-01)

**File:** `supabase/functions/stripe-webhook/index.ts:85-111`
**Dependencies:** None

**Change:** In `handleCheckoutCompleted`, after extracting `subscriptionId`:

1. Add `const subscription = await stripe.subscriptions.retrieve(subscriptionId);`
2. Extend the upsert payload:

```typescript
const { error: subError } = await supabase
  .from('subscriptions')
  .upsert({
    id: subscriptionId,
    user_id: userId,
    status: 'active',
    price_id: subscription.items.data[0]?.price?.id ?? null,
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });
```

**Verification:**
- [ ] Stripe CLI test event `checkout.session.completed` → `subscriptions` row has all fields populated (no NULLs for `price_id`, `current_period_end`)
- [ ] `profiles.tier` is still `PREMIUM`

---

### Task 2: Webhook — Return 401 on Missing Signature (M-01)

**File:** `supabase/functions/stripe-webhook/index.ts:28`
**Dependencies:** None

**Change:** Single line — change `status: 400` to `status: 401`.

```typescript
// Before:
return new Response('Missing stripe-signature header', { status: 400 });

// After:
return new Response('Missing stripe-signature header', { status: 401 });
```

**Verification:**
- [ ] POST to webhook URL without `stripe-signature` header → HTTP `401`
- [ ] POST with invalid signature → HTTP `401` (unchanged)

---

### Task 3a: Guest Identity — UUID in login.tsx (M-03)

**File:** `apps/mobile/app/(auth)/login.tsx:41`
**Dependencies:** None

**Change:** Replace `id: 'guest'` with `id: `guest-${crypto.randomUUID()}``.

**Verification:**
- [ ] `npm run typecheck` passes
- [ ] Login as guest → profile has unique id like `guest-a1b2c3d4-...`

---

### Task 3b: Guest Detection — Email Check in user-area.tsx (M-03)

**File:** `apps/mobile/app/(tabs)/user-area.tsx:25`
**Dependencies:** Task 3a

**Change:** Replace `profile?.id === 'guest'` with `!profile?.email`.

**Verification:**
- [ ] `npm run typecheck` passes
- [ ] Sign out as guest → clears store, navigates to login

---

### Task 3c: Persistence Guard — Prefix Check in useUserStore.ts (M-03)

**File:** `packages/store/src/useUserStore.ts:40`
**Dependencies:** Task 3a

**Change:** Replace `state.profile?.id === 'guest'` with
`state.profile?.id?.startsWith('guest-')`.

**Verification:**
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] Guest login → close app → reopen → lands on login screen (not persisted)

---

## Execution Order

```
Task 1 (H-01) — webhook upsert    ──► independently fixable
Task 2 (M-01) — 401 status        ──► independently fixable (same file, different line)

Task 3a (M-03) — guest UUID       ──► depends on nothing
Task 3b (M-03) — sign-out guard   ──► depends on 3a
Task 3c (M-03) — store persist    ──► depends on 3a
```

Tasks 1+2 run in parallel with Task 3 (different files).

---

## Final Verification

After all tasks:

```bash
npm run typecheck && npm run lint
```

Both must pass with zero errors/warnings.

---

## Requirement Traceability

| ID | Finding | Task | Status |
| -- | ------- | ---- | ------ |
| SEC-01 | H-01: Webhook incomplete upsert | Task 1 | Pending |
| SEC-02 | M-01: Wrong HTTP status for missing signature | Task 2 | Pending |
| SEC-03 | M-03: Guest identity uses hardcoded string | Task 3a, 3b, 3c | Pending |
