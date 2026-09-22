/* =========================================================================
   DAY-LOG — gemeinsamer, datumsbasierter Zugriff auf alles, was pro Tag
   erfasst wird (Essen, Getränke, Wasser, Schlaf, Schritte, Übungen).

   Dashboard und Bewegung nutzen das für "heute" (Utils.todayISO()), der
   Verlauf (js/views/history.js) für beliebige vergangene Tage — dieselbe
   Logik an einer Stelle, damit z. B. "Getränk → Wasser mitzählen" überall
   gleich funktioniert, auch beim rückwirkenden Eintragen.
   ========================================================================= */

(function () {
  'use strict';

  function listFor(key, date) {
    var log = Storage.read(key, {});
    return log[date] || [];
  }

  /* ---- Essen ------------------------------------------------------------ */
  function getFood(date) { return listFor(Storage.KEYS.foodLog, date); }

  function addFood(date, name, kcal) {
    var log = Storage.read(Storage.KEYS.foodLog, {});
    var list = log[date] || [];
    var entry = { id: Storage.uid(), name: name, kcal: kcal };
    list.push(entry);
    log[date] = list;
    Storage.write(Storage.KEYS.foodLog, log);
    Storage.markActive(date);
    return entry;
  }

  function removeFood(date, id) {
    var log = Storage.read(Storage.KEYS.foodLog, {});
    log[date] = (log[date] || []).filter(function (e) { return e.id !== id; });
    Storage.write(Storage.KEYS.foodLog, log);
  }

  function foodKcal(date) {
    return getFood(date).reduce(function (sum, e) { return sum + e.kcal; }, 0);
  }

  /* ---- Getränke (zählen zusätzlich automatisch zur Wassermenge) --------- */
  function getDrinks(date) { return listFor(Storage.KEYS.drinkLog, date); }

  function addDrink(date, name, kcal, ml) {
    var log = Storage.read(Storage.KEYS.drinkLog, {});
    var list = log[date] || [];
    var entry = { id: Storage.uid(), name: name, kcal: kcal, ml: ml || 0 };
    list.push(entry);
    log[date] = list;
    Storage.write(Storage.KEYS.drinkLog, log);
    if (ml) addWaterMl(date, ml);
    Storage.markActive(date);
    return entry;
  }

  function removeDrink(date, id) {
    var log = Storage.read(Storage.KEYS.drinkLog, {});
    var list = log[date] || [];
    var entry = list.filter(function (e) { return e.id === id; })[0];
    log[date] = list.filter(function (e) { return e.id !== id; });
    Storage.write(Storage.KEYS.drinkLog, log);
    if (entry && entry.ml) addWaterMl(date, -entry.ml);
  }

  function drinkKcal(date) {
    return getDrinks(date).reduce(function (sum, e) { return sum + e.kcal; }, 0);
  }

  /* ---- Wasser ------------------------------------------------------------ */
  function getWaterMl(date) {
    var log = Storage.read(Storage.KEYS.waterLog, {});
    return log[date] || 0;
  }

  function addWaterMl(date, delta) {
    var log = Storage.read(Storage.KEYS.waterLog, {});
    log[date] = Math.max(0, (log[date] || 0) + delta);
    Storage.write(Storage.KEYS.waterLog, log);
    Storage.markActive(date);
  }

  /* ---- Schlaf ------------------------------------------------------------ */
  function getSleep(date) {
    var log = Storage.read(Storage.KEYS.sleepLog, {});
    var v = log[date];
    return (v == null) ? null : v;
  }

  function setSleep(date, hours) {
    var log = Storage.read(Storage.KEYS.sleepLog, {});
    log[date] = hours;
    Storage.write(Storage.KEYS.sleepLog, log);
    Storage.markActive(date);
  }

  /* ---- Schritte ------------------------------------------------------------ */
  function getSteps(date) {
    var log = Storage.read(Storage.KEYS.stepsLog, {});
    var v = log[date];
    return (v == null) ? null : v;
  }

  function setSteps(date, steps) {
    var log = Storage.read(Storage.KEYS.stepsLog, {});
    log[date] = Utils.clamp(Math.round(steps), 0, 100000);
    Storage.write(Storage.KEYS.stepsLog, log);
    Storage.markActive(date);
  }

  /* ---- Übungen ------------------------------------------------------------ */
  function getExercisesDone(date) { return listFor(Storage.KEYS.exerciseLog, date); }

  function toggleExercise(date, id) {
    var log = Storage.read(Storage.KEYS.exerciseLog, {});
    var list = log[date] || [];
    var idx = list.indexOf(id);
    if (idx === -1) { list.push(id); } else { list.splice(idx, 1); }
    log[date] = list;
    Storage.write(Storage.KEYS.exerciseLog, log);
    if (idx === -1) Storage.markActive(date);
  }

  window.DayLog = {
    getFood: getFood,
    addFood: addFood,
    removeFood: removeFood,
    foodKcal: foodKcal,
    getDrinks: getDrinks,
    addDrink: addDrink,
    removeDrink: removeDrink,
    drinkKcal: drinkKcal,
    getWaterMl: getWaterMl,
    addWaterMl: addWaterMl,
    getSleep: getSleep,
    setSleep: setSleep,
    getSteps: getSteps,
    setSteps: setSteps,
    getExercisesDone: getExercisesDone,
    toggleExercise: toggleExercise
  };
})();
