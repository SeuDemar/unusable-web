# unusable

Uma loja online com a pior UI e UX possíveis — de propósito.

É um jogo de navegador onde comprar um item vira uma provação. Tudo começa num
**catálogo** que parece um e-commerce normal — até você clicar em "Adicionar ao
carrinho" e descobrir que o botão não adiciona nada: ele só marca o produto e te joga
dentro do minigame. De lá, você **dirige** um carrinho pelo armazém com os controles de
direção invertidos, **estaciona** parado 3 segundos em frente à prateleira, **arrasta**
os produtos até a sacola sem deixar cair, e depois enfrenta o leitor do caixa, o captcha
e um teclado numérico que se reembaralha a cada tecla. Você tem 3 minutos de mapa para
resolver tudo isso. No fim, uma taxa de conveniência de 37% aparece do nada.

Tudo funciona. Tudo é terminável. Nada é agradável.

O projeto também é um exercício de acessibilidade às avessas: **29 critérios da WCAG 2.2
são violados deliberadamente**, catalogados em [`docs/WCAG.md`](docs/WCAG.md) com o que a
norma exige, em qual funcionalidade a violação acontece, e como seria a versão conforme.

## Como rodar

Abra `public/index.html` no navegador. É isso.

Sem build, sem `npm install`, sem servidor — HTML, CSS e JavaScript puros, escritos para
funcionar em `file://`. A página carrega já jogável, direto no catálogo.

## Como jogar

| Tecla | Efeito |
|---|---|
| `W` / `↑` | acelera |
| `S` / `↓` | ré |
| `A` / `←` | vira para a **direita** |
| `D` / `→` | vira para a **esquerda** |

Sim, `A` e `D` estão invertidos. Não, não é bug.

O jogo abre no **catálogo**: escolha uma seção, depois um produto, e clique em
**"Adicionar ao carrinho"**. Isso não adiciona nada — só marca o produto escolhido e te
leva ao mapa, onde uma seta escrachada aponta a prateleira dele (nada impede pegar
qualquer outro produto pelo caminho).

Para abrir uma prateleira, entre no retângulo tracejado à frente dela e **fique parado
3 segundos** — um contador aparece em cima do carrinho. O ângulo não importa. Embaixo do
mapa há duas vagas lado a lado: a da esquerda volta ao **catálogo** (sacola intacta), a
da direita é o **PASSAR COMPRAS** e só abre com a sacola não vazia. Você tem **3 minutos
de mapa** para chegar lá — o relógio pausa fora dele.

O painel de instruções não abre no boot — ele aparece sozinho, uma única vez, quando
você entra no mapa pela primeira vez (o jogo pausa atrás dele até fechar). O botão
**Instruções**, na barra de cima, traz o painel de volta a qualquer momento depois
disso. É o único componente honesto do app.

## O mapa

Seis prateleiras em três colunas de duas, e as duas vagas de saída lado a lado embaixo:

```
   ROUPAS        BOLSAS        BELEZA
  [ vaga ]      [ vaga ]      [ vaga ]

  CALCADOS    ACESSORIOS       CASA
  [ vaga ]      [ vaga ]      [ vaga ]

     [ vaga ]        [ vaga ]
    CATALOGO      PASSAR COMPRAS      ▣ ← você começa aqui
```

## Estrutura

```
public/              o site publicado — só isto vai pro ar
  index.html         barra superior, mapa, HUD e overlays
  css/style.css      o visual: preto, cinza e branco
  js/                nove módulos vanilla, carregados em ordem
wrangler.jsonc       config de deploy na Cloudflare
AGENTS.md            regras para agentes de IA que forem mexer no projeto
docs/                documentação do projeto
.claude/docs/        contexto e arquitetura para sessões de Claude Code
```

Tudo que estiver dentro de `public/` fica público na web. Documentação e configuração
ficam de fora de propósito.

## Documentação

| Documento | Para quê |
|---|---|
| [`docs/WCAG.md`](docs/WCAG.md) | **os 29 critérios violados**, com a funcionalidade que fere cada um |
| [`AGENTS.md`](AGENTS.md) | regras, restrições e convenções para quem (ou o que) for editar |
| [`docs/DESIGN.md`](docs/DESIGN.md) | o manifesto da má UX: taxonomia dos anti-padrões e o que é proibido |
| [`docs/GAMEPLAY.md`](docs/GAMEPLAY.md) | manual do jogador e tabela de todos os parâmetros de balanceamento |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | ideias levantadas e ainda não implementadas |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | como publicar na Cloudflare (Workers ou Pages) |
| [`.claude/docs/CONTEXTO.md`](.claude/docs/CONTEXTO.md) | por que o projeto existe, decisões tomadas, estado atual |
| [`.claude/docs/ARQUITETURA.md`](.claude/docs/ARQUITETURA.md) | mapa do código, fluxo de chamadas, limites conhecidos |

## Avisos

Nenhum dado real é coletado. O campo de pagamento aceita apenas o número de teste
`4242`, que está impresso na própria tela. Isto é uma piada jogável, não
uma loja.

O aviso de oferta pisca a 2 Hz, abaixo do limiar da WCAG. Existe um botão **intenso** que
aumenta a frequência acima de 3 Hz: ele vem desligado, avisa sobre risco para epilepsia
fotossensível e exige confirmação. Não o ative automaticamente em nenhuma circunstância.
