# Violações deliberadas da WCAG 2.2

Este documento cataloga os critérios de sucesso da **WCAG 2.2** que o unusable viola de
propósito, como parte do exercício de projetar a pior experiência possível.

**Norma de referência:** Web Content Accessibility Guidelines (WCAG) 2.2, W3C
Recommendation de 5 de outubro de 2023 — <https://www.w3.org/TR/WCAG22/>

**Meta:** no mínimo 13 critérios. **Entregue:** 28 catalogados, sendo **20
implementados e verificáveis** e 8 documentados.

> **Nada aqui é acidental.** Cada linha registra o que a norma exige, como o app a
> descumpre, e como seria a versão conforme. A quarta coluna existe porque violar uma
> norma que você não entende não demonstra nada.

## Índice por nível

| Nível | Implementados | Documentados |
|---|---|---|
| A | 11 | 6 |
| AA | 9 | 2 |
| **Total** | **20** | **8** |


## Resumo: o que foi quebrado e em qual funcionalidade

Tabela mestre. Cada linha liga um critério da WCAG 2.2 à funcionalidade do site onde a
violação acontece. O detalhamento de cada uma está nas seções seguintes.

| # | Critério | Nível | Funcionalidade que fere | Status |
|---|---|---|---|---|
| 1 | 1.1.1 Non-text Content | A | **Mapa da loja** (canvas sem alternativa) e **cards de produto** (só emoji) | ✅ |
| 2 | 1.3.1 Info and Relationships | A | **Cards de produto**, **grade do captcha** e **par de preços** riscado/atual | 📄 |
| 3 | 1.4.2 Audio Control | A | **Música de elevador de fundo** — começa sozinha e não tem pausa | ✅ |
| 4 | 1.4.3 Contrast (Minimum) | AA | **Preço riscado**, **status da busca**, **texto e botão de recusa dos cookies** | ✅ |
| 5 | 1.4.4 Resize Text | AA | **Página inteira** — meta viewport bloqueia o zoom | ✅ |
| 6 | 1.4.10 Reflow | AA | **Barra superior**, **HUD** e **modais**, todos de largura fixa | 📄 |
| 7 | 1.4.13 Content on Hover or Focus | AA | **Busca do topo** — a lista de resultados se reordena sob o ponteiro | ✅ |
| 8 | 2.1.1 Keyboard | A | **Arrastar produto**, **leitor de código de barras**, **captcha** | ✅ |
| 9 | 2.1.2 No Keyboard Trap | A | **Etapa de pagamento** — o Tab não sai de lá | ✅ |
| 10 | 2.2.1 Timing Adjustable | A | **Recolhimento da sacola por abandono** (60 s) e **mensagens de 400 ms** | ✅ |
| 11 | 2.2.2 Pause, Stop, Hide | A | **Aviso de oferta**, **botões do HUD** que trocam de lugar, **barra de cookies** | ✅ |
| 12 | 2.3.1 Three Flashes | A | **Aviso de oferta** — 2 Hz por padrão; acima de 3 Hz só via opt-in | 📄 |
| 13 | 2.4.1 Bypass Blocks | A | **Barra superior** — sem skip link, sem landmarks | 📄 |
| 14 | 2.4.2 Page Titled | A | **Título da página** — genérico e nunca atualizado | 📄 |
| 15 | 2.4.3 Focus Order | A | **Ordem de tabulação global** — tabindex positivos arbitrários | ✅ |
| 16 | 2.4.7 Focus Visible | AA | **Todos os controles** — outline zerado globalmente | ✅ |
| 17 | 2.4.11 Focus Not Obscured | AA | **Barra de cookies** — fixa por cima, e volta sozinha | ✅ |
| 18 | 2.5.7 Dragging Movements | AA | **Colocar produto na sacola** — a mecânica central, só por arrasto | ✅ |
| 19 | 2.5.8 Target Size (Minimum) | AA | **Recusar cookies** (12×12), **fechar modal** (26×26), **botão + que foge** | ✅ |
| 20 | 3.1.1 Language of Page | A | **Página inteira** — `lang="en"` em site português | ✅ |
| 21 | 3.2.2 On Input | A | **Teclado do pagamento** — reembaralha a cada tecla | ✅ |
| 22 | 3.2.3 Consistent Navigation | AA | **Botões do HUD** — trocam de ordem a cada 4 s | 📄 |
| 23 | 3.2.4 Consistent Identification | AA | **Botão "Finalizar"** que não finaliza, **badge x HUD** com números diferentes, **cookies** | ✅ |
| 24 | 3.3.1 Error Identification | A | **Todas as mensagens de erro** — toast de 400 ms, longe do campo | ✅ |
| 25 | 3.3.2 Labels or Instructions | A | **Teclado do pagamento** e **tela de quantidade**, ambos sem rótulo | 📄 |
| 26 | 3.3.7 Redundant Entry | A | **Pagamento** — "Limpar tudo" apaga os 16 dígitos, sem backspace | 📄 |
| 27 | 3.3.8 Accessible Authentication | AA | **Pagamento** e **captcha** — teste de função cognitiva, sem colar | ✅ |
| 28 | 4.1.2 Name, Role, Value | A | **Badge da sacola**, **captcha**, **cards de produto**, **recusar cookies** | ✅ |

