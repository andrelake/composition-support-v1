# Architecture - Composition Support

## System Overview

**Composition Helper** is a **freemium music theory education app** centered on a Circle of Fifths roulette wheel:

1. **Core Mechanic:** Spin the wheel → randomly select musical key
2. **Context Display:** Show full harmonic context (scale, diatonic chords, modes, cadences)
3. **Freemium Gate:** Cadence progressions (4 genres) locked behind subscription
4. **Auth:** Google OAuth + guest login (Supabase)
5. **Monetization:** Stripe subscription integration

**Architecture Pattern:** Layered + Modular Monorepo

```
┌─────────────────────────────────────────────────────────┐
│  UI Layer (Expo Mobile App)                             │
│  ├─ Expo Router (file-based routes)                     │
│  ├─ React Components (roulette, dashboard, auth)        │
│  ├─ styled-components (theme-aware CSS-in-JS)           │
│  ├─ i18n hooks (useTranslation)                         │
│  └─ Zustand store hooks (useAppStore, useUserStore)     │
├─────────────────────────────────────────────────────────┤
│  Business Logic Packages (@cs/*)                        │
│  ├─ @cs/music-engine: Pure music theory functions       │
│  ├─ @cs/store: Zustand stores + types                   │
│  ├─ @cs/locales: i18n setup + translations              │
│  └─ @cs/supabase: Supabase client singleton             │
├─────────────────────────────────────────────────────────┤
│  Backend Services                                        │
│  ├─ Supabase Auth (OAuth + session persistence)         │
│  ├─ Supabase DB (profiles, subscriptions)               │
│  ├─ Stripe API (via Deno Edge Function)                 │
│  └─ Email service (Resend, placeholder in webhook)      │
└─────────────────────────────────────────────────────────┘
```

---

## Monorepo Structure

### Directory Layout

```
composition-support/
├── apps/
│   └── mobile/                          ← Single Expo app (@cs/mobile)
│       ├── app/                         ← Expo Router routes
│       │   ├── _layout.tsx              ← Root layout
│       │   ├── index.tsx                ← Entry (auth redirect)
│       │   ├── (auth)/login.tsx         ← Login screen
│       │   └── (tabs)/
│       │       ├── _layout.tsx          ← Tab navigator
│       │       ├── index.tsx            ← Home (roulette + dashboard)
│       │       └── user-area.tsx        ← Profile/subscription
│       ├── src/
│       │   ├── components/              ← React components
│       │   ├── theme/index.ts           ← Design tokens
│       │   └── (generated assets)
│       ├── app.json                     ← Expo config
│       ├── eas.json                     ← EAS build config
│       ├── babel.config.js              ← Babel + module resolver
│       ├── metro.config.js              ← Metro (monorepo support)
│       └── tsconfig.json                ← App TS config
│
├── packages/
│   ├── music-engine/                    ← Pure music theory (@cs/music-engine)
│   │   └── src/
│   │       ├── types.ts                 ← Note, Tonality, Chord, HarmonyResult
│   │       ├── constants.ts             ← CIRCLE_OF_FIFTHS, INTERVALS, CADENCES
│   │       ├── engine.ts                ← calculateHarmony, getScale, etc.
│   │       └── index.ts                 ← Public re-exports
│   │
│   ├── store/                           ← Zustand stores (@cs/store)
│   │   └── src/
│   │       ├── types.ts                 ← UserTier, UserProfile, PaymentMethod
│   │       ├── useAppStore.ts           ← App state (currentKey, harmonyResult)
│   │       ├── useUserStore.ts          ← User state (profile, billing)
│   │       └── index.ts                 ← Public re-exports
│   │
│   ├── locales/                         ← i18n setup (@cs/locales)
│   │   └── src/
│   │       ├── index.ts                 ← i18n initialization
│   │       └── translations/
│   │           ├── en.json
│   │           ├── pt-br.json
│   │           └── es.json
│   │
│   └── supabase/                        ← Supabase client (@cs/supabase)
│       └── src/
│           ├── client.ts                ← createClient + config
│           └── index.ts                 ← Re-exports
│
├── supabase/
│   ├── migrations/
│   │   └── 20240101000000_initial.sql   ← profiles + subscriptions tables
│   └── functions/
│       └── stripe-webhook/index.ts      ← Deno Edge Function (Stripe events)
│
├── .github/workflows/
│   ├── ci.yml                           ← Type check + lint
│   ├── deploy-web.yml                   ← Web build → Vercel
│   └── eas-update.yml                   ← EAS OTA update
│
├── .specs/                              ← TLC SDD documentation (this folder)
│   ├── project/
│   ├── codebase/
│   └── features/
│
├── .opencode/                           ← Agent skills + templates
├── turbo.json                           ← Turborepo pipeline
├── tsconfig.base.json                   ← Shared TS config (strict)
├── package.json                         ← Root workspaces
├── package-lock.json                    ← Monorepo lockfile
└── AGENTS.md                            ← Agent reference (will become .specs/)
```

