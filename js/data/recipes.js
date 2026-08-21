/* =========================================================================
   DATEN — Rezeptideen
   meal: 'fruehstueck' | 'mittag' | 'abend' | 'snack'
   kcal / macros sind grobe ca.-Richtwerte pro Portion, keine exakten
   Nährwertangaben (siehe Hinweis in der Rezepte-Ansicht).
   ========================================================================= */

(function () {
  'use strict';

  window.RECIPE_DATA = [
    {
      id: 'overnight-oats',
      title: 'Overnight Oats mit Beeren',
      meal: 'fruehstueck',
      time: '5 Min + über Nacht',
      kcal: 380,
      macros: { protein: 14, carbs: 50, fat: 12, fiber: 9 },
      ingredients: [
        '50 g Haferflocken',
        '200 ml fettarme Milch oder Pflanzendrink',
        '100 g Beeren',
        '1 EL Chiasamen',
        'etwas Zimt'
      ],
      steps: [
        'Alles außer den Beeren im Glas verrühren.',
        'Über Nacht im Kühlschrank ziehen lassen.',
        'Morgens die Beeren obenauf geben.'
      ],
      why: 'Viele Ballaststoffe, lange Sättigung, kaum Zucker.'
    },
    {
      id: 'ruehrei-spinat',
      title: 'Rührei mit Spinat',
      meal: 'fruehstueck',
      time: '10 Min',
      kcal: 260,
      macros: { protein: 20, carbs: 3, fat: 19, fiber: 2 },
      ingredients: ['2–3 Eier', 'eine Handvoll Spinat', 'Salz, Pfeffer', 'etwas Öl'],
      steps: [
        'Spinat in der Pfanne zusammenfallen lassen.',
        'Verquirlte Eier dazugeben und stocken lassen.'
      ],
      why: 'Viel Eiweiß, sehr kalorienarm.'
    },
    {
      id: 'skyr-bowl',
      title: 'Skyr-Bowl mit Nüssen und Obst',
      meal: 'fruehstueck',
      time: '5 Min',
      kcal: 340,
      macros: { protein: 24, carbs: 28, fat: 14, fiber: 4 },
      ingredients: ['200 g Skyr', 'eine Handvoll Nüsse', 'Obst nach Wahl', 'optional Zimt'],
      steps: ['Skyr in eine Schüssel geben.', 'Obst und Nüsse darüber verteilen.'],
      why: 'Viel Eiweiß, wenig Zucker, schnell gemacht.'
    },
    {
      id: 'toast-avocado-ei',
      title: 'Vollkorntoast mit Avocado und Ei',
      meal: 'fruehstueck',
      time: '10 Min',
      kcal: 420,
      macros: { protein: 16, carbs: 32, fat: 24, fiber: 9 },
      ingredients: ['2 Scheiben Vollkornbrot', '½ Avocado', '1 Ei', 'Salz, Pfeffer, Chiliflocken'],
      steps: [
        'Brot toasten.',
        'Avocado zerdrücken und aufstreichen.',
        'Ei braten oder pochieren und obenauf legen.'
      ],
      why: 'Gesunde Fette + Ballaststoffe + Eiweiß.'
    },
    {
      id: 'bauernfruehstueck',
      title: 'Bauernfrühstück (Bratkartoffeln mit Ei und Speck)',
      meal: 'fruehstueck',
      time: '20 Min',
      kcal: 550,
      macros: { protein: 22, carbs: 45, fat: 30, fiber: 5 },
      ingredients: ['Kartoffeln (vom Vortag)', '2 Eier', 'etwas magerer Speck oder Schinken', 'Zwiebel', 'Öl'],
      steps: [
        'Kartoffeln in Scheiben mit Zwiebel und Speck in der Pfanne knusprig braten.',
        'Eier verquirlen und unterrühren, bis alles gestockt ist.'
      ],
      why: 'Klassisches, sättigendes Frühstück, hält bis zum Mittag vor.'
    },
    {
      id: 'omelett-schinken-kaese',
      title: 'Omelett mit Schinken und Käse',
      meal: 'fruehstueck',
      time: '10 Min',
      kcal: 450,
      macros: { protein: 32, carbs: 3, fat: 34, fiber: 1 },
      ingredients: ['2–3 Eier', 'gekochter Schinken', 'etwas geriebener Käse', 'Salz, Pfeffer, Schnittlauch'],
      steps: [
        'Eier verquirlen, in der Pfanne stocken lassen.',
        'Schinken und Käse auf einer Hälfte verteilen.',
        'Zusammenklappen.'
      ],
      why: 'Viel Eiweiß, sehr sättigend, schnell gemacht.'
    },
    {
      id: 'brot-frischkaese-lachs',
      title: 'Vollkornbrot mit Frischkäse und Räucherlachs',
      meal: 'fruehstueck',
      time: '5 Min',
      kcal: 400,
      macros: { protein: 22, carbs: 32, fat: 20, fiber: 6 },
      ingredients: ['2 Scheiben Vollkornbrot', 'körniger Frischkäse', 'Räucherlachs', 'etwas Zitrone', 'Gurke in Scheiben'],
      steps: [
        'Brot mit Frischkäse bestreichen.',
        'Lachs und Gurke belegen.',
        'Mit Zitrone beträufeln.'
      ],
      why: 'Gute Fette + Eiweiß, herzhaft ohne schwer im Magen zu liegen.'
    },
    {
      id: 'haferbrei-ei-gemuese',
      title: 'Herzhafter Haferbrei mit Ei und Gemüse',
      meal: 'fruehstueck',
      time: '10 Min',
      kcal: 480,
      macros: { protein: 22, carbs: 45, fat: 20, fiber: 7 },
      ingredients: ['50 g zarte Haferflocken', 'Gemüsebrühe statt Milch', '1 Spiegelei', 'etwas Spinat oder Tomate', 'Salz, Pfeffer, Chiliflocken'],
      steps: [
        'Haferflocken in Brühe cremig kochen.',
        'In eine Schüssel geben.',
        'Mit Ei und Gemüse toppen.'
      ],
      why: 'Alternative Variante zum süßen Porridge, viel Eiweiß durchs Ei, gut sättigend.'
    },
    {
      id: 'fruehstuecks-wrap-pute',
      title: 'Frühstücks-Wrap mit Rührei und Pute',
      meal: 'fruehstueck',
      time: '10 Min',
      kcal: 500,
      macros: { protein: 28, carbs: 38, fat: 24, fiber: 5 },
      ingredients: ['1 Vollkorn-Wrap', '2 Eier', 'etwas Putenbrust oder -schinken', 'Paprika', 'Salat'],
      steps: [
        'Rührei zubereiten.',
        'Mit Pute und Gemüse in den Wrap füllen.',
        'Aufrollen.'
      ],
      why: 'Gut vorzubereiten für unterwegs, viel Eiweiß, hält lange satt.'
    },
    {
      id: 'haehnchen-gemuesepfanne',
      title: 'Hähnchen-Gemüsepfanne',
      meal: 'mittag',
      time: '20 Min',
      kcal: 420,
      macros: { protein: 42, carbs: 14, fat: 18, fiber: 5 },
      ingredients: [
        '200 g Hähnchenbrust',
        'gemischtes Gemüse (Paprika, Zucchini, Brokkoli)',
        'Sojasauce',
        'Knoblauch, Öl'
      ],
      steps: [
        'Hähnchen in Stücke schneiden und anbraten.',
        'Gemüse dazugeben und mitbraten.',
        'Mit Sojasauce und Knoblauch würzen.'
      ],
      why: 'Viel Eiweiß + Gemüse, wenig Kohlenhydrate.'
    },
    {
      id: 'quinoa-bowl-lachs',
      title: 'Quinoa-Bowl mit Lachs',
      meal: 'mittag',
      time: '20 Min',
      kcal: 520,
      macros: { protein: 34, carbs: 40, fat: 22, fiber: 6 },
      ingredients: ['100 g Quinoa', '150 g Lachs', 'Brokkoli oder Edamame', 'Sojasauce'],
      steps: [
        'Quinoa nach Packungsanweisung kochen.',
        'Lachs braten oder backen.',
        'Gemüse dazugeben, alles in einer Bowl anrichten.'
      ],
      why: 'Omega-3 + vollwertige Kohlenhydrate.'
    },
    {
      id: 'wrap-pute-gemuese',
      title: 'Vollkornwrap mit Pute und Gemüse',
      meal: 'mittag',
      time: '10 Min',
      kcal: 380,
      macros: { protein: 28, carbs: 34, fat: 14, fiber: 6 },
      ingredients: ['1 Vollkorn-Wrap', 'Putenbrust', 'Salat, Tomate, Gurke', 'Joghurt-Dressing'],
      steps: ['Zutaten auf den Wrap legen.', 'Fest aufrollen.'],
      why: 'Schnell, eiweißreich, gut für unterwegs.'
    },
    {
      id: 'nudelsalat-thunfisch',
      title: 'Nudelsalat mit Thunfisch',
      meal: 'mittag',
      time: '15 Min',
      kcal: 520,
      macros: { protein: 32, carbs: 60, fat: 14, fiber: 6 },
      ingredients: ['Vollkornnudeln', 'Thunfisch im eigenen Saft', 'Mais', 'Paprika', 'Frühlingszwiebel', 'leichtes Joghurt-Dressing'],
      steps: [
        'Nudeln kochen und abkühlen lassen.',
        'Mit restlichen Zutaten mischen.'
      ],
      why: 'Gut vorzubereiten für mehrere Tage, viel Eiweiß durch Thunfisch.'
    },
    {
      id: 'gebratener-reis-ei',
      title: 'Gebratener Reis mit Ei und Gemüse',
      meal: 'mittag',
      time: '15 Min',
      kcal: 500,
      macros: { protein: 20, carbs: 65, fat: 16, fiber: 4 },
      ingredients: ['Reis (am besten vom Vortag)', '1–2 Eier', 'Erbsen-Karotten-Mix oder Paprika/Zucchini', 'Sojasauce', 'Frühlingszwiebel'],
      steps: [
        'Gemüse anbraten.',
        'Reis dazugeben.',
        'In der Mitte Platz machen und Ei einrühren.',
        'Mit Sojasauce abschmecken.'
      ],
      why: 'Klassisches Resteessen, schnell gemacht und gut sättigend.'
    },
    {
      id: 'pasta-haehnchen-brokkoli',
      title: 'Pasta mit Hähnchen und Brokkoli in leichter Sauce',
      meal: 'mittag',
      time: '20 Min',
      kcal: 580,
      macros: { protein: 38, carbs: 60, fat: 18, fiber: 6 },
      ingredients: ['Vollkorn- oder normale Nudeln', 'Hähnchenbrust', 'Brokkoli', 'etwas Sahne oder fettarmer Frischkäse', 'Knoblauch'],
      steps: [
        'Hähnchen anbraten.',
        'Brokkoli dazugeben.',
        'Mit Sahne/Frischkäse und etwas Nudelwasser zu einer Sauce binden.',
        'Unter die Nudeln heben.'
      ],
      why: 'Klassisches Pasta-Gericht, durch mageres Hähnchen gut ausbalanciert.'
    },
    {
      id: 'lachs-brokkoli',
      title: 'Gebackener Lachs mit Brokkoli',
      meal: 'abend',
      time: '25 Min',
      kcal: 430,
      macros: { protein: 36, carbs: 10, fat: 26, fiber: 4 },
      ingredients: ['150 g Lachs', 'Brokkoli', 'Zitrone', 'Olivenöl, Salz, Pfeffer'],
      steps: [
        'Alles auf ein Blech geben.',
        'Bei 200 °C ca. 15–20 Min backen.',
        'Mit Zitrone beträufeln.'
      ],
      why: 'Wenig Aufwand, viel Eiweiß & gute Fette.'
    },
    {
      id: 'zucchini-nudeln-hack',
      title: 'Zucchini-Nudeln mit Hackfleischsauce',
      meal: 'abend',
      time: '20 Min',
      kcal: 400,
      macros: { protein: 32, carbs: 16, fat: 22, fiber: 5 },
      ingredients: ['2 Zucchini (spiralisiert)', '200 g mageres Hackfleisch', 'Tomatensauce', 'Zwiebel, Knoblauch'],
      steps: [
        'Hackfleisch mit Zwiebel und Knoblauch anbraten.',
        'Tomatensauce dazugeben und köcheln lassen.',
        'Zucchini-Nudeln unterheben.'
      ],
      why: 'Kohlenhydratreduzierte Pasta-Alternative.'
    },
    {
      id: 'ofengemuese-haehnchen',
      title: 'Ofengemüse mit Hähnchen',
      meal: 'abend',
      time: '30 Min',
      kcal: 410,
      macros: { protein: 38, carbs: 20, fat: 18, fiber: 6 },
      ingredients: ['Hähnchenbrust oder -schenkel', 'Ofengemüse (Karotten, Paprika, Zucchini)', 'Olivenöl, Kräuter'],
      steps: [
        'Alles auf ein Blech geben.',
        'Mit Öl und Kräutern würzen.',
        'Bei 200 °C ca. 25–30 Min backen.'
      ],
      why: 'Wenig Aufwand, viel Gemüse.'
    },
    {
      id: 'spaghetti-bolognese-leicht',
      title: 'Spaghetti Bolognese, leichte Variante',
      meal: 'abend',
      time: '25 Min',
      kcal: 600,
      macros: { protein: 35, carbs: 70, fat: 18, fiber: 7 },
      ingredients: ['Vollkorn- oder normale Spaghetti', 'mageres Rinderhack', 'Zwiebel, Knoblauch', 'Tomatensauce', 'Karotte fein gerieben'],
      steps: [
        'Hack mit Zwiebel und Knoblauch anbraten.',
        'Tomatensauce und Karotte dazugeben, köcheln lassen.',
        'Über die Nudeln geben.'
      ],
      why: 'Klassisches Gericht, durch mageres Hack und Vollkorn-Option leichter als die Fast-Food-Variante.'
    },
    {
      id: 'reispfanne-rind',
      title: 'Reispfanne mit Rindfleisch und Gemüse',
      meal: 'abend',
      time: '20 Min',
      kcal: 580,
      macros: { protein: 38, carbs: 60, fat: 18, fiber: 5 },
      ingredients: ['Naturreis oder Basmatireis', 'Rinderstreifen', 'Paprika, Zucchini', 'Sojasauce, Ingwer'],
      steps: [
        'Reis kochen.',
        'Rind scharf anbraten.',
        'Gemüse dazugeben, mit Sojasauce ablöschen.'
      ],
      why: 'Klassisch, sättigend, gut für aktive Tage.'
    },
    {
      id: 'schweinefilet-kartoffeln',
      title: 'Schweinefilet mit Kartoffeln und Gemüse',
      meal: 'abend',
      time: '30 Min',
      kcal: 620,
      macros: { protein: 42, carbs: 55, fat: 20, fiber: 7 },
      ingredients: ['Schweinefilet', 'Kartoffeln', 'Brokkoli oder grüne Bohnen', 'Kräuter, Olivenöl'],
      steps: [
        'Filet scharf anbraten und im Ofen fertig garen.',
        'Kartoffeln als Ofenkartoffeln oder gekocht dazu servieren.'
      ],
      why: 'Mageres Fleisch, klassische Beilagen, gut sättigend nach einem aktiven Tag.'
    },
    {
      id: 'putengeschnetzeltes-reis',
      title: 'Putengeschnetzeltes mit Reis',
      meal: 'abend',
      time: '20 Min',
      kcal: 550,
      macros: { protein: 40, carbs: 55, fat: 15, fiber: 3 },
      ingredients: ['Putenbrust in Streifen', 'Champignons, Zwiebel', 'etwas Sahne oder fettarme Crème fraîche', 'Reis'],
      steps: [
        'Pute scharf anbraten.',
        'Champignons und Zwiebel dazugeben.',
        'Mit etwas Sahne binden, mit Reis servieren.'
      ],
      why: 'Klassisches Wohlfühlessen mit magerem Geflügel.'
    },
    {
      id: 'haehnchenschnitzel-ofen',
      title: 'Hähnchenschnitzel aus dem Ofen mit Kartoffeln',
      meal: 'abend',
      time: '30 Min',
      kcal: 600,
      macros: { protein: 40, carbs: 60, fat: 18, fiber: 6 },
      ingredients: ['Hähnchenbrust', 'Vollkorn-Semmelbrösel', 'Kartoffeln', 'Salat'],
      steps: [
        'Hähnchen panieren.',
        'Auf Backpapier im Ofen bei 200 °C ca. 20 Min backen.',
        'Kartoffeln kochen oder als Ofenkartoffeln zubereiten.'
      ],
      why: 'Wie paniertes Schnitzel, aber aus dem Ofen statt frittiert — deutlich weniger Fett.'
    },
    {
      id: 'bratkartoffeln-spiegelei',
      title: 'Bratkartoffeln mit Spiegelei und Salat',
      meal: 'abend',
      time: '20 Min',
      kcal: 550,
      macros: { protein: 18, carbs: 55, fat: 28, fiber: 6 },
      ingredients: ['Kartoffeln (vom Vortag)', 'Zwiebel', 'Ei', 'Salat', 'Öl'],
      steps: [
        'Kartoffeln in Scheiben in der Pfanne knusprig braten.',
        'Zwiebel dazugeben.',
        'Spiegelei separat braten, mit Salat servieren.'
      ],
      why: 'Klassisches, deftiges Feierabendessen mit Salat als Ausgleich.'
    },
    {
      id: 'burger-vollkorn',
      title: 'Hausgemachter Burger mit Vollkornbrötchen',
      meal: 'abend',
      time: '25 Min',
      kcal: 650,
      macros: { protein: 38, carbs: 55, fat: 28, fiber: 7 },
      ingredients: ['mageres Rinderhack', 'Vollkorn-Burgerbrötchen', 'Salat, Tomate, Zwiebel', 'wenig Sauce'],
      steps: [
        'Patty formen und braten.',
        'Brötchen kurz toasten.',
        'Alles belegen.'
      ],
      why: 'Klassisches Wohlfühlessen — durch mageres Hack, Vollkornbrötchen und ohne Pommes deutlich ausgewogener als die Fast-Food-Variante, ohne dass es nach Diät schmeckt.'
    },
    {
      id: 'apfel-erdnussbutter',
      title: 'Apfel mit Erdnussbutter',
      meal: 'snack',
      time: '2 Min',
      kcal: 220,
      macros: { protein: 6, carbs: 22, fat: 12, fiber: 5 },
      ingredients: ['1 Apfel', '1 EL Erdnussbutter ohne Zuckerzusatz'],
      steps: ['Apfel in Spalten schneiden.', 'Mit Erdnussbutter servieren.'],
      why: 'Ballaststoffe + gute Fette.'
    },
    {
      id: 'gemuesesticks-hummus',
      title: 'Gemüsesticks mit Hummus',
      meal: 'snack',
      time: '5 Min',
      kcal: 180,
      macros: { protein: 7, carbs: 16, fat: 9, fiber: 6 },
      ingredients: ['Karotten, Gurke, Paprika', 'Hummus'],
      steps: ['Gemüse in Sticks schneiden.', 'Mit Hummus dippen.'],
      why: 'Kalorienarm, sättigend.'
    }
  ];

  window.MEAL_LABELS = {
    fruehstueck: 'Frühstück',
    mittag: 'Mittag',
    abend: 'Abend',
    snack: 'Snack'
  };
})();