✅ implementado e verificável · 📄 analisado, não reforçado nesta rodada

### Agrupado por funcionalidade

| Funcionalidade do site | Critérios que ela fere |
|---|---|
| Mapa da loja (canvas) | 1.1.1 |
| Barra superior e navegação | 1.4.10, 2.4.1, 2.4.3, 2.4.7 |
| Busca do topo | 1.4.13, 1.4.3 |
| Aviso de oferta | 2.2.2, 2.3.1 |
| Barra de cookies | 2.2.2, 2.4.11, 2.5.8, 3.2.4, 4.1.2, 1.4.3 |
| HUD da sacola | 2.2.2, 3.2.3, 3.2.4, 2.4.3 |
| Prateleira e arrastar produto | 2.5.7, 2.1.1, 1.1.1, 1.3.1, 4.1.2, 1.4.3 |
| Tela de quantidade | 2.5.8, 3.3.2 |
| Leitor de código de barras | 2.1.1 |
| Captcha | 2.1.1, 1.3.1, 3.3.8, 4.1.2 |
| Pagamento | 2.1.2, 3.2.2, 3.3.2, 3.3.7, 3.3.8 |
| Música de fundo | 1.4.2 |
| Mensagens do sistema (toast) | 3.3.1, 2.2.1 |
| Recolhimento da sacola por abandono | 2.2.1 |
| Documento e metadados da página | 1.4.4, 2.4.2, 3.1.1 |

---

# Princípio 1 — Perceptível

## 1.1.1 Non-text Content · Nível A · ✅ implementado

**A norma exige:** todo conteúdo não textual precisa de uma alternativa textual
equivalente.

**Como o unusable viola:** o jogo inteiro acontece em `<canvas id="mapa">`, sem
`aria-label`, sem descrição adjacente, sem versão textual do estado. Os produtos são
identificados apenas por emoji dentro de um `<span class="emoji">`
(`public/js/prateleira.js`, `montarProdutos`). Um leitor de tela não percebe que existe
uma loja, um carrinho, prateleiras ou produtos.

**A versão conforme seria:** `<canvas>` com `role="img"` e `aria-label` descrevendo o
estado atual, ou uma região `aria-live` narrando posição do carrinho e seções próximas;
cada produto com nome textual associado programaticamente ao seu ícone.

## 1.3.1 Info and Relationships · Nível A · 📄 documentado

**A norma exige:** estrutura e relações transmitidas visualmente precisam existir também
em código.

**Como o unusable viola:** cards de produto, células do captcha e itens do menu de
categorias são `<div>` e `<li>` sem papel semântico. Preço antigo e preço promocional
são dois `<span>` irmãos, sem relação declarada — nada indica que um é o outro riscado.

**A versão conforme seria:** `<button>` para elementos acionáveis, `<del>` e `<ins>` para
a relação entre preços, cabeçalhos e listas refletindo a hierarquia visual.

## 1.4.2 Audio Control · Nível A · ✅ implementado

**A norma exige:** se um áudio toca automaticamente por mais de 3 segundos, precisa
existir um mecanismo para pausar ou parar o som, ou para controlar o volume dele
independentemente do volume geral do sistema.

