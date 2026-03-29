# State — Composition Helper

**Memory: Decisions, Blockers, Todos, Key Context**

Last updated: 2026-03-29

---

## Key Decisions Made

### 1. ✅ Freemium Model Over Ads

**Decision:** Revenue via Stripe subscriptions, not ads.

**Rationale:**
- Educational content should not be interrupted by ads
- Premium unlocks music depth (REGGAE genre), not removes annoyances
- Higher ARPU (average revenue per user) than ad-supported
- Better UX for learners (no distraction)

**Implication:**
- All users see a "Upgrade" CTA when viewing REGGAE (for premium only)
- Guest login resets on app restart (prevents permanent free access)
- Tier field in Supabase (cannot be bypassed client-side)

---

### 2. ✅ Roulette Wheel UI

**Decision:** Visual roulette wheel (gamified) instead of dropdown/list picker.

**Rationale:**
- Makes learning fun and memorable
- Creates habit loop (tapping wheel = dopamine)
- Differentiates from other theory apps
- Encourages exploration (random = discovery)

**Implication:**
- Smooth animation required (Reanimated)
- 12 segments (Circle of Fifths keys)
- Color coding (warm = Major, cool = Minor)
- Must be highly responsive (<100ms spin feedback)

---

### 3. ✅ Client-Side Music Calculations

**Decision:** All music theory computed locally (no backend API).

**Rationale:**
- Zero network latency (instant results)
- Offline capability (no internet required)
- Scales infinitely (no backend cost)
- Pure functions (testable, reproducible)

**Implication:**
- Music engine is pure TypeScript (zero dependencies)
- All calculations in `@cs/music-engine`
- Harmonic context always derived (never cached inconsistently)
- Can be shared as standalone NPM package

---

### 4. ✅ Zustand for State Management

**Decision:** Zustand instead of Redux, MobX, or Context.

