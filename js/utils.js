/* =========================================================================
   UTILS — kleine Helfer, die überall gebraucht werden
   ========================================================================= */

(function () {
  'use strict';

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function toISO(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  function todayISO() {
    return toISO(new Date());
  }

  function parseISO(iso) {
    var parts = iso.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function addDays(iso, n) {
    var d = parseISO(iso);
    d.setDate(d.getDate() + n);
    return toISO(d);
  }

  function formatDateShort(iso) {
    var d = parseISO(iso);
    var months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    return d.getDate() + '. ' + months[d.getMonth()];
  }

  function formatDateLong(iso) {
    var d = parseISO(iso);
    var days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return days[d.getDay()] + ', ' + formatDateShort(iso);
  }

  function formatKg(kg) {
    return (Math.round(kg * 10) / 10).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' kg';
  }

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  /** Formatiert eine Differenz im deutschen Zahlenformat, z. B. "-1,1 kg". */
  function formatDeltaKg(n) {
    var r = round1(n);
    var str = Math.abs(r).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return (r > 0 ? '+' : r < 0 ? '−' : '±') + str + ' kg';
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /** Montag der Woche, in der `iso` liegt (ISO-Woche, Mo–So). */
  function startOfWeek(iso) {
    var d = parseISO(iso);
    var day = d.getDay(); // 0 = So
    var diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return toISO(d);
  }

  /** Zeigt kurz eine Erfolgsmeldung / Statusmeldung am unteren Rand an. */
  var toastTimer = null;
  function toast(message, icon) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.innerHTML = (icon || Icons.check(16)) + '<span>' + escapeHtml(message) + '</span>';
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('is-visible');
    }, 2600);
  }

  /**
   * Baut einen kreisförmigen Fortschrittsbalken als reines SVG (kein Text
   * darin — Beschriftung kommt als HTML-Overlay, damit sie scharf bleibt).
   */
  function progressRingSVG(percent, size, strokeWidth, trackColor, fillColor) {
    var r = (size - strokeWidth) / 2;
    var c = size / 2;
    var circumference = 2 * Math.PI * r;
    var pct = clamp(percent, 0, 1);
    var offset = circumference * (1 - pct);
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
      '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="' + trackColor + '" stroke-width="' + strokeWidth + '"/>' +
      '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="' + fillColor + '" stroke-width="' + strokeWidth +
      '" stroke-linecap="round" stroke-dasharray="' + circumference + '" stroke-dashoffset="' + offset +
      '" transform="rotate(-90 ' + c + ' ' + c + ')" style="transition: stroke-dashoffset var(--duration-base) var(--ease-standard);"/>' +
      '</svg>';
  }

  /**
   * Grundumsatz nach Mifflin-St-Jeor (heutiger Standard). `gender` ist
   * 'm' oder 'w'.
   */
  function calcBMR(gender, weightKg, heightCm, age) {
    var base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return Math.round(gender === 'm' ? base + 5 : base - 161);
  }

  function calcTDEE(bmr, pal) {
    return Math.round(bmr * pal);
  }

  window.Utils = {
    pad: pad,
    toISO: toISO,
    todayISO: todayISO,
    parseISO: parseISO,
    addDays: addDays,
    formatDateShort: formatDateShort,
    formatDateLong: formatDateLong,
    formatKg: formatKg,
    round1: round1,
    clamp: clamp,
    debounce: debounce,
    escapeHtml: escapeHtml,
    startOfWeek: startOfWeek,
    toast: toast,
    progressRingSVG: progressRingSVG,
    formatDeltaKg: formatDeltaKg,
    calcBMR: calcBMR,
    calcTDEE: calcTDEE
  };
})();
