/* estado.js - estado do jogo e render do painel lateral */

var Estado = {
  carrinho: [],
  destaque: null,      // id da prateleira destacada pela busca ou pelo catalogo
  escolhido: null,     // { id, nome, emoji, prateleiraId } marcado no catalogo
  tempoMapa: 0,        // ms acumulados dentro do mapa (prazo de compra)
  jogoAtivo: false
};

function iniciarEstado() {
  Estado.carrinho = [];
  Estado.destaque = null;
  Estado.escolhido = null;
  Estado.tempoMapa = 0;
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

function sacolaTemItem() {
  return Estado.carrinho.length > 0;
}

/* "O item escolhido no catalogo ja foi pego?" e derivado, nunca guardado num
   booleano. Assim esvaziar a sacola, o recolhimento por ocio e escolher de novo
   um produto que ja esta na sacola acertam sozinhos, sem caso especial. */
function escolhidoNaSacola() {
  return !!Estado.escolhido && qtdNoCarrinho(Estado.escolhido.id) > 0;
}

/* Descritores das setas do mapa. O estado decide O QUE apontar; o loja.js decide
   COMO desenhar. Sem isso o desenho precisaria conhecer a regra do catalogo. */
function setasAtivas() {
  var fora = [];
  if (!Estado.escolhido) return fora;

  if (!escolhidoNaSacola()) {
    var p = prateleiraDe(Estado.escolhido.prateleiraId);
    if (p) {
      fora.push({
        chave: 'alvo:' + p.id,
        alvo: p,
        legenda: 'O ' + Estado.escolhido.nome.toUpperCase() + ' TA AQUI!!!'
      });
    }
    return fora;
  }

  fora.push({ chave: 'saida:catalogo', alvo: CATALOGO, legenda: 'VOLTAR PRO CATALOGO' });
  fora.push({ chave: 'saida:caixa', alvo: CAIXA, legenda: 'PAGAR AQUI' });
  return fora;
}

function renderPainel() {
  var alvo = $('#alvo-atual');
  if (alvo) {
    if (!Estado.escolhido) {
      alvo.textContent = 'nenhum';
      alvo.className = 'hud-alvo vazio';
    } else if (escolhidoNaSacola()) {
      alvo.textContent = Estado.escolhido.emoji + ' ' + Estado.escolhido.nome + ' (ja pegou)';
      alvo.className = 'hud-alvo ok';
    } else {
      alvo.textContent = Estado.escolhido.emoji + ' ' + Estado.escolhido.nome;
      alvo.className = 'hud-alvo';
    }
  }

  var ulCar = $('#lista-carrinho');
  ulCar.innerHTML = '';
  if (!Estado.carrinho.length) {
    var vazio = document.createElement('li');
    vazio.className = 'vazio';
    vazio.textContent = 'vazia';
    ulCar.appendChild(vazio);
  } else {
    Estado.carrinho.forEach(function (l) {
      var li = document.createElement('li');
      li.textContent = l.emoji + ' ' + l.nome + ' x' + l.qtd + '  ' + moeda(l.preco * l.qtd);
      ulCar.appendChild(li);
    });
  }

  var unidades = Estado.carrinho.reduce(function (s, l) { return s + l.qtd; }, 0);
  $('#contador-carrinho').textContent = '(' + unidades + ')';
  $('#total-carrinho').textContent = moeda(totalCarrinho());

  // WCAG 3.2.4 Consistent Identification (AA): o badge do header conta linhas,
  // nao unidades, entao mostra um numero diferente do painel para o mesmo carrinho.
  var badge = $('#badge-carrinho');
  if (badge) badge.textContent = Estado.carrinho.length;
}
