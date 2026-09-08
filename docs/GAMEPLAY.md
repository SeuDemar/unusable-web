# Gameplay e parâmetros de balanceamento

Manual do jogador e tabela de referência de todos os números ajustáveis.
**Se você alterar um valor no código, atualize a tabela correspondente aqui.**

---

## 1. Como se joga

### Controles

| Tecla | Efeito |
|---|---|
| `W` / `↑` | acelera para frente |
| `S` / `↓` | dá ré |
| `A` / `←` | vira para a **direita** (invertido de propósito) |
| `D` / `→` | vira para a **esquerda** (invertido de propósito) |
| roda do mouse | gira o produto no leitor (etapa do caixa) |

O carrinho só esterça em movimento. A rodinha esquerda é empenada e puxa sozinha.
A cada 7–14 segundos a roda trava por cerca de 1 segundo e o esterçamento é ignorado.

### Fluxo completo

1. **Abertura** — não há tela de início. A página carrega já jogável, com o carrinho
   embaixo, no centro do mapa. O painel da direita mostra a lista sorteada (3 itens de
   seções diferentes). O botão **? Instruções**, no menu lateral, explica tudo e pausa
   o jogo enquanto estiver aberto.
2. **Estacionar** — dirija até a vaga tracejada de uma seção. Pare dentro dela, alinhado
   com a seta. Ficando parado e alinhado por meio segundo, a seção abre.
3. **Pegar produtos** — arraste o produto da arara para a sacola. Devagar: se o mouse se
   mover rápido demais, o produto escorrega e cai. O que cai volta sozinho.
4. **Quantidade** — só existe o botão `+`. Depois de 5 cliques ele começa a fugir.
   Confirmar com 0 é recusado.
5. **Checkout** — com a lista completa, dirija até a vaga verde na frente do CHECKOUT e
   estacione do mesmo jeito.
6. **Fila** — cerca de 18 segundos. O botão "Pular a fila" piora sua situação.
7. **Leitor** — arraste cada produto até o leitor preto com o código de barras reto.
   Use a roda do mouse para girar. Torto demais, erro de leitura.
8. **Captcha** — marque todos os carrinhos 🛒 e nada além disso.
9. **Pagamento** — digite `4242 4242 4242 4242` num teclado que reembaralha a cada
   tecla. Dígito errado é recusado na hora.
10. **Cupom** — apareceram taxas. Seu pedido foi cancelado com sucesso.

### Coisas que valem saber

- O carrinho parado por 60 segundos é **recolhido por abandono** e esvazia. A contagem
  regressiva aparece no canto superior direito a partir dos 30 segundos.
- A busca do header e o **menu de categorias** fazem a mesma coisa: destacam a seção em
  laranja no mapa e no minimapa. A busca aceita uma letra a cada 800 ms; o menu é
  instantâneo.
- O botão "Finalizar pedido" não finaliza nada. Ele só te lembra de dirigir até o
  CHECKOUT.
- O badge 🛒 do header conta **linhas** de produto; o painel conta **unidades**. Os dois
  números discordam de propósito.
- Bater nas araras e obstáculos empurra o carrinho de volta e sacode o ângulo.

---

## 2. Parâmetros — física do carrinho
`public/js/loja.js`, função `atualizar`

| Parâmetro | Valor | Efeito |
|---|---|---|
| aceleração à frente | `+0.22` por frame | quanto mais alto, mais difícil parar na vaga |
| aceleração de ré | `-0.15` por frame | ré propositalmente mais fraca |
| velocidade máxima | `3.3` / `-1.7` | teto de frente e de ré |
| atrito | `×0.955` por frame | quanto menor, mais o carrinho patina |
| força do esterçamento | `0.0045 × |vel|` | só age acima de `|vel| > 0.14` |
| amortecimento angular | `×0.88` por frame | quanto maior, mais o giro "escorrega" |
| deriva da rodinha | `-0.0016 × vel` | o defeito permanente; sinal inverte na ré |
| raio de colisão | `20 px` | círculo do carrinho contra retângulos |
| repique da batida | `vel × -0.35` | quanto empurra de volta |

**Trava aleatória da roda** (`rodinha`): primeira trava entre 6–12 s do início; duração
0,7–1,4 s; intervalo seguinte 7–14 s.

## 3. Parâmetros — estacionamento
`public/js/loja.js`, `verificarEstacionamento`

