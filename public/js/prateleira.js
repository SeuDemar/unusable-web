/* prateleira.js - arrastar produtos com fisica ruim + modal de quantidade */

var Prateleira = (function () {

  var prateleiraAtual = null;
  var arrastando = null;
  var pendente = null;      // produto aguardando quantidade
  var cliquesMais = 0;
  var qtdAtual = 0;

  var VELOCIDADE_MAX = 26;  // px por evento; acima disso o produto escorrega

  function iniciar() {
    $('[data-acao="fechar-prateleira"]').addEventListener('click', fechar);
    $('[data-acao="confirmar-qtd"]').addEventListener('click', confirmarQtd);
    $('[data-acao="cancelar-qtd"]').addEventListener('click', cancelarQtd);
    $('#btn-mais').addEventListener('click', clicarMais);
  }

  function abrir(prateleira) {
    prateleiraAtual = prateleira;
    $('#prateleira-titulo').textContent = prateleira.nome;
    montarProdutos();
    limparCesta();
    abrirOverlay('#overlay-prateleira');
  }

  function fechar() {
    fecharOverlay('#overlay-prateleira');
    Loja.zerarOcio();
  }

  function montarProdutos() {
    var caixa = $('#prateleira-itens');
    caixa.innerHTML = '';
    prateleiraAtual.produtos.forEach(function (prod, i) {
      var el = document.createElement('div');
      el.className = 'produto';
      // WCAG 1.1.1 Non-text Content (A): o emoji e a unica identidade visual
      // do produto e nao tem alternativa textual associada.
      el.innerHTML =
        '<span class="emoji">' + prod.emoji + '</span>' +
        '<span class="nome">' + prod.nome + '</span>' +
        '<span class="preco-de">' + moeda(prod.precoDe) + '</span>' +
        '<span class="preco">' + moeda(prod.preco) + '</span>';
      var col = i % 2, lin = Math.floor(i / 2);
      var esq = 40 + col * 190 + inteiro(-10, 10);
      var topo = 8 + lin * 104;
      el.style.left = esq + 'px';
      el.style.top = topo + 'px';
      el.dataset.casaEsq = esq;
      el.dataset.casaTopo = topo;
      el.dataset.id = prod.id;
      el.addEventListener('pointerdown', comecarArraste);
      caixa.appendChild(el);
    });
  }

  function limparCesta() {
    $$('.chip-cesta', $('#cesta')).forEach(function (c) { c.remove(); });
    Estado.carrinho.forEach(function (l) { chipNaCesta(l.emoji, l.qtd); });
  }

  function chipNaCesta(emoji, qtd) {
    var cesta = $('#cesta');
    var n = $$('.chip-cesta', cesta).length;
    var chip = document.createElement('span');
    chip.className = 'chip-cesta';
    chip.textContent = emoji + (qtd > 1 ? 'x' + qtd : '');
    chip.style.cssText =
      'position:absolute;font-size:24px;' +
      'left:' + (14 + (n % 5) * 54) + 'px;' +
      'bottom:' + (10 + Math.floor(n / 5) * 46) + 'px;';
    cesta.appendChild(chip);
  }

  /* ---------- arraste ---------- */

  function comecarArraste(ev) {
    ev.preventDefault();
    var el = ev.currentTarget;
    var r = el.getBoundingClientRect();

    arrastando = {
      el: el,
      dx: ev.clientX - r.left,
      dy: ev.clientY - r.top,
      ultimoX: ev.clientX,
      ultimoY: ev.clientY
    };

    el.classList.add('arrastando');
    el.style.position = 'fixed';
    el.style.width = r.width + 'px';
    el.style.height = r.height + 'px';
    el.style.left = r.left + 'px';
    el.style.top = r.top + 'px';
    el.style.zIndex = 999;
    document.body.appendChild(el);

    document.addEventListener('pointermove', moverArraste);
    document.addEventListener('pointerup', soltarArraste);
  }

  function moverArraste(ev) {
    if (!arrastando) return;
    var d = Math.hypot(ev.clientX - arrastando.ultimoX, ev.clientY - arrastando.ultimoY);
    arrastando.ultimoX = ev.clientX;
    arrastando.ultimoY = ev.clientY;

    arrastando.el.style.left = (ev.clientX - arrastando.dx) + 'px';
    arrastando.el.style.top = (ev.clientY - arrastando.dy) + 'px';

    var cesta = $('#cesta');
    var rc = cesta.getBoundingClientRect();
    var dentro = ev.clientX > rc.left && ev.clientX < rc.right && ev.clientY > rc.top && ev.clientY < rc.bottom;
    cesta.classList.toggle('alvo', dentro);

    if (d > VELOCIDADE_MAX) {
      toast('escorregou da sua mao');
      soltarArraste(ev, true);
    }
  }

  function soltarArraste(ev, escorregou) {
    if (!arrastando) return;
    var el = arrastando.el;
    document.removeEventListener('pointermove', moverArraste);
    document.removeEventListener('pointerup', soltarArraste);
    el.classList.remove('arrastando');
    $('#cesta').classList.remove('alvo');

    var rc = $('#cesta').getBoundingClientRect();
    var noAlvo = !escorregou &&
      ev.clientX > rc.left && ev.clientX < rc.right &&
      ev.clientY > rc.top && ev.clientY < rc.bottom;

    var alvo = arrastando;
    arrastando = null;

    if (noAlvo) {
      voltarPraPrateleira(el);
      var par = acharProduto(el.dataset.id);
      pedirQuantidade(par.produto);
    } else {
      cair(el);
    }
  }

  /* gravidade barata: o produto cai ate sumir e volta pro lugar */
  function cair(el) {
    var y = parseFloat(el.style.top);
    var vy = 0;
    var vx = aleatorio(-2, 2);
    var x = parseFloat(el.style.left);
    var giro = aleatorio(-8, 8);
    var rot = 0;

    function passo() {
      vy += 1.1;
      y += vy; x += vx; rot += giro;
      el.style.top = y + 'px';
      el.style.left = x + 'px';
      el.style.transform = 'rotate(' + rot + 'deg)';
      if (y < window.innerHeight + 120) {
        requestAnimationFrame(passo);
      } else {
        el.style.transform = '';
        voltarPraPrateleira(el);
        toast('caiu no chao. repositor devolveu.');
      }
    }
    requestAnimationFrame(passo);
  }

  function voltarPraPrateleira(el) {
    el.style.position = 'absolute';
    el.style.width = '';
    el.style.height = '';
    el.style.zIndex = '';
    el.style.left = el.dataset.casaEsq + 'px';
    el.style.top = el.dataset.casaTopo + 'px';
    $('#prateleira-itens').appendChild(el);
  }

  /* ---------- quantidade ---------- */

  function pedirQuantidade(produto) {
    pendente = produto;
    qtdAtual = 0;
    cliquesMais = 0;
    $('#qtd-nome').textContent = produto.nome;
    $('#qtd-numero').textContent = '0';
    var b = $('#btn-mais');
    b.style.left = '50%'; b.style.top = '50%';
    abrirOverlay('#overlay-qtd');
  }

  function clicarMais() {
    qtdAtual++;
    cliquesMais++;
    $('#qtd-numero').textContent = qtdAtual;

    if (cliquesMais >= 5) {
      var area = $('#qtd-area').getBoundingClientRect();
      var b = $('#btn-mais');
      b.style.left = inteiro(12, Math.max(14, area.width - 86)) + 'px';
      b.style.top = inteiro(12, Math.max(14, area.height - 86)) + 'px';
      b.style.transform = 'none';
    }
  }

  function confirmarQtd() {
    if (qtdAtual < 1) { toast('quantidade invalida'); return; }
    adicionarAoCarrinho(pendente, qtdAtual);
    chipNaCesta(pendente.emoji, qtdAtual);
    toast(pendente.nome + ' x' + qtdAtual + ' na cesta');
    pendente = null;
    fecharOverlay('#overlay-qtd');
  }

  function cancelarQtd() {
    pendente = null;
    fecharOverlay('#overlay-qtd');
  }

  return { iniciar: iniciar, abrir: abrir };
})();
