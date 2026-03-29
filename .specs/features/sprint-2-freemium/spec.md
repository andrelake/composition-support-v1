# Sprint 2 — Freemium & Monetization Specification

## Problem Statement

O modelo de negócio está completamente bloqueado pelo lado do cliente: o botão de upgrade
está desabilitado, não existe fluxo de Stripe Checkout, não existe Customer Portal, e o
billing history nunca é populado. O Sprint 1 corrige o webhook — o Sprint 2 fecha o ciclo
de pagamento pelo lado do frontend e das Edge Functions.

## Goals

- [ ] Usuário FREE pode iniciar o fluxo de upgrade e completar o pagamento via Stripe Checkout
- [ ] Após pagamento confirmado pelo webhook, tier muda para PREMIUM sem intervenção manual
- [ ] Usuário PREMIUM pode gerenciar ou cancelar assinatura via Stripe Customer Portal
- [ ] Billing history é visível e populado na User Area para usuários PREMIUM

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| In-app purchases nativos (IAP / RevenueCat) | Fora do escopo do projeto |
| Múltiplos tiers além de FREE/PREMIUM | Não planejado para v1 |
| E-mail de confirmação de pagamento | Enviado pelo próprio Stripe automaticamente |
| Analytics de conversão (funil de upgrade) | v1.1 |
| Notificações push de pagamento | v1.1 |

---

## Architecture Decision

O Stripe Checkout é iniciado via **Supabase Edge Function** (`create-checkout-session`).
O frontend envia o JWT do usuário autenticado e recebe uma `checkout_url` para abrir no browser.
O webhook Stripe (corrigido no Sprint 1) processa a confirmação e atualiza o tier.
O Customer Portal segue o mesmo padrão via Edge Function `create-portal-session`.

```
[User Area] → POST /create-checkout-session (JWT)
           ← { url: "https://checkout.stripe.com/..." }
[App] → abre URL no browser
[Stripe] → redireciona para success_url (deep-link)
[Stripe] → POST /stripe-webhook (assinado)
[Webhook] → upsert subscriptions + update profiles.tier
[App] → onAuthStateChange ou re-fetch → UI reflete PREMIUM
```

---

## User Stories

### P1: Upgrade Flow (Stripe Checkout) ⭐ MVP

**User Story:** Como usuário FREE, quero tocar "Upgrade to Pro" e ser levado para o
Stripe Checkout para assinar o plano PREMIUM.

**Acceptance Criteria:**
1. WHEN usuário FREE toca "Upgrade to Pro" THEN o botão está habilitado (não `disabled`)
2. WHEN o botão é tocado THEN o app chama a Edge Function `create-checkout-session` com o JWT
3. WHEN a Edge Function responde com `{ url }` THEN o app abre a URL no browser (`Linking.openURL`)
4. WHEN o pagamento é completado no Stripe THEN o webhook processa e `profiles.tier = 'PREMIUM'`
5. WHEN o usuário volta ao app THEN a UI reflete tier PREMIUM (REGGAE desbloqueado)
6. WHEN a Edge Function retorna erro THEN o app exibe mensagem de erro e não crasha
7. WHEN o usuário cancela o checkout no browser THEN volta ao app sem mudança de estado

**Test:** Usar cartão de teste Stripe `4242 4242 4242 4242` → completar checkout →
verificar REGGAE desbloqueado na CadenceCard.

---

### P1: Edge Function `create-checkout-session` ⭐ MVP

**User Story:** Como sistema, preciso de uma Edge Function segura que crie sessões de
checkout no Stripe usando a chave secreta que não pode ficar no frontend.

**Acceptance Criteria:**
1. WHEN chamada com JWT válido de usuário autenticado THEN cria uma Stripe Checkout Session
2. WHEN cria a sessão THEN define `success_url` apontando para o deep-link `compositionhelper://`
3. WHEN cria a sessão THEN define `cancel_url` apontando para o deep-link `compositionhelper://`
4. WHEN cria a sessão THEN retorna `{ url: string }` com a URL de checkout hosted
5. WHEN o JWT está ausente ou inválido THEN retorna HTTP 401
6. WHEN a Stripe API retorna erro THEN retorna HTTP 500 com mensagem de erro
7. WHEN chamada com método diferente de POST THEN retorna HTTP 405

**Test:** `curl -X POST` com JWT válido → receber `{ url }` → abrir URL → ver Stripe Checkout.

---

### P2: Customer Portal (Manage Subscription)