**Como o unusable viola:** `public/js/musica.js` sintetiza uma música de elevador em loop
infinito na Web Audio API e a página não oferece nenhum controle — não há botão de
pausa, de mudo nem de volume em lugar nenhum da interface.

O navegador só libera áudio depois de um gesto do usuário, então o `AudioContext` nasce
suspenso e é retomado no primeiro `pointerdown`, `keydown` ou `touchstart`. Como o jogo
abre com o painel de instruções na frente, esse primeiro gesto é sempre o clique que
fecha o painel: a pessoa nunca pediu música e mesmo assim ela começa. Um vigia de 2 em 2
segundos retoma o contexto caso o sistema o suspenda, o que remove também a última brecha
de "parar sem querer".

Detalhes que importam para o critério:

| Aspecto | Valor |
|---|---|
| Duração | infinita — o loop de 4 compassos se reagenda para sempre |
| Volume | ganho mestre `0.07`, com fade-in de 3 s |
| Mecanismo de pausa | nenhum |
| Mecanismo de volume | nenhum |
| Saída possível | só fora da página: mudo da aba, do navegador ou do sistema |

Silenciar a aba pelo navegador não satisfaz o critério: a norma pede um mecanismo *na
página*, e controle no nível do sistema operacional obriga a pessoa a calar também o
leitor de tela, que é exatamente o conflito que o 1.4.2 existe para evitar.

Não há arquivo de áudio: o projeto não aceita asset binário, então a trilha é
sintetizada — quatro compassos de ii-V-I-VI com colchão de acordes, baixo, chiado de
bateria barata e uma melodia sorteada sobre as notas do acorde. Ela nunca se repete
igual e mesmo assim soa sempre igual, que é a definição de música de elevador.

**A versão conforme seria:** não tocar nada sem ação explícita do usuário ou, mantendo a
música, expor um botão de pausa/mudo persistente, alcançável por teclado, entre os
primeiros elementos focáveis da página, com estado anunciado por `aria-pressed`.

## 1.4.3 Contrast (Minimum) · Nível AA · ✅ implementado

**A norma exige:** contraste mínimo de 4.5:1 para texto normal, 3:1 para texto grande.

**Como o unusable viola:** `public/css/style.css` define pares abaixo do mínimo de
propósito:

| Token | Cor | Sobre | Razão aproximada |
|---|---|---|---|
| `--texto-fraco` | `#c9c9c9` | branco `#ffffff` | ~1.6:1 |
| `--texto-fraco2` | `#bdbdbd` | `#f4f4f4` | ~1.9:1 |
| `.produto .preco-de` | `#c9c9c9` | branco | ~1.6:1 |
| `.busca-status` | `#5a5a5a` | preto `#111111` | ~2.7:1 |
| `.cookies p` | `#9a9a9a` | preto `#111111` | ~3.6:1 |
| `.btn-cookie-nao` | `#4a4a4a` | preto `#111111` | ~1.9:1 |

Cinza-claro sobre branco e a falha de contraste mais comum do design minimalista real.
Aqui ela e intencional, e e justamente o que torna a paleta preto/cinza/branco tao
adequada ao exercicio.

**A versão conforme seria:** escurecer os textos até atingir 4.5:1 contra o fundo real
de cada um, verificando com uma ferramenta de contraste em vez de no olho.

## 1.4.4 Resize Text · Nível AA · ✅ implementado

**A norma exige:** o texto precisa poder ser ampliado até 200% sem perda de conteúdo ou
funcionalidade.

**Como o unusable viola:** `public/index.html` traz
`<meta name="viewport" content="...maximum-scale=1,user-scalable=no">`, que bloqueia o
gesto de zoom. Todos os tamanhos do CSS estão em `px` absoluto — nenhum `rem` — e o
`body` tem `overflow: hidden`, então o zoom do navegador corta a barra superior e o HUD
em vez de refluir o conteúdo.

**A versão conforme seria:** remover `user-scalable=no` e `maximum-scale`, usar `rem`
para tipografia e dimensionar o canvas de forma responsiva.

## 1.4.10 Reflow · Nível AA · 📄 documentado

**A norma exige:** conteúdo utilizável a 320 CSS px de largura sem rolagem em dois eixos.

