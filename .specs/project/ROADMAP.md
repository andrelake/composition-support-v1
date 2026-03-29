# Roadmap — Composition Helper

**Current Milestone:** v1.0 (Closed Beta → Public Launch)

---

## Milestone 1: v1.0 — Core Music Theory Tool

**Goal:** Launch a production-ready freemium app with core harmonic visualization.

**Status:** 🚀 IN PROGRESS

### Features — v1.0

#### 1. **Roulette Wheel** ✅ (Complete)
- 12 segments (Circle of Fifths)
- Spin animation (Reanimated)
- Manual key selection
- Visual feedback (tonality color: warm=Major, cool=Minor)

#### 2. **Scale Reference Card** ✅ (Complete)
- Display 7-note scale
- Pentatonic subset toggle
- Tonality selector (Major, Minor, Harmonic Minor, Melodic Minor, 7 modes)
- Note highlighting based on selection

#### 3. **Harmonic Field Card** ✅ (Complete)
- 7 diatonic chords (I-vii°)
- Roman numeral notation
- Chord quality (maj, min, dim, aug, 7ths)
- Tabs per mode (Ionian through Locrian)
- Characteristic degree highlighting

#### 4. **Cadence Card** 🚀 (Freemium Gate)
- Genre-specific progressions
- FREE genres: POP, JAZZ, CLASSICAL (3 progressions each)
- PREMIUM genre: REGGAE (3 progressions, unlock via subscription)
- Visual chord progression display
- "Upgrade to Premium" notice for free users

#### 5. **Authentication** ✅ (Complete)
- Google OAuth (Supabase)
- Guest login (temporary, resets on restart)
- Profile persistence (AsyncStorage)

#### 6. **Subscription Management** ✅ (In Progress)
- Stripe checkout (in-app or web)
- Subscription confirmation
- Tier upgrade (FREE → PREMIUM)
- Stripe webhook syncing tier to Supabase

#### 7. **Localization** ✅ (Complete)
- English (en)
- Portuguese-Brazil (pt-BR)
- Spanish (es)
- Language selector (User Area tab)
- All strings translated

#### 8. **User Profile** ✅ (Complete)
- Name, email (from OAuth)
- Subscription tier display
- Member since date
- Language preference selector
- Sign out button

#### 9. **Theme & Design** ✅ (Complete)
- Dark mode only
- Color tokens (primary, surface, text, etc.)
- Spacing system (xs-xxl)
- Typography scale
- Consistent across all screens

#### 10. **CI/CD Pipeline** ✅ (Complete)
- GitHub Actions: type check + lint on PR
- EAS Build: iOS/Android builds
- EAS Update: OTA updates
- Vercel: web build deployment

---

## Milestone 2: v1.1 — Quality & Stability

**Goal:** Improve user experience, fix bugs, add stability metrics.

**Status:** 📋 PLANNED (Month 3-4)

### Features — v1.1

#### 1. **Test Coverage** 🔧
- [ ] Unit tests: music engine (100% coverage)
- [ ] Component tests: ScaleRefCard, HarmonicFieldCard, CadenceCard
- [ ] Integration tests: auth flow, subscription flow
- Target: 80%+ coverage

#### 2. **Performance Optimization** 🔧
- [ ] Bundle size optimization
- [ ] Lazy load card content
- [ ] Optimize SVG rendering (roulette wheel)
- [ ] Monitor and fix slow frames

#### 3. **Bug Fixes** 🔧
- [ ] Address user-reported issues
- [ ] Fix edge cases in music calculations
- [ ] Improve error handling

#### 4. **Analytics & Monitoring** 🔧
- [ ] Sentry error tracking
- [ ] Firebase Analytics (user engagement)
- [ ] Custom metrics (spin frequency, genre distribution)

#### 5. **User Feedback Loop** 🔧
- [ ] In-app feedback form
- [ ] Analytics-driven feature requests
- [ ] Community Discord (optional)

#### 6. **Documentation** 🔧
- [ ] In-app tutorial (first-time user)
- [ ] FAQ page
- [ ] Developer docs (if open-source)

---

