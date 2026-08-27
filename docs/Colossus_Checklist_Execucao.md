# Colossus — Checklist de Execução

> Ordem de prioridade real: cada fase depende da anterior. Os itens com 🔴 travam o início da fase — resolver antes de seguir. Os com 🟡 podem esperar sem travar o resto.

---

## Fase 0 — Já concluído (referência)

- [x] Regras de partida (draft, leilão removido → trava em tempo real, duelo, torneio)
- [x] Requisitos Funcionais (RF01–RF66)
- [x] Design system (paleta, tipografia, card premium, átomos/moléculas)
- [x] Stack definida (Next.js, Tailwind, shadcn, Socket.io, SQLite/Drizzle)
- [x] VPS escolhida (Hostinger KVM 1)
- [x] Pipeline de deploy desenhada (GitHub Actions → SSH → PM2)

---

## Fase 1 — Decisões bloqueantes (antes de escrever qualquer código)

- [ ] 🔴 **Schema do banco (Drizzle)** — tabelas: `Match`, `Player`, `Team`, `TeamCharacter`, `Character`, `Duel`, `DuelRound`, `RankingEntry`, `ReconnectToken`
- [ ] 🔴 **Contrato de eventos Socket.io + rotas REST** — nome de cada evento, payload, e o que é socket vs. HTTP
- [ ] 🔴 **Onde ficam as imagens importadas** — disco local da VPS vs. storage externo (ex: Cloudflare R2) — afeta os adapters (RF63)

---

## Fase 2 — Scaffold do projeto

- [ ] Criar repositório no GitHub
- [ ] Inicializar Next.js + Tailwind + shadcn/ui
- [ ] Criar `server.js` customizado (Next.js + Socket.io no mesmo processo)
- [ ] Configurar Drizzle + `better-sqlite3`, ativar `PRAGMA journal_mode = WAL`
- [ ] Estrutura de pastas (`/app`, `/lib`, `/adapters`, `/db`, `/components`)
- [ ] Configurar Vitest (unitário/integração) + Playwright (E2E) — mesmo que com 1 teste placeholder cada, pra pipeline não quebrar desde o 1º push
- [ ] Primeiro "hello world" rodando localmente

---

## Fase 3 — Infraestrutura (VPS)

- [ ] Provisionar VPS Hostinger KVM 1 (Ubuntu)
- [ ] Instalar Node, PM2, Nginx
- [ ] Configurar domínio + SSL (Let's Encrypt)
- [ ] Configurar secrets no GitHub (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`)
- [ ] Rodar `pm2 start server.js --name colossus` manualmente (1ª vez)
- [ ] Validar pipeline completa (push → **test** → **e2e** → build → reload) — deploy só passa se os 3 gates forem verdes
- [ ] 🟡 Configurar backup automático do `.db` via cron

---

## Fase 4 — Core gameplay (backend)

> Cada item abaixo deve subir junto com seu teste unitário — não é mais "fazer e testar depois" (Fase 7 mudou de escopo, ver nota lá embaixo).

- [ ] Sessão/identidade (cookie httpOnly, token opaco, sem login)
- [ ] Criação de sala + geração de QR/link de entrada (RF02, RF07)
- [ ] Configuração do admin + validações RF04.1/RF04.2 (saldo × teto)
- [ ] Draft: escolha privada, débito na escolha, confirmação manual (RF13–RF17)
- [ ] Draft: trava em tempo real + invalidação em cascata (RF18–RF20)
- [ ] 🔴 Teste de concorrência do lock do draft (dois jogadores confirmando quase ao mesmo tempo) — o bug mais caro se passar despercebido, escrever junto com o item acima, não depois
- [ ] Draft: timeout com remoção em cascata + preenchimento aleatório (RF22–RF24)
- [ ] Duelo: escolha simultânea às cegas, comparação por score (RF30–RF33)
- [ ] Duelo: timeout de 1 min + auto-pick (RF35)
- [ ] Duelo: boost de percentil ao vencedor (RF38–RF39)
- [ ] Torneio: sorteio todos-contra-todos + ranking + desempates (RF40–RF46)
- [ ] Teste de integração: múltiplos duelos rodando em paralelo sem vazar evento entre rooms (RF42)
- [ ] Reconexão: detecção de queda, QR/link, timer de 2 min (RF10–RF12)

---

## Fase 5 — Importação de dados

- [ ] Adapter Pokémon (PokéAPI)
- [ ] Adapter Marvel/DC (Superhero API/Akabab)
- [ ] Adapter Yu-Gi-Oh! (YGOPRODeck) — ⚠️ obrigatório baixar/re-hospedar imagem (RF64)
- [ ] Adapter Dragon Ball (DokkanAPI) — 🟡 pendência: fonte de imagem alternativa (wiki/dokkanart)
- [ ] Adapter Futebol (dataset EA FC com `player_face_url` confirmado, RF65)
- [ ] Adapter Digimon (DigiDB + digi-api.com, casar por nome)
- [ ] 🟡 Decisão sobre One Piece (Defense ausente — usar HP como proxy?)
- [ ] Cálculo de percentil por franquia+atributo (RF57–RF59)
- [ ] 🔴 Teste unitário da fórmula de percentil (casos de empate, valor único, lista pequena)
- [ ] Cálculo de preço por Overall (RF29)
- [ ] 🔴 Teste unitário da fórmula de preço (overall 0, 50, 100, teto=mínimo)
- [ ] Rodar importação inicial e popular o banco

---

## Fase 6 — Frontend / telas

- [ ] Componentes atômicos em shadcn/Tailwind (botões, inputs, badges, stat chips)
- [ ] Componente de card de personagem (moldura dourada + cor de franquia)
- [ ] Tela de lobby/criação de sala (admin config + QR)
- [ ] Tela de draft (grid de personagens, saldo, confirmar time)
- [ ] Tela de duelo (seleção de card+atributo, timer, resultado da rodada)
- [ ] Tela de ranking/torneio
- [ ] Ajustes de responsividade mobile-first (RF01)

---

## Fase 7 — Qualidade E2E (gate de deploy, não é mais "pra depois")

> Os testes unitários e de concorrência já saíram daqui — agora vivem junto de cada feature nas Fases 4 e 5. O que sobra aqui é especificamente o fluxo ponta a ponta que a pipeline exige antes de liberar deploy pra `main` (ver seção de pipeline).

- [ ] 🔴 Configurar Playwright no CI (job `e2e`, roda só em push pra `main`)
- [ ] 🔴 E2E: criar partida → entrar via link → draft → duelo → ranking, fluxo completo num navegador real
- [ ] E2E: simular queda de conexão e reconexão dentro dos 2 minutos
- [ ] E2E: simular estouro de tempo no draft (aciona o mecanismo anti-exploit)

---

## Fase 8 — Polimento / pendências abertas

- [ ] Confirmar cores definitivas de Digimon e One Piece
- [ ] Definir nome da moeda fictícia
- [ ] Definir faixa do incremento aleatório do boost
- [ ] Definir limite de boosts acumuláveis por personagem/partida
- [ ] Definir número mínimo de jogadores por partida
- [ ] Gerar organismos/telas completas no Stitch (usando os átomos já prontos)
