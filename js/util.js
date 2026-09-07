/* util.js - helpers gerais e anti-padroes reutilizaveis */

function $(sel, raiz) { return (raiz || document).querySelector(sel); }
function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }

function aleatorio(min, max) { return Math.random() * (max - min) + min; }
function inteiro(min, max) { return Math.floor(aleatorio(min, max + 1)); }
function escolha(lista) { return lista[inteiro(0, lista.length - 1)]; }
function limitar(v, min, max) { return v < min ? min : (v > max ? max : v); }

function embaralhar(lista) {
  var copia = lista.slice();
  for (var i = copia.length - 1; i > 0; i--) {
    var j = inteiro(0, i);
    var t = copia[i]; copia[i] = copia[j]; copia[j] = t;
  }
  return copia;
}

function moeda(v) {
  return 'R$ ' + v.toFixed(2).replace('.', ',');
}

/* Toast que some em 400ms. Se voce piscou, azar. */
function toast(msg) {
  var camada = $('#toast-layer');
  var el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  camada.appendChild(el);
  setTimeout(function () { el.remove(); }, 400);
}

/* Reordena fisicamente os filhos de um container. Usado pra fazer
   botoes trocarem de lugar sozinhos. */
function trocarLugares(container) {
  var filhos = embaralhar($$(':scope > *', container));
  filhos.forEach(function (f) { container.appendChild(f); });
}

/* Confirmacao com dupla negativa. As opcoes vem em ordem aleatoria. */
function confirmar(pergunta, rotuloSim, rotuloNao, aoConfirmar) {
  var overlay = $('#overlay-confirma');
  $('#confirma-texto').textContent = pergunta;
  var caixa = $('#confirma-botoes');
  caixa.innerHTML = '';

  var opcoes = [
    { rotulo: rotuloSim, acao: function () { fechar(); aoConfirmar(); } },
    { rotulo: rotuloNao, acao: function () { fechar(); toast('nada mudou. ou mudou.'); } }
  ];

  embaralhar(opcoes).forEach(function (o) {
    var b = document.createElement('button');
    b.className = 'btn btn-mini';
    b.textContent = o.rotulo;
    b.addEventListener('click', o.acao);
    caixa.appendChild(b);
  });

  function fechar() { overlay.classList.remove('ativa'); }
  overlay.classList.add('ativa');
}

function abrirOverlay(id) { $(id).classList.add('ativa'); }
function fecharOverlay(id) { $(id).classList.remove('ativa'); }
function overlayAberto() { return !!$('.overlay.ativa'); }

function mostrarTela(id) {
  $$('.tela').forEach(function (t) { t.classList.remove('ativa'); });
  $(id).classList.add('ativa');
}
