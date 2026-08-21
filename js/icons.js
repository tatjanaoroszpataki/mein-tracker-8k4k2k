/* =========================================================================
   ICONS — zwei Systeme in einer gemeinsamen visuellen Sprache:

   1) Icons.*        kleine UI-Liniensymbole (Navigation, Buttons, Status)
   2) StickFigure.*   das durchgängige Strichmännchen-System für Übungen —
                      ein Kopf-Kreis + Skelett-Linien, in wechselnden Posen,
                      aber immer mit gleicher Strichstärke, Rundung und Kopf.

   Alles sind reine SVG-Strings (kein externes Icon-Set, keine Web-Fonts).
   ========================================================================= */

(function () {
  'use strict';

  function svg(size, inner, viewBox) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="' + (viewBox || '0 0 24 24') +
      '" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + inner + '</svg>';
  }

  var S = '1.8'; // Standard-Strichstärke der UI-Icons

  var Icons = {
    mark: function (size) {
      // App-Logo: Kopf-Kreis + kleine Armhaltung, im Kreis-Badge — dieselbe
      // Formsprache wie das Strichmännchen-System, als Wiedererkennungszeichen.
      return svg(size, '<circle cx="12" cy="12" r="11.25" fill="var(--color-primary)"/>' +
        '<circle cx="12" cy="7.4" r="2.1" fill="none" stroke="#fff" stroke-width="1.6"/>' +
        '<path d="M12 9.6V14.2M12 10.8L8.7 9.6M12 10.8L15.3 9.6M12 14.2L9 18.4M12 14.2L15 18.4" ' +
        'stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>', '0 0 24 24');
    },
    home: function (size) {
      return svg(size, '<path d="M4 11.5 12 4l8 7.5" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M6 10v9h12v-9" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M10 19v-5h4v5" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round" stroke-linejoin="round"/>');
    },
    scale: function (size) {
      return svg(size, '<rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" stroke-width="' + S + '"/>' +
        '<path d="M8 15c1.2-4 6.8-4 8 0" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round"/>' +
        '<circle cx="12" cy="10.5" r="1.3" fill="currentColor"/>');
    },
    apple: function (size) {
      return svg(size, '<path d="M12 9.3c1-1.6 3-2 4.3-1 1.6 1.2 1.9 3.8.6 6.2-1.1 2-2.8 3.7-4.4 3.8-.9.1-1.5-.3-2-.3s-1.1.4-2 .3c-1.7-.1-3.6-2.1-4.6-4.3-1.1-2.4-.5-5.4 1.6-6.5 1.2-.6 2.5-.3 3.4.3" ' +
        'stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M12.4 8.5c.2-1.2 1-2.1 2.3-2.4" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round"/>');
    },
    calendar: function (size) {
      return svg(size, '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5" stroke="currentColor" stroke-width="' + S + '"/>' +
        '<path d="M4 9.5h16M8 3.5v3.5M16 3.5v3.5" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round"/>' +
        '<circle cx="8.3" cy="13.2" r="1.1" fill="currentColor"/><circle cx="12" cy="13.2" r="1.1" fill="currentColor"/>' +
        '<circle cx="8.3" cy="16.6" r="1.1" fill="currentColor"/><circle cx="12" cy="16.6" r="1.1" fill="currentColor"/><circle cx="15.7" cy="13.2" r="1.1" fill="currentColor"/>');
    },
    cart: function (size) {
      return svg(size, '<path d="M4 5h2l1.8 10.2a2 2 0 0 0 2 1.6h6.6a2 2 0 0 0 2-1.6L20 8H7" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<circle cx="10" cy="20" r="1.3" fill="currentColor"/><circle cx="17" cy="20" r="1.3" fill="currentColor"/>');
    },
    book: function (size) {
      return svg(size, '<path d="M5 5.5C5 4.7 5.7 4 6.5 4H12v16H6.5c-.8 0-1.5-.7-1.5-1.5z" stroke="currentColor" stroke-width="' + S + '" stroke-linejoin="round"/>' +
        '<path d="M19 5.5c0-.8-.7-1.5-1.5-1.5H12v16h5.5c.8 0 1.5-.7 1.5-1.5z" stroke="currentColor" stroke-width="' + S + '" stroke-linejoin="round"/>');
    },
    drop: function (size) {
      return svg(size, '<path d="M12 3.5c3 3.8 6 7.6 6 10.8a6 6 0 1 1-12 0c0-3.2 3-7 6-10.8Z" stroke="currentColor" stroke-width="' + S + '" stroke-linejoin="round"/>');
    },
    figure: function (size) {
      return svg(size, '<circle cx="12" cy="6" r="2" stroke="currentColor" stroke-width="' + S + '"/>' +
        '<path d="M12 8.4v5.4M12 9.6 8.3 8.4M12 9.6l3.7-1.2M12 13.8 8.6 19M12 13.8l3.6 5.2" ' +
        'stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round" stroke-linejoin="round"/>');
    },
    check: function (size) {
      return svg(size, '<path d="M4.5 12.5 9.5 17.5 19.5 6.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>');
    },
    plus: function (size) {
      return svg(size, '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>');
    },
    minus: function (size) {
      return svg(size, '<path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>');
    },
    moon: function (size) {
      return svg(size, '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" stroke="currentColor" stroke-width="' + S + '" stroke-linejoin="round"/>');
    },
    edit: function (size) {
      return svg(size, '<path d="M14.5 4.5 19.5 9.5 8 21H3v-5Z" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M12.5 6.5 17.5 11.5" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round"/>');
    },
    trash: function (size) {
      return svg(size, '<path d="M5 7h14M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7m1.5 0-.7 12.1a1.6 1.6 0 0 1-1.6 1.4H9.8a1.6 1.6 0 0 1-1.6-1.4L7.5 7" ' +
        'stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round" stroke-linejoin="round"/>');
    },
    search: function (size) {
      return svg(size, '<circle cx="10.5" cy="10.5" r="6" stroke="currentColor" stroke-width="' + S + '"/>' +
        '<path d="M19 19 15 15" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round"/>');
    },
    chevron: function (size) {
      return svg(size, '<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>');
    },
    flame: function (size) {
      return svg(size, '<path d="M12 3c1 3-3 4.5-3 8a3 3 0 0 0 6 0c1 1-.5 3-.5 3 3-1 4.5-4 3-7.5-1 1.5-2 1-1.5-.5C15.5 4 13 3 12 3Z" ' +
        'stroke="currentColor" stroke-width="' + S + '" stroke-linejoin="round"/>');
    },
    target: function (size) {
      return svg(size, '<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="' + S + '"/>' +
        '<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="' + S + '"/>' +
        '<circle cx="12" cy="12" r="0.9" fill="currentColor"/>');
    },
    trend: function (size) {
      return svg(size, '<path d="M4 16 9.5 10 13.5 14 20 6" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M14.5 6H20v5.5" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round" stroke-linejoin="round"/>');
    },
    download: function (size) {
      return svg(size, '<path d="M12 4v11m0 0-4-4m4 4 4-4" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M5 18v1.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V18" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round"/>');
    },
    upload: function (size) {
      return svg(size, '<path d="M12 15V4m0 0 4 4m-4-4-4 4" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M5 18v1.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V18" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round"/>');
    },
    bell: function (size) {
      return svg(size, '<path d="M6 10.5a6 6 0 0 1 12 0c0 3 1 4.2 1.5 5H4.5C5 14.7 6 13.5 6 10.5Z" stroke="currentColor" stroke-width="' + S + '" stroke-linejoin="round"/>' +
        '<path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round"/>');
    },
    calculator: function (size) {
      return svg(size, '<rect x="5" y="3.5" width="14" height="17" rx="2.5" stroke="currentColor" stroke-width="' + S + '"/>' +
        '<path d="M8 7.5h8" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round"/>' +
        '<circle cx="8.3" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="15.7" cy="12" r="1" fill="currentColor"/>' +
        '<circle cx="8.3" cy="15.8" r="1" fill="currentColor"/><circle cx="12" cy="15.8" r="1" fill="currentColor"/><circle cx="15.7" cy="15.8" r="1" fill="currentColor"/>');
    },
    lightbulb: function (size) {
      return svg(size, '<path d="M12 3.5a5.5 5.5 0 0 0-3 10.1c.6.4 1 1.1 1 1.9v.6h4v-.6c0-.8.4-1.5 1-1.9A5.5 5.5 0 0 0 12 3.5Z" ' +
        'stroke="currentColor" stroke-width="' + S + '" stroke-linejoin="round"/>' +
        '<path d="M10 18.5h4M10.5 21h3" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round"/>');
    },
    chat: function (size) {
      return svg(size, '<path d="M4 6.8A2.8 2.8 0 0 1 6.8 4h10.4A2.8 2.8 0 0 1 20 6.8v6.4a2.8 2.8 0 0 1-2.8 2.8H10l-4.5 4v-4H6.8A2.8 2.8 0 0 1 4 13.2Z" ' +
        'stroke="currentColor" stroke-width="' + S + '" stroke-linejoin="round"/>' +
        '<circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="12" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/>');
    },
    close: function (size) {
      return svg(size, '<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>');
    },
    arrowRight: function (size) {
      return svg(size, '<path d="M4.5 12h15M13 6l6 6-6 6" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round" stroke-linejoin="round"/>');
    },
    arrowLeft: function (size) {
      return svg(size, '<path d="M19.5 12h-15M11 6l-6 6 6 6" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round" stroke-linejoin="round"/>');
    },
    empty: function (size) {
      return svg(size, '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="' + S + '" stroke-dasharray="2.5 3.5"/>' +
        '<path d="M9 12h6" stroke="currentColor" stroke-width="' + S + '" stroke-linecap="round"/>');
    }
  };

  /* =======================================================================
     STICK FIGURE SYSTEM
     Jede Pose ist ein Skelett aus Liniensegmenten (Schulter→Ellbogen→Hand,
     Hüfte→Knie→Fuß, Wirbelsäule) plus ein Kopf-Kreis, alles im 100×100
     Koordinatensystem. Ein gemeinsamer Renderer sorgt für identische
     Strichstärke, Rundung und Kopfgröße über alle Posen hinweg.
     ========================================================================= */

  var HEAD_R = 7.5;
  var STROKE = 6.5;

  // Kleine Zusatz-Akzente (Pfeile, Bewegungs-Bögen, Möbel-Linien) für Kontext.
  function accentLine(pts, dashed) {
    return '<polyline points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') +
      '" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" ' +
      (dashed ? 'stroke-dasharray="1 5" ' : '') + 'opacity="0.55"/>';
  }

  function bone(pts) {
    return '<polyline points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') +
      '" fill="none" stroke="currentColor" stroke-width="' + STROKE + '" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  function head(cx, cy) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + HEAD_R + '" fill="var(--color-surface)" stroke="currentColor" stroke-width="' + STROKE + '"/>';
  }

  // Poses: { head:[x,y], bones:[[[x,y],[x,y],...], ...], accents:[[[x,y],...], ...] }
  var POSES = {
    standing: {
      head: [50, 15],
      bones: [
        [[50, 23], [50, 58]],
        [[50, 27], [36, 40], [32, 55]],
        [[50, 27], [64, 40], [68, 55]],
        [[50, 58], [44, 78], [42, 96]],
        [[50, 58], [56, 78], [58, 96]]
      ]
    },
    calfRaise: {
      head: [50, 15],
      bones: [
        [[50, 23], [50, 58]],
        [[50, 27], [39, 39], [37, 53]],
        [[50, 27], [61, 39], [63, 53]],
        [[50, 58], [47, 78], [46, 94]],
        [[50, 58], [53, 78], [54, 94]]
      ],
      accents: [
        [[44, 90], [46, 86], [48, 90]],
        [[52, 90], [54, 86], [56, 90]]
      ]
    },
    squat: {
      head: [50, 28],
      bones: [
        [[50, 35], [50, 58]],
        [[50, 38], [30, 40], [16, 42]],
        [[50, 38], [30, 46], [16, 48]],
        [[50, 58], [32, 65], [28, 90]],
        [[50, 58], [68, 65], [72, 90]]
      ]
    },
    lunge: {
      head: [50, 18],
      bones: [
        [[50, 25], [51, 53]],
        [[50, 28], [39, 40], [33, 51]],
        [[50, 28], [62, 36], [67, 46]],
        [[51, 53], [30, 64], [30, 90]],
        [[51, 53], [67, 70], [82, 84]]
      ]
    },
    pushUp: {
      head: [15, 54],
      bones: [
        [[22, 54], [72, 52]],
        [[26, 54], [17, 63], [25, 76]],
        [[30, 55], [21, 64], [29, 77]],
        [[72, 52], [86, 54], [98, 56]],
        [[72, 52], [86, 58], [98, 60]]
      ]
    },
    plank: {
      head: [15, 50],
      bones: [
        [[22, 50], [74, 49]],
        [[25, 50], [25, 74]],
        [[74, 49], [98, 51]]
      ],
      accents: [[[10, 78], [100, 78]]]
    },
    wallSit: {
      head: [42, 30],
      bones: [
        [[42, 37], [42, 58]],
        [[42, 40], [31, 47], [27, 58]],
        [[42, 40], [53, 47], [57, 58]],
        [[42, 58], [64, 58], [64, 90]],
        [[42, 58], [40, 58], [40, 90]]
      ],
      accents: [[[20, 8], [20, 98]]]
    },
    situp: {
      head: [58, 46],
      bones: [
        [[30, 78], [44, 62], [54, 50]],
        [[54, 50], [42, 48], [32, 50]],
        [[30, 78], [18, 66], [8, 68]],
        [[30, 78], [30, 60], [30, 42]]
      ],
      accents: [[[6, 82], [34, 82]]]
    },
    jumpingJack: {
      head: [50, 18],
      bones: [
        [[50, 25], [50, 55]],
        [[50, 28], [37, 17], [27, 6]],
        [[50, 28], [63, 17], [73, 6]],
        [[50, 55], [35, 72], [25, 92]],
        [[50, 55], [65, 72], [75, 92]]
      ]
    },
    highKnee: {
      head: [45, 17],
      bones: [
        [[46, 25], [48, 50]],
        [[48, 28], [60, 24], [68, 32]],
        [[48, 28], [37, 35], [29, 45]],
        [[48, 50], [60, 43], [55, 27]],
        [[48, 50], [42, 74], [40, 96]]
      ]
    },
    armCircle: {
      head: [50, 18],
      bones: [
        [[50, 25], [50, 58]],
        [[50, 28], [35, 24], [24, 14]],
        [[50, 28], [64, 37], [70, 52]],
        [[50, 58], [44, 78], [42, 98]],
        [[50, 58], [56, 78], [58, 98]]
      ],
      accents: [[[16, 20], [20, 10], [30, 8]]]
    },
    dip: {
      head: [49, 38],
      bones: [
        [[52, 41], [60, 48], [70, 54]],
        [[54, 42], [66, 50], [78, 54]],
        [[70, 54], [50, 63], [30, 70]],
        [[70, 54], [58, 46], [52, 41]]
      ],
      accents: [[[58, 54], [92, 54]]]
    },
    bellyBrace: {
      head: [50, 15],
      bones: [
        [[50, 23], [50, 58]],
        [[50, 27], [41, 37], [47, 46]],
        [[50, 27], [59, 37], [53, 46]],
        [[50, 58], [44, 78], [42, 96]],
        [[50, 58], [56, 78], [58, 96]]
      ],
      accents: [[[43, 50], [40, 47]], [[57, 50], [60, 47]], [[50, 52], [50, 48]]]
    },
    jumpRope: {
      head: [50, 15],
      bones: [
        [[50, 23], [50, 58]],
        [[50, 27], [40, 42], [36, 54]],
        [[50, 27], [60, 42], [64, 54]],
        [[50, 58], [45, 76], [44, 92]],
        [[50, 58], [55, 76], [56, 92]]
      ],
      accents: [[[30, 58], [34, 50], [40, 46]], [[60, 46], [66, 50], [70, 58]]]
    },
    mountainClimber: {
      head: [15, 50],
      bones: [
        [[22, 50], [74, 49]],
        [[25, 50], [25, 74]],
        [[74, 49], [92, 54], [100, 58]],
        [[74, 49], [58, 62], [46, 56]]
      ],
      accents: [[[50, 66], [46, 58]]]
    },
    shoulderPress: {
      head: [50, 15],
      bones: [
        [[50, 23], [50, 58]],
        [[50, 27], [38, 30], [34, 14]],
        [[50, 27], [62, 30], [66, 14]],
        [[50, 58], [44, 78], [42, 96]],
        [[50, 58], [56, 78], [58, 96]]
      ]
    },
    lateralRaise: {
      head: [50, 15],
      bones: [
        [[50, 23], [50, 58]],
        [[50, 28], [30, 26], [14, 24]],
        [[50, 28], [70, 26], [86, 24]],
        [[50, 58], [44, 78], [42, 96]],
        [[50, 58], [56, 78], [58, 96]]
      ]
    },
    superman: {
      head: [14, 48],
      bones: [
        [[22, 49], [76, 46]],
        [[22, 49], [12, 42], [4, 36]],
        [[76, 46], [88, 40], [98, 34]]
      ],
      accents: [[[10, 60], [95, 60]]]
    },
    snowAngel: {
      head: [15, 50],
      bones: [
        [[22, 50], [78, 50]],
        [[25, 50], [16, 36], [10, 22]],
        [[25, 50], [25, 60], [25, 70]],
        [[78, 50], [90, 53], [100, 56]]
      ],
      accents: [[[10, 22], [18, 30], [25, 44]]]
    },
    bentRow: {
      head: [44, 30],
      bones: [
        [[44, 37], [60, 56]],
        [[50, 40], [58, 52], [50, 58]],
        [[50, 40], [60, 48], [54, 56]],
        [[60, 56], [58, 76], [56, 96]]
      ]
    },
    catCow: {
      head: [16, 40],
      bones: [
        [[24, 44], [72, 42]],
        [[26, 44], [26, 68], [26, 90]],
        [[68, 42], [68, 68], [68, 90]]
      ],
      accents: [[[10, 92], [96, 92]], [[35, 38], [50, 34], [65, 38]]]
    },
    legRaise: {
      head: [16, 62],
      bones: [
        [[23, 62], [55, 62]],
        [[30, 62], [34, 66], [40, 68]],
        [[55, 62], [62, 38], [66, 16]]
      ],
      accents: [[[10, 70], [60, 70]]]
    },
    russianTwist: {
      head: [42, 28],
      bones: [
        [[42, 35], [35, 64]],
        [[35, 64], [52, 60], [66, 54]],
        [[40, 42], [55, 46], [68, 50]]
      ],
      accents: [[[20, 72], [45, 72]]]
    },
    gluteBridge: {
      head: [16, 60],
      bones: [
        [[24, 62], [46, 50]],
        [[24, 62], [24, 74], [24, 86]],
        [[46, 50], [56, 68], [50, 90]]
      ],
      accents: [[[10, 92], [60, 92]]]
    }
  };

  function renderFigure(poseKey, size, colorVar) {
    var pose = POSES[poseKey] || POSES.standing;
    var color = colorVar || 'currentColor';
    var inner = '<g color="' + color + '">' +
      pose.bones.map(bone).join('') +
      (pose.accents ? pose.accents.map(function (a) { return accentLine(a, true); }).join('') : '') +
      head(pose.head[0], pose.head[1]) +
      '</g>';
    return svg(size, inner, '0 0 100 100');
  }

  window.Icons = Icons;
  window.StickFigure = {
    poses: Object.keys(POSES),
    render: renderFigure
  };
})();
