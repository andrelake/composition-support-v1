# TLC SDD — Decision Flowchart (Composition Support)

> Decisão rápida: "O que eu preciso fazer?" → Visual

---

## Árvore Principal: O Que Fazer?

```
O que você quer fazer?
│
├─ Nova feature/funcionalidade?
│  │
│  ├─ É só uma frase? (≤3 arquivos)
│  │  └─→ QUICK FIX
│  │
│  ├─ Feature clara? (<10 tasks)
│  │  └─→ SPECIFY → IMPLEMENT
│  │
│  ├─ Multi-componente?
│  │  └─→ SPECIFY → TASKS → IMPLEMENT
│  │
│  └─ Ambíguo / novo domínio?
│     └─→ SPECIFY → DESIGN → TASKS → IMPLEMENT
│
├─ Bug fix?
│  └─→ QUICK FIX
│
├─ Refactoring?
│  └─→ SPECIFY → (Complexo?) → DESIGN → IMPLEMENT
│
└─ Documentação?
   └─→ DOCS (branch docs/*, nunca main)
```

---

## Fluxo por Comando

### "Specify feature [nome]"

```
O que faz:
├─ Cria .specs/features/[nome]/spec.md
├─ Define problemas (2-3 sentenças)
├─ User stories com prioridades (P1/P2/P3)
├─ Acceptance criteria (WHEN/THEN/SHALL)
├─ Edge cases identificados
├─ Tabela de rastreabilidade (FEAT-01, FEAT-02, ...)
└─ Out of scope definido

Quando usar:
├─ Toda feature nova (obrigatório)
├─ Refactoring significativo
└─ Mudança com escopo amplo
```

### "Design feature [nome]"

```
O que faz:
├─ Cria .specs/features/[nome]/design.md
├─ Define arquitetura dos componentes
├─ Mapeia dependências
└─ Identifica padrões existentes a reutilizar

Quando usar:
├─ Multi-componente
├─ Nova abordagem arquitetural
└─ (Só Large/Complex)
```

### "Break into tasks [nome]"

```
O que faz:
├─ Cria .specs/features/[nome]/tasks.md
├─ Quebra em T1, T2, T3... atômicas
├─ Define dependências (T2 depende de T1)
├─ Marca [P] para paralelas
└─ Define "Done when" testável

Quando usar:
├─ >3 tasks não-óbvias
├─ Dependências entre tasks
└─ (Só Large/Complex)
```

### "Implement"

```
O que faz:
├─ Carrega spec.md + tasks.md
├─ Para CADA task:
│  ├─ TDD: RED  → teste falha
│  ├─ TDD: GREEN→ código mínimo
│  ├─ VERIFY    → typecheck + lint
│  ├─ COMMIT    → atômico
│  └─ MARK      → [x] em tasks.md
└─ Repete até completar

Quando usar:
├─ Após Specify (sempre)
├─ Após Tasks (se existir)
└─ Após Design (se existir)
```

### "Quick fix [descrição]"

```
O que faz:
├─ Descreve problema (1 frase)
├─ TDD: teste reproduz o bug
├─ Implement: fix mínimo
├─ Verify: testes passam
└─ Commit: atômico

Quando usar:
├─ Bug fix simples
├─ Config change
├─ Tweak pequeno
└─ ≤3 arquivos envolvidos
```

---

## Árvore de Verificação

```
O que verificar?
│
├─ Tipos TypeScript
│  └─ npm run typecheck
│
├─ Estilo de código
│  └─ npm run lint
│
├─ Compilação
│  └─ npm run build
│
└─ Tudo junto
   └─ npm run typecheck && npm run lint && npm run build
```

**Quando rodar:** Após CADA task completa

---

## Git Workflow Flowchart

