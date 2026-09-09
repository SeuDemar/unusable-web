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

  var LIMITE_COMPRA = 180000;   // prazo de compra, contado so dentro do mapa
  var PRORROGACAO = 30000;      // sobrevida quando o prazo estoura com a sacola vazia
  var prazoEstourado = false;

  var ultimoQuadro = 0;
  var ligado = false;      // listeners ja registrados neste carregamento
  var lacoAtivo = false;   // ha um requestAnimationFrame pendente

  /* Chamado uma unica vez por carregamento. Registrar os listeners de novo a cada
     volta ao mapa empilharia handlers de teclado. Para reentrar no mapa use retomar(). */
  function iniciar() {
    if (ligado) return;
    ligado = true;

    cv = $('#mapa');
    ctx = cv.getContext('2d');

    document.addEventListener('keydown', aoTeclaBaixo);
    document.addEventListener('keyup', aoTeclaCima);
    window.addEventListener('resize', ajustarTamanho);
    ajustarTamanho();
    posicionarNoInicio();
  }

  function posicionarNoInicio() {
    carrinho.x = INICIO_CARRINHO.x;
    carrinho.y = INICIO_CARRINHO.y;
    carrinho.ang = -Math.PI / 2;
    carrinho.vel = 0;
    carrinho.velAng = 0;
  }

  /* Entrada no mapa. Idempotente: chamar duas vezes nao duplica o laco.
     reposicionar=true devolve o carrinho a entrada da loja - obrigatorio ao voltar
     do catalogo, senao o carrinho reaparece parado dentro da vaga do catalogo e
     3 segundos depois ela reabre o catalogo, num laco sem fim. */
  function retomar(reposicionar) {
    if (reposicionar) posicionarNoInicio();
    teclas = {};             // solta tecla que ficou presa fora do mapa
    paradoDesde = 0;
    vagaEmFoco = null;
    ocioso = 0;
    ultimoQuadro = performance.now();
    rodando = true;
    if (lacoAtivo) return;   // ja existe um rAF pendente: um segundo laco rodaria a fisica em dobro
    lacoAtivo = true;
    requestAnimationFrame(laco);
  }

  function parar() {
    rodando = false;
    var el = $('#cronometro');
    if (el) { el.className = 'cronometro'; el.textContent = ''; }
  }

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

    if (!bloqueado) Estado.tempoMapa += dt;

    verificarEstacionamento(dt);
    verificarPrazo();
    verificarOcio();
  }

  function bater() {
    if (Math.abs(carrinho.vel) > 0.8) toast(escolha(['ai!', 'foi mal', 'PIMBA']));
    carrinho.vel *= -0.35;
  }

  function solidos() {
    return PRATELEIRAS.slice().concat([CAIXA, CATALOGO]).concat(OBSTACULOS);
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
    if (dentroDaVaga(CATALOGO.vaga)) achada = { tipo: 'catalogo', alvo: CATALOGO };
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
      if (!sacolaTemItem()) {
        toast('sacola vazia. o caixa nao atende curiosos.');
        return;
      }
      Caixa.abrir();
    } else if (v.tipo === 'catalogo') {
      Catalogo.abrir();
    } else {
      Prateleira.abrir(v.alvo);
    }
  }

  /* ---------- prazo de compra ----------

     WCAG 2.2.1 Timing Adjustable (A): violado de proposito. Sao 3 minutos de mapa
     sem opcao de desligar, ajustar ou estender.

     O prazo pausa com overlay aberto de proposito, e nao e so equilibrio: assim
     Estado.tempoMapa so cruza o limite num quadro sem overlay nenhum, entao o
     Caixa.abrir() forcado nunca cai por cima de outro overlay nem no meio de um
     arraste da prateleira (que deixaria o produto orfao em position:fixed). */

  function verificarPrazo() {
    var el = $('#prazo');
    if (prazoEstourado || overlayAberto() || !Estado.jogoAtivo) return;

    var resta = Math.max(0, LIMITE_COMPRA - Estado.tempoMapa);
    if (el) {
      var s = Math.ceil(resta / 1000);
      var m = Math.floor(s / 60);
      s = s % 60;
      el.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      el.className = resta <= 30000 ? 'prazo urgente' : 'prazo';
    }

    if (resta > 0) return;

    // Sacola vazia nao pode ir para o caixa: o leitor monta com zero itens e nunca
    // avanca para o captcha, o que seria um beco sem saida. Prorroga em vez disso.
    if (!sacolaTemItem()) {
      Estado.tempoMapa = LIMITE_COMPRA - PRORROGACAO;
      toast('sacola vazia. o gerente te deu mais 30s (com desprezo).');
      return;
    }

    prazoEstourado = true;
    paradoDesde = 0;
    vagaEmFoco = null;
    carrinho.vel = 0;
    carrinho.velAng = 0;
    toast('tempo esgotado. o caixa veio ate voce.');
    Caixa.abrir();
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

  function desenhar(agora) {
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

    // As duas vagas de saida sao retangulos tracejados identicos com destinos
    // diferentes. WCAG 3.2.4 Consistent Identification (AA): violado de proposito.
    desenharVaga(CATALOGO.vaga);
    caixaSolida(CATALOGO, '#4c4c4c', 'CATALOGO');
    desenharVaga(CAIXA.vaga);
    caixaSolida(CAIXA, sacolaTemItem() ? '#000' : '#8c8c8c', 'PASSAR COMPRAS');

    desenharSetas(agora, cam);

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

  /* ---------- setas escrachadas ----------

     Indicam a prateleira do item escolhido no catalogo e, depois que ele entra na
     sacola, as duas saidas. Sao desenhadas no canvas, sem equivalente textual em
     lugar nenhum - WCAG 1.1.1 Non-text Content (A), violado de proposito.

     Elas se mexem para sempre e nao ha como pausar - WCAG 2.2.2 Pause, Stop, Hide
     (A). O movimento e oscilacao de posicao a ~0.18 Hz, nunca piscada: piscar acima
     de 3 Hz e o unico limite intransponivel do projeto, e a barra superior ja tem
     um elemento piscando. */

  var rabiscos = {};   // chave -> pontos do circulo torto, sorteados uma unica vez

  function rabiscoDe(chave, rx, ry) {
    if (rabiscos[chave]) return rabiscos[chave];
    var pts = [];
    var n = 26;
    for (var i = 0; i <= n; i++) {
      var a = i / n * Math.PI * 2;
      pts.push({
        x: Math.cos(a) * rx * aleatorio(0.86, 1.16),
        y: Math.sin(a) * ry * aleatorio(0.86, 1.16)
      });
    }
    rabiscos[chave] = pts;
    return pts;
  }

  function tracoTorto(pts, dx, dy) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x + dx, pts[0].y + dy);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x + dx, pts[i].y + dy);
    ctx.stroke();
  }

  function legenda(texto, cx, cy) {
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    var largura = ctx.measureText(texto).width + 22;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.05);
    ctx.fillStyle = '#8c8c8c';
    ctx.fillRect(-largura / 2 + 4, -13 + 4, largura, 28);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-largura / 2, -13, largura, 28);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.strokeRect(-largura / 2, -13, largura, 28);
    ctx.fillStyle = '#111';
    ctx.fillText(texto, 0, 7);
    ctx.restore();
  }

  /* Seta gorda apontando do ponto (px,py) para (ax,ay). */
  function setaGorda(px, py, ax, ay) {
    var ang = Math.atan2(ay - py, ax - px);
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(ang);
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.moveTo(0, 0);                 // ponta
    ctx.lineTo(-46, -30);
    ctx.lineTo(-46, -13);
    ctx.lineTo(-108, -13);
    ctx.lineTo(-108, 13);
    ctx.lineTo(-46, 13);
    ctx.lineTo(-46, 30);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function desenharSetas(agora, cam) {
    var lista = setasAtivas();
    if (!lista.length) return;

    var pulso = Math.sin((agora || 0) / 900);   // ~0.18 Hz, longe dos 3 Hz
    var M = 120;                                // folga para a seta caber inteira

    lista.forEach(function (s) {
      var ax = s.alvo.x + s.alvo.w / 2;
      var ay = s.alvo.y + s.alvo.h / 2;
      var dentro = ax > cam.x + M && ax < cam.x + cv.width - M &&
        ay > cam.y + M && ay < cam.y + cv.height - M;

      if (dentro) {
        var pts = rabiscoDe(s.chave, s.alvo.w / 2 + 34, s.alvo.h / 2 + 34);
        ctx.save();
        ctx.translate(ax, ay);
        ctx.strokeStyle = '#111';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = 6;
        tracoTorto(pts, 0, 0);
        ctx.lineWidth = 4;
        tracoTorto(pts, 2, 3);       // segunda canetada, como rabisco no Paint
        ctx.restore();

        var topo = ay - s.alvo.h / 2 - 46 + pulso * 7;
        setaGorda(ax - 150, topo - 120, ax - 6, topo);
        legenda(s.legenda, ax, topo - 132);
        return;
      }

      // Alvo fora do enquadramento: gruda na borda e aponta a direcao.
      var bx = limitar(ax, cam.x + M, cam.x + cv.width - M);
      var by = limitar(ay, cam.y + M, cam.y + cv.height - M);
      var ang = Math.atan2(ay - by, ax - bx);
      var d = 34 + pulso * 6;

      setaGorda(bx - Math.cos(ang) * 120, by - Math.sin(ang) * 120,
        bx + Math.cos(ang) * d, by + Math.sin(ang) * d);
      legenda(s.legenda, bx, by + 62);
    });
  }

  /* ---------- laco ---------- */

  function laco(agora) {
    if (!rodando) { lacoAtivo = false; return; }
    var dt = Math.min(50, agora - ultimoQuadro);
    ultimoQuadro = agora;
    atualizar(dt);
    desenhar(agora);
    requestAnimationFrame(laco);
  }

  return {
    iniciar: iniciar,
    retomar: retomar,
    parar: parar,
    carrinho: carrinho,
    zerarOcio: function () { ocioso = 0; }
  };
})();
