# Sprint 3 — UX Polish Specification

## Problem Statement

Pequenas inconsistências acumuladas que afetam a qualidade percebida do app: 3 strings da
tela de login não passam por `t()` (violando a convenção de i18n), o idioma sempre inicia
em inglês independente do dispositivo, o avatar do usuário é apenas uma inicial mesmo quando
o Google OAuth fornece uma foto, e o centro da roda de roleta não tem feedback visual ao toque.
São itens de baixa complexidade mas que compõem a experiência de polimento para o lançamento.

## Goals

- [ ] Todas as strings visíveis ao usuário passam por `t()` — zero exceções no codebase
- [ ] App detecta o idioma do dispositivo automaticamente ao iniciar
- [ ] Foto do perfil do Google é exibida no User Area quando disponível
- [ ] Centro da roda tem feedback visual ao toque (affordance)
- [ ] Codebase sem imports mortos

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Suporte a novos idiomas além de en/pt-BR/es | Não planejado para v1 |
| Light mode | Decisão arquitetural — dark only, não negociável |
| Animações adicionais na roda | Funcional como está; otimização de animação é v1.1 |
| Tutorial de primeiro uso | v1.1 |

---

## User Stories

### P1: i18n — Strings Hardcoded no Login ⭐ MVP

**User Story:** Como usuário de língua portuguesa ou espanhola, quero que a tela de login
exiba os textos no meu idioma configurado para ter uma experiência consistente desde o primeiro acesso.

**Acceptance Criteria:**
1. WHEN `login.tsx` renderiza THEN o subtítulo usa `t('login.subtitle')`
2. WHEN `login.tsx` renderiza THEN o botão Google usa `t('login.googleButton')`
3. WHEN `login.tsx` renderiza THEN o botão Guest usa `t('login.guestButton')`
4. WHEN o idioma é `pt-BR` THEN as 3 strings aparecem em português no login
5. WHEN o idioma é `es` THEN as 3 strings aparecem em espanhol no login
6. WHEN as keys são adicionadas THEN todos os 3 arquivos de locale são atualizados
   (`en.json`, `pt-br.json`, `es.json`)

**Test:** Trocar idioma para pt-BR na User Area → navegar para login → ver textos em português.

**Keys a adicionar:**
```json
"login": {
  "subtitle": "Music theory tools for composers",
  "googleButton": "Continue with Google",
  "guestButton": "Continue as Guest"
}
```

---

### P1: Detecção Automática de Idioma do Dispositivo ⭐ MVP

**User Story:** Como usuário de qualquer idioma suportado, quero que o app use automaticamente
o idioma do meu dispositivo ao abrir pela primeira vez.

**Acceptance Criteria:**
1. WHEN app inicia pela primeira vez (sem preferência salva) THEN o idioma é detectado
   via `expo-localization` (`Localization.locale`)
2. WHEN o locale do dispositivo começa com `pt` THEN o app usa `pt-BR`
3. WHEN o locale do dispositivo começa com `es` THEN o app usa `es`
4. WHEN o locale do dispositivo não está entre os suportados THEN o app usa `en` (fallback)
5. WHEN o usuário altera manualmente o idioma na User Area THEN a preferência é salva
   no store (ou AsyncStorage) e persiste entre sessões
6. WHEN há uma preferência manual salva THEN ela tem prioridade sobre o locale do dispositivo
7. WHEN o app reinicia com preferência manual salva THEN usa o idioma salvo (não re-detecta)

**Test:** Configurar dispositivo para espanhol → abrir app pela primeira vez →
confirmar que inicia em espanhol.

---

### P2: Avatar do Usuário (Google OAuth Photo)

**User Story:** Como usuário que fez login com Google, quero ver minha foto de perfil
no User Area em vez de apenas uma inicial.

**Acceptance Criteria:**
1. WHEN usuário loga com Google THEN `_layout.tsx` extrai `user.user_metadata.avatar_url`
2. WHEN `avatarUrl` está disponível THEN `useUserStore.setProfile()` inclui o campo `avatarUrl`
3. WHEN `avatarUrl` está presente no store THEN User Area exibe a foto em componente `<Image>`
   circular no lugar da inicial
