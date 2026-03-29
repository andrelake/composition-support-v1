# Sprint 4 — CI/CD & Production Launch Specification

## Problem Statement

O app está funcionalmente completo após os Sprints 1-3, mas não está nas lojas.
O pipeline de CI não bloqueia PRs com erros de lint (apenas com type errors), o workflow
de OTA update está explicitamente desabilitado com `if: false`, e os assets e metadados
necessários para submissão nas lojas ainda não foram preparados.

## Goals

- [ ] CI bloqueia PRs com erros de lint (não apenas typecheck)
- [ ] OTA updates funcionando via EAS Update após aprovação nas lojas
- [ ] App publicado e aprovado na App Store (iOS)
- [ ] App publicado e aprovado na Google Play Store (Android)

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Marketing site / landing page | Fora do escopo técnico do app |
| Analytics (Sentry, Firebase) | v1.1 — pós-lançamento |
| Push notifications | v1.1 |
| Testes automatizados (unit/integration) | v1.1 |
| Marketing / redes sociais | Fora do escopo de engenharia |

---

## User Stories

### P1: Lint Bloquear PRs ⭐ MVP

**User Story:** Como desenvolvedor, quero que o CI falhe em PRs com erros de lint
para manter a qualidade do código de forma automatizada.

**Acceptance Criteria:**
1. WHEN um PR tem erros de lint THEN o CI falha e o merge é bloqueado
2. WHEN um PR tem apenas warnings de lint (não erros) THEN o CI passa
3. WHEN `ci.yml` é atualizado THEN `continue-on-error: true` é removido do step de lint
4. WHEN o step de lint falha THEN a mensagem de erro é visível no log do GitHub Actions

**Test:** Criar PR com erro de lint intencional → confirmar que CI falha.

---

### P1: EAS Build — iOS ⭐ MVP

**User Story:** Como mantenedor, quero gerar um build de produção para iOS via EAS
para submeter ao App Store Connect.

**Acceptance Criteria:**
1. WHEN `eas build --platform ios --profile production` é executado THEN o build completa sem erro
2. WHEN o build completa THEN um arquivo `.ipa` está disponível para download no dashboard do EAS
3. WHEN `app.json` é revisado THEN `ios.bundleIdentifier` está correto e único
4. WHEN `app.json` é revisado THEN `version` e `ios.buildNumber` estão definidos
5. WHEN os assets são verificados THEN ícone (`1024x1024px`) e splash screen estão nas
   dimensões corretas e sem transparência (requisito da Apple)

**Test:** `eas build --platform ios --profile production` → build status "Finished" no dashboard.

---

### P1: EAS Build — Android ⭐ MVP

**User Story:** Como mantenedor, quero gerar um build de produção para Android via EAS
para submeter ao Google Play Console.

**Acceptance Criteria:**
1. WHEN `eas build --platform android --profile production` é executado THEN o build completa
2. WHEN o build completa THEN um arquivo `.aab` (Android App Bundle) está disponível no EAS
3. WHEN `app.json` é revisado THEN `android.package` está correto e único
4. WHEN `app.json` é revisado THEN `version` e `android.versionCode` estão definidos
5. WHEN o `versionCode` é incrementado entre builds THEN não conflita com builds anteriores
   no Play Console

**Test:** `eas build --platform android --profile production` → build status "Finished".

---

### P2: EAS Update (OTA) — Habilitar Workflow

**User Story:** Como mantenedor, quero que pushes para `main` publiquem automaticamente
OTA updates via EAS para que usuários recebam correções sem precisar atualizar o app nas lojas.

**Acceptance Criteria:**
1. WHEN `.github/workflows/eas-update.yml` é atualizado THEN `if: false` é removido do job
2. WHEN há um push para `main` THEN o workflow de OTA update é disparado automaticamente
3. WHEN o workflow completa THEN um update é publicado no canal de produção do EAS
4. WHEN o app é aberto após um OTA update THEN a nova versão é carregada no próximo start

**Nota:** Este item só deve ser ativado APÓS o app estar aprovado e publicado nas lojas.
Adicionar comentário no workflow indicando isso.

