# Arquitetura do código

Mapa técnico do `unusable-web`. Complementa `AGENTS.md` (regras) e
`.claude/docs/CONTEXTO.md` (histórico e intenção).

---

## 1. Visão geral

Uma única página, sete arquivos JavaScript carregados como scripts clássicos. Não há
roteador, framework, estado reativo nem build. O jogo alterna entre **telas**
(`<section class="tela">`) e sobrepõe **overlays** (`<div class="overlay">`).

A barra superior é permanente e fica fora das telas. O mapa ocupa todo o resto da
janela, e o HUD flutua sobre ele. Só o miolo troca.

```
 barra superior · logo · busca · oferta piscante · cronômetro · badge · instruções
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌────────┐        mapa em tela cheia (canvas)              │
│  │  HUD   │                                                 │
│  │ lista  │   ┌──────────────┐  Caixa.abrir()  ┌──────────┐ │
│  │ sacola │   │  tela-loja   │ ──────────────▶ │ overlay- │ │
│  │ botões │   │              │ ◀─ fechar ───── │  caixa   │ │
│  └────────┘   └──────┬───────┘                 │ 4 etapas │ │
│                      │                         └────┬─────┘ │
│             Prateleira.abrir()           Jogo.finalizar()   │
│                      │                              ▼       │
│            ┌─────────▼────────┐              ┌───────────┐  │
│            │ overlay-         │              │ tela-final│  │
│            │  prateleira      │              │  (cupom)  │  │
│            │  └▶ overlay-qtd  │              └───────────┘  │
│            └──────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
 barra de cookies · fixa no rodapé · volta 7 s depois de recusada

 overlay-instrucoes — sobrepõe tudo, pausa o jogo, é o único componente acessível
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
Conteúdo estático do mundo: `MUNDO` (1600×1100), `PRATELEIRAS` (**6**, em 3 colunas de
2, cada uma com seus produtos e sua vaga), `CAIXA` (o PASSAR COMPRAS, embaixo e perto do
início), `INICIO_CARRINHO` e `OBSTACULOS`. Mais `todosProdutos()`, `acharProduto(id)` e
`sortearLista()` (3 itens de seções diferentes, quantidade 1–3).

Cada prateleira tem a forma:

```js
{ id, nome, cor, x, y, w, h,
  vaga: { x, y, w, h },        // sem ângulo: estacionar é só posição + tempo
  produtos: [ { id, nome, emoji, preco, precoDe } ] }