4. WHEN `avatarUrl` está ausente ou a imagem falha ao carregar THEN a inicial do nome é exibida
   (fallback — comportamento atual preservado)
5. WHEN usuário é guest THEN a inicial do nome é exibida (sem mudança)

**Test:** Login com Google → User Area → foto do perfil Google exibida.

---

### P3: Feedback Visual no Centro da Roda

**User Story:** Como usuário, quero um feedback visual ao tocar o centro da roda para
saber que meu toque foi registrado.

**Acceptance Criteria:**
1. WHEN usuário toca o centro da roda THEN há redução de opacidade momentânea (activeOpacity)
   ou outro feedback visual equivalente
2. WHEN a roda está girando (`isSpinning = true`) THEN o toque no centro é ignorado
   e não dispara um spin duplo (comportamento já implementado, preservar)

**Test:** Tocar centro da roda → observar feedback visual → roda gira.

---

### P3: Remover Import Morto (SpinButton.tsx)

**User Story:** Como desenvolvedor, quero um codebase sem imports não utilizados
para manter o código limpo e evitar confusão.

**Acceptance Criteria:**
1. WHEN `SpinButton.tsx` é compilado THEN não há imports não utilizados
2. WHEN `npm run lint` é executado THEN nenhum warning de `no-unused-vars` para `SpinButton.tsx`

**Test:** `npm run lint` sem warnings em `SpinButton.tsx`.

---

## Edge Cases

- WHEN `expo-localization` retorna `null` ou string vazia THEN fallback para `'en'`
- WHEN o locale do dispositivo é `pt-PT` (português de Portugal) THEN usar `pt-BR`
  (único português suportado)
- WHEN `avatar_url` do Google é uma URL relativa ou malformada THEN exibir fallback de inicial
- WHEN a imagem de avatar demora a carregar THEN exibir inicial como placeholder durante o load

---

## Requirement Traceability

| ID | Story | Status |
| -- | ----- | ------ |
| S3-01 | P1: i18n — 3 strings hardcoded no login | Pending |
| S3-02 | P1: Adicionar keys nos 3 arquivos de locale | Pending |
| S3-03 | P1: Detecção de locale do dispositivo | Pending |
| S3-04 | P2: Extrair `avatarUrl` do user_metadata | Pending |
| S3-05 | P2: Renderizar `<Image>` de avatar no User Area | Pending |
| S3-06 | P3: Feedback visual no `TouchableOpacity` central | Pending |
| S3-07 | P3: Remover dead import em SpinButton | Pending |

---

## Files to Modify

| File | Change |
| ---- | ------ |
| `apps/mobile/app/(auth)/login.tsx:52,60,65` | Substituir strings hardcoded por `t('login.*')` |
| `packages/locales/src/en.json` | Adicionar keys `login.subtitle`, `login.googleButton`, `login.guestButton` |
| `packages/locales/src/pt-br.json` | Idem em português |
| `packages/locales/src/es.json` | Idem em espanhol |
| `apps/mobile/app/_layout.tsx:14` | Substituir `initI18n('en')` por detecção via `expo-localization` |
| `apps/mobile/app/_layout.tsx` | Extrair `avatarUrl` de `user.user_metadata.avatar_url` |
| `apps/mobile/app/(tabs)/user-area.tsx` | Renderizar `<Image>` quando `avatarUrl` disponível |
| `apps/mobile/src/components/roulette/RouletteWheel.tsx` | Adicionar `activeOpacity` no `TouchableOpacity` central |
| `apps/mobile/src/components/roulette/SpinButton.tsx:4` | Remover `import { getRandomKey }` |

---

## Success Criteria

- [ ] Tela de login exibe textos corretos em pt-BR e es quando idioma do dispositivo configurado
- [ ] App inicia no idioma do dispositivo na primeira abertura
- [ ] Foto do perfil Google exibida após login com Google (quando disponível)
- [ ] Feedback visual no centro da roda ao toque
- [ ] `npm run typecheck` passa sem erros
- [ ] `npm run lint` passa sem warnings em SpinButton.tsx
