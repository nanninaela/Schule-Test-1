// Baut die Selbstlern-Präsentation „Kundenvielfalt“ (LF 10, Buch S. 168–177).
// Hochformat, damit die Folien auf dem Smartphone den Bildschirm füllen.
// Aufruf: SKILL=<pptx-Skill-Ordner> node build-deck.js Ausgabe.pptx
const pptxgen = require("pptxgenjs");
const sharp = require("sharp");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const fa = require("react-icons/fa");
const { applyTheme } = require(process.env.SKILL + "/scripts/apply_theme.js");

const OUT = process.argv[2];

async function icon(Comp, hex) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + hex, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ---------- Theme (wie die übrigen Materialien der Klasse) ----------
const THEME = {
  name: "Kundenvielfalt",
  headFontFace: "Century Schoolbook",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "18202B", lt1: "FFFFFF", dk2: "1B2A4E", lt2: "F2F4F6",
    accent1: "2346A0", accent2: "1D7A4C", accent3: "B5352A", accent4: "9A6400",
    accent5: "E3E9F8", accent6: "5B6676", hlink: "2346A0", folHlink: "5B6676"
  }
};
const HEX = { ink: "18202B", accent: "2346A0", good: "1D7A4C", bad: "B5352A", ok: "9A6400", soft: "E3E9F8", muted: "5B6676", line: "D9DEE5" };

