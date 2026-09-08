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
| Estacionar para interagir | loja | entrar na vaga e ficar parado 3 segundos |
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
| Confirmação com dupla negativa | limpar carrinho, sair |
| Ordem dos botões da confirmação é aleatória | `util.confirmar` |
| Cursor de ampulheta permanente | global |

### 3.4 Alvos móveis
| Anti-padrão | Onde |
|---|---|
| Botões do HUD trocam de lugar a cada 4 s | HUD sobre o mapa |
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
| Preço "de" riscado que nunca foi cobrado | prateleira |
| Contagem regressiva de oferta que reinicia sozinha | barra superior |
| Badge contando linhas e HUD contando unidades | barra superior |
| Barra de cookies que volta 7 s depois de ser recusada | rodapé |
| "ACEITAR TUDO" gigante ao lado de um "x" de 12 px | rodapé |

### 3.7 Estética deliberadamente fria
A partir desta versão a estética é **minimalista monocromática**: preto, cinza e branco,
fonte de sistema, bordas de 1px, nenhum arredondamento, nenhuma cor de destaque. A única
cor da tela vem dos emoji dos produtos.

Isso não é "menos hostil" — é hostil de outro jeito. Minimalismo mal aplicado é uma das
maiores fontes reais de problema de acessibilidade: cinza-claro sobre branco, foco
invisível, alvos pequenos, rótulos ausentes porque "poluem". O projeto usa exatamente
esses vícios. A regra aqui é: **frio, mas legível**.

> **Atenção:** "legível" aqui não é mais absoluto. Alguns pares de contraste violam
> 1.4.3 de propósito (ver `docs/WCAG.md`). O que permanece proibido é o ilegível *para
> quem está jogando* — o texto que carrega regra de jogo continua com contraste
> suficiente. Decoração pode falhar; instrução, não.

---

## 4. O que é proibido

Estas ideias são tentadoras e estão **fora**:

- **Beco sem saída.** Qualquer estado do qual não dê para sair sem recarregar.
- **Perder progresso sem aviso.** O recolhimento por abandono só existe porque tem
  contagem regressiva visível a partir dos 30 s.
- **Aleatoriedade que pode não convergir.** Tolerâncias sempre alcançáveis; o passo de
  rotação do leitor (7°) é menor que a janela de aceite (±12°) por isso.
- **Sofrimento sem feedback.** Falhar em silêncio.
- **Piscar acima de 3 Hz sem consentimento explícito.** Este é o único limite
  intransponível. Violar 2.3.1 pode desencadear convulsão em pessoas com epilepsia
  fotossensível — é dano físico, não frustração. O aviso de oferta pisca a 2 Hz por padrão, e a
  versão acima do limiar existe só atrás de um opt-in com aviso nomeado e confirmação.
  Nunca ative isso por padrão, nunca remova o aviso.
- **Sabotar o painel de instruções.** Ele é a exceção honesta deliberada do projeto.
  Ver seção 7.
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

## 7. A exceção honesta: o painel de instruções

O `#overlay-instrucoes` é o único componente do unusable projetado corretamente, e isso é
uma decisão de projeto, não um esquecimento.

- rótulo textual no botão de abertura, não só ícone;
- alvo de fechar com no mínimo 96×44 px e a palavra "Fechar" escrita;
- mantém o anel de foco, única exceção ao `outline: none` global;
- fecha com `Esc`, recebe foco ao abrir;
- tipografia de sistema, corpo 14px, entrelinha 1.6, contraste normal;
- abrir o painel pausa o jogo, porque a física congela com overlay aberto.

Dois motivos. **De projeto:** o contraste entre um componente correto e todas as
violações ao redor torna as violações mais evidentes — sem régua, ninguém percebe o
torto. **Prático:** sem um lugar honesto explicando as regras, o jogo deixa de ser piada
compreensível e vira ruído, quebrando a condição "legível" da seção 1.

**Não adicione sabotagem aqui.** Se uma sessão futura achar que este painel "escapou"
do tema, este parágrafo é a resposta.

## 8. Ligação com a WCAG 2.2

A partir desta versão, o projeto tem um segundo objetivo além do humor: **violar
deliberadamente critérios da WCAG 2.2 e documentar cada violação**. São 27 catalogados,
18 implementados e verificáveis.

O catálogo completo — o que a norma exige, como o app descumpre e como seria a versão
conforme — está em **`docs/WCAG.md`**. Mapa rápido da taxonomia deste documento para lá:

| Seção deste documento | Critérios correspondentes |
|---|---|
| 3.1 Física onde não deveria haver física | 2.5.7 Dragging Movements, 2.1.1 Keyboard |
| 3.2 Controles hostis | 3.2.2 On Input, 3.3.8 Accessible Authentication, 2.5.8 Target Size |
| 3.3 Informação sonegada ou hostil | 3.3.1 Error Identification, 2.2.1 Timing Adjustable, 1.4.13 Content on Hover |
| 3.4 Alvos móveis | 2.2.2 Pause Stop Hide, 3.2.4 Consistent Identification, 2.4.3 Focus Order |
| 3.5 Pressão temporal e perda | 2.2.1 Timing Adjustable |
| 3.6 Padrões obscuros de e-commerce | 3.2.4 Consistent Identification |
| 3.7 Estética deliberadamente ruim | 1.4.3 Contrast, 1.4.4 Resize Text, 2.4.7 Focus Visible |

Ao criar um anti-padrão novo, verifique se ele corresponde a algum critério ainda não
catalogado — se corresponder, acrescente a entrada em `docs/WCAG.md` com as quatro
colunas. Um anti-padrão sem análise de norma vale menos que um com.
