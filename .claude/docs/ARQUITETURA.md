# Arquitetura do código

Mapa técnico do `unusable-web`. Complementa `AGENTS.md` (regras) e
`.claude/docs/CONTEXTO.md` (histórico e intenção).

---

## 1. Visão geral

Uma única página, sete arquivos JavaScript carregados como scripts clássicos. Não há
roteador, framework, estado reativo nem build. O jogo alterna entre **telas**
(`<section class="tela">`) e sobrepõe **overlays** (`<div class="overlay">`).

A casca de e-commerce (header, menu lateral, banner, rodapé) é permanente e fica fora
das telas. Só o miolo troca.

```
 header  · logo · busca · badge · hambúrguer · cronômetro
┌────────┬────────────────────────────────────────────────┐
│ menu   │ banner de promoção (piscante, 2 Hz)            │
│ lateral│                                                │
│        │  ┌──────────────┐  Caixa.abrir()  ┌──────────┐ │
│ cate-  │  │  tela-loja   │ ──────────────▶ │ overlay- │ │
│ gorias │  │  (canvas +   │ ◀─ fechar ───── │  caixa   │ │
│        │  │   painel)    │                 │ 4 etapas │ │
│ [?]    │  └──────┬───────┘                 └────┬─────┘ │
│ instru-│  Prateleira.abrir()          Jogo.finalizar()  │
│ ções   │         │                              ▼       │
│        │ ┌───────▼──────────┐            ┌───────────┐  │
│        │ │ overlay-         │            │ tela-final│  │
│        │ │  prateleira      │            │  (cupom)  │  │
│        │ │  └▶ overlay-qtd  │            └───────────┘  │
│        │ └──────────────────┘                           │
└────────┴────────────────────────────────────────────────┘
 rodapé  · 40 links de 8px

 overlay-instrucoes  — sobrepõe tudo, pausa o jogo, é o único componente acessível
```

**Não há tela de título.** `Jogo.iniciar()` roda no `DOMContentLoaded` e chama
`comecar()` direto, que sorteia a lista e liga `Loja.iniciar()`.

Todo HTML existe estaticamente no `public/index.html`. O JavaScript só preenche conteúdo e
alterna as classes `.ativa`. Nenhuma tela é construída do zero em runtime.

---

## 2. Módulos

Cada arquivo grande é uma IIFE que devolve um objeto público. Comunicação é por chamada
direta ao objeto global do outro módulo, resolvida em tempo de execução.

### `public/js/util.js` — sem estado
Helpers puros e os anti-padrões reutilizáveis.

| Função | Papel |
|---|---|
| `$`, `$$` | atalhos de `querySelector` / `querySelectorAll` (o segundo devolve array) |
| `aleatorio`, `inteiro`, `escolha`, `embaralhar`, `limitar` | matemática e sorteio |
| `moeda(v)` | formata `R$ 0,00` |
| `toast(msg)` | notificação que **some em 400 ms** — anti-padrão central |
| `trocarLugares(container)` | reordena fisicamente os filhos; usado nos botões que fogem |
| `confirmar(pergunta, sim, nao, cb)` | modal de confirmação com **ordem dos botões aleatória** |
| `abrirOverlay`, `fecharOverlay`, `overlayAberto`, `mostrarTela` | controle de visibilidade |

`overlayAberto()` é consultado pelo laço da loja para congelar a física — qualquer
overlay novo precisa usar a classe `.overlay`/`.ativa` para herdar esse comportamento.

### `public/js/dados.js` — sem estado
Conteúdo estático do mundo: `MUNDO` (1800×1100), `PRATELEIRAS` (4, cada uma com seus
produtos e sua vaga), `CAIXA`, `OBSTACULOS`. Mais `todosProdutos()`, `acharProduto(id)`
e `sortearLista()` (3 itens de prateleiras diferentes, quantidade 1–3).

Cada prateleira tem a forma:

```js
{ id, nome, cor, x, y, w, h,
  vaga: { x, y, w, h, ang },   // ang em graus: direção que o carrinho deve apontar
  produtos: [ { id, nome, emoji, preco } ] }
```

### `public/js/estado.js` — estado do jogo
Objeto `Estado` com `lista` (compras a fazer), `carrinho` (linhas com `qtd`),
`destaque` (prateleira realçada pela busca) e `jogoAtivo`.

