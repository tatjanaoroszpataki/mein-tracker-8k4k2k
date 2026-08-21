/* =========================================================================
   CHART — selbstgebauter Canvas-Liniendiagramm für den Gewichtsverlauf.
   Keine externe Bibliothek. Zeigt: Messpunkte, geglätteten Trend
   (gleitender Durchschnitt) und optional eine gestrichelte Ziellinie.
   ========================================================================= */

(function () {
  'use strict';

  function movingAverage(points, windowSize) {
    return points.map(function (p, i) {
      var start = Math.max(0, i - windowSize + 1);
      var slice = points.slice(start, i + 1);
      var avg = slice.reduce(function (s, q) { return s + q.y; }, 0) / slice.length;
      return { x: p.x, y: avg };
    });
  }

  function niceRange(min, max) {
    if (min === max) { min -= 1; max += 1; }
    var pad = (max - min) * 0.15 || 1;
    return { min: min - pad, max: max + pad };
  }

  /**
   * Zeichnet den Chart in ein <canvas>.
   * @param {HTMLCanvasElement} canvas
   * @param {Array<{date:string, kg:number}>} entries – aufsteigend sortiert
   * @param {{targetKg?:number}} goal
   */
  function draw(canvas, entries, goal) {
    var ctx = canvas.getContext('2d');
    var cssWidth = canvas.parentElement.clientWidth;
    var cssHeight = 220;
    var dpr = window.devicePixelRatio || 1;

    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    canvas.style.height = cssHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    var styles = getComputedStyle(document.documentElement);
    var colorInk = styles.getPropertyValue('--color-ink-soft').trim() || '#55635B';
    var colorPrimary = styles.getPropertyValue('--color-primary').trim() || '#1F6F5C';
    var colorAccent = styles.getPropertyValue('--color-accent').trim() || '#C4872E';
    var colorBorder = styles.getPropertyValue('--color-border').trim() || '#DCDFD2';
    var colorPoint = styles.getPropertyValue('--color-primary-dark').trim() || '#154F41';

    var padding = { top: 16, right: 12, bottom: 26, left: 40 };
    var plotW = cssWidth - padding.left - padding.right;
    var plotH = cssHeight - padding.top - padding.bottom;

    if (!entries.length) {
      ctx.fillStyle = colorInk;
      ctx.font = '13px ' + styles.getPropertyValue('--font-body');
      ctx.textAlign = 'center';
      ctx.fillText('Noch keine Einträge — trag dein Gewicht ein, um den Verlauf zu sehen.', cssWidth / 2, cssHeight / 2);
      return;
    }

    var points = entries.map(function (e, i) { return { x: i, date: e.date, y: e.kg }; });
    var values = points.map(function (p) { return p.y; });
    var yMin = Math.min.apply(null, values);
    var yMax = Math.max.apply(null, values);
    if (goal && goal.targetKg) {
      yMin = Math.min(yMin, goal.targetKg);
      yMax = Math.max(yMax, goal.targetKg);
    }
    var range = niceRange(yMin, yMax);

    var xCount = points.length;
    function xPos(i) { return padding.left + (xCount === 1 ? plotW / 2 : (plotW * i) / (xCount - 1)); }
    function yPos(v) { return padding.top + plotH - ((v - range.min) / (range.max - range.min)) * plotH; }

    // --- Gitterlinien + Y-Achsenbeschriftung -------------------------------
    ctx.strokeStyle = colorBorder;
    ctx.fillStyle = colorInk;
    ctx.font = '11px ' + (styles.getPropertyValue('--font-body') || 'sans-serif');
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    var steps = 4;
    for (var s = 0; s <= steps; s++) {
      var v = range.min + ((range.max - range.min) * s) / steps;
      var y = yPos(v);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(cssWidth - padding.right, y);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillText(Utils.round1(v).toFixed(1), padding.left - 8, y);
    }

    // --- X-Achsenbeschriftung (erste, mittlere, letzte Messung) ------------
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    var labelIdxs = xCount <= 2 ? [0, xCount - 1] : [0, Math.floor((xCount - 1) / 2), xCount - 1];
    labelIdxs.forEach(function (i) {
      ctx.fillText(Utils.formatDateShort(points[i].date), xPos(i), cssHeight - padding.bottom + 8);
    });

    // --- Ziellinie -----------------------------------------------------------
    if (goal && goal.targetKg) {
      var gy = yPos(goal.targetKg);
      ctx.save();
      ctx.strokeStyle = colorAccent;
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padding.left, gy);
      ctx.lineTo(cssWidth - padding.right, gy);
      ctx.stroke();
      ctx.restore();
    }

    // --- Trendlinie (gleitender Durchschnitt über 5 Messungen) ---------------
    if (points.length >= 3) {
      var trend = movingAverage(points, Math.min(5, points.length));
      ctx.strokeStyle = colorPrimary;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      trend.forEach(function (p, i) {
        var px = xPos(i), py = yPos(p.y);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    // --- Rohdaten-Punkte (dezent, dünne Linie + Punkte) -----------------------
    ctx.strokeStyle = colorBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    points.forEach(function (p, i) {
      var px = xPos(i), py = yPos(p.y);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();

    ctx.fillStyle = colorPoint;
    points.forEach(function (p, i) {
      var px = xPos(i), py = yPos(p.y);
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  window.WeightChart = { draw: draw };
})();
