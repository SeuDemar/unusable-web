/* dados.js - mapa do armazem, secoes e catalogo

   Layout do mundo: 3 colunas x 2 linhas de prateleiras, com o CHECKOUT
   embaixo, perto de onde o carrinho comeca. */

var MUNDO = { w: 1600, h: 1100 };

/* precoDe = preco "original" riscado, preco = preco cobrado.
   O desconto e fabricado: precoDe nunca foi cobrado de ninguem. */
var PRATELEIRAS = [
  {
    id: 'roupas', nome: 'ROUPAS', cor: '#2e2e2e',
    x: 170, y: 140, w: 260, h: 90,
    vaga: { x: 230, y: 250, w: 140, h: 96 },
    produtos: [
      { id: 'vestido', nome: 'Vestido', emoji: '👗', preco: 79.9, precoDe: 249.9 },
      { id: 'camiseta', nome: 'Camiseta', emoji: '👕', preco: 29.9, precoDe: 119.9 },
      { id: 'calca', nome: 'Calca', emoji: '👖', preco: 89.9, precoDe: 279.9 },
      { id: 'jaqueta', nome: 'Jaqueta', emoji: '🧥', preco: 149.9, precoDe: 599.9 }
    ]
  },
  {
    id: 'calcados', nome: 'CALCADOS', cor: '#3d3d3d',
    x: 170, y: 470, w: 260, h: 90,
    vaga: { x: 230, y: 580, w: 140, h: 96 },
    produtos: [
      { id: 'tenis', nome: 'Tenis', emoji: '👟', preco: 129.9, precoDe: 459.9 },
      { id: 'salto', nome: 'Salto', emoji: '👠', preco: 99.9, precoDe: 349.9 },
      { id: 'bota', nome: 'Bota', emoji: '🥾', preco: 179.9, precoDe: 649.9 },
      { id: 'chinelo', nome: 'Chinelo', emoji: '🩴', preco: 19.9, precoDe: 89.9 }
    ]
  },
  {
    id: 'bolsas', nome: 'BOLSAS', cor: '#4c4c4c',
    x: 670, y: 140, w: 260, h: 90,
    vaga: { x: 730, y: 250, w: 140, h: 96 },
    produtos: [
      { id: 'bolsa', nome: 'Bolsa', emoji: '👜', preco: 119.9, precoDe: 449.9 },
      { id: 'mochila', nome: 'Mochila', emoji: '🎒', preco: 99.9, precoDe: 319.9 },
      { id: 'carteira', nome: 'Carteira', emoji: '👝', preco: 49.9, precoDe: 199.9 },
      { id: 'mala', nome: 'Mala', emoji: '🧳', preco: 299.9, precoDe: 999.9 }
    ]
  },
  {
    id: 'acessorios', nome: 'ACESSORIOS', cor: '#5b5b5b',
    x: 670, y: 470, w: 260, h: 90,
    vaga: { x: 730, y: 580, w: 140, h: 96 },
    produtos: [
      { id: 'oculos', nome: 'Oculos', emoji: '🕶️', preco: 39.9, precoDe: 189.9 },
      { id: 'anel', nome: 'Anel', emoji: '💍', preco: 19.9, precoDe: 149.9 },
      { id: 'relogio', nome: 'Relogio', emoji: '⌚', preco: 199.9, precoDe: 799.9 },
      { id: 'cachecol', nome: 'Cachecol', emoji: '🧣', preco: 34.9, precoDe: 139.9 }
    ]
  },
  {
    id: 'beleza', nome: 'BELEZA', cor: '#6a6a6a',
    x: 1170, y: 140, w: 260, h: 90,
    vaga: { x: 1230, y: 250, w: 140, h: 96 },
    produtos: [
      { id: 'batom', nome: 'Batom', emoji: '💄', preco: 24.9, precoDe: 99.9 },
      { id: 'esmalte', nome: 'Esmalte', emoji: '💅', preco: 12.9, precoDe: 59.9 },
      { id: 'serum', nome: 'Serum', emoji: '🧴', preco: 59.9, precoDe: 229.9 },
      { id: 'espelho', nome: 'Espelho', emoji: '🪞', preco: 17.9, precoDe: 79.9 }
    ]
  },
  {
    id: 'casa', nome: 'CASA', cor: '#797979',
    x: 1170, y: 470, w: 260, h: 90,
    vaga: { x: 1230, y: 580, w: 140, h: 96 },
    produtos: [
      { id: 'vela', nome: 'Vela', emoji: '🕯️', preco: 34.9, precoDe: 139.9 },
      { id: 'almofada', nome: 'Almofada', emoji: '🛋️', preco: 49.9, precoDe: 199.9 },
      { id: 'quadro', nome: 'Quadro', emoji: '🖼️', preco: 69.9, precoDe: 259.9 },
      { id: 'planta', nome: 'Planta', emoji: '🪴', preco: 44.9, precoDe: 179.9 }
    ]
  }
];

/* O CHECKOUT fica logo no comeco, perto de onde o carrinho nasce. */
/* As duas saidas do mapa ficam lado a lado, na mesma faixa de y, e os corpos se
   encostam em x=620. Nao deixe vao entre eles: o raio de colisao do carrinho e 19,
   entao qualquer folga menor que ~38px parece corredor e nao e - o jogador acha
   que o jogo bugou, e isso nao e friccao engracada. */
var CATALOGO = {
  x: 300, y: 850, w: 320, h: 100,
  vaga: { x: 380, y: 735, w: 160, h: 100 }
};

var CAIXA = {
  x: 620, y: 850, w: 320, h: 100,
  vaga: { x: 700, y: 735, w: 160, h: 100 }
};

var INICIO_CARRINHO = { x: 1080, y: 980 };

var OBSTACULOS = [
  { x: 500, y: 320, w: 60, h: 60, rotulo: '📦' },
  { x: 1000, y: 660, w: 60, h: 60, rotulo: '📦' }
];

function todosProdutos() {
  var fora = [];
  PRATELEIRAS.forEach(function (p) {
    p.produtos.forEach(function (prod) {
      fora.push({ produto: prod, prateleira: p });
    });
  });
  return fora;
}

function acharProduto(id) {
  var achado = null;
  todosProdutos().forEach(function (par) {
    if (par.produto.id === id) achado = par;
  });
  return achado;
}

/* Prateleira pelo id. O catalogo guarda so o id no Estado.escolhido. */
function prateleiraDe(id) {
  var achada = null;
  PRATELEIRAS.forEach(function (p) { if (p.id === id) achada = p; });
  return achada;
}
