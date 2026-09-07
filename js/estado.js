/* estado.js - estado do jogo e render do painel lateral */

var Estado = {
  lista: [],
  carrinho: [],
  destaque: null,      // id da prateleira destacada pela busca
  jogoAtivo: false
};

function iniciarEstado() {
  Estado.lista = sortearLista();
  Estado.carrinho = [];
  Estado.destaque = null;
  renderPainel();
}

function adicionarAoCarrinho(produto, qtd) {
  var linha = null;
  Estado.carrinho.forEach(function (l) { if (l.id === produto.id) linha = l; });
  if (linha) {
    linha.qtd += qtd;
  } else {
    Estado.carrinho.push({
      id: produto.id, nome: produto.nome, emoji: produto.emoji,
      preco: produto.preco, qtd: qtd
    });
  }
  renderPainel();
}

function limparCarrinho() {
  Estado.carrinho = [];
  renderPainel();
}

function totalCarrinho() {
  return Estado.carrinho.reduce(function (s, l) { return s + l.preco * l.qtd; }, 0);
}

function qtdNoCarrinho(id) {
  var q = 0;
  Estado.carrinho.forEach(function (l) { if (l.id === id) q = l.qtd; });
  return q;
}

function listaCompleta() {
  return Estado.lista.every(function (item) { return qtdNoCarrinho(item.id) >= item.qtd; });
}

function itensFaltando() {
  return Estado.lista.filter(function (item) { return qtdNoCarrinho(item.id) < item.qtd; });
}

function renderPainel() {
  var ulLista = $('#lista-compras');
  ulLista.innerHTML = '';
  Estado.lista.forEach(function (item) {
    var li = document.createElement('li');
    var tem = qtdNoCarrinho(item.id);
    li.textContent = item.emoji + ' ' + item.nome + ' x' + item.qtd + ' (' + tem + '/' + item.qtd + ')';
    if (tem >= item.qtd) li.className = 'ok';
    ulLista.appendChild(li);
  });

  var ulCar = $('#lista-carrinho');
  ulCar.innerHTML = '';
  if (!Estado.carrinho.length) {
    var vazio = document.createElement('li');
    vazio.className = 'vazio';
    vazio.textContent = 'vazio, igual sua geladeira';
    ulCar.appendChild(vazio);
  } else {
    Estado.carrinho.forEach(function (l) {
      var li = document.createElement('li');
      li.textContent = l.emoji + ' ' + l.nome + ' x' + l.qtd + '  ' + moeda(l.preco * l.qtd);
      ulCar.appendChild(li);
    });
  }

  $('#contador-carrinho').textContent = '(' + Estado.carrinho.reduce(function (s, l) { return s + l.qtd; }, 0) + ')';
  $('#total-carrinho').textContent = moeda(totalCarrinho());
}