## Milestone 3: v2.0 — Expanded Musicality

**Goal:** Add more music theory depth and user engagement.

**Status:** 📋 FUTURE (Month 6+)

### Features — v2.0

#### 1. **Extended Tonalities** 🎵
- [ ] Add jazz tonalities (harmonic major, altered scales)
- [ ] Add exotic scales (Hungarian minor, Gypsy, etc.)
- [ ] User-defined scale builder (create custom scales)

#### 2. **Chord Voicings** 🎵
- [ ] Chord voicing suggestions (piano, guitar)
- [ ] Inversion explorer (1st, 2nd, 3rd inversions)
- [ ] Voice leading analysis

#### 3. **Audio Playback** 🎵
- [ ] Play scale notes (one at a time, or full arpeggio)
- [ ] Play chord progressions (full arrangement)
- [ ] Adjustable tempo and instrument

#### 4. **MIDI Export** 🎵
- [ ] Export chord progression to MIDI
- [ ] Export scale to MIDI
- [ ] Import MIDI for analysis

#### 5. **Modulation Explorer** 🎵
- [ ] Show how to modulate between keys
- [ ] Common modulation paths (Circle of Fifths)
- [ ] Visualization of modulation smoothness

#### 6. **Genre Deep Dives** 🎵
- [ ] Expand cadence library (10+ genres)
- [ ] Genre-specific scales (blues, jazz, classical)
- [ ] Historical context (why these progressions work)

#### 7. **Practice Mode** 🎮
- [ ] Quiz mode: "Name this chord"
- [ ] Flash cards: scales, modes, progressions
- [ ] Ear training games (identify progression by ear)

#### 8. **Social Features** 🤝
- [ ] Share progressions (sharable links)
- [ ] Favorite progressions (bookmarks)
- [ ] Community library (curated progressions by users)

---

## Milestone 4: v3.0 — AI & Composition

**Goal:** AI-assisted composition and personalized learning.

**Status:** 📋 FUTURE (Month 12+)

### Features — v3.0

#### 1. **AI Composition Assistant** 🤖
- [ ] Generate progressions matching genre/mood
- [ ] Suggest next chord based on progression
- [ ] Analyze uploaded MIDI for harmonic insights

#### 2. **Personalized Learning Path** 🤖
- [ ] Adaptive difficulty (easy → advanced)
- [ ] User preference analysis (favorite genres)
- [ ] Recommended next scales/modes to learn

#### 3. **Transcription Helper** 🤖
- [ ] Upload audio → extract chords (AI-powered)
- [ ] Chord recognition from MIDI
- [ ] Harmonic analysis of real songs

#### 4. **Full-Stack Composer** 🎼
- [ ] Multi-key composition
- [ ] Arrangement suggestions
- [ ] Export to notation software (MusicXML)

---

## Feature Status Summary

| Feature | v1.0 | v1.1 | v2.0 | v3.0 |
|---|---|---|---|---|
| **Roulette Wheel** | ✅ | - | - | - |
| **Scale Reference** | ✅ | - | - | - |
| **Harmonic Field** | ✅ | - | - | - |
| **Cadences (3 genres)** | ✅ | - | - | - |
| **Cadences (REGGAE)** | 🚀 | - | - | - |
| **Auth (OAuth + Guest)** | ✅ | - | - | - |
| **Subscription** | 🚀 | - | - | - |
| **i18n (3 languages)** | ✅ | - | - | - |
| **Tests** | - | 🔧 | - | - |
| **Analytics** | - | 🔧 | - | - |
| **Extended Tonalities** | - | - | 🎵 | - |
| **Chord Voicings** | - | - | 🎵 | - |
| **Audio Playback** | - | - | 🎵 | - |
| **MIDI Export** | - | - | 🎵 | - |
| **Modulation** | - | - | 🎵 | - |
| **Practice Mode** | - | - | 🎮 | - |
| **Social** | - | - | 🤝 | - |
| **AI Assistant** | - | - | - | 🤖 |
| **Transcription** | - | - | - | 🤖 |

---

## Quarterly Timeline

