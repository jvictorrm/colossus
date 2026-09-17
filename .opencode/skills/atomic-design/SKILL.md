---
name: atomic-design
description: Aplica a metodologia Atomic Design (Brad Frost) em projetos React/TSX para componentizar, classificar, criar e refatorar componentes nas cinco camadas — átomos, moléculas, organismos, templates e páginas. Use sempre que o usuário mencionar "componentizar", "atomic design", "átomo/molécula/organismo", "design system", quiser organizar pastas de componentes, refatorar um componente grande em partes menores, decidir onde um componente novo deve morar, ou pedir ajuda para estruturar o diretório `src/components`. Também use quando o usuário mostrar um componente React "inchado" e pedir para quebrá-lo, mesmo sem citar Atomic Design explicitamente — é muito provavelmente o que ele precisa.
---

# Atomic Design para React

Esta skill aplica a metodologia Atomic Design de Brad Frost especificamente para projetos React (JSX/TSX) que usam a estrutura de pastas:

```
src/components/
├── atoms/
├── molecules/
├── organisms/
├── templates/
└── pages/
```

O objetivo não é ser dogmático — Atomic Design é um **modelo mental**, não um conjunto de regras rígidas. O objetivo é dar ao usuário um vocabulário compartilhado e critérios claros para decidir onde cada pedaço de UI deve morar, de forma que o projeto fique mais fácil de manter, testar e reusar.

## As cinco camadas, em uma frase cada

- **Átomo** — o menor bloco funcional de UI. Não pode ser dividido sem perder o sentido. Ex.: `Button`, `Input`, `Label`, `Icon`, `Heading`, `Avatar`.
- **Molécula** — um grupo pequeno de átomos funcionando como uma unidade coesa com um propósito claro. Ex.: `SearchField` (Label + Input + Button), `FormField`, `CardHeader`.
- **Organismo** — uma seção relativamente complexa da interface, composta de moléculas e/ou átomos e/ou outros organismos. Ex.: `Header`, `ProductGrid`, `CommentList`, `SignupForm`.
- **Template** — o esqueleto de uma página: layout + slots para organismos, sem conteúdo real. Define a estrutura, não o conteúdo.
- **Página** — uma instância concreta de um template com conteúdo real (dados de API, textos, imagens). É o que o usuário final vê.

## Como decidir em qual camada um componente mora

Esta é a parte onde a maioria dos times trava. A regra abaixo resolve 95% dos casos. Percorra as perguntas **em ordem** e pare na primeira que responder "sim".

1. **Ele renderiza apenas um elemento HTML primitivo (com styling, variantes, estados) e não contém outros componentes do projeto?**
   → **Átomo**. Ex.: `Button`, `Input`, `Text`, `Icon`, `Spinner`, `Badge`, `Link`.

2. **Ele combina 2+ átomos, tem um propósito único e bem definido, e você consegue descrevê-lo numa frase curta que começa com "um(a)..."?**
   → **Molécula**. Ex.: "um campo de formulário com label e mensagem de erro" = `FormField`. "uma caixa de busca" = `SearchBox`.

3. **Ele representa uma seção inteira da interface, combina várias moléculas/átomos, e faz sentido existir sozinho (tipo, daria para colocar num Storybook e entender o que é)?**
   → **Organismo**. Ex.: `Header`, `Footer`, `ProductCard` completo (imagem + título + preço + botão), `SignupForm`, `Sidebar`.

4. **Ele define o layout de uma tela inteira usando organismos como peças, mas sem conteúdo real (só props/slots)?**
   → **Template**. Ex.: `DashboardTemplate`, `ArticleTemplate`.

5. **Ele é uma tela real, conectada a dados (API, store, router), que o usuário acessa por uma rota?**
   → **Página**. Ex.: `HomePage`, `ProductDetailsPage`.

### Sinais de que você classificou errado

- **Átomo importando outro componente do projeto** → provavelmente é molécula.
- **Molécula com mais de ~3 responsabilidades ou mais de ~100 linhas de JSX** → provavelmente é organismo.
- **Organismo que só faz sentido numa tela específica e não é reutilizável** → pode ser que seja conteúdo de template/página direto, não precisa ser extraído.
- **Template com lógica de fetch ou estado de negócio** → isso é página, não template.
- **Página sem fetch, sem estado, sem rota** → é template disfarçado.

## Fluxo: criando um componente novo

Quando o usuário pedir um componente novo, siga este fluxo:

1. **Pergunte o propósito em uma frase**, se ainda não estiver claro. ("Um botão com ícone e loading state" já é suficiente.)
2. **Classifique** usando a árvore de decisão acima. Diga explicitamente em qual camada vai, e por quê — isso ensina o padrão ao usuário a cada iteração.
3. **Verifique duplicação**: antes de criar um átomo novo, pergunte/procure se já existe algo equivalente em `src/components/atoms/`. Átomos duplicados são o pior sintoma de um design system bagunçado.
4. **Crie a pasta** seguindo a convenção descrita abaixo.
5. **Escreva o componente** respeitando as regras por camada (próxima seção).

