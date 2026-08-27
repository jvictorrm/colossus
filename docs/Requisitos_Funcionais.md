# Card Game Cross-Franchise — Requisitos Funcionais

> Documento extraído das decisões tomadas na sessão de levantamento de requisitos. Cada item reflete uma decisão confirmada; itens ainda não decididos estão listados à parte, na seção 10 (Pendências).

---

## 1. Plataforma

| ID | Requisito |
|---|---|
| RF01 | O sistema deve ser web, com layout mobile-first (smartphone e tablet). Em desktop, deve usar as dimensões do maior tablet suportado. |

---

## 2. Sala e Partida

| ID | Requisito |
|---|---|
| RF02 | O sistema deve permitir que o usuário crie uma partida ou entre em uma partida existente via QR code/link. |
| RF03 | O criador da partida deve se tornar automaticamente o admin da partida, sendo obrigatoriamente também jogador. |
| RF04 | O admin deve poder configurar: quantidade de personagens por time (mínimo 2, máximo 5), saldo inicial de compra, teto de preço, tempo limite do draft e limite de jogadores na partida. |
| RF04.1 | O sistema deve validar, ao salvar a configuração, que o saldo inicial de compra seja maior ou igual a 100 × X (quantidade de personagens por time definida). Caso contrário, deve bloquear o salvamento e alertar o admin de que a combinação torna impossível completar o time (nenhum jogador conseguiria fechar o elenco, mesmo com o mecanismo anti-exploit do timeout). |
| RF04.2 | O sistema deve validar que o teto de preço seja maior ou igual a 100 (preço mínimo de qualquer personagem). Caso o admin defina o teto igual a 100, o sistema deve alertá-lo (sem bloquear) de que isso elimina a diferenciação de preço — todos os personagens custarão exatamente o mínimo, independentemente do Overall. |
| RF05 | O admin deve poder editar as configurações da partida livremente até o início da competição. Toda edição deve reexecutar as validações RF04.1 e RF04.2. |
| RF06 | O sistema deve permitir a entrada de novos jogadores apenas enquanto a partida não tiver sido iniciada. |
| RF07 | Cada partida deve possuir um ID único. |
| RF08 | Ao final da partida, apenas estatísticas devem ser mantidas; nenhum dado (personagens, saldo, boosts) deve ser levado para outra partida. |
| RF09 | O admin deve iniciar manualmente a competição, encerrando a fase de configuração e entrada de jogadores. |

---

## 3. Reconexão

| ID | Requisito |
|---|---|
| RF10 | Em caso de queda de conexão durante um duelo ativo, o sistema deve notificar o adversário e gerar um QR code/link para o jogador caído reconectar. |
| RF11 | O jogador caído deve ter até 2 minutos para reconectar. Caso não reconecte nesse prazo, o adversário deve vencer o duelo automaticamente. |
| RF12 | A tolerância de reconexão deve se aplicar apenas durante um duelo ativo. |

---

## 4. Draft (Montagem de Times com trava em tempo real)

> Substitui integralmente o antigo modelo de leilão, descartado pelo autor do produto.

