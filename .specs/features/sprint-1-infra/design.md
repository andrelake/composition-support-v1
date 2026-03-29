# Design: Sprint 1 — Infrastructure & Auth

## Architecture Overview

This sprint focuses on connecting the app to production infrastructure (Supabase, Stripe) and ensuring the authentication state machine is robust. The changes are surgical — touching only the files needed to make auth, OAuth, and webhook integration work end-to-end.

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Expo App                             │
├─────────────────────────────────────────────────────────────┤
│  _layout.tsx (Auth Listener)                                │
│  ├── onAuthStateChange → SIGNED_IN → fetchProfile → setProfile │
│  ├── onAuthStateChange → SIGNED_OUT → clearUser → navigate    │
│  └── onAuthStateChange → INITIAL_SESSION → handle restore     │
├─────────────────────────────────────────────────────────────┤
│  login.tsx (Login Screen)                                   │
│  ├── Google OAuth button (ENABLED)                          │
│  ├── Guest login (ephemeral)                                │
│  └── Error handling + loading states                        │
├─────────────────────────────────────────────────────────────┤
│  user-area.tsx (Profile + Sign Out)                         │
│  ├── Profile display (name, email, tier)                    │
│  ├── Sign out flow                                          │
│  └── Language switcher                                      │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase (Auth + DB + Edge Functions)           │
├─────────────────────────────────────────────────────────────┤
│  Auth: Google OAuth provider                                │
│  DB: profiles table, subscriptions table                    │
│  Edge Function: stripe-webhook                              │
│  RLS: User-level access control                             │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Stripe (Payments)                         │
├─────────────────────────────────────────────────────────────┤
│  Checkout Sessions                                          │
│  Webhook Events: checkout.session.completed                 │
│                 customer.subscription.updated               │
│                 customer.subscription.deleted                │
│                 invoice.payment_failed                       │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Auth Flow (Google OAuth)

```
User taps "Continue with Google"
    │
    ▼
login.tsx: supabase.auth.signInWithOAuth({ provider: 'google' })
    │
    ▼
Browser/WebView opens Google OAuth
    │
    ▼
User authenticates with Google
    │
    ▼
Redirect to compositionhelper:///(tabs)/ (deep link)
    │
    ▼
Supabase SDK detects session from redirect URL
    │
    ▼
onAuthStateChange fires: event = 'SIGNED_IN'
    │
    ▼
_layout.tsx:
    1. Fetch profiles row for user.id
    2. Build UserProfile object
    3. Call useUserStore.setProfile(profile)
    4. router.replace('/(tabs)')
    │
    ▼
User lands on Home screen with profile loaded
```

### Auth Flow (Cold Start with Restored Session)

```
App opens (cold start)
    │
    ▼
_layout.tsx useEffect fires
    │
    ▼
supabase.auth.getSession() → returns cached session
    │
    ▼
onAuthStateChange fires: event = 'INITIAL_SESSION' (or 'SIGNED_IN')
    │
    ▼
_layout.tsx:
    1. Fetch profiles row
    2. Build UserProfile
    3. setProfile()
    4. router.replace('/(tabs)')
    │
    ▼
User goes directly to Home (no login flash)
```

### Sign-Out Flow

```
User taps "Sign Out" in user-area.tsx
    │
    ▼
Confirmation dialog shown
    │
    ├─ Guest: clearUser() + router.replace('/(auth)/login')
    │
    └─ Authenticated: supabase.auth.signOut()
            │
            ▼
        onAuthStateChange fires: event = 'SIGNED_OUT'
            │
            ▼
        _layout.tsx: clearUser() + router.replace('/(auth)/login')
```

### Stripe Webhook Flow

```
User completes Stripe Checkout
    │
    ▼
Stripe sends webhook: checkout.session.completed
    │
    ▼
stripe-webhook Edge Function:
    1. Verify Stripe signature
    2. Extract metadata.user_id
    3. Upsert subscriptions table (id = stripe subscription ID)
    4. Update profiles.tier = 'PREMIUM'
    │
    ▼
Supabase DB updated
    │
    ▼
On next app restart or auth refresh:
    _layout.tsx re-fetches profile → gets PREMIUM tier
```

## Technical Decisions

### TD-1: Handle `INITIAL_SESSION` Event

**Decision:** Add explicit handling for `INITIAL_SESSION` in the auth listener.

**Rationale:**
- Supabase fires `INITIAL_SESSION` on app startup with the restored session
- Without handling this, users may see a flash of the login screen before being redirected
- The `SIGNED_IN` event may or may not fire on cold start depending on timing

**Implementation:**
```typescript
onAuthStateChange: (event, session) => {
  if (event === 'INITIAL_SESSION' && session) {
    // Restore profile from session
  } else if (event === 'SIGNED_IN' && session) {
    // Fetch profile
  } else if (event === 'SIGNED_OUT') {
    // Clear and navigate
  }
}
```

### TD-2: Fix Stripe Webhook Schema Mismatch

**Decision:** Align webhook upsert payload with actual DB schema.

