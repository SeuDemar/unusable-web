/* dados.js - mapa da loja, prateleiras e catalogo */

var MUNDO = { w: 1800, h: 1100 };

var PRATELEIRAS = [
  {
    id: 'hortifruti',
    nome: 'Hortifruti (meio murcho)',
    cor: '#7cb342',
    x: 140, y: 130, w: 430, h: 70,
    vaga: { x: 250, y: 225, w: 130, h: 84, ang: -90 },
    produtos: [
      { id: 'banana', nome: 'Banana', emoji: '🍌', preco: 6.49 },
      { id: 'tomate', nome: 'Tomate', emoji: '🍅', preco: 9.9 },
      { id: 'brocolis', nome: 'Brocolis', emoji: '🥦', preco: 7.35 },
      { id: 'abacate', nome: 'Abacate', emoji: '🥑', preco: 12.0 }
    ]
  },
  {
    id: 'padaria',
    nome: 'Padaria & Cia',
    cor: '#c68642',
    x: 1180, y: 150, w: 70, h: 400,
    vaga: { x: 1060, y: 300, w: 84, h: 130, ang: 0 },
    produtos: [
      { id: 'pao', nome: 'Pao frances', emoji: '🥖', preco: 14.9 },
      { id: 'bolo', nome: 'Bolo de fuba', emoji: '🍰', preco: 24.5 },
      { id: 'croissant', nome: 'Croissant', emoji: '🥐', preco: 11.2 },
      { id: 'queijo', nome: 'Queijo', emoji: '🧀', preco: 38.9 }
    ]
  },
  {
    id: 'bebidas',
    nome: 'Bebidas geladas (quentes)',
    cor: '#0288d1',
    x: 300, y: 720, w: 500, h: 70,
    vaga: { x: 480, y: 620, w: 130, h: 84, ang: 90 },
    produtos: [
      { id: 'refri', nome: 'Refrigerante', emoji: '🥤', preco: 8.99 },
      { id: 'cafe', nome: 'Cafe', emoji: '☕', preco: 19.9 },
      { id: 'suco', nome: 'Suco de uva', emoji: '🧃', preco: 13.4 },
      { id: 'cerveja', nome: 'Cerveja', emoji: '🍺', preco: 5.75 }
    ]
  },
  {
    id: 'limpeza',
    nome: 'Limpeza e afins',
    cor: '#8e24aa',
    x: 1250, y: 780, w: 400, h: 70,
    vaga: { x: 1400, y: 680, w: 130, h: 84, ang: 90 },
    produtos: [
      { id: 'sabao', nome: 'Sabao em po', emoji: '🧼', preco: 27.9 },
      { id: 'papel', nome: 'Papel higienico', emoji: '🧻', preco: 32.4 },
      { id: 'esponja', nome: 'Esponja', emoji: '🧽', preco: 4.2 },
      { id: 'vassoura', nome: 'Vassoura', emoji: '🧹', preco: 21.0 }
    ]
  }
];

var CAIXA = {
  x: 790, y: 420, w: 210, h: 120,
  vaga: { x: 845, y: 570, w: 130, h: 84, ang: -90 }
};

/* obstaculos decorativos que existem so pra voce bater neles */
var OBSTACULOS = [
  { x: 700, y: 210, w: 70, h: 70, rotulo: '🥫' },
  { x: 1010, y: 880, w: 90, h: 60, rotulo: '📦' },
  { x: 380, y: 460, w: 70, h: 70, rotulo: '🧺' },
  { x: 1480, y: 380, w: 60, h: 90, rotulo: '🪣' },
  { x: 180, y: 900, w: 110, h: 60, rotulo: '🛒' }
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

/* Sorteia 3 itens de prateleiras diferentes. */
function sortearLista() {
  var prats = embaralhar(PRATELEIRAS).slice(0, 3);
  return prats.map(function (p) {
    var prod = escolha(p.produtos);
    return { id: prod.id, nome: prod.nome, emoji: prod.emoji, qtd: inteiro(1, 3) };
  });
}
