# Sprint 1 — Infrastructure & Auth Specification

## Problem Statement

O app é funcional para usuários guest, mas a infraestrutura de produção não está conectada.
As variáveis de ambiente estão ausentes, o Google OAuth está intencionalmente desabilitado,
e o Stripe webhook tem um bug crítico que faria qualquer upgrade de tier falhar silenciosamente.
Nenhum desses problemas é visível para um guest, mas todos bloqueiam a aquisição real de usuários
e a geração de receita.

## Goals

- [ ] Conectar o app a um projeto Supabase real (env vars populadas + client funcionando)
- [ ] Habilitar Google OAuth end-to-end (botão funcional, sessão persistida, profile no store)
- [ ] Corrigir o bug de schema no webhook Stripe para que upgrades de tier sejam gravados no banco
- [ ] Confirmar a máquina de estados de auth: sign in → profile fetched → sign out → cleared

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Stripe Checkout / UI de pagamento | Sprint 2 |
| i18n nas strings hardcoded do login | Sprint 3 |
| Avatar photo do Google OAuth | Sprint 3 |
| Detecção automática de locale do dispositivo | Sprint 3 |
| Submissão App Store / Google Play | Sprint 4 |

---

## User Stories

### P1: Environment Setup ⭐ MVP

**User Story:** Como desenvolvedor, quero o client Supabase conectado ao projeto real
para que autenticação e operações de banco de dados funcionem no app.

**Acceptance Criteria:**
1. WHEN o app inicia THEN `supabase.auth.getSession()` resolve sem erro
2. WHEN `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` estão definidas no `.env`
   THEN o warning "Supabase env vars not set" NÃO aparece no console
3. WHEN as vars estão ausentes THEN o warning É exibido (comportamento existente preservado)

**Test:** Iniciar app → observar console → confirmar ausência do warning quando `.env` está populado.

---

### P1: Google OAuth Login ⭐ MVP

**User Story:** Como novo usuário, quero fazer login com minha conta Google para que meu
tier de assinatura seja persistido e eu possa acessar features premium.

**Acceptance Criteria:**
1. WHEN usuário toca "Continue with Google" THEN o botão está habilitado (não `disabled`)
2. WHEN o botão é tocado THEN o fluxo OAuth do Supabase abre no browser
3. WHEN o fluxo OAuth completa com sucesso THEN `onAuthStateChange` dispara com `SIGNED_IN`
4. WHEN `SIGNED_IN` dispara THEN o app busca a row `profiles` do Supabase para o usuário
5. WHEN o profile é buscado THEN `useUserStore.setProfile()` é chamado com os dados corretos
6. WHEN o profile é setado THEN o app navega para `/(tabs)/`
7. WHEN o app reinicia com sessão válida persistida THEN usuário vai direto para `/(tabs)/`
   (sem flash da tela de login)
8. WHEN usuário toca "Sign Out" na User Area THEN `supabase.auth.signOut()` é chamado
9. WHEN `SIGNED_OUT` dispara THEN o store é limpo e o usuário é redirecionado para `/(auth)/login`

**Test:** Executar Google OAuth → verificar que User Area exibe nome, email e tier corretos.

---

### P1: Stripe Webhook Schema Fix ⭐ MVP

**User Story:** Como assinante, quero que meu tier mude para PREMIUM imediatamente após
o pagamento para que eu possa acessar as cadências REGGAE sem precisar reiniciar o app.

**Acceptance Criteria:**
1. WHEN `checkout.session.completed` é recebido THEN o webhook lê `session.subscription`
   (o Stripe subscription ID) corretamente
2. WHEN faz upsert na tabela `subscriptions` THEN as colunas usadas correspondem ao schema
   da migration: `id` (Stripe subscription ID como PK), `user_id`, `status`, `price_id`,
   `current_period_end`, `cancel_at_period_end`
3. WHEN o upsert tem sucesso THEN a row `profiles` do usuário tem `tier = 'PREMIUM'`
4. WHEN `customer.subscription.deleted` é recebido THEN `profiles.tier` volta para `'FREE'`
5. WHEN `invoice.payment_failed` é recebido THEN `profiles.tier` volta para `'FREE'`
6. WHEN o webhook recebe uma assinatura Stripe inválida THEN responde com HTTP 401

**Test:** Usar Stripe CLI para disparar `checkout.session.completed` →
verificar `profiles.tier = 'PREMIUM'` no dashboard do Supabase.

**Bug Details (referência para implementação):**
- Código atual: `upsert({ stripe_customer_id, stripe_subscription_id, ... })`
- Schema real: `id` (PK), `user_id`, `status`, `price_id`, `current_period_end`, `cancel_at_period_end`
- Fix: alinhar o payload do upsert com os nomes reais das colunas; popular `id` com `session.subscription`

---

### P2: Robustez da Máquina de Estados de Auth

**User Story:** Como usuário, quero que o app lide corretamente com todas as transições de
auth (sign in, sign out, expiração de sessão) para que nunca fique preso em estado inconsistente.

**Acceptance Criteria:**
1. WHEN a sessão Supabase expira THEN `onAuthStateChange` dispara `SIGNED_OUT` e o usuário
   é redirecionado para o login
2. WHEN o app é aberto após cold start com sessão válida persistida THEN o usuário vai para
   `/(tabs)/` diretamente (sem tela de login)
3. WHEN um usuário guest fecha e reabre o app THEN cai em `/(auth)/login`
   (guest não é persistido — comportamento existente preservado)
4. WHEN ocorre erro de rede durante o fetch do profile THEN o app exibe estado de erro,
   não crasha, e o usuário pode tentar novamente

**Test:** Sign in → fechar app → reabrir → confirmar que vai para `/(tabs)/` sem re-autenticar.

---

## Edge Cases

- WHEN o usuário cancela o fluxo OAuth no browser THEN o app retorna à tela de login sem erro
- WHEN a row `profiles` não existe para um usuário recém-cadastrado (trigger atrasado)
  THEN `_layout.tsx` não crasha — tratar row nula com graceful handling
- WHEN múltiplos eventos `SIGNED_IN` disparam (Supabase pode emitir no token refresh)
  THEN o fetch do profile é idempotente (sem atualizações duplicadas no store)

---

## Requirement Traceability

| ID | Story | Status |
| -- | ----- | ------ |
| S1-01 | P1: Environment Setup | Pending |
| S1-02 | P1: Google OAuth — habilitar botão | Pending |
| S1-03 | P1: Google OAuth — máquina de estados de auth | Pending |
| S1-04 | P1: Stripe Webhook Schema Fix | Pending |
| S1-05 | P2: Robustez da máquina de estados de auth | Pending |

---

## Files to Modify

| File | Change |
| ---- | ------ |
| `apps/mobile/.env` | Adicionar `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` |
| `apps/mobile/app/(auth)/login.tsx:56` | Remover `disabled={true}` e `opacity: 0.5` do botão Google |
| `supabase/functions/stripe-webhook/index.ts:106-112` | Corrigir payload do upsert (colunas + campo `id`) |
| `supabase/migrations/` | Nova migration se houver rename de coluna necessário |

---

## Success Criteria

- [ ] App inicia sem warning de env vars do Supabase
- [ ] Botão Google OAuth habilitado e funcional end-to-end
- [ ] Sign in com Google → User Area exibe nome, email e tier corretos
- [ ] Stripe CLI `checkout.session.completed` → `profiles.tier = 'PREMIUM'` no Supabase
- [ ] `npm run typecheck` passa sem erros
- [ ] Guest login sem regressão
