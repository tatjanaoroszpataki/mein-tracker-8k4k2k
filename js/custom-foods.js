/* =========================================================================
   CUSTOM FOODS — vom Nutzer selbst angelegte Lebensmittel im Ampel-Guide.
   Werden dauerhaft gespeichert und danach wie ganz normale App-Einträge
   behandelt: sichtbar/filterbar/durchsuchbar im Lebensmittel-Guide,
   übernehmbar in die Einkaufsliste, auffindbar im Assistenten. Anders als
   die eingebauten Einträge lassen sie sich bearbeiten und löschen.
   ========================================================================= */

(function () {
  'use strict';

  function getAll() {
    return Storage.read(Storage.KEYS.customFoods, []);
  }

  function save(list) {
    Storage.write(Storage.KEYS.customFoods, list);
    // Such-Index sofort aktualisieren, damit Änderungen sofort im
    // Assistenten auffindbar sind (falls schon geladen).
    if (window.Search && Search.build) Search.build();
  }

  function add(item) {
    var list = getAll();
    var entry = {
      id: 'customfood-' + Storage.uid(),
      name: item.name,
      category: item.category,
      status: item.status,
      note: item.note || '',
      isCustom: true
    };
    list.push(entry);
    save(list);
    return entry;
  }

  function update(id, changes) {
    var list = getAll();
    var item = list.filter(function (i) { return i.id === id; })[0];
    if (!item) return null;
    Object.assign(item, changes);
    save(list);
    return item;
  }

  function remove(id) {
    save(getAll().filter(function (i) { return i.id !== id; }));
  }

  function findById(id) {
    return getAll().filter(function (i) { return i.id === id; })[0] || null;
  }

  /** Eingebaute + eigene Lebensmittel zusammen, im gleichen Format wie
   *  FOOD_DATA (Array von { category, items }). Eigene Kategorien, die es
   *  in FOOD_DATA noch nicht gibt, werden automatisch als neue Gruppe
   *  angehängt. */
  function all() {
    var groups = FOOD_DATA.map(function (g) { return { category: g.category, items: g.items.slice() }; });
    var byCategory = {};
    groups.forEach(function (g) { byCategory[g.category] = g; });

    getAll().forEach(function (item) {
      if (!byCategory[item.category]) {
        var newGroup = { category: item.category, items: [] };
        byCategory[item.category] = newGroup;
        groups.push(newGroup);
      }
      byCategory[item.category].items.push(item);
    });

    return groups;
  }

  /** Alle Kategorienamen (eingebaut + eigene), in fester Reihenfolge. */
  function allCategories() {
    return all().map(function (g) { return g.category; });
  }

  window.CustomFoods = { getAll: getAll, add: add, update: update, remove: remove, findById: findById, all: all, allCategories: allCategories };
})();