**Como o unusable viola:** o canvas se ajusta a janela, mas nada mais se ajusta. O HUD
tem 210px fixos e fica sobre o mapa; a barra superior e uma linha rigida de flex com
logo, busca, oferta, cronometro, badge e botao; os modais tem larguras fixas de 420 a
780px. Com `overflow: hidden` no `body`, o que nao couber simplesmente some, sem rolagem
para alcancar. A 320px a barra superior e cortada e o HUD cobre o mapa inteiro.

**A versão conforme seria:** media queries empilhando a barra superior, HUD relativo em
vez de fixo, modais com `max-width: 100%` e rolagem quando necessario.

## 1.4.13 Content on Hover or Focus · Nível AA · ✅ implementado

**A norma exige:** conteúdo que aparece no hover ou foco precisa ser dispensável,
apontável (hoverable) e persistente até o usuário sair dele.

**Como o unusable viola:** em `public/js/main.js`, `ligarBusca` inicia um
`setInterval` de 1100 ms no `mouseenter` da lista de resultados que embaralha a ordem
dos itens enquanto o ponteiro estiver sobre ela. O conteúdo não é persistente: o alvo
que você ia clicar muda de lugar sozinho.

**A versão conforme seria:** a lista permanece estável enquanto o ponteiro ou o foco
estiver sobre ela, e é dispensável com `Esc`.

---

# Princípio 2 — Operável

## 2.1.1 Keyboard · Nível A · ✅ implementado

**A norma exige:** toda funcionalidade precisa estar disponível pelo teclado.

**Como o unusable viola:** três mecânicas centrais são exclusivas de ponteiro:

- pegar produtos — `pointerdown`/`pointermove`/`pointerup` em
  `public/js/prateleira.js`, sem equivalente de teclado;
- girar o código de barras no leitor — evento `wheel` em `public/js/caixa.js`,
  impossível sem roda de mouse;
- selecionar as células do captcha — apenas `click` em `<div>` não focáveis.

Sem mouse, o jogo é interrompido logo na primeira prateleira.

**A versão conforme seria:** selecionar produto com `Enter` e mover com as setas;
girar o código com `[` e `]`; células do captcha como `<button>` alcançáveis por `Tab`.

## 2.1.2 No Keyboard Trap · Nível A · ✅ implementado

**A norma exige:** se o foco entra num componente pelo teclado, precisa ser possível sair
dele pelo teclado, usando apenas `Tab`, setas ou um método documentado na tela.

**Como o unusable viola:** `public/js/caixa.js`, função `prenderFoco`, registrada em
`montarPagamento` com captura no `document`:

```js
function prenderFoco(ev) {
  if (ev.key !== 'Tab') return;
  ev.preventDefault();
  var teclas = $$('.tecla');
  if (teclas.length) escolha(teclas).focus();
}
```

`Tab` e `Shift+Tab` são anulados e o foco volta para uma tecla **sorteada** do teclado
numérico. Não há atalho de escape documentado. A única saída é completar os 16 dígitos,
o que devolve o foco em `soltarFoco()`.

**A versão conforme seria:** `Esc` fecha o diálogo, o foco circula dentro dele
enquanto aberto e retorna ao elemento que o abriu — o padrão de modal acessível.

## 2.2.1 Timing Adjustable · Nível A · ✅ implementado

**A norma exige:** limites de tempo precisam poder ser desligados, ajustados ou
estendidos.

**Como o unusable viola:** dois prazos rígidos, nenhum ajustável:

- `public/js/loja.js`, `verificarOcio`: `LIMITE_OCIOSO = 60000`. Sessenta segundos sem
  input e o carrinho é recolhido, esvaziando a sacola. Não há botão de "preciso de mais
  tempo".
- `public/js/util.js`, `toast`: toda mensagem do sistema desaparece em 400 ms, tempo
  insuficiente para muita gente ler uma frase inteira.

**A versão conforme seria:** aviso aos 20 segundos do fim com opção de estender pelo
menos 10 vezes, e mensagens que permanecem até serem dispensadas.

## 2.2.2 Pause, Stop, Hide · Nível A · ✅ implementado

