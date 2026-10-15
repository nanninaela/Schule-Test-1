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

# Kalkulationstrainer Einzelhandel (Handelskalkulation)

Online-Übung zur Vorwärtskalkulation für Verkäuferinnen und Verkäufer im 2. Ausbildungsjahr (NRW). Die Waren stammen aus den Ausbildungsbetrieben Lebensmittel (Frischemarkt Kortmann) und Bekleidung (Modehaus Brüggemann). Auf der Startseite wählt man Lebensmittel, Bekleidung oder Gemischt.

## Stufen

| Stufe | Inhalt | Aufgaben je Runde |
|---|---|---|
| 1 Einstieg | Bezugspreis → Handlungskosten → Gewinn → Umsatzsteuer, glatte Beträge, Rechenweg-Hilfe | 4 |
| 2 Einkauf | Listeneinkaufspreis → Rabatt → Skonto → Bezugskosten, Rechenweg-Hilfe | 4 |
| 3 Gesamt | komplette Vorwärtskalkulation bis zum Bruttoverkaufspreis | 3 |
| 4 Profi | Bezugskosten der Lieferung aufteilen, Steuersatz (7 %/19 %) selbst bestimmen, Schwellenpreis ,99 | 3 |

- Die Aufgaben werden bei jeder Runde mit neuen Zahlen erzeugt.
- Eine Stufe ist ab 80 % bestanden. Erst dann wird die nächste freigeschaltet.
- Folgefehler werden nicht doppelt bestraft.
- Die Auswertung zeigt jede Zeile mit Eingabe und richtigem Wert. Bei Fehlern steht ein Hinweis, was falsch gemacht wurde (z. B. falsche Bezugsgröße, falsches Rechenzeichen, im Hundert statt vom Hundert gerechnet, falscher Steuersatz, Komma verrutscht, Lieferungskosten nicht aufgeteilt). Darüber steht „Das solltest du üben“ mit Erklärung und Beispiel.
- Der Fortschritt wird nur im Browser des Geräts gespeichert.
- **Für die Lehrkraft:** Mit `#lehrkraft` am Ende des Links sind alle Stufen offen.

## Dateien

- `handelskalkulation/kalkulation.html`: die App (Quelle, Claude-Artifact)
- `handelskalkulation/index.html`: eigenständige Version, erzeugt mit `./build.sh`
