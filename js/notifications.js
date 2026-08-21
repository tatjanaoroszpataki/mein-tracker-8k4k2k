/* =========================================================================
   NOTIFICATIONS — Trinkerinnerungen über die Browser Notification API.
   Funktioniert nur, während der Tab offen ist (keine Service-Worker-
   Push-Nachrichten, damit die App zu 100% offline & ohne Server bleibt).
   ========================================================================= */

(function () {
  'use strict';

  var DEFAULT_TIMES = ['09:00', '11:00', '13:00', '15:00', '17:00'];
  var checkTimer = null;
  var firedToday = {};

  function getPrefs() {
    return Storage.read(Storage.KEYS.notifPrefs, { enabled: false, times: DEFAULT_TIMES });
  }

  function setPrefs(prefs) {
    Storage.write(Storage.KEYS.notifPrefs, prefs);
  }

  function isSupported() {
    return 'Notification' in window;
  }

  function requestPermission() {
    if (!isSupported()) return Promise.resolve('unsupported');
    return Notification.requestPermission();
  }

  function nowHM() {
    var d = new Date();
    return Utils.pad(d.getHours()) + ':' + Utils.pad(d.getMinutes());
  }

  function tick() {
    var prefs = getPrefs();
    if (!prefs.enabled || !isSupported() || Notification.permission !== 'granted') return;

    var today = Utils.todayISO();
    if (firedToday.day !== today) { firedToday = { day: today }; }

    var hm = nowHM();
    if (prefs.times.indexOf(hm) !== -1 && !firedToday[hm]) {
      firedToday[hm] = true;
      try {
        new Notification('Zeit für ein Glas Wasser 💧', {
          body: 'Kleine Pause, großer Effekt — trink etwas und halt dein Tagesziel im Blick.',
          tag: 'schrittweise-water'
        });
      } catch (err) {
        console.warn('Notification fehlgeschlagen', err);
      }
    }
  }

  function start() {
    if (checkTimer) return;
    tick();
    checkTimer = setInterval(tick, 30 * 1000);
  }

  function stop() {
    clearInterval(checkTimer);
    checkTimer = null;
  }

  window.Reminders = {
    DEFAULT_TIMES: DEFAULT_TIMES,
    getPrefs: getPrefs,
    setPrefs: setPrefs,
    isSupported: isSupported,
    requestPermission: requestPermission,
    start: start,
    stop: stop
  };
})();
