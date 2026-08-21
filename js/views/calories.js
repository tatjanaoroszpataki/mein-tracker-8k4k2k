/* =========================================================================
   VIEW — Kalorienbedarf
   Grundumsatz (BMR) nach Mifflin-St-Jeor + Tagesbedarf (TDEE) über den
   PAL-Faktor. Profil wird lokal gespeichert, damit nicht jedes Mal neu
   eingegeben werden muss.
   ========================================================================= */

(function () {
  'use strict';

  var PAL_OPTIONS = [
    { value: 1.2, label: 'Sitzend / Bürojob ohne Sport' },
    { value: 1.375, label: 'Leicht aktiv (1–3× / Woche leichter Sport)' },
    { value: 1.55, label: 'Mäßig aktiv (3–5× / Woche Sport)' },
    { value: 1.725, label: 'Sehr aktiv (6–7× / Woche, körperlich fordernder Job)', hint: true },
    { value: 1.9, label: 'Extrem aktiv (körperlich sehr harter Job + tägliches Training, z. B. Sportlehrer/Trainer)', hint: true }
  ];
  var PAL_HINT = 'Passend für Berufe mit viel Bewegung, z. B. Trainertätigkeit über mehrere Stunden täglich.';

  function getProfile() {
    return Storage.read(Storage.KEYS.calorieProfile, null);
  }

  function saveProfile(profile) {
    Storage.write(Storage.KEYS.calorieProfile, profile);
  }

  function latestTrackedWeight() {
    var entries = Storage.read(Storage.KEYS.weightEntries, []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    return entries.length ? entries[entries.length - 1].kg : null;
  }

  /** Öffentlich, damit das Dashboard den aktuellen Tagesbedarf anzeigen kann. */
  function computeFromProfile(profile) {
    if (!profile || !profile.gender || !profile.age || !profile.heightCm || !profile.weightKg || !profile.pal) return null;
    var bmr = Utils.calcBMR(profile.gender, profile.weightKg, profile.heightCm, profile.age);
    var tdee = Utils.calcTDEE(bmr, profile.pal);
    return { bmr: bmr, tdee: tdee, deficitLow: tdee - 500, deficitHigh: tdee - 300 };
  }

  function resultsHtml(result) {
    if (!result) {
      return '<p class="text-soft text-sm">Fülle alle Felder aus, um deinen Bedarf zu berechnen.</p>';
    }
    return (
      '<div class="card-grid">' +
        '<div class="stat"><span class="stat__label">Grundumsatz (BMR)</span><span class="stat__value">' + result.bmr.toLocaleString('de-DE') + '</span><span class="stat__meta">kcal, in völliger Ruhe</span></div>' +
        '<div class="stat"><span class="stat__label">Tagesbedarf (TDEE)</span><span class="stat__value">' + result.tdee.toLocaleString('de-DE') + '</span><span class="stat__meta">kcal, Gewicht bleibt stabil</span></div>' +
      '</div>' +
      '<div style="margin-top: var(--space-4); padding: var(--space-4); background: var(--color-primary-tint); border-radius: var(--radius-md);">' +
        '<div class="stat__label" style="margin-bottom:4px;">Empfohlener Bereich zum Abnehmen</div>' +
        '<span class="stat__value" style="font-size:1.3rem;">' + result.deficitLow.toLocaleString('de-DE') + '–' + result.deficitHigh.toLocaleString('de-DE') + ' kcal</span>' +
        '<span class="stat__meta" style="display:block; margin-top:2px;">300–500 kcal unter dem Tagesbedarf · geschätzt ca. 0,3–0,5 kg/Woche</span>' +
      '</div>' +
      '<div class="text-sm text-soft" style="margin-top: var(--space-4);">' +
        '<strong>Wichtig:</strong> Diese Werte sind Schätzungen mit ca. ±10&nbsp;% Abweichung, kein medizinischer Rat. ' +
        'Nach 2–3 Wochen anhand der eigenen Gewichtsentwicklung nachjustieren. ' +
        'Nicht dauerhaft mehr als 500 kcal unter dem Tagesbedarf essen (Risiko: Muskelabbau, Jo-Jo-Effekt).' +
      '</div>'
    );
  }

  function readForm(root) {
    var gender = root.querySelector('input[name="gender"]:checked');
    return {
      gender: gender ? gender.value : null,
      age: parseInt(root.querySelector('#cal-age').value, 10) || null,
      heightCm: parseFloat(root.querySelector('#cal-height').value) || null,
      weightKg: Utils.parseDecimal(root.querySelector('#cal-weight').value) || null,
      pal: parseFloat(root.querySelector('#cal-pal').value) || null
    };
  }

  function updateResults(root) {
    var profile = readForm(root);
    var result = computeFromProfile(profile);
    root.querySelector('#cal-results').innerHTML = resultsHtml(result);
    return { profile: profile, result: result };
  }

  function render(root) {
    var saved = getProfile() || {};
    var prefillWeight = saved.weightKg || latestTrackedWeight() || '';
    var selectedPal = saved.pal || '';

    root.innerHTML =
      '<div class="view-header">' +
        '<span class="view-header__eyebrow">Kalorienbedarf</span>' +
        '<h1>Wie viel darf es täglich sein?</h1>' +
        '<p>Eine Schätzung deines Grundumsatzes und Tagesbedarfs — als Orientierung, nicht als exakte Vorgabe.</p>' +
      '</div>' +

      '<div class="card">' +
        '<h3 class="mt-0">Profil</h3>' +
        '<form id="cal-form">' +
          '<div class="field">' +
            '<label>Geschlecht</label>' +
            '<div class="chip-row" style="margin-bottom:0;">' +
              '<label class="chip' + (saved.gender === 'm' ? ' is-active' : '') + '" style="cursor:pointer;"><input type="radio" name="gender" value="m" class="visually-hidden"' + (saved.gender === 'm' ? ' checked' : '') + '>Mann</label>' +
              '<label class="chip' + (saved.gender === 'w' ? ' is-active' : '') + '" style="cursor:pointer;"><input type="radio" name="gender" value="w" class="visually-hidden"' + (saved.gender === 'w' ? ' checked' : '') + '>Frau</label>' +
            '</div>' +
          '</div>' +
          '<div class="input-row">' +
            '<div class="field" style="margin-bottom:0;"><label for="cal-age">Alter (Jahre)</label><input class="input" id="cal-age" type="number" min="14" max="100" value="' + (saved.age || '') + '"></div>' +
            '<div class="field" style="margin-bottom:0;"><label for="cal-height">Größe (cm)</label><input class="input" id="cal-height" type="number" min="120" max="230" value="' + (saved.heightCm || '') + '"></div>' +
          '</div>' +
          '<div class="field">' +
            '<label for="cal-weight">Gewicht (kg)</label>' +
            '<div class="input-row" style="align-items:center;">' +
              '<input class="input" id="cal-weight" type="text" inputmode="decimal" value="' + prefillWeight + '">' +
              (latestTrackedWeight() ? '<button type="button" class="btn btn--secondary btn--sm" id="use-tracked-weight">' + Icons.scale(15) + ' Aktuelles Gewicht übernehmen</button>' : '') +
            '</div>' +
          '</div>' +
          '<div class="field">' +
            '<label for="cal-pal">Aktivitätslevel</label>' +
            '<select class="input" id="cal-pal">' +
              '<option value="">Bitte wählen …</option>' +
              PAL_OPTIONS.map(function (o) {
                return '<option value="' + o.value + '"' + (selectedPal == o.value ? ' selected' : '') + '>' + o.label + '</option>';
              }).join('') +
            '</select>' +
            '<p class="text-sm text-soft" id="pal-hint" style="margin-top:6px; display:none;">' + PAL_HINT + '</p>' +
          '</div>' +
          '<button class="btn btn--primary" type="submit">Profil speichern</button>' +
        '</form>' +
      '</div>' +

      '<div class="card" style="margin-top: var(--space-4);">' +
        '<h3 class="mt-0">Ergebnis</h3>' +
        '<div id="cal-results"></div>' +
      '</div>';

    var genderChips = root.querySelectorAll('.chip-row .chip input[name="gender"]');
    genderChips.forEach(function (input) {
      input.addEventListener('change', function () {
        root.querySelectorAll('.chip-row .chip').forEach(function (c) { c.classList.remove('is-active'); });
        input.closest('.chip').classList.add('is-active');
        updateResults(root);
      });
    });

    var useTrackedBtn = root.querySelector('#use-tracked-weight');
    if (useTrackedBtn) {
      useTrackedBtn.addEventListener('click', function () {
        root.querySelector('#cal-weight').value = latestTrackedWeight();
        updateResults(root);
      });
    }

    function togglePalHint() {
      var opt = PAL_OPTIONS.filter(function (o) { return String(o.value) === root.querySelector('#cal-pal').value; })[0];
      root.querySelector('#pal-hint').style.display = (opt && opt.hint) ? 'block' : 'none';
    }
    togglePalHint();

    ['#cal-age', '#cal-height', '#cal-weight'].forEach(function (sel) {
      root.querySelector(sel).addEventListener('input', function () { updateResults(root); });
    });
    root.querySelector('#cal-pal').addEventListener('change', function () {
      togglePalHint();
      updateResults(root);
    });

    root.querySelector('#cal-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var profile = readForm(root);
      if (!profile.gender || !profile.age || !profile.heightCm || !profile.weightKg || !profile.pal) {
        Utils.toast('Bitte alle Felder ausfüllen');
        return;
      }
      saveProfile(profile);
      Utils.toast('Profil gespeichert');
      App.afterAction();
    });

    updateResults(root);
  }

  window.Views = window.Views || {};
  window.Views.kalorien = { render: render };
  window.CalorieCalc = { computeFromProfile: computeFromProfile, getProfile: getProfile };
})();