**A norma exige:** conteúdo que se move, pisca ou atualiza automaticamente por mais de
5 segundos precisa ter mecanismo de pausar, parar ou ocultar.

**Como o unusable viola:** três animações perpétuas sem controle algum:

- `.oferta` na barra superior pisca continuamente (`animation: piscar .5s infinite`);
- `#oferta-tempo` conta regressivamente e **reinicia sozinho** quando zera
  (`reiniciarOferta` em `public/js/main.js`) — a oferta nunca termina;
- `#botoes-carrinho` troca a ordem dos botões do HUD a cada 4 segundos via
  `trocarLugares`;
- a barra de cookies volta sozinha 7 segundos depois de ser recusada.

**A versão conforme seria:** um botão de pausa global para animações, ou respeitar
`prefers-reduced-motion` e parar tudo que não for essencial.

## 2.3.1 Three Flashes or Below Threshold · Nível A · 📄 documentado, com opt-in

**A norma exige:** nada pode piscar mais de três vezes por segundo, salvo se abaixo dos
limiares de área e de vermelho saturado.

**Este é o único critério do documento cuja violação causa dano físico**, não
frustração: piscar acima de 3 Hz pode desencadear crises em pessoas com epilepsia
fotossensível. Por isso ele recebeu tratamento diferente dos outros 26.

**Como o unusable se comporta por padrão:** `.oferta` pisca com período de 0,5 s, ou seja
**2 Hz** — visualmente agressivo e **abaixo** do limiar de 3 Hz. Por padrão, o app
**está conforme** neste critério.

**A violação real está atrás de um opt-in.** O botão `#btn-flash` ("intenso") aplica
`.oferta.intenso`, com período de 0,14 s (≈7 Hz), acima do limiar. Ele:

- vem desligado e nunca é ativado automaticamente;
- traz o risco no próprio rótulo do botão;
- exige confirmação num diálogo que nomeia epilepsia fotossensível.

**A versão conforme seria:** o comportamento padrão atual, ou nenhuma animação piscante.

> Nota histórica: a animação `piscar` do cronômetro tinha período de 0,35 s (≈2,9 Hz),
> perto demais do limiar. Foi reduzida para 0,5 s.

## 2.4.1 Bypass Blocks · Nível A · 📄 documentado

**A norma exige:** um mecanismo para pular blocos repetidos de conteúdo.

**Como o unusable viola:** não existe skip link nem landmarks úteis. A barra superior
repete os mesmos sete controles em toda tabulacao, incluindo o botao de piscada intensa,
e nao ha como saltar direto para o HUD ou para o conteudo.

**A versão conforme seria:** um "pular para o conteúdo principal" como primeiro elemento
focável, e uso correto de `<nav>` e `<main>` como landmarks.

## 2.4.2 Page Titled · Nível A · 📄 documentado

**A norma exige:** título de página descritivo do tópico ou propósito.

**Como o unusable viola:** o `<title>` é apenas `unusable` — a marca, sem dizer o que a
página é ou faz, e sem mudar quando o app troca da loja para o cupom.

**A versão conforme seria:** `Loja — unusable` e `Pedido finalizado — unusable`,
atualizados na troca de tela.

## 2.4.3 Focus Order · Nível A · ✅ implementado

**A norma exige:** a ordem de foco precisa preservar significado e operabilidade.

**Como o unusable viola:** `public/index.html` usa `tabindex` positivos arbitrários,
sem relação com a ordem visual:

| Elemento | tabindex | Posição visual |
|---|---|---|
| botão de instruções | 2 | barra superior, ponta direita |
| badge da sacola | 4 | barra superior, direita |
| esvaziar sacola | 5 | HUD, sobre o mapa |
| finalizar | 6 | HUD, à esquerda do anterior |
| campo de busca | 9 | barra superior, esquerda |
| modo intenso | 17 | barra superior, meio |
| fechar prateleira | 21 | modal |
| aceitar cookies | 30 | barra inferior |
| recusar cookies | 31 | barra inferior |

Tabular começa na ponta direita da barra, salta para o HUD no meio da tela, volta para a
esquerda da barra e só então desce. Pior: os botões do HUD trocam de posição visual a
cada 4 segundos sem mudar de posição no DOM, então a ordem de foco e a ordem visual
divergem sozinhas.

