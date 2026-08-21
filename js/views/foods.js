/* =========================================================================
   VIEW — Lebensmittel-Guide (Ampelsystem)
   Filterbar nach Kategorie, durchsuchbar, jedes Element per Klick direkt
   in die Einkaufsliste übernehmbar. Eigene Lebensmittel lassen sich
   hinzufügen, bearbeiten und löschen — App-Einträge bleiben fest.
   ========================================================================= */

(function () {
  'use strict';

  var state = { category: 'Alle', query: '', formOpen: false, editingId: null };
  var STATUS_LABEL = { go: 'Grün', caution: 'Gelb', stop: 'Rot' };
  var NEW_CATEGORY_VALUE = '__new__';

  function addToShoppingList(item) {
    var list = Storage.read(Storage.KEYS.shoppingList, []);
    var exists = list.some(function (i) { return i.name === item.name && !i.checked; });
    if (!exists) {
      list.push({ id: Storage.uid(), name: item.name, category: item.category, checked: false });
      Storage.write(Storage.KEYS.shoppingList, list);
    }
    Utils.toast(item.name + ' zur Einkaufsliste hinzugefügt', Icons.cart(16));
  }

  function matches(item, category, query) {
    if (category !== 'Alle' && item.category !== category) return false;
    if (query && item.name.toLowerCase().indexOf(query.toLowerCase()) === -1) return false;
    return true;
  }

  function renderList(root) {
    var listEl = root.querySelector('#food-list');
    var flatItems = [];
    CustomFoods.all().forEach(function (group) {
      group.items.forEach(function (item) { flatItems.push(Object.assign({ category: group.category }, item)); });
    });

    var visible = flatItems.filter(function (item) { return matches(item, state.category, state.query); });

    if (!visible.length) {
      listEl.innerHTML = '<div class="empty-state">' + Icons.empty(46) + '<p>Keine Treffer. Versuch einen anderen Suchbegriff.</p></div>';
      return;
    }

    var groups = {};
    var order = [];
    visible.forEach(function (item) {
      if (!groups[item.category]) { groups[item.category] = []; order.push(item.category); }
      groups[item.category].push(item);
    });

    listEl.innerHTML = order.map(function (cat) {
      var rows = groups[cat].map(function (item) {
        return '<li class="food-item">' +
          '<div class="food-item__main">' +
            '<div class="food-item__name">' + Utils.escapeHtml(item.name) + (item.isCustom ? ' <span class="badge" style="vertical-align:middle;">Eigener Eintrag</span>' : '') + '</div>' +
            (item.note ? '<div class="food-item__note">' + Utils.escapeHtml(item.note) + '</div>' : '') +
            '<span class="badge badge--' + item.status + '" style="margin-top:6px;"><span class="badge__dot"></span>' + STATUS_LABEL[item.status] + '</span>' +
          '</div>' +
          '<div class="food-item__actions" style="display:flex; gap:6px;">' +
            '<button class="btn btn--icon btn--secondary" data-add="' + Utils.escapeHtml(item.name) + '" data-cat="' + Utils.escapeHtml(item.category) + '" aria-label="' + Utils.escapeHtml(item.name) + ' zur Einkaufsliste hinzufügen">' + Icons.plus(16) + '</button>' +
            (item.isCustom ?
              '<button class="btn btn--icon btn--secondary" data-edit-food="' + item.id + '" aria-label="' + Utils.escapeHtml(item.name) + ' bearbeiten">' + Icons.edit(15) + '</button>' +
              '<button class="btn btn--icon btn--secondary" data-delete-food="' + item.id + '" aria-label="' + Utils.escapeHtml(item.name) + ' löschen">' + Icons.trash(15) + '</button>'
              : '') +
          '</div>' +
        '</li>';
      }).join('');
      return '<div class="food-group"><h3 class="food-group__title">' + cat + '</h3><ul class="stack" style="gap:0;">' + rows + '</ul></div>';
    }).join('');

    listEl.querySelectorAll('[data-add]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        addToShoppingList({ name: btn.getAttribute('data-add'), category: btn.getAttribute('data-cat') });
      });
    });
    listEl.querySelectorAll('[data-edit-food]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openForm(root, btn.getAttribute('data-edit-food'));
      });
    });
    listEl.querySelectorAll('[data-delete-food]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = CustomFoods.findById(btn.getAttribute('data-delete-food'));
        if (item && confirm('„' + item.name + '“ wirklich löschen?')) {
          CustomFoods.remove(item.id);
          Utils.toast('Lebensmittel gelöscht');
          renderList(root);
        }
      });
    });
  }

  function openForm(root, editingId) {
    state.formOpen = true;
    state.editingId = editingId || null;
    render(root);
  }

  function closeForm(root) {
    state.formOpen = false;
    state.editingId = null;
    render(root);
  }

  function formHtml() {
    var editing = state.editingId ? CustomFoods.findById(state.editingId) : null;
    var categories = CustomFoods.allCategories();
    var selectedCategory = editing ? editing.category : (state.category !== 'Alle' ? state.category : categories[0]);
    var isKnownCategory = categories.indexOf(selectedCategory) !== -1;

    var statusButtons = ['go', 'caution', 'stop'].map(function (s) {
      return '<button type="button" class="chip food-status-btn" data-status-btn="' + s + '" style="border-color: var(--color-' + (s === 'go' ? 'go' : s === 'caution' ? 'caution' : 'stop') + ');">' +
        '<span class="badge__dot" style="background: var(--color-' + (s === 'go' ? 'go' : s === 'caution' ? 'caution' : 'stop') + '); display:inline-block; margin-right:6px;"></span>' + STATUS_LABEL[s] +
      '</button>';
    }).join('');

    return '<div class="plan-picker-backdrop" id="food-form-backdrop"></div>' +
      '<div class="plan-picker" id="food-form-sheet">' +
        '<div class="plan-picker__header">' +
          '<strong>' + (editing ? 'Lebensmittel bearbeiten' : 'Lebensmittel hinzufügen') + '</strong>' +
          '<button class="btn btn--icon btn--ghost" id="food-form-close" aria-label="Schließen">' + Icons.close(18) + '</button>' +
        '</div>' +
        '<div class="plan-picker__body">' +
          '<div class="field"><label for="food-form-name">Name*</label>' +
          '<input class="input" id="food-form-name" type="text" placeholder="z. B. Hafermilch" value="' + (editing ? Utils.escapeHtml(editing.name) : '') + '" required></div>' +

          '<div class="field"><label for="food-form-category">Kategorie*</label>' +
          '<select class="input" id="food-form-category">' +
            categories.map(function (c) { return '<option value="' + Utils.escapeHtml(c) + '"' + (c === selectedCategory ? ' selected' : '') + '>' + Utils.escapeHtml(c) + '</option>'; }).join('') +
            '<option value="' + NEW_CATEGORY_VALUE + '"' + (!isKnownCategory ? ' selected' : '') + '>+ Neue Kategorie …</option>' +
          '</select></div>' +

          '<div class="field" id="food-form-new-category-field" style="display:' + (isKnownCategory ? 'none' : 'block') + ';">' +
            '<label for="food-form-new-category">Neue Kategorie</label>' +
            '<input class="input" id="food-form-new-category" type="text" placeholder="z. B. Backzutaten" value="' + (!isKnownCategory && editing ? Utils.escapeHtml(editing.category) : '') + '"></div>' +

          '<div class="field"><label>Ampel-Farbe*</label><div class="chip-row" id="food-status-buttons" style="margin-bottom:0;">' + statusButtons + '</div></div>' +

          '<div class="field"><label for="food-form-note">Kurze Begründung (optional)</label>' +
          '<textarea class="input" id="food-form-note" rows="2" placeholder="z. B. Wenig Kalorien, viele Ballaststoffe">' + (editing ? Utils.escapeHtml(editing.note || '') : '') + '</textarea></div>' +

          '<button class="btn btn--primary btn--block" id="food-form-save">' + (editing ? 'Änderungen speichern' : 'Lebensmittel speichern') + '</button>' +
        '</div>' +
      '</div>';
  }

  function bindFormEvents(root) {
    if (!state.formOpen) return;
    var editing = state.editingId ? CustomFoods.findById(state.editingId) : null;
    var selectedStatus = editing ? editing.status : null;

    root.querySelector('#food-form-close').addEventListener('click', function () { closeForm(root); });
    root.querySelector('#food-form-backdrop').addEventListener('click', function () { closeForm(root); });

    var categorySelect = root.querySelector('#food-form-category');
    var newCategoryField = root.querySelector('#food-form-new-category-field');
    categorySelect.addEventListener('change', function () {
      newCategoryField.style.display = categorySelect.value === NEW_CATEGORY_VALUE ? 'block' : 'none';
    });

    var statusButtonsEls = root.querySelectorAll('[data-status-btn]');
    function updateStatusUI() {
      statusButtonsEls.forEach(function (b) {
        b.classList.toggle('is-active', b.getAttribute('data-status-btn') === selectedStatus);
      });
    }
    statusButtonsEls.forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectedStatus = btn.getAttribute('data-status-btn');
        updateStatusUI();
      });
    });
    updateStatusUI();

    root.querySelector('#food-form-save').addEventListener('click', function () {
      var name = root.querySelector('#food-form-name').value.trim();
      if (!name) { Utils.toast('Bitte einen Namen eingeben'); return; }
      if (!selectedStatus) { Utils.toast('Bitte eine Ampel-Farbe wählen'); return; }

      var category = categorySelect.value;
      if (category === NEW_CATEGORY_VALUE) {
        category = root.querySelector('#food-form-new-category').value.trim();
        if (!category) { Utils.toast('Bitte eine neue Kategorie benennen'); return; }
      }

      var note = root.querySelector('#food-form-note').value.trim();
      var payload = { name: name, category: category, status: selectedStatus, note: note };

      if (editing) {
        CustomFoods.update(editing.id, payload);
        Utils.toast('Änderungen gespeichert');
      } else {
        CustomFoods.add(payload);
        Utils.toast('Lebensmittel gespeichert');
      }
      closeForm(root);
    });
  }

  function render(root) {
    var categories = ['Alle'].concat(CustomFoods.allCategories());

    root.innerHTML =
      '<div class="view-header">' +
        '<span class="view-header__eyebrow">Lebensmittel-Guide</span>' +
        '<h1>Was ist eine gute Wahl?</h1>' +
        '<p>Grün = öfter, Gelb = in Maßen, Rot = selten. Kein Verbot, nur Orientierung.</p>' +
      '</div>' +
      '<div class="search-input">' + Icons.search(18) + '<input type="search" id="food-search" placeholder="Lebensmittel suchen …" aria-label="Lebensmittel suchen"></div>' +
      '<button class="btn btn--secondary btn--block" id="open-food-form" style="margin-bottom: var(--space-4);">' + Icons.plus(16) + ' Lebensmittel hinzufügen</button>' +
      '<div class="chip-row" id="food-cats">' +
        categories.map(function (c) { return '<button class="chip' + (c === state.category ? ' is-active' : '') + '" data-cat="' + Utils.escapeHtml(c) + '">' + c + '</button>'; }).join('') +
      '</div>' +
      '<div id="food-list"></div>' +
      (state.formOpen ? formHtml() : '');

    renderList(root);

    root.querySelector('#food-search').value = state.query;
    root.querySelector('#food-search').addEventListener('input', Utils.debounce(function (ev) {
      state.query = ev.target.value;
      renderList(root);
    }, 120));

    root.querySelectorAll('#food-cats .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.category = chip.getAttribute('data-cat');
        root.querySelectorAll('#food-cats .chip').forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        renderList(root);
      });
    });

    root.querySelector('#open-food-form').addEventListener('click', function () { openForm(root, null); });

    bindFormEvents(root);
  }

  window.Views = window.Views || {};
  window.Views.lebensmittel = { render: render };
})();
