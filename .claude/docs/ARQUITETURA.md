# Arquitetura do código

Mapa técnico do `unusable-web`. Complementa `AGENTS.md` (regras) e
`.claude/docs/CONTEXTO.md` (histórico e intenção).

---

## 1. Visão geral

Uma única página, nove arquivos JavaScript carregados como scripts clássicos. Não há
roteador, framework, estado reativo nem build. O jogo alterna entre **telas**
(`<section class="tela">`) e sobrepõe **overlays** (`<div class="overlay">`). A tela do
catálogo tem uma segunda camada de estados internos, os **passos**
(`<div class="passo">`), com o mesmo mecanismo de `display:none`/`.ativa`.

A barra superior é permanente e fica fora das telas. O mapa ocupa todo o resto da
janela, e o HUD flutua sobre ele. Só o miolo troca.

```
 barra superior · logo · busca · oferta piscante · prazo · cronômetro · badge · instruções
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  ┌────────────┐         Catalogo.abrir()          ┌───────────────────┐ │
│  │ tela-catalogo │ ◀──── vaga CATALOGO ─────────── │   tela-loja        │ │
│  │  secoes ⇄     │ ───── "Adicionar ao carrinho" ▶ │   (canvas + HUD)   │ │
│  │  itens        │       Loja.retomar(true)        │                    │ │
│  └────────────┘                                    └─────────┬──────────┘ │
│                                              Prateleira.abrir()│           │
│                                          ┌──────────────────┐  │  Caixa.abrir()
│                                          │ overlay-         │  │  (vaga CAIXA,
│                                          │  prateleira      │◀─┘   sacola ≥ 1)
│                                          │  └▶ overlay-qtd  │      │
│                                          └──────────────────┘      ▼
│                                                            ┌───────────────┐
│                                                            │ overlay-caixa │
│                                                            │  3 etapas     │
│                                                            └──────┬────────┘
│                                                       Jogo.finalizar()
│                                                                   ▼
│                                                            ┌───────────┐
│                                                            │ tela-final│
│                                                            │  (cupom)  │
│                                                            └───────────┘
└───────────────────────────────────────────────────────────────────────────┘
 barra de cookies · fixa no rodapé · volta 7 s depois de recusada

 overlay-instrucoes — sobrepõe tudo, pausa o jogo, é o único componente acessível
```

**A tela inicial é o catálogo, não o mapa.** `Jogo.iniciar()` roda no `DOMContentLoaded`
e chama `comecar()`, que liga `Loja.iniciar()` (só registra os listeners de teclado, sem
começar a andar) e então `Catalogo.abrir()`. O mapa só começa a rodar quando o jogador
clica em "Adicionar ao carrinho" pela primeira vez, via `Loja.retomar(true)`.

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
2, cada uma com seus produtos e sua vaga), as duas vagas de saída `CATALOGO` e `CAIXA`
(lado a lado, embaixo, encostadas em `x=620` para não deixar vão de colisão),
`INICIO_CARRINHO` e `OBSTACULOS`. Mais `todosProdutos()`, `acharProduto(id)` e
`prateleiraDe(id)`.

Cada prateleira tem a forma:

```js
{ id, nome, cor, x, y, w, h,
  vaga: { x, y, w, h },        // sem ângulo: estacionar é só posição + tempo
  produtos: [ { id, nome, emoji, preco, precoDe } ] }
```

`CATALOGO` e `CAIXA` têm a mesma forma sem `produtos`, cada uma com sua própria `vaga`.

### `public/js/estado.js` — estado do jogo
Objeto `Estado` com `carrinho` (linhas com `qtd`), `destaque` (prateleira realçada pela
busca ou pelo catálogo), `escolhido` (`{id, nome, emoji, prateleiraId}` — o produto
marcado no catálogo), `tempoMapa` (ms acumulados dentro do mapa) e `jogoAtivo`.

