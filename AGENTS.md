# AGENTS.md — instruções para agentes de IA neste repositório

Leia este arquivo antes de qualquer alteração. Se precisar de contexto mais profundo,
leia também `.claude/docs/CONTEXTO.md` e `.claude/docs/ARQUITETURA.md`.

---

## 1. O que é este projeto

`unusable-web` é um **jogo de navegador que simula o
carrinho de compras de uma loja de moda online com a pior UI e UX possíveis**, de
propósito. É um exercício de design deliberadamente hostil: cada ação que num e-commerce
real levaria um clique aqui vira um minigame frustrante.

O produto final é uma piada jogável, não um e-commerce. A funcionalidade escolhida
para ser destruída é **o carrinho de compras**, do início ao fim: dirigir o carrinho,
localizar produtos, colocar itens dentro, escolher quantidade, ir ao PASSAR COMPRAS, passar os
itens no leitor, pagar e receber o cupom.

O projeto tem **dois objetivos**, e os dois valem igual:

1. **Máxima frustração cômica** — o manifesto está em `docs/DESIGN.md`.
2. **Violar deliberadamente critérios da WCAG 2.2 e documentar cada um** — o catálogo
   está em `docs/WCAG.md`, com 27 critérios: o que a norma exige, como o app descumpre e
   como seria a versão conforme.

**A má UX é o requisito, não o bug.** Nunca "conserte" uma fricção intencional achando
que é um defeito. Antes de mexer, confirme em `docs/DESIGN.md` e em `docs/WCAG.md` se
aquilo é intencional e catalogado. Isso inclui coisas que parecem descuido: `lang="en"`,
`outline: none`, `tabindex` positivos, contraste baixo e `user-scalable=no` são todos
deliberados e estão documentados.

---

## 2. As três regras de ouro

Toda fricção adicionada precisa passar nas três:

1. **Engraçada.** A frustração tem que arrancar um sorriso, não raiva pura. O tom é
   humor seco brasileiro, com sotaque de e-commerce genérico: oferta que nunca acaba,
   desconto fabricado, frete "grátis" de R$ 18,50, cookies que voltam sozinhos.
2. **Superável.** Sempre existe um caminho para terminar a compra. Nada de becos sem
   saída, travamentos, estados irrecuperáveis ou exigências de precisão impossível.
3. **Legível.** O jogador precisa entender *por que* falhou. "Torto. O ângulo está 41
   graus fora" é bom. Falhar em silêncio é ruim.

Se uma ideia é cruel mas não é engraçada, ou é engraçada mas trava o jogo, ela não entra.

**Um único limite é intransponível:** piscar acima de 3 Hz sem consentimento explícito.
Isso viola WCAG 2.3.1 e pode causar convulsão em pessoas com epilepsia fotossensível —
é dano físico, não frustração. O aviso de oferta pisca a 2 Hz por padrão; a versão acima do
limiar existe apenas atrás de um opt-in que nomeia o risco e exige confirmação. Nunca
ative por padrão, nunca remova o aviso, nunca acelere outra animação além de 3 Hz.

**Uma única exceção honesta:** o painel de instruções (`#overlay-instrucoes`) é
acessível de propósito — alvo grande, anel de foco, `Esc`, contraste normal. Não o
sabote. Justificativa em `docs/DESIGN.md`, seção 7.

---

## 3. Restrições técnicas (não negociáveis sem pedir)

- **Vanilla puro.** HTML + CSS + JavaScript. Sem framework, sem bundler, sem npm, sem
  dependência externa, sem CDN.
- **Sem etapa de build.** `public/index.html` tem que abrir com duplo clique e funcionar.
- **Tem que rodar em `file://`.** Por isso os scripts são clássicos (`<script src>`), e
  **não** ES modules — `type="module"` quebra em `file://` por CORS. Não converta para
  `import`/`export`.
- **A ordem das tags `<script>` importa.** Ver seção 5.
- **Sem assets binários.** Ícones e produtos são emoji; o mapa é desenhado no canvas.
  Nada de `.png`, `.mp3`, fontes baixadas.
- **Paleta preto, cinza e branco.** Decisão do autor. Nenhuma cor de destaque no CSS —
  a única cor da tela vem dos emoji dos produtos. Se precisar diferenciar algo, use
  tom de cinza, peso ou borda, nunca matiz.
- **O mapa ocupa a tela toda.** Sem menu lateral, sem rodapé, sem banner grande. O que
  o jogador precisa saber fica num HUD compacto sobre o mapa.
- **Sem persistência.** Não há `localStorage`, backend nem estado entre sessões.
  Recarregar a página reinicia o jogo, e isso é intencional.