## Regras por camada (React/TSX)

Estas regras existem porque determinam se o componente vai ser reusável ou não. Explique o porquê para o usuário quando aplicar.

### Átomos
- **Sem estado de negócio**. Podem ter estado de UI local (`useState` para hover, focus, controlled vs uncontrolled), mas nunca sabem sobre a aplicação.
- **Sem fetch, sem store, sem router, sem contexto de domínio**.
- **Props são a única API**. Tudo configurável via props.
- **Styling encapsulado** (CSS Module, styled-components, Tailwind, whatever — mas consistente com o projeto).
- **Nome genérico**. `PrimaryButton` é ruim, `Button variant="primary"` é o certo.

### Moléculas
- Podem **compor átomos**, mas ainda **sem lógica de negócio**.
- Podem ter estado local (ex.: valor de um input controlado internamente).
- Ainda reutilizáveis em qualquer parte do app.
- Se você precisa importar algo de `services/`, `api/`, `store/` — não é molécula.

### Organismos
- Aqui começa a ser **aceitável** ter alguma lógica de apresentação mais complexa (ex.: lógica de validação de um `SignupForm`).
- Idealmente ainda **recebem dados via props** em vez de buscar eles mesmos — isso mantém o organismo testável e reusável. Conexão com store/API deve acontecer na página, passando os dados para o organismo.
- Exceção razoável: organismos globais como `Header` que precisam de dados de auth podem consumir contexto diretamente.

### Templates
- **Zero lógica de negócio. Zero fetch. Zero estado.**
- Recebem organismos ou conteúdo via `props` ou `children`.
- Definem layout (grid, flex, posicionamento) e pontos de extensão.
- Um template bem feito permite várias páginas diferentes compartilharem a mesma estrutura visual.

### Páginas
- **Aqui mora o "mundo real"**: `useQuery`, `useSelector`, `useParams`, `useEffect` com side effects, etc.
- A página busca os dados, trata loading/error, e passa para um template + organismos.
- Idealmente a página tem pouco JSX próprio — ela orquestra, não renderiza detalhes.

## Convenção de pastas e arquivos

Para cada componente, crie uma pasta com o nome do componente em PascalCase contendo:

```
atoms/Button/
├── Button.tsx          # componente
├── Button.module.css   # styling (ou .styles.ts, conforme o projeto)
├── Button.test.tsx     # testes (se o projeto tiver testes)
├── Button.stories.tsx  # Storybook (se o projeto usar)
└── index.ts            # re-export: export { Button } from './Button';
```

O `index.ts` é importante: permite imports limpos (`import { Button } from '@/components/atoms/Button'`) e facilita refatorações futuras.

Se o projeto já tem uma convenção diferente (por exemplo, arquivos soltos sem pasta, ou colocação de testes em `__tests__/`), **respeite a convenção existente**. Consistência > qualquer padrão abstrato.

## Fluxo: refatorando um componente grande

Quando o usuário mostrar um componente grande e pedir para quebrar:

1. **Leia o componente inteiro primeiro.** Não comece a sugerir antes de entender.
2. **Identifique as "ilhas" naturais** — trechos de JSX que têm coesão interna e poderiam viver sozinhos. Geralmente são blocos envolvidos por um `<div>` com uma classe descritiva, ou que o próprio autor separou em funções `render*()`.
3. **Para cada ilha, classifique** em qual camada ela pertence, usando a árvore de decisão.
4. **Proponha a extração de baixo para cima**: primeiro átomos faltantes, depois moléculas, depois organismos. Não tente quebrar tudo de uma vez.
5. **Mostre o antes e o depois**, inclusive como a página orquestradora fica ao final.
6. **Aponte duplicações**. Se durante a refatoração você nota "ah, isso aqui é basicamente o mesmo `Card` que tem em outra tela", diga isso ao usuário — é o maior ganho de componentizar.

Explique ao usuário que refatoração Atomic Design é **iterativa** e **não precisa ser 100% correta de primeira**. É melhor extrair 3 componentes bem pensados do que 15 componentes apressados.

## Se o projeto usa shadcn/ui (ou similar)

Verifique no início da conversa se existe uma pasta `components/ui/` com arquivos gerados por `npx shadcn add`. Se existir, aplique esta orientação — ela é **crítica** e resolve uma confusão muito comum.

**Os componentes em `components/ui/` NÃO são átomos do design system do projeto.** Eles são os primitivos brutos do shadcn/Radix — o "metal puro" que seus átomos vão envolver. Pense neles como se fossem a biblioteca padrão: estão ali, você usa, mas não são parte do seu design system.

