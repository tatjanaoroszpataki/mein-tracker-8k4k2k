/* =========================================================================
   ROUTER — einfaches Hash-Routing zwischen den Views.
   Kein Framework nötig: jede View ist ein <section class="view"> im DOM,
   window.Views.<name>.render(container) füllt sie mit aktuellem Inhalt.
   ========================================================================= */

(function () {
  'use strict';

  var DEFAULT_ROUTE = 'dashboard';

  function currentRoute() {
    var hash = window.location.hash.replace(/^#\/?/, '');
    return hash || DEFAULT_ROUTE;
  }

  function show(route) {
    if (!window.Views || !window.Views[route]) route = DEFAULT_ROUTE;

    document.querySelectorAll('.view').forEach(function (el) {
      el.classList.toggle('is-active', el.id === 'view-' + route);
    });
    document.querySelectorAll('.app-nav__item').forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-route') === route);
    });

    var container = document.getElementById('view-' + route);
    if (container && window.Views[route]) {
      window.Views[route].render(container);
    }

    // Fokus auf die Überschrift der neuen View setzen (Zugänglichkeit bei
    // Tastatur-/Screenreader-Navigation), aber Seite nicht scrollen lassen.
    var heading = container && container.querySelector('h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
    window.scrollTo(0, 0);
  }

  function init() {
    window.addEventListener('hashchange', function () { show(currentRoute()); });
    show(currentRoute());
  }

  window.Router = { init: init, show: show, currentRoute: currentRoute };
})();