| Parâmetro | Valor |
|---|---|
| velocidade máxima para contar como parado | `0.12` |
| tolerância de ângulo | `22°` |
| tempo parado e alinhado exigido | `450 ms` |
| tamanho típico da vaga | `130 × 84 px` |

Cada vaga tem um ângulo alvo (`vaga.ang`, em graus) desenhado como seta. `0` aponta para
a direita, `-90` para cima, `90` para baixo.

## 4. Parâmetros — carrinho abandonado
`public/js/loja.js`, `verificarOcio`

| Parâmetro | Valor |
|---|---|
| início do aviso vermelho | `30 s` sem input |
| esvaziamento do carrinho | `60 s` sem input |

## 5. Parâmetros — prateleira
`public/js/prateleira.js`

| Parâmetro | Valor | Efeito |
|---|---|---|
| velocidade máxima de arraste | `26 px` por evento de `pointermove` | acima disso, escorrega |
| aceleração da queda | `+1.1` por frame | velocidade da gravidade |
| cliques antes do botão `+` fugir | `5` | |
| quantidade mínima aceita | `1` | confirmar com 0 é recusado |

## 6. Parâmetros — caixa
`public/js/caixa.js`

| Parâmetro | Valor |
|---|---|
| avanço da fila | `+0.55%` a cada `100 ms` (≈ 18 s no total) |
| penalidade de "Pular a fila" | `-15%` |
| passo de rotação do leitor | `7°` por notch da roda |
| tolerância do leitor | `±12°` |
| ângulo inicial do produto | aleatório entre `20°` e `340°` |
| carrinhos no captcha | `2` a `4` de 9 células |
| número do cartão | `4242424242424242` (16 dígitos) |
| reembaralhamento do teclado | a cada tecla pressionada |

> O passo de rotação (7°) precisa ser menor que a tolerância (±12°), senão pode não
> existir ângulo alcançável. Mexeu num, reveja o outro.

## 7. Parâmetros — anti-padrões ambientes

| Parâmetro | Valor | Arquivo |
|---|---|---|
| duração do toast | `400 ms` | `public/js/util.js` |
| piscada do banner (padrão) | `0,5 s` de período = **2 Hz** | `public/css/style.css` |
| piscada do banner (modo intenso, opt-in) | `0,14 s` = ≈7 Hz | `public/css/style.css` |
| contagem da promoção | reinicia sozinha entre `180` e `900 s` | `public/js/main.js` |
| links inúteis no rodapé | `40`, com `8 px` de altura | `public/js/main.js` |
| cooldown da busca | `800 ms` por letra | `public/js/main.js` |
| reordenação dos resultados | a cada `1100 ms` com o mouse em cima | `public/js/main.js` |
| troca dos botões do título | a cada `3200 ms` | `public/js/main.js` |
| troca dos botões do painel | a cada `4000 ms` | `public/js/main.js` |

## 8. Parâmetros — cupom final
`public/js/main.js`, `finalizar`

| Item | Valor |
|---|---|
| taxa de conveniência | `37%` do subtotal |
| frete "grátis" | `R$ 18,50` |

## 9. Mapa e conteúdo
`public/js/dados.js`

| Elemento | Valor |
|---|---|
| tamanho do mundo | `1800 × 1100` |
| viewport do canvas | `820 × 460` |
| minimapa | `130 × 86` |
| posição inicial do carrinho | `x 900, y 980`, apontando para cima |
| seções | Roupas, Bolsas e Acessórios, Beleza, Casa e Decor (4 produtos cada) |
| itens na lista de compras | 3, de seções diferentes, quantidade 1–3 |
| obstáculos decorativos | 5 |

---

## 10. Receitas rápidas de balanceamento

**Deixar mais fácil (para demonstração):** tolerância de ângulo `22 → 35`, tolerância do
leitor `12 → 20`, velocidade de arraste `26 → 40`, fila `0.55 → 1.5`.

**Deixar mais cruel:** tolerância de ângulo `22 → 12`, deriva da rodinha
`0.0016 → 0.0030`, velocidade de arraste `26 → 16`, abandono `60 s → 30 s`.

**Encurtar uma sessão de teste:** aumente o avanço da fila e reduza o cartão para 8
dígitos (`CARTAO` em `public/js/caixa.js`) — mas devolva antes de commitar.
