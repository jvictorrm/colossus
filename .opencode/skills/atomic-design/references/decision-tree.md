# Árvore de decisão expandida — casos de borda

Use este documento quando estiver em dúvida num caso específico de classificação. Os casos aqui são os que mais geram discussão em times reais.

## Caso 1: `IconButton` — botão que é só um ícone

**Átomo**. Mesmo importando um componente `Icon`, o `IconButton` é um primitivo de UI — ele representa uma ação clicável básica. O `Icon` em si também é átomo. Átomos *podem* compor outros átomos quando o resultado continua sendo um primitivo indivisível.

Dica: essa é uma exceção razoável à regra "átomo não importa outros componentes". A regra existe para evitar que átomos acumulem dependências de domínio, não para proibir composição de primitivos visuais.

## Caso 2: `Avatar` vs `UserAvatar`

- `Avatar` — recebe `src`, `alt`, `size` e renderiza uma imagem circular. **Átomo**.
- `UserAvatar` — recebe `userId`, faz fetch dos dados do usuário, renderiza o `Avatar` com fallback de iniciais. **Molécula ou organismo** (dependendo de quanto faz).

A diferença é lógica de domínio. `Avatar` é visual puro. `UserAvatar` sabe o que é um "user" no seu app.

## Caso 3: `Card` — é átomo, molécula ou organismo?

Depende do que o `Card` faz:

- Se é só um container visual com borda/sombra/padding (`<Card>{children}</Card>`) → **átomo**. É um primitivo de layout.
- Se é um `Card` específico com header, body, footer estruturados (`<Card title="..." actions={...}>`) → **molécula**.
- Se é um `ProductCard` completo com imagem, título, preço, rating, botão de comprar → **organismo**. Representa uma unidade de conteúdo significativa.

**Regra prática**: quanto mais o nome do componente carrega significado de domínio (`Product`, `User`, `Order`), mais provável que seja molécula/organismo.

## Caso 4: `Modal` / `Dialog`

Geralmente **molécula**. Combina um backdrop, um container, um botão de fechar, e slots para conteúdo. Raramente é átomo porque quase sempre importa outros componentes; raramente é organismo porque é genérico demais para ser uma "seção da interface".

Exceção: se é um modal muito específico como `ConfirmDeleteOrderModal` com lógica própria, é organismo.

## Caso 5: `List` vs `ProductList` vs `ProductGrid`

- `List` / `Grid` genérico (`<List items={...} renderItem={...} />`) → **molécula**. É reutilizável e não sabe do domínio.
- `ProductList` — **organismo**. Sabe o que é um produto, como renderizá-lo, e provavelmente lida com estados tipo "vazio", "carregando", "erro".
- `ProductGrid` vs `ProductList` — ambos organismos, só diferem no layout.

## Caso 6: `Header` — mas o Header recebe o user do contexto, não via props. Isso é ok?

Sim, com ressalvas. A regra geral é "organismos recebem dados via props", mas organismos globais (`Header`, `Sidebar`, `ToastContainer`) que aparecem em todas as páginas podem consumir contexto diretamente para evitar prop drilling infinito. O critério é: se o organismo é usado em 1 ou 2 lugares, passe via props; se é usado em todas as páginas, contexto é ok.

## Caso 7: Formulário — o formulário inteiro é organismo, ou cada campo é molécula e a página monta?

**Organismo**, na maioria dos casos. Um `SignupForm` com validação, submit handler e estados é uma seção coesa da interface. A página apenas passa o callback `onSubmit` e talvez valores iniciais. Isso mantém a página magra e o formulário testável.

Anti-padrão: montar o formulário campo a campo dentro da página. A página fica enorme, não reutilizável, e difícil de testar.

## Caso 8: Um componente que só aparece em uma página específica. Ainda vale extrair?

Depende do tamanho e da complexidade:

- **Sim, extrai** se: o bloco tem mais de ~30 linhas de JSX, tem lógica própria, ou torna a página mais legível.
- **Não extrai** se: são poucas linhas, são específicas do layout da página, e extrair só adiciona indireção sem ganho.

Lembre: Atomic Design não é "extraia tudo". É "extraia o que vai melhorar a manutenção".

Quando extrai mas o componente é só daquela página, uma opção razoável é **colocá-lo junto da página** em vez de `organisms/`:

```
pages/ProductDetailsPage/
├── ProductDetailsPage.tsx
├── components/
│   └── ProductSpecsTable.tsx    # específico desta página
└── index.ts
```

Isso é um meio-termo honesto: você ganha componentização sem poluir `organisms/` com coisas não-reutilizáveis.

## Caso 9: `Page` tem JSX demais. Está errado?

Provavelmente sim. Se a página tem muitas linhas de JSX próprio (não apenas orquestração), isso é sinal de que:

1. Faltam organismos — parte do JSX deveria estar em um organismo.
2. Ou falta um template — se a página está gerenciando layout complexo direto, extraia um template.

A página idealmente parece um "diretor de orquestra": chama os hooks, busca os dados, e passa tudo para template/organismos em 20-40 linhas.

## Caso 10: Componentes de biblioteca externa (MUI, Chakra, Radix, shadcn)

Se o projeto usa uma lib de componentes:

- **Átomos do projeto** viram wrappers finos sobre os componentes da lib, aplicando a marca/design tokens do projeto. Ex.: `<Button>` do projeto internamente usa `<MuiButton>` com cores e tamanhos padronizados.
- **Moléculas, organismos, templates, páginas** seguem normalmente.

Isso dá ao projeto a flexibilidade de trocar de lib no futuro sem reescrever tudo. É um investimento que compensa em projetos de médio/longo prazo.

## Quando a dúvida persiste

Se depois de percorrer tudo isso ainda há dúvida genuína entre duas camadas, escolha a **mais alta** (mais próxima de organismo/página). Motivos:

1. É mais fácil promover um componente de molécula para organismo do que o contrário — promover significa adicionar, rebaixar significa remover.
2. Começar mais alto evita fragmentação prematura.
3. Se depois de alguns usos ficar claro que era molécula, o custo de mover é baixo.

E sempre lembre: **Atomic Design é um modelo mental, não um tribunal**. Brad Frost explicitamente diz que a taxonomia é flexível. O objetivo é ter conversas produtivas sobre estrutura, não ganhar discussões sobre rótulos.
