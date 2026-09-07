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
- **NPC lento na fila com presença visual** — hoje a fila é uma barra de progresso e um
  texto. Poderia ser um personagem no canvas.
- **Slider de quantidade de 0 a 999 com 1 px por unidade.** Foi trocado pelo botão `+`
  que foge, que é mais engraçado e menos tedioso. Fica registrado como alternativa.

## Fricções novas em consideração

- **Itens que caem da cesta quando o carrinho bate.** Casaria a física da loja com o
  conteúdo do carrinho e daria consequência às colisões. Risco: pode ser punitivo
  demais se combinado com a rodinha empenada.
- **Fila que aumenta se você olhar para o lado** (perda de foco da janela).
- **Cupom de desconto que exige resolver uma continha.**
- **Prateleira com produto na altura errada**, exigindo "abaixar" com um clique extra.
- **Corredor com piso molhado** que multiplica o atrito por uma fração.
- **Funcionário repondo estoque** que bloqueia a vaga por alguns segundos.
- **Carrinho com peso**: quanto mais itens, mais lenta a aceleração e maior a inércia.
  Boa piada e fisicamente coerente; aumenta a dificuldade do fim do jogo, que hoje é a
  parte mais leve.

## Polimento técnico

- **Áudio.** O "bip" do leitor hoje é um toast de texto. Um `AudioContext` gerando um
  beep sintético manteria a regra de zero assets binários.
- **Placar final**: tempo total da compra, número de colisões, produtos derrubados,
  tentativas de captcha. Transformaria a piada em algo compartilhável.
- **Tela de resultado com "nota de UX"** irônica.
- **Suporte a toque.** Hoje o giro do leitor depende da roda do mouse. Precisaria de um
  gesto alternativo antes de qualquer promessa de mobile.
- **Responsividade.** O canvas é fixo em 900×560.
- **Repositório git.** O diretório ainda não é um repo. Se for versionar, o primeiro
  commit deve incluir `AGENTS.md` e `docs/`.

## Explicitamente descartado

- **Backend, contas, persistência.** Fora do escopo; o jogo é uma piada de uma sessão.
- **Coleta de qualquer dado real do jogador.** O cartão é o número de teste `4242...`,
  impresso na própria tela.
- **Anti-padrões que atacam acessibilidade de verdade** (piscar em frequência perigosa,
  contraste ilegível, fonte minúscula). Ver `docs/DESIGN.md`, seção "O que é proibido".
