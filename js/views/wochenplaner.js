/* =========================================================================
   VIEW — Wochenplaner
   Oben: Wochenplan mit Tag-Tabs (mobil praktischer als eine breite
   Tabelle) und je 4 Mahlzeiten-Slots pro Tag, befüllbar mit einem
   App-Rezept, einem frei getippten eigenen Gericht oder einem neu
   angelegten, dauerhaft gespeicherten Rezept.
   Unten: die bisherige Einkaufsliste — unverändert in ihrer Funktion,
   zusätzlich per Knopfdruck aus dem Wochenplan befüllbar.
   ========================================================================= */

(function () {
  'use strict';

  var MEAL_ORDER = ['fruehstueck', 'mittag', 'snack', 'abend'];
  var DAY_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']; // Index = Date.getDay()
  var SHOP_CATEGORY_ORDER = FOOD_DATA.map(function (g) { return g.category; }).concat(['Aus Wochenplan', 'Sonstiges']);

  var state = {
    weekStart: Utils.startOfWeek(Utils.todayISO()),
    activeDay: Utils.todayISO(),
    picker: null // { dayISO, meal, tab: 'recipe'|'custom'|'new', query }
  };

  /* ---- Wochenplan-Daten -------------------------------------------------- */

  function getPlan() { return Storage.read(Storage.KEYS.weekPlan, {}); }
  function savePlan(plan) { Storage.write(Storage.KEYS.weekPlan, plan); }
  function getWeek(weekStart) { return getPlan()[weekStart] || {}; }

  function setSlot(weekStart, dayISO, meal, entry) {
    var plan = getPlan();
    if (!plan[weekStart]) plan[weekStart] = {};
    if (!plan[weekStart][dayISO]) plan[weekStart][dayISO] = {};
    plan[weekStart][dayISO][meal] = entry;
    savePlan(plan);
    Storage.markActiveToday();
  }

  function clearSlot(weekStart, dayISO, meal) {
    var plan = getPlan();
    if (plan[weekStart] && plan[weekStart][dayISO]) {
      delete plan[weekStart][dayISO][meal];
    }
    savePlan(plan);
  }

  function clearWeek(weekStart) {
    var plan = getPlan();
    delete plan[weekStart];
    savePlan(plan);
  }

  function copyToNextWeek(weekStart) {
    var plan = getPlan();
    var current = plan[weekStart];
    if (!current) return false;
    var nextStart = Utils.addDays(weekStart, 7);
    var nextData = {};
    Object.keys(current).forEach(function (dayISO) {
      var offset = Math.round((Utils.parseISO(dayISO) - Utils.parseISO(weekStart)) / 86400000);
      nextData[Utils.addDays(nextStart, offset)] = current[dayISO];
    });
    plan[nextStart] = nextData;
    savePlan(plan);
    return true;
  }

  function resolveEntryTitle(entry) {
    if (entry.type === 'custom') return entry.text;
    var r = CustomRecipes.findById(entry.recipeId);
    return r ? r.title : 'Rezept';
  }

  /* ---- Einkaufsliste aus dem Wochenplan ---------------------------------- */

  function buildShoppingListFromWeek() {
    var weekData = getWeek(state.weekStart);
    var counts = {}; // normalisierte Zutat -> { text, count }
    var notes = [];

    Object.keys(weekData).forEach(function (dayISO) {
      var slots = weekData[dayISO];
      MEAL_ORDER.forEach(function (meal) {
        var entry = slots[meal];
        if (!entry) return;
        if (entry.type === 'recipe') {
          var r = CustomRecipes.findById(entry.recipeId);
          if (r && r.ingredients && r.ingredients.length) {
            r.ingredients.forEach(function (ing) {
              var norm = ing.trim().toLowerCase();
              if (!norm) return;
              if (!counts[norm]) counts[norm] = { text: ing.trim(), count: 0 };
              counts[norm].count++;
            });
          } else if (r) {
            notes.push(r.title);
          }
        } else if (entry.type === 'custom' && entry.text) {
          notes.push(entry.text);
        }
      });
    });

    var list = Storage.read(Storage.KEYS.shoppingList, []);
    var added = 0;

    Object.keys(counts).forEach(function (norm) {
      var item = counts[norm];
      var name = item.text + (item.count > 1 ? ' (×' + item.count + ')' : '');
      var exists = list.some(function (i) { return i.name.toLowerCase() === name.toLowerCase() && !i.checked; });
      if (!exists) { list.push({ id: Storage.uid(), name: name, category: 'Aus Wochenplan', checked: false }); added++; }
    });

    notes.forEach(function (dishName) {
      var name = 'Zutaten für: ' + dishName + ' – manuell ergänzen';
      var exists = list.some(function (i) { return i.name === name && !i.checked; });
      if (!exists) { list.push({ id: Storage.uid(), name: name, category: 'Aus Wochenplan', checked: false }); added++; }
    });

    Storage.write(Storage.KEYS.shoppingList, list);
    return added;
  }

  /* ---- Einkaufsliste (Funktion unverändert zur bisherigen Seite) --------- */

  function getShopList() { return Storage.read(Storage.KEYS.shoppingList, []); }
  function saveShopList(list) { Storage.write(Storage.KEYS.shoppingList, list); }

  function addShopItem(name) {
    if (!name.trim()) return;
    var list = getShopList();
    list.push({ id: Storage.uid(), name: name.trim(), category: 'Sonstiges', checked: false });
    saveShopList(list);
  }

  function toggleShopItem(id) {
    var list = getShopList();
    var item = list.filter(function (i) { return i.id === id; })[0];
    if (item) item.checked = !item.checked;
    saveShopList(list);
  }

  function removeShopItem(id) {
    saveShopList(getShopList().filter(function (i) { return i.id !== id; }));
  }

  function resetShopListForNextWeek() {
    saveShopList(getShopList().map(function (i) { return Object.assign({}, i, { checked: false }); }));
  }

  function clearShopList() { saveShopList([]); }

  function shoppingListHtml() {
    var list = getShopList();
    var byCategory = {};
    list.forEach(function (item) {
      var cat = item.category || 'Sonstiges';
      byCategory[cat] = byCategory[cat] || [];
      byCategory[cat].push(item);
    });
    var cats = SHOP_CATEGORY_ORDER.filter(function (c) { return byCategory[c] && byCategory[c].length; });
    var checkedCount = list.filter(function (i) { return i.checked; }).length;

    var body;
    if (!list.length) {
      body = '<div class="empty-state">' + Icons.empty(40) + '<p>Deine Liste ist leer. Erstelle sie aus dem Wochenplan oder füge unten etwas hinzu.</p></div>';
    } else {
      body = cats.map(function (cat) {
        var rows = byCategory[cat].map(function (item) {
          return '<li class="shop-item' + (item.checked ? ' is-checked' : '') + '" data-id="' + item.id + '">' +
            '<button class="shop-item__check" data-shop-toggle="' + item.id + '" aria-label="' + Utils.escapeHtml(item.name) + ' abhaken">' + Icons.check(15) + '</button>' +
            '<span class="shop-item__name">' + Utils.escapeHtml(item.name) + '</span>' +
            '<button class="shop-item__remove" data-shop-remove="' + item.id + '" aria-label="' + Utils.escapeHtml(item.name) + ' entfernen">' + Icons.trash(16) + '</button>' +
          '</li>';
        }).join('');
        return '<div class="food-group"><h3 class="food-group__title">' + cat + '</h3><ul class="stack" style="gap:0;">' + rows + '</ul></div>';
      }).join('');
    }

    return '<div class="flex-between"><h2 class="mt-0">Einkaufsliste</h2>' +
        '<span class="text-sm text-soft">' + (list.length ? checkedCount + ' / ' + list.length : '') + '</span>' +
      '</div>' +
      '<button class="btn btn--primary btn--block" id="build-from-plan" style="margin-bottom: var(--space-4);">' + Icons.cart(16) + ' Einkaufsliste aus Wochenplan erstellen</button>' +
      '<form id="add-shop-item-form" class="input-row" style="margin-bottom: var(--space-4);">' +
        '<div class="field" style="margin-bottom:0; flex:2;"><label for="new-shop-item">Manuell hinzufügen</label>' +
        '<input class="input" id="new-shop-item" type="text" placeholder="z. B. Salz"></div>' +
        '<button class="btn btn--secondary" type="submit">' + Icons.plus(16) + '</button>' +
      '</form>' +
      '<div id="shop-list">' + body + '</div>' +
      (list.length ? '<div class="chip-row" style="margin-top: var(--space-4);">' +
        '<button class="btn btn--secondary btn--sm" id="reset-shop-week">' + Icons.check(16) + ' Für nächste Woche zurücksetzen</button>' +
        '<button class="btn btn--ghost btn--sm" id="clear-shop-list">' + Icons.trash(16) + ' Liste leeren</button>' +
      '</div>' : '');
  }

  /* ---- Picker-Sheet -------------------------------------------------------- */

  function openPicker(root, dayISO, meal) {
    var existing = (getWeek(state.weekStart)[dayISO] || {})[meal];
    state.picker = {
      dayISO: dayISO,
      meal: meal,
      tab: (existing && existing.type === 'custom') ? 'custom' : 'recipe',
      query: '',
      customText: (existing && existing.type === 'custom') ? existing.text : ''
    };
    render(root);
  }

  function closePicker(root) {
    state.picker = null;
    render(root);
  }

  function pickerRecipeItems() {
    var p = state.picker;
    var q = normalizeText(p.query);
    return CustomRecipes.all().filter(function (r) {
      if (r.meal !== p.meal) return false;
      if (!q) return true;
      return normalizeText(r.title).indexOf(q) !== -1;
    });
  }

  function normalizeText(s) { return (s || '').toLowerCase().trim(); }

  function renderPickerRecipeResults(root) {
    var container = root.querySelector('#picker-recipe-results');
    if (!container) return;
    var items = pickerRecipeItems();
    if (!items.length) {
      container.innerHTML = '<p class="text-sm text-soft">Keine passenden Rezepte gefunden.</p>';
      return;
    }
    container.innerHTML = items.map(function (r) {
      return '<button class="plan-picker__recipe-item" data-assign-recipe="' + r.id + '">' +
        '<strong>' + Utils.escapeHtml(r.title) + (r.isCustom ? ' <span class="badge" style="vertical-align:middle;">eigenes</span>' : '') + '</strong>' +
        '<span>' + (r.time ? Utils.escapeHtml(r.time) : '') + (r.kcal ? ' · ca. ' + r.kcal + ' kcal' : '') + '</span>' +
      '</button>';
    }).join('');
    container.querySelectorAll('[data-assign-recipe]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setSlot(state.weekStart, state.picker.dayISO, state.picker.meal, { type: 'recipe', recipeId: btn.getAttribute('data-assign-recipe') });
        closePicker(root);
      });
    });
  }

  function pickerHtml() {
    var p = state.picker;
    var dayLabel = DAY_SHORT[Utils.parseISO(p.dayISO).getDay()] + ', ' + Utils.formatDateShort(p.dayISO);
    var mealLabel = MEAL_LABELS[p.meal];

    var tabs = [
      { id: 'recipe', label: 'Rezept wählen' },
      { id: 'custom', label: 'Eigenes Gericht' },
      { id: 'new', label: 'Neues Rezept' }
    ];

    var bodyHtml;
    if (p.tab === 'recipe') {
      bodyHtml =
        '<div class="search-input" style="margin-bottom: var(--space-3);">' + Icons.search(16) +
        '<input type="search" id="picker-search" placeholder="Rezept suchen …" value="' + Utils.escapeHtml(p.query) + '"></div>' +
        '<div id="picker-recipe-results"></div>';
    } else if (p.tab === 'custom') {
      bodyHtml =
        '<div class="field"><label for="picker-custom-text">Eigenes Gericht</label>' +
        '<input class="input" id="picker-custom-text" type="text" placeholder="z. B. Essen bei Mama" value="' + Utils.escapeHtml(p.customText || '') + '"></div>' +
        '<p class="text-sm text-soft">Wird nur als Name gespeichert — ohne Zutatenliste, daher nicht automatisch in der Einkaufsliste auflösbar.</p>' +
        '<button class="btn btn--primary btn--block" id="picker-save-custom">Übernehmen</button>';
    } else {
      bodyHtml =
        '<p class="text-sm text-soft mt-0">Wird dauerhaft in den Rezepten gespeichert (Kategorie: ' + mealLabel + ') und steht danach auch bei künftigen Wochenplanungen zur Auswahl.</p>' +
        '<div class="field"><label for="picker-new-name">Name*</label><input class="input" id="picker-new-name" type="text" placeholder="z. B. Omas Gemüsepfanne"></div>' +
        '<div class="field"><label for="picker-new-ingredients">Zutaten (eine pro Zeile)</label><textarea class="input" id="picker-new-ingredients" rows="4" placeholder="200 g Hähnchenbrust&#10;1 Paprika&#10;…"></textarea></div>' +
        '<div class="field"><label for="picker-new-steps">Zubereitung (optional, ein Schritt pro Zeile)</label><textarea class="input" id="picker-new-steps" rows="3"></textarea></div>' +
        '<div class="field"><label for="picker-new-kcal">Kalorien pro Portion (optional, ca.)</label><input class="input" id="picker-new-kcal" type="number" min="0" max="2000"></div>' +
        '<button class="btn btn--primary btn--block" id="picker-save-new">Rezept speichern & einplanen</button>';
    }

    return '<div class="plan-picker-backdrop" id="picker-backdrop"></div>' +
      '<div class="plan-picker">' +
        '<div class="plan-picker__header">' +
          '<strong>' + dayLabel + ' · ' + mealLabel + '</strong>' +
          '<button class="btn btn--icon btn--ghost" id="picker-close" aria-label="Schließen">' + Icons.close(18) + '</button>' +
        '</div>' +
        '<div class="chip-row plan-picker__tabs">' +
          tabs.map(function (t) { return '<button class="chip' + (p.tab === t.id ? ' is-active' : '') + '" data-picker-tab="' + t.id + '">' + t.label + '</button>'; }).join('') +
        '</div>' +
        '<div class="plan-picker__body">' + bodyHtml + '</div>' +
      '</div>';
  }

  function bindPickerEvents(root) {
    if (!state.picker) return;

    root.querySelector('#picker-close').addEventListener('click', function () { closePicker(root); });
    root.querySelector('#picker-backdrop').addEventListener('click', function () { closePicker(root); });

    root.querySelectorAll('[data-picker-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.picker.tab = btn.getAttribute('data-picker-tab');
        render(root);
      });
    });

    if (state.picker.tab === 'recipe') {
      renderPickerRecipeResults(root);
      var searchInput = root.querySelector('#picker-search');
      searchInput.addEventListener('input', Utils.debounce(function () {
        state.picker.query = searchInput.value;
        renderPickerRecipeResults(root);
      }, 120));
    } else if (state.picker.tab === 'custom') {
      root.querySelector('#picker-save-custom').addEventListener('click', function () {
        var text = root.querySelector('#picker-custom-text').value.trim();
        if (!text) { Utils.toast('Bitte einen Namen eingeben'); return; }
        setSlot(state.weekStart, state.picker.dayISO, state.picker.meal, { type: 'custom', text: text });
        closePicker(root);
      });
    } else if (state.picker.tab === 'new') {
      root.querySelector('#picker-save-new').addEventListener('click', function () {
        var name = root.querySelector('#picker-new-name').value.trim();
        if (!name) { Utils.toast('Bitte einen Namen eingeben'); return; }
        var ingredients = root.querySelector('#picker-new-ingredients').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        var steps = root.querySelector('#picker-new-steps').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        var kcalVal = parseInt(root.querySelector('#picker-new-kcal').value, 10);
        var recipe = {
          title: name,
          meal: state.picker.meal,
          ingredients: ingredients,
          steps: steps
        };
        if (kcalVal) recipe.kcal = kcalVal;
        var saved = CustomRecipes.add(recipe);
        setSlot(state.weekStart, state.picker.dayISO, state.picker.meal, { type: 'recipe', recipeId: saved.id });
        Utils.toast('Rezept gespeichert und eingeplant');
        closePicker(root);
      });
    }
  }

  /* ---- Hauptansicht ---------------------------------------------------------- */

  function weekDays() {
    var days = [];
    for (var i = 0; i < 7; i++) days.push(Utils.addDays(state.weekStart, i));
    return days;
  }

  function mealSlotHtml(dayISO, meal, daySlots) {
    var entry = daySlots[meal];
    var label = MEAL_LABELS[meal];
    if (entry) {
      var title = resolveEntryTitle(entry);
      return '<div class="plan-slot is-filled">' +
        '<div class="plan-slot__meal">' + label + '</div>' +
        '<button class="plan-slot__content" data-open-picker="' + dayISO + '|' + meal + '">' +
          '<span class="plan-slot__title">' + Utils.escapeHtml(title) + '</span>' +
          (entry.type === 'custom' ? '<span class="badge" style="margin-top:4px;">Eigener Eintrag</span>' : '') +
        '</button>' +
        '<button class="plan-slot__remove" data-remove-slot="' + dayISO + '|' + meal + '" aria-label="' + label + ' entfernen">' + Icons.trash(15) + '</button>' +
      '</div>';
    }
    return '<div class="plan-slot">' +
      '<div class="plan-slot__meal">' + label + '</div>' +
      '<button class="plan-slot__add" data-open-picker="' + dayISO + '|' + meal + '">' + Icons.plus(16) + ' Hinzufügen</button>' +
    '</div>';
  }

  function render(root) {
    var days = weekDays();
    if (days.indexOf(state.activeDay) === -1) state.activeDay = days[0];
    var weekData = getWeek(state.weekStart);
    var daySlots = weekData[state.activeDay] || {};
    var today = Utils.todayISO();
    var weekEnd = Utils.addDays(state.weekStart, 6);

    root.innerHTML =
      '<div class="view-header">' +
        '<span class="view-header__eyebrow">Wochenplaner</span>' +
        '<h1>Was gibt es diese Woche?</h1>' +
        '<p>Plane deine Mahlzeiten pro Tag — aus den App-Rezepten, mit eigenen Gerichten oder ganz neuen, dauerhaft gespeicherten Rezepten. Unten wird daraus die Einkaufsliste.</p>' +
      '</div>' +

      '<div class="card">' +
        '<div class="week-nav">' +
          '<button class="btn btn--icon btn--secondary" id="prev-week" aria-label="Vorherige Woche">' + Icons.arrowLeft(16) + '</button>' +
          '<span class="week-nav__label">Woche vom ' + Utils.formatDateShort(state.weekStart) + ' – ' + Utils.formatDateShort(weekEnd) + '<small>' + (state.weekStart === Utils.startOfWeek(today) ? 'aktuelle Woche' : '') + '</small></span>' +
          '<button class="btn btn--icon btn--secondary" id="next-week" aria-label="Nächste Woche">' + Icons.arrowRight(16) + '</button>' +
        '</div>' +
        '<div class="plan-days">' +
          days.map(function (d) {
            var dt = Utils.parseISO(d);
            var isActive = d === state.activeDay;
            var isToday = d === today;
            return '<button class="plan-day' + (isActive ? ' is-active' : '') + (isToday ? ' is-today' : '') + '" data-day="' + d + '">' +
              DAY_SHORT[dt.getDay()] + '<br>' + dt.getDate() + '.' +
            '</button>';
          }).join('') +
        '</div>' +
        MEAL_ORDER.map(function (meal) { return mealSlotHtml(state.activeDay, meal, daySlots); }).join('') +
        '<div class="chip-row" style="margin-top: var(--space-3); margin-bottom:0;">' +
          '<button class="btn btn--secondary btn--sm" id="copy-next-week">Für nächste Woche übernehmen</button>' +
          '<button class="btn btn--ghost btn--sm" id="clear-week">Woche leeren</button>' +
        '</div>' +
      '</div>' +

      '<div class="card" style="margin-top: var(--space-6);">' + shoppingListHtml() + '</div>' +

      '<hr class="hr">' +
      '<div id="recipes-embed"></div>' +

      (state.picker ? pickerHtml() : '');

    // Wochennavigation
    root.querySelector('#prev-week').addEventListener('click', function () {
      state.weekStart = Utils.addDays(state.weekStart, -7);
      state.activeDay = state.weekStart;
      render(root);
    });
    root.querySelector('#next-week').addEventListener('click', function () {
      state.weekStart = Utils.addDays(state.weekStart, 7);
      state.activeDay = state.weekStart;
      render(root);
    });

    root.querySelectorAll('[data-day]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.activeDay = btn.getAttribute('data-day');
        render(root);
      });
    });

    root.querySelectorAll('[data-open-picker]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var parts = btn.getAttribute('data-open-picker').split('|');
        openPicker(root, parts[0], parts[1]);
      });
    });
    root.querySelectorAll('[data-remove-slot]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var parts = btn.getAttribute('data-remove-slot').split('|');
        clearSlot(state.weekStart, parts[0], parts[1]);
        render(root);
      });
    });

    root.querySelector('#copy-next-week').addEventListener('click', function () {
      var ok = copyToNextWeek(state.weekStart);
      Utils.toast(ok ? 'Für nächste Woche übernommen' : 'Diese Woche ist noch leer');
    });
    root.querySelector('#clear-week').addEventListener('click', function () {
      if (confirm('Den kompletten Plan für diese Woche wirklich leeren? Deine eigenen Rezepte bleiben dabei erhalten.')) {
        clearWeek(state.weekStart);
        render(root);
      }
    });

    // Einkaufsliste
    root.querySelector('#build-from-plan').addEventListener('click', function () {
      var n = buildShoppingListFromWeek();
      Utils.toast(n > 0 ? n + ' Einträge zur Einkaufsliste hinzugefügt' : 'Keine neuen Zutaten gefunden — Woche noch leer?');
      render(root);
    });
    root.querySelector('#add-shop-item-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var input = document.getElementById('new-shop-item');
      addShopItem(input.value);
      render(root);
    });
    root.querySelectorAll('[data-shop-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () { toggleShopItem(btn.getAttribute('data-shop-toggle')); render(root); });
    });
    root.querySelectorAll('[data-shop-remove]').forEach(function (btn) {
      btn.addEventListener('click', function () { removeShopItem(btn.getAttribute('data-shop-remove')); render(root); });
    });
    var resetShopBtn = root.querySelector('#reset-shop-week');
    if (resetShopBtn) resetShopBtn.addEventListener('click', function () {
      resetShopListForNextWeek();
      Utils.toast('Liste für die nächste Woche zurückgesetzt');
      render(root);
    });
    var clearShopBtn = root.querySelector('#clear-shop-list');
    if (clearShopBtn) clearShopBtn.addEventListener('click', function () {
      if (confirm('Die gesamte Einkaufsliste wirklich leeren?')) { clearShopList(); render(root); }
    });

    bindPickerEvents(root);

    // Rezeptideen direkt unter Wochenplan + Einkaufsliste angehängt (kein
    // eigener Menüpunkt mehr) — Views.rezepte rendert komplett
    // eigenständig in den übergebenen Container hinein. Bewusst ganz am
    // Ende und in try/catch: falls das je einen Fehler wirft, sollen die
    // wichtigeren Bindungen oben (Wochenplan, Einkaufsliste) trotzdem
    // sicher funktionieren.
    try {
      if (window.Views.rezepte) {
        Views.rezepte.render(document.getElementById('recipes-embed'));
      }
    } catch (err) {
      console.warn('Rezepte-Bereich konnte nicht gerendert werden', err);
    }
  }

  window.Views = window.Views || {};
  window.Views.wochenplaner = { render: render };
})();
