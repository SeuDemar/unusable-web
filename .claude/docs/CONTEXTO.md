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
   (busca, quantidade, passar compras) foi construído em cima dessa premissa.
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
| Tema de e-commerce genérico, não supermercado | Pedido do autor. Dá mais superfície para padrões obscuros de loja online. |
| Paleta preto, cinza e branco | Pedido do autor. Minimalismo frio, que por acaso é onde moram as falhas reais de acessibilidade: cinza sobre branco, foco invisível, alvos pequenos. |
| Mapa em tela cheia, sem menu lateral nem rodapé | Pedido do autor: "basta apenas o mapa em tela cheia". O que o jogador precisa saber ficou num HUD compacto sobre o mapa. |
| Estacionar por tempo, não por ângulo | Pedido do autor. Três segundos parado na vaga, com contagem em cima do carrinho. |
| Sem rodinha empenada e sem trava de roda | Pedido do autor. O foco é a má experiência de uso, não a dificuldade motora de pilotar. |
| Sem tela de título | Pedido do autor. A página carrega já jogável; as instruções foram para um botão na barra superior. |
| Barra superior enxuta + barra de cookies | Restaram como superfície mínima para as violações de WCAG que precisam de cromo de site: busca, oferta piscante, badge e o par aceitar/recusar. |
| Violar WCAG 2.2 e documentar | Segundo objetivo do projeto, com peso igual ao humor. Mínimo pedido: 13 critérios. Entregue: 28 catalogados, 20 implementados. |
| Instruções honestas | Único componente acessível. Serve de régua para as violações e mantém o jogo compreensível. |

## 3. Princípio de design que guia tudo

**Toda fricção precisa ser engraçada, superável e legível.** Essa é a regra que
diferencia "má UX de brincadeira" de "software quebrado". Detalhada em `docs/DESIGN.md`.

Corolário prático: o jogo nunca deve ter beco sem saída. Se o jogador errar o captcha,
ele gera outro. Se o produto cair no chão, o repositor devolve. Se o carrinho for
recolhido por abandono, dá para reencher. Nada é permanente exceto terminar a compra.

**O limite que não se cruza:** piscar acima de 3 Hz sem consentimento explícito. Todas
as outras violações causam frustração; essa causa convulsão. O aviso de oferta pisca a 2 Hz por
padrão e a versão acima do limiar só existe atrás de um opt-in com aviso e confirmação.

## 4. Estado atual (última sessão: 2026-09-08)

**Completo e jogável do início ao fim.** Implementado:

1. **Sem tela de título.** `Jogo.iniciar()` chama `comecar()` no `DOMContentLoaded`, e
   `comecar()` abre o painel de instruções — o jogo nasce pausado atrás dele.
2. **Mapa em tela cheia.** Canvas dimensionado pela janela, recalculado no `resize`.
   Sem menu lateral, sem banner grande, sem rodapé, sem minimapa.
3. **Seis prateleiras em 3 colunas de 2** — Roupas, Calçados, Bolsas, Acessórios,
   Beleza, Casa — com o **PASSAR COMPRAS** embaixo, perto de onde o carrinho nasce.
4. **Paleta preto, cinza e branco.** Fonte de sistema, bordas de 1px, nenhuma matiz. A
   única cor da tela vem dos emoji dos produtos.
5. **Barra superior enxuta:** logo, busca com cooldown, aviso de oferta piscante com
   contagem que reinicia, cronômetro de abandono, badge da sacola e botão de instruções.
6. **HUD compacto sobre o mapa** com lista, sacola, total e dois botões que trocam de
   lugar a cada 4 segundos.
7. **Barra de cookies** que aparece 1,5 s após carregar e **volta 7 segundos depois de
   ser recusada**. O `x` de recusar tem 12×12 px contra um `ACEITAR TUDO` enorme.
8. Física do carrinho: direção invertida e inércia. **Sem rodinha empenada e sem trava
   de roda** — removidas a pedido do autor.
9. **Estacionar é ficar 3 segundos parado na vaga**, com anel de contagem desenhado em
   cima do carrinho. Sem exigência de ângulo.
10. Overlay de seção: arrastar produto com "gravidade", preço riscado fabricado.
11. Modal de quantidade com botão `+` que foge depois de 5 cliques.
12. Passar compras: leitor por arrasto do próprio produto, captcha,
    teclado que reembaralha a cada tecla, **keyboard trap intencional**.
