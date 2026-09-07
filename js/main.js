/* main.js - amarra tudo: telas, busca com cooldown e botoes que fogem */

var Jogo = (function () {

  var cooldownBusca = 0;
  var timerReordena = null;

  function iniciar() {
    Prateleira.iniciar();
    Caixa.iniciar();
    ligarTitulo();
    ligarBusca();
    ligarPainel();
  }

  /* ---------- titulo ---------- */

  function ligarTitulo() {
    $('[data-acao="comecar"]').addEventListener('click', comecar);
    $('[data-acao="sair"]').addEventListener('click', function () {
      confirmar(
        'Tem certeza que NAO quer NAO sair sem comprar?',
        'Nao, nao quero nao',
        'Sim, nao nao',
        function () { toast('a saida esta trancada. bem vindo.'); }
      );
    });
    // os botoes trocam de lugar sozinhos
    setInterval(function () {
      if ($('#tela-titulo').classList.contains('ativa')) trocarLugares($('#botoes-titulo'));
    }, 3200);
  }

  function comecar() {
    iniciarEstado();
    Estado.jogoAtivo = true;
    mostrarTela('#tela-loja');
    Loja.iniciar();
    toast('bem vindo. boa sorte.');
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
          toast('prateleira destacada no mapa');
        });
        lista.appendChild(li);
      });
  }

  /* ---------- painel ---------- */

  function ligarPainel() {
    $('[data-acao="ir-caixa"]').addEventListener('click', function () {
      Estado.destaque = null;
      if (!listaCompleta()) {
        toast('faltam itens da lista');
        return;
      }
      toast('esse botao nao te leva ao caixa. dirija ate la.');
    });

    $('[data-acao="limpar"]').addEventListener('click', function () {
      confirmar(
        'Tem certeza que NAO quer NAO limpar o carrinho?',
        'Nao, nao quero nao limpar',
        'Sim, quero nao nao',
        function () { limparCarrinho(); toast('carrinho limpo. parabens.'); }
      );
    });

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

    var linhas = Estado.carrinho.map(function (l) {
      var nome = (l.nome + ' x' + l.qtd);
      while (nome.length < 26) nome += ' ';
      return nome + moeda(l.preco * l.qtd);
    });

    var sub = totalCarrinho();
    var conveniencia = sub * 0.37;
    var estacionamento = 18.5;
    var total = sub + conveniencia + estacionamento;

    $('#recibo-corpo').textContent =
      linhas.join('\n') +
      '\n--------------------------------\n' +
      'Subtotal                  ' + moeda(sub) + '\n' +
      'Taxa de conveniencia 37%  ' + moeda(conveniencia) + '\n' +
      'Estacionamento do carrinho ' + moeda(estacionamento) + '\n' +
      '--------------------------------\n' +
      'TOTAL                     ' + moeda(total);

    $('#recibo-piada').textContent =
      'Obrigado! Sua compra foi cancelada com sucesso. 😊';

    var caixa = $('#botoes-final');
    caixa.innerHTML = '';

    var b1 = document.createElement('button');
    b1.className = 'btn btn-mini';
    b1.textContent = 'Nao desfazer o cancelamento';
    b1.addEventListener('click', function () {
      $('#recibo-piada').textContent = 'Compra confirmada. Volte sempre (por favor nao).';
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