**Test:** Push para `main` → workflow "EAS Update" executa no GitHub Actions → update visível
no dashboard do EAS.

---

### P2: App Store — Assets e Metadados

**User Story:** Como mantenedor, quero ter todos os assets e metadados necessários para
a submissão na App Store prontos antes de iniciar o processo de review.

**Acceptance Criteria:**
1. WHEN a submissão iOS é preparada THEN pelo menos 3 screenshots para iPhone 6.5"
   (1284×2778px) estão disponíveis
2. WHEN a submissão iOS é preparada THEN a descrição completa do app (máx 4000 chars) está escrita
3. WHEN a submissão iOS é preparada THEN uma URL de Privacy Policy está configurada
4. WHEN a submissão iOS é preparada THEN keywords relevantes (máx 100 chars) estão definidos
5. WHEN a submissão iOS é preparada THEN a categoria do app está definida
   (sugestão: Music ou Education)

---

### P2: Google Play — Assets e Metadados

**User Story:** Como mantenedor, quero ter todos os assets e metadados necessários para
a submissão no Google Play Console.

**Acceptance Criteria:**
1. WHEN a submissão Android é preparada THEN um feature graphic (1024×500px) está disponível
2. WHEN a submissão Android é preparada THEN pelo menos 2 screenshots estão disponíveis
3. WHEN a submissão Android é preparada THEN short description (máx 80 chars) está escrita
4. WHEN a submissão Android é preparada THEN full description (máx 4000 chars) está escrita
5. WHEN a submissão Android é preparada THEN a categoria do app está definida
   (sugestão: Music & Audio ou Education)

---

## Checklist de Pré-Submissão

Antes de submeter às lojas, verificar:

- [ ] Todas as features dos Sprints 1-3 estão implementadas e testadas
- [ ] Google OAuth funcional em build de produção (não apenas development)
- [ ] Stripe Checkout funcional em build de produção
- [ ] Deep-link `compositionhelper://` configurado corretamente no `app.json`
- [ ] Não há chaves de API expostas no bundle (apenas `EXPO_PUBLIC_*` são aceitáveis no frontend)
- [ ] `STRIPE_SECRET_KEY` está apenas nas Supabase Secrets (nunca no bundle do app)
- [ ] Privacy Policy cobre Supabase Auth e Stripe (coleta de dados de pagamento)
- [ ] App testado em device iOS real e Android real (não apenas simuladores)
- [ ] Roulette animation smooth em device real (60fps)
- [ ] Splash screen e ícone nas dimensões corretas para ambas as plataformas

---

## Requirement Traceability

| ID | Story | Status |
| -- | ----- | ------ |
| S4-01 | P1: Remover `continue-on-error` do CI | Pending |
| S4-02 | P1: EAS Build iOS production | Pending |
| S4-03 | P1: EAS Build Android production | Pending |
| S4-04 | P2: Remover `if: false` do EAS Update workflow | Pending |
| S4-05 | P2: App Store — screenshots + metadados | Pending |
| S4-06 | P2: Google Play — assets + metadados | Pending |

---

## Files to Modify

| File | Change |
| ---- | ------ |
| `.github/workflows/ci.yml:32` | Remover `continue-on-error: true` do step de lint |
| `.github/workflows/eas-update.yml:9` | Remover `if: false` (após aprovação nas lojas) |
| `apps/mobile/app.json` | Verificar `bundleIdentifier`, `package`, `version`, `buildNumber`, `versionCode` |
| `apps/mobile/eas.json` | Verificar e configurar perfil `production` para iOS e Android |

---

## Success Criteria

- [ ] CI falha em PR com erro de lint (verificado com PR de teste)
- [ ] `eas build --platform ios --profile production` completa sem erro
- [ ] `eas build --platform android --profile production` completa sem erro
- [ ] App aprovado e publicado na App Store
- [ ] App aprovado e publicado na Google Play Store
- [ ] OTA update publicado automaticamente após merge em `main`
- [ ] Checklist de pré-submissão 100% concluído
