/* dados.js - mapa do armazem, secoes e catalogo */

var MUNDO = { w: 1800, h: 1100 };

/* precoDe = preco "original" riscado, preco = preco "promocional".
   O desconto e fabricado: precoDe nunca foi cobrado de ninguem. */
var PRATELEIRAS = [
  {
    id: 'roupas',
    nome: 'Roupas',
    cor: '#e91e63',
    x: 140, y: 130, w: 430, h: 70,
    vaga: { x: 250, y: 225, w: 130, h: 84, ang: -90 },
    produtos: [
      { id: 'vestido', nome: 'Vestido midi', emoji: '👗', preco: 79.9, precoDe: 249.9 },
      { id: 'cropped', nome: 'Cropped', emoji: '👕', preco: 29.9, precoDe: 119.9 },
      { id: 'calca', nome: 'Calca wide', emoji: '👖', preco: 89.9, precoDe: 279.9 },
      { id: 'jaqueta', nome: 'Jaqueta', emoji: '🧥', preco: 149.9, precoDe: 599.9 }
    ]
  },
  {
    id: 'acessorios',
    nome: 'Bolsas e Acessorios',
    cor: '#8e24aa',
    x: 1180, y: 150, w: 70, h: 400,
    vaga: { x: 1060, y: 300, w: 84, h: 130, ang: 0 },
    produtos: [
      { id: 'bolsa', nome: 'Bolsa tote', emoji: '👜', preco: 119.9, precoDe: 449.9 },
      { id: 'mochila', nome: 'Mochila', emoji: '🎒', preco: 99.9, precoDe: 319.9 },
      { id: 'oculos', nome: 'Oculos de sol', emoji: '🕶️', preco: 39.9, precoDe: 189.9 },
      { id: 'anel', nome: 'Anel banhado', emoji: '💍', preco: 19.9, precoDe: 149.9 }
    ]
  },
  {
    id: 'beleza',
    nome: 'Beleza',
    cor: '#ff4081',
    x: 300, y: 720, w: 500, h: 70,
    vaga: { x: 480, y: 620, w: 130, h: 84, ang: 90 },
    produtos: [
      { id: 'batom', nome: 'Batom matte', emoji: '💄', preco: 24.9, precoDe: 99.9 },
      { id: 'esmalte', nome: 'Esmalte', emoji: '💅', preco: 12.9, precoDe: 59.9 },
      { id: 'serum', nome: 'Serum facial', emoji: '🧴', preco: 59.9, precoDe: 229.9 },
      { id: 'espelho', nome: 'Espelho de bolsa', emoji: '🪞', preco: 17.9, precoDe: 79.9 }
    ]
  },
  {
    id: 'casa',
    nome: 'Casa e Decor',
    cor: '#5e35b1',
    x: 1250, y: 780, w: 400, h: 70,
    vaga: { x: 1400, y: 680, w: 130, h: 84, ang: 90 },
    produtos: [
      { id: 'vela', nome: 'Vela aromatica', emoji: '🕯️', preco: 34.9, precoDe: 139.9 },
      { id: 'almofada', nome: 'Almofada', emoji: '🛋️', preco: 49.9, precoDe: 199.9 },
      { id: 'quadro', nome: 'Quadro decorativo', emoji: '🖼️', preco: 69.9, precoDe: 259.9 },
      { id: 'planta', nome: 'Planta falsa', emoji: '🪴', preco: 44.9, precoDe: 179.9 }
    ]
  }
];

var CAIXA = {
  x: 790, y: 420, w: 210, h: 120,
  vaga: { x: 845, y: 570, w: 130, h: 84, ang: -90 }
};

/* obstaculos decorativos que existem so pra voce bater neles */
var OBSTACULOS = [
  { x: 700, y: 210, w: 70, h: 70, rotulo: '📦' },
  { x: 1010, y: 880, w: 90, h: 60, rotulo: '🪵' },
  { x: 380, y: 460, w: 70, h: 70, rotulo: '🧍' },
  { x: 1480, y: 380, w: 60, h: 90, rotulo: '📦' },
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

/* Sorteia 3 itens de secoes diferentes. */
function sortearLista() {
  var prats = embaralhar(PRATELEIRAS).slice(0, 3);
  return prats.map(function (p) {
    var prod = escolha(p.produtos);
    return { id: prod.id, nome: prod.nome, emoji: prod.emoji, qtd: inteiro(1, 3) };
  });
}
