/* =========================================================================
   SERVICE WORKER — sorgt dafür, dass die App auch offline startet.
   Funktioniert nur, wenn die App über http(s) ausgeliefert wird (Service
   Worker sind bei file:// nicht verfügbar) — das Registrieren schlägt
   dort einfach lautlos fehl, siehe js/app.js.

   Strategie: "Network first, Cache als Fallback" — bei jedem Aufruf wird
   zuerst versucht, die Datei frisch aus dem Netz zu laden (und der Cache
   dabei aktualisiert); nur wenn das fehlschlägt (offline), wird die
   zuletzt gespeicherte Version aus dem Cache verwendet. Das stellt sicher,
   dass Updates beim nächsten Öffnen mit Internetverbindung sofort
   ankommen, während Offline-Nutzung trotzdem zuverlässig funktioniert.

   CACHE_NAME bei größeren Änderungen an der Dateiliste hochzählen, damit
   der activate-Handler alte, nicht mehr gebrauchte Caches aufräumt.

   Precache-Liste passt zur modularen Variante (index.html + css/js/…).
   Wird die Ein-Datei-Version (Schrittweise.html) gehostet, existieren
   die meisten dieser Pfade dort nicht — kein Problem, jede Datei wird
   einzeln (nicht per addAll) versucht, fehlende Dateien werden einfach
   übersprungen.
   ========================================================================= */

var CACHE_NAME = 'schrittweise-cache-v3';

var PRECACHE_URLS = [
  './',
  './index.html',
  './Schrittweise.html',
  './manifest.json',
  './css/tokens.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './js/storage.js',
  './js/utils.js',
  './js/icons.js',
  './js/notifications.js',
  './js/chart.js',
  './js/custom-recipes.js',
  './js/custom-foods.js',
  './js/custom-exercises.js',
  './js/search.js',
  './js/assistant.js',
  './js/router.js',
  './js/app.js',
  './js/data/foods.js',
  './js/data/recipes.js',
  './js/data/exercises.js',
  './js/data/knowledge.js',
  './js/views/dashboard.js',
  './js/views/weight.js',
  './js/views/calories.js',
  './js/views/foods.js',
  './js/views/wochenplaner.js',
  './js/views/recipes.js',
  './js/views/water.js',
  './js/views/movement.js',
  './js/views/knowledge.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(
        PRECACHE_URLS.map(function (url) {
          return cache.add(url).catch(function () {
            // Datei existiert in dieser Deployment-Variante nicht — ok, überspringen.
          });
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then(function (response) {
      // Frische Antwort bekommen — im Cache ablegen, damit sie auch
      // offline verfügbar ist, und direkt ausliefern.
      if (response && response.status === 200 && response.type === 'basic') {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
      }
      return response;
    }).catch(function () {
      // Netzwerk nicht erreichbar (offline) — auf den Cache zurückfallen.
      return caches.match(event.request).then(function (cached) {
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html').then(function (fallback) {
            return fallback || caches.match('./Schrittweise.html');
          });
        }
      });
    })
  );
});
