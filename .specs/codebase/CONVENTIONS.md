# Conventions - Composition Support

## File Organization & Naming

### Top-Level Structure

```
composition-support/
├── apps/                         ← Expo app workspace
├── packages/                     ← Reusable packages (@cs/*)
├── supabase/                     ← Backend: migrations, Edge Functions
├── .github/workflows/            ← CI/CD pipelines
├── .opencode/                    ← Agent skills + templates
├── .specs/                       ← TLC SDD documentation
├── generate-assets.js            ← Build helper
├── turbo.json                    ← Turborepo config
├── tsconfig.base.json            ← Shared TS config
├── package.json                  ← Root (workspaces only)
└── package-lock.json             ← Monorepo lockfile
```

### Package Naming

**Format:** `@cs/<name>` (cs = composition-support)

| Package | Import | Purpose |
|---|---|---|
| `@cs/music-engine` | `from '@cs/music-engine'` | Pure music theory logic |
| `@cs/store` | `from '@cs/store'` | Zustand state stores |
| `@cs/locales` | `from '@cs/locales'` | i18n setup + translations |
| `@cs/supabase` | `from '@cs/supabase'` | Supabase client singleton |

**All packages:**
- Marked `"private": true` (scoped, not published to npm)
- Expose `./src/index.ts` as entry point
- No build step needed (Babel + Metro resolve directly to `.ts`)

### File Naming Conventions

| Type | Format | Example | Rules |
|---|---|---|---|
| Component | PascalCase.tsx | RouletteWheel.tsx | React component; exported as function |
| Custom Hook | useCamelCase.ts | useAppStore.ts | Zustand store or custom hook |
| Utility | camelCase.ts | getNoteIndex.ts | Pure functions, constants |
| Types | types.ts | types.ts | Shared interfaces; centralized |
| Translations | locale.json | en.json, pt-br.json | Language files |
| Tests | *.test.ts | engine.test.ts | Jest/vitest format (future) |

### Expo Router Routes

| Type | Format | Example |
|---|---|---|
| Route group | (parentheses) | `(auth)`, `(tabs)` |
| Layout file | _layout.tsx | `app/(tabs)/_layout.tsx` |
| Route file | index.tsx | `app/(tabs)/index.tsx` |
| Entry point | index.tsx | `app/index.tsx` |

---

## Component Patterns

### Function Component Pattern

```typescript
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';
import { useAppStore, useUserStore } from '@cs/store';
import { theme } from '../../theme';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}

export function MyComponent({
  title,
  onPress,
  disabled = false,
}: MyComponentProps) {
  const { t } = useTranslation();
  const currentKey = useAppStore((s) => s.currentKey);
  const { profile } = useUserStore((s) => s.profile);

  return (
    <Container disabled={disabled}>
      <Title>{t('my.translated.key')}</Title>
      <Subtitle>{currentKey.root}</Subtitle>
      <Button onPress={onPress} disabled={disabled}>
        <ButtonText>{title}</ButtonText>
      </Button>
    </Container>
  );
}
```

**Rules:**
- ✅ Destructure props explicitly
- ✅ All user-visible text via `useTranslation()`
- ✅ All colors/spacing via theme tokens
- ✅ Zustand selectors use `(s) => s.field` to prevent re-renders
- ✅ Props interface local to component
- ❌ No inline styles
- ❌ No hardcoded colors, spacing, fonts
- ❌ No `PropTypes` (use TypeScript)

### Styled Components Pattern

```typescript
import styled from 'styled-components/native';
import { theme } from '../theme';

export const Container = styled.View<{ disabled?: boolean }>`
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.surfaceHover : theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

export const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.sizes.lg}px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

export const Subtitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.sizes.md}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

export const Button = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.border : theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  padding: ${({ theme }) => `${theme.spacing.sm}px ${theme.spacing.md}px`};
  align-items: center;
  justify-content: center;