| ID | Requisito |
|---|---|
| RF13 | Os jogadores devem escolher seus personagens de forma independente e privada — nenhum jogador deve ver quais personagens outro jogador já selecionou enquanto o time dele não for confirmado. |
| RF14 | Ao selecionar um personagem, o sistema deve debitar imediatamente o preço do saldo do jogador (débito real, não apenas exibição). |
| RF15 | Cada jogador deve selecionar exatamente X personagens, conforme definido pelo admin (2 a 5), para habilitar a ação de confirmar o time. |
| RF16 | O sistema não deve impor reserva mínima de saldo — o jogador é responsável por administrar seu próprio saldo ao longo das escolhas. |
| RF17 | A confirmação do time deve ser uma ação manual e irreversível. |
| RF18 | No momento em que um jogador confirma o time, o sistema deve marcar todos os personagens desse time como indisponíveis para os demais jogadores, em tempo real. |
| RF19 | Se, no momento da confirmação de um jogador, outro jogador tiver um dos mesmos personagens em seu time ainda não confirmado, o sistema deve marcar esse personagem como indisponível para ele e bloquear a ação de confirmar até que ele o substitua por um personagem disponível. |
| RF20 | 💭 Ao invalidar um personagem selecionado (por outro jogador ter confirmado primeiro), o sistema deve devolver automaticamente o saldo debitado por aquele personagem, permitindo ao jogador escolher um substituto — *assunção a confirmar com o autor do produto*. |
| RF21 | O sistema deve manter o cronômetro do draft correndo normalmente mesmo quando um jogador precisar substituir um personagem invalidado — não deve haver tolerância extra de tempo. |
| RF22 | O sistema deve impor um tempo limite para o draft, definido pelo admin. |
| RF23 | Caso o tempo do draft se esgote com o time incompleto, o sistema deve remover os personagens do jogador em ordem do mais caro para o mais barato até liberar saldo suficiente, e preencher as vagas restantes com personagens sorteados aleatoriamente entre os ainda disponíveis. O time resultante deve ser confirmado automaticamente. |
| RF24 | A verificação de disponibilidade de personagens durante o preenchimento automático por timeout (RF23) deve ser feita em tempo real, no momento exato da atribuição no servidor, para evitar que dois jogadores recebam o mesmo personagem em caso de estouro de tempo simultâneo. |
| RF25 | O sistema não deve implementar nenhum mecanismo de leilão, lance ou disputa por saldo entre jogadores — a resolução de conflitos por personagem repetido deve ser feita exclusivamente por ordem de confirmação (RF18–RF19). |
| RF26 | O sistema não deve suavizar vantagens de velocidade/conexão na disputa por personagens — vale a ordem de confirmação recebida pelo servidor, sem buffer ou sorteio. |

---

## 5. Precificação de Personagens

| ID | Requisito |
|---|---|
| RF27 | O preço mínimo de qualquer personagem deve ser 100 unidades da moeda do jogo. |
| RF28 | O preço máximo (teto) deve ser definido pelo admin. |
| RF29 | O preço de cada personagem deve ser calculado a partir da média dos scores (percentil 0–100) de todos os seus atributos (overall), interpolado entre o preço mínimo e o teto, segundo a fórmula: `Preço = 100 + (Overall / 100) × (Teto − 100)`. |

---

## 6. Duelo

| ID | Requisito |
|---|---|
| RF30 | O duelo deve ocorrer entre os times completos de dois jogadores (time vs time). |
| RF31 | Em cada rodada do duelo, os dois jogadores devem escolher, simultaneamente e às cegas, um card (ainda não utilizado naquele duelo) e um atributo desse card (attack, defense ou o atributo individual da franquia). |
| RF32 | A comparação da rodada deve ser feita pelo score (0–100) do atributo escolhido por cada jogador, independentemente da categoria/franquia de cada lado. |
| RF33 | O jogador com o maior score na rodada deve vencer a rodada. |
| RF34 | Um card utilizado em uma rodada deve ficar indisponível apenas para aquele duelo específico, voltando a ficar disponível no duelo seguinte. |
| RF35 | Cada jogador deve ter até 1 minuto para escolher card e atributo por rodada. Caso o tempo se esgote, o sistema deve realizar automaticamente uma escolha aleatória (qualquer card disponível e qualquer atributo). |
| RF36 | O duelo deve terminar quando todos os cards de ambos os times tiverem sido utilizados; vence quem tiver vencido mais rodadas. |
| RF37 | O sistema deve permitir empate no resultado do duelo (mesmo número de rodadas vencidas por ambos os lados). |
| RF38 | O vencedor de cada duelo deve ganhar o direito de selecionar um atributo de um personagem para subir no percentil (score), com o incremento gerado aleatoriamente pelo sistema, respeitando o teto de 100. |
| RF39 | O boost de percentil concedido deve ser válido apenas durante a partida atual, não persistindo para partidas futuras. |

---

## 7. Torneio e Ranking

