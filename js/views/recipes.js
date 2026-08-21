/* =========================================================================
   VIEW — Rezeptideen
   Filterbar nach Frühstück/Mittag/Abend/Snack, aufklappbare Karten.
   ========================================================================= */

(function () {
  'use strict';

  var state = { meal: 'alle', openId: null };

  function render(root) {
    var meals = ['alle', 'fruehstueck', 'mittag', 'abend', 'snack'];
    var visible = CustomRecipes.all().filter(function (r) { return state.meal === 'alle' || r.meal === state.meal; });

    root.innerHTML =
      '<div class="view-header">' +
        '<span class="view-header__eyebrow">Rezeptideen</span>' +
        '<h1>Einfach kochen, gut sattwerden</h1>' +
        '<p>Unkomplizierte Gerichte mit Zutaten, Zubereitung und kurzer Begründung, warum sie eine gute Wahl sind. Kalorien- und Nährwertangaben sind grobe ca.-Richtwerte, keine exakten Werte. Eigene, im Wochenplaner angelegte Rezepte erscheinen hier automatisch mit.</p>' +
      '</div>' +
      '<div class="chip-row">' +
        meals.map(function (m) {
          var label = m === 'alle' ? 'Alle' : MEAL_LABELS[m];
          return '<button class="chip' + (m === state.meal ? ' is-active' : '') + '" data-meal="' + m + '">' + label + '</button>';
        }).join('') +
      '</div>' +
      '<div id="recipe-list">' +
        visible.map(function (r) { return recipeCard(r); }).join('') +
      '</div>';

    root.querySelectorAll('[data-meal]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.meal = chip.getAttribute('data-meal');
        render(root);
      });
    });

    root.querySelectorAll('.recipe-card__head').forEach(function (head) {
      head.addEventListener('click', function () {
        var card = head.closest('.recipe-card');
        var id = card.getAttribute('data-id');
        state.openId = state.openId === id ? null : id;
        render(root);
      });
    });
  }

  function recipeCard(r) {
    var open = state.openId === r.id;
    var ingredients = r.ingredients || [];
    var steps = r.steps || [];
    return '<article class="recipe-card' + (open ? ' is-open' : '') + '" data-id="' + r.id + '">' +
      '<div class="recipe-card__head" role="button" tabindex="0" aria-expanded="' + open + '">' +
        '<div>' +
          '<div class="recipe-card__title">' + Utils.escapeHtml(r.title) + (r.isCustom ? ' <span class="badge" style="vertical-align:middle;">Eigenes Rezept</span>' : '') + '</div>' +
          '<div class="recipe-card__meta"><span>' + MEAL_LABELS[r.meal] + '</span>' +
          (r.time ? '<span>·</span><span>' + Utils.escapeHtml(r.time) + '</span>' : '') +
          (r.kcal ? '<span>·</span><span>ca. ' + r.kcal + ' kcal</span>' : '') + '</div>' +
        '</div>' +
        '<span class="recipe-card__chevron">' + Icons.chevron(20) + '</span>' +
      '</div>' +
      '<div class="recipe-card__body">' +
        (ingredients.length ? '<div class="recipe-card__section-title">Zutaten</div>' +
        '<ul class="recipe-card__ingredients">' + ingredients.map(function (i) { return '<li>' + Utils.escapeHtml(i) + '</li>'; }).join('') + '</ul>' : '') +
        (steps.length ? '<div class="recipe-card__section-title">Zubereitung</div>' +
        '<ol class="recipe-card__steps">' + steps.map(function (s, i) { return '<li>' + (i + 1) + '. ' + Utils.escapeHtml(s) + '</li>'; }).join('') + '</ol>' : '') +
        (r.why ? '<div class="recipe-card__why"><strong>Warum gut:</strong> ' + Utils.escapeHtml(r.why) + '</div>' : '') +
        (r.macros ? nutritionRow(r) : '') +
      '</div>' +
    '</article>';
  }

  /** Dezente Nährwert-Zeile — klar als grobe Richtwerte gekennzeichnet. */
  function nutritionRow(r) {
    var m = r.macros;
    return '<div class="recipe-card__nutrition">' +
      '<span class="recipe-card__nutrition-values">' +
        '<span>ca. ' + r.kcal + ' kcal</span>' +
        '<span>' + m.protein + ' g Eiweiß</span>' +
        '<span>' + m.carbs + ' g Kohlenhydrate</span>' +
        '<span>' + m.fat + ' g Fett</span>' +
        '<span>' + m.fiber + ' g Ballaststoffe</span>' +
      '</span>' +
      '<span class="recipe-card__nutrition-note">Richtwerte pro Portion, keine exakten Angaben</span>' +
    '</div>';
  }

  window.Views = window.Views || {};
  window.Views.rezepte = { render: render };
})();
