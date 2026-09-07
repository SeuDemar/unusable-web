/* loja.js - o mapa da loja, a fisica do carrinho e o estacionamento */

var Loja = (function () {

  var cv, ctx, mini, mctx;
  var teclas = {};
  var rodando = false;

  var carrinho = {
    x: 900, y: 980, ang: -Math.PI / 2,
    vel: 0, velAng: 0,
    largura: 46, altura: 30
  };

  /* rodinha empenada: puxa sempre pro mesmo lado, e as vezes trava de vez */
  var rodinha = { travadaAte: 0, proximaTrava: 0 };

  var paradoDesde = 0;      // ms em que o carrinho ficou abaixo do limite de velocidade
  var ocioso = 0;           // ms sem input nenhum
  var LIMITE_OCIOSO = 60000;

  var ultimoQuadro = 0;

  function iniciar() {
    cv = $('#mapa'); ctx = cv.getContext('2d');
    mini = $('#minimapa'); mctx = mini.getContext('2d');

    document.addEventListener('keydown', aoTeclaBaixo);
    document.addEventListener('keyup', aoTeclaCima);

    carrinho.x = 900; carrinho.y = 980; carrinho.ang = -Math.PI / 2;
    carrinho.vel = 0; carrinho.velAng = 0;
    rodinha.proximaTrava = performance.now() + aleatorio(6000, 12000);
    ocioso = 0;
    rodando = true;
    ultimoQuadro = performance.now();
    requestAnimationFrame(laco);
  }

  function parar() { rodando = false; }

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

  function atualizar(dt, agora) {
    var bloqueado = overlayAberto() || !Estado.jogoAtivo;

    if (!bloqueado) {
      var frente = teclas.w || teclas.arrowup;
      var re = teclas.s || teclas.arrowdown;
      // controles trocados de proposito: A vira pra direita
      var viraDireita = teclas.a || teclas.arrowleft;
      var viraEsquerda = teclas.d || teclas.arrowright;

      if (frente) carrinho.vel += 0.22;
      if (re) carrinho.vel -= 0.15;

      var travada = agora < rodinha.travadaAte;
      var podeVirar = Math.abs(carrinho.vel) > 0.14 && !travada;
      if (podeVirar) {
        if (viraDireita) carrinho.velAng += 0.0045 * Math.abs(carrinho.vel);
        if (viraEsquerda) carrinho.velAng -= 0.0045 * Math.abs(carrinho.vel);
      }

      // a rodinha esquerda e empenada: puxa sozinha
      carrinho.velAng -= 0.0016 * carrinho.vel;

      if (agora > rodinha.proximaTrava) {
        rodinha.travadaAte = agora + aleatorio(700, 1400);
        rodinha.proximaTrava = agora + aleatorio(7000, 14000);
        toast('a rodinha travou');
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

    var nx = carrinho.x + Math.cos(carrinho.ang) * carrinho.vel * (dt / 16.6);
    var ny = carrinho.y + Math.sin(carrinho.ang) * carrinho.vel * (dt / 16.6);

    if (livre(nx, carrinho.y)) carrinho.x = nx; else bater();
    if (livre(carrinho.x, ny)) carrinho.y = ny; else bater();

    carrinho.x = limitar(carrinho.x, 26, MUNDO.w - 26);
    carrinho.y = limitar(carrinho.y, 26, MUNDO.h - 26);

    verificarEstacionamento(agora);
    verificarOcio();
  }

  function bater() {
    if (Math.abs(carrinho.vel) > 0.8) toast(escolha(['ai!', 'foi mal', 'isso ai era caro', 'PIMBA']));
    carrinho.vel *= -0.35;
    carrinho.velAng += aleatorio(-0.02, 0.02);
  }

  function solidos() {
    return PRATELEIRAS.map(function (p) { return p; })
      .concat([CAIXA])
      .concat(OBSTACULOS);
  }

  function livre(x, y) {
    var r = 20;
    var ok = true;
    solidos().forEach(function (s) {
      if (x + r > s.x && x - r < s.x + s.w && y + r > s.y && y - r < s.y + s.h) ok = false;
    });
    return ok;
  }

  /* ---------- estacionamento ---------- */

  function dentroDaVaga(v) {
    return carrinho.x > v.x && carrinho.x < v.x + v.w &&
      carrinho.y > v.y && carrinho.y < v.y + v.h;
  }

  function erroAngulo(v) {
    var alvo = v.ang * Math.PI / 180;
    var d = carrinho.ang - alvo;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return Math.abs(d) * 180 / Math.PI;
  }

  function vagaAtual() {
    var achada = null;
    PRATELEIRAS.forEach(function (p) { if (dentroDaVaga(p.vaga)) achada = { tipo: 'prateleira', alvo: p }; });
    if (dentroDaVaga(CAIXA.vaga)) achada = { tipo: 'caixa', alvo: CAIXA };
    return achada;
  }

  function verificarEstacionamento(agora) {
    if (overlayAberto() || !Estado.jogoAtivo) { paradoDesde = 0; return; }

    var v = vagaAtual();
    if (!v) { paradoDesde = 0; return; }

    var vaga = v.tipo === 'caixa' ? CAIXA.vaga : v.alvo.vaga;
    var parado = Math.abs(carrinho.vel) < 0.12;
    var alinhado = erroAngulo(vaga) < 22;

    if (!parado || !alinhado) {
      if (parado && !alinhado && !paradoDesde) {
        toast('torto. o angulo esta ' + Math.round(erroAngulo(vaga)) + ' graus fora');
        paradoDesde = -1; // evita spam ate sair da vaga
      }
      if (!parado) paradoDesde = 0;
      return;
    }

    if (paradoDesde <= 0) { paradoDesde = agora; return; }
    if (agora - paradoDesde < 450) return;

    paradoDesde = 0;
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
    var resta = Math.ceil((LIMITE_OCIOSO - ocioso) / 1000);

    if (ocioso < 30000) {
      el.className = 'cronometro';
      el.textContent = 'carrinho estavel';
      return;
    }
    el.className = 'cronometro alerta';
    el.textContent = 'carrinho abandonado em ' + Math.max(0, resta) + 's';

    if (ocioso >= LIMITE_OCIOSO) {
      ocioso = 0;
      if (Estado.carrinho.length) {
        limparCarrinho();
        toast('carrinho recolhido por abandono');
      }
    }
  }

  /* ---------- desenho ---------- */

  function camera() {
    return {
      x: limitar(carrinho.x - cv.width / 2, 0, MUNDO.w - cv.width),
      y: limitar(carrinho.y - cv.height / 2, 0, MUNDO.h - cv.height)
    };
  }

  function desenhar(agora) {
    var cam = camera();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#d9d2c5';
    ctx.fillRect(0, 0, cv.width, cv.height);

    ctx.save();
    ctx.translate(-cam.x, -cam.y);

    grade();

    PRATELEIRAS.forEach(function (p) {
      desenharVaga(p.vaga, Estado.destaque === p.id ? '#ff8f00' : '#ffd54f');
      caixaSolida(p, p.cor, p.nome);
    });

    OBSTACULOS.forEach(function (o) {
      caixaSolida(o, '#9e9e9e', '');
      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      ctx.fillText(o.rotulo, o.x + o.w / 2, o.y + o.h / 2 + 10);
    });

    desenharVaga(CAIXA.vaga, listaCompleta() ? '#00e676' : '#b0bec5');
    caixaSolida(CAIXA, '#37474f', 'CAIXA 3');

    desenharCarrinho();
    ctx.restore();

    desenharMini(cam);
  }

  function grade() {
    ctx.strokeStyle = '#00000012';
    ctx.lineWidth = 1;
    for (var x = 0; x < MUNDO.w; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, MUNDO.h); ctx.stroke();
    }
    for (var y = 0; y < MUNDO.h; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(MUNDO.w, y); ctx.stroke();
    }
  }

  function caixaSolida(r, cor, rotulo) {
    ctx.fillStyle = cor;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = '#00000055';
    ctx.lineWidth = 3;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    if (rotulo) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(rotulo, r.x + r.w / 2, r.y + r.h / 2 + 4);
    }
  }

  function desenharVaga(v, cor) {
    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = cor;
    ctx.lineWidth = 4;
    ctx.strokeRect(v.x, v.y, v.w, v.h);
    ctx.setLineDash([]);
    ctx.fillStyle = cor + '33';
    ctx.fillRect(v.x, v.y, v.w, v.h);

    // seta indicando o angulo exigido
    var cx = v.x + v.w / 2, cy = v.y + v.h / 2;
    var a = v.ang * Math.PI / 180;
    ctx.translate(cx, cy);
    ctx.rotate(a);
    ctx.strokeStyle = cor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-16, 0); ctx.lineTo(16, 0);
    ctx.moveTo(16, 0); ctx.lineTo(8, -7);
    ctx.moveTo(16, 0); ctx.lineTo(8, 7);
    ctx.stroke();
    ctx.restore();
  }

  function desenharCarrinho() {
    ctx.save();
    ctx.translate(carrinho.x, carrinho.y);
    ctx.rotate(carrinho.ang);

    ctx.fillStyle = '#00000033';
    ctx.fillRect(-carrinho.largura / 2 + 3, -carrinho.altura / 2 + 4, carrinho.largura, carrinho.altura);

    ctx.fillStyle = '#eceff1';
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 3;
    ctx.fillRect(-carrinho.largura / 2, -carrinho.altura / 2, carrinho.largura, carrinho.altura);
    ctx.strokeRect(-carrinho.largura / 2, -carrinho.altura / 2, carrinho.largura, carrinho.altura);

    // cabo na traseira
    ctx.beginPath();
    ctx.moveTo(-carrinho.largura / 2 - 8, -8);
    ctx.lineTo(-carrinho.largura / 2 - 8, 8);
    ctx.stroke();

    // itens visiveis na cesta
    var n = Math.min(4, Estado.carrinho.length);
    ctx.font = '13px serif';
    ctx.textAlign = 'center';
    for (var i = 0; i < n; i++) {
      ctx.fillText(Estado.carrinho[i].emoji, -12 + i * 11, 4);
    }
    ctx.restore();
  }

  function desenharMini(cam) {
    var ex = mini.width / MUNDO.w, ey = mini.height / MUNDO.h;
    mctx.fillStyle = '#222';
    mctx.fillRect(0, 0, mini.width, mini.height);
    PRATELEIRAS.forEach(function (p) {
      mctx.fillStyle = Estado.destaque === p.id ? '#ff8f00' : p.cor;
      mctx.fillRect(p.x * ex, p.y * ey, p.w * ex, p.h * ey);
    });
    mctx.fillStyle = '#00e676';
    mctx.fillRect(CAIXA.x * ex, CAIXA.y * ey, CAIXA.w * ex, CAIXA.h * ey);
    mctx.fillStyle = '#fff';
    mctx.fillRect(carrinho.x * ex - 2, carrinho.y * ey - 2, 4, 4);
    mctx.strokeStyle = '#ffffff66';
    mctx.strokeRect(cam.x * ex, cam.y * ey, cv.width * ex, cv.height * ey);
  }

  /* ---------- laco ---------- */

  function laco(agora) {
    if (!rodando) return;
    var dt = Math.min(50, agora - ultimoQuadro);
    ultimoQuadro = agora;
    atualizar(dt, agora);
    desenhar(agora);
    requestAnimationFrame(laco);
  }

  return {
    iniciar: iniciar,
    parar: parar,
    carrinho: carrinho,
    zerarOcio: function () { ocioso = 0; }
  };
})();