**A versão conforme seria:** nenhum `tabindex` positivo — apenas `0` e `-1` — deixando a
ordem do DOM refletir a ordem visual.

## 2.4.7 Focus Visible · Nível AA · ✅ implementado

**A norma exige:** indicador de foco visível para qualquer interface operável por teclado.

**Como o unusable viola:** `public/css/style.css` zera o indicador globalmente:

```css
*:focus{outline:none}
*:focus-visible{outline:none}
```

Nenhum substituto é fornecido. Navegando por `Tab`, é impossível saber onde o foco está.

**A versão conforme seria:** manter o `outline` padrão do navegador ou fornecer um
indicador próprio com contraste suficiente.

**Exceção deliberada:** `.fechar-grande:focus-visible` — o botão de fechar as instruções
— **mantém** o anel de foco. Ver a seção "O componente honesto" no fim deste documento.

## 2.4.11 Focus Not Obscured (Minimum) · Nível AA · ✅ implementado

**A norma exige:** o elemento em foco não pode ficar totalmente escondido por conteúdo
criado pelo autor.

**Como o unusable viola:** a barra de cookies (`.cookies`) é `position: fixed` no rodapé,
com `z-index: 50`, e cobre o que estiver embaixo dela. Ela aparece 1,5 s após o
carregamento e **volta sozinha 7 segundos depois de ser recusada**, reaparecendo por cima
de qualquer elemento que tenha recebido foco naquela faixa da tela. Como não há indicador
de foco visível (2.4.7), a pessoa nem descobre que o alvo focado está atrás da barra.

**A versão conforme seria:** reservar espaço no layout para a barra, ou garantir que o
elemento focado seja rolado para fora da área coberta.

## 2.5.7 Dragging Movements · Nível AA · ✅ implementado

**A norma exige:** toda funcionalidade que usa arrastar precisa ter alternativa por
ponteiro único (um clique ou toque), salvo quando arrastar é essencial.

**Como o unusable viola:** **esta é a mecânica central do jogo.** Colocar um produto na
sacola só é possível arrastando, e ainda com uma restrição de velocidade: em
`public/js/prateleira.js`, `moverArraste` mede a distância percorrida a cada evento e,
acima de `VELOCIDADE_MAX = 26` px, derruba o produto:

```js
if (d > VELOCIDADE_MAX) {
  toast('escorregou da sua mao');
  soltarArraste(ev, true);
}
```

Não existe clique alternativo. Quem não consegue executar um arrasto lento e contínuo —
por tremor, mobilidade reduzida ou uso de dispositivo alternativo — não consegue comprar
nada.

**A versão conforme seria:** clicar no produto e depois clicar na sacola, ou um botão
"adicionar" em cada card, mantendo o arraste apenas como atalho opcional.

## 2.5.8 Target Size (Minimum) · Nível AA · ✅ implementado

**A norma exige:** alvos de ponteiro de pelo menos 24×24 CSS px, ou espaçamento
equivalente.

**Como o unusable viola:**

- **recusar cookies**: `.btn-cookie-nao` tem **12×12 px**, metade do mínimo, e fica
  colado num `ACEITAR TUDO` de aproximadamente 46 px de altura. A desproporção é o
  próprio padrão obscuro: aceitar é fácil, recusar é uma miniatura;
- botão de fechar dos modais: 26×26 px, abaixo dos 24 px úteis depois da borda;
- botão `+` da quantidade: tem 70 px, mas **foge do cursor** depois de 5 cliques
  (`clicarMais` em `public/js/prateleira.js`), o que anula o tamanho na prática.

**A versão conforme seria:** mínimo de 24×24 px com espaçamento entre alvos, e nenhum
elemento que se desloca em resposta à tentativa de acioná-lo.

---

# Princípio 3 — Compreensível

## 3.1.1 Language of Page · Nível A · ✅ implementado

**A norma exige:** o idioma padrão da página precisa ser identificável por software.

**Como o unusable viola:** `public/index.html` declara `<html lang="en">` enquanto todo o
conteúdo está em português. Um leitor de tela lê o português com fonemas do inglês,
tornando o texto incompreensível.

**A versão conforme seria:** `<html lang="pt-BR">`.