(async () => {
  const pres = new pptxgen();
  pres.defineLayout({ name: "HANDY_HOCH", width: 7.5, height: 13.333 });
  pres.layout = "HANDY_HOCH";
  pres.title = "Kundenvielfalt: Kundengruppen und Kundentypen";
  pres.author = "Einzelhandel, 2. Ausbildungsjahr";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;
  const W = 7.5, M = 0.5, CW = W - 2 * M;

  // ---------- Layouts ----------
  pres.defineSlideMaster({
    title: "Titel dunkel",
    background: { color: C.text2 },
    objects: [
      { placeholder: { options: { name: "kicker", type: "body", x: M, y: 3.4, w: CW, h: 0.8, fontSize: 16, bold: true, color: C.accent5, charSpacing: 3, margin: 0, valign: "bottom" }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: M, y: 4.35, w: CW, h: 2.6, fontSize: 46, bold: true, color: C.background1, valign: "top", align: "left", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: M, y: 7.1, w: CW, h: 1.6, fontSize: 20, color: C.accent5, valign: "top", align: "left", margin: 0 }, text: "" } }
    ]
  });
  pres.defineSlideMaster({
    title: "Inhalt",
    background: { color: C.background2 },
    objects: [
      { placeholder: { options: { name: "kicker", type: "body", x: M, y: 0.5, w: CW, h: 0.35, fontSize: 14, bold: true, color: C.accent1, charSpacing: 2, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: M, y: 0.95, w: CW, h: 1.35, fontSize: 30, bold: true, color: C.text1, valign: "top", align: "left", margin: 0 }, text: "" } },
      { text: { text: "LF 10 · Kundenvielfalt", options: { x: M, y: 12.8, w: 4, h: 0.3, fontSize: 12, color: C.accent6, margin: 0 } } }
    ],
    slideNumber: { x: W - M - 1, y: 12.8, w: 1, h: 0.3, fontSize: 12, color: C.accent6, align: "right" }
  });
  pres.defineSlideMaster({
    title: "Abschluss dunkel",
    background: { color: C.text2 },
    objects: [
      { placeholder: { options: { name: "kicker", type: "body", x: M, y: 0.6, w: CW, h: 0.4, fontSize: 14, bold: true, color: C.accent5, charSpacing: 2, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: M, y: 1.1, w: CW, h: 1.5, fontSize: 32, bold: true, color: C.background1, valign: "top", align: "left", margin: 0 }, text: "" } }
    ]
  });

  // ---------- Hilfen ----------
  const shadow = () => ({ type: "outer", color: "18202B", opacity: 0.12, blur: 8, offset: 2, angle: 90 });
  function card(s, x, y, w, h, opts = {}) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w, h, rectRadius: 0.14, fill: { color: opts.fill || C.background1 },
      line: { type: "none" }, shadow: opts.noShadow ? undefined : shadow(), objectName: opts.name || "Karte"
    });
  }
  function txt(s, text, o) { s.addText(text, Object.assign({ isTextBox: true, margin: 0, valign: "top", fontSize: 18, color: C.text1 }, o)); }
  function pill(s, text, x, y, color, w, tc) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.4, rectRadius: 0.2, fill: { color }, line: { type: "none" }, objectName: "Etikett" });
    txt(s, text, { x, y, w, h: 0.4, fontSize: 14, bold: true, color: tc || C.background1, align: "center", valign: "middle" });
  }
  async function iconCircle(s, Comp, x, y, d = 0.75, bg = C.accent5, fg = HEX.accent) {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: bg }, line: { type: "none" }, objectName: "Symbolkreis" });
    const p = d * 0.22;
    s.addImage({ data: await icon(Comp, fg), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, altText: "Symbol" });
  }
  function content(section, kicker, title) {
    const s = pres.addSlide({ masterName: "Inhalt", sectionTitle: section });
    s.addText(kicker, { placeholder: "kicker" });
    s.addText(title, { placeholder: "title" });
    return s;
  }
  // Zeilen mit Symbol links, Überschrift und Text rechts
  async function iconRows(s, rows, y, gap, bodyH) {
    for (let i = 0; i < rows.length; i++) {
      const [Comp, head, body] = rows[i];
      const yy = y + i * gap;
      await iconCircle(s, Comp, M, yy);
      txt(s, head, { x: M + 1.0, y: yy, w: CW - 1.0, h: 0.45, fontSize: 20, bold: true });
      txt(s, body, { x: M + 1.0, y: yy + 0.5, w: CW - 1.0, h: bodyH, fontSize: 18, color: C.accent6 });
    }
  }
  function term(s, word, def, y, h) {
    card(s, M, y, CW, h, { fill: "FBEFD6", noShadow: true, name: "Fachbegriff" });
    txt(s, [{ text: word + ": ", options: { bold: true, color: HEX.ok } }, { text: def }], { x: M + 0.3, y: y + 0.2, w: CW - 0.6, h: h - 0.4, fontSize: 18, valign: "middle" });
  }
  async function merke(s, text, y, h) {
    card(s, M, y, CW, h, { fill: C.accent5, noShadow: true, name: "Merke" });
    await iconCircle(s, fa.FaLightbulb, M + 0.25, y + (h - 0.65) / 2, 0.65, C.background1);
    txt(s, [{ text: "Merke: ", options: { bold: true } }, { text }], { x: M + 1.1, y: y + 0.15, w: CW - 1.35, h: h - 0.3, fontSize: 18, valign: "middle" });
  }
  const bullets = (arr) => arr.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < arr.length - 1 } }));

  // ===== 1 Titel =====
  pres.addSection({ title: "Start" });
  let s = pres.addSlide({ masterName: "Titel dunkel", sectionTitle: "Start" });
  s.addText("LERNFELD 10 · SELBSTLERNEN", { placeholder: "kicker" });
  s.addText("Kundenvielfalt", { placeholder: "title" });
  s.addText("Kundengruppen und Kundentypen im Einzelhandel. Buch „Ausbildung im Einzelhandel“, S. 168–177", { placeholder: "body" });
  const heroIcons = [fa.FaChild, fa.FaUserGraduate, fa.FaUserTie, fa.FaGlobeEurope, fa.FaUserClock];
  for (let i = 0; i < heroIcons.length; i++) {
    await iconCircle(s, heroIcons[i], M + i * 1.32, 9.6, 1.05, "2A3D6B", "E3E9F8");
  }
  s.addNotes("Diese Präsentation fasst die Buchseiten 168 bis 177 zusammen. Sie ersetzt das Lesen im Buch nicht.");

  // ===== 2 Arbeitsauftrag =====
  s = content("Start", "SO ARBEITEN SIE", "Ihr Arbeitsauftrag für heute");
  await iconRows(s, [
    [fa.FaBook, "1. Lesen Sie im Buch", "Seiten 168 bis 177. Markieren Sie Fachbegriffe, wenn Sie das Buch auf Papier haben."],
    [fa.FaMobileAlt, "2. Gehen Sie die Folien durch", "Jede Folie fasst einen Abschnitt zusammen. Oben steht die passende Buchseite."],
    [fa.FaListUl, "3. Bearbeiten Sie die Online-Übung", "Fünf Stationen mit je zehn Aufgaben. Sie können jede Station wiederholen."],
    [fa.FaCamera, "4. Sichern Sie Ihr Ergebnis", "Machen Sie am Ende einen Screenshot vom Nachweis in der Übung und bewahren Sie ihn für Ihre Lehrkraft auf."]
  ], 2.6, 2.35, 1.6);
  s.addNotes("Arbeitsauftrag für die Vertretungsstunde. Die Online-Übung enthält die gleichen fünf Themenblöcke wie diese Präsentation.");

  // ===== 3 Kundengruppen =====
  pres.addSection({ title: "Kundengruppen" });
  s = content("Kundengruppen", "1.1 KUNDENGRUPPEN · S. 168", "Merkmale teilen Kunden in Gruppen ein");
  const groups = [
    ["Geschlecht", "Frauen und Männer"], ["Alter", "Kinder, Jugendliche, Erwachsene"], ["Wohnort", "Stadt-, Landbevölkerung"],
    ["Herkunft", "Kunden ohne und mit Migrationsgeschichte"], ["Einkommen", "gehobenes Einkommen, Geringverdiener, Alleinverdiener"],
    ["Familienstand", "Single, Partnerschaft mit/ohne Kinder, Alleinerziehende"], ["Haushaltsgröße", "Ein-, Mehrpersonenhaushalte"]
  ];
  card(s, M, 2.5, CW, 7.55, { name: "Tabelle Merkmale" });
  groups.forEach(([m, g], i) => {
    const y = 2.7 + i * 1.04;
    txt(s, m, { x: M + 0.3, y, w: CW - 0.6, h: 0.32, fontSize: 15, bold: true, color: C.accent1 });
    txt(s, g, { x: M + 0.3, y: y + 0.33, w: CW - 0.6, h: 0.62, fontSize: 18 });
    if (i < groups.length - 1) s.addShape(pres.shapes.LINE, { x: M + 0.3, y: y + 0.98, w: CW - 0.6, h: 0, line: { color: HEX.line, width: 0.75 }, objectName: "Trennlinie" });
  });
  card(s, M, 10.35, CW, 2.15, { fill: "F8E1DE", noShadow: true, name: "Warnung" });
  await iconCircle(s, fa.FaExclamationTriangle, M + 0.25, 10.55, 0.65, C.background1, HEX.bad);
  txt(s, [{ text: "Vorsicht Klischee! ", options: { bold: true, color: HEX.bad } }, { text: "Ein einziges Merkmal reicht nicht für ein Kundenprofil. Klischee = eingefahrene Vorstellung, Verallgemeinerung, Vorurteil." }],
    { x: M + 1.1, y: 10.5, w: CW - 1.35, h: 1.85, fontSize: 18, valign: "middle" });
  s.addNotes("Demografische Merkmale sind leicht erkennbar. Für ein Kundenprofil reicht ein Merkmal allein aber nicht.");

  // ===== 4 Diagramm Frauen und Männer =====
  s = content("Kundengruppen", "1.1.1 FRAUEN UND MÄNNER · S. 168–169", "Wo sich Frauen und Männer unterscheiden");
  card(s, M, 2.5, CW, 6.35, { name: "Diagrammkarte" });
  s.addChart(pres.charts.BAR, [
    { name: "Männer", labels: ["Kleidung drückt meinen Stil aus", "Kleidung kaufen macht mir Spaß", "Ich kaufe gerne im Internet ein", "Ich bleibe bei Technik auf dem Laufenden"], values: [33.2, 18.6, 39, 42.8] },
    { name: "Frauen", labels: ["Kleidung drückt meinen Stil aus", "Kleidung kaufen macht mir Spaß", "Ich kaufe gerne im Internet ein", "Ich bleibe bei Technik auf dem Laufenden"], values: [57.8, 58.2, 39.1, 18.5] }
  ], {
    x: M + 0.15, y: 2.65, w: CW - 0.3, h: 5.75, barDir: "bar", barGrouping: "clustered", barGapWidthPct: 60,
    chartColors: [HEX.accent, HEX.ok], catAxisOrientation: "maxMin",
    showTitle: true, title: "Zustimmung in Prozent (2023)", titleFontSize: 15, titleColor: HEX.ink, titleFontFace: "+mn-lt",
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 13, dataLabelColor: HEX.ink, dataLabelFontFace: "+mn-lt", dataLabelFormatCode: "0.0",
    catAxisLabelFontSize: 14, catAxisLabelColor: HEX.ink, catAxisLabelFontFace: "+mn-lt", catGridLine: { style: "none" },
    valAxisHidden: true, valAxisMaxVal: 75, valGridLine: { style: "none" },
    showLegend: true, legendPos: "b", legendFontSize: 14, legendColor: HEX.ink, legendFontFace: "+mn-lt"
  });
  txt(s, "Quelle: IfD Allensbach 2023, Buch S. 169", { x: M + 0.3, y: 8.45, w: CW - 0.6, h: 0.3, fontSize: 12, color: C.accent6 });
  txt(s, "Rollenklischees wie „Frauen shoppen länger und geben mehr Geld aus“ erklären wenig. Fragen Sie nach den Gründen, z. B.: Wer erledigt die Versorgungseinkäufe für die Familie?",
    { x: M, y: 9.15, w: CW, h: 1.45, fontSize: 18 });
  term(s, "Gender-Marketing", "untersucht geschlechtstypisches Kaufverhalten und setzt gezielt Werbung ein. Gender = soziales Geschlecht.", 10.8, 1.7);
  s.addNotes("Beim Einkaufen im Internet gibt es fast keinen Unterschied. Bei Kleidung und Technik dagegen schon.");

  // ===== 5 Interessen verschieben sich =====
  s = content("Kundengruppen", "1.1.1 FRAUEN UND MÄNNER · S. 169", "Die Interessen verschieben sich");
  const trends = [
    ["Immer mehr Frauen …", C.accent4, ["erledigen Heimwerkerarbeiten und wollen handliches Werkzeug", "kümmern sich um den Garten, z. B. um den Rasenmäher", "bauen Möbel selbst auf und lassen sich gern beraten"]],
    ["Immer mehr Männer …", C.accent1, ["legen Wert auf eine modische Frisur und kaufen Haarfärbemittel", "kochen und interessieren sich für Haushaltsgeräte", "kaufen freiverkäufliche Arzneimittel und lassen sich beraten"]]
  ];
  trends.forEach(([h, col, items], i) => {
    const y = 2.5 + i * 3.85;
    card(s, M, y, CW, 3.6);
    pill(s, h, M + 0.3, y + 0.3, col, 2.9);
    txt(s, bullets(items), { x: M + 0.3, y: y + 0.95, w: CW - 0.6, h: 2.5, fontSize: 18, paraSpaceAfter: 8 });
  });
  await merke(s, "Die Kaufkraft von Frauen ist gestiegen. Die Angleichung geht aber langsam und betrifft nicht alle Bereiche.", 10.3, 2.2);
  s.addNotes("Beispiele aus der Tabelle auf Seite 169.");

  // ===== 6 Beratungstipps =====
  s = content("Kundengruppen", "1.1.1 FRAUEN UND MÄNNER · S. 169–170", "So beraten Sie passend");
  const tips = [
    ["Kundinnen", C.accent4, "lassen sich eher zu Ergänzungskäufen anregen.", "Weisen Sie auf passende Ergänzungsartikel hin."],
    ["Kundinnen", C.accent4, "wollen bei teuren Anschaffungen umfassend informiert werden.", "Beraten Sie fundiert und lassen Sie die Ware testen."],
    ["Kunden", C.accent1, "informieren sich vorab über technische Daten.", "Stellen Sie früh den Wissensstand fest. Keine „Besserwisserei“."],
    ["Kunden", C.accent1, "kaufen zielgerichtet und wollen ein zügiges Gespräch.", "Nennen Sie konkrete Vorteile, die für den Kunden wichtig sind."]
  ];
  tips.forEach(([who, col, sit, tip], i) => {
    const y = 2.5 + i * 2.0;
    card(s, M, y, CW, 1.8);
    pill(s, who, M + 0.3, y + 0.25, col, 1.5);
    txt(s, sit, { x: M + 2.0, y: y + 0.22, w: CW - 2.3, h: 0.7, fontSize: 17, color: C.accent6 });
    txt(s, [{ text: "→ ", options: { bold: true, color: HEX.good } }, { text: tip, options: { bold: true } }], { x: M + 0.3, y: y + 0.95, w: CW - 0.6, h: 0.75, fontSize: 18 });
  });
  await merke(s, "Nicht jede Situation braucht ein geschlechtsspezifisches Vorgehen. Ordnen Sie niemanden zwanghaft einer Gruppe zu.", 10.6, 1.9);
  s.addNotes("Tabelle „Beispiele für das Kaufverhalten von Frauen und Männern im Vergleich“, Seite 169 und 170.");

  // ===== 7 Kinder =====
  pres.addSection({ title: "Altersgruppen" });
  s = content("Altersgruppen", "1.1.2 ALTERSGRUPPEN · S. 170–171", "Kinder kaufen mit und beeinflussen");
  await iconRows(s, [
    [fa.FaShoppingCart, "Bis zu 10 Spontankäufe", "So viele Artikel bringen Kinder ihre Eltern pro Einkauf in den Wagen, oft unbemerkt."],
    [fa.FaHeart, "Kunden von morgen", "Fühlen sich Kinder zurückgesetzt, erzählen sie es zu Hause. Dann meiden manchmal auch die Eltern das Geschäft."]
  ], 2.5, 1.9, 1.2);
  txt(s, "Geschäftsfähigkeit", { x: M, y: 6.35, w: CW, h: 0.45, fontSize: 21, bold: true, fontFace: THEME.headFontFace });
  const ages = [
    ["0–6 Jahre", "geschäftsunfähig", C.accent3, "Nur Botengänge für die Eltern. Ist die Ware nicht da, geben Sie keine Ersatzware mit."],
    ["7–17 Jahre", "beschränkt geschäftsfähig", C.accent4, "Eltern müssen zustimmen, außer beim Kauf vom Taschengeld. Bei größeren Beträgen Zustimmung einholen lassen."]
  ];
  ages.forEach(([a, st, col, d], i) => {
    const y = 6.95 + i * 2.75;
    card(s, M, y, CW, 2.5);
    pill(s, a, M + 0.3, y + 0.3, col, 1.6);
    txt(s, st, { x: M + 2.1, y: y + 0.3, w: CW - 2.4, h: 0.4, fontSize: 19, bold: true, valign: "middle" });
    txt(s, d, { x: M + 0.3, y: y + 0.9, w: CW - 0.6, h: 1.45, fontSize: 18 });
  });
  s.addNotes("Mehr zur Geschäftsfähigkeit steht im Lernfeld 3, Kapitel 7.1 und 7.2.");

  // ===== 8 Jugendliche =====
  s = content("Altersgruppen", "1.1.2 ALTERSGRUPPEN · S. 171–172", "Jugendliche und junge Erwachsene");
  await iconRows(s, [
    [fa.FaStar, "Image und Trend", "Sie wollen im Trend liegen, kaufen Markenartikel und neue Produkte, auch wenn sie teuer sind."],
    [fa.FaMobileAlt, "Influencer", "Werbung in sozialen Medien beeinflusst ihre Kaufentscheidungen stark."],
    [fa.FaUserFriends, "Anerkennung", "Oft zählt nicht der Nutzen, sondern die Anerkennung im Freundeskreis."],
    [fa.FaBoxOpen, "Convenience", "Bei Lebensmitteln greifen viele zu Fertigprodukten und achten wenig auf Qualität."]
  ], 2.5, 1.75, 1.15);
  term(s, "Digital Natives", "mit digitalen Medien aufgewachsen. Sie nutzen gern Omni-Channel-Angebote, z. B. online reservieren und im Laden abholen.", 9.6, 2.85);
  s.addNotes("14 bis 17 Jahre: Jugendliche, 18 bis 21 Jahre: junge Erwachsene. Sie sind kaufkräftig durch Taschengeld, Geldgeschenke, Jobs oder eigenes Einkommen.");

  // ===== 9 Jugendschutz =====
  s = content("Altersgruppen", "JUGENDSCHUTZGESETZ · S. 172", "Diese Waren dürfen Sie nicht verkaufen");
  const bans = [
    ["unter 12", C.accent4, "Partyknaller, Wunderkerzen und anderes Feuerwerk der Kategorie F1"],
    ["unter 16", C.accent1, "Getränke mit wenig Alkohol, z. B. Bier und Wein"],
    ["unter 18", C.accent3, "starke Alkoholika (über 15 Vol.-%), Alkopops, Tabakwaren, jugendgefährdende Medien, Feuerwerk F2 (Verkauf nur 28.–31. Dezember)"]
  ];
  const bh = [1.75, 1.75, 2.6];
  let by = 2.5;
  bans.forEach(([a, col, d], i) => {
    card(s, M, by, CW, bh[i]);
    pill(s, "An " + a, M + 0.3, by + 0.3, col, 1.7);
    txt(s, d, { x: M + 0.3, y: by + 0.85, w: CW - 0.6, h: bh[i] - 1.0, fontSize: 18 });
    by += bh[i] + 0.3;
  });
  card(s, M, 9.25, CW, 3.25, { fill: C.text2, name: "Ausweis" });
  await iconCircle(s, fa.FaIdCard, M + 0.3, 9.55, 0.85, "2A3D6B", "E3E9F8");
  txt(s, "Im Zweifel: Ausweis zeigen lassen", { x: M + 1.4, y: 9.6, w: CW - 1.7, h: 0.8, fontSize: 21, bold: true, color: C.background1, valign: "middle" });
  txt(s, "Verlassen Sie sich nie auf Ihre Schätzung. Ratenkäufe mit Jugendlichen schließen Sie überhaupt nicht ab.", { x: M + 0.3, y: 10.65, w: CW - 0.6, h: 1.6, fontSize: 18, color: C.accent5 });
  s.addNotes("Alterskontrolle: Bei Zweifeln immer nach einem Ausweispapier fragen, z. B. dem Personalausweis.");

  // ===== 10 Generation 50plus =====
  s = content("Altersgruppen", "GENERATION 50PLUS · S. 172–173", "Generation 50plus: kaufkräftig und anspruchsvoll");
  [["47 %", "der Kaufkraft in Deutschland hat die Generation 50plus, Tendenz steigend."], ["64 %", "der Generation 50plus bestellen einmal im Monat online."]].forEach(([n, l], i) => {
    const x = M + i * 3.35, w = 3.15;
    card(s, x, 2.5, w, 3.3);
    txt(s, n, { x: x + 0.25, y: 2.7, w: w - 0.5, h: 1.1, fontSize: 54, bold: true, color: C.accent1, fontFace: THEME.headFontFace });
    txt(s, l, { x: x + 0.25, y: 3.9, w: w - 0.5, h: 1.75, fontSize: 17, color: C.accent6 });
  });
  txt(s, bullets([
    "Viele fühlen sich jünger, sind aktiv und gesund und wollen sich etwas gönnen.",
    "Sie sind qualitätsbewusst, probieren Neues aus und wollen fachkundig beraten werden.",
    "Je älter die Kunden, desto wichtiger ist der persönliche Einkauf im Geschäft."
  ]), { x: M, y: 6.15, w: CW, h: 3.5, fontSize: 18, paraSpaceAfter: 10 });
  term(s, "Best Ager", "andere Bezeichnung für die Generation 50plus.", 9.85, 1.15);
  term(s, "Silver Surfer", "ältere Menschen, die das Internet nutzen.", 11.25, 1.15);
  s.addNotes("Die Bevölkerung in Deutschland wird älter (Diagramm „Deutsche Lebensbäume“, Seite 172). Deshalb wird diese Zielgruppe immer wichtiger.");

  // ===== 11 Was Älteren hilft =====
  s = content("Altersgruppen", "GENERATION 50PLUS · S. 173", "Was älteren Kunden hilft");
  const helps = [
    [fa.FaChair, "Sitzgelegenheiten"], [fa.FaSearchPlus, "Leselupen und gut lesbare Preise"],
    [fa.FaHandsHelping, "Hilfe beim Verpacken und Geldzählen"], [fa.FaTruck, "Lieferung, Montage, Reparatur"],
    [fa.FaDeaf, "deutlich sprechen und nachfragen"], [fa.FaShoppingBasket, "kleine Mengen, einfache Gerichte"]
  ];
  for (let i = 0; i < helps.length; i++) {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * 3.35, y = 2.5 + row * 2.75, w = 3.15, h = 2.5;
    card(s, x, y, w, h);
    await iconCircle(s, helps[i][0], x + 0.3, y + 0.3, 0.85);
    txt(s, helps[i][1], { x: x + 0.3, y: y + 1.3, w: w - 0.6, h: 1.05, fontSize: 18, bold: true });
  }
  txt(s, "Ein Teil der älteren Menschen ist in der Mobilität, beim Hören oder beim Sehen eingeschränkt. Viele leben allein und wünschen gesunde, regionale Lebensmittel.",
    { x: M, y: 10.85, w: CW, h: 1.6, fontSize: 18, color: C.accent6 });
  s.addNotes("Das betrifft das Sortiment, die Ladengestaltung, die Warenplatzierung, die Serviceleistungen und die Kompetenzen des Verkaufspersonals.");

  // ===== 12 Internationale Kunden: wer =====
  pres.addSection({ title: "Internationale Kunden" });
  s = content("Internationale Kunden", "1.1.3 INTERNATIONALE KUNDEN · S. 174", "Internationale Kunden: eine wachsende Gruppe");
  card(s, M, 2.5, CW, 2.7);
  txt(s, "13,9 Mio.", { x: M + 0.3, y: 2.7, w: CW - 0.6, h: 1.0, fontSize: 54, bold: true, color: C.accent1, fontFace: THEME.headFontFace });
  txt(s, "Menschen mit ausländischer Staatsangehörigkeit lebten 2023 in Deutschland. Die meisten kommen aus der Türkei, der Ukraine und Syrien.", { x: M + 0.3, y: 3.75, w: CW - 0.6, h: 1.3, fontSize: 17, color: C.accent6 });
  txt(s, "Dazu kommen Kunden mit kurzem Aufenthalt:", { x: M, y: 5.55, w: CW, h: 0.45, fontSize: 20, bold: true });
  await iconRows(s, [
    [fa.FaPlane, "Touristen", "für den Alltag oder auf Shopping-Tour nach regionalen Besonderheiten"],
    [fa.FaUserTie, "Handelsreisende, Messebesucher", "beruflich für kurze Zeit in Deutschland"],
    [fa.FaHandsHelping, "Patienten und Angehörige", "während eines Klinikaufenthalts"],
    [fa.FaUserGraduate, "Schüler, Studierende, Grenzgänger", "aus dem Ausland, die hier lernen oder arbeiten"]
  ], 6.25, 1.55, 0.95);
  s.addNotes("Diagramm „Aus aller Welt“, Seite 174. 2003 waren es noch 7,3 Millionen.");

  // ===== 13 Internationale Kunden: wie =====
  s = content("Internationale Kunden", "1.1.3 INTERNATIONALE KUNDEN · S. 174", "So überwinden Sie Sprachbarrieren");
  card(s, M, 2.5, CW, 5.0);
  await iconCircle(s, fa.FaLanguage, M + 0.3, 2.75, 0.8);
  txt(s, "Im Gespräch", { x: M + 1.3, y: 2.75, w: CW - 1.6, h: 0.8, fontSize: 21, bold: true, valign: "middle" });
  txt(s, bullets(["langsam und deutlich sprechen", "freundlich und aufmerksam bleiben", "auf Symbole oder Zahlen zeigen", "die Ware „sprechen lassen“", "eine Fremdsprache nutzen"]),
    { x: M + 0.3, y: 3.8, w: CW - 0.6, h: 3.5, fontSize: 18, paraSpaceAfter: 8 });
  card(s, M, 7.8, CW, 4.7);
  await iconCircle(s, fa.FaStore, M + 0.3, 8.05, 0.8);
  txt(s, "Im Geschäft", { x: M + 1.3, y: 8.05, w: CW - 1.6, h: 0.8, fontSize: 21, bold: true, valign: "middle" });
  txt(s, bullets(["internationale Kreditkarten und digitale Zahlung, z. B. PayPal", "Sortiment anpassen, z. B. asiatische Produkte in einer eigenen Zone", "mehrsprachige Etiketten"]),
    { x: M + 0.3, y: 9.1, w: CW - 0.6, h: 3.2, fontSize: 18, paraSpaceAfter: 8 });
  s.addNotes("Kulturelle Unterschiede bei Erwartungen und Kaufgewohnheiten berücksichtigen, damit die Kundschaft zufrieden ist. Steuerfrei einkaufen: Lernfeld 3, Kapitel 6.6.");

  // ===== 14 Kundentypen Überblick =====
  pres.addSection({ title: "Kundentypen" });
  s = content("Kundentypen", "1.2 KUNDENTYPEN · S. 175", "Drei Arten, Kundentypen zu unterscheiden");
  const kinds = [
    [fa.FaBullseye, "Nach dem Kaufmotiv", "Warum kauft die Person?", "preisorientiert · markenbewusst · gesundheitsorientiert"],
    [fa.FaClock, "Nach der Situation", "Wie verhält sie sich gerade?", "eilig · spät · serviceorientiert · Showroomer"],
    [fa.FaUsers, "Nach dem Charakter", "Wie ist sie als Mensch?", "sachverständig · skeptisch · interessiert · gesprächsfreudig · unentschlossen"]
  ];
  for (let i = 0; i < kinds.length; i++) {
    const [Comp, h, qn, list] = kinds[i];
    const y = 2.5 + i * 2.85;
    card(s, M, y, CW, 2.6);
    await iconCircle(s, Comp, M + 0.3, y + 0.3, 0.8);
    txt(s, h, { x: M + 1.3, y: y + 0.3, w: CW - 1.6, h: 0.45, fontSize: 21, bold: true });
    txt(s, qn, { x: M + 1.3, y: y + 0.78, w: CW - 1.6, h: 0.4, fontSize: 17, italic: true, color: C.accent6 });
    txt(s, list, { x: M + 0.3, y: y + 1.35, w: CW - 0.6, h: 1.1, fontSize: 18, bold: true, color: C.accent1 });
  }
  await merke(s, "Kundengruppen beschreiben, wer jemand ist. Kundentypen beschreiben, wie jemand kauft.", 11.05, 1.45);
  s.addNotes("Kundentypen finden sich in allen Kundengruppen.");

  // ===== 15 Nach Kaufmotiv =====
  s = content("Kundentypen", "1.2.1 NACH DEM KAUFMOTIV · S. 175", "Was treibt den Kauf an?");
  const motives = [
    [fa.FaTags, "Preisorientiert", "Der Smartshopper sucht Schnäppchen, vergleicht Preise und feilscht gern.", "Rabatte, Sonderangebote, Bonusaktionen. Mehrwert zeigen."],
    [fa.FaGem, "Markenbewusst", "Vertraut der Marke und ihrem Image. Der Preis ist zweitrangig.", "Premiumqualität und nachkaufbare Ersatzteile betonen."],
    [fa.FaLeaf, "Gesundheitsorientiert", "Achtet auf Ernährung, Entspannung und Fitness. Bio-Kunden geben oft mehr aus.", "Am Wohlbefinden argumentieren, Tipps geben."]
  ];
  for (let i = 0; i < motives.length; i++) {
    const [Comp, h, who, tip] = motives[i];
    const y = 2.5 + i * 3.0;
    card(s, M, y, CW, 2.8);
    await iconCircle(s, Comp, M + 0.3, y + 0.3, 0.8);
    txt(s, h, { x: M + 1.3, y: y + 0.3, w: CW - 1.6, h: 0.8, fontSize: 21, bold: true, valign: "middle" });
    txt(s, who, { x: M + 0.3, y: y + 1.2, w: CW - 0.6, h: 0.8, fontSize: 17, color: C.accent6 });
    txt(s, [{ text: "→ ", options: { bold: true, color: HEX.good } }, { text: tip, options: { bold: true } }], { x: M + 0.3, y: y + 1.98, w: CW - 0.6, h: 0.72, fontSize: 17 });
  }
  term(s, "Wellness", "wellbeing (Wohlbefinden) + fitness", 11.55, 0.95);
  s.addNotes("Bio-Kunden sind keine homogene (gleichmäßig zusammengesetzte) Gruppe: Es gibt Intensivkäufer, Gelegenheitskäufer und Genießer.");

  // ===== 16 Diagramm Lebensmitteleinkauf =====
  s = content("Kundentypen", "1.2.1 NACH DEM KAUFMOTIV · S. 175", "Geschmack schlägt Preis");
  card(s, M, 2.5, CW, 8.4, { name: "Diagrammkarte" });
  const food = [["Geschmack", 94], ["Saisonalität", 80], ["Tierhaltung", 79], ["Regionalität", 77], ["fairer Handel", 70], ["ökologische Produktion", 70], ["Angebote", 68], ["umweltschonende Produktion", 68], ["Produktinformationen", 58], ["niedriger Preis", 55], ["Inspiration durch Sortiment", 52]];
  s.addChart(pres.charts.BAR, [{ name: "wichtig", labels: food.map(f => f[0]), values: food.map(f => f[1]) }], {
    x: M + 0.15, y: 2.65, w: CW - 0.3, h: 7.9, barDir: "bar", barGapWidthPct: 45, catAxisOrientation: "maxMin",
    chartColors: [HEX.accent], showTitle: true, title: "Was beim Lebensmitteleinkauf wichtig ist (in %)", titleFontSize: 15, titleColor: HEX.ink, titleFontFace: "+mn-lt",
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 13, dataLabelColor: HEX.ink, dataLabelFontFace: "+mn-lt",
    catAxisLabelFontSize: 14, catAxisLabelColor: HEX.ink, catAxisLabelFontFace: "+mn-lt", catGridLine: { style: "none" },
    valAxisHidden: true, valAxisMaxVal: 110, valGridLine: { style: "none" }, showLegend: false
  });
  txt(s, "Quelle: BMEL, Forsa, Ernährungsreport 2024 (1 001 Befragte)", { x: M, y: 11.05, w: CW, h: 0.3, fontSize: 12, color: C.accent6 });
  txt(s, "Ein niedriger Preis ist nur 55 % wichtig. Für gesundheitsorientierte Kunden zählen Qualität, Herkunft und Haltung.", { x: M, y: 11.5, w: CW, h: 1.0, fontSize: 18 });
  s.addNotes("Mehrfachnennungen möglich. Befragt wurden Menschen in Deutschland ab 14 Jahren.");

  // ===== 17 Nach der Situation =====
  s = content("Kundentypen", "1.2.2 NACH DER SITUATION · S. 176", "Es kommt auf die Situation an");
  const sits = [
    [fa.FaHourglassHalf, "Eilige Kunden", "Großer Zeitdruck.", "Schnellscannerkassen anbieten, Laufwege optimieren."],
    [fa.FaMoon, "Späte Kunden", "Kurz vor Ladenschluss, meist mit klarem Wunsch.", "Flexibel bleiben, gezielt fragen, beschleunigen."],
    [fa.FaConciergeBell, "Serviceorientierte Kunden", "Wollen perfekten Service und Beratung.", "Zusatzleistungen wie Umtausch und einfache Rückgabe."],
    [fa.FaUserSecret, "Showroomer", "Lassen sich beraten, kaufen dann online oder woanders.", "Mitgliedschaftsvorteile oder Garantien anbieten."]
  ];
  for (let i = 0; i < sits.length; i++) {
    const [Comp, h, who, tip] = sits[i];
    const y = 2.5 + i * 2.3;
    card(s, M, y, CW, 2.1);
    await iconCircle(s, Comp, M + 0.3, y + 0.3, 0.8);
    txt(s, h, { x: M + 1.3, y: y + 0.25, w: CW - 1.6, h: 0.45, fontSize: 20, bold: true });
    txt(s, who, { x: M + 1.3, y: y + 0.7, w: CW - 1.6, h: 0.62, fontSize: 17, color: C.accent6 });
    txt(s, [{ text: "→ ", options: { bold: true, color: HEX.good } }, { text: tip, options: { bold: true } }], { x: M + 0.3, y: y + 1.38, w: CW - 0.6, h: 0.62, fontSize: 17 });
  }
  term(s, "Showroomer", "auch „Beratungsdiebe“ genannt. Sie suchen den günstigsten Preis.", 11.7, 0.85);
  s.addNotes("Showroomer: Lernfeld 10, Kapitel 3.1.");

  // ===== 18 + 19 Nach dem Charakter =====
  const chars = [
    ["Sachverständig", "„Ich kenne mich aus. Kann ich beide Modelle ausprobieren?“", "Viel Wissen, klarer Kaufwunsch, vergleicht Marken.", "Kompetent und detailliert beraten, ausprobieren lassen."],
    ["Skeptisch", "„Stimmt das wirklich? Die Bewertungen sind gemischt.“", "Misstrauisch, recherchiert, entscheidet nach reiflicher Überlegung.", "Offen und ehrlich, nicht übertreiben, Garantie oder Probezeit anbieten."],
    ["Interessiert", "„Ist die Jacke wasserdicht? Wie pflege ich sie?“", "Will eine bestimmte Ware, braucht mehr Informationen.", "Umfassend beraten, z. B. mit Broschüren. Vorteile zeigen."],
    ["Gesprächsfreudig", "„Mein Enkel hat auch so eine Uhr. Wie finden Sie die?“", "Erzählt gern, stellt viele Fragen, Einkauf als Erlebnis.", "Echtes Interesse zeigen, aktiv zuhören, ausführlich antworten."],
    ["Unentschlossen", "„Die blaue oder doch die graue? Oder die erste?“", "Unsicher, wägt lange ab, schwankt.", "Wenige Artikel vorlegen, Vor- und Nachteile klar gegenüberstellen, Empfehlung geben."]
  ];
  async function charSlide(list, kicker) {
    const sl = content("Kundentypen", kicker, "Kundentypen nach dem Charakter");
    for (let i = 0; i < list.length; i++) {
      const [h, said, who, tip] = list[i];
      const y = 2.5 + i * 3.4;
      card(sl, M, y, CW, 3.15);
      pill(sl, h, M + 0.3, y + 0.3, C.accent1, 2.6);
      txt(sl, said, { x: M + 0.3, y: y + 0.85, w: CW - 0.6, h: 0.75, fontSize: 18, italic: true, bold: true, fontFace: THEME.headFontFace });
      txt(sl, who, { x: M + 0.3, y: y + 1.62, w: CW - 0.6, h: 0.7, fontSize: 17, color: C.accent6 });
      txt(sl, [{ text: "→ ", options: { bold: true, color: HEX.good } }, { text: tip, options: { bold: true } }], { x: M + 0.3, y: y + 2.3, w: CW - 0.6, h: 0.75, fontSize: 17 });
    }
    return sl;
  }
  s = await charSlide(chars.slice(0, 3), "1.2.3 NACH DEM CHARAKTER · S. 176–177");
  s.addNotes("Bei skeptischen Kunden sind Geduld, Zuhören und Einfühlungsvermögen wahre Türöffner.");
  s = await charSlide(chars.slice(3), "1.2.3 NACH DEM CHARAKTER · S. 177");
  await merke(s, "Hören Sie genau zu: Die Äußerungen der Kunden verraten den Typ. Passen Sie Ihre Beratung daran an.", 9.6, 2.0);
  s.addNotes("Die Beispielsätze sind ausgedacht. Sie helfen, die Kundentypen im Gespräch zu erkennen.");

  // ===== 20 Abschluss =====
  pres.addSection({ title: "Abschluss" });
  s = pres.addSlide({ masterName: "Abschluss dunkel", sectionTitle: "Abschluss" });
  s.addText("DAS WICHTIGSTE IN 5 SÄTZEN", { placeholder: "kicker" });
  s.addText("Jetzt sind Sie dran", { placeholder: "title" });
  const sum = [
    "Merkmale wie Alter oder Geschlecht bilden Kundengruppen. Vorsicht vor Klischees.",
    "Bei Kindern und Jugendlichen gelten Geschäftsfähigkeit und Jugendschutz.",
    "Die Generation 50plus ist kaufkräftig und braucht guten Service.",
    "Internationale Kunden: langsam sprechen, Ware zeigen, Symbole nutzen.",
    "Kundentypen erkennen Sie am Kaufmotiv, an der Situation und am Charakter."
  ];
  sum.forEach((t, i) => {
    const y = 2.75 + i * 1.32;
    s.addShape(pres.shapes.OVAL, { x: M, y, w: 0.6, h: 0.6, fill: { color: C.accent5 }, line: { type: "none" }, objectName: "Nummer" });
    txt(s, String(i + 1), { x: M, y, w: 0.6, h: 0.6, fontSize: 20, bold: true, color: C.accent1, align: "center", valign: "middle", fontFace: THEME.headFontFace });
    txt(s, t, { x: M + 0.85, y: y - 0.05, w: CW - 0.85, h: 1.15, fontSize: 18, color: C.background1 });
  });
  card(s, M, 9.6, CW, 3.0, { fill: C.background1, name: "Auftrag" });
  await iconCircle(s, fa.FaMobileAlt, M + 0.3, 9.9, 0.85);
  txt(s, "Öffnen Sie jetzt die Online-Übung", { x: M + 1.4, y: 9.9, w: CW - 1.7, h: 0.85, fontSize: 20, bold: true, valign: "middle" });
  txt(s, "Den Link erhalten Sie von Ihrer Lehrkraft. Bearbeiten Sie alle fünf Stationen und machen Sie am Ende einen Screenshot vom Nachweis.", { x: M + 0.3, y: 11.0, w: CW - 0.6, h: 1.45, fontSize: 18, color: C.accent6 });
  s.addNotes("Die Online-Übung ist eine Webseite für das Smartphone. Ergebnisse werden nur auf dem eigenen Gerät gespeichert.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("geschrieben:", OUT);
})().catch(e => { console.error(e); process.exit(1); });