Funções: `iniciarEstado`, `adicionarAoCarrinho`, `limparCarrinho`, `totalCarrinho`,
`qtdNoCarrinho`, `sacolaTemItem`, `escolhidoNaSacola`, `setasAtivas`, `renderPainel`.

`escolhidoNaSacola()` é **derivado**, nunca guardado num booleano: recalcula
`qtdNoCarrinho(Estado.escolhido.id) > 0` toda vez. Isso evita dessincronizar quando a
sacola esvazia por "Esvaziar" ou pelo recolhimento por ócio — a seta do alvo volta
sozinha sem precisar de um caso especial em cada um desses caminhos.

`setasAtivas()` é o contrato entre `estado.js` e `loja.js`: devolve os descritores de
seta (`{chave, alvo, legenda}`) que `loja.js` deve desenhar, sem que o desenho precise
conhecer a regra do catálogo. Sem item escolhido: lista vazia. Escolhido e não pego: uma
seta na prateleira dele. Escolhido e já pego: duas setas, uma em `CATALOGO` e outra em
`CAIXA`.

`renderPainel()` é o único ponto que escreve o painel lateral (incluindo `#alvo-atual`).
Qualquer mutação do carrinho ou de `Estado.escolhido` deve chamá-lo.

### `public/js/loja.js` — o motor
Único módulo com laço de animação. Responsabilidades: dimensionar o canvas para a
janela, entrada de teclado, física do carrinho, colisão, câmera, desenho do mapa,
detecção de estacionamento, as setas do mapa e os dois cronômetros (ócio e prazo).

**Ciclo de vida em duas fases**, porque o jogador entra e sai do mapa várias vezes por
sessão (indo e voltando do catálogo):

- `iniciar()` — chamada uma única vez, no boot. Registra os listeners de
  `keydown`/`keyup`/`resize`, mede o canvas e posiciona o carrinho. Idempotente via a
  flag `ligado`: chamar de novo não duplica nada.
- `retomar(reposicionar)` — chamada toda vez que o jogador entra no mapa (do catálogo ou
  do boot). Zera `teclas` (solta tecla presa fora do mapa), `paradoDesde`, `vagaEmFoco` e
  `ocioso`; se `reposicionar` for `true`, devolve o carrinho a `INICIO_CARRINHO` — usado
  ao voltar do catálogo, para não reaparecer parado dentro da própria vaga de saída (o
  que reabriria o catálogo 3 s depois, num laço sem fim). A flag `lacoAtivo` impede
  agendar um segundo `requestAnimationFrame` se `parar()`/`retomar()` caírem no mesmo
  quadro — dois laços simultâneos rodariam a física em dobro.
- `parar()` — só `rodando = false`; não desregistra listeners. Chamada por
  `Catalogo.abrir()` (o catálogo é `.tela`, não `.overlay`, então não congela a física
  sozinho) e por `Jogo.finalizar()`.

Estado interno relevante:

- `carrinho` — `{x, y, ang, vel, velAng, largura, altura}`
- `paradoDesde` — milissegundos acumulados parado dentro da vaga; zera ao sair ou ao se
  mover. Chega em `TEMPO_PARADO` (3000) e abre a seção
- `vagaEmFoco` — a vaga sendo contada, usada para desenhar o anel de contagem
- `ocioso` — milissegundos sem input, alimenta o recolhimento por abandono
- `rabiscos` — cache das setas/círculos por `chave`, sorteado uma única vez por alvo
  (re-sortear a cada quadro seria mudança visual a 60 Hz)

Laço por frame: `laco(agora) → atualizar(dt) → desenhar(agora)`.

`atualizar` faz, nesta ordem: lê teclas (se não houver overlay aberto), aplica
aceleração, aplica esterçamento **invertido**, aplica atrito, integra posição eixo a eixo
(`livre(nx, y)` e depois `livre(x, ny)`, o que permite deslizar ao longo das paredes),
limita ao mundo, acumula `Estado.tempoMapa` (só sem overlay aberto), e por fim chama
`verificarEstacionamento`, `verificarPrazo` e `verificarOcio`.

