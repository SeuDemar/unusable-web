/* catalogo.js - a vitrine que parece um e-commerce normal, e o botao que mente.

   Esta e a tela inicial do jogo. Ela existe para o contraste: e a unica parte do
   app que se comporta como um site de verdade, ate a pessoa clicar em "Adicionar
   ao carrinho" e descobrir que o botao so a joga dentro do minigame.

   NAO conserte o botao. Se ele passar a adicionar de verdade, vira exatamente a
   alternativa por ponteiro unico que a WCAG 2.5.7 exige, e derruba a violacao de
   nivel AA mais demonstravel do projeto. Ver docs/WCAG.md, secao 2.5.7. */

var Catalogo = (function () {

  function iniciar() {
    $('[data-acao="voltar-secoes"]').addEventListener('click', mostrarSecoes);
    montarSecoes();
  }

  /* Sair do mapa para o catalogo. Quem chama e responsavel por nada mais: o
     catalogo e uma <section class="tela">, nao um .overlay, entao ele NAO congela
     a fisica sozinho - por isso o Loja.parar() mora aqui. */
  function abrir() {
    Loja.parar();
    mostrarSecoes();
    mostrarTela('#tela-catalogo');
  }

  function passo(id) {
    $$('.passo').forEach(function (e) { e.classList.remove('ativa'); });
    $(id).classList.add('ativa');
  }

  function mostrarSecoes() {
    passo('#passo-secoes');
  }

  /* ---------- grade de secoes ---------- */

  function montarSecoes() {
    var grade = $('#catalogo-secoes');
    grade.innerHTML = '';

    PRATELEIRAS.forEach(function (p, i) {
      // WCAG 4.1.2 Name, Role, Value (A) e 1.3.1 Info and Relationships (A):
      // div fazendo papel de botao, sem role e sem relacao declarada com a grade.
      var el = document.createElement('div');
      el.className = 'secao-card';
      el.tabIndex = 40 + i;
      el.innerHTML =
        '<span class="secao-emoji">' +
        p.produtos.map(function (prod) { return prod.emoji; }).join('') +
        '</span>' +
        '<span class="secao-nome">' + p.nome + '</span>' +
        '<span class="secao-conta">' + p.produtos.length + ' itens</span>';
      el.addEventListener('click', function () { montarItens(p); });
      grade.appendChild(el);
    });
  }

  /* ---------- grade de produtos de uma secao ---------- */

  function montarItens(prateleira) {
    var grade = $('#catalogo-itens');
    grade.innerHTML = '';
    $('#catalogo-secao-nome').textContent = prateleira.nome;

    prateleira.produtos.forEach(function (prod, i) {
      var el = document.createElement('div');
      el.className = 'item-catalogo';

      var topo = document.createElement('div');
      topo.className = 'item-topo';
      // O preco "de" e o preco atual sao dois spans irmaos, sem <del>/<ins> e sem
      // relacao declarada. WCAG 1.3.1 Info and Relationships (A).
      topo.innerHTML =
        '<span class="emoji">' + prod.emoji + '</span>' +
        '<span class="nome">' + prod.nome + '</span>' +
        '<span class="preco-de">' + moeda(prod.precoDe) + '</span>' +
        '<span class="preco">' + moeda(prod.preco) + '</span>';

      // Botao de verdade, com nome acessivel correto: a mentira esta so no
      // comportamento. E assim que a violacao de 3.2.4 fica limpa de demonstrar.
      var botao = document.createElement('button');
      botao.className = 'btn btn-mini';
      botao.textContent = 'Adicionar ao carrinho';
      botao.tabIndex = 46 + i;
      botao.addEventListener('click', function () { escolherProduto(prod, prateleira); });

      el.appendChild(topo);
      el.appendChild(botao);
      grade.appendChild(el);
    });

    passo('#passo-itens');
  }

  /* ---------- o troll central ---------- */

  function escolherProduto(prod, prateleira) {
    Estado.escolhido = {
      id: prod.id, nome: prod.nome, emoji: prod.emoji, prateleiraId: prateleira.id
    };
    Estado.destaque = prateleira.id;   // reaproveita o realce que a busca ja usa
    renderPainel();

    /* WCAG 3.2.4 Consistent Identification (AA): o botao diz "Adicionar ao
       carrinho" e nao adiciona nada. Repare que nao ha chamada a
       adicionarAoCarrinho aqui, e nao pode haver: encher a sacola continua sendo
       so por arrasto na prateleira (WCAG 2.5.7 Dragging Movements). */
    toast('adicionado! (nao foi)');

    mostrarTela('#tela-loja');
    Loja.retomar(true);
    toast('um manobrista levou seu carrinho pra entrada');
  }

  return { iniciar: iniciar, abrir: abrir };
})();
