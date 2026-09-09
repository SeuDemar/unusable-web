/* musica.js - musica de elevador que comeca sozinha e nao tem como desligar.
   Violacao deliberada de WCAG 1.4.2 Audio Control (A), catalogada em docs/WCAG.md.

   Nao existe arquivo de audio: o projeto nao aceita asset binario, entao a
   trilha e sintetizada na Web Audio API. Sao quatro compassos de ii-V-I-VI com
   melodia sorteada em cima dos acordes, o que faz o loop nunca se repetir igual
   e mesmo assim soar sempre igual. */

var Musica = (function () {

  var VOLUME_MESTRE = 0.07;    // audivel sem doer. Nao ha controle nenhum na pagina.
  var SUBIDA = 3;              // segundos de fade-in ate o volume cheio
  var BATIDA = 0.5;            // segundos por tempo; 4 tempos por compasso = 2 s
  var AGENDA_ADIANTE = 0.6;    // segundos de futuro que ficam agendados
  var AGENDA_INTERVALO = 150;  // ms entre rodadas de agendamento
  var VIGIA_INTERVALO = 2000;  // ms entre tentativas de religar o contexto

  // ii - V - I - VI: a volta harmonica mais generica que existe, de proposito.
  var PROGRESSAO = [
    { baixo: 50, acordes: [62, 65, 69, 72] },  // Dm7
    { baixo: 43, acordes: [59, 62, 65, 67] },  // G7
    { baixo: 48, acordes: [60, 64, 67, 71] },  // Cmaj7
    { baixo: 45, acordes: [61, 64, 67, 69] }   // A7
  ];

  var contexto = null;
  var mestre = null;
  var ruido = null;
  var proximoCompasso = 0;   // instante do proximo compasso no relogio do contexto
  var indice = 0;

  /* ---------- sintese ---------- */

  function hz(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  function nota(tipo, freq, inicio, duracao, pico, ataque) {
    var osc = contexto.createOscillator();
    var env = contexto.createGain();
    osc.type = tipo;
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0.0001, inicio);
    env.gain.exponentialRampToValueAtTime(pico, inicio + ataque);
    env.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
    osc.connect(env);
    env.connect(mestre);
    osc.start(inicio);
    osc.stop(inicio + duracao + 0.05);
  }

  function bufferRuido() {
    if (ruido) return ruido;
    var quadros = Math.floor(contexto.sampleRate * 0.2);
    ruido = contexto.createBuffer(1, quadros, contexto.sampleRate);
    var dados = ruido.getChannelData(0);
    for (var i = 0; i < quadros; i++) dados[i] = Math.random() * 2 - 1;
    return ruido;
  }

  /* Chiado curto de bateria eletronica de teclado barato. */
  function chiado(inicio, pico) {
    var fonte = contexto.createBufferSource();
    fonte.buffer = bufferRuido();
    var filtro = contexto.createBiquadFilter();
    filtro.type = 'bandpass';
    filtro.frequency.value = 7000;
    var env = contexto.createGain();
    env.gain.setValueAtTime(pico, inicio);
    env.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.08);
    fonte.connect(filtro);
    filtro.connect(env);
    env.connect(mestre);
    fonte.start(inicio);
    fonte.stop(inicio + 0.12);
  }

  /* ---------- arranjo ---------- */

  function agendarCompasso(inicio, grau) {
    var compasso = BATIDA * 4;

    // colchao de acordes: ataque lento, sustenta o compasso inteiro
    grau.acordes.forEach(function (m) {
      nota('triangle', hz(m), inicio, compasso * 0.95, 0.12, 0.4);
    });

    // baixo na tonica e depois na quinta
    nota('sine', hz(grau.baixo), inicio, BATIDA * 1.6, 0.3, 0.02);
    nota('sine', hz(grau.baixo + 7), inicio + BATIDA * 2, BATIDA * 1.6, 0.24, 0.02);

    // melodia que passeia sem chegar a lugar nenhum
    for (var b = 0; b < 4; b++) {
      if (Math.random() > 0.62) continue;
      nota('sine', hz(escolha(grau.acordes) + 12),
        inicio + b * BATIDA + aleatorio(0, 0.05),
        BATIDA * aleatorio(0.6, 1.4), 0.16, 0.06);
    }

    // chiado em colcheias, com o tempo forte um pouco mais alto
    for (var c = 0; c < 8; c++) {
      chiado(inicio + c * (BATIDA / 2), c % 2 === 0 ? 0.05 : 0.025);
    }
  }

  /* Agenda sempre um pouco de futuro: setInterval sozinho nao tem precisao
     ritmica, o relogio do audio tem. */
  function agendar() {
    if (!contexto || contexto.state !== 'running') return;
    if (proximoCompasso < contexto.currentTime) proximoCompasso = contexto.currentTime + 0.1;
    while (proximoCompasso < contexto.currentTime + AGENDA_ADIANTE) {
      agendarCompasso(proximoCompasso, PROGRESSAO[indice % PROGRESSAO.length]);
      indice++;
      proximoCompasso += BATIDA * 4;
    }
  }

  /* ---------- inicio ---------- */

  function destravar() {
    contexto.resume();
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
      document.removeEventListener(ev, destravar, true);
    });
  }

  function iniciar() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;   // navegador sem Web Audio: o jogo segue em silencio

    contexto = new Ctx();
    mestre = contexto.createGain();
    mestre.gain.setValueAtTime(0.0001, contexto.currentTime);
    mestre.gain.exponentialRampToValueAtTime(VOLUME_MESTRE, contexto.currentTime + SUBIDA);
    mestre.connect(contexto.destination);

    proximoCompasso = contexto.currentTime + 0.2;
    setInterval(agendar, AGENDA_INTERVALO);

    // O navegador so libera audio depois de um gesto. Como o painel de
    // instrucoes abre no boot, o primeiro gesto e sempre o de fechar o painel:
    // a pessoa nunca pediu musica, e mesmo assim ela comeca.
    contexto.resume();
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
      document.addEventListener(ev, destravar, true);
    });

    // Nao existe pausa em lugar nenhum da pagina. Se o sistema suspender o
    // contexto, isto religa sozinho.
    setInterval(function () {
      if (contexto.state === 'suspended') contexto.resume();
    }, VIGIA_INTERVALO);
  }

  return { iniciar: iniciar };
})();