13. Cupom final com taxa de conveniência de 37% e frete "grátis" de R$ 18,50.
14. **Painel de instruções honesto**, que pausa o jogo ao abrir.
15. **28 critérios da WCAG 2.2 catalogados em `docs/WCAG.md`**, 20 implementados, com
    tabela ligando cada critério à funcionalidade que o fere.

**Publicado na Cloudflare** a partir do repositório `SeuDemar/unusable-web`, branch
`main`, com deploy automático a cada push. Só `public/` vai ao ar.

**Não existe ainda:** áudio, sistema de pontuação, tempo total da compra, responsividade
mobile, persistência, testes automatizados.

## 5. O que não é óbvio olhando o código

- **Os controles A/D estão invertidos de propósito.** Em `public/js/loja.js`, a variável se
  chama `viraDireita` e é alimentada pela tecla `a`. Isso é a intenção, não um bug de
  nomenclatura. Está comentado no arquivo — não "corrija".
- **`paradoDesde` acumula milissegundos**, não é um instante. Zera ao sair da vaga ou ao
  voltar a se mover, e dispara a abertura ao chegar em `TEMPO_PARADO` (3000).
- **A paleta monocromática não é só estética.** Cinza-claro sobre branco é a falha de
  contraste mais comum do minimalismo real, e é a violação de WCAG 1.4.3 do projeto. Se
  alguém "melhorar" o contraste, quebra a documentação.
- **O botão "Ir pro caixa" não leva ao caixa.** É um troll deliberado: ele só avisa que
  você precisa dirigir até lá. Manter.
- **O leitor não tem mais alinhamento.** A versão antiga exigia girar um código de
  barras com a roda do mouse até ficar reto (±12°). Saiu a pedido do autor: cobrava uma
  segunda exigência motora em cima do arrasto que a prateleira já cobra. Hoje o card
  mostra o próprio produto e basta arrastá-lo até o leitor.
- **A fila do caixa também saiu.** Eram ~18 s de barra de progresso com um botão "Pular
  a fila" que voltava 15%. A piada não se sustentava por segundo; o overlay do caixa
  agora abre direto no leitor.
- **O captcha exige seleção exata**, incluindo não marcar distratores. Errar regenera a
  grade inteira, então nunca fica impossível.
- **O pagamento valida dígito a dígito.** Um dígito errado é recusado na hora em vez de
  deixar você digitar 16 e falhar no fim — essa foi uma escolha consciente de
  "cruel, mas não desumano".

- **Vários "erros" no HTML e no CSS são deliberados e documentados.** `lang="en"` numa
  página em português, `*:focus { outline: none }`, `tabindex` positivos fora de ordem,
  `user-scalable=no`, contraste abaixo de 4.5:1 e `<div>` com `onclick` no lugar de
  `<button>`. Todos têm comentário no código apontando o critério WCAG e entrada em
  `docs/WCAG.md`. Um linter vai reclamar de todos eles; ignore.
- **O keyboard trap do pagamento tem contrapartida.** `prenderFoco` é registrado em
  `montarPagamento` e removido por `soltarFoco()` ao completar os 16 dígitos. Qualquer
  caminho novo de saída do pagamento precisa chamar `soltarFoco()`, senão o trap escapa
  para a página inteira.
- **O badge do header e o painel mostram números diferentes de propósito** — linhas
  contra unidades. É a violação de 3.2.4, não um bug de contagem.
- **`precoDe` nunca foi cobrado de ninguém.** O desconto é fabricado, na linha do que
  fast fashion faz de verdade. É piada e anti-padrão ao mesmo tempo.
- **A barra de cookies não usa a classe `.overlay`** de propósito: ela atrapalha a tela
  sem congelar a física. Todos os outros overlays pausam o jogo.
- **`Estado.destaque` sobrou da busca** e continua sendo o único caminho para realçar uma
  seção no mapa, agora que o menu de categorias foi removido.

## 6. Onde o projeto pode ir (não decidido, apenas levantado)

Ideias discutidas mas ainda não implementadas estão em `docs/ROADMAP.md`. Nenhuma delas
foi aprovada pelo autor; trate como cardápio, não como backlog comprometido.

## 7. Como retomar rápido numa sessão nova

1. Ler `AGENTS.md` (regras) e este arquivo (contexto).
2. Abrir `public/index.html` no navegador e jogar dois minutos. O jogo se explica jogando, e
   a sensação das tolerâncias é impossível de avaliar lendo números.
3. Consultar `docs/GAMEPLAY.md` para a tabela de parâmetros antes de balancear qualquer
   coisa.
4. `node --check public/js/*.js` depois de editar, e jogar o trecho afetado antes de concluir.
