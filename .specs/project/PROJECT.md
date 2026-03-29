# Composition Helper — Project Definition

## Vision

**Help music learners understand harmonic context intuitively through interactive visualization.**

A freemium music theory education app centered on a Circle of Fifths roulette wheel that instantly reveals the complete harmonic landscape of any musical key.

---

## For Whom?

### Primary Users

- **Music students** (ages 13+)
  - Learning music theory in school/university
  - Preparing for exams (harmony, composition)
  
- **Self-taught musicians**
  - Guitarists, pianists, producers learning theory
  - Want quick reference while composing/practicing

- **Teachers**
  - Music educators demonstrating harmonic relationships
  - Need interactive teaching tool

### User Motivation

- **Learn scales, chords, modes visually**
- **Understand how keys relate (Circle of Fifths)**
- **Explore genre-specific chord progressions**
- **Save time: no need to memorize or calculate**

---

## Problem Solved

### Before (Without App)

❌ Music theory requires memorization of:
- 12 keys × multiple scales = 144+ scale variations
- 7 diatonic chords per key × 12 keys = 84 chords to remember
- How modes (Dorian, Phrygian, etc.) differ from Major
- Which chord progressions sound "pop" vs "jazz" vs "classical"

❌ Students resort to:
- Googling "C Major scale" every time
- Drawing staff notation on paper (slow)
- Spending hours on flashcards (boring)
- Missing deeper understanding of relationships

### After (With Composition Helper)

✅ **One tap → everything revealed:**
1. **Spin the wheel** (random or select key)
2. **See scale** (7 notes instantly)
3. **See chords** (all 7 diatonic chords)
4. **See modes** (all 7 Greek modes in same key)
5. **See progressions** (genre examples: POP, JAZZ, CLASSICAL, REGGAE)

✅ **Learn patterns, not memorize lists**
- Why is C Major related to A Minor? (same notes!)
- Why is a V-I cadence satisfying? (see the progression)
- How do modes sound different? (see where they differ from Major)

---

## Tech Stack

### Core Framework

| Component | Version | Purpose |
|---|---|---|
| **React Native** | 0.76.5 | Cross-platform mobile framework |
| **Expo** | ~52.0.0 | Development platform & build service |
| **Expo Router** | ~4.0.0 | Navigation (file-based routing) |
| **TypeScript** | ~5.4.2 | Type-safe development |

### Mobile Platforms

- **iOS** (iOS 13+)
- **Android** (API 24+)
- **Web** (React Native Web, exportable to Vercel)

### State Management

- **Zustand** 4.5.2 (lightweight stores)
- **AsyncStorage** (local persistence)

### Backend & Auth

- **Supabase** (authentication, database, RLS)
- **Stripe** (payments, subscriptions)
- **Deno** (Edge Functions for Stripe webhook)

### UI & Styling

- **styled-components** (CSS-in-JS, theme consistency)
- **React Native Reanimated** (smooth wheel animation)
- **React Native SVG** (roulette wheel graphics)

### i18n & Localization

- **i18next** (internationalization)
- **3 languages:** English, Portuguese-Brazil, Spanish

### Deployment

- **Vercel** (web version)
- **EAS** (iOS/Android builds + OTA updates)
- **GitHub Actions** (CI/CD pipeline)

---

## Scope — v1 (Current)

### ✅ Included in v1

#### Core Feature
- **Roulette Wheel**
  - 12 segments (Circle of Fifths keys)
  - Spin → random key selection
  - Manual selection via tap
  - Smooth Reanimated animation

#### Dashboard (Below Wheel)
- **ScaleRefCard**
  - 7-note scale display
  - Pentatonic subset toggle
  - Tonality selector (Major, Minor, Harmonic Minor, all modes)

- **HarmonicFieldCard**
  - 7 diatonic chords (I, ii, iii, IV, V, vi, vii°)
  - Chord tabs per Greek mode (Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian)
  - Chord quality display (maj, min, dim, aug, 7ths)
  - Characteristic degree highlighting

- **CadenceCard** (Freemium Feature)
  - 3 genres free: POP, JAZZ, CLASSICAL
  - 1 genre premium: REGGAE
  - Genre-specific chord progressions

#### Authentication
- **Google OAuth** (Supabase)
- **Guest Login** (temporary, resets on restart)

#### Monetization
- **Freemium Model**
  - FREE tier: basic features (scale, chords, 3 genres)
  - PREMIUM tier: all 4 genres (Reggae unlocked)
  - Stripe integration (checkout, subscription management)

#### Localization
- **3 languages:** English, Portuguese-Brazil, Spanish
- All UI strings translated
- Music term translations (tonality, quality, etc.)

#### User Profile
- **Email** (via OAuth)
- **Subscription tier** (FREE or PREMIUM)
- **Member since** (account creation date)
- **Language preference** (saved locally)

---

### ❌ Explicitly Out of Scope — v1

