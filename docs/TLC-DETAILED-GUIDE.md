# TLC SDD — Guia Detalhado (Composition Support)

> Guia completo para uso do TLC Spec-Driven Development no Composition Support.

---

## 1. Visão Geral

O **TLC Spec-Driven Development (SDD)** é um sistema de planejamento e execução de projetos com **4 fases adaptáveis**: Specify → Design → Tasks → Execute.

**Por que estamos usando:**
- Previne over-engineering (spec-first approach)
- Garante que acceptance criteria são metidos (TDD obrigatório)
- Auto-dimensiona baseado na complexidade (pequenas features não precisam de pipeline completo)
- Documenta decisões para referência futura

**Referência completa:** `~/.config/opencode/skills/tlc-spec-driven/SKILL.md`

---

## 2. Auto-Sizing: Complexidade → Profundidade

**Princípio central:** A complexidade determina a profundidade, não um pipeline fixo.

| Escopo | Descrição | Pipeline |
|--------|-----------|----------|
| **Small** | ≤3 arquivos, uma frase de descrição | Quick fix (pula pipeline) |
| **Medium** | Feature clara, <10 tasks | Specify → (inline design) → Implement |
| **Large** | Multi-componente | Specify → Design → Tasks → Implement |
| **Complex** | Ambíguo, novo domínio | Specify → Design → Tasks → Implement + pesquisa |

**Regras:**
- **Specify e Execute são sempre obrigatórios**
- **Design é pulado** quando a mudança é direta
- **Tasks é pulado** quando ≤3 steps óbvios
- **Quick mode** é para bugs, configs, tweaks pequenos

---

## 3. Pipeline: 4 Fases

### 3.1 SPECIFY (Obrigatória)

**Objetivo:** Capturar O QUE construir com requirements testáveis e rastreáveis.

**Processo:**
1. **Clarificar requirements** — Perguntas conversacionais:
   - "Que problema você está resolvendo?"
   - "Quem é o usuário e qual é a dor?"
   - "O que significa sucesso?"

2. **Capturar User Stories com prioridades**
   - P1 = MVP (deve shippar)
   - P2 = Should have
   - P3 = Nice to have
   - Cada story deve ser **independentemente testável**

3. **Escrever Acceptance Criteria**
   - Formato: WHEN [ação] THEN sistema SHALL [comportamento]

4. **Identificar Edge Cases**
   - WHEN [boundary] THEN sistema SHALL [behavior]
   - WHEN [error] THEN sistema SHALL [handling]

**Saída:** `.specs/features/[nome]/spec.md`

**Referência completa:** `~/.config/opencode/skills/tlc-spec-driven/references/specify.md`

---

### 3.2 DESIGN (Opcional)

**Objetivo:** Definir arquitetura e componentes para features complexas.

**Quando pular:**
- Mudança é direta (não afeta arquitetura)
- Não há novos componentes significativos
- É um fix simples ou refactoring

**Quando usar:**
- Multi-componente (afeta >1 pacote)
- Nova abordagem (padrão diferente do existente)
- Dependências externas novas

**Saída:** `.specs/features/[nome]/design.md`

---

### 3.3 TASKS (Opcional)

**Objetivo:** Quebrar em tasks GRANULARES e ATÔMICAS.

**Quando pular:**
- ≤3 steps óbvios
- Quick fix
- Feature muito simples

**Regras:**
- **1 task = 1 componente, 1 função, 1 arquivo, ou 1 endpoint**
- Marcar [P] para tasks que podem rodar em paralelo
- Cada task deve ter "Done when" testável
- Dependências são gates (claro o que bloqueia o quê)

**Saída:** `.specs/features/[nome]/tasks.md`

**Referência completa:** `~/.config/opencode/skills/tlc-spec-driven/references/tasks.md`

---

### 3.4 EXECUTE (Obrigatória)

**Objetivo:** Implementar 1 task por vez com TDD. Teste primeiro. Código mínimo. Verificar. Commitar.

**TDD Workflow (Obrigatório):**

```
1. RED    → Escrever teste que falha (define behavior esperado)
2. VERIFY → Rodar teste → deve FALHAR
3. GREEN  → Escrever código mínimo para passar
4. VERIFY → Rodar teste → deve PASSAR
5. REFA   → Melhorar código (mantendo testes verdes)
6. VERIFY → Verificar build (typecheck + lint)
7. COMMIT → Commit atômico com testes
8. MARK   → Marcar [x] em tasks.md
```

