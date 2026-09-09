/* main.js - amarra tudo: boot direto no jogo, barra superior, cookies,
   busca com cooldown e botoes que trocam de lugar */

var Jogo = (function () {

  var cooldownBusca = 0;
  var timerReordena = null;
  var restaOferta = 0;

  function iniciar() {
    Prateleira.iniciar();
    Caixa.iniciar();
    Musica.iniciar();
    ligarInstrucoes();
    ligarOferta();
    ligarCookies();
    ligarBusca();
    ligarPainel();
    comecar();
  }

  /* ---------- boot direto, sem tela de titulo ---------- */

  function comecar() {
    iniciarEstado();
    Estado.jogoAtivo = true;
    Loja.iniciar();
    // O jogo abre com as instrucoes na frente. Como qualquer overlay congela a
    // fisica, o carrinho so comeca a andar depois que a pessoa fecha o painel.
    abrirInstrucoes();
  }

  /* ---------- instrucoes: o unico componente honesto ---------- */

  function ligarInstrucoes() {
    $('#btn-instrucoes').addEventListener('click', abrirInstrucoes);
    $('[data-acao="fechar-instrucoes"]').addEventListener('click', fecharInstrucoes);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && $('#overlay-instrucoes').classList.contains('ativa')) {
        fecharInstrucoes();
      }
    });
  }

  function abrirInstrucoes() {
    abrirOverlay('#overlay-instrucoes');
    $('[data-acao="fechar-instrucoes"]').focus();
  }

  function fecharInstrucoes() {
    fecharOverlay('#overlay-instrucoes');
    Loja.zerarOcio();
  }

  /* ---------- oferta que nunca acaba ---------- */

  function ligarOferta() {
    reiniciarOferta();
    setInterval(function () {
      restaOferta--;
      if (restaOferta <= 0) reiniciarOferta();   // a oferta nunca termina de verdade
      var m = Math.floor(restaOferta / 60), s = restaOferta % 60;
      $('#oferta-tempo').textContent =
        (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }, 1000);

    // Opt-in explicito para a violacao real de 2.3.1 (acima de 3 Hz).
    // Desligado por padrao e nunca ativado sozinho.
    $('#btn-flash').addEventListener('click', function () {
      var oferta = $('#oferta');
      var ligando = !oferta.classList.contains('intenso');
      if (ligando) {
        var ok = window.confirm(
          'AVISO DE SAUDE\n\n' +
          'O modo intenso faz o aviso de oferta piscar acima de 3 vezes por segundo.\n' +
          'Isso pode desencadear convulsoes em pessoas com epilepsia fotossensivel.\n\n' +
          'Ativar mesmo assim?');
        if (!ok) return;
      }
      oferta.classList.toggle('intenso');
      toast(ligando ? 'modo intenso ligado' : 'modo intenso desligado');
    });
  }

  function reiniciarOferta() {
    restaOferta = inteiro(180, 900);
  }

  /* ---------- aviso de cookies que nao aceita nao ---------- */

  function ligarCookies() {
    var barra = $('#cookies');

    setTimeout(function () { barra.classList.add('ativa'); }, 1500);

    $('#btn-cookie-ok').addEventListener('click', function () {
      barra.classList.remove('ativa');
      toast('preferencias salvas (todas)');
    });

    // Recusar so adia. A barra volta sozinha alguns segundos depois.
    $('#btn-cookie-nao').addEventListener('click', function () {
      barra.classList.remove('ativa');
      toast('vamos perguntar de novo');
      setTimeout(function () { barra.classList.add('ativa'); }, 7000);
    });
  }

  /* ---------- busca com cooldown ---------- */

  function ligarBusca() {
    var campo = $('#busca');
    var status = $('#busca-status');

    campo.addEventListener('keydown', function (e) {
      if (e.key.length !== 1 && e.key !== 'Backspace') return;
      var agora = performance.now();
      if (agora < cooldownBusca) {
        e.preventDefault();
        status.textContent = 'aguarde ' + Math.ceil((cooldownBusca - agora) / 100) / 10 + 's';
        return;
      }
      cooldownBusca = agora + 800;
      status.textContent = 'processando letra...';
      setTimeout(function () { status.textContent = ''; }, 800);
    });

    campo.addEventListener('input', function () { renderBusca(campo.value); });

    // WCAG 1.4.13 Content on Hover or Focus (AA): a lista se reordena sozinha
    var lista = $('#busca-resultados');
    lista.addEventListener('mouseenter', function () {
      timerReordena = setInterval(function () { trocarLugares(lista); }, 1100);
    });
    lista.addEventListener('mouseleave', function () { clearInterval(timerReordena); });
  }

  function renderBusca(texto) {
    var lista = $('#busca-resultados');
    lista.innerHTML = '';
    var alvo = texto.trim().toLowerCase();
    if (!alvo) return;

    todosProdutos()
      .filter(function (par) { return par.produto.nome.toLowerCase().indexOf(alvo) >= 0; })
      .slice(0, 6)
      .forEach(function (par) {
        var li = document.createElement('li');
        li.textContent = par.produto.emoji + ' ' + par.produto.nome + ' - ' + par.prateleira.nome;
        li.addEventListener('click', function () {
          Estado.destaque = par.prateleira.id;
          lista.innerHTML = '';
          $('#busca').value = '';
          toast('secao destacada no mapa');
        });
        lista.appendChild(li);
      });
  }

  /* ---------- HUD ---------- */

  function ligarPainel() {
    $('[data-acao="ir-caixa"]').addEventListener('click', function () {
      Estado.destaque = null;
      if (!listaCompleta()) {
        toast('faltam itens da lista');
        return;
      }
      // WCAG 3.2.4 Consistent Identification (AA): o botao nao faz o que diz
      toast('esse botao nao finaliza nada. dirija ate PASSAR COMPRAS.');
    });

    $('[data-acao="limpar"]').addEventListener('click', function () {
      confirmar(
        'Tem certeza que NAO quer NAO esvaziar a sacola?',
        'Nao, nao quero nao esvaziar',
        'Sim, quero nao nao',
        function () { limparCarrinho(); toast('sacola esvaziada. parabens.'); }
      );
    });

    $('#badge-carrinho').addEventListener('click', function () {
      toast('a sacola ja esta na sua frente');
    });

    // WCAG 2.2.2 Pause, Stop, Hide (A): os botoes trocam de lugar sozinhos
    setInterval(function () {
      if ($('#tela-loja').classList.contains('ativa') && !overlayAberto()) {
        trocarLugares($('#botoes-carrinho'));
      }
    }, 4000);
  }

  /* ---------- fim ---------- */

  function finalizar() {
    Estado.jogoAtivo = false;
    Loja.parar();
    $('#cookies').classList.remove('ativa');

    var linhas = Estado.carrinho.map(function (l) {
      var nome = (l.nome + ' x' + l.qtd);
      while (nome.length < 24) nome += ' ';
      return nome + moeda(l.preco * l.qtd);
    });

    var sub = totalCarrinho();
    var conveniencia = sub * 0.37;
    var frete = 18.5;
    var total = sub + conveniencia + frete;

    $('#recibo-corpo').textContent =
      linhas.join('\n') +
      '\n------------------------------\n' +
      'Subtotal                ' + moeda(sub) + '\n' +
      'Taxa de conveniencia    ' + moeda(conveniencia) + '\n' +
      'Frete "gratis"          ' + moeda(frete) + '\n' +
      '------------------------------\n' +
      'TOTAL                   ' + moeda(total);

    $('#recibo-piada').textContent =
      'Obrigado! Seu pedido foi cancelado com sucesso.';

    var caixa = $('#botoes-final');
    caixa.innerHTML = '';

    var b1 = document.createElement('button');
    b1.className = 'btn btn-mini';
    b1.textContent = 'Nao desfazer o cancelamento';
    b1.addEventListener('click', function () {
      $('#recibo-piada').textContent = 'Pedido confirmado. Chega em 40 a 90 dias uteis.';
      b1.remove();
    });

    var b2 = document.createElement('button');
    b2.className = 'btn btn-mini btn-fantasma';
    b2.textContent = 'Comprar de novo';
    b2.addEventListener('click', function () { location.reload(); });

    caixa.appendChild(b1);
    caixa.appendChild(b2);

    mostrarTela('#tela-final');
  }

  return { iniciar: iniciar, finalizar: finalizar };
})();

window.addEventListener('DOMContentLoaded', function () { Jogo.iniciar(); });
