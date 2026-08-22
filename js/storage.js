/* =========================================================================
   STORAGE — dünner Wrapper um localStorage
   Alle Keys sind mit "schrittweise:" namespaced, damit die App nichts
   anderes auf dem Gerät überschreibt. Alles läuft rein lokal, offline.
   ========================================================================= */

(function () {
  'use strict';

  var PREFIX = 'schrittweise:';

  var KEYS = {
    weightEntries: PREFIX + 'weightEntries',   // [{id, date:'YYYY-MM-DD', kg}]
    weightGoal: PREFIX + 'weightGoal',         // {startKg, startDate, targetKg}
    shoppingList: PREFIX + 'shoppingList',     // [{id, name, category, checked}]
    waterGoalMl: PREFIX + 'waterGoalMl',       // number
    waterLog: PREFIX + 'waterLog',             // { 'YYYY-MM-DD': ml }
    exerciseLog: PREFIX + 'exerciseLog',       // { 'YYYY-MM-DD': ['exerciseId', ...] }
    workoutSelection: PREFIX + 'workoutSelection', // ['exerciseId', ...] – selbst zusammengestelltes Workout
    defaultWorkoutIds: PREFIX + 'defaultWorkoutIds', // ['exerciseId', ...] – eigene, änderbare Standardauswahl
    weekPlan: PREFIX + 'weekPlan',             // { weekStartISO: { dayISO: { meal: entry } } }
    customRecipes: PREFIX + 'customRecipes',   // [{ id, title, meal, ingredients, ... }] – selbst angelegte Rezepte
    customFoods: PREFIX + 'customFoods',       // [{ id, name, category, status, note }] – selbst angelegte Lebensmittel
    sleepLog: PREFIX + 'sleepLog',               // { 'YYYY-MM-DD': hours }
    customExercises: PREFIX + 'customExercises', // [{ id, name, kcal }] – eigene Übungen/Sportarten
    stepsLog: PREFIX + 'stepsLog',               // { 'YYYY-MM-DD': steps }
    foodLog: PREFIX + 'foodLog',                  // { 'YYYY-MM-DD': [{ id, name, kcal }] }
    drinkLog: PREFIX + 'drinkLog',                // { 'YYYY-MM-DD': [{ id, name, kcal }] }
    activityDates: PREFIX + 'activityDates',   // ['YYYY-MM-DD', ...] – für Streak
    notifPrefs: PREFIX + 'notifPrefs',         // {enabled, times:['09:00', ...]}
    calorieProfile: PREFIX + 'calorieProfile', // {gender, age, heightCm, weightKg, pal}
    lastBackupDate: PREFIX + 'lastBackupDate'  // 'YYYY-MM-DD' des letzten Exports
  };

  function read(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      console.warn('Storage read failed for', key, err);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn('Storage write failed for', key, err);
      return false;
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /**
   * Merkt den heutigen Tag als "aktiv" (für den Streak-Zähler).
   * Wird von jeder View aufgerufen, die eine sinnvolle Aktion loggt
   * (Gewicht, Wasser, Übung erledigt).
   */
  function markActiveToday() {
    var today = Utils.todayISO();
    var dates = read(KEYS.activityDates, []);
    if (dates.indexOf(today) === -1) {
      dates.push(today);
      write(KEYS.activityDates, dates);
    }
  }

  /** Berechnet die aktuelle Streak (Tage in Folge bis heute/gestern aktiv). */
  function getStreak() {
    var dates = read(KEYS.activityDates, []);
    var set = {};
    dates.forEach(function (d) { set[d] = true; });

    var streak = 0;
    var cursor = new Date();
    // Wenn heute noch nichts geloggt wurde, zählt die Streak trotzdem ab
    // gestern weiter, damit sie nicht schon morgens auf 0 fällt.
    if (!set[Utils.toISO(cursor)]) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (set[Utils.toISO(cursor)]) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function exportAll() {
    var data = {};
    Object.keys(KEYS).forEach(function (name) {
      data[name] = read(KEYS[name], null);
    });
    data.exportedAt = new Date().toISOString();
    data.app = 'Schrittweise';
    return data;
  }

  window.Storage = {
    KEYS: KEYS,
    read: read,
    write: write,
    uid: uid,
    markActiveToday: markActiveToday,
    getStreak: getStreak,
    exportAll: exportAll
  };
})();
