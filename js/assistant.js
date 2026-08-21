/* =========================================================================
   ASSISTANT — kleiner, lokaler FAQ-Assistent (Fließtext-Suche).
   Reine Stichwortsuche über den in js/search.js gebauten Index
   (Lebensmittel, Rezepte, Übungen, Wissen-Kapitel). Keine externe KI,
   kein API-Key, funktioniert komplett offline. Erreichbar über eine
   schwebende Schaltfläche, die auf jeder Seite sichtbar ist.
   ========================================================================= */

(function () {
  'use strict';

  var EXAMPLES = [
    'Wie viel Eiweiß brauche ich?',
    'Warum ist Krafttraining wichtig?',
    'Was ist der Jo-Jo-Effekt?',
    'Wie viel Wasser am Tag?'
  ];

  var currentResults = [];
  var isOpen = false;
  var els = {};

  function truncate(text, max) {
    if (text.length <= max) return text;
    return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
  }

  var TYPE_BADGE = {
    food: 'badge--go',
    recipe: 'badge--caution',
    exercise: 'badge--stop',
    knowledge: ''
  };

  function resultCard(entry, index) {
    var badgeClass = TYPE_BADGE[entry.type] || '';
    return '<div class="assistant-result">' +
      '<span class="badge assistant-result__badge' + (badgeClass ? ' ' + badgeClass : '') + '">' + Utils.escapeHtml(entry.typeLabel) + '</span>' +
      '<div class="assistant-result__title">' + Utils.escapeHtml(entry.title) + '</div>' +
      '<p class="assistant-result__text">' + Utils.escapeHtml(truncate(entry.text, 200)) + '</p>' +
      '<button class="btn btn--ghost btn--sm assistant-result__open" data-open-result="' + index + '">Ansehen ' + Icons.arrowRight(14) + '</button>' +
    '</div>';
  }

  function renderResults(query) {
    if (!query || !query.trim()) {
      els.results.innerHTML =
        '<div class="assistant-empty">' +
          '<p class="text-sm text-soft">Frag zum Beispiel:</p>' +
          '<div class="chip-row" style="margin-bottom:0;">' +
            EXAMPLES.map(function (ex) { return '<button class="chip assistant-example" type="button">' + Utils.escapeHtml(ex) + '</button>'; }).join('') +
          '</div>' +
        '</div>';
      bindExamples();
      return;
    }

    currentResults = Search.query(query, 8);

    if (!currentResults.length) {
      els.results.innerHTML = '<div class="assistant-empty"><p class="text-sm text-soft">Dazu habe ich nichts gefunden. Versuch es mit einem anderen Stichwort — z. B. einem Lebensmittel, Rezept, einer Übung oder einem Thema wie „Schlaf“ oder „Ballaststoffe“.</p></div>';
      return;
    }

    els.results.innerHTML = currentResults.map(resultCard).join('');
    els.results.querySelectorAll('[data-open-result]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var entry = currentResults[parseInt(btn.getAttribute('data-open-result'), 10)];
        openResult(entry);
      });
    });
  }

  function bindExamples() {
    els.results.querySelectorAll('.assistant-example').forEach(function (btn) {
      btn.addEventListener('click', function () {
        els.input.value = btn.textContent;
        renderResults(btn.textContent);
        els.input.focus();
      });
    });
  }

  function openResult(entry) {
    closePanel();
    location.hash = '#/' + entry.route;
    Router.show(entry.route);
    if (entry.route === 'wissen' && entry.anchor && window.Views.wissen && window.Views.wissen.openAndScroll) {
      window.Views.wissen.openAndScroll(entry.anchor);
    }
  }

  function openPanel() {
    isOpen = true;
    els.backdrop.classList.add('is-open');
    els.panel.classList.add('is-open');
    els.fab.setAttribute('aria-expanded', 'true');
    renderResults(els.input.value);
    setTimeout(function () { els.input.focus(); }, 50);
  }

  function closePanel() {
    isOpen = false;
    els.backdrop.classList.remove('is-open');
    els.panel.classList.remove('is-open');
    els.fab.setAttribute('aria-expanded', 'false');
  }

  function togglePanel() {
    if (isOpen) closePanel(); else openPanel();
  }

  function buildDom() {
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="assistant-backdrop" id="assistant-backdrop"></div>' +
      '<button class="assistant-fab" id="assistant-fab" aria-haspopup="dialog" aria-expanded="false" aria-label="Frage stellen">' + Icons.chat(24) + '</button>' +
      '<div class="assistant-panel" id="assistant-panel" role="dialog" aria-label="Frag mich">' +
        '<div class="assistant-panel__header">' +
          '<strong>Frag mich</strong>' +
          '<button class="btn btn--icon btn--ghost" id="assistant-close" aria-label="Schließen">' + Icons.close(18) + '</button>' +
        '</div>' +
        '<div class="search-input assistant-panel__search">' + Icons.search(18) +
          '<input type="search" id="assistant-input" placeholder="Frag etwas zu Ernährung, Training …" aria-label="Frage eingeben">' +
        '</div>' +
        '<p class="text-sm text-soft assistant-panel__hint">Durchsucht Lebensmittel, Rezepte, Übungen und die Wissen-Kapitel — rein lokal, keine Internetverbindung nötig.</p>' +
        '<div class="assistant-panel__results" id="assistant-results"></div>' +
      '</div>';
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

    els.backdrop = document.getElementById('assistant-backdrop');
    els.fab = document.getElementById('assistant-fab');
    els.panel = document.getElementById('assistant-panel');
    els.close = document.getElementById('assistant-close');
    els.input = document.getElementById('assistant-input');
    els.results = document.getElementById('assistant-results');

    els.fab.addEventListener('click', togglePanel);
    els.close.addEventListener('click', closePanel);
    els.backdrop.addEventListener('click', closePanel);
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && isOpen) closePanel();
    });
    els.input.addEventListener('input', Utils.debounce(function () {
      renderResults(els.input.value);
    }, 150));
  }

  function init() {
    buildDom();
    renderResults('');
  }

  window.Assistant = { init: init, open: openPanel, close: closePanel };
})();
