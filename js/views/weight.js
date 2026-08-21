/* =========================================================================
   VIEW — Gewicht
   Eintrag, Zielgewicht mit Tempo-Warnung, Verlaufskurve, Wochenrückblick.
   ========================================================================= */

(function () {
  'use strict';

  var state = { range: 8, tab: 'gewicht' }; // sichtbare Wochen im Chart, aktiver Tab
  var resizeBound = false; // Resize-Listener nur einmal registrieren, nicht bei jedem render()

  function getEntries() {
    return Storage.read(Storage.KEYS.weightEntries, []).slice().sort(function (a, b) {
      return a.date < b.date ? -1 : 1;
    });
  }

  /** Taille/Hüfte sind optional — nur setzen, wenn diesmal ein Wert
   *  eingegeben wurde, sonst bleibt ein früher erfasster Wert für dieses
   *  Datum unangetastet (kein versehentliches Löschen durch Leerlassen). */
  function upsertEntry(date, kg, waistCm, hipCm) {
    var entries = Storage.read(Storage.KEYS.weightEntries, []);
    var existing = entries.filter(function (e) { return e.date === date; })[0];
    if (existing) {
      existing.kg = kg;
      if (waistCm != null) existing.waistCm = waistCm;
      if (hipCm != null) existing.hipCm = hipCm;
    } else {
      var entry = { id: Storage.uid(), date: date, kg: kg };
      if (waistCm != null) entry.waistCm = waistCm;
      if (hipCm != null) entry.hipCm = hipCm;
      entries.push(entry);
    }
    Storage.write(Storage.KEYS.weightEntries, entries);
    Storage.markActiveToday();
  }

  function deleteEntry(id) {
    var entries = Storage.read(Storage.KEYS.weightEntries, []).filter(function (e) { return e.id !== id; });
    Storage.write(Storage.KEYS.weightEntries, entries);
  }

  function getGoal() {
    return Storage.read(Storage.KEYS.weightGoal, null);
  }

  function setGoal(targetKg) {
    var entries = getEntries();
    var goal = getGoal() || {};
    if (!goal.startKg && entries.length) {
      goal.startKg = entries[0].kg;
      goal.startDate = entries[0].date;
    }
    goal.targetKg = targetKg;
    Storage.write(Storage.KEYS.weightGoal, goal);
  }

  /** Wochenweise Durchschnitte, neueste zuerst. */
  function weeklyAverages(entries) {
    var byWeek = {};
    entries.forEach(function (e) {
      var wk = Utils.startOfWeek(e.date);
      byWeek[wk] = byWeek[wk] || [];
      byWeek[wk].push(e.kg);
    });
    var weeks = Object.keys(byWeek).sort();
    return weeks.map(function (wk, i) {
      var avg = byWeek[wk].reduce(function (s, v) { return s + v; }, 0) / byWeek[wk].length;
      return { week: wk, avg: avg, count: byWeek[wk].length };
    });
  }

  function paceWarning(entries, goal) {
    if (!goal || !goal.targetKg || entries.length < 2) return null;
    var weeks = weeklyAverages(entries);
    if (weeks.length < 2) return null;
    var last = weeks[weeks.length - 1];
    var prev = weeks[weeks.length - 2];
    var losingGoal = goal.targetKg < (goal.startKg || entries[0].kg);
    var change = prev.avg - last.avg; // positiv = Gewicht runter
    if (losingGoal && change > 1.05) {
      var abs = Utils.round1(change).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      return { level: 'caution', text: 'Das Tempo liegt bei ' + abs + ' kg in der letzten Woche — schneller als der empfohlene Richtwert von 0,5–1 kg/Woche. Lieber etwas moderater, das hält länger.' };
    }
    if (losingGoal && change < -0.2) {
      return { level: 'info', text: 'Das Gewicht ist zuletzt leicht gestiegen. Ganz normal durch Schwankungen — der Wochentrend zählt, nicht ein einzelner Tag.' };
    }
    return null;
  }

  function renderEntryList(entries) {
    if (!entries.length) return '';
    var rows = entries.slice().reverse().slice(0, 10).map(function (e) {
      return '<li class="shop-item">' +
        '<span style="flex:1">' + Utils.formatDateLong(e.date) + '</span>' +
        '<strong>' + Utils.formatKg(e.kg) + '</strong>' +
        '<button class="shop-item__remove" data-del="' + e.id + '" aria-label="Eintrag löschen">' + Icons.trash(16) + '</button>' +
      '</li>';
    }).join('');
    return '<h3 style="margin-top: var(--space-6);">Letzte Einträge</h3><ul class="stack" style="gap:0;">' + rows + '</ul>';
  }

  function renderWeeklyReview(entries) {
    var weeks = weeklyAverages(entries).slice(-6).reverse();
    if (weeks.length < 1) return '';
    var rows = weeks.map(function (w, i) {
      var prevWeek = weeks[i + 1];
      var delta = prevWeek ? Utils.round1(w.avg - prevWeek.avg) : null;
      var deltaHtml = delta === null ? '<span class="text-soft text-sm">erste Woche</span>' :
        '<span class="text-sm" style="color:' + (delta < 0 ? 'var(--color-go)' : delta > 0 ? 'var(--color-stop)' : 'var(--color-ink-soft)') + '">' +
        Utils.formatDeltaKg(delta) + ' ggü. Vorwoche</span>';
      return '<li class="shop-item"><span style="flex:1">Woche ab ' + Utils.formatDateShort(w.week) + '</span>' +
        '<strong style="margin-right:var(--space-3)">' + Utils.formatKg(w.avg) + '</strong>' + deltaHtml + '</li>';
    }).join('');
    return '<h3 style="margin-top: var(--space-6);">Wochenrückblick</h3>' +
      '<p class="text-sm text-soft mt-0">Der Trend über die Woche zählt mehr als einzelne Tageswerte.</p>' +
      '<ul class="stack" style="gap:0;">' + rows + '</ul>';
  }

  function renderGoalCard(entries, goal) {
    var currentKg = entries.length ? entries[entries.length - 1].kg : null;
    var progressHtml = '';
    if (goal && goal.targetKg && goal.startKg && currentKg !== null) {
      var totalToLose = goal.startKg - goal.targetKg;
      var lostSoFar = goal.startKg - currentKg;
      var pct = totalToLose !== 0 ? Utils.clamp(lostSoFar / totalToLose, 0, 1) : 0;
      progressHtml =
        '<div style="margin-top: var(--space-3);">' +
          '<div class="flex-between text-sm text-soft"><span>' + Utils.formatKg(goal.startKg) + '</span><span>Ziel: ' + Utils.formatKg(goal.targetKg) + '</span></div>' +
          '<div class="progress-bar" style="margin-top:6px;"><div class="progress-bar__fill" style="width:' + (pct * 100) + '%"></div></div>' +
        '</div>';
    }
    return '<div class="card">' +
      '<h3 class="mt-0">Zielgewicht</h3>' +
      '<form id="goal-form" class="input-row">' +
        '<div class="field" style="margin-bottom:0;"><label for="goal-kg">Zielgewicht (kg)</label>' +
        '<input class="input" id="goal-kg" type="number" step="0.1" min="30" max="300" value="' + (goal && goal.targetKg ? goal.targetKg : '') + '" placeholder="z. B. 85"></div>' +
        '<button class="btn btn--secondary" type="submit">Speichern</button>' +
      '</form>' +
      progressHtml +
    '</div>';
  }

  function renderWaistTab(root, entries) {
    var waistEntries = entries.filter(function (e) { return e.waistCm != null; });
    var chartEntries = waistEntries.map(function (e) { return { date: e.date, kg: e.waistCm }; });
    var rows = waistEntries.slice().reverse().slice(0, 10).map(function (e) {
      return '<li class="shop-item"><span style="flex:1">' + Utils.formatDateLong(e.date) + '</span>' +
        '<strong>' + Utils.round1(e.waistCm).toLocaleString('de-DE', { minimumFractionDigits: 1 }) + ' cm</strong>' +
        (e.hipCm != null ? '<span class="text-sm text-soft" style="margin-left:var(--space-3);">Hüfte: ' + Utils.round1(e.hipCm).toLocaleString('de-DE', { minimumFractionDigits: 1 }) + ' cm</span>' : '') +
      '</li>';
    }).join('');

    return '<div class="card" style="margin-top: var(--space-4);">' +
      '<p class="text-sm text-soft mt-0">Das Gewicht allein sagt nicht alles — besonders bei Krafttraining kann sich der Umfang verändern, auch wenn die Waage stillsteht.</p>' +
      (waistEntries.length ?
        '<h3>Taillenumfang</h3>' +
        '<div class="chart-wrap"><canvas id="waist-canvas" height="220"></canvas></div>' +
        '<h3 style="margin-top: var(--space-6);">Letzte Einträge</h3>' +
        '<ul class="stack" style="gap:0;">' + rows + '</ul>'
        : '<div class="empty-state">' + Icons.empty(40) + '<p>Noch keine Taillenmaße erfasst — trag beim Gewicht-Eintrag oben einfach den Umfang mit ein.</p></div>') +
    '</div>';
  }

  function render(root) {
    var entries = getEntries();
    var goal = getGoal();
    var warning = paceWarning(entries, goal);

    root.innerHTML =
      '<div class="view-header">' +
        '<span class="view-header__eyebrow">Gewicht</span>' +
        '<h1>Verlauf statt Tageslaune</h1>' +
        '<p>Ein einzelner Tag sagt wenig — der Trend über Wochen zeigt, ob es in die richtige Richtung geht.</p>' +
      '</div>' +

      '<div class="card">' +
        '<h3 class="mt-0">Gewicht eintragen</h3>' +
        '<form id="weight-form" class="input-row">' +
          '<div class="field" style="margin-bottom:0;"><label for="w-date">Datum</label><input class="input" id="w-date" type="date" value="' + Utils.todayISO() + '" max="' + Utils.todayISO() + '"></div>' +
          '<div class="field" style="margin-bottom:0;"><label for="w-kg">Gewicht (kg)</label><input class="input" id="w-kg" type="number" step="0.1" min="30" max="300" placeholder="z. B. 92.4" required></div>' +
          '<div class="field" style="margin-bottom:0;"><label for="w-waist">Taille (cm, optional)</label><input class="input" id="w-waist" type="number" step="0.5" min="40" max="200" placeholder="z. B. 98"></div>' +
          '<div class="field" style="margin-bottom:0;"><label for="w-hip">Hüfte (cm, optional)</label><input class="input" id="w-hip" type="number" step="0.5" min="40" max="200" placeholder="optional"></div>' +
          '<button class="btn btn--primary" type="submit">' + Icons.plus(16) + ' Eintragen</button>' +
        '</form>' +
      '</div>' +

      (warning ? '<div class="card" style="margin-top: var(--space-4); border-color:' +
        (warning.level === 'caution' ? 'var(--color-caution)' : 'var(--color-border)') + '; background:' +
        (warning.level === 'caution' ? 'var(--color-caution-bg)' : 'var(--color-primary-tint)') + ';">' +
        '<div class="flex-between" style="align-items:flex-start;">' + Icons.target(20) + '<p class="mt-0" style="flex:1">' + warning.text + '</p></div></div>' : '') +

      '<div class="chip-row" style="margin-top: var(--space-5);">' +
        '<button class="chip' + (state.tab === 'gewicht' ? ' is-active' : '') + '" data-tab="gewicht">Gewicht</button>' +
        '<button class="chip' + (state.tab === 'taille' ? ' is-active' : '') + '" data-tab="taille">Taille &amp; Hüfte</button>' +
      '</div>' +

      (state.tab === 'gewicht' ?
        '<div class="card" style="margin-top: var(--space-4);">' +
          '<div class="flex-between"><h3 class="mt-0">Verlauf</h3></div>' +
          '<div class="chart-wrap"><canvas id="weight-canvas" height="220"></canvas></div>' +
          '<div class="chart-legend">' +
            '<span class="chart-legend__item"><span class="chart-legend__swatch" style="background:var(--color-primary)"></span>Trend</span>' +
            (goal && goal.targetKg ? '<span class="chart-legend__item"><span class="chart-legend__swatch" style="background:var(--color-accent)"></span>Ziel</span>' : '') +
          '</div>' +
          renderWeeklyReview(entries) +
          renderEntryList(entries) +
        '</div>' +
        renderGoalCard(entries, goal)
        : renderWaistTab(root, entries)) +

      '<hr class="hr">' +
      '<div id="calories-embed"></div>';

    if (state.tab === 'gewicht' && entries.length) {
      WeightChart.draw(document.getElementById('weight-canvas'), entries, goal);
    }
    if (state.tab === 'taille') {
      var waistCanvas = document.getElementById('waist-canvas');
      if (waistCanvas) {
        var waistEntries = entries.filter(function (e) { return e.waistCm != null; })
          .map(function (e) { return { date: e.date, kg: e.waistCm }; });
        WeightChart.draw(waistCanvas, waistEntries, null);
      }
    }

    document.getElementById('weight-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var date = document.getElementById('w-date').value || Utils.todayISO();
      var kg = parseFloat(document.getElementById('w-kg').value);
      if (!kg || kg <= 0) return;
      var waistVal = parseFloat(document.getElementById('w-waist').value);
      var hipVal = parseFloat(document.getElementById('w-hip').value);
      upsertEntry(date, kg, isNaN(waistVal) ? null : waistVal, isNaN(hipVal) ? null : hipVal);
      Utils.toast('Gewicht gespeichert');
      App.afterAction();
      render(root);
    });

    var goalForm = document.getElementById('goal-form');
    if (goalForm) goalForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var val = parseFloat(document.getElementById('goal-kg').value);
      if (!val || val <= 0) return;
      setGoal(val);
      Utils.toast('Zielgewicht gespeichert');
      render(root);
    });

    root.querySelectorAll('[data-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.tab = btn.getAttribute('data-tab');
        render(root);
      });
    });

    root.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        deleteEntry(btn.getAttribute('data-del'));
        render(root);
      });
    });

    // Kalorienbedarf-Rechner direkt unter dem Gewicht angehängt (kein
    // eigener Menüpunkt mehr) — Views.kalorien rendert komplett
    // eigenständig in den übergebenen Container hinein. Bewusst ganz am
    // Ende und in try/catch: falls das je aus irgendeinem Grund einen
    // Fehler wirft, sollen die wichtigeren Bindungen oben (Gewicht
    // eintragen, Ziel speichern usw.) trotzdem sicher funktionieren.
    try {
      if (window.Views.kalorien) {
        Views.kalorien.render(document.getElementById('calories-embed'));
      }
    } catch (err) {
      console.warn('Kalorienbedarf-Bereich konnte nicht gerendert werden', err);
    }

    if (!resizeBound) {
      resizeBound = true;
      var lastWidth = window.innerWidth;
      window.addEventListener('resize', Utils.debounce(function () {
        // Nur auf echte Breitenänderungen reagieren (Drehung, Fenster
        // verkleinert) — nicht auf reine Höhenänderungen. Mobile Browser
        // feuern nämlich auch "resize", wenn die Bildschirmtastatur auf-
        // oder zuklappt; ein voller render() hätte dann das gerade
        // fokussierte Eingabefeld zerstört und die Tastatur sofort wieder
        // zugeklappt. Deshalb hier gezielt nur die Charts neu zeichnen,
        // nicht die ganze Seite neu aufbauen.
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        if (!document.getElementById('view-gewicht').classList.contains('is-active')) return;

        var currentEntries = getEntries();
        if (state.tab === 'gewicht') {
          var wc = document.getElementById('weight-canvas');
          if (wc && currentEntries.length) WeightChart.draw(wc, currentEntries, getGoal());
        } else if (state.tab === 'taille') {
          var waistCanvasEl = document.getElementById('waist-canvas');
          if (waistCanvasEl) {
            var waistEntries = currentEntries.filter(function (e) { return e.waistCm != null; })
              .map(function (e) { return { date: e.date, kg: e.waistCm }; });
            WeightChart.draw(waistCanvasEl, waistEntries, null);
          }
        }
      }, 150));
    }
  }

  window.Views = window.Views || {};
  window.Views.gewicht = { render: render };
})();