**Rationale:**
- Lightweight (simple music app doesn't need Redux boilerplate)
- Minimal API (easy to learn, hard to misuse)
- Great TypeScript support
- Built-in persistence middleware

**Implication:**
- Two separate stores: `useAppStore` (music), `useUserStore` (auth)
- Derived state (harmonyResult) recalculated on every setKey()
- AsyncStorage for persistence (offline support)

---

### 5. ✅ Dark Theme Only

**Decision:** Single dark theme (no light mode).

**Rationale:**
- Music theory apps traditionally use dark UI
- Reduces design burden (one theme to maintain)
- Less eye strain during long study sessions
- Cleaner codebase (no theme.light vs theme.dark)

**Implication:**
- All color tokens defined in `apps/mobile/src/theme/index.ts`
- No light mode will be added (even if requested)
- Theme consistency enforced (no hardcoded colors in components)

---

### 6. ✅ Google OAuth Only (No Email/Password)

**Decision:** Supabase Google OAuth. No email/password alternative.

**Rationale:**
- Reduces security liability (no password hashing, no forgot-password flow)
- Faster user onboarding (one tap login)
- Familiar to users (Gmail is ubiquitous)
- Supabase handles all OAuth complexity

**Implication:**
- Users without Google account cannot log in permanently
- Guest login available (but resets on app restart)
- No password recovery needed
- OAuth redirect via deep-link (`compositionhelper://`)

---

### 7. ✅ TypeScript Strict Mode

**Decision:** `"strict": true` in `tsconfig.base.json` (non-negotiable).

**Rationale:**
- Catches bugs at compile-time (not runtime)
- Improves code quality and maintainability
- Refactoring becomes safe
- Team coordination (everyone follows same rules)

**Implication:**
- No `any` types without explicit justification
- All functions must have return types
- Null/undefined explicitly handled
- Type errors fail CI/CD pipeline

---

### 8. ✅ i18n Mandatory

**Decision:** All user-visible strings go through `useTranslation()`.

**Rationale:**
- Easy to add new languages later
- Community can contribute translations
- Enforces consistent terminology

**Implication:**
- No hardcoded strings in components
- Missing translations = runtime errors (caught in development)
- 3 languages from launch (EN, PT-BR, ES)

---

### 9. ✅ Monorepo with No Package Build Step

**Decision:** Packages expose `./src/index.ts` directly (no dist/ folder).

**Rationale:**
- Faster development (no build step, Metro compiles on-the-fly)
- Simpler setup (fewer config files)
- Hot module reload works seamlessly
- Babel aliases handle all resolution

**Implication:**
- `@cs/*` packages resolve via `babel.config.js`
- Metro transpiles TypeScript in real-time
- No npm-publish needed (private scoped packages)
- Same source can be used for both RN and web

---

### 10. ✅ TLC Spec-Driven Development

**Decision:** Adopt TLC SDD for all future features.

**Rationale:**
- Spec-first approach prevents over-engineering
- TDD ensures acceptance criteria are met
- Auto-sizing (complex features get full spec, simple ones skip)
- Documented decisions for future reference

**Implication:**
- `.specs/` folder is the source of truth
- Every feature must have a spec before implementation
- Tests written before code (red → green → refactor)
- Commits tied to spec IDs

---

### 11. ✅ Never Commit Directly to `main`

**Decision:** All work must be done on feature branches. Direct commits to `main` are forbidden.

**Rationale:**
- Keeps production-ready code clean and stable
- Enforces code review for all changes (no exceptions)
- Enables traceability via GitHub PRs
- Prevents accidental commits by enforcement
- Matches industry best practices (GitFlow-inspired)

**Implication:**
- Always create a new branch: `git checkout -b <type>/<name>`
- Always update main first: `git fetch origin && git pull origin main`
- All changes go through PR (no direct pushes)
- `main` is protected (GitHub enforces this)
- Every merge must come from a reviewed PR
- Commit history remains clean and meaningful

**Workflow (Non-Negotiable):**
```
1. git fetch origin && git checkout main && git pull origin main
2. git checkout -b feature/<name>
3. Make changes, commit to the new branch
4. git push -u origin feature/<name>
5. Create PR on GitHub
6. Get reviewed and approved
7. Merge via GitHub (never local merge)
```

**Why This Failed Before:**
- Committed directly to main without PR
- Skipped review process
- Broke the workflow

**How to Fix (If It Happens Again):**
1. `git revert HEAD` (undo the commit)
2. Create proper feature branch
3. Cherry-pick or re-apply changes
4. Commit to new branch
5. Create PR as normal

---

## Active Blockers 🚧

### 1. ❓ Stripe Webhook Integration

**Status:** In Progress  
**Description:** Deno Edge Function receives Stripe events, updates Supabase tier.  
**Blocker:** Webhook not fully tested end-to-end.

**Next Steps:**
- [ ] Create Stripe test account (if not already)
- [ ] Simulate webhook locally (Stripe CLI)
- [ ] Test payment flow: checkout → webhook → tier update
- [ ] Verify RLS policies enforce tier access

**Owner:** André

**Expected Resolution:** This week (before public beta)

---

### 2. ❓ App Store Submission Readiness

**Status:** Pending  
**Description:** iOS/Android apps need approval from Apple/Google.

**Blocker:** Marketing assets not ready (screenshots, description).

**Next Steps:**
- [ ] Create app store screenshots (app itself ready)
- [ ] Write app description (tagline + feature list)
- [ ] Prepare privacy policy (Supabase + Stripe)
- [ ] Test on real devices (iOS, Android)

**Owner:** André

**Expected Resolution:** Next month (before public launch)

---

### 3. ❓ OTA Update Automation

**Status:** Pending  
**Description:** EAS Updates should push updates without app store review.

**Blocker:** Not yet configured in GitHub Actions.

**Next Steps:**
- [ ] Set up EAS Update in `eas.json`
- [ ] Create GitHub Action workflow (push to main → OTA)
- [ ] Test OTA flow (push update → app pulls it)
- [ ] Monitor update adoption

**Owner:** André

**Expected Resolution:** v1.1 (stability phase)

---

## Known Issues 🐛

### 1. 🟡 Roulette Animation Jank on Older Android

**Severity:** Medium  
**Platform:** Android (API 24-25)  
**Description:** Roulette wheel animation occasionally drops frames on older devices.

**Workaround:** Animation still completes, but not smooth (60fps target).

**Fix:** Optimize Reanimated worklet or reduce animation complexity.

**Priority:** v1.1 (performance optimization phase)

---

### 2. 🟡 i18n Key Mismatches

**Severity:** Low  
**Description:** Missing translation keys cause fallback to `'key.not.found'` display.

**Workaround:** Developers must manually update all 3 translation files.

**Fix:** Add i18n validation (linter rule or GitHub Action).

**Priority:** v1.1 (stability phase)

---

### 3. 🟡 Stripe Test Mode Indicator Missing

**Severity:** Low  
**Description:** Users cannot tell if they're testing with Stripe test cards.

**Workaround:** Check Stripe dashboard for transaction (developers only).

**Fix:** Show "TEST MODE" banner in dev builds only.

**Priority:** v1.1 (UX improvement)

---

## Todos (In Priority Order) 📋

### Immediate (This Week)

- [ ] **Complete TLC SDD documentation**
  - [x] `.specs/codebase/` (STACK, ARCHITECTURE, CONVENTIONS)
  - [x] `.specs/project/` (PROJECT, ROADMAP, STATE)
  - [ ] `.specs/features/` (feature templates ready)

- [ ] **Test Stripe webhook end-to-end**
  - [ ] Simulate payment → webhook → tier update
  - [ ] Verify Supabase profile reflects new tier
  - [ ] Test on both iOS and Android

- [ ] **Create app store assets**
  - [ ] 5 screenshots per platform
  - [ ] App description (200 chars)
  - [ ] Privacy policy (draft)

---

### Short-term (This Month)

- [ ] **TLC Specify: Top 3 Features**
  - Specify Roulette Wheel animation optimization
  - Specify Stripe test mode indicator
  - Specify i18n validation linter

- [ ] **Implement with TDD**
  - Write tests first
  - Implement minimal code
  - Commit with spec reference

- [ ] **Set up analytics**
  - Integrate Sentry (error tracking)
  - Integrate Firebase Analytics (user metrics)
  - Create Mixpanel dashboard (optional)

- [ ] **Soft launch**
  - Internal testing (friends, family)
  - Collect feedback
  - Fix critical bugs

---

### Medium-term (Next Month)

- [ ] **App Store / Play Store submission**
  - [ ] Final testing on real devices
  - [ ] Submit iOS app
  - [ ] Submit Android app
  - [ ] Monitor approval (typically 1-2 weeks)

- [ ] **Public launch**
  - [ ] Press release (optional)
  - [ ] Social media announcement
  - [ ] Monitor launch metrics (DAU, crashes, feedback)

- [ ] **v1.1 planning**
  - [ ] Review user feedback
  - [ ] Prioritize v1.1 features
  - [ ] Create feature specs (TLC)

---

## Metrics & KPIs 📊

### Launch Targets (30 days post-launch)

| Metric | Target | Current |
|---|---|---|
| **DAU** | 100+ | 0 (not launched) |
| **Installs** | 500+ | 0 |
| **Conversion** | 5%+ | N/A |
| **Churn** | <10% | N/A |
| **Crash Rate** | <0.1% | 0% (private beta) |
| **Session Duration** | 5+ min | TBD |
| **Rating** | 4.0+ | N/A |

### Monitoring Tools

- **Sentry:** Error tracking (setup: pending)
- **Firebase Analytics:** User engagement (setup: pending)
- **App Store Analytics:** Download, retention, crashes (auto)
- **Custom:** Spin frequency, genre distribution (future)

---

## Architecture Decisions Log

| Date | Decision | Status | Details |
|---|---|---|---|
| 2025-01-15 | Use Expo over React Native CLI | ✅ Final | Better DX, EAS build service |
| 2025-02-01 | Dark theme only | ✅ Final | Reduce design burden |
| 2025-02-15 | Zustand + AsyncStorage for state | ✅ Final | Lightweight, built-in persistence |
| 2025-03-01 | Google OAuth only | ✅ Final | Reduce security risk |
| 2025-03-15 | Client-side music calculations | ✅ Final | No backend latency |
| 2025-03-20 | Freemium model (Stripe) | ✅ Final | Better UX than ads |
| 2025-03-25 | TLC SDD integration | ✅ Active | Spec-driven development |

---

## Questions & Decisions Pending 🤔

### Q1: Should we support light mode?

**Status:** Decided ✅ No  
**Rationale:** Dark theme only (reduces design burden, music education standard)

---

### Q2: Should we add push notifications?

**Status:** Pending  
**Consideration:** Engagement booster (remind daily), but intrusive  
**Decision:** Defer to v1.1 (after user feedback)

---

### Q3: Should we open-source the music engine?

**Status:** Pending  
**Consideration:** Great for community, but requires docs + support  
**Decision:** Defer to v2.0 (after stabilization)

---

### Q4: Should we add web-only features (e.g., MIDI export)?

**Status:** Pending  
**Consideration:** Web version useful, but adds complexity  
**Decision:** Support web via React Native Web (same codebase), MIDI export in v2.0

---

## Communication Channels

| Channel | Purpose | Frequency |
|---|---|---|
| **GitHub Issues** | Feature requests, bug reports | As-needed |
| **Discord** (future) | Community, support | TBD |
| **Email** (future) | Announcements, newsletters | Weekly (planned) |
| **Sentry** | Error alerts | Real-time |

---

## Learning Resources & References

### Music Theory
- [Music Theory Fundamentals](https://musictheory.net) — interactive lessons
- [Circle of Fifths Explained](https://www.youtube.com/watch?v=9rEqrASwNFE) — visual guide
- [Diatonic Harmony](https://en.wikipedia.org/wiki/Diatonic_function) — deep dive

### React Native / Expo
- [Expo Documentation](https://docs.expo.dev)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [Supabase React Native](https://supabase.com/docs/reference/javascript/introduction)

### TLC SDD
- [TLC Spec-Driven Development](https://github.com/tech-leads-club/tlc-spec-driven)

---

## Next Review

**Date:** 2026-04-29 (monthly sync)  
**Agenda:**
- [ ] Review progress on todos
- [ ] Update metrics (DAU, conversion, churn)
- [ ] Resolve pending decisions
- [ ] Plan next month's priorities

---

## Document History

| Date | Author | Change |
|---|---|---|
| 2026-03-29 | André | Created STATE.md (initial) |
| TBD | - | - |