Funções: `iniciarEstado`, `adicionarAoCarrinho`, `limparCarrinho`, `totalCarrinho`,
`qtdNoCarrinho`, `listaCompleta`, `itensFaltando`, `renderPainel`.

`renderPainel()` é o único ponto que escreve o painel lateral. Qualquer mutação do
carrinho deve chamá-lo (as funções acima já fazem isso).

### `public/js/loja.js` — o motor
Único módulo com laço de animação. Responsabilidades: entrada de teclado, física do
carrinho, colisão, câmera, desenho do mapa e do minimapa, detecção de estacionamento e
o cronômetro de abandono.

Estado interno relevante:

- `carrinho` — `{x, y, ang, vel, velAng, largura, altura}`
- `rodinha` — `{travadaAte, proximaTrava}`, controla o travamento aleatório da roda
- `paradoDesde` — tempo em que o carrinho ficou parado e alinhado na vaga; `-1` é
  sentinela de "já avisei que está torto"
- `ocioso` — milissegundos sem input, alimenta o recolhimento por abandono

Laço por frame: `laco → atualizar(dt, agora) → desenhar(agora)`.

`atualizar` faz, nesta ordem: lê teclas (se não houver overlay aberto), aplica
aceleração, aplica esterçamento **invertido**, aplica a deriva da rodinha, sorteia
travamento, aplica atrito, integra posição eixo a eixo (`livre(nx, y)` e depois
`livre(x, ny)`, o que permite deslizar ao longo das paredes), limita ao mundo, e por
fim chama `verificarEstacionamento` e `verificarOcio`.

Colisão é círculo de raio 20 contra retângulos AABB (prateleiras + caixa + obstáculos).

`verificarEstacionamento` só dispara com as **quatro** condições simultâneas: dentro da
vaga, `|vel| < 0.12`, erro angular `< 22°`, sustentado por `450 ms`. Aí chama
`Prateleira.abrir(prateleira)` ou `Caixa.abrir()` (esta só se `listaCompleta()`).

Público: `iniciar`, `parar`, `carrinho`, `zerarOcio`.

### `public/js/prateleira.js` — pegar produtos
Overlay com a prateleira à esquerda e a cesta à direita.

Arraste: `pointerdown` no `.produto` promove o elemento para `position:fixed` no
`<body>`; `pointermove` mede a distância percorrida por evento e, se passar de
**26 px**, dispara "escorregou da sua mão"; `pointerup` decide entre soltar na cesta
(abre o modal de quantidade) ou cair (`cair()` anima uma queda com gravidade e depois
`voltarPraPrateleira()`).

`voltarPraPrateleira(el)` restaura `position:absolute` e reinsere o elemento na
prateleira usando `dataset.casaEsq` / `dataset.casaTopo`. **Todo caminho de saída do
arraste precisa passar por ela**, senão o produto fica órfão no `<body>`.

Modal de quantidade: só existe o botão `+`. A partir do 5º clique ele salta para uma
posição aleatória dentro da área. Confirmar com 0 é recusado.

Público: `iniciar`, `abrir`.

### `public/js/caixa.js` — checkout em 4 etapas
Um overlay, quatro `<div class="etapa">` alternadas por `etapa(id)`.

1. **Fila** — barra que avança `0,55%` a cada `100 ms` (~18 s). O botão "Pular a fila"
   **subtrai** 15%.
2. **Leitor** — uma carta por linha do carrinho, com ângulo inicial aleatório. A roda do
   mouse gira de 7 em 7 graus; arrastar sobre o leitor só é aceito com erro `≤ 12°`.
   Recusa devolve a carta para uma posição aleatória.
3. **Captcha** — grade 3×3 com 2 a 4 carrinhos entre distratores; a verificação exige o
   conjunto exato, e errar regenera a grade.
4. **Pagamento** — teclado de 10 teclas que **reembaralha após cada tecla**; valida
   dígito a dígito contra `4242 4242 4242 4242`; dígito errado é recusado. Registra
   `prenderFoco` (keyboard trap intencional, WCAG 2.1.2), removido por `soltarFoco()`
   ao completar os 16 dígitos.

