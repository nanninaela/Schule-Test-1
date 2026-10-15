# Verkaufstraining Einzelhandel

Interaktive Übungs-App für Verkaufsgespräche im Einzelhandel. Die Schülerinnen und Schüler führen ein komplettes Gespräch in den acht Phasen:

1. Kontaktaufnahme
2. Bedarfsermittlung
3. Warenvorlage
4. Verkaufsargumentation
5. Preisnennung
6. Einwandbehandlung
7. Ergänzungsangebot
8. Abschluss und Verabschiedung

In jeder Phase gibt es drei Antworten (gut, mittel, ungünstig) in zufälliger Reihenfolge. Die Kundschaft reagiert, ein Stimmungsbalken zeigt die Laune, und bei zu schlechter Stimmung verlässt sie den Laden. Am Ende gibt es einen Kassenbon mit Punkten, Umsatz und Note.

## Szenarien

| Szenario | Kundentyp | Produkt | Schwierigkeit |
|---|---|---|---|
| Laufschuhe für die Einsteigerin | Einsteigerin | Laufschuhe | leicht |
| Das erste Smartphone | Älterer Kunde (78) | Smartphone | mittel |
| Regenjacke um 19:52 Uhr | Kurz vor Ladenschluss | Regenjacke | mittel |
| Ein Duft für Mama | Unentschlossene Kundin | Parfum (Geschenk) | mittel |
| Der Testsieger-Kenner | Schwieriger Kunde (Besserwisser) | Kaffeevollautomat | schwer |

## Kundenfiguren

Jedes Szenario hat eine eigene gezeichnete Figur. Sie blinzelt, atmet und zeigt ihre Stimmung im Gesicht. Beim Antworten bewegt sie den Mund und liest ihren Text mit der deutschen Sprachausgabe des Geräts vor. Stimmhöhe und Tempo passen zur Person: Herr Albers spricht langsam, Herr Yilmaz hastig. Der Lautsprecher-Knopf schaltet den Ton aus, dann bewegt sich nur der Mund. Verlässt die Kundschaft verärgert den Laden, geht die Figur aus dem Bild.

## Modi

- **Übung:** Feedback mit Fachbegriff nach jeder Antwort.
- **Prüfung:** Feedback erst in der Auswertung.

Die Bestwerte pro Szenario werden nur im Browser der jeweiligen Person gespeichert.

## Dateien

- `verkaufsgespraech.html`: die App (Quelle, wird als Claude-Artifact veröffentlicht)
- `index.html`: eigenständige Version zum Öffnen im Browser oder für GitHub Pages, erzeugt mit `./build.sh`

## Auf die iPads bringen (AirDrop, ohne Apple-Konto)

- **Empfohlen: den Link per AirDrop teilen.** Ein per AirDrop empfangener Link öffnet sich direkt in Safari. Dafür braucht es weder ein Apple-Konto noch den App Store, nur Internet.
- **Die Datei `index.html` per AirDrop teilen:** Sie landet in der Dateien-App. Deren Vorschau führt oft kein JavaScript aus. Dann erscheint ein Hinweis, die Übung über den Link zu öffnen. Vorher an einem Schüler-iPad testen.

## Präsentation zur Vorbereitung

`praesentation/Verkaufsgespraech_Vorbereitung.pptx` (15 Folien) bereitet die Klasse auf die Übungen vor. Sie enthält Lernziele, die 8 Phasen mit Methoden und Beispielen aus den Szenarien, die Kundentypen, eine Anleitung zur App und einen Arbeitsauftrag. Die Sprechernotizen enthalten Hinweise für die Lehrkraft. Erzeugt wird sie mit `praesentation/build-deck.js`.

`praesentation/Einfuehrung_Phase1_Kontaktaufnahme.pptx` (10 Folien) ist eine kürzere Stunde zur allgemeinen Einführung und zur Phase 1 (Kontaktaufnahme). Am Ende steht eine Partnerarbeit über den letzten eigenen Einkauf. Erzeugt wird sie mit `praesentation/build-deck-phase1.js`.

## Neue Szenarien ergänzen

Szenarien stehen im Array `SCENARIOS` in `verkaufsgespraech.html`. Jedes Szenario braucht 8 Schritte in der Reihenfolge der Phasen. Jeder Schritt hat drei Antworten mit `s` = 2, 1 und 0 Punkten. Danach `./build.sh` ausführen.

## Übung: Wenn-dann-Sätze (Deutsch A2)

`wenn-dann.html` ist eine Übungsseite für Smartphones (Internationale Förderklasse, Niveau A2). 15 Sätze, von leicht nach schwer:

- **1 bis 5 (leicht):** das fehlende Wort einsetzen
- **6 bis 10 (mittel):** den richtigen Dann-Teil auswählen (Wortstellung und Bedeutung)
- **11 bis 15 (schwer):** alle Wörter eines Wenn-dann-Satzes in die richtige Reihenfolge bringen (mit Komma, Modalverben, trennbarem Verb)

Jede Aufgabe hat einen Tipp und zwei Versuche (2 Punkte beim ersten, 1 Punkt beim zweiten Versuch). Richtige Sätze werden vorgelesen. Am Ende gibt es eine Übersicht aller Sätze.

**QR-Code:** `wenn-dann-qr.png` (zum Drucken) und `wenn-dann-qr.html` (zum Zeigen am Beamer). Er führt zu `https://nanninaela.github.io/Schule-Test-1/wenn-dann.html`. Dafür muss GitHub Pages eingeschaltet sein: im Repository unter **Settings → Pages → Build and deployment** „Deploy from a branch“ wählen, den Branch mit der Datei auswählen, Ordner `/ (root)`, speichern.