Colisão é círculo de raio 19 contra retângulos AABB (prateleiras + `CAIXA` + `CATALOGO` +
obstáculos).

`verificarEstacionamento` exige **duas** condições simultâneas: estar dentro da vaga e
`|vel| < 0.12`. Enquanto valerem, `paradoDesde` acumula `dt`; ao chegar em
`TEMPO_PARADO` (3000 ms) chama `Prateleira.abrir(prateleira)`, `Catalogo.abrir()` (vaga
`CATALOGO`) ou `Caixa.abrir()` (vaga `CAIXA`, só se `sacolaTemItem()`). `desenharContagem`
desenha o anel de progresso e o número de segundos restantes acima do carrinho.

`verificarPrazo` conta `Estado.tempoMapa` até `LIMITE_COMPRA` (180 000 ms). Pausa com
qualquer overlay aberto — de propósito, para que o disparo forçado de `Caixa.abrir()`
nunca caia por cima de outro overlay nem no meio de um arraste da prateleira. Se o prazo
zera com a sacola vazia, prorroga 30 s (`PRORROGACAO`) em vez de abrir o caixa vazio, o
que travaria o leitor.

`desenharSetas(agora, cam)` lê `setasAtivas()` de `estado.js` e desenha, para cada
descritor: um círculo torto memoizado (`rabiscoDe`) se o alvo está em quadro, ou uma seta
grudada na borda do canvas apontando a direção se estiver fora. O movimento é oscilação
de posição a `~0,18 Hz` — nunca opacidade, para não somar com o piscar de `.oferta` e
ultrapassar 3 Hz.

`camera()` centraliza o mundo quando ele é menor que a janela, em vez de deixar o mapa
grudado num canto.

Público: `iniciar`, `retomar`, `parar`, `carrinho`, `zerarOcio`.

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

### `public/js/catalogo.js` — a vitrine e o botão que mente
Tela (`#tela-catalogo`), não overlay — por isso `abrir()` chama `Loja.parar()`
explicitamente, e não pode contar com `overlayAberto()` para congelar a física sozinho.

Drill-down de dois passos, alternados por classe `.passo`/`.ativa` (não `.etapa`: essa
classe é varrida globalmente por `Caixa.etapa()`, e usá-la aqui faria o caixa apagar o
passo ativo do catálogo):

1. **Seções** (`montarSecoes`) — um `.secao-card` por item de `PRATELEIRAS`, mostrando os
   emoji dos 4 produtos. Clique monta o passo de itens.
2. **Itens** (`montarItens`) — um `.item-catalogo` por produto da seção, com preço
   riscado e preço atual, e um `<button>` **"Adicionar ao carrinho"**.

`escolherProduto(prod, prateleira)` é o núcleo do troll: grava `Estado.escolhido` e
`Estado.destaque`, mostra um toast, troca para `#tela-loja` e chama
`Loja.retomar(true)`. **Nunca chama `adicionarAoCarrinho`** — encher a sacola continua
sendo só pelo arrasto na prateleira. Não "conserte" isso: ver `docs/WCAG.md`, seção 2.5.7.

Público: `iniciar`, `abrir`.

### `public/js/caixa.js` — passar compras em 3 etapas
Um overlay, três `<div class="etapa">` alternadas por `etapa(id)`.

1. **Leitor** — um card por linha do carrinho, mostrando o próprio produto (emoji, nome
   e quantidade), espalhados em posições aleatórias na pilha. Arrastar e soltar sobre o
   leitor passa o item; soltar fora não faz nada.
2. **Captcha** — grade 3×3 com 2 a 4 carrinhos entre distratores; a verificação exige o
   conjunto exato, e errar regenera a grade.