### Q1 (Jan-Mar 2026)
- ✅ Complete v1.0 (all features)
- ✅ Closed beta testing
- ✅ TLC SDD integration + documentation
- 🚀 Soft launch (friends/family feedback)

### Q2 (Apr-Jun 2026)
- 🚀 Public launch (App Store + Play Store)
- 🔧 v1.1 stability improvements
- 📊 Monitor metrics (DAU, conversion, churn)
- 📈 Begin user feedback collection

### Q3 (Jul-Sep 2026)
- 🎵 v2.0 design phase (extended tonalities, audio)
- 📚 Marketing & growth initiatives
- 🎮 Community building (Discord, social media)

### Q4 (Oct-Dec 2026)
- 🎵 v2.0 implementation (prioritized features)
- 🤖 v3.0 research (AI, transcription)
- 🎉 Year-end review, 2027 planning

---

## Key Dependencies

### Runtime
- Expo 52+ (needed for latest RN features)
- Supabase (auth, database)
- Stripe (payments)

### Development
- TLC SDD (spec-driven development)
- GitHub Actions (CI/CD)
- EAS (mobile builds)
- Vercel (web hosting)

### Future (v2.0+)
- Audio library (Expo AV or react-native-sound)
- MIDI library (ToneJS or Tone.js)
- ML library (TensorFlow.js for AI features)

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| **Low user adoption** | Early user testing, marketing strategy, viral mechanics (sharing) |
| **Churn after first session** | Engaging tutorial, progression tracking, gamification |
| **Payment friction** | Stripe checkout optimization, no paywall on core features |
| **Performance issues** | Early load testing, performance budgets, APM monitoring |
| **Security breach** | Supabase RLS, HTTPS only, regular security audits |
| **App store rejection** | Pre-submission testing, compliance review, legal guidance |

---

## Budget & Resources

### Current (v1.0)
- **Developer:** 1 (André, full-time)
- **Design:** 0 (theme tokens already designed)
- **Server cost:** Free tier Supabase + EAS (minimal)
- **Total monthly:** ~$50 (EAS build credits, hosting)

### v1.1 & v2.0
- **Developer:** 1 full-time
- **QA Tester:** 0.5 (part-time contract, if budget allows)
- **Server cost:** ~$100/month (scaled Supabase, analytics)

### v3.0 (Future)
- **Developer:** 2-3 (core + AI specialist)
- **DevOps:** 0.5 (infrastructure)
- **Server cost:** ~$500/month (ML inference, scaled services)

---

## Success Criteria (Per Milestone)

### v1.0 ✅
- [ ] Zero critical bugs in closed beta
- [ ] Load time < 2 seconds
- [ ] Roulette animation smooth (60fps)
- [ ] 90%+ feature completion

### v1.1 🔧
- [ ] 80%+ test coverage
- [ ] DAU grows to 500+
- [ ] 5-10% conversion rate (free → premium)
- [ ] < 0.1% crash rate

### v2.0 🎵
- [ ] 5000+ DAU
- [ ] 15%+ conversion rate
- [ ] 4.5+ app store rating
- [ ] Feature requests from v1.x implemented

### v3.0 🤖
- [ ] 20,000+ DAU
- [ ] 20%+ conversion rate
- [ ] AI features reduce user time-to-insight by 50%
- [ ] Profitable (revenue > costs)

---

## Next Actions

### This Week
- [ ] Complete TLC SDD documentation (.specs/ folder)
- [ ] Review and finalize PROJECT.md, ROADMAP.md, STATE.md

### This Month
- [ ] Create feature specs (TLC "Specify feature" for top 3 v1.0 items)
- [ ] Begin implementing features with TDD
- [ ] Set up analytics (Sentry + Firebase)

### Next Quarter
- [ ] Close public beta
- [ ] App Store submission
- [ ] Launch marketing campaign
- [ ] Daily/weekly metrics review

---

## Contact & Escalation

- **Product Decisions:** Contact André (product owner)
- **Feature Requests:** GitHub Issues (if public) or Discord (community)
- **Bug Reports:** GitHub Issues or Sentry (automated)
- **General Inquiries:** Email (future contact form)
