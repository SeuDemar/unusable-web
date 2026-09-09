/* caixa.js - leitor de produtos, captcha e pagamento */

var Caixa = (function () {

  var CARTAO = '4242424242424242';

  var restamScan = 0;
  var arrasteScan = null;
  var digitados = '';

  function iniciar() {
    $('#btn-captcha').addEventListener('click', verificarCaptcha);
    $('#btn-limpar-cartao').addEventListener('click', function () {
      digitados = '';
      atualizarVisor();
      toast('tudo apagado. de nada.');
    });
  }

  function abrir() {
    Loja.zerarOcio();
    abrirOverlay('#overlay-caixa');
    montarScanner();
    // Sacola vazia deixaria restamScan em 0 e o leitor nunca avancaria: beco sem
    // saida. Nao deveria acontecer, mas se acontecer, pula direto pro captcha.
    if (restamScan <= 0) { montarCaptcha(); etapa('#etapa-captcha'); }
    else etapa('#etapa-scanner');
  }

  function etapa(id) {
    $$('.etapa').forEach(function (e) { e.classList.remove('ativa'); });
    $(id).classList.add('ativa');
  }

  /* ---------- 1. leitor ---------- */

  function montarScanner() {
    var pilha = $('#scanner-pilha');
    pilha.innerHTML = '';
    restamScan = Estado.carrinho.length;

    Estado.carrinho.forEach(function (linha) {
      var el = document.createElement('div');
      el.className = 'item-scan';
      el.innerHTML =
        '<span class="emoji-scan">' + linha.emoji + '</span>' +
        '<span>' + linha.nome + ' x' + linha.qtd + '</span>';
      el.style.left = inteiro(10, 300) + 'px';
      el.style.top = inteiro(10, 170) + 'px';
      el.addEventListener('pointerdown', pegarItemScan);
      pilha.appendChild(el);
    });

    atualizarStatusScan();
  }

  function atualizarStatusScan() {
    $('#scanner-status').innerHTML = 'faltam <b>' + restamScan + '</b> itens';
  }

  function pegarItemScan(ev) {
    ev.preventDefault();
    var el = ev.currentTarget;
    var pilha = $('#scanner-pilha').getBoundingClientRect();
    arrasteScan = {
      el: el,
      dx: ev.clientX - (pilha.left + parseFloat(el.style.left)),
      dy: ev.clientY - (pilha.top + parseFloat(el.style.top))
    };
    document.addEventListener('pointermove', moverItemScan);
    document.addEventListener('pointerup', soltarItemScan);
  }

  function moverItemScan(ev) {
    if (!arrasteScan) return;
    var pilha = $('#scanner-pilha').getBoundingClientRect();
    arrasteScan.el.style.left = (ev.clientX - pilha.left - arrasteScan.dx) + 'px';
    arrasteScan.el.style.top = (ev.clientY - pilha.top - arrasteScan.dy) + 'px';

    var rl = $('#leitor').getBoundingClientRect();
    var sobre = ev.clientX > rl.left && ev.clientX < rl.right && ev.clientY > rl.top && ev.clientY < rl.bottom;
    $('#leitor').classList.toggle('lendo', sobre);
  }

  function soltarItemScan(ev) {
    if (!arrasteScan) return;
    document.removeEventListener('pointermove', moverItemScan);
    document.removeEventListener('pointerup', soltarItemScan);
    $('#leitor').classList.remove('lendo');

    var el = arrasteScan.el;
    arrasteScan = null;

    var rl = $('#leitor').getBoundingClientRect();
    var sobre = ev.clientX > rl.left && ev.clientX < rl.right && ev.clientY > rl.top && ev.clientY < rl.bottom;
    if (!sobre) return;

    el.remove();
    restamScan--;
    atualizarStatusScan();
    toast('bip');

    if (restamScan <= 0) {
      montarCaptcha();
      etapa('#etapa-captcha');
    }
  }

  /* ---------- 2. captcha ---------- */

  var captchaCertas = [];

  function montarCaptcha() {
    var grade = $('#captcha-grade');
    grade.innerHTML = '';
    captchaCertas = [];

    var distratores = ['🧺', '🛍️', '🚗', '🧳', '📦', '🛵', '🪑'];
    var quantos = inteiro(2, 4);
    var celulas = [];
    for (var i = 0; i < 9; i++) celulas.push(i < quantos ? '🛒' : escolha(distratores));
    celulas = embaralhar(celulas);

    celulas.forEach(function (emoji, i) {
      if (emoji === '🛒') captchaCertas.push(i);
      var c = document.createElement('div');
      c.className = 'captcha-cel';
      c.textContent = emoji;
      c.dataset.i = i;
      c.addEventListener('click', function () { c.classList.toggle('sel'); });
      grade.appendChild(c);
    });
  }

  function verificarCaptcha() {
    var sel = $$('.captcha-cel.sel').map(function (c) { return Number(c.dataset.i); }).sort();
    var certas = captchaCertas.slice().sort();
    if (sel.length === certas.length && sel.every(function (v, i) { return v === certas[i]; })) {
      montarPagamento();
      etapa('#etapa-pagamento');
      return;
    }
    toast('voce parece um carrinho. tente de novo.');
    montarCaptcha();
  }

  /* ---------- 3. pagamento ---------- */

  /* WCAG 2.1.2 No Keyboard Trap (A): violado de proposito.
     Enquanto o pagamento nao terminar, Tab e Shift+Tab nao levam a lugar
     nenhum: o foco volta para uma tecla sorteada do proprio teclado. Nao ha
     atalho documentado para escapar. Sair exige completar os 16 digitos. */
  function prenderFoco(ev) {
    if (ev.key !== 'Tab') return;
    ev.preventDefault();
    var teclas = $$('.tecla');
    if (teclas.length) escolha(teclas).focus();
  }

  function montarPagamento() {
    digitados = '';
    atualizarVisor();
    embaralharTeclado();
    document.addEventListener('keydown', prenderFoco, true);
  }

  function soltarFoco() {
    document.removeEventListener('keydown', prenderFoco, true);
  }

  function embaralharTeclado() {
    var tec = $('#teclado');
    tec.innerHTML = '';
    embaralhar(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']).forEach(function (d) {
      var b = document.createElement('button');
      b.className = 'tecla';
      b.textContent = d;
      b.addEventListener('click', function () { digitar(d); });
      tec.appendChild(b);
    });
  }

  function digitar(d) {
    if (d !== CARTAO[digitados.length]) {
      toast('digito recusado pelo banco');
      embaralharTeclado();
      return;
    }
    digitados += d;
    atualizarVisor();
    embaralharTeclado();
    if (digitados.length >= CARTAO.length) {
      soltarFoco();
      setTimeout(function () {
        fecharOverlay('#overlay-caixa');
        Jogo.finalizar();
      }, 500);
    }
  }

  function atualizarVisor() {
    var s = '';
    for (var i = 0; i < CARTAO.length; i++) {
      s += (i < digitados.length ? digitados[i] : '_');
      if (i % 4 === 3 && i < CARTAO.length - 1) s += ' ';
    }
    $('#cartao-visor').textContent = s;
  }

  return { iniciar: iniciar, abrir: abrir };
})();