`;

export const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.sizes.md}px;
  font-weight: 600;
`;
```

**Rules:**
- ✅ Use `styled.<primitive>` (View, Text, TouchableOpacity, etc.)
- ✅ Access theme via `${({ theme }) => theme.colors.primary}`
- ✅ Define once, import everywhere
- ✅ Accept props for conditional styling
- ❌ No inline styles (`style={}`)
- ❌ No hardcoded values

### Freemium Gate Pattern

**Pattern in CadenceCard.tsx:**

```typescript
export function CadenceCard() {
  const { profile } = useUserStore((s) => s.profile);
  const { harmonyResult } = useAppStore((s) => s.harmonyResult);
  const { t } = useTranslation();

  // Compute available genres based on tier
  const cadenceGenres = useMemo(() => {
    const allGenres = Object.keys(harmonyResult?.cadences || {});
    if (profile?.tier === 'PREMIUM') return allGenres;
    return allGenres.filter((g) => ['POP', 'JAZZ', 'CLASSICAL'].includes(g));
  }, [harmonyResult?.cadences, profile?.tier]);

  return (
    <Card>
      <Title>{t('dashboard.cadence.title')}</Title>

      {/* Show only available genres */}
      {cadenceGenres.map((genre) => (
        <GenreTab key={genre} genre={genre} />
      ))}

      {/* Show upgrade prompt if not PREMIUM */}
      {profile?.tier !== 'PREMIUM' && (
        <>
          <PremiumNotice>
            {t('dashboard.cadence.premiumNotice')}
          </PremiumNotice>
          <UpgradeButton onPress={handleUpgrade}>
            {t('dashboard.cadence.upgradeCTA')}
          </UpgradeButton>
        </>
      )}
    </Card>
  );
}
```

**Rules:**
- ✅ Check `profile?.tier === 'PREMIUM'` in UI layer
- ✅ Filter or hide features, not disable them
- ✅ Always show upgrade prompt
- ✅ Real enforcement on backend (Supabase RLS + Stripe webhook)
- ❌ Don't trust client-side gate alone
- ❌ Never hardcode tier logic

---

## State Management (Zustand)

### useAppStore Pattern

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateHarmony, getRandomKey } from '@cs/music-engine';
import { KeyConfig, HarmonyResult } from '@cs/store';

interface AppState {
  // State
  currentKey: KeyConfig;
  harmonyResult: HarmonyResult;
  isSpinning: boolean;
  targetKey: KeyConfig | null;

  // Actions
  setKey: (root: Note, tonality: Tonality) => void;
  spin: () => void;
  setSpinning: (spinning: boolean) => void;
  clearTarget: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      currentKey: { root: 'C', tonality: 'Major' },
      harmonyResult: calculateHarmony('C', 'Major'),
      isSpinning: false,
      targetKey: null,

      // Actions
      setKey: (root, tonality) => {
        set({
          currentKey: { root, tonality },
          harmonyResult: calculateHarmony(root, tonality), // Derived
        });
      },

      spin: () => {
        const randomKey = getRandomKey();
        set({
          isSpinning: true,
          targetKey: randomKey,
        });
      },

      setSpinning: (spinning) => {
        set({ isSpinning: spinning });
      },

      clearTarget: () => {
        set({ targetKey: null });
      },
    }),
    {
      name: 'composition-support-storage', // AsyncStorage key
      partialize: (state) => ({
        currentKey: state.currentKey, // Only persist essential state
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.currentKey) {
          // Recalculate derived state on rehydration
          state.harmonyResult = calculateHarmony(
            state.currentKey.root,
            state.currentKey.tonality
          );
        }
      },
    }
  )
);
```

**Rules:**
- ✅ Use `create()` + `persist()` middleware
- ✅ `partialize`: Only persist essential state
- ✅ `onRehydrateStorage`: Recalculate derived state after load
- ✅ Actions are synchronous (no thunks for simple operations)
- ✅ Separate into `useAppStore`, `useUserStore` by domain
- ❌ Never persist derived state (harmonyResult, isSpinning, etc.)
- ❌ Don't overload single store (separate concerns)

### Using Stores in Components

```typescript
export function MyComponent() {
  // Use selectors to prevent unnecessary re-renders
  const currentKey = useAppStore((s) => s.currentKey);
  const harmonyResult = useAppStore((s) => s.harmonyResult);
  const setKey = useAppStore((s) => s.setKey);

  const { profile } = useUserStore((s) => ({
    profile: s.profile,
  }));

  return (
    <View>
      <Text>{currentKey.root}</Text>
      <TouchableOpacity onPress={() => setKey('G', 'Major')}>
        <Text>Change to G Major</Text>
      </TouchableOpacity>
    </View>
  );
}
```

**Rules:**
- ✅ Destructure with selectors: `(s) => s.field`
- ✅ Select only what you need (prevents re-renders)
- ❌ Never destructure entire store
- ❌ Don't use `useShallow()` without explicit reason

---

## TypeScript Conventions

### Strict Mode (Always On)

