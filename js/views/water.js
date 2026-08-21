/* =========================================================================
   VIEW — Wasser
   Tagesziel, schnelle Tap-Buttons, Fortschrittsring, Erinnerungen.
   ========================================================================= */

(function () {
  'use strict';

  var GLASS_ML = 250;
  var BOTTLE_ML = 500;

  function getGoal() { return Storage.read(Storage.KEYS.waterGoalMl, 2000); }
  function setGoal(ml) { Storage.write(Storage.KEYS.waterGoalMl, ml); }

  function getToday() {
    var log = Storage.read(Storage.KEYS.waterLog, {});
    return log[Utils.todayISO()] || 0;
  }

  function addWater(ml) {
    var log = Storage.read(Storage.KEYS.waterLog, {});
    var today = Utils.todayISO();
    log[today] = Math.max(0, (log[today] || 0) + ml);
    Storage.write(Storage.KEYS.waterLog, log);
    Storage.markActiveToday();
  }

  function last7Days() {
    var log = Storage.read(Storage.KEYS.waterLog, {});
    var goal = getGoal();
    var days = [];
    for (var i = 6; i >= 0; i--) {
      var d = Utils.addDays(Utils.todayISO(), -i);
      days.push({ date: d, ml: log[d] || 0, pct: goal ? Utils.clamp((log[d] || 0) / goal, 0, 1) : 0 });
    }
    return days;
  }

  function renderReminderSettings() {
    var prefs = Reminders.getPrefs();
    if (!Reminders.isSupported()) {
      return '<p class="text-sm text-soft">Erinnerungen werden von diesem Browser nicht unterstützt.</p>';
    }
    return '<label style="display:flex; align-items:center; gap:10px; font-weight:600; cursor:pointer;">' +
      '<input type="checkbox" id="notif-toggle" ' + (prefs.enabled ? 'checked' : '') + ' style="width:18px;height:18px;">' +
      'Erinnerungen über den Tag verteilt' +
      '</label>' +
      '<p class="text-sm text-soft">Erinnert um: ' + prefs.times.join(', ') + ' Uhr — nur solange dieser Tab geöffnet ist.</p>';
  }

  function render(root) {
    var goal = getGoal();
    var today = getToday();
    var pct = goal ? today / goal : 0;
    var days = last7Days();
    var maxMl = Math.max(goal, Math.max.apply(null, days.map(function (d) { return d.ml; })), 1);

    root.innerHTML =
      '<div class="view-header">' +
        '<span class="view-header__eyebrow">Wasser</span>' +
        '<h1>Genug getrunken?</h1>' +
        '<p>Ausreichend Wasser hilft beim Sattwerden und wird beim Abnehmen oft unterschätzt.</p>' +
      '</div>' +

      '<div class="card" style="text-align:center;">' +
        '<div class="progress-ring" style="margin: 0 auto var(--space-3);">' +
          Utils.progressRingSVG(pct, 140, 14, 'var(--color-surface-sunken)', 'var(--color-primary)') +
          '<div class="progress-ring__label" style="font-size:1.5rem;">' + (today / 1000).toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' l<small>von ' + (goal / 1000).toLocaleString('de-DE', { maximumFractionDigits: 2 }) + ' l</small></div>' +
        '</div>' +
        '<div class="water-glasses" style="justify-content:center;">' +
          '<button class="water-tap-btn" id="add-glass">' + Icons.drop(22) + '<span>+1 Glas</span><span class="text-sm text-soft">' + GLASS_ML + ' ml</span></button>' +
          '<button class="water-tap-btn" id="add-bottle">' + Icons.drop(22) + '<span>+1 Flasche</span><span class="text-sm text-soft">' + BOTTLE_ML + ' ml</span></button>' +
          '<button class="btn btn--ghost btn--sm" id="undo-water">Letzte Eingabe rückgängig</button>' +
        '</div>' +
      '</div>' +

      '<div class="card" style="margin-top: var(--space-4);">' +
        '<h3 class="mt-0">Letzte 7 Tage</h3>' +
        '<div style="display:flex; align-items:flex-end; gap:10px; height:100px;">' +
          days.map(function (d) {
            var h = Math.max(4, Math.round((d.ml / maxMl) * 90));
            var isToday = d.date === Utils.todayISO();
            return '<div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:6px;">' +
              '<div style="width:100%; height:90px; display:flex; align-items:flex-end;">' +
                '<div style="width:100%; height:' + h + 'px; border-radius:6px 6px 2px 2px; background:' + (isToday ? 'var(--color-primary)' : 'var(--color-primary-light)') + ';"></div>' +
              '</div>' +
              '<span class="text-sm text-soft">' + Utils.formatDateShort(d.date).replace(/\..*/, '') + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>' +

      '<div class="card" style="margin-top: var(--space-4);">' +
        '<h3 class="mt-0">Tagesziel</h3>' +
        '<form id="goal-water-form" class="input-row">' +
          '<div class="field" style="margin-bottom:0;"><label for="water-goal">Ziel in Litern</label>' +
          '<input class="input" id="water-goal" type="number" step="0.1" min="0.5" max="6" value="' + (goal / 1000) + '"></div>' +
          '<button class="btn btn--secondary" type="submit">Speichern</button>' +
        '</form>' +
      '</div>' +

      '<div class="card" style="margin-top: var(--space-4);">' +
        '<h3 class="mt-0">' + Icons.bell(18) + ' Erinnerungen</h3>' +
        '<div id="notif-settings">' + renderReminderSettings() + '</div>' +
      '</div>';

    root.querySelector('#add-glass').addEventListener('click', function () { addWater(GLASS_ML); afterAdd(root); });
    root.querySelector('#add-bottle').addEventListener('click', function () { addWater(BOTTLE_ML); afterAdd(root); });
    root.querySelector('#undo-water').addEventListener('click', function () {
      if (getToday() > 0) { addWater(-GLASS_ML); render(root); }
    });

    root.querySelector('#goal-water-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var liters = parseFloat(document.getElementById('water-goal').value);
      if (!liters || liters <= 0) return;
      setGoal(Math.round(liters * 1000));
      Utils.toast('Tagesziel gespeichert');
      render(root);
    });

    var notifToggle = root.querySelector('#notif-toggle');
    if (notifToggle) {
      notifToggle.addEventListener('change', function () {
        var prefs = Reminders.getPrefs();
        if (notifToggle.checked) {
          Reminders.requestPermission().then(function (perm) {
            prefs.enabled = perm === 'granted';
            Reminders.setPrefs(prefs);
            if (perm === 'granted') { Reminders.start(); Utils.toast('Erinnerungen aktiviert'); }
            else { notifToggle.checked = false; Utils.toast('Berechtigung wurde nicht erteilt'); }
          });
        } else {
          prefs.enabled = false;
          Reminders.setPrefs(prefs);
          Reminders.stop();
        }
      });
    }
  }

  function afterAdd(root) {
    Utils.toast('Wasser eingetragen', Icons.drop(16));
    App.afterAction();
    render(root);
  }

  window.Views = window.Views || {};
  window.Views.wasser = { render: render };
})();
