/* =========================================================================
   VIEW — Bewegung
   Alltags-Mini-Übungen (an Routinen gekoppelt, unverändert inhaltlich —
   nur ohne "erledigt"-Checkbox, siehe miniExerciseCard) + Training nach
   Körperpartie: fünf Kategorien mit je mindestens 5 Übungen, aus denen
   sich ein eigenes Workout zusammenstellen lässt. Die Standardauswahl
   startet mit der klassischen 30-Minuten-Runde, lässt sich aber jederzeit
   durch die aktuelle Auswahl ersetzen (siehe saveSelectionAsDefault).
   ========================================================================= */

(function () {
  'use strict';

  function getDoneToday() {
    var log = Storage.read(Storage.KEYS.exerciseLog, {});
    return log[Utils.todayISO()] || [];
  }

  function toggleDone(id) {
    var log = Storage.read(Storage.KEYS.exerciseLog, {});
    var today = Utils.todayISO();
    var list = log[today] || [];
    var idx = list.indexOf(id);
    if (idx === -1) { list.push(id); } else { list.splice(idx, 1); }
    log[today] = list;
    Storage.write(Storage.KEYS.exerciseLog, log);
    if (idx === -1) Storage.markActiveToday();
  }

  /** Die "Standardauswahl" ist selbst änderbar — startet mit der
   *  klassischen 30-Minuten-Runde, kann aber jederzeit durch die
   *  aktuelle Auswahl ersetzt werden (siehe saveSelectionAsDefault). */
  function getDefaultWorkoutIds() {
    return Storage.read(Storage.KEYS.defaultWorkoutIds, DEFAULT_WORKOUT_IDS.slice());
  }

  function saveSelectionAsDefault() {
    Storage.write(Storage.KEYS.defaultWorkoutIds, getSelection().slice());
  }

  /** Eigene Workout-Zusammenstellung — startet mit der Standardauswahl. */
  function getSelection() {
    var sel = Storage.read(Storage.KEYS.workoutSelection, null);
    if (sel === null) {
      sel = getDefaultWorkoutIds();
      Storage.write(Storage.KEYS.workoutSelection, sel);
    }
    return sel;
  }

  function toggleSelection(id) {
    var sel = getSelection();
    var idx = sel.indexOf(id);
    if (idx === -1) { sel.push(id); } else { sel.splice(idx, 1); }
    Storage.write(Storage.KEYS.workoutSelection, sel);
  }

  function resetSelectionToDefault() {
    Storage.write(Storage.KEYS.workoutSelection, getDefaultWorkoutIds());
  }

  function allWorkoutExercises() {
    var all = [];
    WORKOUT_CATEGORIES.forEach(function (c) { all = all.concat(c.exercises); });
    return all;
  }

  function findBuiltInExerciseById(id) {
    return MINI_EXERCISES.concat(allWorkoutExercises()).filter(function (e) { return e.id === id; })[0] || null;
  }

  /** ca.-Kalorienverbrauch einer eingebauten Übung, mit aktuellem
   *  Körpergewicht berechnet (MET-Formel). */
  function exerciseKcal(ex) {
    return Utils.estimateKcalBurn(ex.met, ex.minutes, Utils.currentWeightKg());
  }

  /* ---- Schritte -------------------------------------------------------- */
  function getStepsToday() {
    var log = Storage.read(Storage.KEYS.stepsLog, {});
    var v = log[Utils.todayISO()];
    return (v == null) ? null : v;
  }

  function setStepsToday(steps) {
    var log = Storage.read(Storage.KEYS.stepsLog, {});
    log[Utils.todayISO()] = Utils.clamp(Math.round(steps), 0, 100000);
    Storage.write(Storage.KEYS.stepsLog, log);
    Storage.markActiveToday();
  }

  /**
   * Gesamte heute verbrannte Kalorien (eingebaute Übungen + eigene
   * Übungen/Sportarten + Schritte) — öffentlich, damit das Dashboard die
   * Tagesbilanz berechnen kann.
   */
  function todaysBurnedKcal() {
    var done = getDoneToday();
    var weight = Utils.currentWeightKg();
    var total = 0;
    done.forEach(function (id) {
      var builtIn = findBuiltInExerciseById(id);
      if (builtIn) { total += Utils.estimateKcalBurn(builtIn.met, builtIn.minutes, weight); return; }
      var custom = CustomExercises.findById(id);
      if (custom) { total += custom.kcal; }
    });
    var steps = getStepsToday();
    if (steps) total += Utils.estimateStepsKcal(steps, weight);
    return Math.round(total);
  }

  /**
   * Mini-Übungen: kein "erledigt"-Häkchen mehr, sondern ein Plus-Symbol,
   * das die Übung zur heutigen Übersicht hinzufügt (dieselbe Ablage wie
   * bisher — zählt weiterhin für Dashboard-Statistik und Streak — nur
   * ohne den Checkbox-/"Abhaken"-Look).
   */
  function miniExerciseCard(ex, added) {
    return '<div class="exercise-card' + (added ? ' is-added' : '') + '" data-id="' + ex.id + '">' +
      '<div class="exercise-card__icon">' + StickFigure.render(ex.pose, 40) + '</div>' +
      '<div class="exercise-card__body">' +
        '<div class="exercise-card__trigger">' + Utils.escapeHtml(ex.trigger) + '</div>' +
        '<div class="exercise-card__name">' + Utils.escapeHtml(ex.name) + ' <span class="text-soft" style="font-weight:600;">· ' + ex.dose + ' · ca. ' + exerciseKcal(ex) + ' kcal</span></div>' +
        '<div class="exercise-card__desc">' + Utils.escapeHtml(ex.instructions) + '</div>' +
      '</div>' +
      '<button class="exercise-card__add" data-add="' + ex.id + '" aria-label="' + Utils.escapeHtml(ex.name) + ' zur heutigen Übersicht hinzufügen" aria-pressed="' + !!added + '">' +
        (added ? Icons.check(18) : Icons.plus(18)) +
      '</button>' +
    '</div>';
  }

  /** Trainingsübungen: unverändert mit Auswahl-Häkchen + "heute erledigt". */
  function trainingExerciseCard(ex, done, selected) {
    return '<div class="exercise-card' + (done ? ' is-done' : '') + (selected ? ' is-selected' : '') + '" data-id="' + ex.id + '">' +
      '<button class="exercise-card__select" data-select="' + ex.id + '" aria-label="' + Utils.escapeHtml(ex.name) + ' zum Workout hinzufügen" aria-pressed="' + !!selected + '">' + Icons.plus(14) + '</button>' +
      '<div class="exercise-card__icon">' + StickFigure.render(ex.pose, 40) + '</div>' +
      '<div class="exercise-card__body">' +
        '<div class="exercise-card__name">' + Utils.escapeHtml(ex.name) + ' <span class="text-soft" style="font-weight:600;">· ' + ex.dose + ' · ca. ' + exerciseKcal(ex) + ' kcal</span></div>' +
        '<div class="exercise-card__desc">' + Utils.escapeHtml(ex.instructions) + '</div>' +
      '</div>' +
      '<button class="exercise-card__done" data-toggle="' + ex.id + '" aria-label="' + Utils.escapeHtml(ex.name) + ' als erledigt markieren" aria-pressed="' + done + '">' + Icons.check(18) + '</button>' +
    '</div>';
  }

  /** Eigene Übung/Sportart: gleiches "+"-Muster wie die Mini-Übungen. */
  function customExerciseCard(ex, added) {
    return '<div class="exercise-card' + (added ? ' is-added' : '') + '" data-id="' + ex.id + '">' +
      '<div class="exercise-card__icon">' + Icons.figure(28) + '</div>' +
      '<div class="exercise-card__body">' +
        '<div class="exercise-card__name">' + Utils.escapeHtml(ex.name) + ' <span class="text-soft" style="font-weight:600;">· ca. ' + ex.kcal + ' kcal</span></div>' +
      '</div>' +
      '<button class="exercise-card__add" data-add="' + ex.id + '" aria-label="' + Utils.escapeHtml(ex.name) + ' zur heutigen Übersicht hinzufügen" aria-pressed="' + !!added + '">' +
        (added ? Icons.check(18) : Icons.plus(18)) +
      '</button>' +
      '<button class="btn btn--icon btn--ghost" data-delete-custom-ex="' + ex.id + '" aria-label="' + Utils.escapeHtml(ex.name) + ' löschen">' + Icons.trash(15) + '</button>' +
    '</div>';
  }

  function render(root) {
    var done = getDoneToday();
    var selection = getSelection();
    var doneMini = MINI_EXERCISES.filter(function (e) { return done.indexOf(e.id) !== -1; }).length;

    var allExercises = allWorkoutExercises();
    var selectedExercises = allExercises.filter(function (e) { return selection.indexOf(e.id) !== -1; });
    var doneSelected = selectedExercises.filter(function (e) { return done.indexOf(e.id) !== -1; }).length;

    root.innerHTML =
      '<div class="view-header">' +
        '<span class="view-header__eyebrow">Bewegung</span>' +
        '<h1>30 Minuten reichen völlig</h1>' +
        '<p>Kleine Übungen, direkt an Dinge gekoppelt, die du sowieso jeden Tag machst — plus ein Training nach Körperpartie, aus dem du dir dein eigenes Workout zusammenstellen kannst.</p>' +
      '</div>' +

      '<div class="card">' +
        '<div class="flex-between">' +
          '<div class="stat"><span class="stat__label">Mini-Übungen heute</span><span class="stat__value">' + doneMini + ' / ' + MINI_EXERCISES.length + '</span></div>' +
          '<div class="stat" style="text-align:right;"><span class="stat__label">Mein Workout heute</span><span class="stat__value">' + doneSelected + ' / ' + selectedExercises.length + '</span></div>' +
        '</div>' +
        '<div class="hr" style="margin: var(--space-4) 0;"></div>' +
        '<div class="stat"><span class="stat__label">Insgesamt heute verbrannt</span><span class="stat__value">ca. ' + todaysBurnedKcal() + ' kcal</span>' +
        '<span class="stat__meta">Übungen + Schritte, geschätzt über MET-Werte und dein aktuelles Gewicht</span></div>' +
      '</div>' +

      '<div class="card" style="margin-top: var(--space-4);">' +
        '<div class="flex-between">' +
          '<div class="stat"><span class="stat__label">Schritte heute</span>' +
            '<span class="stat__value">' + (getStepsToday() != null ? getStepsToday().toLocaleString('de-DE') : '—') + '</span>' +
          '</div>' +
          '<div class="input-row" style="align-items:center; margin-bottom:0;">' +
            '<input class="input" id="steps-input" type="number" min="0" max="100000" step="100" placeholder="z. B. 8000" value="' + (getStepsToday() != null ? getStepsToday() : '') + '" style="width:130px;">' +
            '<button class="btn btn--secondary btn--sm" id="steps-save">Speichern</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<h2 style="margin-top: var(--space-6);">Mini-Übungen im Alltag</h2>' +
      '<p class="text-soft mt-0">An eine Routine gekoppelt, die du sowieso schon hast. Mit ' + Icons.plus(12) + ' zur heutigen Übersicht hinzufügen.</p>' +
      MINI_EXERCISES.map(function (ex) { return miniExerciseCard(ex, done.indexOf(ex.id) !== -1); }).join('') +

      '<h2 style="margin-top: var(--space-7);">Training nach Körperpartie</h2>' +
      '<p class="text-soft mt-0">Häkchen links (' + Icons.plus(12) + ') = Teil deines Workouts. Häkchen rechts = heute erledigt. Vorausgewählt ist deine gespeicherte Standardauswahl (anfangs die klassische 30-Minuten-Runde) — stell sie dir nach Lust und Zeit um und speichere die aktuelle Auswahl bei Bedarf als neuen Standard.</p>' +
      '<div class="chip-row">' +
        '<button class="btn btn--secondary btn--sm" id="reset-selection">Standardauswahl laden</button>' +
        '<button class="btn btn--secondary btn--sm" id="save-as-default">' + Icons.check(14) + ' Aktuelle Auswahl als Standard speichern</button>' +
      '</div>' +

      WORKOUT_CATEGORIES.map(function (cat) {
        var catSelectedCount = cat.exercises.filter(function (e) { return selection.indexOf(e.id) !== -1; }).length;
        return '<div class="workout-block">' +
          '<h3 class="workout-block__title">' + cat.title + ' <span>' + catSelectedCount + ' von ' + cat.exercises.length + ' im Workout</span></h3>' +
          cat.exercises.map(function (ex) {
            return trainingExerciseCard(ex, done.indexOf(ex.id) !== -1, selection.indexOf(ex.id) !== -1);
          }).join('') +
        '</div>';
      }).join('') +

      '<h2 style="margin-top: var(--space-7);">Eigene Übungen & Sportarten</h2>' +
      '<p class="text-soft mt-0">Für alles, was hier nicht vorgegeben ist — z. B. Joggen, Tennis, Radfahren. Einmal anlegen, danach jederzeit mit einem Klick für heute eintragen.</p>' +
      CustomExercises.getAll().map(function (ex) { return customExerciseCard(ex, done.indexOf(ex.id) !== -1); }).join('') +
      '<div class="card" style="margin-top: var(--space-3);">' +
        '<h3 class="mt-0">Neue Übung/Sportart</h3>' +
        '<form id="custom-ex-form" class="input-row">' +
          '<div class="field" style="margin-bottom:0; flex:2;"><label for="custom-ex-name">Name</label><input class="input" id="custom-ex-name" type="text" placeholder="z. B. Joggen (30 Min)"></div>' +
          '<div class="field" style="margin-bottom:0;"><label for="custom-ex-kcal">Verbrannt (ca. kcal)</label><input class="input" id="custom-ex-kcal" type="number" min="0" max="3000" placeholder="z. B. 300"></div>' +
          '<button class="btn btn--primary" type="submit">' + Icons.plus(16) + ' Speichern & heute eintragen</button>' +
        '</form>' +
      '</div>';

    root.querySelectorAll('[data-add]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-add');
        toggleDone(id);
        App.afterAction();
        render(root);
      });
    });

    root.querySelectorAll('[data-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-toggle');
        toggleDone(id);
        App.afterAction();
        render(root);
      });
    });

    root.querySelectorAll('[data-select]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-select');
        toggleSelection(id);
        render(root);
      });
    });

    var resetBtn = root.querySelector('#reset-selection');
    if (resetBtn) resetBtn.addEventListener('click', function () {
      resetSelectionToDefault();
      Utils.toast('Standardauswahl geladen');
      render(root);
    });

    var saveDefaultBtn = root.querySelector('#save-as-default');
    if (saveDefaultBtn) saveDefaultBtn.addEventListener('click', function () {
      saveSelectionAsDefault();
      Utils.toast('Aktuelle Auswahl als neue Standardauswahl gespeichert');
    });

    root.querySelector('#steps-save').addEventListener('click', function () {
      var val = parseInt(document.getElementById('steps-input').value, 10);
      if (isNaN(val) || val < 0) { Utils.toast('Bitte eine gültige Zahl eingeben'); return; }
      setStepsToday(val);
      App.afterAction();
      render(root);
    });

    root.querySelector('#custom-ex-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = document.getElementById('custom-ex-name').value.trim();
      var kcal = parseInt(document.getElementById('custom-ex-kcal').value, 10);
      if (!name) { Utils.toast('Bitte einen Namen eingeben'); return; }
      if (isNaN(kcal) || kcal <= 0) { Utils.toast('Bitte die verbrannten Kalorien eingeben'); return; }
      var saved = CustomExercises.add({ name: name, kcal: kcal });
      toggleDone(saved.id);
      Utils.toast('Gespeichert und für heute eingetragen');
      App.afterAction();
      render(root);
    });

    root.querySelectorAll('[data-delete-custom-ex]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-delete-custom-ex');
        var ex = CustomExercises.findById(id);
        if (ex && confirm('„' + ex.name + '“ wirklich löschen?')) {
          CustomExercises.remove(id);
          render(root);
        }
      });
    });
  }

  window.Views = window.Views || {};
  window.Views.bewegung = { render: render };
  window.MovementCalc = { todaysBurnedKcal: todaysBurnedKcal };
})();