**Configuration (`tsconfig.base.json`):**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler"
  }
}
```

**Requirements:**
- ✅ All function parameters explicitly typed
- ✅ All return types specified (no inference)
- ✅ Null/undefined explicitly handled (`| null`, `?:`)
- ✅ Generic types parameterized
- ❌ No `any` types (use `unknown` if necessary, then narrow)
- ❌ No type assertions without comment explaining why

### Type Definition Pattern

```typescript
// types.ts (centralized)
export type Note = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';

export type Tonality =
  | 'Major'
  | 'Minor'
  | 'Harmonic Minor'
  | 'Melodic Minor'
  | 'Ionian'
  | 'Dorian'
  | 'Phrygian'
  | 'Lydian'
  | 'Mixolydian'
  | 'Aeolian'
  | 'Locrian'
  | 'Major Pentatonic'
  | 'Minor Pentatonic';

export interface KeyConfig {
  root: Note;
  tonality: Tonality;
}

export interface Chord {
  name: string; // e.g., "Cmaj7"
  root: Note;
  quality: 'major' | 'minor' | 'diminished' | 'augmented';
  qualityType: string; // i18n key: "quality.major"
  chordClass: string; // i18n key: "chord.maj7"
  notes: Note[];
  degree: number; // 1-7
  isCharacteristic?: boolean;
}

export interface HarmonyResult {
  key: KeyConfig;
  scale: Note[];
  chords: Chord[];
  cadences: Record<string, Chord[][]>;
}

// component.tsx (import and use)
interface MyComponentProps {
  keyConfig: KeyConfig;
  onSelect: (key: KeyConfig) => void;
  disabled?: boolean;
}

export function MyComponent({
  keyConfig,
  onSelect,
  disabled = false,
}: MyComponentProps): JSX.Element {
  // Implementation
}
```

**Rules:**
- ✅ Centralize types in `types.ts`
- ✅ Props interfaces are local (component scope)
- ✅ Re-export types from `index.ts` (public API)
- ✅ Use `type` for unions, `interface` for objects
- ✅ Generic constraints when needed

---

## Internationalization (i18n)

### Mandatory Usage

**Every user-visible string must be translated.**

### Adding a New String

1. **Add to all translation files:**

```json
// packages/locales/src/translations/en.json
{
  "dashboard": {
    "myFeature": "Click here to proceed"
  }
}

// packages/locales/src/translations/pt-br.json
{
  "dashboard": {
    "myFeature": "Clique aqui para prosseguir"
  }
}

// packages/locales/src/translations/es.json
{
  "dashboard": {
    "myFeature": "Haz clic aquí para continuar"
  }
}
```

2. **Use in component:**

```typescript
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  return <Text>{t('dashboard.myFeature')}</Text>;
}
```

### Translation Key Patterns

**Dot notation for nesting:**

```json
{
  "dashboard": {
    "cadence": {
      "title": "Cadences",
      "POP": "Pop Progression",
      "premiumNotice": "Upgrade to Premium"
    },
    "scale": {
      "notes": "Scale Notes"
    }
  },
  "quality": {
    "major": "Major",
    "minor": "Minor",
    "diminished": "Diminished"
  },
  "error": {
    "networkFailed": "Network error. Try again."
  }
}
```

### Pluralization

```json
{
  "notes_one": "1 note",
  "notes_other": "{{count}} notes"
}
```

```typescript
{t('notes', { count: 5 })} // "5 notes"
{t('notes', { count: 1 })} // "1 note"
```

**Rules:**
- ✅ All 3 languages updated together
- ✅ Use dot notation: `'dashboard.cadence.title'`
- ✅ Use i18n keys for music terms (qualityType, tonality names)
- ❌ Never hardcode user-visible text
- ❌ Partial translations = build failure (good!)

---

## Theme Token System

### Theme Object Structure

**File:** `apps/mobile/src/theme/index.ts`

```typescript
export const theme = {
  colors: {
    // Backgrounds
    background: '#121214',    // Page/screen background
    surface: '#202024',       // Card/container background
    surfaceHover: '#29292e',  // Hover state

    // Accents
    primary: '#8257e6',       // Primary action, selected
    primaryLight: '#996DFF',  // Primary lighter variant

    // Text
    text: '#e1e1e6',          // Primary text
    textSecondary: '#a8a8b3', // Secondary text, labels

    // Borders
    border: '#323238',        // Dividers, borders

    // Status
    success: '#04D361',
    warning: '#FBA94C',
    error: '#E83F5B',
    info: '#3B82F6',

    // Tonality
    warm: '#F59E0B',  // Major (gold)
    cool: '#3B82F6',  // Minor (blue)
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },

  typography: {
    fontBody: 'System',
    fontMono: 'monospace',
    sizes: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 18,
      xl: 22,
      xxl: 28,
    },
  },
};
```

### Usage in Styled Components

```typescript
export const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.sizes.lg}px;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;
```

### Tonality Colors

| Tonality | Color | Variable | Hex |
|---|---|---|---|
| Major | Gold/Warm | `theme.colors.warm` | #F59E0B |
| Minor | Blue/Cool | `theme.colors.cool` | #3B82F6 |

**Usage:**

```typescript
const tonalityColor = harmonyResult.key.tonality === 'Major'
  ? theme.colors.warm
  : theme.colors.cool;