### Why This Structure?

- **Single app, multiple packages:** Separation of concerns
- **No package build step:** Babel + Metro resolve `@cs/*` directly to `.ts` source
- **Shared base config:** TypeScript `tsconfig.base.json` enforces consistency
- **Turborepo orchestration:** Runs tasks in dependency order

---

## Routing (Expo Router)

### File-Based Routes

| Route | File | Screen | Purpose |
|---|---|---|---|
| `/` | `app/index.tsx` | None (redirect) | Auth check → `/(tabs)/` or `/(auth)/login` |
| `/(auth)/login` | `app/(auth)/login.tsx` | Login | Google OAuth + Guest login |
| `/(tabs)/` | `app/(tabs)/index.tsx` | Home | Roulette wheel + dashboard cards |
| `/(tabs)/user-area` | `app/(tabs)/user-area.tsx` | Profile | User profile, subscription, language |

### Deep-Link Scheme

- **Scheme:** `compositionhelper://`
- **Used for:** OAuth redirect, in-app navigation

### Root Layout (`_layout.tsx`)

```
_layout.tsx
├─ initI18n()                    [Initialize i18n once]
├─ supabase.auth.onAuthStateChange listener
│  ├─ SIGNED_IN → fetch profile → setProfile() → navigate /(tabs)
│  └─ SIGNED_OUT → clearUser() → navigate /(auth)/login
└─ ThemeProvider + Stack navigator
```

---

## Component Hierarchy

### Home Screen (Roulette + Dashboard)

```
Home (/(tabs)/index.tsx)
│
├─ RouletteWheel (SVG-based, ~250px diameter)
│  ├─ SVG: 12 segments (Circle of Fifths)
│  ├─ Text: root note (e.g., "C", "G") + tonality (Major/Minor)
│  ├─ Reanimated: rotation animation on spin
│  └─ TouchableOpacity: tap to spin (calls store.spin())
│
├─ SpinButton
│  └─ Triggers: useAppStore.spin()
│
└─ ScrollView (dashboard cards below wheel)
   │
   ├─ ScaleRefCard
   │  ├─ 7-note scale display
   │  ├─ Pentatonic toggle
   │  └─ Tonality selector (Major, Minor, Modes)
   │
   ├─ HarmonicFieldCard
   │  ├─ 7 diatonic chords (I-vii°)
   │  ├─ Chord tabs: Ionian, Dorian, Phrygian, ... Locrian
   │  └─ Characteristic degree highlighting
   │
   └─ CadenceCard (FREEMIUM GATE ⚠️)
      ├─ Genre tabs: POP, JAZZ, CLASSICAL, REGGAE
      │  (REGGAE visible only if profile?.tier === 'PREMIUM')
      ├─ Chord progression display
      └─ "Upgrade to PREMIUM" notice (if not premium)
```

### UI Component Library

| Component | File | Purpose |
|---|---|---|
| **Card** | `Card.tsx` | Base container (surface color, border, padding) |
| **Typography** | `Typography.tsx` | Title, Subtitle, MonoText (theme-aware) |

### Tab Navigator

```
_layout.tsx (/(tabs)/)
├─ Tab 1: Home (roulette + dashboard)
└─ Tab 2: User Area (profile + subscription)
```

---

## Packages & Responsibilities

### 1. `@cs/music-engine` — Pure Music Theory

**No external dependencies.** Pure TypeScript functions.

#### Core Types (`types.ts`)

| Type | Values / Shape | Usage |
|---|---|---|
| `Note` | 'C' \| 'C#' \| 'Db' \| ... \| 'B' (17 enharmonic spellings) | Keys, scale notes, chord roots |
| `Tonality` | 'Major' \| 'Minor' \| 'Harmonic Minor' \| 'Melodic Minor' \| 'Ionian' \| 'Dorian' \| ... \| 'Locrian' \| 'MajorPentatonic' \| 'MinorPentatonic' (13 total) | Scale/mode selection |
| `KeyConfig` | `{ root: Note, tonality: Tonality }` | Current musical key |
| `Chord` | `{ name, root, quality, qualityType, chordClass, notes[], degree, isCharacteristic? }` | Diatonic chords |
| `HarmonyResult` | `{ key, scale[], chords[], cadences: Record<string, Chord[][]> }` | Full harmony context |

