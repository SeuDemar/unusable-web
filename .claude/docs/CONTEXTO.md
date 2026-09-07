# Contexto do projeto — leia isto primeiro numa sessão nova

> Documento de contexto para sessões futuras de Claude Code. Descreve **por que** o
> projeto existe, **como ele chegou até aqui** e **o que não é óbvio olhando só o código**.
> Para regras operacionais, veja `AGENTS.md`. Para o mapa do código, `.claude/docs/ARQUITETURA.md`.

---

## 1. Origem e intenção

O projeto nasceu de um pedido direto do autor:

> "Estou fazendo um projeto que precisa ter a pior UI e UX possível dentro de uma
> funcionalidade. A funcionalidade é: carrinho de compras. Minha intenção era fazer um
> site jogável com péssimas experiências de jogabilidade para o usuário. Não precisaria
> ser 100% jogável, mas por exemplo, poderia ser um carrinho de compras que você
> estacionasse, colocasse os itens dentro dele arrastando com o mouse, e depois fosse
> até um local de compras passar os itens."

Duas coisas importantes saem daí:

1. **A metáfora física é o coração da ideia.** O carrinho de compras da web vira um
   carrinho de compras literal, que você dirige, estaciona e enche à mão. Todo o resto
   (busca, quantidade, checkout) foi construído em cima dessa premissa.
2. **O autor aceitou não ser 100% jogável**, mas a implementação foi além: o fluxo é
   completo e terminável de ponta a ponta. Mantenha assim — é o que torna a piada
   satisfatória em vez de só irritante.

## 2. Decisões tomadas no início (e por quê)

| Decisão | Motivo |
|---|---|
| HTML/CSS/JS puro, sem build | Escolha explícita do autor. Abrir com duplo clique, iterar rápido, hospedar em qualquer lugar. |
| Fluxo completo em versão simples, em vez de uma etapa polida | Escolha explícita do autor. Prioriza a experiência inteira sobre profundidade de um minigame só. |
| Scripts clássicos, não ES modules | `type="module"` quebra em `file://`. Sem servidor, sem módulos. |
| Código em português | O jogo é em português; manter identificadores no mesmo idioma dos textos evita tradução mental constante. |
| ES5 (`var`, IIFE) | Consistência interna. Não há transpilação nem lint; o estilo antigo é uniforme e roda em tudo. |
| Emoji como arte | Zero assets binários, zero licenciamento, funciona offline. |

## 3. Princípio de design que guia tudo

**Toda fricção precisa ser engraçada, superável e legível.** Essa é a regra que
diferencia "má UX de brincadeira" de "software quebrado". Detalhada em `docs/DESIGN.md`.

Corolário prático: o jogo nunca deve ter beco sem saída. Se o jogador errar o captcha,
ele gera outro. Se o produto cair no chão, o repositor devolve. Se o carrinho for
recolhido por abandono, dá para reencher. Nada é permanente exceto terminar a compra.

## 4. Estado atual (última sessão: 2026-09-07)

**Completo e jogável do início ao fim.** Todas as etapas abaixo estão implementadas:

1. Tela de título com botões que trocam de lugar sozinhos.
2. Loja em canvas com câmera que segue o carrinho, 4 prateleiras, obstáculos e minimapa.
3. Física do carrinho: controles de direção invertidos, rodinha empenada, travamento
   aleatório da roda, colisão com empurrão.
4. Estacionamento com exigência de posição + velocidade zero + ângulo dentro de ±22°.
5. Overlay de prateleira: arrastar produto com "gravidade" (escorrega se mover rápido).
6. Modal de quantidade com botão `+` que foge depois de 5 cliques.
7. Caixa: fila cronometrada, leitor de código de barras com rotação por roda do mouse,
   captcha de carrinhos, teclado numérico que reembaralha a cada tecla.
8. Cupom final com taxas absurdas e a piada do cancelamento.
9. Anti-padrões ambientes: toast de 400ms, busca com cooldown de 800ms, resultados que
   reordenam sozinhos, confirmação com dupla negativa, carrinho recolhido por abandono
   após 60s parado, cursor de ampulheta permanente.

**Não existe ainda:** áudio, sistema de pontuação, tempo total da compra, telas
responsivas para mobile, persistência, testes automatizados, git (o diretório não é um
repositório).

## 5. O que não é óbvio olhando o código

- **Os controles A/D estão invertidos de propósito.** Em `js/loja.js`, a variável se
  chama `viraDireita` e é alimentada pela tecla `a`. Isso é a intenção, não um bug de
  nomenclatura. Está comentado no arquivo — não "corrija".
- **A deriva da rodinha depende do sinal da velocidade** (`velAng -= 0.0016 * vel`), ou
  seja, o carrinho puxa para um lado indo para frente e para o outro dando ré. Isso é
  fisicamente plausível e foi mantido.
- **`paradoDesde = -1` é um sentinela**, não um tempo. Serve para não repetir o toast de
  "torto" a cada frame enquanto o jogador estiver parado e desalinhado dentro da vaga.
- **O botão "Ir pro caixa" não leva ao caixa.** É um troll deliberado: ele só avisa que
  você precisa dirigir até lá. Manter.
- **A tolerância do leitor (±12°) parece apertada, mas a roda gira de 7 em 7 graus**, o
  que garante que sempre existe um ângulo alcançável dentro da janela. Se alterar o
  passo de rotação, reavalie a tolerância junto — os dois números são acoplados.
- **O captcha exige seleção exata**, incluindo não marcar distratores. Errar regenera a
  grade inteira, então nunca fica impossível.
- **O pagamento valida dígito a dígito.** Um dígito errado é recusado na hora em vez de
  deixar você digitar 16 e falhar no fim — essa foi uma escolha consciente de
  "cruel, mas não desumano".

## 6. Onde o projeto pode ir (não decidido, apenas levantado)

Ideias discutidas mas ainda não implementadas estão em `docs/ROADMAP.md`. Nenhuma delas
foi aprovada pelo autor; trate como cardápio, não como backlog comprometido.

## 7. Como retomar rápido numa sessão nova

1. Ler `AGENTS.md` (regras) e este arquivo (contexto).
2. Abrir `index.html` no navegador e jogar dois minutos. O jogo se explica jogando, e
   a sensação das tolerâncias é impossível de avaliar lendo números.
3. Consultar `docs/GAMEPLAY.md` para a tabela de parâmetros antes de balancear qualquer
   coisa.
4. `node --check js/*.js` depois de editar, e jogar o trecho afetado antes de concluir.
