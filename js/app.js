/* =========================================================================
   APP — Bootstrapping: Navigation aufbauen, Router starten, Erinnerungen
   starten, Meilenstein-Erfolgsmeldungen, Datenexport.
   ========================================================================= */

(function () {
  'use strict';

  var NAV_ITEMS = [
    { route: 'dashboard', label: 'Übersicht', icon: Icons.home },
    { route: 'gewicht', label: 'Gewicht', icon: Icons.scale },
    { route: 'lebensmittel', label: 'Essen', icon: Icons.apple },
    { route: 'wochenplaner', label: 'Rezepte', icon: Icons.book },
    { route: 'wasser', label: 'Wasser', icon: Icons.drop },
    { route: 'bewegung', label: 'Bewegung', icon: Icons.figure },
    { route: 'wissen', label: 'Wissen', icon: Icons.lightbulb }
  ];

  function buildNav() {
    var nav = document.getElementById('app-nav');
    var brand = '<div class="app-nav__brand">' + Icons.mark(32) + '<span>Schrittweise</span></div>';
    var items = NAV_ITEMS.map(function (item) {
      return '<a class="app-nav__item" href="#/' + item.route + '" data-route="' + item.route + '">' +
        item.icon(22) + '<span>' + item.label + '</span></a>';
    }).join('');
    var streak = '<div class="app-nav__streak" id="nav-streak">' + Icons.flame(18) + '<span id="nav-streak-count">0 Tage</span></div>';
    nav.innerHTML = brand + items + streak;
  }

  function buildHeader() {
    var header = document.getElementById('app-header');
    header.innerHTML =
      '<span class="app-header__mark">' + Icons.mark(34) + '</span>' +
      '<span class="app-header__title">Schrittweise</span>' +
      '<span class="app-header__streak" id="header-streak">' + Icons.flame(15) + '<span id="header-streak-count">0</span></span>';
  }

  function updateChrome() {
    var streak = Storage.getStreak();
    var navCount = document.getElementById('nav-streak-count');
    var headerCount = document.getElementById('header-streak-count');
    if (navCount) navCount.textContent = streak + (streak === 1 ? ' Tag' : ' Tage');
    if (headerCount) headerCount.textContent = streak;
  }

  /* ---- Meilensteine --------------------------------------------------------
     Kleine, unaufdringliche Erfolgsmeldungen. Jeder Meilenstein wird nur
     einmal gefeiert (gemerkt in localStorage), damit es nicht nervt.
  */
  var CELEBRATED_KEY = 'schrittweise:celebrated';

  function getCelebrated() { return Storage.read(CELEBRATED_KEY, []); }
  function celebrate(key, message) {
    var seen = getCelebrated();
    if (seen.indexOf(key) !== -1) return;
    seen.push(key);
    Storage.write(CELEBRATED_KEY, seen);
    setTimeout(function () { Utils.toast(message, Icons.flame(16)); }, 350);
  }

  function checkMilestones() {
    var streak = Storage.getStreak();
    [3, 7, 14, 30, 60, 100].forEach(function (n) {
      if (streak === n) celebrate('streak-' + n, n + ' Tage in Folge aktiv — stark.');
    });

    var today = Utils.todayISO();
    var waterGoal = Storage.read(Storage.KEYS.waterGoalMl, 2000);
    var waterLog = Storage.read(Storage.KEYS.waterLog, {});
    if (waterGoal && (waterLog[today] || 0) >= waterGoal) {
      celebrate('water-' + today, 'Tagesziel Wasser erreicht.');
    }

    var exLog = Storage.read(Storage.KEYS.exerciseLog, {});
    var doneToday = exLog[today] || [];
    if (MINI_EXERCISES.every(function (e) { return doneToday.indexOf(e.id) !== -1; })) {
      celebrate('mini-all-' + today, 'Alle Mini-Übungen heute erledigt.');
    }

    var goal = Storage.read(Storage.KEYS.weightGoal, null);
    var entries = Storage.read(Storage.KEYS.weightEntries, []);
    if (goal && goal.targetKg && entries.length) {
      var last = entries.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).pop();
      if (last.kg <= goal.targetKg) celebrate('goal-reached', 'Zielgewicht erreicht — ein großer Meilenstein.');
    }
  }

  /** Wird von Views nach jeder sinnvollen Nutzer-Aktion aufgerufen. */
  function afterAction() {
    updateChrome();
    checkMilestones();
  }

  /* ---- Export ---------------------------------------------------------- */
  function downloadBlob(content, filename, type) {
    var blob = new Blob([content], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function markBackupDone() {
    Storage.write(Storage.KEYS.lastBackupDate, Utils.todayISO());
  }

  /** Tage seit dem letzten Export, oder null, wenn noch nie gesichert wurde. */
  function daysSinceBackup() {
    var last = Storage.read(Storage.KEYS.lastBackupDate, null);
    if (!last) return null;
    var diffMs = Utils.parseISO(Utils.todayISO()) - Utils.parseISO(last);
    return Math.round(diffMs / 86400000);
  }

  function exportJSON() {
    var data = Storage.exportAll();
    downloadBlob(JSON.stringify(data, null, 2), 'schrittweise-backup-' + Utils.todayISO() + '.json', 'application/json');
    markBackupDone();
  }

  function exportWeightCSV() {
    var entries = Storage.read(Storage.KEYS.weightEntries, []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var rows = ['Datum;Gewicht (kg)'].concat(entries.map(function (e) { return e.date + ';' + e.kg.toString().replace('.', ','); }));
    downloadBlob(rows.join('\r\n'), 'schrittweise-gewicht-' + Utils.todayISO() + '.csv', 'text/csv;charset=utf-8');
    markBackupDone();
  }

  /**
   * Liest eine zuvor exportierte Backup-Datei ein und ersetzt nach
   * Bestätigung alle lokalen Daten damit. Grobe Validierung auf die
   * erwartete Struktur, freundliche Fehlermeldung statt stillem
   * Fehlschlag, kurze Sicherheitsabfrage vor dem Überschreiben.
   */
  function importJSON(file) {
    if (!file) return;
    var reader = new FileReader();

    reader.onload = function () {
      var data;
      try {
        data = JSON.parse(reader.result);
      } catch (err) {
        Utils.toast('Diese Datei konnte nicht gelesen werden. Bitte prüfe, ob es die richtige Backup-Datei ist.');
        return;
      }

      var looksValid = data && typeof data === 'object' && data.app === 'Schrittweise' && ('weightEntries' in data);
      if (!looksValid) {
        Utils.toast('Diese Datei konnte nicht gelesen werden. Bitte prüfe, ob es die richtige Backup-Datei ist.');
        return;
      }

      var proceed = window.confirm('Dadurch werden alle aktuell auf diesem Gerät gespeicherten Daten durch das Backup ersetzt. Fortfahren?');
      if (!proceed) return;

      Object.keys(Storage.KEYS).forEach(function (name) {
        var value = data[name];
        if (value !== null && value !== undefined) {
          Storage.write(Storage.KEYS[name], value);
        } else {
          window.localStorage.removeItem(Storage.KEYS[name]);
        }
      });

      Utils.toast('Backup erfolgreich eingespielt');
      // Kurz warten, damit die Meldung noch sichtbar ist, dann komplett
      // neu laden — das ist der zuverlässigste Weg, alle Ansichten und
      // internen Zwischenstände (z. B. Wochenplaner) sauber auf den neu
      // eingespielten Stand zu bringen.
      setTimeout(function () { window.location.reload(); }, 900);
    };

    reader.onerror = function () {
      Utils.toast('Diese Datei konnte nicht gelesen werden. Bitte prüfe, ob es die richtige Backup-Datei ist.');
    };

    reader.readAsText(file);
  }

  function boot() {
    buildHeader();
    buildNav();
    updateChrome();
    Search.build();
    Assistant.init();

    document.getElementById('app-nav').addEventListener('click', function (ev) {
      var link = ev.target.closest('.app-nav__item');
      if (link) {
        document.querySelectorAll('.app-nav__item').forEach(function (n) { n.classList.remove('is-active'); });
        link.classList.add('is-active');
      }
    });

    Router.init();
    window.addEventListener('hashchange', updateChrome);

    var prefs = Reminders.getPrefs();
    if (prefs.enabled && Reminders.isSupported() && Notification.permission === 'granted') {
      Reminders.start();
    }

    registerServiceWorker();
  }

  /**
   * Registriert den Service Worker, damit die App offline startet und
   * sich aufs Homescreen installieren lässt. Service Worker gibt es nur
   * in einem "secure context" (https oder localhost) — bei file:// ist
   * `serviceWorker` entweder gar nicht vorhanden oder die Registrierung
   * schlägt fehl. Beides wird hier bewusst lautlos abgefangen: das ist
   * kein Fehler, sondern der normale Fall beim direkten Öffnen der Datei.
   */
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('sw.js').catch(function () {
      // z. B. file:// oder sw.js nicht erreichbar — kein Problem, die
      // App funktioniert auch ohne Service Worker, nur eben nicht offline
      // installierbar.
    });
  }

  window.App = {
    afterAction: afterAction,
    exportJSON: exportJSON,
    exportWeightCSV: exportWeightCSV,
    importJSON: importJSON,
    updateChrome: updateChrome,
    daysSinceBackup: daysSinceBackup
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