| ID | Requisito |
|---|---|
| RF40 | A competição deve seguir o formato "todos contra todos" — cada jogador enfrenta todos os demais exatamente uma vez, com os confrontos definidos por sorteio. |
| RF41 | O sistema não deve implementar território, mapa ou adjacência entre jogadores. |
| RF42 | Os duelos devem poder ocorrer em paralelo. |
| RF43 | O sistema deve pontuar cada duelo no ranking da seguinte forma: vitória = 2 pontos, empate = 1 ponto, derrota = 0 pontos. |
| RF44 | Em caso de empate na pontuação final, o sistema deve aplicar, em ordem: (1) mais vitórias, (2) menos derrotas, (3) resultado do confronto direto entre os empatados, (4) mais rodadas individuais vencidas na competição. |
| RF45 | Em empates circulares entre 3 ou mais jogadores, o sistema deve aplicar o próximo critério da lista de desempate a todos os jogadores envolvidos no ciclo. |
| RF46 | Ao final de todos os duelos, o sistema deve declarar vencedor o jogador com mais pontos no ranking. |

---

## 8. Regras Gerais / Transversais

| ID | Requisito |
|---|---|
| RF47 | O sistema deve preservar os valores originais (`raw`) de cada atributo importado, junto com o `score` normalizado (0–100), conforme especificação de normalização. |
| RF48 | O admin deve ser obrigatoriamente jogador da própria partida (não pode atuar apenas como espectador). |

---

## 9. Importação e Normalização de Dados (Fontes Externas)

> Extraído do documento de especificação de normalização ("Especificação com Futebol"), que define como personagens/jogadores de diferentes universos entram no banco do jogo.

| ID | Requisito |
|---|---|
| RF49 | O sistema deve importar personagens/jogadores de cinco universos: Pokémon (via PokéAPI), Marvel/DC (via Superhero API / Akabab), Yu-Gi-Oh! (via YGOPRODeck), Dragon Ball (via DokkanAPI) e Futebol (via dataset EA FC/FC, com iSports API como fonte alternativa). |
| RF50 | As APIs/fontes externas devem ser usadas apenas na etapa de importação; o jogo deve operar exclusivamente sobre o banco de dados próprio após a normalização. |
| RF51 | O sistema deve implementar um adapter dedicado para cada universo: PokemonAdapter, SuperheroAdapter, YuGiOhAdapter, DokkanAdapter e FootballAdapter. |
| RF52 | Cada adapter deve: (1) obter os dados da fonte, (2) extrair os campos relevantes, (3) preservar os valores originais (raw), (4) mapear os campos para os atributos do jogo, e (5) entregar os dados para a etapa de normalização por percentil. |
| RF53 | O sistema deve mapear os atributos universais Attack/Defense de cada universo para seus campos de origem: Pokémon → `attack`/`defense`; Marvel/DC → `strength`/`durability`; Yu-Gi-Oh! → `atk`/`def`; Dragon Ball → `maxLevelAttack`/`maxDefence`; Futebol → `shooting`/`defending`. |
| RF54 | O sistema deve mapear um atributo individual por universo: Pokémon → Speed (`speed`); Marvel/DC → Power (`power`); Yu-Gi-Oh! → LevelRank (`level`/`rank`); Dragon Ball → HP (`maxLevelHP`); Futebol → Pace (`pace`). |
| RF55 | Para o MVP de futebol, o sistema deve usar Attack = Shooting, Defense = Defending e Pace = Pace; os atributos Passing, Dribbling, Physical e Overall devem ficar reservados para expansão futura, fora do modelo inicial. |
| RF56 | O sistema deve preservar o valor original (`raw`) de cada atributo importado, sem sobrescrevê-lo. |
| RF57 | O sistema deve calcular um `score` de 0 a 100 para cada atributo, com base no percentil do valor dentro da própria franquia e do próprio atributo — nunca comparando valores de franquias diferentes diretamente. |
| RF58 | A fórmula de percentil deve ser: `Score = 100 × (L + 0.5 × E) / N`, onde `L` = quantidade de valores menores, `E` = quantidade de valores iguais e `N` = quantidade total de valores válidos daquela franquia+atributo. |
| RF59 | O pipeline de importação deve seguir a sequência: API/Dataset → Importação → Raw Data → Adapter → Mapeamento → Filtragem → Percentil → Score 0–100 → Banco do jogo → Gameplay. |
| RF60 | O modelo final de cada Character/Card deve conter: `id`, `name`, `universe`, `source`, e `stats` (com `attack{raw, score}`, `defense{raw, score}` e um atributo `individual` correspondente ao universo). |
| RF61 | Nem todo card deve possuir todos os atributos individuais — cada franquia contribui apenas com o seu atributo específico (ex: Pikachu tem Speed, Superman tem Power, Messi tem Pace). |
| RF62 | O sistema nunca deve comparar diretamente escalas originais de universos diferentes (ex: Ki em trilhões vs. Shooting em 0–100); toda comparação de gameplay (incluindo o duelo, RF32) deve usar exclusivamente os `score` normalizados. |
| RF63 | Cada adapter deve baixar a imagem de origem do personagem/jogador e persisti-la no storage próprio do jogo durante a importação; o sistema não deve depender de hotlink direto a uma fonte externa para renderizar a arte de um card. |
| RF64 | Para fontes cujos termos de uso proíbem hotlink (ex: YGOPRODeck), o download e a re-hospedagem da imagem são obrigatórios antes de qualquer uso do personagem no jogo — não apenas uma boa prática recomendada. |
| RF65 | O FootballAdapter deve validar, na escolha do dataset EA FC/FC a ser utilizado, que a fonte inclui uma URL de imagem do jogador (ex: campo `player_face_url`); datasets sem esse campo não devem ser usados como fonte única de importação. |
| RF66 | O DokkanAdapter deve obter a imagem do personagem de uma fonte alternativa à API de dados de atributos (ex: wiki da comunidade Dokkan Battle ou repositório de arte dedicado), já que a fonte de dados identificada não confirma retorno de imagem e cobre apenas personagens de raridade LR/UR. |

