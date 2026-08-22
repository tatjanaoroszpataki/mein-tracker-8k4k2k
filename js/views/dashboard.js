/* =========================================================================
   VIEW — Dashboard
   Überblick: Wasser heute, Mini-Übungen heute, letzter Gewichtseintrag +
   Trend, Streak. Reiner Lesebereich mit ein paar Schnellzugriffen.
   ========================================================================= */

(function () {
  'use strict';

  function weightSummary() {
    var entries = (Storage.read(Storage.KEYS.weightEntries, [])).slice().sort(function (a, b) {
      return a.date < b.date ? -1 : 1;
    });
    if (!entries.length) return null;
    var last = entries[entries.length - 1];
    var prev = entries.length > 1 ? entries[entries.length - 2] : null;
    var delta = prev ? Utils.round1(last.kg - prev.kg) : 0;

    // Wochentrend: Durchschnitt dieser Woche vs. Vorwoche
    var weekStart = Utils.startOfWeek(Utils.todayISO());
    var prevWeekStart = Utils.addDays(weekStart, -7);
    var thisWeek = entries.filter(function (e) { return e.date >= weekStart; });
    var lastWeek = entries.filter(function (e) { return e.date >= prevWeekStart && e.date < weekStart; });
    var avg = function (list) { return list.reduce(function (s, e) { return s + e.kg; }, 0) / list.length; };
    var weekTrend = (thisWeek.length && lastWeek.length) ? Utils.round1(avg(thisWeek) - avg(lastWeek)) : null;

    return { last: last, delta: delta, weekTrend: weekTrend };
  }

  var GLASS_ML = 250; // ein Tap = ein Glas, wie bisher auf der (jetzt entfernten) Wasser-Seite

  function waterToday() {
    var goal = Storage.read(Storage.KEYS.waterGoalMl, 2000);
    var log = Storage.read(Storage.KEYS.waterLog, {});
    var ml = log[Utils.todayISO()] || 0;
    return { ml: ml, goal: goal, pct: goal ? ml / goal : 0 };
  }

  function addWaterMl(delta) {
    var log = Storage.read(Storage.KEYS.waterLog, {});
    var today = Utils.todayISO();
    log[today] = Math.max(0, (log[today] || 0) + delta);
    Storage.write(Storage.KEYS.waterLog, log);
    Storage.markActiveToday();
  }

  function exerciseToday() {
    var log = Storage.read(Storage.KEYS.exerciseLog, {});
    var done = log[Utils.todayISO()] || [];
    return { done: done.length, total: MINI_EXERCISES.length };
  }

  function calorieBlock() {
    var profile = CalorieCalc.getProfile();
    var result = CalorieCalc.computeFromProfile(profile);
    if (!result) {
      return '<div class="stat"><span class="stat__label">Kalorienbedarf</span>' +
        '<span class="stat__meta">Noch nicht berechnet — <a href="#/gewicht">jetzt berechnen</a></span></div>';
    }
    return '<div class="stat">' +
      '<span class="stat__label">Tagesbedarf (TDEE)</span>' +
      '<span class="stat__value">' + result.tdee.toLocaleString('de-DE') + ' kcal</span>' +
      '<span class="stat__meta">Zum Abnehmen: ca. ' + result.deficitLow.toLocaleString('de-DE') + '–' + result.deficitHigh.toLocaleString('de-DE') + ' kcal · <a href="#/gewicht">Details</a></span>' +
    '</div>';
  }

  /**
   * Dezenter Backup-Hinweis — erscheint nur, wenn der letzte Export mehr
   * als 14 Tage her ist (oder noch nie gemacht wurde), und verschwindet
   * danach wieder von selbst. Bewusst ruhig gehalten: kein Warn-Rot, kein
   * Icon-Alarm, eher ein normaler Info-Baustein.
   */
  function backupReminderHtml() {
    var days = App.daysSinceBackup();
    var overdue = days === null || days > 14;
    if (!overdue) return '';
    var text = days === null
      ? 'Deine Daten wurden noch nie gesichert.'
      : 'Letztes Backup ist ' + days + (days === 1 ? ' Tag' : ' Tage') + ' her.';
    return '<div class="card card--tight backup-hint" style="margin-top: var(--space-4);">' +
      '<div class="flex-between" style="flex-wrap:wrap; gap: var(--space-3);">' +
        '<div style="display:flex; align-items:center; gap:10px; min-width:0;">' +
          '<span class="backup-hint__icon">' + Icons.download(18) + '</span>' +
          '<span class="text-sm" style="color: var(--color-primary-dark);">' + text + ' Kurz Daten exportieren?</span>' +
        '</div>' +
        '<button class="btn btn--secondary btn--sm" id="backup-reminder-btn" style="flex-shrink:0;">Jetzt exportieren</button>' +
      '</div>' +
    '</div>';
  }

  /* ---- Wochenrückblick ----------------------------------------------------
     Automatische Zusammenfassung der letzten 7 Tage. Zeigt nur Fakten, für
     die tatsächlich Daten vorliegen — keine erfundenen Nullen oder
     Platzhalter, keine wertende Sprache.
  */
  function weeklyReviewFacts() {
    var today = Utils.todayISO();
    var days = [];
    for (var i = 6; i >= 0; i--) days.push(Utils.addDays(today, -i));
    var facts = [];

    var waterGoal = Storage.read(Storage.KEYS.waterGoalMl, 2000);
    var waterLog = Storage.read(Storage.KEYS.waterLog, {});
    var waterDaysWithData = days.filter(function (d) { return (waterLog[d] || 0) > 0; });
    if (waterDaysWithData.length) {
      var reached = days.filter(function (d) { return (waterLog[d] || 0) >= waterGoal; }).length;
      facts.push('Wasserziel an ' + reached + ' von 7 Tagen erreicht');
    }

    var exLog = Storage.read(Storage.KEYS.exerciseLog, {});
    var totalEx = days.reduce(function (sum, d) { return sum + ((exLog[d] || []).length); }, 0);
    if (totalEx > 0) facts.push(totalEx + (totalEx === 1 ? ' Übung absolviert' : ' Übungen absolviert'));

    var entries = Storage.read(Storage.KEYS.weightEntries, []);
    var thisWindow = entries.filter(function (e) { return days.indexOf(e.date) !== -1; });
    var prevDays = [];
    for (i = 13; i >= 7; i--) prevDays.push(Utils.addDays(today, -i));
    var prevWindow = entries.filter(function (e) { return prevDays.indexOf(e.date) !== -1; });
    if (thisWindow.length && prevWindow.length) {
      var avg = function (list) { return list.reduce(function (s, e) { return s + e.kg; }, 0) / list.length; };
      var diff = Utils.round1(avg(thisWindow) - avg(prevWindow));
      facts.push(diff === 0 ? 'Gewicht stabil zur Vorwoche' : 'Gewichtstrend: ' + Utils.formatDeltaKg(diff));
    }

    var sleepLog = Storage.read(Storage.KEYS.sleepLog, {});
    var sleepValues = days.map(function (d) { return sleepLog[d]; }).filter(function (v) { return v != null && v > 0; });
    if (sleepValues.length) {
      var avgSleep = sleepValues.reduce(function (a, b) { return a + b; }, 0) / sleepValues.length;
      facts.push('im Schnitt ' + Utils.round1(avgSleep).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' Std. Schlaf');
    }

    return facts;
  }

  function weeklyReviewHtml() {
    var facts = weeklyReviewFacts();
    var body = facts.length
      ? '<p class="mt-0" style="margin-bottom:0;">Diese Woche: ' + facts.join(', ') + '.</p>'
      : '<p class="mt-0 text-soft" style="margin-bottom:0;">Sammle diese Woche weiter Daten — der erste Wochenrückblick erscheint bald.</p>';
    return '<div class="card" style="margin-top: var(--space-4);">' +
      '<h3 class="mt-0" style="margin-bottom: var(--space-2);">Wochenrückblick</h3>' +
      body +
    '</div>';
  }

  /* ---- Schlaf --------------------------------------------------------------
     Einfache tägliche Eingabe in 0,5h-Schritten, dezenter Hinweis zum
     Richtwert (7–9 Std.), keine Bewertung.
  */
  function getSleepToday() {
    var log = Storage.read(Storage.KEYS.sleepLog, {});
    var v = log[Utils.todayISO()];
    return (v == null) ? null : v;
  }

  function adjustSleep(delta) {
    var log = Storage.read(Storage.KEYS.sleepLog, {});
    var today = Utils.todayISO();
    var next = Utils.round1(Utils.clamp((log[today] || 0) + delta, 0, 14));
    log[today] = next;
    Storage.write(Storage.KEYS.sleepLog, log);
    Storage.markActiveToday();
  }

  function sleepRangeText(hours) {
    if (hours >= 7 && hours <= 9) return 'Im empfohlenen Bereich (7–9 Std.)';
    if (hours < 7) return 'Etwas unter dem Richtwert von 7–9 Std.';
    return 'Etwas über dem Richtwert von 7–9 Std.';
  }

  function sleepCardHtml() {
    var hours = getSleepToday();
    var display = hours == null ? '—' : hours.toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' Std.';
    return '<div class="card" style="margin-top: var(--space-4);">' +
      '<div class="flex-between">' +
        '<div class="stat">' +
          '<span class="stat__label">Schlaf letzte Nacht</span>' +
          '<span class="stat__value">' + display + '</span>' +
          '<span class="stat__meta">' + (hours == null ? 'Noch nicht eingetragen' : sleepRangeText(hours)) + '</span>' +
        '</div>' +
        '<div style="display:flex; align-items:center; gap: var(--space-2);">' +
          '<button class="btn btn--icon btn--secondary" id="sleep-minus" aria-label="0,5 Stunden weniger">' + Icons.minus(16) + '</button>' +
          '<span style="color: var(--color-plum);">' + Icons.moon(24) + '</span>' +
          '<button class="btn btn--icon btn--secondary" id="sleep-plus" aria-label="0,5 Stunden mehr">' + Icons.plus(16) + '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ---- Tagesbilanz -----------------------------------------------------------
     Grundumsatz + heutige Bewegung (Übungen/Sportarten/Schritte, siehe
     js/views/movement.js) minus heute Gegessenes (eigenes Tages-Log,
     unabhängig vom Wochenplaner) = Kalorienbilanz für heute. Nutzt den
     Grundumsatz (BMR) statt des PAL-bereinigten Tagesbedarfs als Basis,
     damit Bewegung nicht doppelt gezählt wird — sie kommt hier ja bereits
     explizit als eigener Posten dazu.
  */
  var foodPicker = { open: false, tab: 'recipe', query: '' };
  var drinkPicker = { open: false, tab: 'preset' };

  function getFoodLogToday() {
    var log = Storage.read(Storage.KEYS.foodLog, {});
    return log[Utils.todayISO()] || [];
  }

  function addFoodEntry(name, kcal) {
    var log = Storage.read(Storage.KEYS.foodLog, {});
    var today = Utils.todayISO();
    var list = log[today] || [];
    list.push({ id: Storage.uid(), name: name, kcal: kcal });
    log[today] = list;
    Storage.write(Storage.KEYS.foodLog, log);
    Storage.markActiveToday();
  }

  function removeFoodEntry(id) {
    var log = Storage.read(Storage.KEYS.foodLog, {});
    var today = Utils.todayISO();
    log[today] = (log[today] || []).filter(function (e) { return e.id !== id; });
    Storage.write(Storage.KEYS.foodLog, log);
  }

  function foodEatenToday() {
    return getFoodLogToday().reduce(function (sum, e) { return sum + e.kcal; }, 0);
  }

  /* Getränke — eigenes Log, genau wie Essen, damit z. B. Kaffee, Softdrinks
     usw. ebenfalls in die Tagesbilanz einfließen (Wasser bleibt separat,
     siehe waterToday/addWaterMl weiter oben — das ist reine Trinkmenge,
     keine Kalorien). */
  function getDrinkLogToday() {
    var log = Storage.read(Storage.KEYS.drinkLog, {});
    return log[Utils.todayISO()] || [];
  }

  function addDrinkEntry(name, kcal) {
    var log = Storage.read(Storage.KEYS.drinkLog, {});
    var today = Utils.todayISO();
    var list = log[today] || [];
    list.push({ id: Storage.uid(), name: name, kcal: kcal });
    log[today] = list;
    Storage.write(Storage.KEYS.drinkLog, log);
    Storage.markActiveToday();
  }

  function removeDrinkEntry(id) {
    var log = Storage.read(Storage.KEYS.drinkLog, {});
    var today = Utils.todayISO();
    log[today] = (log[today] || []).filter(function (e) { return e.id !== id; });
    Storage.write(Storage.KEYS.drinkLog, log);
  }

  function drinkDrunkToday() {
    return getDrinkLogToday().reduce(function (sum, e) { return sum + e.kcal; }, 0);
  }

  function foodPickerResultsHtml() {
    var q = (foodPicker.query || '').toLowerCase();
    var recipes = CustomRecipes.all().filter(function (r) { return r.kcal; });
    if (q) recipes = recipes.filter(function (r) { return r.title.toLowerCase().indexOf(q) !== -1; });
    return recipes.length ? recipes.map(function (r) {
      return '<button class="plan-picker__recipe-item" data-log-recipe="' + r.id + '">' +
        '<strong>' + Utils.escapeHtml(r.title) + '</strong><span>ca. ' + r.kcal + ' kcal</span>' +
      '</button>';
    }).join('') : '<p class="text-sm text-soft">Keine passenden Rezepte mit hinterlegten kcal gefunden.</p>';
  }

  function bindFoodPickerResults(root) {
    root.querySelectorAll('[data-log-recipe]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var r = CustomRecipes.findById(btn.getAttribute('data-log-recipe'));
        if (r) {
          addFoodEntry(r.title, r.kcal);
          foodPicker.open = false;
          Utils.toast('Eingetragen');
          App.afterAction();
          render(root);
        }
      });
    });
  }

  function foodPickerHtml() {
    var tabs = [
      { id: 'recipe', label: 'Aus Rezepten' },
      { id: 'custom', label: 'Frei eingeben' }
    ];

    var body;
    if (foodPicker.tab === 'recipe') {
      body = '<div class="search-input" style="margin-bottom: var(--space-3);">' + Icons.search(16) +
        '<input type="search" id="food-picker-search" placeholder="Rezept suchen …" value="' + Utils.escapeHtml(foodPicker.query) + '"></div>' +
        '<div id="food-picker-results">' + foodPickerResultsHtml() + '</div>';
    } else {
      body = '<div class="field"><label for="food-picker-name">Was hast du gegessen?</label>' +
        '<input class="input" id="food-picker-name" type="text" placeholder="z. B. Butterbrot mit Käse"></div>' +
        '<div class="field"><label for="food-picker-kcal">Kalorien (ca.)</label>' +
        '<input class="input" id="food-picker-kcal" type="number" min="0" max="3000" placeholder="z. B. 350"></div>' +
        '<button class="btn btn--primary btn--block" id="food-picker-save">Eintragen</button>';
    }

    return '<div class="plan-picker-backdrop" id="food-picker-backdrop"></div>' +
      '<div class="plan-picker">' +
        '<div class="plan-picker__header"><strong>Essen eintragen</strong>' +
          '<button class="btn btn--icon btn--ghost" id="food-picker-close" aria-label="Schließen">' + Icons.close(18) + '</button>' +
        '</div>' +
        '<div class="chip-row plan-picker__tabs">' +
          tabs.map(function (t) { return '<button class="chip' + (foodPicker.tab === t.id ? ' is-active' : '') + '" data-food-tab="' + t.id + '">' + t.label + '</button>'; }).join('') +
        '</div>' +
        '<div class="plan-picker__body">' + body + '</div>' +
      '</div>';
  }

  function bindDrinkPresetResults(root) {
    root.querySelectorAll('[data-log-drink]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-log-drink'), 10);
        var d = DRINKS[idx];
        if (d) {
          addDrinkEntry(d.name, d.kcal);
          drinkPicker.open = false;
          Utils.toast('Eingetragen');
          App.afterAction();
          render(root);
        }
      });
    });
  }

  function drinkPickerHtml() {
    var tabs = [
      { id: 'preset', label: 'Häufige Getränke' },
      { id: 'custom', label: 'Frei eingeben' }
    ];

    var body;
    if (drinkPicker.tab === 'preset') {
      body = '<div class="stack" style="gap:0;">' +
        DRINKS.map(function (d, i) {
          return '<button class="plan-picker__recipe-item" data-log-drink="' + i + '">' +
            '<strong>' + Utils.escapeHtml(d.name) + '</strong><span>ca. ' + d.kcal + ' kcal</span>' +
          '</button>';
        }).join('') +
      '</div>';
    } else {
      body = '<div class="field"><label for="drink-picker-name">Was hast du getrunken?</label>' +
        '<input class="input" id="drink-picker-name" type="text" placeholder="z. B. Cocktail"></div>' +
        '<div class="field"><label for="drink-picker-kcal">Kalorien (ca.)</label>' +
        '<input class="input" id="drink-picker-kcal" type="number" min="0" max="1500" placeholder="z. B. 150"></div>' +
        '<button class="btn btn--primary btn--block" id="drink-picker-save">Eintragen</button>';
    }

    return '<div class="plan-picker-backdrop" id="drink-picker-backdrop"></div>' +
      '<div class="plan-picker">' +
        '<div class="plan-picker__header"><strong>Getränke eintragen</strong>' +
          '<button class="btn btn--icon btn--ghost" id="drink-picker-close" aria-label="Schließen">' + Icons.close(18) + '</button>' +
        '</div>' +
        '<div class="chip-row plan-picker__tabs">' +
          tabs.map(function (t) { return '<button class="chip' + (drinkPicker.tab === t.id ? ' is-active' : '') + '" data-drink-tab="' + t.id + '">' + t.label + '</button>'; }).join('') +
        '</div>' +
        '<div class="plan-picker__body">' + body + '</div>' +
      '</div>';
  }

  function dailyBalanceHtml() {
    var profile = CalorieCalc.getProfile();
    var result = CalorieCalc.computeFromProfile(profile);
    var todayFoodList = getFoodLogToday();
    var todayDrinkList = getDrinkLogToday();
    var eaten = foodEatenToday() + drinkDrunkToday();

    var combinedList = todayFoodList.map(function (e) {
      return { id: e.id, name: e.name, kcal: e.kcal, attr: 'data-remove-food' };
    }).concat(todayDrinkList.map(function (e) {
      return { id: e.id, name: e.name, kcal: e.kcal, attr: 'data-remove-drink' };
    }));

    var foodListHtml = combinedList.length
      ? '<ul class="stack" style="gap:0; margin-top: var(--space-3);">' +
          combinedList.map(function (e) {
            return '<li class="shop-item"><span style="flex:1">' + Utils.escapeHtml(e.name) + '</span>' +
              '<strong style="margin-right:var(--space-2);">' + e.kcal + ' kcal</strong>' +
              '<button class="shop-item__remove" ' + e.attr + '="' + e.id + '" aria-label="' + Utils.escapeHtml(e.name) + ' entfernen">' + Icons.trash(15) + '</button>' +
            '</li>';
          }).join('') +
        '</ul>'
      : '';

    var addFoodBtn = '<div class="chip-row" style="margin-top: var(--space-3); margin-bottom:0;">' +
      '<button class="btn btn--secondary btn--sm" id="open-food-picker">' + Icons.plus(14) + ' Essen eintragen</button>' +
      '<button class="btn btn--secondary btn--sm" id="open-drink-picker">' + Icons.plus(14) + ' Getränke eintragen</button>' +
    '</div>';

    if (!result) {
      return '<div class="card" style="margin-top: var(--space-4);">' +
        '<h3 class="mt-0">Tagesbilanz</h3>' +
        '<p class="text-sm text-soft">Trag deinen Grundumsatz ein, um deine Tagesbilanz zu sehen — <a href="#/gewicht">jetzt berechnen</a>.</p>' +
        '<div class="hr"></div>' +
        '<div class="flex-between"><span class="stat__label">Heute gegessen & getrunken</span><strong>' + eaten + ' kcal</strong></div>' +
        foodListHtml + addFoodBtn +
      '</div>' + (foodPicker.open ? foodPickerHtml() : '') + (drinkPicker.open ? drinkPickerHtml() : '');
    }

    // Reiner Grundumsatz (BMR) entspricht Bewegungslosigkeit (z. B. den
    // ganzen Tag im Bett) — normales Alltagsleben (Rumlaufen, Stehen,
    // Haushalt) verbrennt spürbar mehr als das, auch ganz ohne "Sport"
    // (NEAT, Non-Exercise Activity Thermogenesis). Deshalb als Basis
    // Grundumsatz × 1,2 (derselbe "sitzend/Alltag ohne Sport"-Faktor wie
    // im Kalorienrechner) statt des reinen BMR — Übungen/Schritte kommen
    // wie gehabt on top für gezielte Bewegung über den Alltag hinaus.
    var EVERYDAY_ACTIVITY_FACTOR = 1.2;
    var everydayBase = Math.round(result.bmr * EVERYDAY_ACTIVITY_FACTOR);
    var burned = window.MovementCalc ? MovementCalc.todaysBurnedKcal() : 0;
    var available = everydayBase + burned;
    var balance = available - eaten;

    return '<div class="card" style="margin-top: var(--space-4);">' +
      '<h3 class="mt-0">Tagesbilanz</h3>' +
      '<div class="stack" style="gap: var(--space-2);">' +
        '<div class="flex-between text-sm"><span class="text-soft">Grundumsatz × 1,2 (Alltag)</span><span>' + everydayBase.toLocaleString('de-DE') + ' kcal</span></div>' +
        '<div class="flex-between text-sm"><span class="text-soft">+ Übungen/Sport heute</span><span>+' + burned.toLocaleString('de-DE') + ' kcal <a href="#/bewegung" class="text-sm">(Details)</a></span></div>' +
        '<div class="flex-between" style="border-top: 1px solid var(--color-border); padding-top: 6px;"><strong>= Heute verfügbar</strong><strong>' + available.toLocaleString('de-DE') + ' kcal</strong></div>' +
        '<div class="flex-between text-sm"><span class="text-soft">− Gegessen & getrunken heute</span><span>−' + eaten.toLocaleString('de-DE') + ' kcal</span></div>' +
      '</div>' +
      '<p class="text-sm text-soft" style="margin-top: var(--space-2); margin-bottom:0;">Alltagsbewegung (Rumlaufen, Stehen, Haushalt) ist im ×1,2-Faktor schon mit drin — Übungen, Sport und Schritte kommen zusätzlich dazu.</p>' +
      '<div style="margin-top: var(--space-3); padding: var(--space-4); background: var(--color-primary-tint); border-radius: var(--radius-md);">' +
        '<div class="stat__label" style="margin-bottom:4px;">Wo du heute rauskommst</div>' +
        '<span class="stat__value" style="font-size:1.3rem;">' + (balance >= 0 ? 'Defizit von ' + balance.toLocaleString('de-DE') : 'Überschuss von ' + Math.abs(balance).toLocaleString('de-DE')) + ' kcal</span>' +
        '<span class="stat__meta" style="display:block; margin-top:2px;">Zielbereich: ca. ' + (result.tdee - result.deficitHigh) + '–' + (result.tdee - result.deficitLow) + ' kcal Defizit (bezogen auf deinen Tagesbedarf)</span>' +
      '</div>' +
      foodListHtml + addFoodBtn +
    '</div>' + (foodPicker.open ? foodPickerHtml() : '') + (drinkPicker.open ? drinkPickerHtml() : '');
  }

  /* ---- PWA-Hinweis ----------------------------------------------------------- */
  function installHintHtml() {
    return '<div class="card card--tight" style="margin-top: var(--space-4); background: var(--color-primary-tint); border-color: var(--color-primary-light);">' +
      '<div class="flex-between" style="align-items:flex-start; gap: var(--space-3);">' +
        '<span style="color:var(--color-primary-dark); flex-shrink:0;">' + Icons.mark(22) + '</span>' +
        '<p class="text-sm mt-0" style="margin-bottom:0; color: var(--color-primary-dark);">' +
          '<strong>Als App installieren:</strong> Android/Chrome — Menü (⋮) → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“. ' +
          'iPhone/Safari — Teilen-Symbol → „Zum Home-Bildschirm“. Danach startet Schrittweise wie eine echte App, ganz ohne Browser-Rahmen.' +
        '</p>' +
      '</div>' +
    '</div>';
  }

  function backupStatusText() {
    var days = App.daysSinceBackup();
    if (days === null) return 'Noch kein Backup erstellt.';
    if (days === 0) return 'Letztes Backup: heute.';
    return 'Letztes Backup: vor ' + days + (days === 1 ? ' Tag.' : ' Tagen.');
  }

  function render(root) {
    var streak = Storage.getStreak();
    var water = waterToday();
    var ex = exerciseToday();
    var weight = weightSummary();

    var weightBlock;
    if (weight) {
      var trendAbs = weight.weekTrend === null ? '' : Math.abs(weight.weekTrend).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      var trendText = weight.weekTrend === null ? 'noch nicht genug Daten für einen Wochentrend'
        : weight.weekTrend < 0 ? trendAbs + ' kg leichter als letzte Woche im Schnitt'
        : weight.weekTrend > 0 ? trendAbs + ' kg schwerer als letzte Woche im Schnitt'
        : 'stabil zur Vorwoche';
      weightBlock =
        '<div class="stat">' +
          '<span class="stat__label">Letzter Eintrag</span>' +
          '<span class="stat__value">' + Utils.formatKg(weight.last.kg) + '</span>' +
          '<span class="stat__meta">' + Utils.formatDateShort(weight.last.date) + ' · ' + trendText + '</span>' +
        '</div>';
    } else {
      weightBlock = '<div class="stat"><span class="stat__label">Gewicht</span>' +
        '<span class="stat__meta">Noch kein Eintrag — <a href="#/gewicht">jetzt eintragen</a></span></div>';
    }

    root.innerHTML =
      '<div class="view-header">' +
        '<span class="view-header__eyebrow">Übersicht</span>' +
        '<h1>' + greeting() + '</h1>' +
        '<p>Kleine, planbare Schritte statt großer Vorsätze — hier siehst du auf einen Blick, wo du heute stehst.</p>' +
      '</div>' +

      '<div class="card">' +
        '<div class="flex-between">' +
          '<div class="stat">' +
            '<span class="stat__label">Aktuelle Streak</span>' +
            '<span class="stat__value">' + streak + (streak === 1 ? ' Tag' : ' Tage') + '</span>' +
            '<span class="stat__meta">' + streakMessage(streak) + '</span>' +
          '</div>' +
          '<div style="color: var(--color-accent)">' + Icons.flame(38) + '</div>' +
        '</div>' +
      '</div>' +

      dailyBalanceHtml() +

      weeklyReviewHtml() +

      '<div class="card-grid" style="margin-top: var(--space-4);">' +
        '<div class="card card--tight" style="text-align:center;">' +
          '<div class="progress-ring" style="margin: 0 auto var(--space-2);">' +
            Utils.progressRingSVG(water.pct, 84, 9, 'var(--color-surface-sunken)', 'var(--color-primary)') +
            '<div class="progress-ring__label">' + Math.round(water.pct * 100) + '%<small>Wasser</small></div>' +
          '</div>' +
          '<div class="text-sm text-soft" style="margin-bottom: var(--space-2);">' + (water.ml / 1000).toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' / ' + (water.goal / 1000).toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' l</div>' +
          '<div style="display:flex; align-items:center; justify-content:center; gap: var(--space-2);">' +
            '<button class="btn btn--icon btn--secondary" id="water-minus" aria-label="Ein Glas Wasser abziehen">' + Icons.minus(14) + '</button>' +
            '<button class="btn btn--icon btn--secondary" id="water-plus" aria-label="Ein Glas Wasser hinzufügen">' + Icons.plus(14) + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="card card--tight" style="text-align:center;">' +
          '<div class="progress-ring" style="margin: 0 auto var(--space-2);">' +
            Utils.progressRingSVG(ex.total ? ex.done / ex.total : 0, 84, 9, 'var(--color-surface-sunken)', 'var(--color-plum)') +
            '<div class="progress-ring__label">' + ex.done + '/' + ex.total + '<small>Übungen</small></div>' +
          '</div>' +
          '<div class="text-sm text-soft">heute erledigt</div>' +
        '</div>' +
      '</div>' +

      sleepCardHtml() +

      '<div class="card-grid" style="margin-top: var(--space-4);">' +
        '<div class="card">' + weightBlock + '</div>' +
        '<div class="card">' + calorieBlock() + '</div>' +
      '</div>' +

      '<div class="chip-row" style="margin-top: var(--space-5); margin-bottom:0;">' +
        '<a class="btn btn--secondary btn--sm" href="#/bewegung">' + Icons.figure(16) + ' Übung abhaken</a>' +
        '<a class="btn btn--secondary btn--sm" href="#/gewicht">' + Icons.scale(16) + ' Gewicht eintragen</a>' +
      '</div>' +

      backupReminderHtml() +

      '<div class="card" style="margin-top: var(--space-6);">' +
        '<h3 class="mt-0">Daten & Sicherung</h3>' +
        '<p class="text-sm text-soft">Alles bleibt lokal auf diesem Gerät gespeichert. Für ein Backup kannst du deine Daten jederzeit exportieren — und auf einem anderen Gerät wieder einspielen.</p>' +
        '<p class="text-sm text-soft" style="margin-top:-8px;">' + backupStatusText() + '</p>' +
        '<div class="chip-row" style="margin-bottom:0;">' +
          '<button class="btn btn--secondary btn--sm" id="export-json">' + Icons.download(16) + ' Alles als JSON</button>' +
          '<button class="btn btn--secondary btn--sm" id="export-csv">' + Icons.download(16) + ' Gewicht als CSV</button>' +
          '<button class="btn btn--secondary btn--sm" id="import-json">' + Icons.upload(16) + ' Backup importieren</button>' +
        '</div>' +
        '<p class="text-sm text-soft" style="margin-top: var(--space-3); margin-bottom:0;">Für einen Gerätewechsel: Backup auf dem alten Gerät exportieren, Datei ans neue Gerät übertragen (z. B. per Mail oder USB-Stick), dort über „Backup importieren“ wieder einspielen.</p>' +
        '<input type="file" id="import-json-input" accept="application/json,.json" class="visually-hidden">' +
      '</div>' +

      installHintHtml();

    var exportJsonBtn = root.querySelector('#export-json');
    var exportCsvBtn = root.querySelector('#export-csv');
    if (exportJsonBtn) exportJsonBtn.addEventListener('click', function () { App.exportJSON(); Utils.toast('Backup heruntergeladen'); render(root); });
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', function () { App.exportWeightCSV(); Utils.toast('CSV heruntergeladen'); render(root); });

    var importBtn = root.querySelector('#import-json');
    var importInput = root.querySelector('#import-json-input');
    if (importBtn) importBtn.addEventListener('click', function () { importInput.click(); });
    if (importInput) importInput.addEventListener('change', function () {
      var file = importInput.files && importInput.files[0];
      App.importJSON(file);
      importInput.value = '';
    });

    var reminderBtn = root.querySelector('#backup-reminder-btn');
    if (reminderBtn) reminderBtn.addEventListener('click', function () {
      App.exportJSON();
      Utils.toast('Backup heruntergeladen');
      render(root);
    });

    root.querySelector('#sleep-minus').addEventListener('click', function () { adjustSleep(-0.5); App.afterAction(); render(root); });
    root.querySelector('#sleep-plus').addEventListener('click', function () { adjustSleep(0.5); App.afterAction(); render(root); });

    root.querySelector('#water-minus').addEventListener('click', function () { addWaterMl(-GLASS_ML); App.afterAction(); render(root); });
    root.querySelector('#water-plus').addEventListener('click', function () { addWaterMl(GLASS_ML); App.afterAction(); render(root); });

    var openFoodBtn = root.querySelector('#open-food-picker');
    if (openFoodBtn) openFoodBtn.addEventListener('click', function () {
      foodPicker.open = true;
      render(root);
    });

    var openDrinkBtn = root.querySelector('#open-drink-picker');
    if (openDrinkBtn) openDrinkBtn.addEventListener('click', function () {
      drinkPicker.open = true;
      render(root);
    });

    root.querySelectorAll('[data-remove-food]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        removeFoodEntry(btn.getAttribute('data-remove-food'));
        render(root);
      });
    });

    root.querySelectorAll('[data-remove-drink]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        removeDrinkEntry(btn.getAttribute('data-remove-drink'));
        render(root);
      });
    });

    if (foodPicker.open) {
      root.querySelector('#food-picker-close').addEventListener('click', function () { foodPicker.open = false; render(root); });
      root.querySelector('#food-picker-backdrop').addEventListener('click', function () { foodPicker.open = false; render(root); });

      root.querySelectorAll('[data-food-tab]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          foodPicker.tab = btn.getAttribute('data-food-tab');
          render(root);
        });
      });

      if (foodPicker.tab === 'recipe') {
        var foodSearch = root.querySelector('#food-picker-search');
        if (foodSearch) foodSearch.addEventListener('input', Utils.debounce(function () {
          foodPicker.query = foodSearch.value;
          var resultsEl = document.getElementById('food-picker-results');
          if (resultsEl) {
            resultsEl.innerHTML = foodPickerResultsHtml();
            bindFoodPickerResults(root);
          }
        }, 150));
        bindFoodPickerResults(root);
      } else {
        var saveFoodBtn = root.querySelector('#food-picker-save');
        if (saveFoodBtn) saveFoodBtn.addEventListener('click', function () {
          var name = document.getElementById('food-picker-name').value.trim();
          var kcal = parseInt(document.getElementById('food-picker-kcal').value, 10);
          if (!name) { Utils.toast('Bitte etwas eintragen'); return; }
          if (isNaN(kcal) || kcal <= 0) { Utils.toast('Bitte die Kalorien eingeben'); return; }
          addFoodEntry(name, kcal);
          foodPicker.open = false;
          Utils.toast('Eingetragen');
          App.afterAction();
          render(root);
        });
      }
    }

    if (drinkPicker.open) {
      root.querySelector('#drink-picker-close').addEventListener('click', function () { drinkPicker.open = false; render(root); });
      root.querySelector('#drink-picker-backdrop').addEventListener('click', function () { drinkPicker.open = false; render(root); });

      root.querySelectorAll('[data-drink-tab]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          drinkPicker.tab = btn.getAttribute('data-drink-tab');
          render(root);
        });
      });

      if (drinkPicker.tab === 'preset') {
        bindDrinkPresetResults(root);
      } else {
        var saveDrinkBtn = root.querySelector('#drink-picker-save');
        if (saveDrinkBtn) saveDrinkBtn.addEventListener('click', function () {
          var name = document.getElementById('drink-picker-name').value.trim();
          var kcal = parseInt(document.getElementById('drink-picker-kcal').value, 10);
          if (!name) { Utils.toast('Bitte etwas eintragen'); return; }
          if (isNaN(kcal) || kcal < 0) { Utils.toast('Bitte die Kalorien eingeben'); return; }
          addDrinkEntry(name, kcal);
          drinkPicker.open = false;
          Utils.toast('Eingetragen');
          App.afterAction();
          render(root);
        });
      }
    }
  }

  function greeting() {
    var h = new Date().getHours();
    if (h < 11) return 'Guten Morgen';
    if (h < 17) return 'Schönen Tag';
    return 'Guten Abend';
  }

  function streakMessage(streak) {
    if (streak === 0) return 'Heute noch etwas eintragen und die Streak starten.';
    if (streak < 3) return 'Guter Start — dranbleiben.';
    if (streak < 7) return 'Läuft richtig gut.';
    if (streak < 14) return 'Eine Woche und mehr — das zahlt sich aus.';
    return 'Beeindruckende Konstanz.';
  }

  window.Views = window.Views || {};
  window.Views.dashboard = { render: render };
})();
