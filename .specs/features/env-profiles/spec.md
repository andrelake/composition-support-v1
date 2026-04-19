# Spec: Configuração de Ambientes (Local / Produção)

**ID:** env-profiles  
**Criado:** 2026-04-19  
**Status:** Ready for Implementation  
**Prioridade:** P1 — Pré-requisito para qualquer deploy seguro

---

## Problema

O `.env` atual mistura credenciais reais de produção com a URL de OAuth do Vercel e está
implicitamente rastreado pelo git (ausente do `.gitignore`). Isso cria dois problemas:

1. **Credenciais expostas:** `EXPO_PUBLIC_SUPABASE_ANON_KEY` com valor real está no repositório.
2. **OAuth quebrado em dev local:** `EXPO_PUBLIC_SITE_URL` aponta para o domínio Vercel —
   qualquer redirect de OAuth em ambiente local falha ou redireciona para produção.

---

## Goals

- [ ] `.env` no repositório é apenas um template documentado (sem valores reais)
- [ ] `.env.local` (gitignored) contém os valores reais do desenvolvedor local
- [ ] OAuth funciona localmente via `http://localhost:8081`
- [ ] Produção (Vercel) usa variáveis configuradas no dashboard da Vercel (não no git)
- [ ] Todo desenvolvedor sabe exatamente o que fazer ao clonar o repo

---

## Out of Scope

| Item | Razão |
|---|---|
| Supabase separado para dev vs prod | Mesmo projeto — escopo futuro (v1.1) |
| Stripe keys por ambiente | Mesmo Stripe ainda — escopo futuro |
| `app.config.ts` dinâmico | `app.json` suficiente por ora |
| EAS build profiles por env | Já coberto no sprint-4 spec |
| Variáveis de feature flags | Não existe feature flag system ainda |

---

## User Stories

### ENV-01 · Template `.env` rastreado no git ⭐ P1

**Como** desenvolvedor que clona o repositório  
**Quero** encontrar um `.env` com todas as variáveis documentadas mas sem valores  
**Para** saber exatamente o que preciso configurar antes de rodar o app

**Acceptance Criteria:**
1. `WHEN` o repo é clonado `THEN` `apps/mobile/.env` existe com todas as variáveis sem valor
2. `WHEN` `.env` é inspecionado `THEN` cada variável tem um comentário explicando onde obter o valor
3. `WHEN` git status é verificado `THEN` `.env.local` aparece como untracked/ignored (nunca staged)
4. `WHEN` `.env.local` não existe `THEN` `expo start` avisa sobre variáveis faltando (comportamento padrão do Expo)

---

### ENV-02 · Desenvolvimento local com OAuth funcional ⭐ P1

**Como** desenvolvedor rodando `expo start --web`  
**Quero** que OAuth do Google redirecione corretamente para localhost  
**Para** testar o fluxo de autenticação sem precisar de um deploy

**Acceptance Criteria:**
1. `WHEN` `.env.local` tem `EXPO_PUBLIC_SITE_URL=http://localhost:8081`
   `THEN` o redirect de OAuth aponta para localhost após login com Google
2. `WHEN` o app roda em dev mode (`expo start`)
   `THEN` `useIsPremium()` retorna `true` (via `__DEV__` — sem alteração necessária)
3. `WHEN` o Supabase Dashboard tem `http://localhost:8081` na lista de Redirect URLs
   `THEN` o OAuth completa sem erro `redirect_uri_mismatch`
4. `WHEN` o dev usa as credenciais reais do Supabase em `.env.local`
   `THEN` o mesmo projeto Supabase funciona para dev e prod (shared project)

**Configuração manual requerida (documentada no spec):**
- Supabase Dashboard → Authentication → URL Configuration → Redirect URLs:
  adicionar `http://localhost:8081`

---

### ENV-03 · Produção via Vercel Dashboard ⭐ P1

**Como** mantenedor fazendo deploy na Vercel  
**Quero** que as variáveis de produção sejam configuradas no dashboard da Vercel  
**Para** que nunca sejam expostas no repositório git

**Acceptance Criteria:**
1. `WHEN` o workflow `deploy-web.yml` executa `THEN` a Vercel injeta as vars do seu dashboard
2. `WHEN` o build de produção é gerado `THEN` `EXPO_PUBLIC_SITE_URL` é o domínio Vercel
3. `WHEN` `__DEV__` é `false` (build de produção) `THEN` `useIsPremium()` usa o tier real do Supabase
4. `WHEN` as vars estão configuradas na Vercel `THEN` elas são aplicadas a todos os deploys do projeto