---

## 10. Pendências (não são requisitos ainda — decisões em aberto)

Estes itens foram levantados durante a sessão mas ainda não têm uma decisão fechada:

- Nome oficial da moeda fictícia do jogo.
- Faixa numérica do incremento aleatório do boost pós-duelo (mínimo/máximo).
- Se haverá algum limite de boosts acumuláveis por personagem/partida (levantado como risco de balanceamento — efeito "bola de neve" no torneio todos-contra-todos).
- Número mínimo de jogadores exigido para iniciar uma partida.
- Confirmação da devolução automática de saldo quando um personagem é invalidado durante o draft (RF20 — assunção do autor deste documento, ainda não validada explicitamente).
- Tratamento de empate de score dentro de uma única rodada do duelo (assumido como "rodada não pontua para nenhum lado", mas não confirmado explicitamente).
- Definição exata de "mais vitórias entre cards" como critério de desempate do ranking (assumido como total de rodadas individuais vencidas na competição, mas não confirmado explicitamente).
- Escolha final da fonte de dados de futebol: dataset EA FC/FC (não exige registro) vs. iSports API (exige registro/acesso) — e estratégia de atualização/versionamento do dataset (ex: quando um novo FC anual for lançado).
- Estratégia de re-cálculo do percentil quando novos personagens forem importados posteriormente (o percentil é relativo à população da franquia — adicionar jogadores pode alterar o score de personagens já existentes no banco).
- Confirmação via introspecção do schema GraphQL se a API de Dragon Ball (DokkanAPI) possui algum campo de imagem não documentado nos exemplos públicos disponíveis.
- Escolha definitiva do dataset de futebol (Kaggle/sofifa ou equivalente) a ser usado como fonte oficial de importação, garantindo presença confirmada do campo de imagem do jogador.
- Estratégia definitiva de obtenção de dados e imagem para personagens de Dragon Ball fora do escopo LR/UR (raridades N/R/SR/SSR), já que a API identificada cobre apenas uma fração do elenco total do jogo original.
