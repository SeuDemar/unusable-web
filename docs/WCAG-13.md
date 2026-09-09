# 13 violações da WCAG 2.2 — resumo

Recorte mínimo do catálogo completo em [`docs/WCAG.md`](WCAG.md), que traz todos os
critérios com norma exigida, código e versão conforme.

1. **1.1.1 Non-text Content** — o mapa é um `<canvas>` sem alternativa textual; células
   do captcha são identificadas só por emoji, sem texto nem `aria-label`.
2. **1.4.2 Audio Control** — música de elevador sintetizada toca sozinha e sem nenhum
   controle de pausa, mudo ou volume na página.
3. **1.4.3 Contrast (Minimum)** — preço riscado e outros textos usam cinza-claro sobre
   fundo claro, abaixo do mínimo de 4.5:1.
4. **1.4.4 Resize Text** — `user-scalable=no` e `maximum-scale=1` no viewport bloqueiam
   o zoom do navegador.
5. **2.1.1 Keyboard** — arrastar produto, passar no leitor e marcar o captcha só
   funcionam com ponteiro, sem equivalente de teclado.
6. **2.1.2 No Keyboard Trap** — no pagamento, `Tab` é interceptado e o foco pula para
   uma tecla aleatória do teclado numérico até completar os dígitos do cartão.
7. **2.2.1 Timing Adjustable** — prazo de 3 min de mapa e recolhimento por 60 s de
   ócio, nenhum ajustável ou desligável.
8. **2.2.2 Pause, Stop, Hide** — aviso de oferta pisca, setas do mapa oscilam sem
   parar, e nada disso tem controle de pausar/ocultar.
9. **2.4.3 Focus Order** — `tabindex` positivos arbitrários fazem o `Tab` saltar sem
   relação com a ordem visual da tela.
10. **2.4.7 Focus Visible** — `outline: none` global remove o indicador de foco de
    todos os controles do site.
11. **2.5.7 Dragging Movements** — colocar produto na sacola só é possível arrastando;
    não existe clique alternativo em lugar nenhum.
12. **2.5.8 Target Size (Minimum)** — o botão de recusar cookies mede 12×12 px, bem
    abaixo do mínimo de 24×24 px.
13. **3.2.4 Consistent Identification** — "Adicionar ao carrinho" não adiciona nada, só
    marca o produto e troca de tela; "Finalizar" também não finaliza.
