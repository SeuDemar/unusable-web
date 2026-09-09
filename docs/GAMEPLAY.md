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

O carrinho só esterça em movimento. Não há rodinha empenada nem travamento aleatório:
a dificuldade de dirigir vem só da inércia e dos controles invertidos.

### Fluxo completo

1. **Abertura** — a página carrega direto no **catálogo**, com a grade de 6 seções já
   visível. Qualquer clique ali libera o áudio da música de fundo (é o primeiro gesto
   do usuário). O painel de instruções não aparece nesta etapa.
2. **Catálogo** — clicar numa seção mostra os 4 produtos dela. O botão **"Adicionar ao
   carrinho"** de cada produto é a única forma de escolher um item: ele **não adiciona
   nada** à sacola, só marca o produto escolhido e leva o jogador ao mapa. "Voltar"
   retorna à grade de seções.
3. **Estacionar** — entre no retângulo tracejado em frente à prateleira e **fique parado
   3 segundos**. Um contador circular aparece em cima do carrinho. O ângulo do carrinho
   não importa.
4. **Pegar produtos** — arraste o produto da arara para a sacola. Devagar: se o mouse se
   mover rápido demais, o produto escorrega e cai. O que cai volta sozinho. Uma seta
   escrachada no mapa aponta a prateleira do item escolhido no catálogo, mas nada
   impede pegar qualquer outro produto pelo caminho.
5. **Quantidade** — só existe o botão `+`. Depois de 5 cliques ele começa a fugir.
   Confirmar com 0 é recusado.
6. **Duas saídas** — embaixo do mapa há duas vagas lado a lado. A da **esquerda**
   (CATÁLOGO) volta à grade de seções, com a sacola intacta. A da **direita** (PASSAR
   COMPRAS) abre o caixa, mas só se a sacola tiver ao menos 1 item. As duas exigem os
   mesmos 3 segundos parado.
7. **Leitor** — arraste cada produto da pilha até o leitor preto. Soltar em cima dele
   passa o item; soltar fora não faz nada.
8. **Captcha** — marque todos os carrinhos 🛒 e nada além disso.
9. **Pagamento** — digite `4242` num teclado que reembaralha a cada tecla. Dígito
   errado é recusado na hora.
10. **Cupom** — apareceram taxas. Seu pedido foi cancelado com sucesso.

### Coisas que valem saber

- Você tem **3 minutos de mapa** para comprar (`LIMITE_COMPRA`). O relógio (`#prazo` na
  barra superior) só corre dentro do mapa: pausa no catálogo e com qualquer overlay
  aberto. Quando zera, o caixa vem até você com o que estiver na sacola — se ela estiver
  vazia nesse instante, ganha uma prorrogação automática de 30 s em vez de travar.
- O carrinho parado por 60 segundos é **recolhido por abandono** e esvazia. A contagem
  regressiva aparece no canto superior direito a partir dos 30 segundos. Convive com o
  prazo de 3 minutos — são dois relógios independentes.
- A busca da barra superior destaca a seção em preto no mapa. Aceita uma letra a cada
  800 ms.
- O botão "Finalizar" não finaliza nada. Ele só te lembra de dirigir até PASSAR COMPRAS.
- O botão "Adicionar ao carrinho" do catálogo também não faz o que diz — ver item 2.
- O badge da barra superior conta **linhas** de produto; o HUD conta **unidades**. Os
  dois números discordam de propósito.
- A barra de cookies volta 7 segundos depois de você recusar.
- Bater nas prateleiras e obstáculos empurra o carrinho de volta.

---

## 2. Parâmetros — física do carrinho
`public/js/loja.js`, função `atualizar`

| Parâmetro | Valor | Efeito |
|---|---|---|
| aceleração à frente | `+0.22` por frame | quanto mais alto, mais difícil parar na vaga |
| aceleração de ré | `-0.15` por frame | ré propositalmente mais fraca |
| velocidade máxima | `3.3` / `-1.7` | teto de frente e de ré |
| atrito | `×0.955` por frame | quanto menor, mais o carrinho patina |
| força do esterçamento | `0.0050 × |vel|` | só age acima de `|vel| > 0.14` |
| amortecimento angular | `×0.88` por frame | quanto maior, mais o giro "escorrega" |
| raio de colisão | `19 px` | círculo do carrinho contra retângulos |
| repique da batida | `vel × -0.35` | quanto empurra de volta |

A rodinha empenada e o travamento aleatório da roda **foram removidos**: o foco do
projeto é a má experiência de uso, não a dificuldade motora de pilotar.

## 3. Parâmetros — estacionamento
`public/js/loja.js`, `verificarEstacionamento`

| Parâmetro | Valor |
|---|---|
| velocidade máxima para contar como parado | `0.12` |
| **tempo parado exigido** | `3000 ms` (`TEMPO_PARADO`) |
| tamanho da vaga de prateleira | `140 × 96 px` |
| tamanho da vaga do PASSAR COMPRAS | `160 × 100 px` |
| tamanho da vaga do CATÁLOGO | `160 × 100 px` |

**Não há exigência de ângulo.** Basta estar dentro da vaga e parado. A contagem é
desenhada como um anel com o número de segundos restantes acima do carrinho
(`desenharContagem` em `public/js/loja.js`). Sair da vaga ou voltar a se mover zera a
contagem.

## 4. Parâmetros — limites de tempo
`public/js/loja.js`, `verificarOcio` e `verificarPrazo`

Dois relógios independentes, que convivem:

