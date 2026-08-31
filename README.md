# 🏟️ Colossus

> Card game multiplayer web cross-franchise — monte times de personagens de universos diferentes e duela no formato todos-contra-todos.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Node](https://img.shields.io/badge/node-24%2B-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

---

## 🎮 O que é

Colossus é um **jogo de cartas multiplayer** onde jogadores:

1. **Criam ou entram em salas** via QR code ou link compartilhado
2. **Montam times** com personagens de múltiplos universos — Pokémon, Marvel/DC, Yu-Gi-Oh!, Dragon Ball, Futebol e Digimon
3. **Duelam** escolhendo cards e atributos em batalhas simultâneas às cegas
4. **Competem** em formato todos-contra-todos com ranking por pontuação

O jogo é **mobile-first** (smartphone/tablet), acessível via navegador sem necessidade de download.

---

## 🛠️ Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 + shadcn/ui |
| Realtime | Socket.io |
| Banco de Dados | SQLite + Drizzle ORM |
| Testes | Vitest + Playwright |
| Logging | Pino → Axiom |
| Monitoramento | Sentry |
| CI/CD | GitHub Actions → VPS (PM2) |

---

## 🚀 Como Rodar

### Pré-requisitos

- **Node.js 24+** — recomendamos usar [nvm](https://github.com/nvm-sh/nvm)
- Arquivo `.env` na raiz (copiar de `.env.example`)

```bash
nvm use v24.20
cp .env.example .env
```

### Instalação e Desenvolvimento

```bash
npm install       # Instalar dependências
npm run dev       # Servidor de desenvolvimento (localhost:3000)
```

### Outros Comandos

```bash
npm run test         # Testes unitários (Vitest)
npm run test:e2e     # Testes E2E (Playwright)
npm run storybook    # Storybook (localhost:6006)
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # ESLint
```

---

## 📁 Estrutura do Projeto

```
colossus/
├── app/              # Next.js App Router (páginas e layouts)
├── src/
│   ├── lib/          # Utilitários (logger, socket client)
│   ├── stories/      # Storybook stories
│   └── tests/        # Testes unitários e E2E
├── docs/             # Documentação do produto (requisitos, regras, checklist)
├── public/           # Assets estáticos
├── server.js         # Servidor customizado (Next.js + Socket.io)
└── COLOSSUS.md       # Contexto completo para agentes de IA
```

---

## 📖 Documentação

| Documento | Descrição |
|---|---|
| [Requisitos Funcionais](docs/Requisitos_Funcionais.md) | RF01 a RF66 — especificação completa |
| [Regras de Partida](docs/Card_Game_Cross-Franchise_Regras_de_Partida.md) | Draft, duelo, torneio e reconexão |
| [Checklist de Execução](docs/Colossus_Checklist_Execucao.md) | Fases 0–8 do desenvolvimento |
| [Fase 1 — Fundações](docs/colossus%20-%20fase%201.txt) | Schema do banco e decisões arquiteturais |

---

## 🤖 Para Agentes de IA

Se você é um agente de IA (Gemini, Claude, GPT, etc.), leia:
- [`AGENTS.md`](AGENTS.md) — Instruções do Next.js 16 + referência ao projeto
- [`COLOSSUS.md`](COLOSSUS.md) — Contexto completo: stack, convenções, arquitetura, como rodar

---

## 📄 Licença

Projeto pessoal. Todos os direitos reservados.