#### Core Functions (`engine.ts`)

| Function | Input | Output | Purpose |
|---|---|---|---|
| `calculateHarmony(root, tonality)` | Note, Tonality | HarmonyResult | Main API; returns scale + chords + cadences |
| `getScale(root, tonality)` | Note, Tonality | Note[] | 7-note scale in order |
| `getDiatonicChords(scale, tonality)` | Note[], Tonality | Chord[] | 7 diatonic chords with quality |
| `getCadences(chords)` | Chord[] | Record<string, Chord[][]> | Maps genre → chord progressions |
| `getRandomKey()` | none | KeyConfig | Random key from Circle of Fifths |

#### Key Constants (`constants.ts`)

| Constant | Content | Usage |
|---|---|---|
| `CIRCLE_OF_FIFTHS` | ['C','G','D','A','E','B','F#','Db','Ab','Eb','Bb','F'] | 12-key wheel |
| `INTERVALS` | Maps Tonality → semitone array | Scale construction |
| `CADENCES` | Genre → chord index arrays (POP, JAZZ, CLASSICAL, REGGAE) | Genre progressions |
| `MODE_QUALITIES` | Per-mode chord quality table | Chord quality by degree |
| `MODE_CHARACTERISTIC_DEGREES` | Per-mode characteristic degrees | UI highlighting |

#### Design Principles

- ✅ **Zero dependencies:** No React, no external libs
- ✅ **Stateless:** Every call is deterministic
- ✅ **Serializable:** Results can be persisted to AsyncStorage
- ✅ **i18n-aware:** Uses key strings (e.g., `quality.major`) not hardcoded text

---

### 2. `@cs/store` — State Management (Zustand)

#### `useAppStore` — App State

**Persisted to AsyncStorage** (key: `'composition-support-storage'`)

| State | Type | Persisted? | Recalculated? | Purpose |
|---|---|---|---|---|
| `currentKey` | KeyConfig | ✅ Yes | - | Active musical key |
| `harmonyResult` | HarmonyResult | ❌ No | ✅ On `setKey()` | Derived; always fresh |
| `isSpinning` | boolean | ❌ No | - | Animation in progress |
| `targetKey` | KeyConfig \| null | ❌ No | - | Destination during spin |

| Action | Effect |
|---|---|
| `setKey(root, tonality)` | Updates currentKey, recalculates harmonyResult |
| `spin()` | Sets isSpinning=true, picks random targetKey |
| `setSpinning(bool)` | Controls animation state |
| `clearTarget()` | Clears targetKey after animation completes |

**Critical:** `harmonyResult` is **never persisted**—it's recalculated on rehydration from `currentKey`.

#### `useUserStore` — User State

**Persisted to AsyncStorage** (key: `'user-storage'`)

| State | Type | Persisted? | Purpose |
|---|---|---|---|
| `profile` | UserProfile \| null | ✅ (except guests) | Logged-in user info |
| `billing` | { method?, history } | ✅ | Payment method + history |
| `isLoading` | boolean | ❌ | Async operation in progress |
| `error` | string \| null | ❌ | Last error message |

| Action | Effect |
|---|---|
| `setProfile(profile)` | Sets profile, clears error |
| `updateUser(data)` | Shallow merge on existing profile |
| `clearUser()` | Resets all to initial state |

**Guest Profile:** `id === 'guest'` profiles are NOT persisted (forces re-login on app restart).

#### Types (`types.ts`)

```typescript
type UserTier = 'FREE' | 'PREMIUM';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  tier: UserTier;
  memberSince: string; // ISO timestamp
}

interface PaymentMethod {
  type: 'credit_card' | 'other';
  last4?: string;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  date: string;
  status: 'success' | 'pending' | 'failed';
}
```

---

### 3. `@cs/locales` — Internationalization

#### Initialization

```typescript
export const resources = {
  en: { translation: enJSON },
  'pt-BR': { translation: ptBrJSON },
  es: { translation: esJSON },
};

export function initI18n(lng = DEFAULT_LOCALE) {
  if (i18n.isInitialized) return;
  i18n.init({ resources, lng, fallbackLng: DEFAULT_LOCALE });
}
```

