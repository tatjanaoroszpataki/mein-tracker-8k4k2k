/* =========================================================================
   DATEN — Bewegung: Alltags-Mini-Übungen + 30-Minuten-Workout
   pose bezieht sich auf StickFigure.poses (js/icons.js)
   ========================================================================= */

(function () {
  'use strict';

  // Kurze, an Alltagsroutinen gekoppelte Übungen — jede hat eine feste ID,
  // damit der "heute erledigt"-Status pro Tag in localStorage gespeichert
  // werden kann.
  window.MINI_EXERCISES = [
    {
      id: 'mini-wadenheben',
      trigger: 'Beim Zähneputzen (morgens)',
      name: 'Wadenheben',
      dose: '60 Sekunden',
      pose: 'calfRaise',
      instructions: 'Gerade hinstellen, Fersen langsam vom Boden abheben und senken, bei Bedarf am Waschbecken abstützen.'
    },
    {
      id: 'mini-kniebeugen',
      trigger: 'Während der Kaffee kocht',
      name: 'Kniebeugen an der Küchenzeile',
      dose: '10–15 Wiederholungen',
      pose: 'squat',
      instructions: 'Füße hüftbreit, Rücken gerade, in die Hocke gehen wie auf einen Stuhl setzen, wieder hochdrücken.'
    },
    {
      id: 'mini-liegestuetz',
      trigger: 'Während das Nudelwasser kocht',
      name: 'Liegestütz an der Küchenzeile',
      dose: '10 Wiederholungen',
      pose: 'pushUp',
      instructions: 'Hände schulterbreit auf die Küchenzeile stützen, Körper gerade halten, Arme beugen und strecken.'
    },
    {
      id: 'mini-wandsitz',
      trigger: 'Während die Mikrowelle läuft',
      name: 'Wandsitz',
      dose: '30 Sekunden',
      pose: 'wallSit',
      instructions: 'Rücken an die Wand, in die Hocke bis die Oberschenkel parallel zum Boden sind, Position halten.'
    },
    {
      id: 'mini-ausfallschritte',
      trigger: 'Beim Telefonieren (im Stehen)',
      name: 'Ausfallschritte',
      dose: '10 pro Bein',
      pose: 'lunge',
      instructions: 'Großer Schritt nach vorne, beide Knie auf 90 Grad beugen, zurückdrücken, Seite wechseln.'
    },
    {
      id: 'mini-bauch-anspannen',
      trigger: 'Beim Zähneputzen (abends)',
      name: 'Bauch anspannen',
      dose: '60 Sekunden',
      pose: 'bellyBrace',
      instructions: 'Bauchmuskeln bewusst anspannen und halten, dabei normal weiteratmen.'
    },
    {
      id: 'mini-zehenstand',
      trigger: 'Beim Warten (Bus, Bahn, Aufzug)',
      name: 'Zehenstand & Fersenheben',
      dose: '20 Wiederholungen',
      pose: 'calfRaise',
      instructions: 'Abwechselnd auf die Zehenspitzen und auf die Fersen stellen.'
    },
    {
      id: 'mini-situps',
      trigger: 'In der Werbepause',
      name: 'Sit-ups',
      dose: '10–15 Wiederholungen',
      pose: 'situp',
      instructions: 'Auf den Rücken legen, Knie angewinkelt, Oberkörper Richtung Knie aufrollen und wieder ablegen.'
    }
  ];

  // Trainingsübungen, nach Körperpartie sortiert — jede Kategorie hat
  // mindestens 5 Übungen, aus denen sich ein eigenes Workout
  // zusammenstellen lässt (siehe js/views/movement.js).
  window.WORKOUT_CATEGORIES = [
    {
      id: 'aufwaermen',
      title: 'Aufwärmen / Cardio',
      exercises: [
        { id: 'w-hampelmann', name: 'Hampelmänner', dose: '40 Sekunden', pose: 'jumpingJack', instructions: 'Gleichzeitig Arme über den Kopf und Beine seitlich öffnen und wieder schließen.' },
        { id: 'w-kniehebelauf', name: 'Kniehebelauf', dose: '40 Sekunden', pose: 'highKnee', instructions: 'Auf der Stelle laufen und die Knie dabei bewusst hoch zur Hüfte ziehen.' },
        { id: 'w-armkreisen', name: 'Armkreisen', dose: '30 Sekunden', pose: 'armCircle', instructions: 'Arme gestreckt in großen, langsamen Kreisen nach vorne und hinten kreisen.' },
        { id: 'w-mountain-climbers', name: 'Mountain Climbers', dose: '40 Sekunden', pose: 'mountainClimber', instructions: 'Im Liegestütz die Knie abwechselnd schnell Richtung Brust ziehen, Körper dabei stabil und gerade halten.' },
        { id: 'w-seilspringen', name: 'Seilspringen ohne Seil', dose: '40 Sekunden', pose: 'jumpRope', instructions: 'Wie Seilspringen, aber ohne Seil — auf der Stelle hüpfen und dabei die Handgelenke kreisen, als würde man ein Seil schwingen.' }
      ]
    },
    {
      id: 'oberkoerper',
      title: 'Oberkörper',
      exercises: [
        { id: 'w-liegestuetze', name: 'Liegestütze', dose: '3 × 10', pose: 'pushUp', instructions: 'Hände schulterbreit, Körper gerade, Arme beugen und strecken. Bei Bedarf auf den Knien.' },
        { id: 'w-dips', name: 'Trizeps-Dips am Stuhl', dose: '3 × 10', pose: 'dip', instructions: 'Hände auf der Stuhlkante, Beine gestreckt nach vorne, Arme beugen und den Körper absenken und heben.' },
        { id: 'w-diamond-pushups', name: 'Diamond Push-ups (enger Liegestütz)', dose: '3 × 8', pose: 'pushUp', instructions: 'Hände enger als schulterbreit zusammen, Daumen und Zeigefinger bilden eine Raute, Liegestütz wie gewohnt ausführen — stärkerer Fokus auf die Trizeps. Für Einsteiger an der Wand oder Küchenzeile statt am Boden.' },
        { id: 'w-schulterdruecken', name: 'Schulterdrücken mit Wasserflaschen', dose: '3 × 12', pose: 'shoulderPress', instructions: 'Zwei gefüllte Wasserflaschen als Gewicht, im Stehen von Schulterhöhe nach oben drücken und kontrolliert absenken.' },
        { id: 'w-seitheben', name: 'Seitliches Heben mit Wasserflaschen', dose: '3 × 12', pose: 'lateralRaise', instructions: 'Wasserflaschen seitlich bis auf Schulterhöhe anheben, langsam absenken.' }
      ]
    },
    {
      id: 'ruecken',
      title: 'Rücken',
      exercises: [
        { id: 'w-superman', name: 'Superman', dose: '3 × 12', pose: 'superman', instructions: 'Bäuchlings liegen, Arme nach vorne gestreckt, gleichzeitig Arme, Brust und Beine leicht vom Boden abheben und kurz halten.' },
        { id: 'w-schwimmer', name: 'Rückenstrecker im Liegen (Schwimmer)', dose: '3 × 10 pro Seite', pose: 'superman', instructions: 'Bäuchlings liegen, abwechselnd gegenüberliegenden Arm und gegenüberliegendes Bein leicht anheben, wie beim Schwimmen.' },
        { id: 'w-snow-angels', name: 'Reverse Snow Angels', dose: '3 × 12', pose: 'snowAngel', instructions: 'Bäuchlings liegen, Arme seitlich am Boden, langsam über den Kopf führen und zurück wie beim Schneeengel-Machen, dabei den oberen Rücken aktiv halten.' },
        { id: 'w-rudern-flaschen', name: 'Vorgebeugtes Rudern mit Wasserflaschen', dose: '3 × 12', pose: 'bentRow', instructions: 'Leicht in die Knie gehen, Oberkörper nach vorne beugen, Wasserflaschen zur Hüfte ziehen, Schulterblätter dabei zusammenziehen.' },
        { id: 'w-katze-kuh', name: 'Katze-Kuh (Rückenmobilisation)', dose: '10 Wiederholungen', pose: 'catCow', instructions: 'Auf allen Vieren abwechselnd den Rücken rund machen (Katze) und ins Hohlkreuz gehen (Kuh), langsam und kontrolliert.' }
      ]
    },
    {
      id: 'bauch',
      title: 'Bauch / Core',
      exercises: [
        { id: 'w-plank', name: 'Unterarmstütz (Plank)', dose: '3 × 30 Sekunden', pose: 'plank', instructions: 'Auf den Unterarmen abstützen, Körper von Kopf bis Ferse in einer geraden Linie halten.' },
        { id: 'w-plank-schulterberuehrung', name: 'Plank mit Schulterberührung', dose: '3 × 20 Berührungen', pose: 'plank', instructions: 'Im Liegestütz-Stand abwechselnd mit einer Hand die gegenüberliegende Schulter berühren, Hüfte dabei ruhig und stabil halten.' },
        { id: 'w-crunches', name: 'Crunches', dose: '3 × 15', pose: 'situp', instructions: 'Rückenlage, Knie angewinkelt, Oberkörper leicht Richtung Knie einrollen, unterer Rücken bleibt am Boden.' },
        { id: 'w-beinheben', name: 'Beinheben im Liegen', dose: '3 × 12', pose: 'legRaise', instructions: 'Rückenlage, Beine gestreckt, langsam anheben und absenken, ohne den unteren Rücken durchzudrücken.' },
        { id: 'w-russian-twists', name: 'Russian Twists', dose: '3 × 16 (8 pro Seite)', pose: 'russianTwist', instructions: 'Im Sitzen leicht zurücklehnen, Oberkörper stabil halten, mit beiden Händen (optional mit Wasserflasche) von einer Seite zur anderen drehen.' }
      ]
    },
    {
      id: 'beine',
      title: 'Beine & Po',
      exercises: [
        { id: 'w-kniebeugen', name: 'Kniebeugen', dose: '3 × 15', pose: 'squat', instructions: 'Füße hüftbreit, Rücken gerade, in die Hocke gehen und wieder hochdrücken.' },
        { id: 'w-ausfallschritte', name: 'Ausfallschritte', dose: '3 × 10 pro Bein', pose: 'lunge', instructions: 'Großer Schritt nach vorne, beide Knie auf 90 Grad beugen, zurückdrücken, Seite wechseln.' },
        { id: 'w-wadenheben', name: 'Wadenheben', dose: '3 × 20', pose: 'calfRaise', instructions: 'Gerade hinstellen, Fersen heben und senken, kontrolliert bewegen.' },
        { id: 'w-glute-bridge', name: 'Glute Bridge', dose: '3 × 15', pose: 'gluteBridge', instructions: 'Rückenlage, Füße aufgestellt, Becken nach oben drücken, bis Schultern, Hüfte und Knie eine Linie bilden, oben kurz halten, absenken.' },
        { id: 'w-squat-to-lunge', name: 'Squat-to-Lunge', dose: '3 × 10 pro Bein', pose: 'lunge', instructions: 'Aus der Kniebeuge einen Schritt nach hinten in den Ausfallschritt setzen, zurück in die Kniebeuge, Seite wechseln.' }
      ]
    }
  ];

  // Die klassische feste 30-Minuten-Runde von vorher — bleibt als
  // Vorschlag/Standardauswahl erhalten, wenn noch keine eigene
  // Zusammenstellung gespeichert ist.
  window.DEFAULT_WORKOUT_IDS = [
    'w-hampelmann', 'w-kniehebelauf', 'w-armkreisen',
    'w-liegestuetze', 'w-dips', 'w-plank',
    'w-kniebeugen', 'w-ausfallschritte', 'w-wadenheben'
  ];
})();
