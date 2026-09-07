# AGENTS.md — instruções para agentes de IA neste repositório

Leia este arquivo antes de qualquer alteração. Se precisar de contexto mais profundo,
leia também `.claude/docs/CONTEXTO.md` e `.claude/docs/ARQUITETURA.md`.

---

## 1. O que é este projeto

`unusable-web` é um **jogo de navegador que simula um carrinho de compras com a pior
UI e UX possíveis**, de propósito. É um exercício de design deliberadamente hostil:
cada ação que num e-commerce real levaria um clique aqui vira um minigame frustrante.

O produto final é uma piada jogável, não um e-commerce. A funcionalidade escolhida
para ser destruída é **o carrinho de compras**, do início ao fim: pegar o carrinho,
localizar produtos, colocar itens dentro, escolher quantidade, ir ao caixa, passar os
itens no leitor, pagar e receber o cupom.

**A má UX é o requisito, não o bug.** Nunca "conserte" uma fricção intencional achando
que é um defeito. Antes de mexer, confirme em `docs/DESIGN.md` se aquilo é um
anti-padrão catalogado.

---

## 2. As três regras de ouro

Toda fricção adicionada precisa passar nas três:

1. **Engraçada.** A frustração tem que arrancar um sorriso, não raiva pura. O tom é
   humor seco brasileiro de supermercado de bairro.
2. **Superável.** Sempre existe um caminho para terminar a compra. Nada de becos sem
   saída, travamentos, estados irrecuperáveis ou exigências de precisão impossível.
3. **Legível.** O jogador precisa entender *por que* falhou. "Torto. O ângulo está 41
   graus fora" é bom. Falhar em silêncio é ruim.

Se uma ideia é cruel mas não é engraçada, ou é engraçada mas trava o jogo, ela não entra.

---

## 3. Restrições técnicas (não negociáveis sem pedir)

- **Vanilla puro.** HTML + CSS + JavaScript. Sem framework, sem bundler, sem npm, sem
  dependência externa, sem CDN.
- **Sem etapa de build.** `public/index.html` tem que abrir com duplo clique e funcionar.
- **Tem que rodar em `file://`.** Por isso os scripts são clássicos (`<script src>`), e
  **não** ES modules — `type="module"` quebra em `file://` por CORS. Não converta para
  `import`/`export`.
- **A ordem das tags `<script>` importa.** Ver seção 5.
- **Sem assets binários.** Ícones e produtos são emoji; texturas são gradientes CSS;
  o mapa é desenhado no canvas. Nada de `.png`, `.mp3`, fontes baixadas.
- **Sem persistência.** Não há `localStorage`, backend nem estado entre sessões.
  Recarregar a página reinicia o jogo, e isso é intencional.
- **Só `public/` vai para a web.** É o diretório publicado na Cloudflare. Documentação,
  configuração e qualquer coisa fora de `public/` nunca é servida. Ao criar um arquivo
  novo do site, ele vai dentro de `public/`. Ver `docs/DEPLOY.md`.

---

## 4. Convenções de código

- **Idioma do código é português.** Variáveis, funções, ids de DOM, classes CSS e
  comentários em pt-BR sem acento nos identificadores (`prateleira`, `carrinho`,
  `vagaAtual`, `#lista-compras`). Mantenha o padrão; não misture inglês.
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
public/index.html            estrutura de todas as telas e overlays (nada é criado só em JS)
public/css/style.css         visual inteiro; a feiura é proposital
public/js/util.js            helpers + anti-padrões reutilizáveis (toast 400ms, embaralhar, confirmar)
public/js/dados.js           mapa da loja, prateleiras, catálogo, obstáculos, sorteio da lista
public/js/estado.js          estado do jogo (lista, carrinho) e render do painel lateral
public/js/loja.js            canvas, física do carrinho, colisão, estacionamento, minimapa
public/js/prateleira.js      overlay da prateleira: arrastar com gravidade + modal de quantidade
public/js/caixa.js           overlay do caixa: fila, leitor, captcha, pagamento
public/js/main.js            telas, busca com cooldown, botões que fogem, tela final
```

Ordem obrigatória no `public/index.html` (dependência de definição em tempo de carga):

```
util.js → dados.js → estado.js → loja.js → prateleira.js → caixa.js → main.js
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
| mexer no leitor de código de barras | `public/js/caixa.js`, `soltarItemScan` |
| mexer no captcha ou no teclado | `public/js/caixa.js`, `montarCaptcha` / `embaralharTeclado` |
| mexer na busca com cooldown | `public/js/main.js`, `ligarBusca` |
| mexer no cupom final | `public/js/main.js`, `finalizar` |
| novo anti-padrão global reutilizável | `public/js/util.js` + registrar em `docs/DESIGN.md` |

---

## 7. Como testar

Não há suíte de testes. A validação é manual:

1. `node --check public/js/*.js` para pegar erro de sintaxe.
2. Abrir `public/index.html` no navegador e **jogar até o cupom final**. O caminho completo é
   o teste de regressão: dirigir → estacionar → pegar 3 itens → dirigir até o caixa →
   fila → leitor → captcha → pagamento → cupom.
3. Conferir o console: o jogo deve rodar sem nenhum erro. Fricção é intencional;
   exceção no console não é.

Ao alterar física ou tolerâncias, jogue o trecho afetado antes de dar a tarefa por
pronta. "Compila" não é o mesmo que "ainda é possível estacionar".

---

## 8. Armadilhas conhecidas

- `overlayAberto()` congela a física. Se você abrir um overlay novo, use a mesma
  classe `.overlay` / `.ativa`, senão o carrinho continua andando por baixo do modal.
- O listener global de teclado ignora eventos vindos de `<input>`. Se adicionar outro
  campo de texto, o mesmo guard já cobre.
- `.scanner-pilha` **não** pode ter `overflow:hidden` — o item precisa ser arrastado
  para fora dela até o leitor.
- Durante o arraste na prateleira o elemento vira `position:fixed` e é movido para o
  `<body>`; `voltarPraPrateleira` desfaz isso. Qualquer caminho novo de saída do
  arraste precisa chamar essa função, senão o produto some do jogo.
- `Loja.iniciar()` registra listeners de teclado e só é chamado uma vez por
  carregamento de página. Reiniciar o jogo é `location.reload()`.

---

## 9. Escrita e tom

- Textos do jogo em português informal, sem acento quando estiverem dentro de strings
  curtas de UI já escritas assim (mantenha o padrão do arquivo que estiver editando).
- Mensagens de erro do jogo devem ser específicas e engraçadas, nunca genéricas:
  "digito recusado pelo banco" > "erro".
- Documentação (`docs/`, `.claude/docs/`, este arquivo) em português correto e completo,
  com acentuação normal.
