/* =========================================================================
   VIEW — Wissen
   Acht Kapitel Grundlagenwissen als Fließtext zum Durchlesen (kein
   Glossar/Lexikon). Inhaltsverzeichnis mit Sprungmarken oben, jedes
   Kapitel zusätzlich einzeln auf-/zuklappbar. Standardmäßig sind alle
   Kapitel offen, damit sich die Seite wie ein durchgehender Artikel liest.
   ========================================================================= */

(function () {
  'use strict';

  // Welche Kapitel eingeklappt sind (per id) — standardmäßig keins.
  var collapsed = {};

  /**
   * Springt zu einem Kapitel auf dieser Seite, ohne den Router-Hash zu
   * verändern (der ist für die App-Navigation reserviert, #/wissen etc.).
   * Wird auch vom Assistenten genutzt, um nach einem Seitenwechsel zur
   * passenden Stelle zu scrollen.
   */
  function jumpToChapter(id) {
    collapsed[id] = false;
    var el = document.getElementById(id);
    if (!el) return;
    // Bewusst ohne "smooth": Scroll-Animationen werden von Browsern in
    // Hintergrund-Tabs gedrosselt/übersprungen und bringen dann gar
    // keine Bewegung mehr zustande. Ein sofortiger Sprung ist hier
    // zuverlässiger — und respektiert reduced-motion ohnehin von selbst.
    el.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

  function renderToc() {
    return '<div class="card knowledge-toc">' +
      '<h3 class="mt-0">Inhaltsverzeichnis</h3>' +
      '<ul class="stack" style="gap: 2px;">' +
        KNOWLEDGE_CHAPTERS.map(function (ch) {
          return '<li><a href="#" class="knowledge-toc__link" data-jump="' + ch.id + '">' +
            '<span class="knowledge-toc__num">' + Utils.pad(ch.number) + '</span>' +
            '<span>' + Utils.escapeHtml(ch.title) + '</span>' +
          '</a></li>';
        }).join('') +
      '</ul>' +
    '</div>';
  }

  function renderChapter(ch) {
    var isOpen = !collapsed[ch.id];
    return '<section class="knowledge-chapter" id="' + ch.id + '">' +
      '<button class="knowledge-chapter__head" data-toggle="' + ch.id + '" aria-expanded="' + isOpen + '">' +
        '<span class="knowledge-chapter__num">' + Utils.pad(ch.number) + '</span>' +
        '<h2 class="knowledge-chapter__title">' + Utils.escapeHtml(ch.title) + '</h2>' +
        '<span class="knowledge-chapter__chevron' + (isOpen ? ' is-open' : '') + '">' + Icons.chevron(20) + '</span>' +
      '</button>' +
      '<div class="knowledge-chapter__body"' + (isOpen ? '' : ' hidden') + '>' +
        ch.paragraphs.map(function (p) { return '<p>' + Utils.escapeHtml(p) + '</p>'; }).join('') +
      '</div>' +
    '</section>';
  }

  function render(root) {
    root.innerHTML =
      '<div class="view-header">' +
        '<span class="view-header__eyebrow">Wissen</span>' +
        '<h1>Die Grundlagen, einmal verständlich erklärt</h1>' +
        '<p>Acht kurze Kapitel zu Ernährung, Training und Regeneration — zum Durchlesen, nicht zum Nachschlagen. Basiert auf aktuellen DGE- und WHO-Empfehlungen.</p>' +
      '</div>' +
      renderToc() +
      '<div class="knowledge-chapters" style="margin-top: var(--space-5);">' +
        KNOWLEDGE_CHAPTERS.map(renderChapter).join('') +
      '</div>';

    root.querySelectorAll('[data-jump]').forEach(function (link) {
      link.addEventListener('click', function (ev) {
        ev.preventDefault();
        var id = link.getAttribute('data-jump');
        var wasCollapsed = collapsed[id];
        if (wasCollapsed) {
          // Kapitel war zugeklappt — neu rendern, damit es beim Scrollen offen ist.
          collapsed[id] = false;
          render(root);
        }
        jumpToChapter(id);
      });
    });

    root.querySelectorAll('[data-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-toggle');
        collapsed[id] = !collapsed[id];
        render(root);
      });
    });
  }

  /**
   * Öffentliche API für den Assistenten: Kapitel aufklappen (falls
   * zugeklappt), neu rendern und dorthin scrollen — funktioniert auch,
   * wenn die Wissen-Seite gerade erst aktiv wurde.
   */
  function openAndScroll(id) {
    collapsed[id] = false;
    var root = document.getElementById('view-wissen');
    if (root) render(root);
    // Kurz warten: Router.show() scrollt beim Seitenwechsel selbst nach
    // oben (window.scrollTo(0,0)) — ohne die Verzögerung würde dieser
    // Sprung mit unserem gezielten Scroll zum Kapitel kollidieren. Ein
    // Timer statt requestAnimationFrame, damit es unabhängig vom
    // Render-/Compositing-Status zuverlässig auslöst.
    setTimeout(function () { jumpToChapter(id); }, 30);
  }

  window.Views = window.Views || {};
  window.Views.wissen = { render: render, openAndScroll: openAndScroll };
})();