3. **Pagamento** — teclado de 10 teclas que **reembaralha após cada tecla**; valida
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
`Jogo.iniciar()` (no `DOMContentLoaded`) inicializa `Prateleira`, `Catalogo` e `Caixa`,
liga a barra superior e chama `comecar()`, que abre o catálogo como tela inicial.

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
- **`comecar()`**: `iniciarEstado()` → `Loja.iniciar()` (só registra listeners) →
  `Catalogo.abrir()` (tela inicial) → `abrirInstrucoes()`. Manter as instruções no boot
  não é só design: o `AudioContext` de `musica.js` conta com o clique de fechar o painel
  como primeiro gesto do usuário para liberar o áudio.

Público: `iniciar`, `finalizar`.

---

## 3. Fluxo de uma compra (chamadas reais)

```
Jogo.iniciar()                        DOMContentLoaded
  └ comecar()
      ├ iniciarEstado()               zera carrinho, escolhido, tempoMapa
      ├ Loja.iniciar()                registra teclado/resize, NAO comeca o laco
      ├ Catalogo.abrir()              tela inicial; chama Loja.parar()
      └ abrirInstrucoes()             painel na frente; fechar libera o audio

Catalogo.escolherProduto(prod, prateleira)   clique em "Adicionar ao carrinho"
  ├ Estado.escolhido = {...}                 NAO chama adicionarAoCarrinho
  ├ mostrarTela('#tela-loja')
  └ Loja.retomar(true)                       reposiciona em INICIO_CARRINHO, inicia o laco

Loja.atualizar → verificarEstacionamento
  ├ Prateleira.abrir(prateleira)      vaga de prateleira
  │   └ pedirQuantidade(produto)      soltou na cesta
  │       └ adicionarAoCarrinho()     confirmou — unico caminho real ate a sacola
  ├ Catalogo.abrir()                  vaga CATALOGO — Loja.parar(), sacola preservada
  └ Caixa.abrir()                     vaga CAIXA, só com sacolaTemItem()
      └ montarScanner → montarCaptcha → montarPagamento
          └ Jogo.finalizar()          16º dígito correto
              ├ Loja.parar()
              └ mostrarTela('#tela-final')

Loja.atualizar → verificarPrazo       tempoMapa >= LIMITE_COMPRA, sem overlay aberto
  ├ (sacola vazia)  Estado.tempoMapa -= PRORROGACAO     prorroga 30s, nao abre o caixa
  └ (sacola ≥ 1)    Caixa.abrir()                       forçado, igual ao caminho normal
```

---

## 4. Convenções de DOM e CSS

- Ações declarativas usam `data-acao="..."` e são ligadas por
  `$('[data-acao="x"]').addEventListener`. Prefira esse padrão a criar ids novos.
- Violações de WCAG têm comentário no código apontando o critério, no formato
  `WCAG 2.4.7 Focus Visible (AA): violado de proposito`. Mantenha o padrão e registre a
  entrada correspondente em `docs/WCAG.md`.
- Telas: `.tela` + `.ativa`. Overlays: `.overlay` + `.ativa`. Etapas do caixa:
  `.etapa` + `.ativa`. Passos do catálogo: `.passo` + `.ativa` — classe própria porque
  `Caixa.etapa()` varre `.etapa` em todo o documento, não só dentro de `#overlay-caixa`.
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
  arraste é a única forma de passar item no leitor.
- **`Loja.iniciar()` é idempotente e `Loja.retomar()` reentra no mapa sem duplicar
  listeners nem laços** (flags `ligado` e `lacoAtivo`). Reiniciar o jogo inteiro
  continua sendo `location.reload()` — não há como zerar `Estado` sem recarregar.
- **O leitor escaneia um card por linha do carrinho**, não por unidade. Comprar 3
  bananas é um card só.
- **O "bip" do leitor é um toast de texto.** O áudio do projeto hoje é só a música de
  fundo de `public/js/musica.js`.
- **Sem minimapa.** Foi removido junto com o menu lateral; o mapa em tela cheia mostra
  quase tudo de uma vez.
