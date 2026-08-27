# Card Game Cross-Franchise — Regras de Partida

## 0. Relação com o documento de normalização

Este documento assume que todo personagem/jogador já chegou ao banco do jogo no formato normalizado descrito em **"Especificação com Futebol"**: cada atributo (`attack`, `defense` e o atributo individual da franquia) já possui um `score` de 0–100, calculado por percentil dentro da própria franquia/atributo.

As regras abaixo tratam de tudo que acontece **depois** disso: como uma partida é criada, como os times são montados, como se resolve a formação de time (draft com trava em tempo real), como o duelo funciona e como se define o vencedor da competição.

---

## 1. Plataforma

- Sistema web, mobile-first (smartphone/tablet).
- Em desktop, a interface usa as dimensões do maior tablet suportado (não expande além disso).

---

## 2. Sala e Configuração

### 2.1 Criação e entrada

- Quem cria a partida vira **admin** da partida e é **obrigatoriamente jogador** (não existe admin espectador).
- Outros jogadores entram via **QR code / link**, apenas **enquanto a partida não tiver sido iniciada**. Após o início, a sala fecha — não é possível entrar depois.
- Cada partida possui um **ID único**. Ao final da competição, restam apenas **estatísticas** — nenhum dado (personagem, saldo, boost) é levado para outra partida.

### 2.2 Configurações definidas pelo admin

| Parâmetro | Descrição |
|---|---|
| Quantidade de personagens por time | Mínimo 2, máximo 5 |
| Saldo inicial de compra | Valor total disponível para cada jogador montar o time |
| Teto de preço | Usado na fórmula de precificação (ver seção 4) |
| Tempo de draft | Prazo para cada jogador montar/confirmar o time |
| Limite de jogadores na partida | Sem teto do sistema — decisão livre do admin |

- O admin pode **editar essas configurações livremente até o início da partida**, visando manter a isonomia da competição.
- Após o admin **iniciar a competição**, nenhuma configuração pode mais ser alterada.

### 2.2.1 Validações de configuração

- **Saldo inicial ≥ 100 × X** (X = quantidade de personagens por time). Abaixo disso, é matematicamente impossível completar o time (preço mínimo de cada personagem é 100). O sistema deve **bloquear** o salvamento da configuração nesse caso.
- **Teto ≥ 100** (preço mínimo). Se o admin definir o teto igual a 100, o sistema deve **alertar** (sem bloquear) que isso elimina a diferenciação de preço — todo personagem custará exatamente o mínimo, independentemente do Overall.
- Essas validações rodam sempre que o admin salvar ou editar a configuração, enquanto a partida não tiver começado.

### 2.3 Reconexão

- Vale **apenas durante um duelo ativo** (não se aplica a jogadores aguardando fora de duelo).
- Se um jogador cai durante um duelo, o **adversário é avisado** e recebe um QR code/link para reenviar ao jogador caído, permitindo que ele reentre exatamente naquele duelo.
- Tolerância: **2 minutos**. Se o jogador não reconectar dentro desse prazo, o adversário **vence o duelo automaticamente**.

---

## 3. Draft (montagem de times)

### 3.1 Escolha privada e trava em tempo real

Não existe leilão. A resolução de conflitos por personagens repetidos é feita por **ordem de confirmação**, com trava em tempo real:

1. Cada jogador escolhe seus personagens de forma **independente e privada** — durante a montagem, um jogador **não vê** quais personagens os outros já selecionaram. Isso é intencional: evita que a estratégia de um jogador seja copiada ou que ele seja prejudicado por saber o que os outros estão montando.
2. Ao selecionar um personagem, o **preço é debitado imediatamente** do saldo do jogador (não é um "carrinho" — o débito é real desde a escolha).
3. O jogador precisa reunir exatamente **X personagens** (2–5, definido pelo admin) para habilitar a ação de **Confirmar Time**.
4. Confirmar o time é uma ação **manual e irreversível**. No instante em que um jogador confirma, todos os X personagens do time dele ficam **permanentemente indisponíveis para os demais**, em tempo real.
5. Se, nesse instante, outro jogador tiver um desses mesmos personagens dentro do seu time **ainda não confirmado**, esse personagem passa a aparecer como **indisponível** para ele, e a ação de confirmar fica **bloqueada** até ele substituí-lo por outro personagem ainda disponível.
6. 💭 O saldo gasto no personagem invalidado é **devolvido automaticamente**, permitindo ao jogador escolher um substituto (assunção necessária para o fluxo fazer sentido — a confirmar).
7. Um jogador **só descobre** que outro tinha o mesmo personagem no exato momento em que isso acontece (o card vira indisponível) — não há visibilidade prévia das escolhas alheias.
8. O cronômetro do draft **continua correndo normalmente** mesmo quando o jogador precisa repor um personagem invalidado. Não há tolerância extra — a intenção é que o jogador não revele suas escolhas cedo demais para "se proteger" do tempo.

