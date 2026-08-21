/* =========================================================================
   DATEN — Lebensmittel-Guide (Ampelsystem)
   status: 'go' | 'caution' | 'stop'
   ========================================================================= */

(function () {
  'use strict';

  window.FOOD_DATA = [
    {
      category: 'Gemüse',
      items: [
        { name: 'Brokkoli', status: 'go', note: 'Viele Ballaststoffe & Vitamin C, macht lange satt' },
        { name: 'Spinat', status: 'go', note: 'Eisenreich, sehr kalorienarm' },
        { name: 'Grünkohl', status: 'go', note: 'Nährstoffbombe, viele Antioxidantien' },
        { name: 'Paprika', status: 'go', note: 'Mehr Vitamin C als eine Zitrone' },
        { name: 'Tomaten', status: 'go', note: 'Kalorienarm, viel Lycopin' },
        { name: 'Gurke', status: 'go', note: 'Fast nur Wasser, perfekt zum Sattessen ohne Kalorien' },
        { name: 'Karotten', status: 'go', note: 'Ballaststoffreich, gut für Zwischendurch' },
        { name: 'Blumenkohl', status: 'go', note: 'Guter Reis-/Kartoffel-Ersatz mit wenig Kalorien' },
        { name: 'Kartoffeln', status: 'caution', note: 'Sättigend, aber stärkehaltig – Portion im Blick behalten' },
        { name: 'Mais', status: 'caution', note: 'Enthält mehr Zucker & Stärke als anderes Gemüse' },
        { name: 'Pommes / frittiertes Gemüse', status: 'stop', note: 'Frittiert = viel Fett & Kalorien, selten' },
        { name: 'Zucchini', status: 'go', note: 'Sehr kalorienarm, vielseitig einsetzbar' },
        { name: 'Auberginen', status: 'go', note: 'Ballaststoffreich, nimmt Aromen gut auf' },
        { name: 'Rosenkohl', status: 'go', note: 'Viel Vitamin C & Ballaststoffe' },
        { name: 'Lauch', status: 'go', note: 'Mild im Geschmack, gut für Saucen und Pfannengerichte' },
        { name: 'Sellerie', status: 'go', note: 'Sehr kalorienarm, gut zum Knabbern' },
        { name: 'Rote Bete', status: 'caution', note: 'Gesund, aber zuckerhaltiger als anderes Wurzelgemüse' }
      ]
    },
    {
      category: 'Obst',
      items: [
        { name: 'Blaubeeren', status: 'go', note: 'Wenig Zucker, viele Antioxidantien' },
        { name: 'Äpfel', status: 'go', note: 'Ballaststoffreich, gut sättigend' },
        { name: 'Grapefruit', status: 'go', note: 'Kalorienarm, viel Vitamin C' },
        { name: 'Banane', status: 'caution', note: 'Gute Energiequelle, aber zuckerreicher als Beeren' },
        { name: 'Weintrauben', status: 'caution', note: 'Leicht zu viel essen, viel Fruchtzucker' },
        { name: 'Trockenfrüchte', status: 'caution', note: 'Zucker stark konzentriert, kleine Portionen' },
        { name: 'Fruchtsaft', status: 'stop', note: 'Fast so viel Zucker wie Limonade, lieber ganze Frucht essen' },
        { name: 'Orange', status: 'go', note: 'Viel Vitamin C, gut sättigend durch Fruchtfleisch' },
        { name: 'Birne', status: 'go', note: 'Ballaststoffreich' },
        { name: 'Wassermelone', status: 'caution', note: 'Kalorienarm, aber wenig Sättigung wegen hohem Wasseranteil' },
        { name: 'Ananas', status: 'caution', note: 'Süßer als andere Früchte, in Maßen genießen' }
      ]
    },
    {
      category: 'Fleisch & Fisch',
      items: [
        { name: 'Hähnchenbrust', status: 'go', note: 'Viel Eiweiß, wenig Fett' },
        { name: 'Putenbrust', status: 'go', note: 'Mager & vielseitig' },
        { name: 'Lachs', status: 'go', note: 'Gute Omega-3-Fettsäuren' },
        { name: 'Kabeljau / Weißfisch', status: 'go', note: 'Sehr mager, viel Eiweiß' },
        { name: 'Eier', status: 'go', note: 'Günstige, komplette Eiweißquelle' },
        { name: 'Mageres Rindfleisch', status: 'caution', note: 'Gute Eiweißquelle, aber fettreicher als Geflügel' },
        { name: 'Speck / Wurst', status: 'stop', note: 'Viel Salz & verstecktes Fett' },
        { name: 'Paniertes / frittiertes Fleisch', status: 'stop', note: 'Panade zieht viel Öl, deutlich mehr Kalorien' },
        { name: 'Schweinefilet', status: 'go', note: 'Mageres Stück vom Schwein, ähnlich fettarm wie Rinderfilet' },
        { name: 'Rinderfilet / Rinderhüfte', status: 'go', note: 'Mageres Rindfleisch, viel Eiweiß' },
        { name: 'Hackfleisch gemischt (Schwein/Rind)', status: 'caution', note: 'Enthält mehr Fett als reines Rinder- oder Putenhack' },
        { name: 'Thunfisch (im eigenen Saft)', status: 'go', note: 'Praktisch, viel Eiweiß, wenig Fett' }
      ]
    },
    {
      category: 'Milchprodukte',
      items: [
        { name: 'Magerquark', status: 'go', note: 'Sehr viel Eiweiß, kaum Fett' },
        { name: 'Skyr / griechischer Joghurt', status: 'go', note: 'Sättigt gut, wenig Zucker' },
        { name: 'Hüttenkäse', status: 'go', note: 'Eiweißreich, vielseitig einsetzbar' },
        { name: 'Fettarme Milch', status: 'caution', note: 'In Maßen okay, auf Zusatz von Zucker achten' },
        { name: 'Fruchtjoghurt (gezuckert)', status: 'stop', note: 'Oft so süß wie Nachtisch' },
        { name: 'Sahne / Eis', status: 'stop', note: 'Viel Fett & Zucker, seltener Genuss' }
      ]
    },
    {
      category: 'Getreide & Kohlenhydrate',
      items: [
        { name: 'Vollkornbrot', status: 'go', note: 'Mehr Ballaststoffe, hält länger satt als Weißbrot' },
        { name: 'Haferflocken', status: 'go', note: 'Langsame Kohlenhydrate, super Frühstück' },
        { name: 'Quinoa / Naturreis', status: 'go', note: 'Vollwertige Kohlenhydrate mit Ballaststoffen' },
        { name: 'Weißbrot / weißer Reis', status: 'caution', note: 'Sättigt kürzer, Blutzucker steigt schneller' },
        { name: 'Nudeln (weiß)', status: 'caution', note: 'In Maßen okay, Vollkorn-Variante bevorzugen' },
        { name: 'Kuchen / Gebäck', status: 'stop', note: 'Viel Zucker & Fett, für besondere Anlässe' },
        { name: 'Vollkornnudeln', status: 'go', note: 'Mehr Ballaststoffe als normale Nudeln, gleiche Sättigung' },
        { name: 'Basmatireis', status: 'caution', note: 'Wie weißer Reis, in normaler Portion okay' },
        { name: 'Couscous', status: 'caution', note: 'Schnelle Beilage, wenig Ballaststoffe' }
      ]
    },
    {
      category: 'Snacks',
      items: [
        { name: 'Nüsse (ungesalzen)', status: 'go', note: 'Gute Fette, aber kalorienreich – Handvoll reicht' },
        { name: 'Gemüsesticks', status: 'go', note: 'Knackig, kalorienarm, gut zum Snacken' },
        { name: 'Dunkle Schokolade >70%', status: 'caution', note: 'In kleinen Mengen okay, weniger Zucker als Vollmilch' },
        { name: 'Popcorn (ungesüßt)', status: 'caution', note: 'Ballaststoffreich, aber auf die Menge achten' },
        { name: 'Chips', status: 'stop', note: 'Viel Fett & Salz, macht schnell zu viel' },
        { name: 'Kekse / Schokoriegel', status: 'stop', note: 'Viel Zucker, wenig Sättigung' },
        { name: 'Studentenfutter (ungesalzen)', status: 'caution', note: 'Enthält Trockenfrüchte, kalorienreicher als reine Nüsse' },
        { name: 'Proteinriegel', status: 'caution', note: 'Je nach Sorte stark unterschiedlich, Zuckergehalt prüfen' }
      ]
    },
    {
      category: 'Getränke',
      items: [
        { name: 'Wasser', status: 'go', note: 'Die beste Wahl, keine Kalorien' },
        { name: 'Ungesüßter Tee', status: 'go', note: 'Kalorienfrei, viele Sorten' },
        { name: 'Schwarzer Kaffee', status: 'go', note: 'Kalorienarm, kann Stoffwechsel leicht ankurbeln' },
        { name: 'Kaffee mit Milch', status: 'caution', note: 'Okay in Maßen, Zucker im Blick behalten' },
        { name: 'Light-Getränke', status: 'caution', note: 'Kalorienarm, aber in Maßen wegen Süßstoffen' },
        { name: 'Limonade / Energydrinks', status: 'stop', note: 'Viel Zucker, liefert schnell viele Kalorien ohne Sättigung' },
        { name: 'Isotonisches Sportgetränk', status: 'caution', note: 'Sinnvoll bei langen, intensiven Trainingseinheiten (>60 Min) wegen Elektrolyten, sonst eher Wasser' },
        { name: 'Kokoswasser (ungesüßt)', status: 'go', note: 'Elektrolyte, wenig Kalorien' }
      ]
    },
    {
      category: 'Fette & Öle',
      items: [
        { name: 'Olivenöl', status: 'go', note: 'Gesunde Fette, sparsam dosieren' },
        { name: 'Avocado', status: 'go', note: 'Gute Fette + Ballaststoffe' },
        { name: 'Butter', status: 'caution', note: 'In Maßen okay, gesättigtes Fett im Blick behalten' },
        { name: 'Frittierfett / Fast-Food-Fett', status: 'stop', note: 'Oft Transfette, möglichst meiden' },
        { name: 'Rapsöl', status: 'go', note: 'Gutes Fettsäureverhältnis, vielseitig' },
        { name: 'Kokosöl', status: 'caution', note: 'Viel gesättigtes Fett, in Maßen' }
      ]
    }
  ];
})();
