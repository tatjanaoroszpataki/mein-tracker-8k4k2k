/* =========================================================================
   CUSTOM EXERCISES — vom Nutzer selbst angelegte Übungen/Sportarten
   (z. B. "Joggen", "Tennis") mit direkt eingetragenem Kalorienverbrauch.
   Anders als die eingebauten Übungen (MET-basiert) wird hier der
   Kalorienwert direkt vom Nutzer angegeben — dauerhaft gespeichert und an
   späteren Tagen wieder verwendbar.
   ========================================================================= */

(function () {
  'use strict';

  function getAll() {
    return Storage.read(Storage.KEYS.customExercises, []);
  }

  function add(item) {
    var list = getAll();
    var entry = {
      id: 'customex-' + Storage.uid(),
      name: item.name,
      kcal: item.kcal,
      isCustom: true
    };
    list.push(entry);
    Storage.write(Storage.KEYS.customExercises, list);
    return entry;
  }

  function remove(id) {
    Storage.write(Storage.KEYS.customExercises, getAll().filter(function (i) { return i.id !== id; }));
  }

  function findById(id) {
    return getAll().filter(function (i) { return i.id === id; })[0] || null;
  }

  window.CustomExercises = { getAll: getAll, add: add, remove: remove, findById: findById };
})();