#### Supported Locales

| Locale | Language | File |
|---|---|---|
| `en` | English | `en.json` |
| `pt-BR` | Portuguese (Brazil) | `pt-br.json` |
| `es` | Spanish | `es.json` |

#### Translation Key Patterns

```json
{
  "dashboard": {
    "cadence": {
      "title": "Cadences",
      "POP": "Pop Progression",
      "JAZZ": "Jazz Progression",
      "CLASSICAL": "Classical Progression",
      "REGGAE": "Reggae Progression (Premium)"
    },
    "scale": {
      "notes": "Scale Notes"
    }
  },
  "quality": {
    "major": "Major",
    "minor": "Minor",
    "diminished": "Diminished",
    "augmented": "Augmented"
  },
  "tonality": {
    "major": "Major",
    "minor": "Natural Minor",
    "harmonic_minor": "Harmonic Minor"
  }
}
```

#### Mandatory Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  return <Text>{t('dashboard.cadence.title')}</Text>;
}
```

**Rule:** Every user-visible string must use `useTranslation()`. Hardcoded text = immediate rejection.

---

### 4. `@cs/supabase` — Backend Client

#### Client Initialization

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // React Native requirement
    },
  }
);
```

#### Environment Variables (Required)

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (safe for client) |

#### Database Schema (RLS Enabled)

##### `profiles` Table

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid | PK = auth user ID |
| `name` | text | User name |
| `email` | text | User email |
| `tier` | enum (FREE, PREMIUM) | Subscription level |
| `member_since` | timestamp | Account creation date |

**RLS Policy:** Users can only SELECT/UPDATE own row (`auth.uid() = id`)

##### `subscriptions` Table

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK → profiles.id |
| `stripe_subscription_id` | text | Stripe subscription ID |
| `status` | enum (active, inactive) | Active? |
| `created_at` | timestamp | Subscription start |
| `updated_at` | timestamp | Last change |

**RLS Policy:** Users can only SELECT own subscriptions (`auth.uid() = user_id`)

---

## Data Flow

### On App Launch

```
App._layout.tsx
  │
  ├─ initI18n('en')                    [Once, at startup]
  │
  ├─ supabase.auth.onAuthStateChange(listener)
  │  │
  │  ├─ Event: SIGNED_IN
  │  │  ├─ Fetch profile from Supabase
  │  │  ├─ Create UserProfile object
  │  │  ├─ useUserStore.setProfile(profile)
  │  │  └─ router.replace('/(tabs)/')  [Navigate to home]
  │  │
  │  └─ Event: SIGNED_OUT
  │     ├─ useUserStore.clearUser()
  │     └─ router.replace('/(auth)/login')
  │
  └─ Render ThemeProvider + Stack Navigator
```

### On Roulette Spin

```
User taps SpinButton
  │
  ├─ SpinButton.tsx calls useAppStore.spin()
  │  │
  │  ├─ useAppStore.spin() action:
  │  │  ├─ Set isSpinning = true
  │  │  ├─ Pick random targetKey (via engine.getRandomKey())
  │  │  └─ Return immediately
  │  │
  │  └─ useEffect in RouletteWheel listens to targetKey
  │     │
  │     ├─ Start Reanimated rotation animation
  │     │
  │     └─ After animation completes:
  │        ├─ Call useAppStore.setKey(targetKey.root, targetKey.tonality)
  │        │  └─ Recalculates harmonyResult (via engine.calculateHarmony())
  │        │
  │        ├─ Call useAppStore.setSpinning(false)
  │        │
  │        └─ Call useAppStore.clearTarget()
  │
└─ Dashboard Cards subscribe to useAppStore and re-render
   │
   ├─ ScaleRefCard reads harmonyResult.scale
   ├─ HarmonicFieldCard reads harmonyResult.chords
   └─ CadenceCard reads harmonyResult.cadences + profile?.tier
```

### On Subscription (Premium Gate)

```
Stripe Webhook (Deno Edge Function) receives event
  │
  ├─ Event: checkout.session.completed
  │  ├─ Extract user_id from session.metadata
  │  ├─ Update profiles table: tier = 'PREMIUM'
  │  └─ Insert into subscriptions table
  │
  ├─ Event: customer.subscription.updated
  │  ├─ If status != 'active': downgrade to tier = 'FREE'
  │  └─ Update subscriptions table
  │
  └─ Event: customer.subscription.deleted
     └─ Downgrade to tier = 'FREE'

Meanwhile, in App:
  │
  ├─ CadenceCard component checks profile?.tier
  │  ├─ If tier === 'PREMIUM': show all genres (POP, JAZZ, CLASSICAL, REGGAE)
  │  └─ If tier === 'FREE': show only POP, JAZZ, CLASSICAL
  │
  └─ Next session: profile re-fetched from Supabase
     └─ Tier is updated automatically
```

