/* =========================================================================
   DATEN — Häufige Getränke mit ca.-Kalorienangaben und Menge
   Für die schnelle Auswahl beim Eintragen in der Tagesbilanz (Dashboard).
   Werte sind Richtwerte für eine übliche Portion/Tasse/Glas, gerundet.
   "ml" wird beim Eintragen automatisch zur Wasser-/Flüssigkeitsanzeige
   dazugezählt (siehe js/views/dashboard.js, addDrinkEntry).
   ========================================================================= */

(function () {
  'use strict';

  window.DRINKS = [
    { name: 'Kaffee, schwarz', kcal: 2, ml: 125 },
    { name: 'Kaffee mit Milch (Schuss)', kcal: 15, ml: 125 },
    { name: 'Kaffee mit Milch & Zucker', kcal: 40, ml: 125 },
    { name: 'Cappuccino', kcal: 60, ml: 150 },
    { name: 'Latte Macchiato', kcal: 120, ml: 250 },
    { name: 'Kakao (heiß, mit Milch)', kcal: 200, ml: 250 },
    { name: 'Tee, ungesüßt', kcal: 0, ml: 200 },
    { name: 'Tee mit Honig/Zucker', kcal: 40, ml: 200 },
    { name: 'Wasser mit Sirup', kcal: 60, ml: 250 },
    { name: 'Cola / Limonade (0,33 l)', kcal: 140, ml: 330 },
    { name: 'Cola Zero / Light (0,33 l)', kcal: 1, ml: 330 },
    { name: 'Eistee, gesüßt (0,33 l)', kcal: 120, ml: 330 },
    { name: 'Fruchtsaft (0,2 l)', kcal: 90, ml: 200 },
    { name: 'Saftschorle (0,3 l)', kcal: 60, ml: 300 },
    { name: 'Energy Drink (0,25 l)', kcal: 115, ml: 250 },
    { name: 'Milch (0,2 l)', kcal: 100, ml: 200 },
    { name: 'Buttermilch / Kefir (0,2 l)', kcal: 70, ml: 200 },
    { name: 'Smoothie (0,25 l)', kcal: 150, ml: 250 },
    { name: 'Bier (0,33 l)', kcal: 140, ml: 330 },
    { name: 'Wein (0,2 l)', kcal: 150, ml: 200 },
    { name: 'Sekt / Prosecco (0,1 l)', kcal: 80, ml: 100 }
  ];
})();