| Parâmetro | Valor |
|---|---|
| início do aviso de ócio | `30 s` sem input |
| esvaziamento por ócio (`LIMITE_OCIOSO`) | `60 s` sem input |
| prazo de compra (`LIMITE_COMPRA`) | `180 000 ms` (3 min), contado só dentro do mapa |
| prorrogação por sacola vazia (`PRORROGACAO`) | `30 000 ms` |
| início do destaque visual do prazo | `30 s` restantes |

O prazo de compra **pausa** com qualquer overlay aberto e na tela do catálogo — só
acumula enquanto o jogador está dirigindo no mapa. Ao zerar com a sacola vazia, ele
prorroga em vez de travar (abrir o caixa vazio deixaria o leitor sem itens para escanear,
um beco sem saída).

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
| posição inicial do produto na pilha | aleatória em `440 × 262 px` |
| carrinhos no captcha | `2` a `4` de 9 células |
| número do cartão | `4242` (4 dígitos, `CARTAO` em `public/js/caixa.js`) |
| reembaralhamento do teclado | a cada tecla pressionada |
| itens mínimos na sacola para abrir | `1` — sacola vazia recusa com toast |

## 7. Parâmetros — setas do mapa
`public/js/loja.js`, `desenharSetas`

| Parâmetro | Valor |
|---|---|
| frequência da oscilação | `~0,18 Hz` (`Math.sin(agora / 900)`) — nunca pisca |
| deslocamento vertical da oscilação | `± 7 px` |
| margem para considerar o alvo "em quadro" | `120 px` das bordas do canvas |
| pontos do círculo torto | `26`, raio perturbado `× 0,86–1,16`, sorteado uma única vez por alvo |

## 8. Parâmetros — anti-padrões ambientes

| Parâmetro | Valor | Arquivo |
|---|---|---|
| duração do toast | `400 ms` | `public/js/util.js` |
| piscada da oferta (padrão) | `0,5 s` de período = **2 Hz** | `public/css/style.css` |
| piscada da oferta (modo intenso, opt-in) | `0,14 s` = ≈7 Hz | `public/css/style.css` |
| contagem da oferta | reinicia sozinha entre `180` e `900 s` | `public/js/main.js` |
| barra de cookies: primeira aparição | `1500 ms` após carregar | `public/js/main.js` |
| barra de cookies: volta após recusar | `7000 ms` | `public/js/main.js` |
| botão de recusar cookies | `12 × 12 px` | `public/css/style.css` |
| cooldown da busca | `800 ms` por letra | `public/js/main.js` |
| reordenação dos resultados | a cada `1100 ms` com o mouse em cima | `public/js/main.js` |
| troca dos botões do título | a cada `3200 ms` | `public/js/main.js` |
| troca dos botões do painel | a cada `4000 ms` | `public/js/main.js` |
| música de fundo: volume mestre | `0.07` | `public/js/musica.js` |
| música de fundo: fade-in | `3 s` | `public/js/musica.js` |
| música de fundo: andamento | `0,5 s` por tempo = 120 BPM, compasso de 4 tempos | `public/js/musica.js` |
| música de fundo: loop harmônico | 4 compassos (ii-V-I-VI), `8 s` | `public/js/musica.js` |
| música de fundo: densidade da melodia | `38 %` de chance de nota por tempo | `public/js/musica.js` |
| música de fundo: vigia que religa o áudio | a cada `2000 ms` | `public/js/musica.js` |

## 9. Parâmetros — cupom final
`public/js/main.js`, `finalizar`

| Item | Valor |
|---|---|
| taxa de conveniência | `37%` do subtotal |
| frete "grátis" | `R$ 18,50` |

## 10. Mapa e conteúdo
`public/js/dados.js`

| Elemento | Valor |
|---|---|
| tamanho do mundo | `1600 × 1100` |
| viewport do canvas | tela cheia, recalculado no `resize` |
| posição inicial do carrinho | `x 1080, y 980` (`INICIO_CARRINHO`), apontando para cima |
| seções | Roupas, Calçados, Bolsas, Acessórios, Beleza, Casa — 6, com 4 produtos cada |
| disposição | 3 colunas × 2 linhas; CATÁLOGO e PASSAR COMPRAS embaixo, lado a lado |
| bloco CATÁLOGO (vaga de saída) | `x 300, y 850, 320 × 100 px`, vaga `x 380, y 735, 160 × 100 px` |
| bloco CAIXA (PASSAR COMPRAS) | `x 620, y 850, 320 × 100 px`, vaga `x 700, y 735, 160 × 100 px` |
| obstáculos decorativos | 2 |

Os dois blocos de saída se encostam em `x = 620`, sem vão entre eles: o raio de colisão
do carrinho é 19 px, então qualquer folga menor que ~38 px pareceria um corredor sem ser
— o jogador acharia que o jogo travou, o que fere a condição "legível" da seção 1.

---

## 11. Receitas rápidas de balanceamento

**Deixar mais fácil (para demonstração):** `TEMPO_PARADO` `3000 → 1500`, velocidade de
arraste `26 → 40`, `LIMITE_COMPRA` `180000 → 360000`.

**Deixar mais cruel:** `TEMPO_PARADO` `3000 → 6000`, velocidade de arraste `26 → 16`,
abandono `60 s → 30 s`, volta dos cookies `7000 → 3000`, `LIMITE_COMPRA` `180000 → 90000`.

**Encurtar uma sessão de teste:** reduza o cartão para 8 dígitos (`CARTAO` em
`public/js/caixa.js`) e `LIMITE_COMPRA` para `60000` — mas devolva os dois antes de
commitar.
