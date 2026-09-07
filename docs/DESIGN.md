# Design: como se faz uma UX ruim de propósito

Este é o documento normativo do projeto. Antes de adicionar, remover ou "consertar"
qualquer fricção, confira aqui se ela é intencional e por quê.

---

## 1. A regra das três condições

Uma fricção só entra no jogo se for, ao mesmo tempo:

**Engraçada** — a reação alvo é o riso de reconhecimento ("meu Deus, eu já usei um site
assim"). Crueldade sem piada é só software ruim.

**Superável** — sempre existe caminho até o cupom final. Nada de estado irrecuperável,
travamento, precisão sub-pixel ou aleatoriedade que possa não convergir.

**Legível** — o jogador entende por que falhou. A mensagem pode ser rude, mas tem que
ser informativa: "torto, o ângulo está 41 graus fora" ensina; "erro" não ensina nada.

Se a ideia falha em qualquer uma das três, não entra.

## 2. Por que essas três

Um jogo de má UX é uma comédia de frustração, e comédia precisa de ritmo. A frustração
tem que subir, dar uma resolução e recomeçar. Se o jogador fica preso, a piada vira
raiva; se ele não entende a regra, vira aleatoriedade; se a fricção não tem graça, ele
fecha a aba. As três condições existem para proteger o ritmo.

Corolário: **fricção não é dificuldade**. O jogo não deve ser difícil de vencer, deve
ser irritante de vencer. O jogador competente termina; ele só sofre no caminho.

---

## 3. Taxonomia dos anti-padrões usados

### 3.1 Física onde não deveria haver física
Ações que na web real são instantâneas viram tarefas motoras.

| Anti-padrão | Onde | Como funciona |
|---|---|---|
| Dirigir o carrinho | loja | inércia, atrito, esterçamento só em movimento |
| Rodinha empenada | loja | deriva constante proporcional à velocidade |
| Roda travada | loja | a cada 7–14 s, o esterçamento é ignorado por 0,7–1,4 s |
| Estacionar para interagir | loja | posição + parado + ângulo dentro de ±22°, por 450 ms |
| Arrastar o produto | prateleira | mover rápido demais faz escorregar da mão |
| Gravidade no produto | prateleira | o que escapa cai no chão e volta para a prateleira |
| Girar o código de barras | caixa | roda do mouse gira de 7 em 7 graus, tolerância ±12° |

### 3.2 Controles hostis
| Anti-padrão | Onde |
|---|---|
| A e D invertidos | loja |
| Sem campo numérico: só o botão `+` | modal de quantidade |
| Botão `+` foge após 5 cliques | modal de quantidade |
| Teclado numérico reembaralha a cada tecla | pagamento |
| Sem backspace, só "Limpar tudo" | pagamento |

### 3.3 Informação sonegada ou hostil
| Anti-padrão | Onde |
|---|---|
| Toast que some em 400 ms | global |
| Busca aceita uma letra a cada 800 ms | topo da loja |
| Resultados reordenam sozinhos com o mouse em cima | busca |
| Minimapa minúsculo, sem zoom | loja |
| Confirmação com dupla negativa | limpar carrinho, sair |
| Ordem dos botões da confirmação é aleatória | `util.confirmar` |
| Cursor de ampulheta permanente | global |

### 3.4 Alvos móveis
| Anti-padrão | Onde |
|---|---|
| Botões do título trocam de lugar a cada 3,2 s | tela de título |
| "Ir pro caixa" e "Limpar tudo" trocam a cada 4 s | painel lateral |
| Botão que executa o oposto do esperado ("Pular a fila" volta 15%) | caixa |
| Botão que não faz nada ("Ir pro caixa" só manda você dirigir) | painel lateral |

### 3.5 Pressão temporal e perda
| Anti-padrão | Onde |
|---|---|
| Carrinho recolhido por abandono após 60 s parado | loja |
| Fila de ~18 s que você não pode acelerar | caixa |
| Captcha errado regenera a grade inteira | caixa |

### 3.6 Padrões obscuros de e-commerce (a sátira)
| Anti-padrão | Onde |
|---|---|
| Taxa de conveniência de 37% revelada só no cupom | tela final |
| "Estacionamento do carrinho" de R$ 18,50 surgindo do nada | tela final |
| "Sua compra foi cancelada com sucesso 😊" | tela final |
| Botão "Não desfazer o cancelamento" para confirmar | tela final |
| Asterisco do slogan que se contradiz | tela de título |

### 3.7 Estética deliberadamente ruim
Comic Sans, fundo listrado amarelo, `border: ridge` em tudo, sombras duras deslocadas,
texto com três camadas de `text-shadow` em cores complementares, título que treme
sozinho a cada 3,5 s. A regra aqui é: **feio, mas legível**. Contraste tem que existir;
a piada é o mau gosto, não a ilegibilidade.

---

## 4. O que é proibido

Estas ideias são tentadoras e estão **fora**:

- **Beco sem saída.** Qualquer estado do qual não dê para sair sem recarregar.
- **Perder progresso sem aviso.** O recolhimento por abandono só existe porque tem
  contagem regressiva visível a partir dos 30 s.
- **Aleatoriedade que pode não convergir.** Tolerâncias sempre alcançáveis; o passo de
  rotação do leitor (7°) é menor que a janela de aceite (±12°) por isso.
- **Sofrimento sem feedback.** Falhar em silêncio.
- **Anti-padrões que atacam acessibilidade de verdade** — piscar em frequência
  epileptogênica, contraste ilegível, texto de 6 px. A piada é sobre design ruim, não
  sobre excluir gente.
- **Enganar sobre dinheiro real.** É um jogo; nenhum campo coleta dado real. O número
  do cartão é o `4242...` de teste, exibido na tela.

---

## 5. Como adicionar um anti-padrão novo

1. Escreva a frase da piada primeiro. Se você não consegue explicar por que é engraçado
   numa linha, provavelmente não é.
2. Verifique as três condições da seção 1.
3. Decida se é **local** (uma etapa) ou **ambiente** (o tempo todo). Ambientes vão para
   `public/js/util.js` e devem ser reutilizáveis.
4. Implemente com feedback explícito para o jogador.
5. Registre na taxonomia acima e, se tiver número de balanceamento, em
   `docs/GAMEPLAY.md`.
6. Jogue o fluxo inteiro. Fricções se acumulam de forma não linear: três anti-padrões
   médios na mesma tela podem virar um beco sem saída que nenhum deles seria sozinho.

## 6. Orçamento de frustração

Regra prática que emergiu do balanceamento atual: **no máximo dois anti-padrões
exigentes por etapa**, e nunca dois do mesmo tipo motor em sequência.

Exemplo do que já está calibrado: o caixa tem quatro etapas, mas só o leitor exige
precisão motora. A fila exige paciência, o captcha exige atenção, o pagamento exige
persistência. Se o leitor virasse duas etapas motoras seguidas, a comédia viraria
tédio.