## 3.2.2 On Input · Nível A · ✅ implementado

**A norma exige:** mudar a configuração de um componente não pode causar mudança de
contexto sem aviso prévio.

**Como o unusable viola:** `public/js/caixa.js`, `digitar` chama `embaralharTeclado()`
após **cada** tecla pressionada. O teclado numérico inteiro se reorganiza a cada dígito,
de modo que a mesma posição da tela nunca corresponde ao mesmo valor duas vezes
seguidas. Nada avisa que isso vai acontecer.

**A versão conforme seria:** layout de teclado estável, ou aviso explícito antes de
qualquer reorganização.

## 3.2.3 Consistent Navigation · Nível AA · 📄 documentado

**A norma exige:** mecanismos de navegação repetidos precisam aparecer na mesma ordem
relativa.

**Como o unusable viola:** o par de botões do HUD (`Finalizar` e `Esvaziar`) troca de
ordem a cada 4 segundos, então a "navegação" muda de posição dentro da mesma tela,
quanto mais entre telas.

**A versão conforme seria:** ordem fixa dos controles em todas as telas.

## 3.2.4 Consistent Identification · Nível AA · ✅ implementado

**A norma exige:** componentes com a mesma função precisam ser identificados de forma
consistente.

**Como o unusable viola:** dois casos:

- **O botão mente sobre a própria função:** `Finalizar` não finaliza nada; em
  `public/js/main.js` ele apenas emite `esse botao nao finaliza nada. dirija ate PASSAR
  COMPRAS.`
- **O mesmo carrinho mostra dois números:** o badge da barra superior conta *linhas* de
  produto e o HUD conta *unidades* (`renderPainel` em `public/js/estado.js`), então a
  barra diz `2` enquanto o HUD diz `(5)`.
- **"ACEITAR TUDO" e o `x` têm peso visual invertido em relação ao efeito:** um encerra
  o assunto, o outro só adia por 7 segundos.

**A versão conforme seria:** um ícone por significado, rótulos que descrevem a ação real
e uma única definição de "quantidade no carrinho".

## 3.3.1 Error Identification · Nível A · ✅ implementado

**A norma exige:** erros de entrada precisam ser identificados e descritos em texto,
associados ao campo que falhou.

**Como o unusable viola:** todo erro do app — dígito recusado, quantidade inválida,
ângulo torto, leitura falha — vira um `toast` que aparece no topo da tela, longe do
campo, sem qualquer associação programática, e **desaparece em 400 ms**
(`public/js/util.js`). Não há `aria-live`, então leitores de tela não anunciam nada.

**A versão conforme seria:** mensagem persistente, adjacente ao campo, ligada por
`aria-describedby`, dentro de uma região `aria-live="assertive"`.

## 3.3.2 Labels or Instructions · Nível A · 📄 documentado

**A norma exige:** rótulos ou instruções quando o conteúdo exige entrada do usuário.

**Como o unusable viola:** o teclado do pagamento é um `<div id="teclado">` com dez
`<button>` numéricos e nenhum `<label>` ou `aria-label` que diga o que está sendo
digitado. O modal de quantidade não tem campo de formulário nem instrução sobre o limite
mínimo — a regra "zero é recusado" só se descobre errando.

**A versão conforme seria:** `<label>` associado ao visor do cartão, `aria-label` em cada
tecla e instrução visível sobre a quantidade mínima.

## 3.3.7 Redundant Entry · Nível A · 📄 documentado

**A norma exige:** informação já fornecida na mesma sessão não deve ser exigida de novo,
salvo quando essencial.

**Como o unusable viola:** o botão `Limpar tudo` do pagamento
(`#btn-limpar-cartao`, `public/js/caixa.js`) apaga os 16 dígitos de uma vez. Como não
existe backspace, corrigir um único dígito exige redigitar o número inteiro — num
teclado que reembaralha a cada tecla.

**A versão conforme seria:** backspace corrigindo um dígito por vez, e preenchimento
automático permitido.

## 3.3.8 Accessible Authentication (Minimum) · Nível AA · ✅ implementado

**A norma exige:** nenhum teste de função cognitiva (memorizar, transcrever, resolver
quebra-cabeça) pode ser exigido em etapa de autenticação, a menos que haja alternativa
ou mecanismo de auxílio. Colar e preenchimento automático precisam funcionar.

