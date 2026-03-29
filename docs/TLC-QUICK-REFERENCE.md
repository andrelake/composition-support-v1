# TLC SDD — Quick Reference (Composition Support)

> Referência rápida para sessões de coding. Comandos, fluxo, checklist.

---

## Comandos TLC

| Comando | Quando usar |
|---------|-----------|
| `"Specify feature [nome]"` | Nova feature (qualquer tamanho) |
| `"Design feature [nome]"` | Feature com arquitetura complexa (Large/Complex) |
| `"Break into tasks [nome]"` | Feature com muitas dependências (Large/Complex) |
| `"Implement"` | Executar tasks com TDD |
| `"Quick fix [descrição]"` | Bug fix, config, tweak pequeno |

---

## Auto-Sizing: Decidir Complexidade

| Escopo | O que fazer | Exemplo |
|--------|-----------|---------|
| **Small** | ≤3 arquivos → Quick fix | Corrigir cor de um botão |
| **Medium** | Feature clara, <10 tasks → Specify + Implement | Adicionar toggle de tonalidade |
| **Large** | Multi-componente → Specify + Tasks + Implement | Novo card no dashboard |
| **Complex** | Ambíguo, novo domínio → Full pipeline + pesquisa | Integração com nova API |

**Nunca pule:** SPECIFY, EXECUTE

---

## Comandos de Verificação

```bash
npm run typecheck   # Tipos TypeScript
npm run lint        # Estilo de código
npm run build       # Compilação (se aplicável)
```

**Executar após CADA task completa.**

---

## Git Workflow

```bash
# 1. Atualizar main
git fetch origin && git checkout main && git pull origin main

# 2. Criar branch
git checkout -b <type>/<name>

# 3. Fazer mudanças e commitar
git add .
git commit -m "type: descrição [scope]"

# 4. Push
git push -u origin <type>/<name>

# 5. Criar PR no GitHub
```

**Branch naming:**
- `feature/nome` → Nova funcionalidade
- `fix/nome` → Correção de bug
- `docs/nome` → Documentação
- `chore/nome` → Build, deps, config

**Commit types:**
- `feat` → Nova feature
- `fix` → Bug fix
- `refactor` → Restruturação
- `docs` → Documentação
- `chore` → Build/deps/config
- `test` → Testes

---

## Checklist Pré-Start

- [ ] Branch criada a partir da main atualizada
- [ ] Contexto carregado (spec.md se existir)
- [ ] Arquivos .specs relevantes lidos (PROJECT.md, ARCHITECTURE.md)
- [ ] Complexidade avaliada (Small/Medium/Large/Complex)

---

## Checklist por Fase

### Specify
- [ ] Problema claro (2-3 sentenças)
- [ ] User stories com critérios aceitação (WHEN/THEN/SHALL)
- [ ] Edge cases identificados
- [ ] Out of scope definido

### Design (Large/Complex)
- [ ] Arquitetura documentada
- [ ] Dependências mapeadas
- [ ] Componentes novos identificados

### Tasks (Large/Complex)
- [ ] Tasks atômicas (1 task = 1 componente/função/arquivo)
- [ ] Dependências claras entre tasks
- [ ] [P] = parallel (sem dependência)

### Execute (TDD)
- [ ] Testes PRIMEIRO (RED)
- [ ] Código mínimo (GREEN)
- [ ] Refatorar se necessário
- [ ] Verify: typecheck + lint passam
- [ ] Commit atômico com testes
- [ ] Marcar [x] em tasks.md

---

## Referências Rápidas

| O que consultar | Arquivo |
|-----------------|---------|
| Visão do projeto | `.specs/project/PROJECT.md` |
| Roadmap | `.specs/project/ROADMAP.md` |
| Decisões/bloqueios | `.specs/project/STATE.md` |
| Stack tecnológico | `.specs/codebase/STACK.md` |
| Arquitetura | `.specs/codebase/ARCHITECTURE.md` |
| Convenções/Git | `.specs/codebase/CONVENTIONS.md` |
| Skills TLC | `~/.config/opencode/skills/tlc-spec-driven/SKILL.md` |