**Variáveis a configurar no Vercel Dashboard:**

| Variável | Valor |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon key do projeto Supabase |
| `EXPO_PUBLIC_SITE_URL` | `https://composition-support-v1.vercel.app` |

---

### ENV-04 · `.gitignore` protege arquivos de ambiente locais · P1

**Como** desenvolvedor  
**Quero** que arquivos com valores reais nunca sejam commitados acidentalmente  
**Para** evitar exposição de credenciais no histórico do git

**Acceptance Criteria:**
1. `WHEN` `.env.local` é criado `THEN` git o ignora automaticamente
2. `WHEN` `.env.*.local` (ex: `.env.development.local`) é criado `THEN` git também ignora
3. `WHEN` `git add .` é executado `THEN` nenhum arquivo `.env.local` é staged

---

## Variáveis por Ambiente

| Variável | Local (`.env.local`) | Produção (Vercel Dashboard) |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` | mesmo valor |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon key real) | mesmo valor |
| `EXPO_PUBLIC_SITE_URL` | `http://localhost:8081` | `https://composition-support-v1.vercel.app` |

> **Nota:** mesmo Supabase project para dev e prod (decisão consciente — isolamento em v1.1).

---

## Expo Env Precedence (como funciona)

Expo carrega variáveis na seguinte ordem (maior prioridade primeiro):

```
1. .env.local          ← dev local (gitignored, nunca commitado)
2. .env                ← template (commitado, sem valores reais)
```

O arquivo `.env.local` **sobrescreve** `.env` quando presente. Em produção (Vercel),
as variáveis do dashboard substituem qualquer arquivo `.env`.

Referência: https://docs.expo.dev/guides/environment-variables/

---

## Workflow: Desenvolvimento → Deploy

```
Clonou o repo?
  1. cp apps/mobile/.env apps/mobile/.env.local
  2. Preencher .env.local com valores reais (Supabase URL + anon key)
  3. Alterar EXPO_PUBLIC_SITE_URL=http://localhost:8081 no .env.local
  4. expo start --web (usa .env.local automaticamente)
  5. Testar localmente (OAuth via localhost, premium via __DEV__)

Pronto para subir?
  6. git add . && git commit && git push
  7. Vercel deploy automático (deploy-web.yml)
  8. Vercel usa as vars do dashboard (SITE_URL = domínio Vercel)
```

---

## Configurações Manuais Requeridas

### Supabase Dashboard

**Authentication → URL Configuration → Redirect URLs**

Adicionar:
```
http://localhost:8081
```

Já existente (manter):
```
https://composition-support-v1.vercel.app
```

### Vercel Dashboard

**Project → Settings → Environment Variables**

Adicionar as 3 variáveis listadas na tabela da seção ENV-03 acima.

---

## Files to Modify

| Arquivo | Ação | Story |
|---|---|---|
| `apps/mobile/.env` | Converter para template (remover valores, manter comentários) | ENV-01 |
| `apps/mobile/.gitignore` | Adicionar `.env.local` e `.env.*.local` | ENV-04 |

### Arquivos que **não** mudam

| Arquivo | Razão |
|---|---|
| `apps/mobile/src/hooks/useIsPremium.ts` | `__DEV__` já resolve o bypass local |
| `apps/mobile/app.json` | Sem necessidade de config dinâmico |
| `apps/mobile/eas.json` | Perfis já configurados |
| `.github/workflows/deploy-web.yml` | Vercel já lê vars do dashboard automaticamente |
| Qualquer package em `packages/` | Sem impacto |

---

## Requirement Traceability

| ID | Story | Status |
|---|---|---|
| ENV-01 | `.env` como template no git | Done |
| ENV-02 | OAuth local via localhost:8081 | Done |
| ENV-03 | Produção via Vercel Dashboard | Done |
| ENV-04 | `.gitignore` protege `.env.local` | Done |

---

## Success Criteria

- [x] `git grep EXPO_PUBLIC_SUPABASE_ANON_KEY apps/mobile/.env` mostra linha sem valor real
- [x] `git check-ignore -v apps/mobile/.env.local` confirma que é ignorado
- [x] `expo start --web` com `.env.local` carrega o app sem erros de env missing
- [x] Login com Google em `localhost:8081` completa sem `redirect_uri_mismatch`
- [x] Deploy na Vercel usa `EXPO_PUBLIC_SITE_URL` do dashboard (não do `.env`)
- [x] `useIsPremium()` retorna `true` em dev local, verifica tier em produção (sem alteração de código)