- **Só `public/` vai para a web.** É o diretório publicado na Cloudflare. Documentação,
  configuração e qualquer coisa fora de `public/` nunca é servida. Ao criar um arquivo
  novo do site, ele vai dentro de `public/`. Ver `docs/DEPLOY.md`.

---

## 4. Convenções de código

- **Idioma do código é português.** Variáveis, funções, ids de DOM, classes CSS e
  comentários em pt-BR sem acento nos identificadores (`prateleira`, `carrinho`,
  `vagaAtual`, `#lista-carrinho`). Mantenha o padrão; não misture inglês.
- **Estilo ES5 conservador**: `var`, `function`, IIFE que devolve um objeto público.
  Cada arquivo JS grande é um módulo nesse formato (`var Loja = (function(){ ... })()`).
  Não introduza `class`, `let`/`const`, arrow function ou `async` — o código é
  consistente assim e a consistência importa mais que a modernidade aqui.
- **Sem framework de CSS.** Classes semânticas em português, variáveis CSS no `:root`
  para as cores berrantes.
- **Números mágicos ficam nomeados ou comentados.** Os parâmetros de balanceamento
  (tolerâncias, cooldowns, atritos) estão listados em `docs/GAMEPLAY.md`; se você
  alterar um, atualize a tabela lá.

---

## 5. Mapa dos arquivos

```
public/index.html            casca de e-commerce, telas e overlays (nada é criado só em JS)
public/css/style.css         visual inteiro; a feiura é proposital
public/js/util.js            helpers + anti-padrões reutilizáveis (toast 400ms, embaralhar, confirmar)
public/js/dados.js           mapa da loja, prateleiras, CATALOGO/CAIXA (vagas de saida), obstaculos
public/js/estado.js          estado do jogo (carrinho, escolhido, prazo) e render do painel lateral
public/js/loja.js            canvas em tela cheia, fisica, colisao, estacionamento, setas, prazo
public/js/prateleira.js      overlay da prateleira: arrastar com gravidade + modal de quantidade
public/js/catalogo.js        tela do catalogo: secoes, produtos, botao "Adicionar" que nao adiciona
public/js/caixa.js           overlay do caixa: leitor, captcha, pagamento
public/js/musica.js          musica de elevador sintetizada, sem controle nenhum (WCAG 1.4.2)
public/js/main.js            telas, busca com cooldown, botões que fogem, tela final
```

Ordem obrigatória no `public/index.html` (dependência de definição em tempo de carga):

```
util.js → dados.js → estado.js → loja.js → prateleira.js → catalogo.js → caixa.js → musica.js → main.js
```

Referências cruzadas entre módulos (`Loja` chama `Prateleira.abrir`, `Caixa` chama
`Jogo.finalizar`) só acontecem em tempo de execução, então ciclos entre módulos são ok.

---

## 6. Onde mexer para cada tipo de tarefa

| Quero... | Vá em |
|---|---|
| mudar dificuldade de dirigir | `public/js/loja.js`, função `atualizar` |
| mudar tolerância de estacionamento | `public/js/loja.js`, `verificarEstacionamento` |
| adicionar prateleira ou produto | `public/js/dados.js`, array `PRATELEIRAS` |
| mudar o mapa / obstáculos | `public/js/dados.js` (`MUNDO`, `CAIXA`, `OBSTACULOS`) |
| mexer no arrastar produto | `public/js/prateleira.js`, `moverArraste` / `soltarArraste` |
| mexer no catálogo de produtos | `public/js/catalogo.js`, `montarSecoes` / `montarItens` |
| mexer nas setas do mapa | `public/js/loja.js`, `desenharSetas` / `setasAtivas` em `estado.js` |
| mexer no prazo de 3 minutos | `public/js/loja.js`, `verificarPrazo` / `LIMITE_COMPRA` |
| mexer na vaga de saída do catálogo | `public/js/dados.js` (`CATALOGO`), `public/js/loja.js` (`vagaAtual`) |
| mexer no leitor do caixa | `public/js/caixa.js`, `soltarItemScan` |
| mexer no captcha ou no teclado | `public/js/caixa.js`, `montarCaptcha` / `embaralharTeclado` |
| mexer na busca com cooldown | `public/js/main.js`, `ligarBusca` |
| mexer no cupom final | `public/js/main.js`, `finalizar` |
| barra superior e cookies | `public/index.html` + `ligarOferta`/`ligarCookies` em `public/js/main.js` |
| tempo de estacionamento | `TEMPO_PARADO` em `public/js/loja.js` |
| painel de instruções | `public/index.html` (`#overlay-instrucoes`) + `ligarInstrucoes` |
| mexer na música de fundo | `public/js/musica.js`, `PROGRESSAO` / `agendarCompasso` |
| novo anti-padrão global reutilizável | `public/js/util.js` + registrar em `docs/DESIGN.md` |
| nova violação de WCAG | implementar e registrar as 4 colunas em `docs/WCAG.md` |