**Fresh Context Per Task:**
- Antes de cada task, carregar apenas contexto necessário:
  - spec.md da feature atual
  - task atual de tasks.md
  - tasks completadas nesta sessão
- Evitar manter codebase inteira em contexto

**Verification Gates (Após cada task):**
```bash
npm run typecheck   # Tipos TypeScript
npm run lint        # Estilo de código
npm run build       # Compilação (se aplicável)
```

**Referência completa:** `~/.config/opencode/skills/tlc-spec-driven/references/implement.md`

---

## 4. Comandos de Verificação (Composition Support)

| Comando | O que faz | Quando rodar |
|---------|----------|-----------|
| `npm run typecheck` | Verifica tipos TypeScript (strict mode) | Após cada task |
| `npm run lint` | Verifica estilo de código (ESLint) | Após cada task |
| `npm run build` | Compila todo o projeto (Turborepo) | Antes de commit final |
| `npm run dev` | Inicia servidor de desenvolvimento | Durante implementação |

**Estrutura dos pacotes:**
- `@cs/music-engine` — Lógica pura de teoria musical
- `@cs/store` — Estado global (Zustand)
- `@cs/locales` — Internacionalização
- `@cs/supabase` — Cliente Supabase

**Importante:** Pacotes não precisam de build step (Babel + Metro resolvem `@cs/*` diretamente para `.ts`).

---

## 5. Git Workflow (Composition Support)

### Branch Strategy

| Branch | Propósito | Naming |
|--------|-----------|--------|
| `main` | Production-ready (protegida) | (protegida) |
| `dev` | Integração | Long-lived |
| `feature/*` | Novas features | `feature/wheel-animation` |
| `fix/*` | Bug fixes | `fix/harmony-calc-bug` |
| `docs/*` | Documentação | `docs/theme-tokens` |

### ⚠️ Regra Crítica: NUNCA Commitar na Main

```bash
# Workflow obrigatório:
git fetch origin && git checkout main && git pull origin main   # 1. Atualizar main
git checkout -b <type>/<nome>                                  # 2. Criar branch
# ... fazer mudanças ...                                       # 3. Mudanças
git add . && git commit -m "type: descrição [scope]"           # 4. Commit
git push -u origin <type>/<nome>                               # 5. Push
# criar PR no GitHub                                           # 6. Review
# merge via GitHub                                             # 7. Merge
git branch -d <type>/<nome>                                    # 8. Deletar branch
```

### Commit Message Format

```
<type>: <subject> [scope]

<body (optional)>
```

| Type | Uso | Exemplo |
|------|-----|---------|
| `feat` | Nova feature | `feat: add Reggae cadence progressions` |
| `fix` | Bug fix | `fix: recalculate harmonyResult on key change` |
| `refactor` | Restruturação | `refactor: extract ScaleCard component` |
| `docs` | Documentação | `docs: update theme token table` |
| `chore` | Build/deps/config | `chore: update Expo to 52.1.0` |
| `test` | Testes | `test: add scale calculation tests` |

**Detalhes completos:** `.specs/codebase/CONVENTIONS.md` (seção Git Conventions)

---

## 6. Exemplos Reais (Composition Support)

### Exemplo 1: Nova Feature (Large)

**Cenário:** "Adicionar suporte para escalas do Blues no music engine"

```
1. Specify → .specs/features/blues-scales/spec.md
   - User Story: "Como músico, quero ver escalas Blues para improvisar"
   - Acceptance Criteria: WHEN seleciono "Blues" THEN mostro escala de 6 notas
   - Edge Cases: pentatônica + blue note, enharmonic spellings

2. Tasks → .specs/features/blues-scales/tasks.md
   - T1: Adicionar "Blues" ao tipo Tonality
   - T2: Adicionar intervals para Blues em constants.ts
   - T3: Testar getScale('C', 'Blues')
   - T4: Atualizar UI (ScaleRefCard) para mostrar Blues

3. Implement → TDD para cada task
   - T1: types.ts → testar type errors
   - T2: constants.ts → testar intervals
   - T3: engine.ts → testar scale calculation
   - T4: ScaleRefCard.tsx → testar UI

4. Verify → npm run typecheck && npm run lint
5. Commit → feat(packages/music-engine): add Blues scale support
```

### Exemplo 2: Bug Fix (Small)

**Cenário:** "Corrigir animação da roleta no Android"

```
1. Quick fix → "A roleta não gira no Android API 24-25"
2. TDD → Escrever teste que reproduz o bug
3. Implement → Fix mínimo no RouletteWheel.tsx
4. Verify → npm run typecheck && npm run lint
5. Commit → fix(apps/mobile): fix roulette animation on older Android
```