**User Story:** Como usuário PREMIUM, quero gerenciar ou cancelar minha assinatura
sem precisar contatar o suporte.

**Acceptance Criteria:**
1. WHEN usuário PREMIUM toca "Manage Subscription" THEN o botão está habilitado
2. WHEN o botão é tocado THEN o app chama a Edge Function `create-portal-session` com o JWT
3. WHEN a Edge Function responde com `{ url }` THEN o app abre a URL no browser
4. WHEN o usuário cancela a assinatura no portal THEN o webhook processa `subscription.deleted`
5. WHEN a assinatura é cancelada THEN `profiles.tier = 'FREE'` e REGGAE é bloqueado novamente
6. WHEN usuário FREE toca o botão THEN o botão não está visível ou está desabilitado

**Test:** Cancelar assinatura no portal → verificar REGGAE bloqueado no app.

---

### P2: Edge Function `create-portal-session`

**Acceptance Criteria:**
1. WHEN chamada com JWT válido de usuário PREMIUM THEN cria um Stripe Billing Portal Session
2. WHEN cria a sessão THEN usa o `stripe_customer_id` associado ao usuário (buscado no Supabase)
3. WHEN cria a sessão THEN retorna `{ url: string }` com a URL do portal
4. WHEN JWT ausente ou inválido THEN retorna HTTP 401
5. WHEN usuário não tem `stripe_customer_id` THEN retorna HTTP 400 com mensagem explicativa

---

### P2: Billing History UI

**User Story:** Como usuário PREMIUM, quero ver meu histórico de pagamentos na User Area
para confirmar cobranças e datas de renovação.

**Acceptance Criteria:**
1. WHEN usuário PREMIUM acessa a User Area THEN uma seção "Billing" é visível
2. WHEN a tabela `subscriptions` tem dados do usuário THEN exibe: data de início, status,
   e data de renovação (`current_period_end`)
3. WHEN `billing history` está vazio THEN a chave `t('billing.noHistory')` é exibida
4. WHEN usuário FREE acessa a User Area THEN a seção de billing NÃO é renderizada
5. WHEN usuário guest acessa a User Area THEN a seção de billing NÃO é renderizada

**Test:** Usuário PREMIUM → User Area → seção Billing visível com data de renovação.

---

## Edge Cases

- WHEN o app retorna do browser após checkout cancelado THEN o estado do store não é alterado
- WHEN o deep-link de retorno do Stripe não resolve THEN o usuário ainda pode navegar no app normalmente
- WHEN `current_period_end` está no passado (assinatura expirada) THEN UI exibe status "expired"
  e tier já foi rebaixado pelo webhook
- WHEN o usuário já é PREMIUM e toca "Upgrade" (edge case de UI) THEN o botão não está visível

---

## Requirement Traceability

| ID | Story | Status |
| -- | ----- | ------ |
| S2-01 | P1: Botão Upgrade habilitado | Pending |
| S2-02 | P1: Edge Function `create-checkout-session` | Pending |
| S2-03 | P1: Frontend — chamar EF + abrir checkout URL | Pending |
| S2-04 | P2: Edge Function `create-portal-session` | Pending |
| S2-05 | P2: Botão Manage Subscription funcional | Pending |
| S2-06 | P2: Billing History UI + dados do Supabase | Pending |

---

## Files to Modify / Create

| File | Change |
| ---- | ------ |
| `supabase/functions/create-checkout-session/index.ts` | NOVO — Edge Function Deno |
| `supabase/functions/create-portal-session/index.ts` | NOVO — Edge Function Deno |
| `apps/mobile/app/(tabs)/user-area.tsx:93` | Habilitar botão + chamar Edge Function |
| `apps/mobile/app/(tabs)/user-area.tsx:102` | Habilitar botão + chamar Edge Function |
| `apps/mobile/app/(tabs)/user-area.tsx` | Adicionar seção Billing History |
| `apps/mobile/app/_layout.tsx` | Popular `billing` no store ao buscar profile (fetch `subscriptions`) |
| `packages/store/src/useUserStore.ts` | Garantir que `updateUser({ billing })` é chamado corretamente |

---

## Success Criteria

- [ ] Fluxo completo end-to-end: botão → checkout → pagamento → REGGAE desbloqueado
- [ ] Customer Portal abre corretamente para usuário PREMIUM
- [ ] Cancelamento no portal → REGGAE bloqueado novamente
- [ ] Billing History visível para PREMIUM, oculto para FREE e guest
- [ ] `npm run typecheck` passa sem erros
- [ ] Guest e FREE sem regressões
