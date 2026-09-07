# SuperMercado Kaos 3000

Um carrinho de compras com a pior UI e UX possíveis — de propósito.

É um jogo de navegador onde comprar três itens vira uma provação: você **dirige** um
carrinho de supermercado com a rodinha empenada, **estaciona** na vaga de cada
prateleira, **arrasta** os produtos até a cesta sem deixar cair, e depois enfrenta fila,
leitor de código de barras, captcha e um teclado numérico que se reembaralha a cada
tecla. No fim, uma taxa de conveniência de 37% aparece do nada.

Tudo funciona. Tudo é terminável. Nada é agradável.

## Como rodar

Abra `index.html` no navegador. É isso.

Sem build, sem `npm install`, sem servidor — HTML, CSS e JavaScript puros, escritos para
funcionar em `file://`.

## Controles

| Tecla | Efeito |
|---|---|
| `W` / `↑` | acelera |
| `S` / `↓` | ré |
| `A` / `←` | vira para a **direita** |
| `D` / `→` | vira para a **esquerda** |
| roda do mouse | gira o produto no leitor do caixa |

Sim, `A` e `D` estão invertidos. Não, não é bug.

## Estrutura

```
index.html            todas as telas e overlays
css/style.css         o visual, deliberadamente feio
js/                   sete módulos vanilla, carregados em ordem
AGENTS.md             regras para agentes de IA que forem mexer no projeto
docs/                 documentação do projeto
.claude/docs/         contexto e arquitetura para sessões de Claude Code
```

## Documentação

| Documento | Para quê |
|---|---|
| [`AGENTS.md`](AGENTS.md) | regras, restrições e convenções para quem (ou o que) for editar |
| [`docs/DESIGN.md`](docs/DESIGN.md) | o manifesto da má UX: taxonomia dos anti-padrões e o que é proibido |
| [`docs/GAMEPLAY.md`](docs/GAMEPLAY.md) | manual do jogador e tabela de todos os parâmetros de balanceamento |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | ideias levantadas e ainda não implementadas |
| [`.claude/docs/CONTEXTO.md`](.claude/docs/CONTEXTO.md) | por que o projeto existe, decisões tomadas, estado atual |
| [`.claude/docs/ARQUITETURA.md`](.claude/docs/ARQUITETURA.md) | mapa do código, fluxo de chamadas, limites conhecidos |

## Aviso

Nenhum dado real é coletado. O campo de pagamento aceita apenas o número de teste
`4242 4242 4242 4242`, que está impresso na própria tela. Isto é uma piada jogável, não
uma loja.
