// Baut die Vorbereitungs-Präsentation zum Verkaufstraining.
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const sharp = require("sharp");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const fa = require("react-icons/fa");
const { applyTheme } = require(process.env.SKILL + "/scripts/apply_theme.js");

const OUT = process.argv[2];
const APP = fs.readFileSync(process.argv[3], "utf8");

// ---------- Figuren aus der App übernehmen ----------
const fnSrc = APP.slice(APP.indexOf("  function figureSVG(look, cls) {"), APP.indexOf("  function figureMood("));
const figureSVG = new Function(fnSrc + "; return figureSVG;")();
const looks = {};
for (const id of ["Frau Becker", "Herr Albers", "Herr Yilmaz", "Herr Brenner", "Lea"]) {
  const i = APP.indexOf('who: "' + id + '",');
  const line = APP.slice(i).split("\n")[1].trim().replace(/^look:\s*/, "").replace(/,$/, "");
  looks[id] = new Function("return " + line)();
}
async function figurePng(who) {
  let svg = figureSVG(looks[who], "")
    .replace("class='bg'", "fill='#E3E9F8'")
    .replace(/<ellipse class='mouth-open'[^>]*\/>/, "")
    .replace("d='M52 69 q8 6 16 0'", "d='M51 68 q9 8 18 0'");
  const buf = await sharp(Buffer.from(svg)).resize(400, 400).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
async function icon(Comp, hex) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + hex, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ---------- Theme ----------
const THEME = {
  name: "Verkaufstraining",
  headFontFace: "Century Schoolbook",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "18202B", lt1: "FFFFFF", dk2: "1B2A4E", lt2: "F2F4F6",
    accent1: "2346A0", accent2: "1D7A4C", accent3: "B5352A", accent4: "9A6400",
    accent5: "E3E9F8", accent6: "5B6676", hlink: "2346A0", folHlink: "5B6676"
  }
};
const HEX = { ink: "18202B", navy: "1B2A4E", accent: "2346A0", good: "1D7A4C", bad: "B5352A", ok: "9A6400", soft: "E3E9F8", muted: "5B6676", paper: "F2F4F6", white: "FFFFFF" };

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
  pres.title = "Das Verkaufsgespräch";
  pres.author = "Verkaufstraining Einzelhandel";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  const W = 13.333, M = 0.6;

  // ---------- Layouts ----------
  pres.defineSlideMaster({
    title: "Titel dunkel",
    background: { color: C.text2 },
    objects: [
      { placeholder: { options: { name: "kicker", type: "body", x: M, y: 1.5, w: 7.6, h: 0.45, fontSize: 14, bold: true, color: C.accent5, charSpacing: 3, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: M, y: 2.05, w: 7.6, h: 2.2, fontSize: 44, bold: true, color: C.background1, valign: "top", align: "left", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: M, y: 4.4, w: 7.2, h: 1.6, fontSize: 18, color: C.accent5, valign: "top", align: "left", margin: 0 }, text: "" } }
    ]
  });
  pres.defineSlideMaster({
    title: "Inhalt",
    background: { color: C.background2 },
    objects: [
      { placeholder: { options: { name: "kicker", type: "body", x: M, y: 0.4, w: 9, h: 0.35, fontSize: 12, bold: true, color: C.accent1, charSpacing: 3, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: M, y: 0.75, w: 12.1, h: 0.8, fontSize: 34, bold: true, color: C.text1, valign: "top", align: "left", margin: 0 }, text: "" } },
      { text: { text: "Verkaufstraining Einzelhandel", options: { x: M, y: 7.0, w: 6, h: 0.3, fontSize: 10, color: C.accent6, margin: 0 } } }
    ],
    slideNumber: { x: 12.1, y: 7.0, w: 0.6, h: 0.3, fontSize: 10, color: C.accent6, align: "right" }
  });

  // ---------- Hilfen ----------
  const shadow = () => ({ type: "outer", color: "18202B", opacity: 0.12, blur: 8, offset: 2, angle: 90 });
  function card(s, x, y, w, h, opts = {}) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w, h, rectRadius: 0.12, fill: { color: opts.fill || C.background1 },
      line: opts.line ? { color: opts.line, width: 1.25 } : { type: "none" },
      shadow: opts.noShadow ? undefined : shadow(), objectName: opts.name || "Karte"
    });
  }
  function txt(s, text, o) { s.addText(text, Object.assign({ isTextBox: true, margin: 0, valign: "top", fontSize: 15, color: C.text1 }, o)); }
  function pill(s, text, x, y, color, w = 1.3) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.32, rectRadius: 0.16, fill: { color }, line: { type: "none" }, objectName: "Etikett" });
    txt(s, text, { x, y, w, h: 0.32, fontSize: 11, bold: true, color: C.background1, align: "center", valign: "middle" });
  }
  async function iconCircle(s, Comp, x, y, d = 0.62, bg = C.accent5, fg = HEX.accent) {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: bg }, line: { type: "none" }, objectName: "Symbolkreis" });
    const p = d * 0.22;
    s.addImage({ data: await icon(Comp, fg), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, altText: "Symbol" });
  }
  // Fortschritt: 8 Punkte, aktuelle Phase hervorgehoben (Ablauf ist echte Reihenfolge)
  function phaseDots(s, n) {
    for (let i = 0; i < 8; i++) {
      s.addShape(pres.shapes.OVAL, {
        x: 10.55 + i * 0.27, y: 0.47, w: 0.17, h: 0.17,
        fill: { color: i < n ? C.accent1 : "D9DEE5" }, line: { type: "none" }, objectName: "Phasenpunkt"
      });
    }
  }
  function content(section, kicker, title, phase) {
    const s = pres.addSlide({ masterName: "Inhalt", sectionTitle: section });
    s.addText(kicker, { placeholder: "kicker" });
    s.addText(title, { placeholder: "title" });
    if (phase) phaseDots(s, phase);
    return s;
  }
  async function iconRows(s, rows, x, y, w, gap = 1.15) {
    for (let i = 0; i < rows.length; i++) {
      const [Comp, head, body] = rows[i];
      const yy = y + i * gap;
      await iconCircle(s, Comp, x, yy);
      txt(s, head, { x: x + 0.85, y: yy, w: w - 0.85, h: 0.36, fontSize: 17, bold: true });
      txt(s, body, { x: x + 0.85, y: yy + 0.38, w: w - 0.85, h: 0.62, fontSize: 14, color: C.accent6 });
    }
  }
  function quote(s, label, color, said, reply, x, y, w, h) {
    card(s, x, y, w, h);
    pill(s, label, x + 0.3, y + 0.28, color, 1.5);
    txt(s, said, { x: x + 0.3, y: y + 0.75, w: w - 0.6, h: 0.9, fontSize: 17, bold: true, italic: true });
    if (reply) txt(s, reply, { x: x + 0.3, y: y + 1.65, w: w - 0.6, h: h - 1.85, fontSize: 14, color: C.accent6 });
  }

  // ===== 1 Titel =====
  pres.addSection({ title: "Einstieg" });
  let s = pres.addSlide({ masterName: "Titel dunkel", sectionTitle: "Einstieg" });
  s.addText("VORBEREITUNG AUF DAS VERKAUFSTRAINING", { placeholder: "kicker" });
  s.addText("Das Verkaufsgespräch in 8 Phasen", { placeholder: "title" });
  s.addText("Methoden, Formulierungen und Kundentypen für die Übungen im Sporthaus, Elektromarkt, Modehaus, in der Küchenwelt und in der Parfümerie", { placeholder: "body" });
  const names = ["Frau Becker", "Herr Albers", "Herr Yilmaz", "Herr Brenner", "Lea"];
  const pos = [[8.9, 1.2], [10.9, 1.9], [8.6, 3.3], [10.6, 4.0], [9.0, 5.25]];
  for (let i = 0; i < names.length; i++) {
    s.addImage({ data: await figurePng(names[i]), x: pos[i][0], y: pos[i][1], w: 1.9, h: 1.9, altText: "Kundenfigur " + names[i] });
  }
  s.addNotes("Einstieg: Fragen Sie die Klasse nach eigenen Erfahrungen als Kundin oder Kunde. Was macht ein gutes Verkaufsgespräch aus, was ein schlechtes? Die fünf Figuren sind die Kundinnen und Kunden aus der Übungs-App.");

  // ===== 2 Lernziele =====
  s = content("Einstieg", "WORUM ES GEHT", "Nach dieser Stunde können Sie …");
  await iconRows(s, [
    [fa.FaListOl, "die 8 Phasen eines Verkaufsgesprächs benennen", "Von der Kontaktaufnahme bis zur Verabschiedung, in der richtigen Reihenfolge."],
    [fa.FaComments, "passende Fragetechniken und Argumente einsetzen", "Offene Fragen, Eigenschaft → Vorteil → Nutzen, Sie-Stil, Sandwich-Methode."],
    [fa.FaShieldAlt, "Einwände souverän behandeln", "Mit der Ja-aber-Methode und weiteren Techniken, ohne zu widersprechen."],
    [fa.FaUsers, "sich auf verschiedene Kundentypen einstellen", "Ältere Kunden, Zeitdruck, Besserwisser und Unentschlossene."]
  ], M, 1.85, 7.4, 1.2);
  card(s, 8.6, 1.85, 4.13, 4.75, { fill: C.text2 });
  txt(s, "Danach", { x: 8.95, y: 2.15, w: 3.5, h: 0.4, fontSize: 14, bold: true, color: C.accent5, charSpacing: 2 });
  txt(s, "üben Sie alles in der App mit fünf Kundinnen und Kunden, die auf Ihre Antworten reagieren.", { x: 8.95, y: 2.6, w: 3.5, h: 1.9, fontSize: 20, color: C.background1, fontFace: THEME.headFontFace });
  s.addImage({ data: await figurePng("Herr Albers"), x: 9.85, y: 4.55, w: 1.75, h: 1.75, altText: "Kundenfigur Herr Albers" });
  s.addNotes("Lernziele kurz vorlesen. Die App ist die Übungsphase im Anschluss, die Präsentation liefert das Handwerkszeug dafür.");

  // ===== 3 Überblick 8 Phasen =====
  pres.addSection({ title: "Die 8 Phasen" });
  s = content("Die 8 Phasen", "ÜBERBLICK", "Ein Verkaufsgespräch hat einen festen Ablauf");
  const phases = [
    ["Kontaktaufnahme", "Begrüßen, ansprechen"], ["Bedarfsermittlung", "Fragen, zuhören"],
    ["Warenvorlage", "Passendes zeigen"], ["Verkaufsargumentation", "Nutzen erklären"],
    ["Preisnennung", "Preis überzeugend nennen"], ["Einwandbehandlung", "Bedenken ausräumen"],
    ["Ergänzungsangebot", "Passendes dazu anbieten"], ["Abschluss & Verabschiedung", "Kauf bestätigen"]
  ];
  const cw = 2.8, cg = 0.3, ch = 2.15;
  phases.forEach(([h, b], i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = M + col * (cw + cg), y = 1.9 + row * (ch + 0.35);
    card(s, x, y, cw, ch);
    s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: y + 0.25, w: 0.62, h: 0.62, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Phasennummer" });
    txt(s, String(i + 1), { x: x + 0.25, y: y + 0.25, w: 0.62, h: 0.62, fontSize: 20, bold: true, color: C.background1, align: "center", valign: "middle", fontFace: THEME.headFontFace });
    txt(s, h, { x: x + 0.25, y: y + 0.98, w: cw - 0.4, h: 0.62, fontSize: 15, bold: true });
    txt(s, b, { x: x + 0.25, y: y + 1.66, w: cw - 0.5, h: 0.4, fontSize: 14, color: C.accent6 });
  });
  s.addNotes("Die Reihenfolge ist kein Zufall: Wer ohne Bedarfsermittlung Ware zeigt, verkauft am Bedarf vorbei. Der Fortschrittsbalken in der App zeigt dieselben acht Phasen.");

  // ===== 4 Kontaktaufnahme =====
  s = content("Die 8 Phasen", "PHASE 1 · KONTAKTAUFNAHME", "Der erste Eindruck entscheidet", 1);
  await iconRows(s, [
    [fa.FaWalking, "Hingehen statt rufen", "Gehen Sie auf die Kundschaft zu, halten Sie Blickkontakt und lächeln Sie."],
    [fa.FaHandshake, "Freundlich begrüßen", "„Guten Tag!“ – höflich, deutlich, in ganzen Sätzen."],
    [fa.FaTag, "Warenbezogen ansprechen", "An den Artikel anknüpfen, den die Kundin gerade in der Hand hält."]
  ], M, 1.9, 6.0, 1.45);
  quote(s, "Ungünstig", C.accent3, "„Kann ich Ihnen helfen?“", "Geschlossene Frage. Typische Antwort: „Nein danke, ich schaue nur.“", 7.0, 1.9, 5.73, 2.2);
  quote(s, "Besser", C.accent2, "„Das ist unser AeroRun. Laufen Sie eher auf der Straße oder im Gelände?“", "Knüpft an die Ware an und öffnet sofort ein Gespräch.", 7.0, 4.35, 5.73, 2.3);
  s.addNotes("Kurz im Rollenspiel vormachen lassen: Einmal „Kann ich helfen?“ und einmal warenbezogen. Wie reagiert die Kundin jeweils?");

  // ===== 5 Bedarfsermittlung =====
  s = content("Die 8 Phasen", "PHASE 2 · BEDARFSERMITTLUNG", "Wer fragt, der führt", 2);
  const qs = [
    ["Offene Fragen", "W-Fragen: Wie? Was? Wo? Wie oft?", "„Wie oft möchten Sie laufen, und auf welchem Untergrund?“", "Liefern viele Informationen", C.accent2],
    ["Alternativfragen", "Zwei Möglichkeiten zur Wahl", "„Brauchen Sie eher Regenschutz oder etwas Warmes?“", "Schnelle Klarheit, gut bei Zeitdruck", C.accent1],
    ["Geschlossene Fragen", "Antwort nur Ja oder Nein", "„Wollen Sie viel laufen?“", "Wenig Information, für den Einstieg ungeeignet", C.accent3]
  ];
  qs.forEach(([h, sub, ex, eff, col], i) => {
    const x = M + i * 4.13, w = 3.83;
    card(s, x, 1.9, w, 3.75);
    txt(s, h, { x: x + 0.3, y: 2.15, w: w - 0.6, h: 0.45, fontSize: 20, bold: true, color: col, fontFace: THEME.headFontFace });
    txt(s, sub, { x: x + 0.3, y: 2.62, w: w - 0.6, h: 0.4, fontSize: 14, color: C.accent6 });
    txt(s, ex, { x: x + 0.3, y: 3.15, w: w - 0.6, h: 1.4, fontSize: 16, italic: true });
    txt(s, eff, { x: x + 0.3, y: 4.75, w: w - 0.6, h: 0.7, fontSize: 14, bold: true, color: col });
  });
  await iconCircle(s, fa.FaAssistiveListeningSystems, M, 5.95, 0.6);
  txt(s, [{ text: "Aktiv zuhören: ", options: { bold: true } }, { text: "ausreden lassen, nachfragen, das Gehörte kurz zusammenfassen." }], { x: M + 0.8, y: 6.05, w: 11, h: 0.45, fontSize: 16 });
  s.addNotes("In der App merkt man das sofort: Bei offenen Fragen erzählt die Kundschaft von sich aus von Knieproblemen, Enkelin oder Gartenliebe. Diese Informationen braucht man später für die Argumentation.");

  // ===== 6 Warenvorlage =====
  s = content("Die 8 Phasen", "PHASE 3 · WARENVORLAGE", "Weniger zeigen, mehr erleben lassen", 3);
  card(s, M, 1.9, 4.0, 4.75, { fill: C.text2 });
  txt(s, "2–3", { x: M + 0.35, y: 2.3, w: 3.3, h: 1.5, fontSize: 80, bold: true, color: C.background1, fontFace: THEME.headFontFace });
  txt(s, "passende Artikel reichen. Mehr Auswahl überfordert, vor allem unentschlossene Kundschaft.", { x: M + 0.35, y: 3.95, w: 3.3, h: 1.6, fontSize: 17, color: C.accent5 });
  await iconRows(s, [
    [fa.FaBalanceScale, "Mittlere Preislage zuerst", "Nicht mit dem teuersten oder billigsten Artikel beginnen."],
    [fa.FaHandHolding, "Ware in die Hand geben", "Anfassen, anprobieren, riechen, schmecken: Alle Sinne überzeugen."],
    [fa.FaSlidersH, "Auf den Bedarf vorbereiten", "Beispiel: beim Smartphone für Herrn Albers schon die große Schrift einstellen."],
    [fa.FaTimesCircle, "Nicht am Bedarf vorbei", "Kein Wettkampfschuh für die Einsteigerin, keine Daunenjacke gegen Dauerregen."]
  ], 5.1, 1.9, 7.6, 1.2);
  s.addNotes("Bei Düften gilt: Nach drei bis vier Proben riecht die Nase kaum noch Unterschiede. Darum auch hier wenige Artikel.");

  // ===== 7 Argumentation =====
  s = content("Die 8 Phasen", "PHASE 4 · VERKAUFSARGUMENTATION", "Vom Merkmal zum Kundennutzen", 4);
  const chain = [["Eigenschaft", "Was hat der Artikel?", "dicke, weiche Zwischensohle"], ["Vorteil", "Was bewirkt das?", "fängt den Aufprall auf Asphalt ab"], ["Nutzen", "Was bringt es IHNEN?", "entlastet Ihr Knie bei jedem Schritt"]];
  chain.forEach(([h, q, ex], i) => {
    const x = M + i * 4.2, w = 3.6;
    card(s, x, 1.9, w, 2.3, { fill: i === 2 ? C.accent1 : C.background1 });
    const fg = i === 2 ? C.background1 : C.text1;
    txt(s, h, { x: x + 0.3, y: 2.1, w: w - 0.6, h: 0.45, fontSize: 22, bold: true, color: fg, fontFace: THEME.headFontFace });
    txt(s, q, { x: x + 0.3, y: 2.58, w: w - 0.6, h: 0.35, fontSize: 14, color: i === 2 ? C.accent5 : C.accent6 });
    txt(s, ex, { x: x + 0.3, y: 3.1, w: w - 0.6, h: 0.9, fontSize: 17, italic: true, color: fg });
    if (i < 2) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + w + 0.12, y: 2.85, w: 0.36, h: 0.4, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Pfeil" });
  });
  quote(s, "Wir-Stil", C.accent3, "„Wir finden den super, den verkaufen wir am meisten.“", "Es geht um das Geschäft, nicht um die Kundschaft.", M, 4.5, 5.95, 2.2);
  quote(s, "Sie-Stil", C.accent2, "„Damit können Sie beschwerdefrei laufen.“", "Die Kundschaft steht im Mittelpunkt.", 6.78, 4.5, 5.95, 2.2);
  s.addNotes("Übung: Lassen Sie die Klasse für die Regenjacke (wasserdichte Membran) und das Smartphone (großes Display) selbst Eigenschaft → Vorteil → Nutzen formulieren. Fachbegriffe wie „Sprengung“ immer übersetzen.");

  // ===== 8 Preisnennung =====
  s = content("Die 8 Phasen", "PHASE 5 · PREISNENNUNG", "Die Sandwich-Methode", 5);
  const layers = [["Nutzen", "„Mit der starken Dämpfung schonen Sie Ihr Knie.“", C.accent5, C.text1], ["Preis", "„Der AeroRun kostet 89,95 €,“", C.accent1, C.background1], ["Nutzen", "„… und die Sohle hält gut 800 Kilometer.“", C.accent5, C.text1]];
  layers.forEach(([h, t, bg, fg], i) => {
    const y = 1.95 + i * 1.5;
    card(s, M, y, 7.2, 1.3, { fill: bg });
    txt(s, h, { x: M + 0.35, y: y + 0.18, w: 1.6, h: 0.9, fontSize: 22, bold: true, color: fg, valign: "middle", fontFace: THEME.headFontFace });
    txt(s, t, { x: M + 2.0, y: y + 0.18, w: 4.95, h: 0.9, fontSize: 17, italic: true, color: fg, valign: "middle" });
  });
  card(s, 8.2, 1.95, 4.53, 4.3);
  await iconCircle(s, fa.FaBan, 8.5, 2.2, 0.62, "F8E1DE", HEX.bad);
  txt(s, "Tabu beim Preis", { x: 9.3, y: 2.3, w: 3.2, h: 0.45, fontSize: 19, bold: true, color: C.accent3 });
  txt(s, [
    { text: "„leider“, „nur“, „nicht ganz billig“", options: { bullet: true, breakLine: true } },
    { text: "sich für den Preis entschuldigen", options: { bullet: true, breakLine: true } },
    { text: "leise oder nuschelnd sprechen", options: { bullet: true, breakLine: true } },
    { text: "ungefragt über Rabatte reden", options: { bullet: true } }
  ], { x: 8.5, y: 3.05, w: 4.0, h: 2.9, fontSize: 16, paraSpaceAfter: 8 });
  s.addNotes("Der Preis soll nie „nackt“ im Raum stehen. Im Szenario mit Herrn Albers wird außerdem deutlich: den Preis klar und deutlich aussprechen, keine komplizierten Tarifdetails.");

  // ===== 9 Einwandbehandlung =====
  s = content("Die 8 Phasen", "PHASE 6 · EINWANDBEHANDLUNG", "Einwände sind Kaufsignale", 6);
  card(s, M, 1.9, 6.3, 4.75, { fill: C.text2 });
  txt(s, "Ja-aber-Methode", { x: M + 0.4, y: 2.2, w: 5.5, h: 0.5, fontSize: 24, bold: true, color: C.background1, fontFace: THEME.headFontFace });
  txt(s, "Erst recht geben, dann auf die Vorteile lenken.", { x: M + 0.4, y: 2.75, w: 5.5, h: 0.4, fontSize: 15, color: C.accent5 });
  txt(s, "Kundin: „Im Internet gibt es Laufschuhe schon für 40 Euro.“", { x: M + 0.4, y: 3.4, w: 5.5, h: 0.7, fontSize: 16, italic: true, color: C.accent5 });
  txt(s, "„Ja, da haben Sie recht, es gibt günstigere Schuhe. Dieser hier hat aber genau die Dämpfung, die Ihr Knie braucht, und Sie haben ihn gerade getestet.“", { x: M + 0.4, y: 4.2, w: 5.5, h: 2.1, fontSize: 17, italic: true, color: C.background1 });
  const meth = [
    [fa.FaQuestionCircle, "Rückfrage", "„Was genau ist Ihnen dabei wichtig?“ So erfahren Sie den wahren Grund."],
    [fa.FaLightbulb, "Lösung anbieten", "„Wir stellen das Telefon so ein, dass nur Ihre Kontakte anrufen können.“"],
    [fa.FaUndo, "Kaufrisiko nehmen", "„Sie können ihn ungeöffnet innerhalb von 14 Tagen umtauschen.“"]
  ];
  await iconRows(s, meth, 7.3, 1.9, 5.4, 1.35);
  pill(s, "Nie: widersprechen, abwerten, aufgeben", 7.3, 6.15, C.accent3, 5.43);
  s.addNotes("Gegenbeispiele aus der App: „Da kaufen Sie nur Schrott“ (abwerten), „Dann kaufen Sie doch online“ (aufgeben), „Ach, das ist doch übertrieben“ (Sorge wegwischen).");

  // ===== 10 Ergänzungsangebot =====
  s = content("Die 8 Phasen", "PHASE 7 · ERGÄNZUNGSANGEBOT", "Ein passender Artikel, zum richtigen Zeitpunkt", 7);
  await iconRows(s, [
    [fa.FaClock, "Nach dem Kaufentschluss", "Erst wenn der Hauptartikel feststeht."],
    [fa.FaPuzzlePiece, "Passt zum Hauptkauf", "Mit klarem Nutzen, nicht wahllos aufzählen."],
    [fa.FaHandsHelping, "Ist ein Service", "Auch Dienstleistungen zählen, z. B. Einrichtung oder Geschenkverpackung."]
  ], M, 1.9, 5.4, 1.45);
  const rows = [
    [{ text: "Hauptartikel", options: { bold: true, color: HEX.white, fill: { color: HEX.navy } } }, { text: "Ergänzung", options: { bold: true, color: HEX.white, fill: { color: HEX.navy } } }, { text: "Nutzen", options: { bold: true, color: HEX.white, fill: { color: HEX.navy } } }],
    ["Laufschuhe", "Laufsocken", "keine Blasen"],
    ["Smartphone", "Einrichtungsservice", "sicherer Start"],
    ["Regenjacke", "Imprägnierspray", "bleibt lange dicht"],
    ["Kaffeevollautomat", "Pflegeset", "leise, guter Espresso"],
    ["Parfum (Geschenk)", "Grußkarte", "Geschenk komplett"]
  ];
  s.addTable(rows, { x: 6.4, y: 1.9, w: 6.33, colW: [2.2, 2.1, 2.03], fontSize: 15, fontFace: THEME.bodyFontFace, color: HEX.ink, fill: { color: HEX.white }, border: { type: "solid", pt: 0.75, color: "D9DEE5" }, rowH: 0.62, valign: "middle", margin: [0.05, 0.12, 0.05, 0.12] });
  s.addNotes("Die Tabelle zeigt die Ergänzungsangebote aus den fünf App-Szenarien. Fragen Sie: Welche Ergänzung wäre zu einem Fahrrad oder einem Kinderwagen sinnvoll?");

  // ===== 11 Abschluss =====
  s = content("Die 8 Phasen", "PHASE 8 · ABSCHLUSS & VERABSCHIEDUNG", "Der letzte Eindruck bleibt", 8);
  const steps = [[fa.FaCheckCircle, "Kauf bestätigen", "„Schöne Wahl!“"], [fa.FaInfoCircle, "Tipp zur Nutzung", "„Laufen Sie die Schuhe locker ein.“"], [fa.FaPhoneAlt, "Hilfe anbieten", "„Bei Fragen kommen Sie einfach vorbei.“"], [fa.FaSmile, "Persönlich verabschieden", "„Viel Spaß beim Laufen!“"]];
  for (let i = 0; i < steps.length; i++) {
    const x = M + i * 3.1, w = 2.8;
    card(s, x, 1.9, w, 2.6);
    await iconCircle(s, steps[i][0], x + 0.3, 2.15, 0.7);
    txt(s, steps[i][1], { x: x + 0.3, y: 3.0, w: w - 0.6, h: 0.6, fontSize: 17, bold: true });
    txt(s, steps[i][2], { x: x + 0.3, y: 3.62, w: w - 0.6, h: 0.85, fontSize: 15, italic: true, color: C.accent6 });
  }
  card(s, M, 4.8, 12.13, 1.85, { fill: C.accent5, noShadow: true });
  s.addImage({ data: await figurePng("Herr Yilmaz"), x: M + 0.3, y: 4.95, w: 1.55, h: 1.55, altText: "Kundenfigur Herr Yilmaz" });
  txt(s, "„Vielen Dank und eine tolle Tour in den Bergen! Ich schließe Ihnen kurz die Tür auf.“", { x: M + 2.1, y: 5.05, w: 9.7, h: 0.8, fontSize: 19, italic: true, fontFace: THEME.headFontFace });
  txt(s, "Auch um 20:01 Uhr: persönlich, mit Bezug zum Kaufanlass. Kundenbindung entsteht am Schluss.", { x: M + 2.1, y: 5.9, w: 9.7, h: 0.5, fontSize: 15, color: C.accent6 });
  s.addNotes("Gegenbeispiele: „Tschüss“ mit Blick zum nächsten Kunden oder „So, jetzt aber raus, wir haben Feierabend.“ Ein schlechter Abschluss entwertet das ganze Gespräch.");

  // ===== 12 Kundentypen =====
  pres.addSection({ title: "Kundentypen" });
  s = content("Kundentypen", "BESONDERE SITUATIONEN", "Jede Kundschaft braucht etwas anderes");
  const types = [
    ["Herr Albers", "Älterer Kunde", ["langsam und deutlich sprechen", "keine Fachbegriffe, Zeit lassen", "Bedienung vorführen"]],
    ["Herr Yilmaz", "Kurz vor Ladenschluss", ["bis zur letzten Minute willkommen", "gezielt fragen, ein Artikel", "Zeitdruck nie weitergeben"]],
    ["Herr Brenner", "Schwieriger Kunde", ["sachlich bleiben", "Vorwissen anerkennen", "Fakten belegen, Service betonen"]],
    ["Lea", "Unentschlossen", ["Geduld, nicht drängen", "Auswahl begrenzen", "Kaufrisiko nehmen"]]
  ];
  for (let i = 0; i < types.length; i++) {
    const [who, t, tips] = types[i];
    const x = M + i * 3.1, w = 2.85;
    card(s, x, 1.9, w, 4.75);
    s.addImage({ data: await figurePng(who), x: x + (w - 1.45) / 2, y: 2.1, w: 1.45, h: 1.45, altText: "Kundenfigur " + who });
    txt(s, t, { x: x + 0.25, y: 3.7, w: w - 0.5, h: 0.4, fontSize: 17, bold: true, align: "center", color: C.accent1 });
    txt(s, who, { x: x + 0.25, y: 4.08, w: w - 0.5, h: 0.32, fontSize: 13, align: "center", color: C.accent6 });
    txt(s, tips.map((tt, k) => ({ text: tt, options: { bullet: true, breakLine: k < tips.length - 1 } })), { x: x + 0.25, y: 4.55, w: w - 0.5, h: 1.95, fontSize: 14, paraSpaceAfter: 6 });
  }
  s.addNotes("Ladenschluss: Wer vor Ladenschluss im Geschäft ist, darf noch fertig bedient werden. Fragen an die Klasse: Welche Kundentypen haben Sie selbst schon erlebt? Was war schwierig?");

  // ===== 13 Szenarien =====
  pres.addSection({ title: "Übung" });
  s = content("Übung", "DIE APP", "Fünf Szenarien warten auf Sie");
  const sc = [
    [{ text: "Szenario", options: { bold: true, color: HEX.white, fill: { color: HEX.navy } } }, { text: "Kundschaft", options: { bold: true, color: HEX.white, fill: { color: HEX.navy } } }, { text: "Geschäft", options: { bold: true, color: HEX.white, fill: { color: HEX.navy } } }, { text: "Stufe", options: { bold: true, color: HEX.white, fill: { color: HEX.navy } } }],
    ["Laufschuhe für die Einsteigerin", "Frau Becker, Einsteigerin", "Sporthaus Laufwerk", "leicht"],
    ["Das erste Smartphone", "Herr Albers, 78 Jahre", "Elektro Brandt", "mittel"],
    ["Regenjacke um 19:52 Uhr", "Herr Yilmaz, in Eile", "Modehaus Krüger", "mittel"],
    ["Ein Duft für Mama", "Lea, unentschlossen", "Parfümerie Duftwerk", "mittel"],
    ["Der Testsieger-Kenner", "Herr Brenner, Besserwisser", "Küchenwelt Hansen", "schwer"]
  ];
  s.addTable(sc, { x: M, y: 1.9, w: 8.6, colW: [3.0, 2.6, 2.0, 1.0], fontSize: 14, fontFace: THEME.bodyFontFace, color: HEX.ink, fill: { color: HEX.white }, border: { type: "solid", pt: 0.75, color: "D9DEE5" }, rowH: 0.7, valign: "middle", margin: [0.05, 0.12, 0.05, 0.12] });
  card(s, 9.6, 1.9, 3.13, 4.2, { fill: C.text2 });
  s.addImage({ data: await figurePng("Frau Becker"), x: 10.4, y: 2.1, w: 1.55, h: 1.55, altText: "Kundenfigur Frau Becker" });
  txt(s, "Jede Figur spricht, reagiert auf Ihre Antworten und zeigt ihre Laune.", { x: 9.9, y: 3.85, w: 2.55, h: 1.6, fontSize: 16, color: C.background1 });
  s.addNotes("Empfehlung: mit dem leichten Szenario beginnen. Die schwierigeren Kundentypen bauen auf den Grundlagen auf.");

  // ===== 14 So geht's =====
  s = content("Übung", "ANLEITUNG", "So üben Sie mit der App");
  const how = [
    [fa.FaTabletAlt, "Öffnen", "Link per AirDrop annehmen. Er öffnet sich in Safari, ohne Anmeldung."],
    [fa.FaThList, "Szenario wählen", "Mit „Laufschuhe“ anfangen, dann steigern."],
    [fa.FaToggleOn, "Modus wählen", "Übung: Feedback sofort. Prüfung: Feedback erst am Ende."],
    [fa.FaReceipt, "Auswertung lesen", "Kassenbon mit Punkten und Note, alle Antworten mit Begründung."]
  ];
  for (let i = 0; i < how.length; i++) {
    const x = M + i * 3.1, w = 2.85;
    card(s, x, 1.9, w, 3.4);
    await iconCircle(s, how[i][0], x + 0.3, 2.15, 0.75);
    txt(s, (i + 1) + ". " + how[i][1], { x: x + 0.3, y: 3.1, w: w - 0.6, h: 0.45, fontSize: 18, bold: true });
    txt(s, how[i][2], { x: x + 0.3, y: 3.6, w: w - 0.6, h: 1.5, fontSize: 14, color: C.accent6 });
  }
  await iconCircle(s, fa.FaHeadphones, M, 5.75, 0.6);
  txt(s, [{ text: "Tipp: ", options: { bold: true } }, { text: "Kopfhörer benutzen oder den Ton mit dem Lautsprecher-Knopf ausschalten. Die Figur bewegt dann trotzdem den Mund." }], { x: M + 0.8, y: 5.85, w: 11.3, h: 0.5, fontSize: 15 });
  s.addNotes("Bestwerte werden nur auf dem jeweiligen iPad gespeichert. Für eine Klassenauswertung die Noten mündlich oder per Screenshot sammeln.");

  // ===== 15 Arbeitsauftrag (dunkel) =====
  s = pres.addSlide({ masterName: "Titel dunkel", sectionTitle: "Übung" });
  s.addText("ARBEITSAUFTRAG", { placeholder: "kicker" });
  s.addText("Jetzt sind Sie dran", { placeholder: "title" });
  s.addText([
    { text: "Spielen Sie zwei Szenarien im Übungsmodus.", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Spielen Sie ein Szenario im Prüfungsmodus.", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Notieren Sie: Welche Phase war am schwierigsten? Welche Formulierung nehmen Sie mit?", options: { bullet: { type: "number" } } }
  ], { placeholder: "body" });
  s.addImage({ data: await figurePng("Lea"), x: 9.4, y: 1.6, w: 2.4, h: 2.4, altText: "Kundenfigur Lea" });
  s.addImage({ data: await figurePng("Herr Brenner"), x: 10.2, y: 4.1, w: 2.2, h: 2.2, altText: "Kundenfigur Herr Brenner" });
  s.addNotes("Zur Sicherung: Ergebnisse im Plenum sammeln. Anschließend können Paare ein Szenario als echtes Rollenspiel nachspielen, eine Person verkauft, die andere spielt die Kundenfigur.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("geschrieben:", OUT);
})().catch(e => { console.error(e); process.exit(1); });