Ao completar os 16 dígitos, chama `Jogo.finalizar()`.

Público: `iniciar`, `abrir`.

### `public/js/main.js` — cola, casca e telas
`Jogo.iniciar()` (no `DOMContentLoaded`) inicializa `Prateleira` e `Caixa`, monta a
casca e **começa o jogo imediatamente** — não há tela de título.

- **`montarMenu()`**: categorias como `<li>` clicáveis que escrevem em `Estado.destaque`,
  o mesmo estado que a busca usa. Mapa e minimapa já sabem pintar o destaque.
- **`montarRodape()`**: 40 links gerados em JS, todos inertes.
- **`ligarInstrucoes()`**: abre o `#overlay-instrucoes`, move o foco para o botão de
  fechar e fecha com `Esc`. Único componente acessível do app.
- **`ligarBanner()`**: contagem regressiva que se reinicia sozinha, e o opt-in de
  piscada acima de 3 Hz — com `window.confirm` nomeando o risco de epilepsia.
- **Busca**: `keydown` bloqueia teclas dentro de um cooldown de 800 ms; a lista de
  resultados se reordena a cada 1100 ms enquanto o mouse estiver sobre ela.
- **Painel**: "Finalizar pedido" não finaliza nada (troll); "Esvaziar sacola" passa por
  `confirmar()` com dupla negativa; os dois trocam de lugar a cada 4 s.
- **`finalizar()`**: monta o cupom com subtotal, taxa de conveniência de 37% e frete
  "grátis" de R$ 18,50, exibe a piada do cancelamento e troca para `tela-final`.

Público: `iniciar`, `finalizar`.

---

## 3. Fluxo de uma compra (chamadas reais)

```
Jogo.iniciar()                        DOMContentLoaded
  └ comecar()                         clique em "COMEÇAR A COMPRAR"
      ├ iniciarEstado()               sorteia a lista, zera o carrinho
      ├ mostrarTela('#tela-loja')
      └ Loja.iniciar()                registra teclado, começa o requestAnimationFrame

Loja.atualizar → verificarEstacionamento
  ├ Prateleira.abrir(prateleira)      vaga de prateleira
  │   └ pedirQuantidade(produto)      soltou na cesta
  │       └ adicionarAoCarrinho()     confirmou
  └ Caixa.abrir()                     vaga do caixa, só com listaCompleta()
      └ comecarFila → montarScanner → montarCaptcha → montarPagamento
          └ Jogo.finalizar()          16º dígito correto
              ├ Loja.parar()
              └ mostrarTela('#tela-final')
```

---

## 4. Convenções de DOM e CSS

- Ações declarativas usam `data-acao="..."` e são ligadas por
  `$('[data-acao="x"]').addEventListener`. Prefira esse padrão a criar ids novos.
- Violações de WCAG têm comentário no código apontando o critério, no formato
  `WCAG 2.4.7 Focus Visible (AA): violado de proposito`. Mantenha o padrão e registre a
  entrada correspondente em `docs/WCAG.md`.
- Telas: `.tela` + `.ativa`. Overlays: `.overlay` + `.ativa`. Etapas do caixa:
  `.etapa` + `.ativa`.
- Cores vivem em variáveis CSS no `:root` (`--amarelo`, `--rosa`, `--ciano`, `--roxo`,
  `--verde`, `--vermelho`, `--papel`).
- O `z-index` dos overlays é 60; elementos arrastados usam 999; o toast usa 99.

---

## 5. Limites conhecidos da implementação

- **Sem responsividade.** O canvas é fixo em 820×460 e o layout assume desktop. Isso
  é também a violação de WCAG 1.4.10 Reflow.
- **Sem suporte a toque.** Usa eventos `pointer`, então funciona parcialmente, mas o
  giro do leitor depende da roda do mouse — inacessível em touch.
- **Reiniciar é recarregar.** `Loja.iniciar()` registra listeners de teclado toda vez
  que é chamado; chamar duas vezes duplicaria os handlers. Hoje só é chamado uma vez.
- **O leitor escaneia uma carta por linha do carrinho**, não por unidade. Comprar 3
  bananas é uma carta só.
- **Sem áudio.** O "bip" do leitor é um toast de texto.
