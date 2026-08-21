/* =========================================================================
   CUSTOM RECIPES — vom Nutzer selbst angelegte Rezepte (z. B. aus dem
   Wochenplaner heraus). Werden dauerhaft gespeichert und danach wie ganz
   normale App-Rezepte behandelt: sichtbar in der Rezepte-Übersicht,
   auswählbar bei künftigen Wochenplanungen, durchsuchbar im Assistenten.
   ========================================================================= */

(function () {
  'use strict';

  function getAll() {
    return Storage.read(Storage.KEYS.customRecipes, []);
  }

  function add(recipe) {
    var list = getAll();
    var entry = Object.assign({}, recipe, {
      id: 'custom-' + Storage.uid(),
      isCustom: true
    });
    list.push(entry);
    Storage.write(Storage.KEYS.customRecipes, list);
    // Such-Index sofort aktualisieren, damit das neue Rezept ab sofort
    // auch im Assistenten auffindbar ist (falls schon geladen).
    if (window.Search && Search.build) Search.build();
    return entry;
  }

  /** Eingebaute + eigene Rezepte zusammen — die Liste, die überall dort
   *  verwendet wird, wo "alle Rezepte" gemeint sind (Rezepte-Seite,
   *  Wochenplaner-Auswahl, Zutaten-Auflösung für die Einkaufsliste). */
  function all() {
    return RECIPE_DATA.concat(getAll());
  }

  function findById(id) {
    return all().filter(function (r) { return r.id === id; })[0] || null;
  }

  window.CustomRecipes = { getAll: getAll, add: add, all: all, findById: findById };
})();