### Exemplo 3: Refactoring (Medium)

**Cenário:** "Extrair componente ScaleRefCard para reutilizar"

```
1. Specify → .specs/features/extract-scale-card/spec.md
   - Motivação: Código duplicado entre cards
   - Escopo: Extrair lógica de exibição de escala
   - Aceitação: Componente reutilizável, sem mudança visual

2. Design → .specs/features/extract-scale-card/design.md
   - Componente: ScaleDisplay.tsx (novo)
   - Props: scale[], selectedNote, onNotePress
   - Reusado por: ScaleRefCard.tsx (existente)

3. Tasks →
   - T1: Criar ScaleDisplay.tsx com props tipadas
   - T2: Refatorar ScaleRefCard para usar ScaleDisplay
   - T3: Testar visual e comportamento
   - T4: Verify + commit

4. Implement → TDD para cada task
5. Verify → npm run typecheck && npm run lint
6. Commit → refactor(apps/mobile): extract ScaleDisplay component
```

---

## 7. Checklist por Fase

### Antes de começar QUALQUER trabalho

- [ ] Main atualizada (`git fetch origin && git pull origin main`)
- [ ] Branch criada (`git checkout -b <type>/<nome>`)
- [ ] Contexto carregado:
  - [ ] `.specs/project/PROJECT.md` (visão)
  - [ ] `.specs/project/STATE.md` (decisões recentes)
  - [ ] `.specs/codebase/ARCHITECTURE.md` (se afetar arquitetura)
  - [ ] `.specs/codebase/CONVENTIONS.md` (sempre)
- [ ] Complexidade avaliada (Small/Medium/Large/Complex)
- [ ] Pipeline selecionado (Quick fix / Specify / Full)

### Durante Specify

- [ ] Problema claro (2-3 sentenças max)
- [ ] User stories com prioridades (P1, P2, P3)
- [ ] Acceptance criteria em formato WHEN/THEN/SHALL
- [ ] Edge cases identificados
- [ ] Out of scope definido
- [ ] Feature ID (FEAT-01, FEAT-02, ...) criado

### Durante Design (Large/Complex)

- [ ] Arquitetura documentada
- [ ] Componentes novos identificados
- [ ] Dependências mapeadas
- [ ] Padrões existentes reutilizados

### Durante Tasks (Large/Complex)

- [ ] Tasks atômicas (1 = 1 componente/função/arquivo)
- [ ] Dependências claras entre tasks
- [ ] [P] marcado para tasks paralelas
- [ ] "Done when" testável em cada task
- [ ] Commit message planejado para cada task

### Durante Execute (TDD)

- [ ] **PRIMEIRO:** Teste escrito (RED)
- [ ] Teste verificado (deve falhar)
- [ ] **SEGUNDO:** Código mínimo escrito (GREEN)
- [ ] Teste verificado (deve passar)
- [ ] **TERCEIRO:** Refactoring se necessário
- [ ] **VERIFY:** `npm run typecheck` passa
- [ ] **VERIFY:** `npm run lint` passa
- [ ] **VERIFY:** `npm run build` passa (se aplicável)
- [ ] **COMMIT:** Atômico com testes
- [ ] **MARK:** [x] em tasks.md

### Antes de PR

- [ ] Todos os [x] em tasks.md
- [ ] `npm run typecheck && npm run lint && npm run build`
- [ ] Commit messages limpos
- [ ] Branch up to date com main
- [ ] PR description com resumo das mudanças

---

## 8. Referências

### TLC SDD (Skills)

| Arquivo | O que contém |
|---------|------------|
| `SKILL.md` | Visão geral completa do TLC SDD |
| `references/specify.md` | Template e processo de Specify |
| `references/tasks.md` | Template e processo de Tasks |
| `references/implement.md` | Template e processo de Execute |
| `references/execute-config.md` | Config de execution por feature |

### Composition Support (.specs/)

| Arquivo | O que contém |
|---------|------------|
| `.specs/project/PROJECT.md` | Visão, goals, tech stack, scope |
| `.specs/project/ROADMAP.md` | Features, milestones, timeline |
| `.specs/project/STATE.md` | Decisões, blockers, todos |
| `.specs/codebase/STACK.md` | Dependencies, versions, config |
| `.specs/codebase/ARCHITECTURE.md` | System design, data flow |
| `.specs/codebase/CONVENTIONS.md` | Padrões, naming, Git rules |