**Rationale:**
- The webhook currently uses `stripe_customer_id` and `stripe_subscription_id` columns
- The migration defines `id` (PK), `user_id`, `status`, `price_id`, `current_period_end`, `cancel_at_period_end`
- The mismatch causes silent failures on subscription creation

**Implementation:**
```typescript
.upsert({
  id: session.subscription, // Stripe subscription ID as PK
  user_id: userId,
  status: 'active',
  price_id: session.items?.data[0]?.price?.id,
  current_period_end: new Date(session.current_period_end * 1000).toISOString(),
  cancel_at_period_end: false
})
```

### TD-3: Downgrade Logic for Subscription Updates

**Decision:** Only downgrade on `canceled`, `unpaid`, or `incomplete_expired` status.

**Rationale:**
- Stripe has multiple subscription statuses: `active`, `trialing`, `past_due`, `canceled`, `unpaid`, `incomplete`, `incomplete_expired`
- `trialing` is a valid active state (user is in trial period)
- `past_due` may warrant a grace period before downgrading
- Only `canceled`, `unpaid`, and `incomplete_expired` should trigger immediate downgrade

**Implementation:**
```typescript
const shouldDowngrade = ['canceled', 'unpaid', 'incomplete_expired'].includes(status);
if (shouldDowngrade) {
  // Downgrade to FREE
}
```

### TD-4: Error Handling on Profile Fetch

**Decision:** Add try-catch around profile fetch with graceful fallback.

**Rationale:**
- Network errors, RLS misconfiguration, or missing profile rows can cause crashes
- The user should see an error state, not a crash
- The fallback profile from `user_metadata` provides basic functionality

**Implementation:**
```typescript
try {
  const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
  if (data) {
    setProfile(mapToUserProfile(data));
  } else {
    // Fallback from user_metadata
    setProfile(createFallbackProfile(session.user));
  }
} catch (error) {
  // Set error state, allow retry
  setError('Failed to load profile');
}
```

### TD-5: Idempotency for Stripe Webhooks

**Decision:** Use upsert with conflict resolution for subscription writes.

**Rationale:**
- Stripe may deliver the same event multiple times
- Without idempotency, duplicate events could cause inconsistent state
- The `upsert` on `checkout.session.completed` already handles this
- For other events, we rely on the natural idempotency of update operations

**Implementation:**
- `checkout.session.completed`: Use `upsert` (already idempotent)
- `customer.subscription.updated`: Use `update` (idempotent if status unchanged)
- `customer.subscription.deleted`: Use `update` (idempotent if already deleted)

## Files to Modify

| File | Story | Change |
| ---- | ----- | ------ |
| `apps/mobile/.env` | S1-01 | Already populated ✅ |
| `apps/mobile/app/(auth)/login.tsx:56` | S1-02 | Remove `disabled={true}` and `opacity: 0.5` |
| `apps/mobile/app/_layout.tsx` | S1-03 | Add `INITIAL_SESSION` handling, error handling on profile fetch |
| `supabase/functions/stripe-webhook/index.ts:106-112` | S1-04 | Fix upsert payload to match DB schema |
| `supabase/functions/stripe-webhook/index.ts:127` | S1-04 | Fix downgrade logic (only on canceled/unpaid/incomplete_expired) |
| `apps/mobile/app/_layout.tsx` | S1-05 | Add error state, retry logic, session expiry handling |

## Edge Cases

| ID | Scenario | Expected Behavior |
| -- | -------- | ----------------- |
| EC-1 | User cancels OAuth flow | App returns to login screen without error |
| EC-2 | Profile row missing (trigger delayed) | Fallback profile from `user_metadata`, no crash |
| EC-3 | Multiple `SIGNED_IN` events (token refresh) | Idempotent profile fetch (no duplicate store updates) |
| EC-4 | Network error during profile fetch | Error state displayed, retry button available |
| EC-5 | Session expires while app is open | `SIGNED_OUT` fires, user redirected to login |
| EC-6 | Stripe webhook receives invalid signature | HTTP 401 response, no DB writes |
| EC-7 | Guest user closes and reopens app | Falls to login screen (guest not persisted) |
| EC-8 | Cold start with valid session | User goes directly to Home (no login flash) |

## Verification Gates

After each implementation step:

1. **Typecheck:** `npm run typecheck` — must pass with zero errors
2. **Lint:** `npm run lint` — must pass
3. **Manual testing:**
   - Google OAuth end-to-end flow
   - Sign out flow
   - Cold start with restored session
   - Stripe webhook simulation (using Stripe CLI)

## Implementation Order

| Step | Story | Dependency | Rationale |
| ---- | ----- | ---------- | --------- |
| 1 | S1-01 | None | Already done — env vars populated |
| 2 | S1-02 | None | Simplest change — enables testing OAuth |
| 3 | S1-03 | S1-02 | Auth state machine — depends on OAuth working |
| 4 | S1-04 | None | Independent — can be done in parallel |
| 5 | S1-05 | S1-03 | Robustness — depends on base auth flow |

## Open Questions

None — all requirements are clear from the spec.
