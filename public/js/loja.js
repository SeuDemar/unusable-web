/* loja.js - o mapa em tela cheia, a fisica do carrinho e o estacionamento

   Estacionar nao exige angulo: basta entrar na vaga e ficar parado
   3 segundos, com a contagem desenhada em cima do carrinho. */

var Loja = (function () {

  var cv, ctx;
  var teclas = {};
  var rodando = false;

  var carrinho = {
    x: 0, y: 0, ang: -Math.PI / 2,
    vel: 0, velAng: 0,
    largura: 44, altura: 28
  };

  var TEMPO_PARADO = 3000;   // ms parado na vaga para abrir
  var paradoDesde = 0;
  var vagaEmFoco = null;

  var ocioso = 0;
  var LIMITE_OCIOSO = 60000;

  var ultimoQuadro = 0;

  function iniciar() {
    cv = $('#mapa');
    ctx = cv.getContext('2d');

    document.addEventListener('keydown', aoTeclaBaixo);
    document.addEventListener('keyup', aoTeclaCima);
    window.addEventListener('resize', ajustarTamanho);
    ajustarTamanho();

    carrinho.x = INICIO_CARRINHO.x;
    carrinho.y = INICIO_CARRINHO.y;
    carrinho.ang = -Math.PI / 2;
    carrinho.vel = 0;
    carrinho.velAng = 0;

    ocioso = 0;
    paradoDesde = 0;
    rodando = true;
    ultimoQuadro = performance.now();
    requestAnimationFrame(laco);
  }

  function parar() { rodando = false; }

  function ajustarTamanho() {
    var topo = $('#topo');
    var alturaTopo = topo ? topo.offsetHeight : 0;
    cv.width = window.innerWidth;
    cv.height = Math.max(240, window.innerHeight - alturaTopo);
  }

  function aoTeclaBaixo(e) {
    if (e.target && e.target.tagName === 'INPUT') return;
    var k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].indexOf(k) >= 0) {
      e.preventDefault();
      teclas[k] = true;
      ocioso = 0;
    }
  }
  function aoTeclaCima(e) { teclas[e.key.toLowerCase()] = false; }

  function pressionado() {
    return teclas.w || teclas.a || teclas.s || teclas.d ||
      teclas.arrowup || teclas.arrowdown || teclas.arrowleft || teclas.arrowright;
  }

  /* ---------- fisica ---------- */

  function atualizar(dt) {
    var bloqueado = overlayAberto() || !Estado.jogoAtivo;

    if (!bloqueado) {
      var frente = teclas.w || teclas.arrowup;
      var re = teclas.s || teclas.arrowdown;
      // controles trocados de proposito: A vira pra direita
      var viraDireita = teclas.a || teclas.arrowleft;
      var viraEsquerda = teclas.d || teclas.arrowright;

      if (frente) carrinho.vel += 0.22;
      if (re) carrinho.vel -= 0.15;

      if (Math.abs(carrinho.vel) > 0.14) {
        if (viraDireita) carrinho.velAng += 0.0050 * Math.abs(carrinho.vel);
        if (viraEsquerda) carrinho.velAng -= 0.0050 * Math.abs(carrinho.vel);
      }

      if (pressionado()) ocioso = 0; else ocioso += dt;
    } else {
      ocioso = 0;
    }

    carrinho.vel = limitar(carrinho.vel, -1.7, 3.3);
    carrinho.vel *= 0.955;
    carrinho.velAng *= 0.88;
    if (Math.abs(carrinho.vel) < 0.02) carrinho.vel = 0;

    carrinho.ang += carrinho.velAng;

    var passo = dt / 16.6;
    var nx = carrinho.x + Math.cos(carrinho.ang) * carrinho.vel * passo;
    var ny = carrinho.y + Math.sin(carrinho.ang) * carrinho.vel * passo;

    if (livre(nx, carrinho.y)) carrinho.x = nx; else bater();
    if (livre(carrinho.x, ny)) carrinho.y = ny; else bater();

    carrinho.x = limitar(carrinho.x, 26, MUNDO.w - 26);
    carrinho.y = limitar(carrinho.y, 26, MUNDO.h - 26);

    verificarEstacionamento(dt);
    verificarOcio();
  }

  function bater() {
    if (Math.abs(carrinho.vel) > 0.8) toast(escolha(['ai!', 'foi mal', 'PIMBA']));
    carrinho.vel *= -0.35;
  }

  function solidos() {
    return PRATELEIRAS.slice().concat([CAIXA]).concat(OBSTACULOS);
  }

  function livre(x, y) {
    var r = 19;
    var ok = true;
    solidos().forEach(function (s) {
      if (x + r > s.x && x - r < s.x + s.w && y + r > s.y && y - r < s.y + s.h) ok = false;
    });
    return ok;
  }

  /* ---------- estacionamento por tempo ---------- */

  function dentroDaVaga(v) {
    return carrinho.x > v.x && carrinho.x < v.x + v.w &&
      carrinho.y > v.y && carrinho.y < v.y + v.h;
  }

  function vagaAtual() {
    var achada = null;
    PRATELEIRAS.forEach(function (p) {
      if (dentroDaVaga(p.vaga)) achada = { tipo: 'prateleira', alvo: p };
    });
    if (dentroDaVaga(CAIXA.vaga)) achada = { tipo: 'caixa', alvo: CAIXA };
    return achada;
  }

  function verificarEstacionamento(dt) {
    if (overlayAberto() || !Estado.jogoAtivo) { paradoDesde = 0; vagaEmFoco = null; return; }

    var v = vagaAtual();
    var parado = Math.abs(carrinho.vel) < 0.12;

    if (!v || !parado) { paradoDesde = 0; vagaEmFoco = null; return; }

    vagaEmFoco = v;
    paradoDesde += dt;
    if (paradoDesde < TEMPO_PARADO) return;

    paradoDesde = 0;
    vagaEmFoco = null;
    carrinho.vel = 0;

    if (v.tipo === 'caixa') {
      if (!listaCompleta()) {
        var falta = itensFaltando().map(function (i) { return i.nome; }).join(', ');
        toast('faltam: ' + falta);
        return;
      }
      Caixa.abrir();
    } else {
      Prateleira.abrir(v.alvo);
    }
  }

  /* ---------- carrinho abandonado ---------- */

  function verificarOcio() {
    var el = $('#cronometro');
    if (!el) return;
    var resta = Math.ceil((LIMITE_OCIOSO - ocioso) / 1000);

    if (ocioso < 30000) {
      el.className = 'cronometro';
      el.textContent = '';
      return;
    }
    el.className = 'cronometro alerta';
    el.textContent = 'sacola recolhida em ' + Math.max(0, resta) + 's';

    if (ocioso >= LIMITE_OCIOSO) {
      ocioso = 0;
      if (Estado.carrinho.length) {
        limparCarrinho();
        toast('sacola recolhida por abandono');
      }
    }
  }

  /* ---------- desenho ---------- */

  function camera() {
    var mx = MUNDO.w - cv.width;
    var my = MUNDO.h - cv.height;
    return {
      x: mx <= 0 ? mx / 2 : limitar(carrinho.x - cv.width / 2, 0, mx),
      y: my <= 0 ? my / 2 : limitar(carrinho.y - cv.height / 2, 0, my)
    };
  }

  function desenhar() {
    var cam = camera();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#f4f4f4';
    ctx.fillRect(0, 0, cv.width, cv.height);

    ctx.save();
    ctx.translate(-cam.x, -cam.y);

    piso();

    PRATELEIRAS.forEach(function (p) {
      desenharVaga(p.vaga);
      caixaSolida(p, Estado.destaque === p.id ? '#000' : p.cor, p.nome);
    });

    OBSTACULOS.forEach(function (o) {
      caixaSolida(o, '#c4c4c4', '');
      ctx.fillStyle = '#666';
      ctx.font = '26px serif';
      ctx.textAlign = 'center';
      ctx.fillText(o.rotulo, o.x + o.w / 2, o.y + o.h / 2 + 9);
    });

    desenharVaga(CAIXA.vaga);
    caixaSolida(CAIXA, listaCompleta() ? '#000' : '#8c8c8c', 'PASSAR COMPRAS');

    desenharCarrinho();
    desenharContagem();

    ctx.restore();
  }

  function piso() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, MUNDO.w, MUNDO.h);
    ctx.strokeStyle = '#ebebeb';
    ctx.lineWidth = 1;
    for (var x = 0; x < MUNDO.w; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, MUNDO.h); ctx.stroke();
    }
    for (var y = 0; y < MUNDO.h; y += 80) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(MUNDO.w, y); ctx.stroke();
    }
    ctx.strokeStyle = '#d0d0d0';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, MUNDO.w, MUNDO.h);
  }

  function caixaSolida(r, cor, rotulo) {
    ctx.fillStyle = cor;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    if (rotulo) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(rotulo, r.x + r.w / 2, r.y + r.h / 2 + 5);
    }
  }

  function desenharVaga(v) {
    ctx.save();
    ctx.setLineDash([7, 6]);
    ctx.strokeStyle = '#9a9a9a';
    ctx.lineWidth = 2;
    ctx.strokeRect(v.x, v.y, v.w, v.h);
    ctx.restore();
  }

  function desenharCarrinho() {
    ctx.save();
    ctx.translate(carrinho.x, carrinho.y);
    ctx.rotate(carrinho.ang);

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.fillRect(-carrinho.largura / 2, -carrinho.altura / 2, carrinho.largura, carrinho.altura);
    ctx.strokeRect(-carrinho.largura / 2, -carrinho.altura / 2, carrinho.largura, carrinho.altura);

    // cabo na traseira, indica para onde o carrinho aponta
    ctx.beginPath();
    ctx.moveTo(-carrinho.largura / 2 - 8, -7);
    ctx.lineTo(-carrinho.largura / 2 - 8, 7);
    ctx.stroke();

    var n = Math.min(4, Estado.carrinho.length);
    ctx.font = '12px serif';
    ctx.textAlign = 'center';
    for (var i = 0; i < n; i++) {
      ctx.fillText(Estado.carrinho[i].emoji, -11 + i * 10, 4);
    }
    ctx.restore();
  }

  /* contagem de 3 segundos desenhada em cima do carrinho */
  function desenharContagem() {
    if (!vagaEmFoco || paradoDesde <= 0) return;

    var frac = limitar(paradoDesde / TEMPO_PARADO, 0, 1);
    var resta = Math.max(1, Math.ceil((TEMPO_PARADO - paradoDesde) / 1000));
    var cx = carrinho.x;
    var cy = carrinho.y - 44;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 19, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffffee';
    ctx.fill();
    ctx.strokeStyle = '#d0d0d0';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 19, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#111';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(resta, cx, cy + 6);
    ctx.restore();
  }

  /* ---------- laco ---------- */

  function laco(agora) {
    if (!rodando) return;
    var dt = Math.min(50, agora - ultimoQuadro);
    ultimoQuadro = agora;
    atualizar(dt);
    desenhar();
    requestAnimationFrame(laco);
  }

  return {
    iniciar: iniciar,
    parar: parar,
    carrinho: carrinho,
    zerarOcio: function () { ocioso = 0; }
  };
})();
