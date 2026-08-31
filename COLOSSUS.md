# Colossus — Contexto para Agentes de IA

> Este documento contém tudo que um agente de IA precisa saber para contribuir com o projeto.
> Para instruções do Next.js 16 (breaking changes), veja o [AGENTS.md](./AGENTS.md).

---

## O que é o Colossus

Um **card game multiplayer web** cross-franchise onde jogadores:
1. Criam/entram em salas via QR code ou link
2. Montam times com personagens de múltiplos universos (Pokémon, Marvel/DC, Yu-Gi-Oh!, Dragon Ball, Futebol, Digimon)
3. Duelam em formato **todos-contra-todos** (round-robin) com ranking por pontuação

O jogo é **mobile-first** (smartphone/tablet). Em desktop, usa as dimensões do maior tablet suportado.

---

## Stack Tecnológica

| Camada | Tecnologia | Notas |
|---|---|---|
| Framework | Next.js 16 (App Router) | Servidor customizado em `server.js` |
| UI | React 19 + Tailwind CSS 4 + shadcn/ui | shadcn/ui será instalado na Fase 6 |
| Realtime | Socket.io 4 | Tudo a partir de "Iniciar Partida" é via Socket |
| Banco de Dados | SQLite + Drizzle ORM | `PRAGMA journal_mode = WAL` obrigatório |
| IDs | NanoID | Todas as entidades usam `text` como PK |
| Logging | Pino → Axiom (produção) / stdout (dev) | — |
| Monitoramento | Sentry | Client + server-side |
| Testes | Vitest (unitário) + Playwright (E2E) | — |
| Componentes | Storybook 10 | — |
| CI/CD | GitHub Actions → rsync → PM2 (VPS Hostinger) | — |

---

## Convenções de Código

### Idioma
- **Código**: Todo em **inglês** — nomes de variáveis, funções, classes, eventos Socket.io, mensagens de log, chaves de JSON
- **Documentação do projeto** (docs/, README, COLOSSUS.md): **Português**
- **Interface do usuário** (textos visíveis ao jogador): **Português**

### Padrões gerais
- TypeScript strict mode ativado
- ESM (`"type": "module"` no package.json)
- Path alias: `@/*` aponta para a raiz do projeto
- Conventional Commits (commitlint + husky)
- lint-staged executa ESLint no pre-commit

---

## Arquitetura: Socket.io vs REST

> Decisão documentada em `docs/colossus - fase 1.txt`.

| Tipo de ação | Canal | Exemplos |
|---|---|---|
| Configuração / setup | **REST** (Next.js App Router) | Criar partida, editar config, entrar na sala |
| Gameplay em tempo real | **Socket.io** | Draft, trava de personagens, duelo, timers |

**Regra**: O estado transitório (timers, turno atual) vive na **memória do Node.js**. O SQLite recebe gravações apenas em **encerramentos de turno**, não a cada segundo.

---

## Como Rodar

### Pré-requisitos
- Node.js 24+ (usar `nvm use v24.20`)
- Arquivo `.env` na raiz (copiar de `.env.example`)

### Comandos
```bash
npm install              # Instalar dependências
npm run dev              # Servidor de desenvolvimento (tsx + server.js customizado)
npm run test             # Testes unitários (Vitest)
npm run test:e2e         # Testes E2E (Playwright — precisa do server rodando)
npm run storybook        # Storybook na porta 6006
npm run build            # Build de produção
npm run start            # Servidor de produção
```

### Variáveis de ambiente
```
AXIOM_DATASET=colossus-logs    # Dataset do Axiom (logging em produção)
AXIOM_TOKEN=                   # Token do Axiom
SENTRY_AUTH_TOKEN=              # Token do Sentry (build)
```

---

## Documentação do Produto

Toda a especificação de negócio está em `docs/`:

| Documento | Conteúdo |
|---|---|
| [`Requisitos_Funcionais.md`](docs/Requisitos_Funcionais.md) | RF01 a RF66 — requisitos completos |
| [`Card_Game_Cross-Franchise_Regras_de_Partida.md`](docs/Card_Game_Cross-Franchise_Regras_de_Partida.md) | Regras detalhadas de draft, duelo, torneio |
| [`Colossus_Checklist_Execucao.md`](docs/Colossus_Checklist_Execucao.md) | Fases 0–8 com checklist |
| [`colossus - fase 1.txt`](docs/colossus%20-%20fase%201.txt) | Schema Drizzle + decisões arquiteturais da Fase 1 |
| [`assets/colossus-design-system.html`](docs/assets/colossus-design-system.html) | Design system (paleta, tipografia, card premium) |

---

## Schema do Banco de Dados

O schema Drizzle está documentado em `docs/colossus - fase 1.txt` e define as seguintes tabelas:

- **matches** — Partida (status, config do admin)
- **players** — Jogadores (vínculo com partida, sessão, expulsão)
- **franchises** — Franquias (nome, cor, atributo individual)
- **characters** — Personagens normalizados (attack/defense/individual raw+score, overall)
- **teams** / **team_characters** — Draft (saldo, confirmação irreversível)
- **duels** / **duel_rounds** — Gameplay (status, vencedor, atributos escolhidos)
- **ranking_entries** — Placar do torneio (pontos, vitórias, derrotas, rounds won)
- **reconnect_tokens** — Reconexão (token opaco, expiração 2min)

> ⚠️ O schema ainda não foi implementado como código. Quando for criá-lo, siga estritamente o que está documentado em `docs/colossus - fase 1.txt`.

---

## Pipeline CI/CD

```
push to main → npm ci → vitest → playwright → next build → rsync VPS → pm2 reload
```

Os 3 gates (unit, e2e, build) devem passar antes do deploy. Ver `.github/workflows/deploy.yml`.

---

## Decisões Pendentes (Seção 10 dos Requisitos)

Antes de implementar, consulte as pendências em `docs/Requisitos_Funcionais.md` (seção 10) e `docs/Card_Game_Cross-Franchise_Regras_de_Partida.md` (seção 7). Itens-chave:

- Nome da moeda fictícia
- Faixa do boost pós-duelo
- Limite de boosts acumuláveis
- Número mínimo de jogadores
- Confirmação da devolução de saldo no draft (RF20)
- Empate de score dentro de uma rodada