**Como o unusable viola:** a etapa de pagamento é exatamente um teste de função cognitiva:

- o teclado reembaralha após cada tecla (`embaralharTeclado`), exigindo nova busca
  visual a cada dígito;
- não há campo de texto, então **colar é impossível** e gerenciadores de senha e
  autopreenchimento não têm onde atuar;
- não há backspace, apenas apagar tudo;
- o captcha da etapa anterior é um quebra-cabeça visual sem alternativa não visual.

**A versão conforme seria:** um `<input>` comum aceitando colar e autopreenchimento, sem
reorganização do teclado, e captcha com alternativa acessível — ou nenhum captcha.

---

# Princípio 4 — Robusto

## 4.1.2 Name, Role, Value · Nível A · ✅ implementado

**A norma exige:** todo componente de interface precisa ter nome e papel determináveis
por software.

**Como o unusable viola:** vários controles são `<div>` ou `<li>` com `click`, sem `role`,
sem `aria-*` e sem serem focáveis por padrão:

| Componente | Marcação real | Onde |
|---|---|---|
| badge da sacola | `<div class="badge-carrinho">` | `public/index.html` |
| recusar cookies | `<button>` de 12px sem nome acessível | `public/index.html` |
| células do captcha | `<div class="captcha-cel">` | `public/js/caixa.js`, `montarCaptcha` |
| cards de produto | `<div class="produto">` | `public/js/prateleira.js` |

Para tecnologia assistiva, esses elementos não são controles — são texto. O estado
selecionado do captcha existe apenas como classe CSS (`.sel`), sem `aria-pressed`.

**A versão conforme seria:** `<button>` nativo em todos eles, com `aria-pressed` para
alternância e nome acessível descrevendo a ação.

---

# O componente honesto

Um único componente do unusable é deliberadamente acessível: o **painel de instruções**
(`#overlay-instrucoes`).

- botão de abertura com rótulo textual, não só ícone;
- alvo de fechar com no mínimo 96×44 px e a palavra "Fechar" escrita;
- **mantém o anel de foco** (`.fechar-grande:focus-visible`), única exceção ao
  `outline: none` global;
- fecha com `Esc`;
- recebe foco ao abrir;
- tipografia de sistema, corpo 14px, entrelinha 1.6, contraste normal;
- abrir o painel **pausa o jogo**, porque a física congela enquanto há overlay aberto.

Ele existe por dois motivos. O primeiro é de projeto: o contraste entre um componente
correto e as outras 26 violações torna cada uma delas mais evidente. O segundo é prático: sem um
lugar honesto para explicar as regras, o jogo deixaria de ser uma piada compreensível e
viraria apenas ruído.

**Não adicione sabotagem a este componente.** A decisão está registrada também em
`docs/DESIGN.md` e em `AGENTS.md`.

---

# Como verificar cada violação

| Verificação | Critérios cobertos |
|---|---|
| Navegar a página inteira só com `Tab` | 2.4.7, 2.4.3, 2.1.1, 2.1.2 |
| Tentar zoom de 200% no navegador | 1.4.4, 1.4.10 |
| Ligar um leitor de tela (NVDA, Narrador) | 1.1.1, 3.1.1, 4.1.2, 1.3.1 |
| Rodar Lighthouse ou axe DevTools e guardar o relatório | 1.4.3, 3.1.1, 4.1.2, 3.3.2 |
| Medir contraste dos pares da tabela de 1.4.3 | 1.4.3 |
| Cronometrar o aviso de oferta e o carrinho ocioso | 2.2.1, 2.2.2, 2.3.1 |
| Tentar comprar sem usar arrasto | 2.5.7 |
| Recusar os cookies e cronometrar a volta da barra | 2.4.11, 2.5.8, 3.2.4 |
| Tentar colar o número do cartão | 3.3.8, 3.3.7 |

## Escopo desta rodada

Os 19 marcados ✅ estão implementados e são demonstráveis. Os 8 marcados 📄 estão
analisados aqui mas não foram reforçados no código — vários já falham naturalmente,
apenas não foram verificados nem aprofundados.