### 3.2 Timeout do draft

Se o tempo definido pelo admin esgotar e um jogador ainda não tiver completado/confirmado o time:

1. O sistema remove os personagens já escolhidos por esse jogador, **do mais caro ao mais barato**, um a um, até liberar saldo suficiente para preencher todas as vagas em aberto.
2. Com o saldo liberado, o sistema **sorteia aleatoriamente** personagens **ainda disponíveis** (verificação de disponibilidade feita em tempo real, no servidor, no momento exato da atribuição — para evitar que dois jogadores que estouraram o tempo simultaneamente recebam o mesmo personagem).
3. O time resultante é considerado **confirmado automaticamente**, travando esses personagens para os demais.

### 3.3 Vantagem de velocidade/conexão

Aceita como parte do design (sem mecanismo de suavização): quem confirma primeiro **no servidor** garante os personagens do seu time. Não há janela de buffer nem sorteio para casos de confirmação quase simultânea.

---

## 4. Preço dos personagens

- **Preço mínimo**: 100 `[MOEDA]` (moeda fictícia do jogo, nome a definir).
- **Teto**: definido pelo admin na configuração da partida.
- **Overall do personagem**: média dos `score` (0–100) de todos os atributos do card (`attack`, `defense` e o atributo individual da franquia).

### Fórmula

```text
Preço = 100 + (Overall / 100) × (Teto − 100)
```

**Exemplo:** Teto = 500, Overall = 80

```text
Preço = 100 + (80 / 100) × (500 − 100)
Preço = 100 + 0.8 × 400
Preço = 420
```

Quanto maior o overall percentil do personagem, mais caro ele é — até o limite do teto definido pelo admin.

---

## 5. Duelo

### 5.1 Estrutura

- Duelo é **time vs time** (todos os personagens do time de um jogador contra todos os do adversário, ao longo de várias rodadas).
- Cada rodada, os dois jogadores escolhem — **simultaneamente e às cegas** (sem ver a escolha do outro) — um **card** (ainda não usado *nesse duelo*) e **um atributo dele** (`attack`, `defense` ou o atributo individual da franquia).
- A comparação usa sempre o **`score` (0–100)** do atributo escolhido, **mesmo que os dois jogadores tenham escolhido atributos de categorias diferentes** (ex: Attack de um Pokémon contra Pace de um jogador de futebol — vale o maior score, sem distinção de categoria).
- Quem tem o maior score na rodada, vence a rodada.
- 💭 **Empate de score na rodada** (mesmo valor dos dois lados): a rodada não conta vitória para nenhum dos dois lados — *assunção a confirmar*.
- Um card usado numa rodada fica **indisponível apenas para aquele duelo específico**. No próximo duelo (contra outro adversário), todos os cards do time voltam a ficar disponíveis.
- O duelo termina quando todos os cards de ambos os times tiverem sido usados. Quem venceu **mais rodadas** que o outro, vence o duelo.
- Times sempre têm o mesmo tamanho (X definido pelo admin), então é possível **empate no duelo** (mesmo número de rodadas vencidas por cada lado).

### 5.2 Timeout por rodada

- Cada jogador tem **1 minuto** para escolher card + atributo.
- Se o tempo esgotar, o sistema faz um **auto-pick aleatório**: qualquer card ainda disponível no duelo + qualquer atributo dele (sem restrição de categoria).

### 5.3 Recompensa por vitória de duelo

- O jogador vencedor do duelo ganha o direito de **selecionar um atributo** (de um personagem à sua escolha) para subir no percentil.
- O incremento do boost é **gerado aleatoriamente pelo sistema** (faixa/intervalo ainda a definir e calibrar).
- O `score` nunca ultrapassa **100** (teto natural da escala).
- O boost é válido **apenas dentro da partida atual** — permanece ativo para os duelos seguintes da mesma competição, mas **não persiste** para outras partidas.