```

### `public/js/estado.js` — estado do jogo
Objeto `Estado` com `lista` (compras a fazer), `carrinho` (linhas com `qtd`),
`destaque` (prateleira realçada pela busca) e `jogoAtivo`.

Funções: `iniciarEstado`, `adicionarAoCarrinho`, `limparCarrinho`, `totalCarrinho`,
`qtdNoCarrinho`, `listaCompleta`, `itensFaltando`, `renderPainel`.

`renderPainel()` é o único ponto que escreve o painel lateral. Qualquer mutação do
carrinho deve chamá-lo (as funções acima já fazem isso).

### `public/js/loja.js` — o motor
Único módulo com laço de animação. Responsabilidades: dimensionar o canvas para a
janela, entrada de teclado, física do carrinho, colisão, câmera, desenho do mapa,
detecção de estacionamento e o cronômetro de abandono.

Estado interno relevante:

- `carrinho` — `{x, y, ang, vel, velAng, largura, altura}`
- `paradoDesde` — milissegundos acumulados parado dentro da vaga; zera ao sair ou ao se
  mover. Chega em `TEMPO_PARADO` (3000) e abre a seção
- `vagaEmFoco` — a vaga sendo contada, usada para desenhar o anel de contagem
- `ocioso` — milissegundos sem input, alimenta o recolhimento por abandono

Laço por frame: `laco → atualizar(dt, agora) → desenhar(agora)`.

`atualizar` faz, nesta ordem: lê teclas (se não houver overlay aberto), aplica
aceleração, aplica esterçamento **invertido**, aplica atrito, integra posição eixo a eixo
(`livre(nx, y)` e depois `livre(x, ny)`, o que permite deslizar ao longo das paredes),
limita ao mundo, e por fim chama `verificarEstacionamento` e `verificarOcio`.

Colisão é círculo de raio 19 contra retângulos AABB (prateleiras + caixa + obstáculos).

`verificarEstacionamento` exige **duas** condições simultâneas: estar dentro da vaga e
`|vel| < 0.12`. Enquanto valerem, `paradoDesde` acumula `dt`; ao chegar em
`TEMPO_PARADO` (3000 ms) chama `Prateleira.abrir(prateleira)` ou `Caixa.abrir()` (esta
só se `listaCompleta()`). `desenharContagem` desenha o anel de progresso e o número de
segundos restantes acima do carrinho.

`camera()` centraliza o mundo quando ele é menor que a janela, em vez de deixar o mapa
grudado num canto.

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

### `public/js/caixa.js` — passar compras em 4 etapas
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

### `public/js/musica.js` — trilha de elevador sintetizada
Sem estado de jogo, sem DOM. Cria um `AudioContext`, um ganho mestre em `0.07` com
fade-in de 3 s, e um agendador que roda a cada `150 ms` mantendo `0,6 s` de futuro já
marcado no relógio do áudio (`setInterval` sozinho não tem precisão rítmica).

Cada compasso agenda quatro camadas: colchão de acordes (`triangle`), baixo na tônica e
na quinta (`sine`), melodia sorteada sobre as notas do acorde e chiado de bateria feito
com buffer de ruído + `bandpass`. A harmonia é o loop ii-V-I-VI de `PROGRESSAO`.

O contexto nasce suspenso por política de autoplay e é retomado no primeiro
`pointerdown`, `keydown` ou `touchstart`; um vigia de `2000 ms` o retoma de novo se o
sistema o suspender. **Não existe pausa, mudo nem volume em lugar nenhum** — é a
violação de WCAG 1.4.2 Audio Control.

Público: `iniciar`.

### `public/js/main.js` — cola, barra superior e telas
`Jogo.iniciar()` (no `DOMContentLoaded`) inicializa `Prateleira` e `Caixa`, liga a barra
superior e **começa o jogo imediatamente** — não há tela de título.

- **`ligarInstrucoes()`**: abre o `#overlay-instrucoes`, move o foco para o botão de
  fechar e fecha com `Esc`. Único componente acessível do app. `comecar()` o abre no
  boot, então a partida começa pausada atrás dele.
- **`ligarOferta()`**: contagem regressiva que se reinicia sozinha, e o opt-in de
  piscada acima de 3 Hz — com `window.confirm` nomeando o risco de epilepsia.
- **`ligarCookies()`**: barra que aparece 1,5 s após carregar; "ACEITAR TUDO" encerra,
  o `x` de 12px só adia por 7 segundos. Não usa `.overlay`, então **não** pausa o jogo.
- **Busca**: `keydown` bloqueia teclas dentro de um cooldown de 800 ms; a lista de
  resultados se reordena a cada 1100 ms enquanto o mouse estiver sobre ela.
- **HUD**: "Finalizar" não finaliza nada (troll); "Esvaziar" passa por `confirmar()` com
  dupla negativa; os dois trocam de lugar a cada 4 s.
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
- Cores vivem em variáveis CSS no `:root`, todas monocromáticas (`--preto`,
  `--grafite`, `--cinza`, `--cinza-claro`, `--cinza-fundo`, `--branco`, mais os tokens
  de contraste insuficiente `--texto-fraco` e `--texto-fraco2`). Nenhuma matiz.
- `z-index`: HUD 20, barra de cookies 50, overlays 60, toast 99, elemento arrastado 999.

---

## 5. Limites conhecidos da implementação

- **Responsividade parcial.** O canvas acompanha a janela, mas barra superior, HUD e
  modais têm medidas fixas, e o `body` tem `overflow: hidden`. Isso é a violação de
  WCAG 1.4.10 Reflow.
- **Sem suporte a toque.** Usa eventos `pointer`, então funciona parcialmente, mas o
  giro do leitor depende da roda do mouse — inacessível em touch.
- **Reiniciar é recarregar.** `Loja.iniciar()` registra listeners de teclado toda vez
  que é chamado; chamar duas vezes duplicaria os handlers. Hoje só é chamado uma vez.
- **O leitor escaneia uma carta por linha do carrinho**, não por unidade. Comprar 3
  bananas é uma carta só.
- **Sem áudio.** O "bip" do leitor é um toast de texto.
- **Sem minimapa.** Foi removido junto com o menu lateral; o mapa em tela cheia mostra
  quase tudo de uma vez.