- **Multi-key composition tool** (composing in multiple keys)
- **Audio playback** (hearing chord/scale sounds)
- **MIDI export** (exporting to DAW)
- **Social features** (sharing progressions, community)
- **Desktop app** (native Windows/Mac)
- **Advanced music theory** (extended harmony, modulation analysis)
- **Chord voicing editor** (inversions, voicings)
- **Custom tonality builder** (user-defined scales)
- **Analytics** (usage tracking, heatmaps)
- **Email marketing** (newsletters, drip campaigns)

---

## Constraints

### Timeline
- **No hard deadline** (continuous development)
- **Prioritize MVP stability over feature count**

### Technical
- **React Native for max platform coverage** (iOS, Android, Web from single codebase)
- **Client-side music calculations** (no backend latency)
- **Freemium gate in UI + backend RLS** (prevent tier bypass)
- **TypeScript strict mode** (zero implicit `any`)
- **i18n mandatory** (all strings translated)
- **Dark theme only** (no light mode)

### Business
- **Freemium only** (not ad-supported)
- **Stripe as exclusive payment** (no alternative pay methods)
- **Google OAuth required** (users must authenticate to go premium)

### Performance
- **Roulette animation must be smooth** (60fps, no jank)
- **No network latency on key spin** (all calculations instant)
- **Fast app startup** (<3 seconds)
- **Bundle size < 20MB** (comfortable for all users)

---

## Success Metrics (Early Stage)

### User Engagement
- **DAU (Daily Active Users):** Target 100+ by month 3
- **Session duration:** Average 5+ minutes
- **Return rate:** 40%+ of DAU return next day

### Monetization
- **Conversion rate:** 5-10% of free users upgrade (by month 6)
- **ARPU:** $2-5 per monthly active user
- **Churn rate:** <5% per month (retention focus)

### Quality
- **Crash rate:** <0.1%
- **ANR (App Not Responding):** 0
- **Rating:** 4.5+ stars (App Store / Play Store)

---

## Current Status

### Completed ✅
- App structure (Expo Router, file-based routing)
- Music engine (pure TypeScript, all 13 tonalities)
- Roulette wheel (SVG + Reanimated animation)
- Dashboard cards (scale, chords, cadences)
- State management (Zustand stores, AsyncStorage persistence)
- Supabase integration (OAuth, profiles, subscriptions)
- Stripe webhook (Deno Edge Function)
- i18n setup (3 languages)
- Theme system (dark mode, design tokens)
- CI/CD pipeline (GitHub Actions, EAS, Vercel)

### In Progress 🚀
- TLC SDD integration (documentation, spec-driven workflow)
- Test coverage (unit tests for music engine, component tests)
- OTA update automation (EAS Updates)

### Planned 📋
- Premium tier unlocking (REGGAE genre + future features)
- Analytics dashboard (user engagement metrics)
- Email notifications (subscription events)
- Feature flags (gradual rollout of new features)
- A/B testing (UI/UX experiments)

---

## Decisions Made

### 1. Freemium Over Ad-Supported
**Why?** Premium features (cadences) are learner-focused, not distracting ads.

### 2. Roulette Wheel Over List Picker
**Why?** Makes music learning fun, gamifies key discovery, memorable UI.

### 3. Client-Side Music Calculations
**Why?** Zero network latency, works offline, scales infinitely (no backend cost).

### 4. Zustand Over Redux
**Why?** Simple, lightweight, perfect for music state (currentKey, harmonyResult).

### 5. Dark Theme Only
**Why?** Reduces design burden, music theory apps often use dark UI (less eye strain).

### 6. Google OAuth Only (No Email/Password)
**Why?** Reduces security liability, faster onboarding, familiar to users.

### 7. TypeScript Strict Mode
**Why?** Catches bugs early, improves code quality, refactoring safe.

---

## Key Stakeholders

| Role | Responsibility |
|---|---|
| **Developer** (André) | Full-stack development, TLC SDD integration |
| **Design** | UI/UX, branding (implicit; follow theme tokens) |
| **Product** | Feature prioritization, market fit (future) |
| **Support** | None yet (pre-launch) |

---

## What Makes This Project Special?

1. **Music education focus** — not a DAW, not a game, but educational
2. **Instant context** — all harmonic relationships visible at once
3. **Interactive learning** — explore, don't memorize
4. **Beautiful UI** — dark theme, smooth animation, carefully designed
5. **Rigorous architecture** — strict TypeScript, i18n, theme tokens, TDD-ready
6. **Freemium done right** — premium unlocks depth, not advertising
7. **Global-ready** — 3 languages from day 1

---

## Next 3 Months

### Month 1: Stabilization & Testing
- [ ] TLC SDD: Create feature specs
- [ ] Add unit tests (music engine)
- [ ] Add component tests (dashboard cards)
- [ ] Fix bugs, improve performance
- [ ] Launch closed beta (internal testing)

### Month 2: Polish & Launch
- [ ] TLC SDD: Implement features with full TDD
- [ ] App Store / Play Store submission prep
- [ ] Marketing site (landing page)
- [ ] User documentation
- [ ] Soft launch (friends/family)

### Month 3: Public Launch & Growth
- [ ] App Store & Play Store release
- [ ] Social media marketing
- [ ] Early user feedback loop
- [ ] Monitor metrics (DAU, conversion, churn)
- [ ] Plan v1.1 (bug fixes + minor features)