```
Você está na main?
│
├─ SIM → ⚠️ NUNCA COMMIT AQUI!
│  ├─ 1. git fetch origin
│  ├─ 2. git pull origin main
│  ├─ 3. git checkout -b <type>/<nome>
│  └─ 4. FAZER MUDANÇAS
│
└─ NÃO
   ├─ Branch é feature/*, fix/*, docs/*?
   │  ├─ SIM → FAZER MUDANÇAS
   │  └─ NÃO → criar branch correta
   │
   └─ Quer commitar na main?
      └─ NUNCA! → criar branch primeiro
```

### Branch Naming

```
feature/  → Nova funcionalidade (feature/add-reggae-cadences)
fix/      → Correção de bug (fix/harmony-calc-bug)
docs/     → Documentação (docs/tlc-sdd-setup)
chore/    → Build/deps/config (chore/update-expo)
```

### Commit Message

```
<type>: <subject> [scope]

feat: add Reggae cadence progressions
fix: recalculate harmonyResult on key change
refactor: extract ScaleCard component
docs: update theme token table
chore: update Expo to 52.1.0
test: add scale calculation tests
```

---

## Quando Pular Fases

```
NUNCA pule: SPECIFY, EXECUTE

Pode pular DESIGN quando:
├─ Mudança é direta
├─ Não afeta arquitetura
└─ É um fix simples

Pode pular TASKS quando:
├─ ≤3 steps óbvios
├─ Quick fix
└─ Feature muito simples
```

---

## Auto-Sizing: Decidir Complexidade

```
Nova feature / mudança?
│
├─ "Uma frase, ≤3 arquivos"
│  └─ Small → QUICK FIX
│
├─ "Feature clara, <10 tasks"
│  └─ Medium → SPECIFY + IMPLEMENT
│
├─ "Multi-componente, dependências"
│  └─ Large → SPECIFY + TASKS + IMPLEMENT
│
└─ "Ambíguo, novo domínio"
   └─ Complex → SPECIFY + DESIGN + TASKS + IMPLEMENT
```

---

## Checklist Rápida (Por Tipo de Trabalho)

### Nova Feature

```
[ ] Branch criada (feature/*)
[ ] Contexto carregado (PROJECT.md, ARCHITECTURE.md)
[ ] Complexidade avaliada
[ ] SPECIFY: spec.md criado
[ ] [DESIGN: design.md se Large/Complex]
[ ] [TASKS: tasks.md se Large/Complex]
[ ] EXECUTE: TDD para cada task
[ ] VERIFY: typecheck + lint + build
[ ] COMMIT: atômico
[ ] PR criada
```

### Bug Fix

```
[ ] Branch criada (fix/*)
[ ] Problema descrito (1 frase)
[ ] TDD: teste reproduz o bug
[ ] FIX: código mínimo
[ ] VERIFY: testes passam + typecheck + lint
[ ] COMMIT: atômico
[ ] PR criada
```

### Refactoring

```
[ ] Branch criada (feature/* ou refactor/*)
[ ] SPECIFY: por que refatorar + escopo
[ ] [DESIGN: se afetar arquitetura]
[ ] EXECUTE: TDD para cada task
[ ] VERIFY: typecheck + lint + build
[ ] COMMIT: atômico
[ ] PR criada
```

### Documentação

```
[ ] Branch criada (docs/*)
[ ] Conteúdo escrito
[ ] VERIFY: formatação correta
[ ] COMMIT: atômico
[ ] PR criada
```

---

## Referências Rápidas

| Precisa de... | Arquivo |
|---------------|---------|
| Visão do projeto | `.specs/project/PROJECT.md` |
| Roadmap | `.specs/project/ROADMAP.md` |
| Decisões/bloqueios | `.specs/project/STATE.md` |
| Stack tecnológico | `.specs/codebase/STACK.md` |
| Arquitetura | `.specs/codebase/ARCHITECTURE.md` |
| Convenções/Git | `.specs/codebase/CONVENTIONS.md` |
| Skills TLC | `~/.config/opencode/skills/tlc-spec-driven/SKILL.md` |
| Especificação feature | `.specs/features/[nome]/spec.md` |
| Tasks feature | `.specs/features/[nome]/tasks.md` |