> ⚠️ Ponto de atenção de balanceamento: como o boost acumula dentro da mesma partida (todos contra todos), o jogador que vence os primeiros duelos tende a ficar cada vez mais forte para os seguintes (efeito "bola de neve"). Vale considerar, na fase de balanceamento, um limite de boosts acumuláveis por personagem/partida.

---

## 6. Torneio (todos contra todos)

### 6.1 Formato

- Todos os jogadores se enfrentam entre si **exatamente uma vez** (rodada única completa / round-robin), com os confrontos definidos por **sorteio**.
- Não existe conceito de território, mapa ou adjacência — a competição é decidida **inteiramente por pontuação em duelos**.
- Os duelos ocorrem **em paralelo** (múltiplos pares duelando ao mesmo tempo).
- O número de duelos totais da competição é N×(N−1)/2, onde N é o número de jogadores (definido livremente pelo admin, sem teto do sistema).

### 6.2 Pontuação

| Resultado do duelo | Pontos no ranking |
|---|---|
| Vitória | 2 |
| Empate | 1 |
| Derrota | 0 |

### 6.3 Critérios de desempate (em ordem)

1. Mais vitórias na competição.
2. Menos derrotas na competição.
3. Resultado do confronto direto entre os jogadores empatados.
4. 💭 Mais rodadas individuais vencidas na competição inteira (não apenas no confronto direto) — *interpretação assumida para "mais vitórias entre cards", a confirmar*.

- Em caso de **empate circular entre 3 ou mais jogadores** (ex: A venceu B, B venceu C, C venceu A), o critério de "confronto direto" não resolve sozinho — aplica-se o próximo critério da lista (item 4) para todos os envolvidos no ciclo.

### 6.4 Fim da partida

- Ao final de todos os duelos, o jogador com mais pontos no ranking vence a competição.
- Encerrada a partida, restam apenas as estatísticas — nada é levado adiante (saldo, boosts e times são descartados).

---

## 7. Parâmetros e pontos em aberto (a calibrar/decidir)

Estes itens não bloqueiam a implementação da espinha dorsal, mas precisam de um valor/decisão antes do lançamento:

- **Nome da moeda fictícia** (atualmente `[MOEDA]`).
- **Faixa do incremento aleatório do boost** pós-vitória (ex: sorteia entre +2 e +8 pontos de score?).
- **Limite de boosts acumuláveis por personagem/partida**, para conter o efeito bola de neve no torneio todos-contra-todos.
- **Número mínimo de jogadores** para iniciar uma partida (implícito ≥ 2, nunca formalizado).
- Confirmação da devolução automática de saldo quando um personagem é invalidado no draft (seção 3.1, item 6).
- Confirmação da interpretação de empate de rodada dentro do duelo (seção 5.1).
- Confirmação da interpretação de "mais vitórias entre cards" no desempate do ranking (seção 6.3).

---

## 8. Resumo do pipeline da partida

```text
CRIAÇÃO DA SALA (admin define config)
      ↓
ENTRADA DE JOGADORES (QR/link, até o início)
      ↓
DRAFT (escolha privada e independente; saldo debitado na escolha)
      ↓
   [outro jogador confirma antes?] → personagem trava em tempo real
      → se eu tinha esse personagem (ainda não confirmado): saldo devolvido,
        confirmar fica bloqueado até eu escolher um substituto disponível
      ↓
JOGADOR REÚNE X PERSONAGENS → CONFIRMA TIME (manual, irreversível)
      ↓
   [timeout do draft?] → remoção em cascata (mais caro → mais barato)
      + preenchimento aleatório entre os ainda disponíveis → confirma automático
      ↓
TODOS OS TIMES CONFIRMADOS (sem duplicidade possível — trava em tempo real impede)
      ↓
INÍCIO DA COMPETIÇÃO (admin dispara)
      ↓
SORTEIO DE CONFRONTOS (todos contra todos)
      ↓
DUELOS EM PARALELO (card+atributo simultâneo às cegas, por rodada)
      ↓
BOOST DE PERCENTIL PARA O VENCEDOR DE CADA DUELO (válido só na partida)
      ↓
RANKING FINAL (vitória=2, empate=1, derrota=0 + desempates)
      ↓
FIM DA PARTIDA → só restam estatísticas
```
