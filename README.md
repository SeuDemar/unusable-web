# TRENDIX

Uma loja de moda online com a pior UI e UX possíveis — de propósito.

É um jogo de navegador onde comprar três peças vira uma provação: você **dirige** um
carrinho com a rodinha empenada pelo armazém, **estaciona** na vaga de cada seção,
**arrasta** os produtos até a sacola sem deixar cair, e depois enfrenta fila, leitor de
código de barras, captcha e um teclado numérico que se reembaralha a cada tecla. No fim,
uma taxa de conveniência de 37% aparece do nada.

Tudo funciona. Tudo é terminável. Nada é agradável.

O projeto também é um exercício de acessibilidade às avessas: **27 critérios da WCAG 2.2
são violados deliberadamente**, catalogados em [`docs/WCAG.md`](docs/WCAG.md) com o que a
norma exige, como o app descumpre e como seria a versão conforme.

## Como rodar

Abra `public/index.html` no navegador. É isso.

Sem build, sem `npm install`, sem servidor — HTML, CSS e JavaScript puros, escritos para
funcionar em `file://`. A página carrega já jogável, sem tela de início.

## Controles

| Tecla | Efeito |
|---|---|
| `W` / `↑` | acelera |
| `S` / `↓` | ré |
| `A` / `←` | vira para a **direita** |
| `D` / `→` | vira para a **esquerda** |
| roda do mouse | gira o produto no leitor do checkout |

Sim, `A` e `D` estão invertidos. Não, não é bug. O botão **? Instruções**, no menu
lateral, explica o resto — é o único componente honesto do app.

## Estrutura

```
public/              o site publicado — só isto vai pro ar
  index.html         casca de e-commerce, telas e overlays
  css/style.css      o visual, deliberadamente feio
  js/                sete módulos vanilla, carregados em ordem
wrangler.jsonc       config de deploy na Cloudflare
AGENTS.md            regras para agentes de IA que forem mexer no projeto
docs/                documentação do projeto
.claude/docs/        contexto e arquitetura para sessões de Claude Code
```

Tudo que estiver dentro de `public/` fica público na web. Documentação e configuração
ficam de fora de propósito.

## Documentação

| Documento | Para quê |
|---|---|
| [`AGENTS.md`](AGENTS.md) | regras, restrições e convenções para quem (ou o que) for editar |
| [`docs/WCAG.md`](docs/WCAG.md) | os 27 critérios violados: norma, violação, versão conforme |
| [`docs/DESIGN.md`](docs/DESIGN.md) | o manifesto da má UX: taxonomia dos anti-padrões e o que é proibido |
| [`docs/GAMEPLAY.md`](docs/GAMEPLAY.md) | manual do jogador e tabela de todos os parâmetros de balanceamento |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | ideias levantadas e ainda não implementadas |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | como publicar na Cloudflare (Workers ou Pages) |
| [`.claude/docs/CONTEXTO.md`](.claude/docs/CONTEXTO.md) | por que o projeto existe, decisões tomadas, estado atual |
| [`.claude/docs/ARQUITETURA.md`](.claude/docs/ARQUITETURA.md) | mapa do código, fluxo de chamadas, limites conhecidos |

## Avisos

Nenhum dado real é coletado. O campo de pagamento aceita apenas o número de teste
`4242 4242 4242 4242`, que está impresso na própria tela. TRENDIX é uma marca fictícia.
Isto é uma piada jogável, não uma loja.

O banner promocional pisca a 2 Hz, abaixo do limiar da WCAG. Existe um botão de **modo
intenso** que aumenta a frequência acima de 3 Hz: ele vem desligado, avisa sobre risco
para epilepsia fotossensível e exige confirmação. Não o ative automaticamente em
nenhuma circunstância.
