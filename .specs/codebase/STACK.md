# Technology Stack - Composition Support

## Runtime & Framework

### Primary Framework

| Component | Version | Purpose |
|---|---|---|
| **React Native** | 0.76.5 | Core cross-platform framework |
| **Expo** | ~52.0.0 | Development platform & build service (EAS) |
| **React** | 18.3.1 | UI library |
| **Expo Router** | ~4.0.0 | File-based routing (Expo equivalent of Next.js) |

### Web Support

| Package | Version | Purpose |
|---|---|---|
| **React DOM** | 18.3.1 | React web runtime |
| **React Native Web** | ~0.19.13 | Transpiler: RN → Web |

**Web build:** `npm run build:web` exports to `dist/` (deployable to Vercel)

---

## Language & Type System

### TypeScript

| Aspect | Configuration |
|---|---|
| **Version** | ~5.4.2 |
| **Mode** | Strict (`"strict": true`) |
| **Module Resolution** | bundler (modern ESM + CJS) |
| **JSX** | react-jsx (automatic imports) |
| **Base Config** | `tsconfig.base.json` (monorepo root) |

**Requirement:** No `any` types without justification. All functions must have explicit return types.

---

## Build & Bundling

### Build Tools

| Tool | Version | Role |
|---|---|---|
| **Metro** | (included in Expo) | React Native bundler; configured for monorepo |
| **Babel** | 7.24.0+ | Transpiler; Expo preset + module resolver |
| **Turborepo** | 2.5.4 | Task orchestration (dev, build, lint, typecheck, build:web) |
| **EAS CLI** | (via npm) | Expo build service (iOS/Android) |

### Babel Plugins

- `babel-preset-expo`: Expo compatibility
- `react-native-reanimated/plugin`: Animation support
- `babel-plugin-module-resolver`: `@cs/*` alias resolution

### Metro Configuration (`metro.config.js`)

- Monorepo support: watches workspace root
- Dual node_modules paths: local + root
- Resolves `@cs/*` packages via symlinks

---

## Package Management

| Tool | Version | Notes |
|---|---|---|
| **Node.js** | >= 20 | Strict minimum |
| **npm** | 10.4.0+ | Workspaces (npm 7+) |
| **Lockfile** | package-lock.json | Single lock file for entire monorepo |

**Installation:** `npm install` (installs all workspaces + hoists shared deps)

---

## Key Dependencies

### UI & Styling

| Package | Version | Purpose |
|---|---|---|
| **styled-components** | 6.1.11 | CSS-in-JS (React Native support via `/native`) |
| **React Native Reanimated** | 3.16.1 | Smooth animations (roulette wheel) |
| **React Native SVG** | 15.8.0 | SVG rendering (roulette graphics) |
| **React Navigation** | 6.1.17 | Navigation primitives (leveraged by Expo Router) |
| **React Native Gesture Handler** | 2.20.2 | Touch/gesture detection |
| **React Native Safe Area Context** | 4.12.0 | Notch/safe area support |
| **React Native Screens** | 4.1.0 | Native screen optimization |
| **Expo Vector Icons** | 14.0.4 | Icon sets (preloaded) |

### State Management

| Package | Version | Purpose |
|---|---|---|
| **Zustand** | 4.5.2 | Lightweight state store |
| **Zustand persist** | (included) | AsyncStorage persistence middleware |

**Usage:** `useAppStore`, `useUserStore` (both persisted)

### Internationalization (i18n)

| Package | Version | Purpose |
|---|---|---|
| **i18next** | 23.11.5 | i18n framework |
| **react-i18next** | 14.1.2 | React integration |

**Supported Languages:** English (en), Portuguese-Brazil (pt-BR), Spanish (es)

**Translations package:** `@cs/locales` (separate package, loaded at startup)

### Backend & Authentication

| Package | Version | Purpose |
|---|---|---|
| **@supabase/supabase-js** | 2.43.4 | Auth (OAuth) + Database client |

**Configuration:** Auto token refresh enabled, session persistence to AsyncStorage enabled

**Stripe:** Backend-only (Deno Edge Function, not a client dependency)

### Expo-Specific Packages

| Package | Version | Purpose |
|---|---|---|
| **expo-font** | ~13.0.4 | Async font loading |
| **expo-linking** | ~7.0.3 | Deep-link handling (`compositionhelper://`) |
| **expo-splash-screen** | ~0.29.13 | Splash screen management |
| **expo-status-bar** | ~2.0.0 | Status bar style control |
| **expo-web-browser** | ~14.0.1 | OAuth callback handling |

