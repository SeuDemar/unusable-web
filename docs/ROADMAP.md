# Roadmap — ideias levantadas, nada aprovado

Cardápio de possibilidades. **Nenhum item aqui foi aprovado pelo autor.** Trate como
inspiração, não como backlog comprometido. Antes de implementar qualquer coisa daqui,
confira as três condições em `docs/DESIGN.md` e pergunte ao autor.

---

## Fricções sugeridas na conversa inicial e ainda não implementadas

- **Zoom fixo obrigando a rolar um mapa gigante** para achar o produto. Hoje existe
  câmera que segue o carrinho e um minimapa; a versão hostil seria remover o
  acompanhamento da câmera em alguns momentos.
- **Autocomplete que reordena enquanto o mouse se move** — hoje reordena por
  temporizador (1100 ms) com o mouse em cima; a versão original reagia ao movimento.
- **Fila do caixa** — existiu como barra de progresso de ~18 s com o botão "Pular a
  fila" que voltava 15%. Saiu por cobrar só espera. Se voltar, precisa ser um personagem
  no canvas com piada própria, não uma barra.
- **Alinhar o código de barras no leitor** — existiu: cada item era uma carta com ângulo
  aleatório, girada de 7 em 7 graus pela roda do mouse e aceita com erro `≤ 12°`. Saiu
  por empilhar uma segunda exigência motora em cima do arrasto. Hoje o item passa no
  leitor arrastando, e o item é o próprio produto.
- **Slider de quantidade de 0 a 999 com 1 px por unidade.** Foi trocado pelo botão `+`
  que foge, que é mais engraçado e menos tedioso. Fica registrado como alternativa.
- **Lista de compras sorteada.** Existiu: `sortearLista()` sorteava 3 itens de 3 seções
  diferentes e o HUD exibia "LISTA" com progresso. Foi descontinuada — o que se compra
  passou a ser escolha do jogador via catálogo, e o alvo virou `Estado.escolhido`.

## Fricções novas em consideração

- **Itens que caem da cesta quando o carrinho bate.** Casaria a física da loja com o
  conteúdo do carrinho e daria consequência às colisões. Risco: pode ser punitivo
  demais se combinado com a rodinha empenada.
- **Cupom de desconto que exige resolver uma continha.**
- **Prateleira com produto na altura errada**, exigindo "abaixar" com um clique extra.
- **Corredor com piso molhado** que multiplica o atrito por uma fração.
- **Funcionário repondo estoque** que bloqueia a vaga por alguns segundos.
- **Carrinho com peso**: quanto mais itens, mais lenta a aceleração e maior a inércia.
  Boa piada e fisicamente coerente; aumenta a dificuldade do fim do jogo, que hoje é a
  parte mais leve.

## Polimento técnico

- **Bip do leitor.** Hoje é um toast de texto. `public/js/musica.js` já mantém um
  `AudioContext` aberto: dá para sintetizar o beep ali, sem asset binário.
- **Placar final**: tempo total da compra, número de colisões, produtos derrubados,
  tentativas de captcha. Transformaria a piada em algo compartilhável.
- **Tela de resultado com "nota de UX"** irônica.
- **Suporte a toque.** O arraste usa eventos de ponteiro e já funciona em touch, mas
  nada foi testado em tela pequena — ver a responsividade abaixo.
- **Responsividade.** O canvas é fixo em 820×460. Note que corrigir isso desfaz a
  violação de WCAG 1.4.10, hoje documentada em `docs/WCAG.md`.
- **Relatório de acessibilidade versionado.** Guardar a saída do Lighthouse ou do axe
  DevTools em `docs/` como evidência das violações, junto de um print da pontuação.
- **Os 7 critérios WCAG ainda não implementados**, listados em `docs/WCAG.md`.

## Explicitamente descartado

- **Backend, contas, persistência.** Fora do escopo; o jogo é uma piada de uma sessão.
- **Coleta de qualquer dado real do jogador.** O cartão é o número de teste `4242...`,
  impresso na própria tela.
- **Anti-padrões que atacam acessibilidade de verdade** (piscar em frequência perigosa,
  contraste ilegível, fonte minúscula). Ver `docs/DESIGN.md`, seção "O que é proibido".
- **Fazer "Adicionar ao carrinho" adicionar de verdade.** É tentador "consertar" porque
  parece um bug, mas não é: um botão que adicionasse o item ao carrinho seria a
  alternativa por ponteiro único que a WCAG 2.5.7 Dragging Movements exige, e derrubaria
  a violação de nível AA mais demonstrável do projeto. Ver `docs/WCAG.md`, seção 2.5.7,
  e `docs/DESIGN.md`, seção 3.6.
