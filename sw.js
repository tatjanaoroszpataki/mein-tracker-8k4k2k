/* =========================================================================
   SERVICE WORKER — cached die App beim ersten Aufruf, damit sie danach
   auch komplett ohne Internetverbindung startet. Funktioniert nur, wenn
   die App über http(s) ausgeliefert wird (Service Worker sind bei
   file:// nicht verfügbar) — das Registrieren dort schlägt einfach
   lautlos fehl, siehe js/app.js.

   Precache-Liste passt zur modularen Variante (index.html + css/js/…).
   Wird die Ein-Datei-Version (Schrittweise.html) gehostet, existieren
   die meisten dieser Pfade dort nicht — das ist kein Problem, jede
   Datei wird einzeln (nicht per addAll) versucht, fehlende Dateien
   werden einfach übersprungen. Die Laufzeit-Caching-Strategie im
   fetch-Handler cached zusätzlich alles, was tatsächlich abgerufen
   wird — inklusive Schrittweise.html selbst.
   ========================================================================= */

var CACHE_NAME = 'schrittweise-cache-v1';

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
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;

      return fetch(event.request).then(function (response) {
        if (response && response.status === 200 && response.type === 'basic') {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
        }
        return response;
      }).catch(function () {
        // Offline und nicht im Cache — bei Seitenaufrufen wenigstens die
        // Startseite anbieten, statt komplett leer zu bleiben.
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html').then(function (fallback) {
            return fallback || caches.match('./Schrittweise.html');
          });
        }
      });
    })
  );
});