---

## Development Tools

### Linting & Type Checking

| Tool | Version | Configuration |
|---|---|---|
| **ESLint** | ^8.57.1 | Extends `expo` config |
| **TypeScript Compiler** | ~5.4.2 | `npm run typecheck` (tsc --noEmit) |

**Run via Turborepo:** `npm run lint`, `npm run typecheck`

### Git Hooks

Not currently configured (can be added with husky + lint-staged if needed)

---

## Configuration Files

### App Configuration

| File | Purpose |
|---|---|
| `apps/mobile/app.json` | Expo app config (bundle ID, splash, splash color `#0f0f1a`, deep-link scheme `compositionhelper://`) |
| `apps/mobile/eas.json` | EAS Build profiles (iOS, Android) |
| `apps/mobile/babel.config.js` | Babel preset + module resolver |
| `apps/mobile/metro.config.js` | Metro bundler config (monorepo support) |
| `apps/mobile/tsconfig.json` | App TypeScript config (extends base) |

### Monorepo Configuration

| File | Purpose |
|---|---|
| `tsconfig.base.json` | Shared TypeScript config (strict mode, path aliases) |
| `turbo.json` | Turborepo task pipeline |
| `package.json` | Root workspaces definition |
| `package-lock.json` | Single lockfile for all packages |

---

## Continuous Integration / Deployment

### GitHub Actions Workflows

| Workflow | File | Trigger | Action |
|---|---|---|---|
| **Type Check + Lint** | `.github/workflows/ci.yml` | Push / PR | `npm run typecheck && npm run lint` |
| **Deploy Web** | `.github/workflows/deploy-web.yml` | Push to main | Build web + deploy to Vercel |
| **EAS Update** | `.github/workflows/eas-update.yml` | Push to main | OTA update via EAS |

### Deployment Platforms

| Platform | Purpose | Credentials |
|---|---|---|
| **Vercel** | Web app hosting (expo export --platform web) | VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID |
| **EAS (Expo)** | iOS/Android builds + OTA updates | EXPO_TOKEN |

---

## Environment Variables

### Required for App Runtime

| Variable | Scope | Purpose |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | `.env` + GitHub Secrets | Supabase project URL (public) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `.env` + GitHub Secrets | Supabase anon key (public) |

**Location:** `apps/mobile/.env` (gitignored, must be set manually or via secrets)

### Required for CI/CD

| Variable | Scope | Purpose |
|---|---|---|
| `EXPO_TOKEN` | GitHub Secrets | EAS authentication |
| `VERCEL_TOKEN` | GitHub Secrets | Vercel deployment |
| `VERCEL_ORG_ID` | GitHub Secrets | Vercel organization ID |
| `VERCEL_PROJECT_ID` | GitHub Secrets | Vercel project ID |

### Required for Backend (Supabase CLI)

| Variable | Scope | Purpose |
|---|---|---|
| `STRIPE_SECRET_KEY` | Supabase Secrets | Stripe API (Edge Function webhook) |
| `STRIPE_WEBHOOK_SECRET` | Supabase Secrets | Stripe signature verification |

---

## Version Pinning Strategy

| Dependency | Strategy | Rationale |
|---|---|---|
| Node | >= 20 | Major constraint (monorepo tooling) |
| TypeScript | ~5.4.2 | Minor (security patches, no breaking changes) |
| React | 18.3.1 | Exact (core stability) |
| React Native | 0.76.5 | Exact (platform-specific, breaking changes frequent) |
| Expo | ~52.0.0 | Minor (patches safe; minor versions rare) |
| Zustand, Supabase, i18next | ^4.x, ^2.x, ^23.x | Caret (semantic versioning trust) |
| Reanimated, styled-components | ~3.x, ^6.x | Minor/Major (stable APIs, infrequent breaks) |

**Rule:** Patch updates automatic; minor updates reviewed; major updates avoided unless necessary.

---

## Summary

**Total dependencies:** ~45 npm packages (including dev deps)

**Key characteristics:**
- ✅ Lean, modern stack (no unnecessary bloat)
- ✅ Strong type safety (strict TypeScript)
- ✅ Performance-optimized (native + web)
- ✅ Scalable (monorepo ready)
- ✅ Freemium-friendly (Supabase + Stripe integrated)