O fluxo correto com shadcn é:

1. **`components/ui/button.tsx`** — primitivo do shadcn. Você não mexe aqui (ou mexe pouco). Não é átomo.
2. **`components/atoms/Button/Button.tsx`** — seu átomo. É um wrapper fino sobre `components/ui/button.tsx` que aplica as variantes, tamanhos e tokens do seu design system específico.
3. Dentro do app, você importa **sempre** de `@/components/atoms/Button`, nunca diretamente de `@/components/ui/button`.

**Por que esse wrapper importa:**
- Dá ao projeto um único ponto de controle para trocar de lib no futuro.
- Garante que as variantes usadas sejam só as aprovadas pelo design system (em vez de cada tela escolher cores soltas).
- Facilita mudanças globais (ex.: todos os botões ganham um novo `size="xl"`).

**Quando o wrapper é opcional:** primitivos muito específicos e que você já sabe que nunca vão ser customizados (ex.: `Separator`, `ScrollArea`). Nesses casos, importar direto de `components/ui/` é aceitável — mas deixe isso como exceção consciente, não como regra.

Moléculas, organismos, templates e páginas seguem o fluxo normal — podem compor átomos do projeto e, quando necessário, primitivos do shadcn diretamente (ex.: usar `Dialog` do shadcn dentro de uma molécula de confirmação).

## Componente visual vs. infraestrutura (Provider, hook, contexto)

Alguns componentes têm duas partes distintas que precisam morar em lugares diferentes: **o visual** (que pertence a uma camada do Atomic Design) e **a infraestrutura** (que não pertence a nenhuma camada — mora em `providers/`, `contexts/` ou `hooks/`).

Os casos clássicos: `Toast`, `Dialog`/`Modal`, `Tooltip`, `Dropdown`, `Popover`, `Sheet`.

| Parte | O que é | Onde mora |
|---|---|---|
| **Visual** | O JSX da caixinha que aparece: ícones, texto, estilos, variantes | `molecules/Toast/`, `molecules/Dialog/`, etc. |
| **Infraestrutura** | Gerenciamento de fila, auto-dismiss, posicionamento global, portal, contexto, hook `useToast()` | `providers/ToastProvider/`, `hooks/useToast.ts` — **nunca em `components/`** |

Isso é importante porque é tentador (e errado) classificar um `ToastProvider` como "organismo global" e jogá-lo em `organisms/`. Ele não é UI — ele é plumbing da aplicação. A regra: **se o componente não renderiza JSX próprio significativo, não pertence ao Atomic Design.**

Se o usuário está criando um desses componentes, pergunte explicitamente: "Você quer o componente visual, o sistema que gerencia ele, ou os dois?" E trate cada um separadamente.

## Armadilhas comuns (e como evitar)

- **"Tudo vira átomo"**: o usuário classifica qualquer coisa pequena como átomo. Lembre: se importa outro componente do projeto, não é átomo.
- **Organismos que só servem para uma página**: tudo bem existir, mas pergunte se vale a pena extrair. Às vezes o JSX inline na página é mais legível.
- **Paralisia de classificação**: o usuário trava decidindo se algo é molécula ou organismo. Quando houver dúvida genuína, escolha o **mais alto** (organismo) — é mais fácil promover depois do que descer. E lembre que Brad Frost explicitamente diz que a taxonomia é flexível.
- **Ignorar templates**: muitos projetos pulam direto de organismos para páginas. Isso é ok em projetos pequenos, mas se o usuário tem 5+ telas com layouts similares, vale criar templates.
- **Átomo com lógica de domínio**: o exemplo clássico é um `<UserAvatar>` que faz fetch do usuário. Isso não é átomo — é molécula/organismo. O átomo é `<Avatar src={...} />`.

## Quando Atomic Design *não* é a resposta

Seja honesto com o usuário. Atomic Design é ótimo para:
- Projetos com design system ou muitas telas
- Times que precisam de vocabulário compartilhado
- UIs com muita reutilização

É excessivo para:
- Protótipos e MVPs pequenos
- Projetos com poucas telas e pouca reutilização
- Quando o overhead de criar pastas/arquivos supera o ganho de organização

Se o usuário está em um desses casos, sugira uma versão simplificada: só `components/` (compartilhados) e `pages/` (específicas), e deixe a metodologia completa para quando o projeto crescer.

## Referências

- `references/examples.md` — exemplos concretos de componentes React TSX em cada camada, para copiar e adaptar.
- `references/decision-tree.md` — versão expandida da árvore de decisão com mais casos de borda.

Leia essas referências quando estiver criando/refatorando vários componentes de uma vez e precisar de padrões prontos, ou quando estiver em dúvida num caso específico de classificação.
