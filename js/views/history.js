/* =========================================================================
   VIEW — Verlauf (eingebettet auf dem Dashboard, siehe js/views/dashboard.js)
   Tagesansicht mit Vor/Zurück-Navigation und Datumsauswahl, in der sich
   Essen, Getränke, Schlaf, Übungen und Schritte für JEDEN Tag ansehen und
   auch rückwirkend nachtragen lassen — plus eine Wochen-/Monatsliste zum
   schnellen Reinspringen in einen bestimmten Tag. Nutzt überall DayLog
   (js/day-log.js), denselben datumsbasierten Zugriff wie Dashboard und
   Bewegung für "heute".
   ========================================================================= */

(function () {
  'use strict';

  var state = { date: Utils.todayISO(), rangeDays: 7 };

  function combinedEntries(date) {
    var food = DayLog.getFood(date).map(function (e) {
      return { id: e.id, name: e.name, kcal: e.kcal, remove: 'data-hist-remove-food' };
    });
    var drinks = DayLog.getDrinks(date).map(function (e) {
      return { id: e.id, name: e.name, kcal: e.kcal, remove: 'data-hist-remove-drink' };
    });
    return food.concat(drinks);
  }

  function entryListHtml(entries) {
    if (!entries.length) return '<p class="text-sm text-soft" style="margin-top: var(--space-2);">Noch nichts eingetragen.</p>';
    return '<ul class="stack" style="gap:0; margin-top: var(--space-2);">' +
      entries.map(function (e) {
        return '<li class="shop-item"><span style="flex:1">' + Utils.escapeHtml(e.name) + '</span>' +
          '<strong style="margin-right:var(--space-2);">' + e.kcal + ' kcal</strong>' +
          '<button class="shop-item__remove" ' + e.remove + '="' + e.id + '" aria-label="' + Utils.escapeHtml(e.name) + ' entfernen">' + Icons.trash(15) + '</button>' +
        '</li>';
      }).join('') +
    '</ul>';
  }

  function exerciseListHtml(date) {
    var doneIds = DayLog.getExercisesDone(date);
    if (!doneIds.length) return '<p class="text-sm text-soft" style="margin-top: var(--space-2);">Keine Übung erfasst.</p>';
    return '<ul class="stack" style="gap:0; margin-top: var(--space-2);">' +
      doneIds.map(function (id) {
        return '<li class="shop-item"><span style="flex:1">' + Utils.escapeHtml(MovementCalc.exerciseName(id)) + '</span>' +
          '<button class="shop-item__remove" data-hist-remove-exercise="' + id + '" aria-label="entfernen">' + Icons.trash(15) + '</button>' +
        '</li>';
      }).join('') +
    '</ul>';
  }

  function exerciseOptionsHtml() {
    return MovementCalc.allExerciseOptions().map(function (o) {
      return '<option value="' + o.id + '">' + Utils.escapeHtml(o.name) + '</option>';
    }).join('');
  }

  function dayDetailHtml() {
    var date = state.date;
    var today = Utils.todayISO();
    var entries = combinedEntries(date);
    var eaten = DayLog.foodKcal(date) + DayLog.drinkKcal(date);
    var burned = MovementCalc.burnedKcalForDate(date);
    var water = DayLog.getWaterMl(date);
    var sleep = DayLog.getSleep(date);
    var steps = DayLog.getSteps(date);

    return '<div class="flex-between" style="gap: var(--space-2);">' +
        '<button class="btn btn--icon btn--secondary" id="hist-prev-day" aria-label="Vorheriger Tag">' + Icons.arrowLeft(16) + '</button>' +
        '<div style="text-align:center; flex:1; min-width:0;">' +
          '<div style="font-weight:700;">' + Utils.formatDateLong(date) + '</div>' +
          (date !== today ? '<button class="btn btn--ghost btn--sm" id="hist-today" style="padding:2px;">Zu heute springen</button>' : '<span class="text-sm text-soft">Heute</span>') +
        '</div>' +
        '<button class="btn btn--icon btn--secondary" id="hist-next-day" aria-label="Nächster Tag"' + (date >= today ? ' disabled' : '') + '>' + Icons.arrowRight(16) + '</button>' +
      '</div>' +
      '<input type="date" class="input" id="hist-date-input" style="margin-top: var(--space-3);" value="' + date + '" max="' + today + '">' +

      '<div class="hr" style="margin: var(--space-4) 0;"></div>' +

      '<h4 class="mt-0">Gegessen & getrunken <span class="text-soft" style="font-weight:600;">· ' + eaten + ' kcal</span></h4>' +
      entryListHtml(entries) +
      '<form id="hist-food-form" class="input-row" style="margin-top: var(--space-3);">' +
        '<div class="field" style="margin-bottom:0; flex:2;"><label for="hist-food-name">Essen nachtragen</label><input class="input" id="hist-food-name" type="text" placeholder="Name"></div>' +
        '<div class="field" style="margin-bottom:0;"><label for="hist-food-kcal">kcal</label><input class="input" id="hist-food-kcal" type="number" min="0" max="3000" placeholder="z. B. 350"></div>' +
        '<button class="btn btn--secondary" type="submit">' + Icons.plus(16) + '</button>' +
      '</form>' +
      '<form id="hist-drink-form" class="input-row" style="margin-top: var(--space-2);">' +
        '<div class="field" style="margin-bottom:0; flex:2;"><label for="hist-drink-name">Getränk nachtragen</label><input class="input" id="hist-drink-name" type="text" placeholder="Name"></div>' +
        '<div class="field" style="margin-bottom:0;"><label for="hist-drink-kcal">kcal</label><input class="input" id="hist-drink-kcal" type="number" min="0" max="1500" placeholder="z. B. 150"></div>' +
        '<div class="field" style="margin-bottom:0;"><label for="hist-drink-ml">ml</label><input class="input" id="hist-drink-ml" type="number" min="0" max="2000" placeholder="z. B. 300"></div>' +
        '<button class="btn btn--secondary" type="submit">' + Icons.plus(16) + '</button>' +
      '</form>' +

      '<div class="hr" style="margin: var(--space-4) 0;"></div>' +

      '<h4 class="mt-0">Schlaf</h4>' +
      '<div class="flex-between">' +
        '<span class="stat__value">' + (sleep == null ? '—' : sleep.toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' Std.') + '</span>' +
        '<div style="display:flex; align-items:center; gap: var(--space-2);">' +
          '<button class="btn btn--icon btn--secondary" id="hist-sleep-minus" aria-label="0,5 Stunden weniger">' + Icons.minus(16) + '</button>' +
          '<button class="btn btn--icon btn--secondary" id="hist-sleep-plus" aria-label="0,5 Stunden mehr">' + Icons.plus(16) + '</button>' +
        '</div>' +
      '</div>' +

      '<div class="hr" style="margin: var(--space-4) 0;"></div>' +

      '<h4 class="mt-0">Wasser</h4>' +
      '<div class="flex-between">' +
        '<span class="stat__value">' + (water / 1000).toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' l</span>' +
        '<div style="display:flex; align-items:center; gap: var(--space-2);">' +
          '<button class="btn btn--icon btn--secondary" id="hist-water-minus" aria-label="Ein Glas abziehen">' + Icons.minus(16) + '</button>' +
          '<button class="btn btn--icon btn--secondary" id="hist-water-plus" aria-label="Ein Glas hinzufügen">' + Icons.plus(16) + '</button>' +
        '</div>' +
      '</div>' +

      '<div class="hr" style="margin: var(--space-4) 0;"></div>' +

      '<h4 class="mt-0">Bewegung <span class="text-soft" style="font-weight:600;">· ca. ' + burned + ' kcal</span></h4>' +
      exerciseListHtml(date) +
      '<form id="hist-exercise-form" class="input-row" style="margin-top: var(--space-3);">' +
        '<div class="field" style="margin-bottom:0; flex:2;"><label for="hist-exercise-select">Übung/Sportart nachtragen</label>' +
          '<select class="input" id="hist-exercise-select">' + exerciseOptionsHtml() + '</select>' +
        '</div>' +
        '<button class="btn btn--secondary" type="submit">' + Icons.plus(16) + '</button>' +
      '</form>' +
      '<div class="field" style="margin-top: var(--space-3); margin-bottom:0;">' +
        '<label for="hist-steps-input">Schritte</label>' +
        '<div class="input-row" style="margin-bottom:0;">' +
          '<input class="input" id="hist-steps-input" type="number" min="0" max="100000" step="100" value="' + (steps != null ? steps : '') + '" placeholder="z. B. 8000">' +
          '<button class="btn btn--secondary btn--sm" id="hist-steps-save">Speichern</button>' +
        '</div>' +
      '</div>';
  }

  function dayRowHtml(date) {
    var eaten = DayLog.foodKcal(date) + DayLog.drinkKcal(date);
    var burned = MovementCalc.burnedKcalForDate(date);
    var water = DayLog.getWaterMl(date);
    var sleep = DayLog.getSleep(date);
    var hasAny = eaten > 0 || burned > 0 || water > 0 || sleep != null;

    var parts = [];
    if (eaten > 0) parts.push(eaten + ' kcal gegessen');
    if (burned > 0) parts.push('ca. ' + burned + ' kcal verbrannt');
    if (water > 0) parts.push((water / 1000).toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' l');
    if (sleep != null) parts.push(sleep.toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' Std. Schlaf');

    var meta = hasAny ? parts.join(' · ') : 'Keine Einträge';
    var selected = date === state.date;
    return '<button class="plan-picker__recipe-item" style="' + (selected ? 'background: var(--color-primary-tint); border-radius: var(--radius-sm);' : '') + '" data-hist-day="' + date + '">' +
      '<strong>' + Utils.formatDateLong(date) + '</strong><span>' + meta + '</span>' +
    '</button>';
  }

  function overviewHtml() {
    var today = Utils.todayISO();
    var days = [];
    for (var i = state.rangeDays - 1; i >= 0; i--) days.push(Utils.addDays(today, -i));

    return '<div class="chip-row" style="margin-top: var(--space-2);">' +
        '<button class="chip' + (state.rangeDays === 7 ? ' is-active' : '') + '" data-hist-range="7">Letzte 7 Tage</button>' +
        '<button class="chip' + (state.rangeDays === 30 ? ' is-active' : '') + '" data-hist-range="30">Letzte 30 Tage</button>' +
      '</div>' +
      '<div style="margin-top: var(--space-2); max-height: 340px; overflow-y: auto;">' +
        days.slice().reverse().map(dayRowHtml).join('') +
      '</div>';
  }

  function render(root) {
    if (!root) return;

    root.innerHTML =
      '<div class="card" style="margin-top: var(--space-4);">' +
        '<h3 class="mt-0">Verlauf</h3>' +
        '<p class="text-sm text-soft mt-0">Sieh dir vergangene Tage an oder trag rückwirkend etwas nach.</p>' +
        dayDetailHtml() +
      '</div>' +
      '<div class="card" style="margin-top: var(--space-4);">' +
        '<h3 class="mt-0">Wochen-/Monatsübersicht</h3>' +
        overviewHtml() +
      '</div>';

    bind(root);
  }

  /** Nach jeder Aktion wird bewusst das GANZE Dashboard neu gerendert
   *  (nicht nur der Verlauf-Bereich) — sonst zeigt die Tagesbilanz oben
   *  veraltete Zahlen, wenn man über den Verlauf rückwirkend etwas für
   *  HEUTE einträgt. */
  function refresh() {
    var dashRoot = document.getElementById('view-dashboard');
    if (dashRoot && window.Views && window.Views.dashboard) {
      Views.dashboard.render(dashRoot);
    } else {
      render(document.getElementById('verlauf-embed'));
    }
  }

  function bind(root) {
    var d = state.date;

    var prevBtn = root.querySelector('#hist-prev-day');
    if (prevBtn) prevBtn.addEventListener('click', function () { state.date = Utils.addDays(d, -1); refresh(); });

    var nextBtn = root.querySelector('#hist-next-day');
    if (nextBtn && !nextBtn.disabled) nextBtn.addEventListener('click', function () { state.date = Utils.addDays(d, 1); refresh(); });

    var todayBtn = root.querySelector('#hist-today');
    if (todayBtn) todayBtn.addEventListener('click', function () { state.date = Utils.todayISO(); refresh(); });

    var dateInput = root.querySelector('#hist-date-input');
    if (dateInput) dateInput.addEventListener('change', function () {
      if (dateInput.value) { state.date = dateInput.value; refresh(); }
    });

    root.querySelectorAll('[data-hist-day]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.date = btn.getAttribute('data-hist-day');
        refresh();
      });
    });

    root.querySelectorAll('[data-hist-range]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.rangeDays = parseInt(btn.getAttribute('data-hist-range'), 10);
        refresh();
      });
    });

    root.querySelectorAll('[data-hist-remove-food]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        DayLog.removeFood(d, btn.getAttribute('data-hist-remove-food'));
        refresh();
      });
    });

    root.querySelectorAll('[data-hist-remove-drink]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        DayLog.removeDrink(d, btn.getAttribute('data-hist-remove-drink'));
        refresh();
      });
    });

    root.querySelectorAll('[data-hist-remove-exercise]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        DayLog.toggleExercise(d, btn.getAttribute('data-hist-remove-exercise'));
        refresh();
      });
    });

    var foodForm = root.querySelector('#hist-food-form');
    if (foodForm) foodForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = document.getElementById('hist-food-name').value.trim();
      var kcal = parseInt(document.getElementById('hist-food-kcal').value, 10);
      if (!name) { Utils.toast('Bitte einen Namen eingeben'); return; }
      if (isNaN(kcal) || kcal <= 0) { Utils.toast('Bitte die Kalorien eingeben'); return; }
      DayLog.addFood(d, name, kcal);
      Utils.toast('Eingetragen');
      refresh();
    });

    var drinkForm = root.querySelector('#hist-drink-form');
    if (drinkForm) drinkForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = document.getElementById('hist-drink-name').value.trim();
      var kcal = parseInt(document.getElementById('hist-drink-kcal').value, 10);
      var ml = parseInt(document.getElementById('hist-drink-ml').value, 10);
      if (!name) { Utils.toast('Bitte einen Namen eingeben'); return; }
      if (isNaN(kcal) || kcal < 0) { Utils.toast('Bitte die Kalorien eingeben'); return; }
      if (isNaN(ml) || ml < 0) ml = 0;
      DayLog.addDrink(d, name, kcal, ml);
      Utils.toast('Eingetragen');
      refresh();
    });

    var sleepMinus = root.querySelector('#hist-sleep-minus');
    var sleepPlus = root.querySelector('#hist-sleep-plus');
    if (sleepMinus) sleepMinus.addEventListener('click', function () {
      var next = Utils.round1(Utils.clamp((DayLog.getSleep(d) || 0) - 0.5, 0, 14));
      DayLog.setSleep(d, next);
      refresh();
    });
    if (sleepPlus) sleepPlus.addEventListener('click', function () {
      var next = Utils.round1(Utils.clamp((DayLog.getSleep(d) || 0) + 0.5, 0, 14));
      DayLog.setSleep(d, next);
      refresh();
    });

    var waterMinus = root.querySelector('#hist-water-minus');
    var waterPlus = root.querySelector('#hist-water-plus');
    if (waterMinus) waterMinus.addEventListener('click', function () { DayLog.addWaterMl(d, -250); refresh(); });
    if (waterPlus) waterPlus.addEventListener('click', function () { DayLog.addWaterMl(d, 250); refresh(); });

    var exerciseForm = root.querySelector('#hist-exercise-form');
    if (exerciseForm) exerciseForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var select = document.getElementById('hist-exercise-select');
      var id = select.value;
      var already = DayLog.getExercisesDone(d).indexOf(id) !== -1;
      if (already) { Utils.toast('Schon eingetragen'); return; }
      DayLog.toggleExercise(d, id);
      Utils.toast('Eingetragen');
      refresh();
    });

    var stepsSave = root.querySelector('#hist-steps-save');
    if (stepsSave) stepsSave.addEventListener('click', function () {
      var val = parseInt(document.getElementById('hist-steps-input').value, 10);
      if (isNaN(val) || val < 0) { Utils.toast('Bitte eine gültige Zahl eingeben'); return; }
      DayLog.setSteps(d, val);
      Utils.toast('Gespeichert');
      refresh();
    });
  }

  window.Views = window.Views || {};
  window.Views.verlauf = { render: render };
})();