```

### Theme Constraints

- ✅ **Dark theme only.** No light mode tokens.
- ✅ **All colors via theme tokens.** No hardcoded hex values in components.
- ✅ **All spacing via theme tokens.** No hardcoded pixels.
- ✅ **All fonts via theme tokens.** No hardcoded font sizes.
- ❌ Never override theme in component styles.
- ❌ Never add ad-hoc colors.

---

## Git Conventions

### Commit Message Format

```
<type>: <subject> [scope]

<body (optional)>
```

### Types

| Type | Usage | Example |
|---|---|---|
| `feat` | New feature | `feat: add Reggae cadence progressions` |
| `fix` | Bug fix | `fix: recalculate harmonyResult on key change` |
| `refactor` | Code restructuring | `refactor: extract ScaleCard component` |
| `docs` | Documentation | `docs: update theme token table` |
| `chore` | Build, deps, config | `chore: update Expo to 52.1.0` |
| `test` | Test additions | `test: add scale calculation tests` |

### Examples

```
feat(packages/music-engine): add Reggae cadence progressions

- Added REGGAE to CADENCES constant
- Integrated 4 cadence variations
- Updated CadenceCard genre tabs

Closes #42

---

fix(apps/mobile): recalculate harmonyResult on key change

HarmonyResult was not updating when user manually changed tonality in ScaleRefCard.
Now properly recalculated via setKey() action.

---

docs: add TLC SDD brownfield analysis

Created .specs/ documentation:
- STACK.md: tech stack
- ARCHITECTURE.md: system design
- CONVENTIONS.md: coding standards
```

### Branch Strategy

| Branch | Purpose | Naming |
|---|---|---|
| `main` | Production-ready | (protected) |
| `dev` | Integration | Long-lived |
| `feature/*` | New features | `feature/wheel-animation` |
| `fix/*` | Bug fixes | `fix/harmony-calc-bug` |
| `docs/*` | Documentation | `docs/theme-tokens` |

**Workflow:**
1. `git checkout -b feature/<name>`
2. Commit regularly
3. `git push -u origin feature/<name>`
4. Create PR → review → merge to `dev`
5. Periodic release: `dev` → `main` (with version bump)

---

## No Build Step for Packages

### Why?

Module resolution happens at runtime:

```
import { calculateHarmony } from '@cs/music-engine'
  ↓
babel.config.js resolves alias:
'@cs/music-engine' → '../../packages/music-engine/src/index.ts'
  ↓
Metro detects .ts file, invokes Babel transformer
  ↓
Babel transpiles TypeScript to JavaScript on-the-fly
  ↓
Metro bundles and serves to device/simulator
```

### No Manual Build Required

| ❌ Don't do | ✅ Do instead |
|---|---|
| `npm run build` before dev | `expo start` directly |
| Check dist/ folders | Edit source files directly |
| Build packages separately | Metro handles compilation |

**Development Loop:**
```
1. Edit TypeScript in packages/
2. Save file
3. Metro detects change
4. Recompiles automatically
5. App refreshes (fast refresh)
```

---

## Summary Table

| Item | Format | Example | Rules |
|---|---|---|---|
| Package | @cs/<name> | @cs/music-engine | Scoped, private |
| Component | PascalCase.tsx | RouletteWheel.tsx | Exported function |
| Hook | useCamelCase.ts | useAppStore.ts | Zustand or custom |
| Utility | camelCase.ts | getNoteIndex.ts | Pure functions |
| Type | types.ts | types.ts | Centralized |
| i18n key | dot.notation | dashboard.cadence.title | Nested, all 3 langs |
| Theme var | camelCase | primary, warm | Token name |
| Git branch | type/name | feature/wheel | Semantic prefix |
| Commit | type: subject | feat: add cadences | Conventional |
| Color | Never hardcode | theme.colors.primary | Always token |
| Spacing | Never hardcode | theme.spacing.md | Always token |
| Font | Never hardcode | theme.typography.sizes.lg | Always token |
| String | Never hardcode | t('key') | Always i18n |