---

## Authentication Flow

### Google OAuth

```
User taps "Sign in with Google" in login.tsx
  │
  ├─ Call supabase.auth.signInWithOAuth({
  │    provider: 'google',
  │    options: { redirectTo: 'compositionhelper://' }
  │  })
  │
  ├─ Opens Google login screen (native or web)
  │
  ├─ User logs in with Google account
  │
  ├─ Redirect back to app via deep-link (compositionhelper://)
  │
  ├─ _layout.tsx detects SIGNED_IN event
  │  │
  │  ├─ Fetch user profile from Supabase
  │  ├─ Create UserProfile object
  │  ├─ Store in useUserStore
  │  └─ Navigate to /(tabs)/
  │
  └─ Home screen displays roulette + dashboard (user logged in)
```

### Guest Login

```
User taps "Continue as Guest" in login.tsx
  │
  ├─ useUserStore.setProfile({
  │    id: 'guest',
  │    name: 'Guest User',
  │    email: '',
  │    tier: 'FREE',
  │    memberSince: new Date().toISOString()
  │  })
  │
  ├─ Navigate to /(tabs)/
  │
  └─ Home screen displays roulette + dashboard (guest mode)

Note: Profile is NOT persisted (AsyncStorage.partialize excludes guests)
      On app restart → clearUser() → redirect to login
```

---

## Freemium Gate Implementation

### UI Layer (Client-Side)

**Pattern in CadenceCard.tsx:**

```typescript
export function CadenceCard() {
  const { profile } = useUserStore();
  const { harmonyResult } = useAppStore();

  // Compute available genres based on tier
  const cadenceGenres = useMemo(() => {
    const allGenres = Object.keys(harmonyResult?.cadences || {});
    if (profile?.tier === 'PREMIUM') return allGenres;
    return allGenres.filter((g) => ['POP', 'JAZZ', 'CLASSICAL'].includes(g));
  }, [harmonyResult?.cadences, profile?.tier]);

  return (
    <Card>
      <Title>{t('dashboard.cadence.title')}</Title>

      {/* Show all genres if PREMIUM */}
      <TabView
        tabs={cadenceGenres}
        onSelectTab={(genre) => setSelectedGenre(genre)}
      />

      {/* Show upgrade notice if FREE */}
      {profile?.tier !== 'PREMIUM' && (
        <Text style={styles.premiumNotice}>
          {t('dashboard.cadence.premiumNotice')}
        </Text>
      )}

      {/* Show upgrade button if FREE */}
      {profile?.tier !== 'PREMIUM' && (
        <Button onPress={() => navigateToUpgrade()}>
          {t('dashboard.cadence.upgradeCTA')}
        </Button>
      )}
    </Card>
  );
}
```

### Backend Enforcement (Supabase RLS + Stripe)

**Current State:** UI-only gate (trust client-side check)

**Future:** Can enforce via RLS policies:
```sql
-- Example RLS (not yet implemented)
CREATE POLICY "free_users_see_pops_only" ON cadences
  FOR SELECT
  USING (
    (genre IN ('POP', 'JAZZ', 'CLASSICAL'))
    OR
    (auth.jwt() ->> 'tier' = 'PREMIUM')
  );
```

**Real Enforcement:** Stripe webhook controls `tier` field in Supabase:
- ✅ User pays → webhook updates `tier = 'PREMIUM'`
- ✅ Subscription expires → webhook updates `tier = 'FREE'`
- ✅ Client-side gate reads `tier` from Supabase profile
- ✅ Cannot bypass locally (tier value comes from server)

---

## Summary

- **Layered architecture:** UI → Business Logic → Backend
- **Pure functions:** Music engine has zero dependencies
- **Derived state:** HarmonyResult always computed from currentKey
- **Persisted state:** Only essential data (currentKey, profile) stored locally
- **Freemium ready:** Gate in UI; enforcement on backend
- **i18n mandatory:** Every string translated
- **Theme tokens:** Single source of truth for colors/spacing
- **No build step:** Babel + Metro handle `@cs/*` resolution