---

## 7. Como testar

Não há suíte de testes. A validação é manual:

1. `node --check public/js/*.js` para pegar erro de sintaxe.
2. Abrir `public/index.html` no navegador e **jogar até o cupom final**. O caminho completo é
   o teste de regressão: catálogo → escolher um produto → dirigir → estacionar na
   prateleira → pegar 2 itens de seções diferentes → dirigir até o caixa (com sacola
   não vazia) → leitor → captcha → pagamento → cupom.
3. Conferir o console: o jogo deve rodar sem nenhum erro. Fricção é intencional;
   exceção no console não é.

Ao alterar física ou tolerâncias, jogue o trecho afetado antes de dar a tarefa por
pronta. "Compila" não é o mesmo que "ainda é possível estacionar".

---

## 8. Armadilhas conhecidas

- A música de fundo (`public/js/musica.js`) **não tem controle de pausa por design** —
  é a violação de WCAG 1.4.2. Não adicione botão de mudo achando que é esquecimento.
  O que continua proibido é volume alto ou pico súbito: ver `docs/DESIGN.md`, seção 4.
- O `AudioContext` nasce suspenso por política de autoplay do navegador e só toca no
  primeiro gesto. Se um dia o painel de instruções deixar de abrir no boot, a música
  passa a começar no primeiro clique dentro do jogo, e não no fechamento do painel.
- `overlayAberto()` congela a física. Se você abrir um overlay novo, use a mesma
  classe `.overlay` / `.ativa`, senão o carrinho continua andando por baixo do modal.
- O listener global de teclado ignora eventos vindos de `<input>`. Se adicionar outro
  campo de texto, o mesmo guard já cobre.
- `.scanner-pilha` **não** pode ter `overflow:hidden` — o item precisa ser arrastado
  para fora dela até o leitor.
- Durante o arraste na prateleira o elemento vira `position:fixed` e é movido para o
  `<body>`; `voltarPraPrateleira` desfaz isso. Qualquer caminho novo de saída do
  arraste precisa chamar essa função, senão o produto some do jogo.
- `Loja.iniciar()` registra listeners de teclado e é idempotente — chame quantas vezes
  quiser, ele só liga na primeira. Para reentrar no mapa (vindo do catálogo) use
  `Loja.retomar(reposicionar)`, que não re-registra nada; `Loja.parar()` só congela o
  laço. A tela inicial do jogo é o catálogo, não o mapa: `comecar()` chama
  `Catalogo.abrir()` antes de `abrirInstrucoes()`.
- `#tela-catalogo` é uma `.tela`, não um `.overlay` — ela **não** congela a física
  sozinha. Quem abre o catálogo é obrigado a chamar `Loja.parar()` também
  (`Catalogo.abrir()` já faz isso). Se você criar outro caminho para o catálogo, chame
  `Loja.parar()` nele.
- `Caixa.etapa()` faz `$$('.etapa').forEach(remover 'ativa')` **em todo o documento**,
  não só dentro do `#overlay-caixa`. Por isso o catálogo usa a classe `.passo`, não
  `.etapa`, para suas duas telas internas — usar `.etapa` faria o caixa apagar o passo
  ativo do catálogo.
- O listener global de teclado da loja ignora eventos vindos de `<input>`, o que mantém
  o campo de busca digitável.
- `prenderFoco` em `public/js/caixa.js` é um keyboard trap **intencional** (WCAG 2.1.2).
  Ele é removido por `soltarFoco()` quando o pagamento termina. Se você criar outro
  caminho de saída do pagamento, chame `soltarFoco()` nele, senão o trap vaza para o
  resto da página.
- O badge da barra superior conta linhas e o HUD conta unidades. Divergência
  intencional (WCAG 3.2.4), não bug de contagem.
- O canvas é redimensionado no `resize` por `ajustarTamanho()`, que lê a altura de
  `#topo`. Se a barra superior mudar de altura, o cálculo acompanha sozinho.
- A barra de cookies **não** usa a classe `.overlay`, então não congela a física — é de
  propósito: ela atrapalha sem pausar.

---

## 9. Escrita e tom

- Textos do jogo em português informal, sem acento quando estiverem dentro de strings
  curtas de UI já escritas assim (mantenha o padrão do arquivo que estiver editando).
- Mensagens de erro do jogo devem ser específicas e engraçadas, nunca genéricas:
  "digito recusado pelo banco" > "erro".
- Documentação (`docs/`, `.claude/docs/`, este arquivo) em português correto e completo,
  com acentuação normal.
