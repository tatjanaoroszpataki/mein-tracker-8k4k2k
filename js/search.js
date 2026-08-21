/* =========================================================================
   SEARCH — lokaler Such-Index für den Assistenten (js/assistant.js).
   Reine Stichwortsuche über lokale Daten: Lebensmittel, Rezepte, Übungen
   (Mini + Training) und die "Wissen"-Kapitel. Keine externe KI, kein
   API-Key, funktioniert komplett offline.
   ========================================================================= */

(function () {
  'use strict';

  var STATUS_LABEL = { go: 'Grün', caution: 'Gelb', stop: 'Rot' };
  var INDEX = [];

  function normalize(s) {
    return (s || '').toLowerCase();
  }

  // Kurze, sehr häufige Wörter ausschließen — sonst matchen sie per
  // Substring in völlig unpassenden Wörtern (z. B. "was" in "Wasser"
  // oder "ich" in "wichtig") und verwässern die eigentlich relevanten
  // Treffer. Bewusst konservativ gehalten, reine Stichwortsuche bleibt.
  var STOPWORDS = {
    was: 1, wie: 1, wieso: 1, weshalb: 1, ist: 1, sind: 1, war: 1,
    der: 1, die: 1, das: 1, den: 1, dem: 1, des: 1,
    ein: 1, eine: 1, einen: 1, einem: 1, einer: 1,
    und: 1, oder: 1, für: 1, mit: 1, bei: 1,
    ich: 1, du: 1, er: 1, sie: 1, es: 1, wir: 1, ihr: 1, man: 1, mich: 1, mir: 1, sich: 1,
    auf: 1, im: 1, in: 1, zu: 1, zum: 1, zur: 1, von: 1, vom: 1, am: 1, an: 1, als: 1,
    so: 1, viel: 1, viele: 1, vielen: 1,
    brauche: 1, brauchen: 1, kann: 1, soll: 1, muss: 1
  };

  function tokenize(q) {
    return normalize(q).replace(/[^\wäöüß\s-]/gi, ' ').split(/\s+/)
      .filter(function (t) { return t.length >= 3 && !STOPWORDS[t]; });
  }

  function add(entry) {
    INDEX.push(entry);
  }

  /** Baut den Such-Index einmal beim Start aus den globalen Datensätzen. */
  function build() {
    INDEX = [];

    CustomFoods.all().forEach(function (group) {
      group.items.forEach(function (item) {
        add({
          type: 'food',
          typeLabel: item.isCustom ? 'Lebensmittel · eigener Eintrag' : 'Lebensmittel',
          title: item.name,
          text: (item.note || '') + ' — Ampel: ' + STATUS_LABEL[item.status] + ' (' + group.category + ')',
          route: 'lebensmittel'
        });
      });
    });

    CustomRecipes.all().forEach(function (r) {
      add({
        type: 'recipe',
        typeLabel: 'Rezept',
        title: r.title,
        text: (window.MEAL_LABELS && MEAL_LABELS[r.meal] ? MEAL_LABELS[r.meal] + ' · ' : '') + (r.time || '') +
          (r.kcal ? ' · ca. ' + r.kcal + ' kcal' : '') + (r.why ? '. ' + r.why : '') +
          (r.ingredients && r.ingredients.length ? '. Zutaten: ' + r.ingredients.join(', ') : ''),
        route: 'rezepte'
      });
    });

    MINI_EXERCISES.forEach(function (e) {
      add({
        type: 'exercise',
        typeLabel: 'Mini-Übung',
        title: e.name,
        text: e.trigger + ' · ' + e.dose + '. ' + e.instructions,
        route: 'bewegung'
      });
    });

    WORKOUT_CATEGORIES.forEach(function (cat) {
      cat.exercises.forEach(function (e) {
        add({
          type: 'exercise',
          typeLabel: 'Übung · ' + cat.title,
          title: e.name,
          text: e.dose + '. ' + e.instructions,
          route: 'bewegung'
        });
      });
    });

    KNOWLEDGE_CHAPTERS.forEach(function (ch) {
      add({
        type: 'knowledge',
        typeLabel: 'Wissen · Kapitel ' + ch.number,
        title: ch.title,
        text: ch.paragraphs.join(' '),
        route: 'wissen',
        anchor: ch.id
      });
    });
  }

  function score(entry, tokens, rawQuery) {
    var title = normalize(entry.title);
    var text = normalize(entry.text);
    var s = 0;
    tokens.forEach(function (t) {
      if (!t) return;
      if (title.indexOf(t) !== -1) s += 3;
      if (text.indexOf(t) !== -1) s += 1;
    });
    var rq = normalize(rawQuery);
    if (rq.length > 2 && title.indexOf(rq) !== -1) s += 4;
    if (rq.length > 2 && text.indexOf(rq) !== -1) s += 2;
    return s;
  }

  /** Liefert bis zu `limit` beste Treffer für eine Freitext-Anfrage. */
  function query(q, limit) {
    if (!q || !q.trim()) return [];
    var tokens = tokenize(q);
    if (!tokens.length) return [];
    return INDEX
      .map(function (entry) { return { entry: entry, score: score(entry, tokens, q) }; })
      .filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, limit || 8)
      .map(function (r) { return r.entry; });
  }

  window.Search = { build: build, query: query };
})();
