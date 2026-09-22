/* =========================================================================
   VIEW — Verlauf / Monatsrückblick / Tag im Detail (eingebettet auf dem
   Dashboard, siehe js/views/dashboard.js, direkt nach den Buttons "Übung
   abhaken" / "Gewicht eintragen"). Drei Bausteine, immer in dieser
   Reihenfolge:

   1. "Verlauf"          — Monatsauswahl (beliebig weit zurück, nicht auf
                            ein festes Zeitfenster begrenzt) + Liniendia-
                            gramm des täglichen Kaloriendefizits.
   2. "Monatsrückblick"  — automatische Textzusammenfassung des gewählten
                            Monats (analog zum Wochenrückblick, nur pro
                            Monat), nur mit tatsächlich erfassten Fakten.
   3. "Tag im Detail"    — Tagesansicht mit Vor/Zurück/Datumsauswahl, in
                            der sich Essen, Getränke, Schlaf, Übungen und
                            Schritte für JEDEN Tag ansehen und auch
                            rückwirkend nachtragen lassen.

   Nutzt überall DayLog (js/day-log.js), denselben datumsbasierten Zugriff
   wie Dashboard und Bewegung für "heute".
   ========================================================================= */

(function () {
  'use strict';

  var MONTH_NAMES = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  var state = { date: Utils.todayISO(), month: Utils.todayISO().slice(0, 7) };

  /* ---- Monats-Hilfsfunktionen -------------------------------------------- */
  function daysInMonthArr(monthKey) {
    var parts = monthKey.split('-').map(Number);
    var lastDay = new Date(parts[0], parts[1], 0).getDate();
    var arr = [];
    for (var d = 1; d <= lastDay; d++) arr.push(monthKey + '-' + Utils.pad(d));
    return arr;
  }

  function addMonthsToKey(monthKey, n) {
    var parts = monthKey.split('-').map(Number);
    var d = new Date(parts[0], parts[1] - 1 + n, 1);
    return d.getFullYear() + '-' + Utils.pad(d.getMonth() + 1);
  }

  function formatMonthLabel(monthKey) {
    var parts = monthKey.split('-').map(Number);
    return MONTH_NAMES[parts[1] - 1] + ' ' + parts[0];
  }

  /* ---- Kaloriendefizit ----------------------------------------------------
     Gleiche Rechnung wie die Tagesbilanz auf dem Dashboard (Grundumsatz ×
     1,2 + Bewegung − Gegessenes/Getrunkenes), nur für ein beliebiges
     Datum. Tage ganz ohne Kalorien-relevante Einträge werden ausgelassen
     (kein erfundener "Defizit" nur weil an dem Tag nichts erfasst wurde).
     ========================================================================= */
  function dayHasCalorieData(date) {
    return DayLog.getFood(date).length > 0 ||
      DayLog.getDrinks(date).length > 0 ||
      DayLog.getExercisesDone(date).length > 0 ||
      (DayLog.getSteps(date) != null && DayLog.getSteps(date) > 0);
  }

  function dayDeficit(date, bmr) {
    var everydayBase = Math.round(bmr * 1.2);
    var burned = MovementCalc.burnedKcalForDate(date);
    var eaten = DayLog.foodKcal(date) + DayLog.drinkKcal(date);
    return everydayBase + burned - eaten;
  }

  /* ---- Karte 1: Verlauf (Monatsauswahl + Liniendiagramm) ------------------- */
  function chartCardHtml() {
    var today = Utils.todayISO();
    return '<div class="card" style="margin-top: var(--space-4);">' +
      '<h3 class="mt-0">Verlauf</h3>' +
      '<p class="text-sm text-soft mt-0">Kaloriendefizit pro Tag — wähl einen Monat, beliebig weit zurück.</p>' +
      '<div class="flex-between" style="gap: var(--space-2);">' +
        '<button class="btn btn--icon btn--secondary" id="hist-prev-month" aria-label="Vorheriger Monat">' + Icons.arrowLeft(16) + '</button>' +
        '<div style="text-align:center; flex:1; min-width:0;">' +
          '<div style="font-weight:700;">' + formatMonthLabel(state.month) + '</div>' +
          '<input type="month" class="input" id="hist-month-input" style="margin-top:4px; max-width:200px; display:inline-block;" value="' + state.month + '" max="' + today.slice(0, 7) + '">' +
        '</div>' +
        '<button class="btn btn--icon btn--secondary" id="hist-next-month" aria-label="Nächster Monat"' + (state.month >= today.slice(0, 7) ? ' disabled' : '') + '>' + Icons.arrowRight(16) + '</button>' +
      '</div>' +
      '<div class="chart-wrap" style="margin-top: var(--space-3);"><canvas id="deficit-canvas" height="220"></canvas></div>' +
      '<p class="text-sm text-soft" style="margin-bottom:0;">Gestrichelte Linie = ausgeglichen. Nur Tage mit erfassten Mahlzeiten, Getränken, Übungen oder Schritten werden gezeigt.</p>' +
    '</div>';
  }

  function drawDeficitChart() {
    var canvas = document.getElementById('deficit-canvas');
    if (!canvas) return;
    var profile = CalorieCalc.getProfile();
    var result = CalorieCalc.computeFromProfile(profile);
    if (!result) {
      WeightChart.draw(canvas, [], null, 0, 'Trag zuerst deinen Grundumsatz ein (Seite „Gewicht“), um den Kaloriendefizit-Verlauf zu sehen.');
      return;
    }
    var today = Utils.todayISO();
    var days = daysInMonthArr(state.month).filter(function (d) { return d <= today; });
    var points = days.filter(dayHasCalorieData).map(function (d) {
      return { date: d, kg: dayDeficit(d, result.bmr) };
    });
    WeightChart.draw(canvas, points, { targetKg: 0 }, 0, 'Für diesen Monat sind noch keine Mahlzeiten, Getränke, Übungen oder Schritte erfasst.');
  }

  /* ---- Karte 2: Monatsrückblick --------------------------------------------- */
  function monthlyReviewFacts() {
    var today = Utils.todayISO();
    var days = daysInMonthArr(state.month).filter(function (d) { return d <= today; });
    var facts = [];

    var profile = CalorieCalc.getProfile();
    var result = CalorieCalc.computeFromProfile(profile);
    if (result) {
      var deficitDays = days.filter(dayHasCalorieData);
      if (deficitDays.length) {
        var totalDeficit = deficitDays.reduce(function (s, d) { return s + dayDeficit(d, result.bmr); }, 0);
        var avgDeficit = Math.round(totalDeficit / deficitDays.length);
        facts.push('im Schnitt ' + (avgDeficit >= 0 ? 'Defizit von ' + avgDeficit : 'Überschuss von ' + Math.abs(avgDeficit)) + ' kcal/Tag (' + deficitDays.length + ' erfasste ' + (deficitDays.length === 1 ? 'Tag' : 'Tage') + ')');
      }
    }

    var waterGoal = Storage.read(Storage.KEYS.waterGoalMl, 2000);
    var waterDaysWithData = days.filter(function (d) { return DayLog.getWaterMl(d) > 0; });
    if (waterDaysWithData.length) {
      var reached = waterDaysWithData.filter(function (d) { return DayLog.getWaterMl(d) >= waterGoal; }).length;
      facts.push('Wasserziel an ' + reached + ' von ' + waterDaysWithData.length + ' erfassten Tagen erreicht');
    }

    var totalEx = days.reduce(function (sum, d) { return sum + DayLog.getExercisesDone(d).length; }, 0);
    if (totalEx > 0) facts.push(totalEx + (totalEx === 1 ? ' Übung absolviert' : ' Übungen absolviert'));

    var sleepValues = days.map(function (d) { return DayLog.getSleep(d); }).filter(function (v) { return v != null && v > 0; });
    if (sleepValues.length) {
      var avgSleep = sleepValues.reduce(function (a, b) { return a + b; }, 0) / sleepValues.length;
      facts.push('im Schnitt ' + Utils.round1(avgSleep).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' Std. Schlaf');
    }

    if (days.length) {
      var weightEntries = Storage.read(Storage.KEYS.weightEntries, [])
        .filter(function (e) { return e.date >= days[0] && e.date <= days[days.length - 1]; })
        .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
      if (weightEntries.length >= 2) {
        var diff = Utils.round1(weightEntries[weightEntries.length - 1].kg - weightEntries[0].kg);
        facts.push(diff === 0 ? 'Gewicht stabil in diesem Monat' : 'Gewichtsveränderung: ' + Utils.formatDeltaKg(diff));
      }
    }

    return facts;
  }

  function monthlyReviewHtml() {
    var facts = monthlyReviewFacts();
    var body = facts.length
      ? '<p class="mt-0" style="margin-bottom:0;">' + formatMonthLabel(state.month) + ': ' + facts.join(', ') + '.</p>'
      : '<p class="mt-0 text-soft" style="margin-bottom:0;">Für ' + formatMonthLabel(state.month) + ' liegen noch keine Daten vor.</p>';
    return '<div class="card" style="margin-top: var(--space-4);">' +
      '<h3 class="mt-0">Monatsrückblick</h3>' +
      body +
    '</div>';
  }

  /* ---- Karte 3: Tag im Detail (rückwirkendes Eintragen) --------------------- */
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

  function dayDetailCardHtml() {
    var date = state.date;
    var today = Utils.todayISO();
    var entries = combinedEntries(date);
    var eaten = DayLog.foodKcal(date) + DayLog.drinkKcal(date);
    var burned = MovementCalc.burnedKcalForDate(date);
    var water = DayLog.getWaterMl(date);
    var sleep = DayLog.getSleep(date);
    var steps = DayLog.getSteps(date);

    return '<div class="card" style="margin-top: var(--space-4);">' +
      '<h3 class="mt-0">Tag im Detail</h3>' +
      '<p class="text-sm text-soft mt-0">Sieh dir einen bestimmten Tag an oder trag rückwirkend etwas nach.</p>' +
      '<div class="flex-between" style="gap: var(--space-2);">' +
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
      '</div>' +
    '</div>';
  }

  /* ---- Zusammenbau ----------------------------------------------------------- */
  function render(root) {
    if (!root) return;

    root.innerHTML =
      chartCardHtml() +
      monthlyReviewHtml() +
      dayDetailCardHtml();

    drawDeficitChart();
    bind(root);
  }

  /** Nach jeder Aktion wird bewusst das GANZE Dashboard neu gerendert
   *  (nicht nur dieser Bereich) — sonst zeigt die Tagesbilanz oben
   *  veraltete Zahlen, wenn man hier rückwirkend etwas für HEUTE einträgt. */
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

    /* Verlauf-Karte: Monatsnavigation */
    var prevMonthBtn = root.querySelector('#hist-prev-month');
    if (prevMonthBtn) prevMonthBtn.addEventListener('click', function () { state.month = addMonthsToKey(state.month, -1); render(root); });

    var nextMonthBtn = root.querySelector('#hist-next-month');
    if (nextMonthBtn && !nextMonthBtn.disabled) nextMonthBtn.addEventListener('click', function () { state.month = addMonthsToKey(state.month, 1); render(root); });

    var monthInput = root.querySelector('#hist-month-input');
    if (monthInput) monthInput.addEventListener('change', function () {
      if (monthInput.value) { state.month = monthInput.value; render(root); }
    });

    /* Tag-im-Detail-Karte: Tagesnavigation */
    var prevBtn = root.querySelector('#hist-prev-day');
    if (prevBtn) prevBtn.addEventListener('click', function () { state.date = Utils.addDays(d, -1); render(root); });

    var nextBtn = root.querySelector('#hist-next-day');
    if (nextBtn && !nextBtn.disabled) nextBtn.addEventListener('click', function () { state.date = Utils.addDays(d, 1); render(root); });

    var todayBtn = root.querySelector('#hist-today');
    if (todayBtn) todayBtn.addEventListener('click', function () { state.date = Utils.todayISO(); render(root); });

    var dateInput = root.querySelector('#hist-date-input');
    if (dateInput) dateInput.addEventListener('change', function () {
      if (dateInput.value) { state.date = dateInput.value; render(root); }
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
