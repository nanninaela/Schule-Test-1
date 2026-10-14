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

  // ---------- Zusätzliches Layout für die Partnerarbeit ----------
  pres.defineSlideMaster({
    title: "Aufgabe dunkel",
    background: { color: C.text2 },
    objects: [
      { placeholder: { options: { name: "kicker", type: "body", x: M, y: 0.45, w: 9, h: 0.35, fontSize: 12, bold: true, color: C.accent5, charSpacing: 3, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: M, y: 0.85, w: 12.1, h: 1.55, fontSize: 30, bold: true, color: C.background1, valign: "top", align: "left", margin: 0 }, text: "" } }
    ]
  });

  // ===== 1 Titel =====
  pres.addSection({ title: "Einführung" });
  let s = pres.addSlide({ masterName: "Titel dunkel", sectionTitle: "Einführung" });
  s.addText("EINFÜHRUNG IN DAS VERKAUFSTRAINING", { placeholder: "kicker" });
  s.addText("Das Verkaufsgespräch", { placeholder: "title" });
  s.addText("Warum es auf das Gespräch ankommt und wie es beginnt: Phase 1, die Kontaktaufnahme", { placeholder: "body" });
  const names = ["Frau Becker", "Herr Albers", "Herr Yilmaz", "Herr Brenner", "Lea"];
  const pos = [[8.9, 1.2], [10.9, 1.9], [8.6, 3.3], [10.6, 4.0], [9.0, 5.25]];
  for (let i = 0; i < names.length; i++) {
    s.addImage({ data: await figurePng(names[i]), x: pos[i][0], y: pos[i][1], w: 1.9, h: 1.9, altText: "Kundenfigur " + names[i] });
  }
  s.addNotes("Begrüßung der Klasse. Die fünf Figuren sind die Kundinnen und Kunden aus der Übungs-App, mit der später geübt wird. Heute geht es um den Einstieg ins Thema und um die erste Phase des Verkaufsgesprächs.");

  // ===== 2 Warum Verkaufsgespräche =====
  s = content("Einführung", "WARUM DAS WICHTIG IST", "Beratung ist der Vorteil des Geschäfts vor Ort");
  await iconRows(s, [
    [fa.FaComments, "Persönliche Beratung", "Fragen stellen und eine Antwort bekommen, die genau zur eigenen Situation passt."],
    [fa.FaHandHolding, "Ausprobieren und anfassen", "Schuhe anprobieren, Kaffee probieren, am Duft riechen. Das geht nur im Laden."],
    [fa.FaUserFriends, "Ein Mensch als Ansprechperson", "Jemand, der sich Zeit nimmt und bei Problemen weiterhilft, auch nach dem Kauf."]
  ], M, 1.9, 7.2, 1.45);
  card(s, 8.4, 1.9, 4.33, 4.75, { fill: C.text2 });
  txt(s, "Das Ziel", { x: 8.75, y: 2.2, w: 3.7, h: 0.4, fontSize: 14, bold: true, color: C.accent5, charSpacing: 2 });
  txt(s, "Kundinnen und Kunden so beraten, dass sie zufrieden sind und wiederkommen.", { x: 8.75, y: 2.65, w: 3.7, h: 2.1, fontSize: 21, color: C.background1, fontFace: THEME.headFontFace });
  txt(s, "Fachbegriff: Kundenbindung", { x: 8.75, y: 5.75, w: 3.7, h: 0.5, fontSize: 15, bold: true, color: C.accent5 });
  s.addNotes("Impuls: Warum kaufen Menschen überhaupt noch im Geschäft, wenn es online oft billiger ist? Antworten sammeln, dann die drei Punkte zeigen. Ein gutes Verkaufsgespräch ist das, was der Laden dem Onlinehandel voraushat.");

  // ===== 3 Lernziele =====
  s = content("Einführung", "WORUM ES HEUTE GEHT", "Nach dieser Stunde können Sie …");
  await iconRows(s, [
    [fa.FaListOl, "die 8 Phasen eines Verkaufsgesprächs nennen", "Sie kennen den Ablauf vom ersten Kontakt bis zur Verabschiedung."],
    [fa.FaClock, "den richtigen Moment für die Ansprache erkennen", "Sie deuten das Verhalten der Kundschaft: ansprechen oder noch warten?"],
    [fa.FaSmile, "Kundinnen und Kunden freundlich und passend ansprechen", "Mit Körpersprache, Begrüßung und einer warenbezogenen Ansprache."]
  ], M, 1.9, 7.6, 1.45);
  s.addImage({ data: await figurePng("Frau Becker"), x: 9.35, y: 2.0, w: 2.6, h: 2.6, altText: "Kundenfigur Frau Becker" });
  txt(s, "Frau Becker steht vor dem Regal. Wie sprechen Sie sie an?", { x: 8.75, y: 4.85, w: 3.8, h: 0.9, fontSize: 17, italic: true, align: "center", fontFace: THEME.headFontFace });
  s.addNotes("Lernziele kurz vorlesen. Die Frage zu Frau Becker bleibt offen und wird im Lauf der Stunde beantwortet.");

  // ===== 4 Die 8 Phasen, Phase 1 hervorgehoben =====
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
    const on = i === 0;
    card(s, x, y, cw, ch, { fill: on ? C.accent1 : C.background1, noShadow: !on });
    s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: y + 0.25, w: 0.62, h: 0.62, fill: { color: on ? C.background1 : "D9DEE5" }, line: { type: "none" }, objectName: "Phasennummer" });
    txt(s, String(i + 1), { x: x + 0.25, y: y + 0.25, w: 0.62, h: 0.62, fontSize: 20, bold: true, color: on ? C.accent1 : C.accent6, align: "center", valign: "middle", fontFace: THEME.headFontFace });
    if (on) pill(s, "Heute", x + cw - 1.25, y + 0.4, C.accent2, 1.0);
    txt(s, h, { x: x + 0.25, y: y + 0.98, w: cw - 0.4, h: 0.62, fontSize: 15, bold: true, color: on ? C.background1 : C.text1 });
    txt(s, b, { x: x + 0.25, y: y + 1.66, w: cw - 0.5, h: 0.4, fontSize: 14, color: on ? C.accent5 : C.accent6 });
  });
  s.addNotes("Den Ablauf einmal vorstellen, ohne ins Detail zu gehen. Die Reihenfolge ist kein Zufall: Wer ohne Fragen sofort Ware zeigt, verkauft am Bedarf vorbei. Heute geht es nur um Phase 1. Die übrigen Phasen folgen in den nächsten Stunden.");

  // ===== 5 Phase 1: Was gehört dazu =====
  pres.addSection({ title: "Phase 1" });
  s = content("Phase 1", "PHASE 1 · KONTAKTAUFNAHME", "Der erste Eindruck entscheidet", 1);
  const steps = [
    [fa.FaWalking, "Hingehen", "Gehen Sie auf die Kundschaft zu, statt aus der Ferne zu rufen oder an der Kasse zu warten."],
    [fa.FaHandshake, "Begrüßen", "„Guten Tag!“: freundlich, deutlich und mit Blickkontakt."],
    [fa.FaTag, "Ansprechen", "Mit einer Frage oder Bemerkung, die ein Gespräch eröffnet, am besten bezogen auf die Ware."]
  ];
  for (let i = 0; i < steps.length; i++) {
    const x = M + i * 4.13, w = 3.83;
    card(s, x, 1.9, w, 3.0);
    await iconCircle(s, steps[i][0], x + 0.3, 2.15, 0.75);
    txt(s, (i + 1) + ". " + steps[i][1], { x: x + 0.3, y: 3.1, w: w - 0.6, h: 0.45, fontSize: 20, bold: true, fontFace: THEME.headFontFace });
    txt(s, steps[i][2], { x: x + 0.3, y: 3.62, w: w - 0.6, h: 1.15, fontSize: 15, color: C.accent6 });
    if (i < 2) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + w + 0.02, y: 3.2, w: 0.26, h: 0.32, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Pfeil" });
  }
  card(s, M, 5.2, 12.13, 1.45, { fill: C.accent5, noShadow: true });
  await iconCircle(s, fa.FaLightbulb, M + 0.3, 5.6, 0.65, C.background1);
  txt(s, [{ text: "Merke: ", options: { bold: true } }, { text: "Die Kundschaft entscheidet in den ersten Sekunden, ob sie sich willkommen fühlt. Ein schlechter Start lässt sich später nur schwer ausgleichen." }], { x: M + 1.2, y: 5.45, w: 10.6, h: 0.95, fontSize: 17, valign: "middle" });
  s.addNotes("Die drei Schritte gehören zusammen. Fragen Sie: Was passiert, wenn man einen davon weglässt? Zum Beispiel begrüßen, aber nicht hingehen, oder hingehen, aber nichts sagen.");

  // ===== 6 Körpersprache =====
  s = content("Phase 1", "PHASE 1 · KONTAKTAUFNAHME", "Die Körpersprache spricht zuerst", 1);
  const body = [
    [fa.FaEye, "Blickkontakt", "zeigt: Ich habe Sie bemerkt."],
    [fa.FaSmile, "Lächeln", "wirkt offen und einladend."],
    [fa.FaChild, "Offene Haltung", "keine verschränkten Arme, Hände nicht in den Taschen."],
    [fa.FaArrowsAltH, "Passender Abstand", "etwa eine Armlänge, nicht zu nah herantreten."]
  ];
  for (let i = 0; i < body.length; i++) {
    const x = M + i * 3.1, w = 2.85;
    card(s, x, 1.9, w, 2.5);
    await iconCircle(s, body[i][0], x + 0.3, 2.1, 0.7);
    txt(s, body[i][1], { x: x + 0.3, y: 2.95, w: w - 0.6, h: 0.45, fontSize: 18, bold: true });
    txt(s, body[i][2], { x: x + 0.3, y: 3.42, w: w - 0.6, h: 0.9, fontSize: 15, color: C.accent6 });
  }
  [["Ungünstig", C.accent3, "Seufzen, weiter aufräumen, auf die Uhr schauen", "Signalisiert: Sie stören. Das merkt die Kundschaft sofort, auch ohne ein Wort.", M],
   ["Besser", C.accent2, "Arbeit zur Seite legen und sich zuwenden", "Signalisiert: Sie sind jetzt wichtiger als alles andere.", 6.78]].forEach(([lab, col, said, rep, x]) => {
    card(s, x, 4.65, 5.95, 2.05);
    pill(s, lab, x + 0.3, 4.9, col, 1.5);
    txt(s, said, { x: x + 0.3, y: 5.35, w: 5.35, h: 0.45, fontSize: 17, bold: true, italic: true });
    txt(s, rep, { x: x + 0.3, y: 5.85, w: 5.35, h: 0.7, fontSize: 14, color: C.accent6 });
  });
  s.addNotes("Kurze Übung im Stehen: Zwei Freiwillige zeigen einmal eine abweisende und einmal eine offene Haltung, ohne zu sprechen. Die Klasse beschreibt die Wirkung. Das Beispiel unten stammt aus dem Szenario „Regenjacke um 19:52 Uhr“.");

  // ===== 7 Der richtige Zeitpunkt =====
  s = content("Phase 1", "PHASE 1 · KONTAKTAUFNAHME", "Wann ist der richtige Moment?", 1);
  card(s, M, 1.9, 5.95, 3.6);
  pill(s, "Jetzt ansprechen", M + 0.3, 2.15, C.accent2, 1.9);
  txt(s, [
    { text: "Die Kundin schaut sich suchend um.", options: { bullet: true, breakLine: true } },
    { text: "Der Kunde nimmt Ware in die Hand oder bleibt länger stehen.", options: { bullet: true, breakLine: true } },
    { text: "Jemand sucht Blickkontakt mit Ihnen.", options: { bullet: true, breakLine: true } },
    { text: "Jemand ist sichtlich in Eile.", options: { bullet: true } }
  ], { x: M + 0.3, y: 2.7, w: 5.35, h: 2.6, fontSize: 16, paraSpaceAfter: 8 });
  card(s, 6.78, 1.9, 5.95, 3.6);
  pill(s, "Noch warten", 7.08, 2.15, C.accent4, 1.6);
  txt(s, [
    { text: "Die Kundin kommt gerade erst zur Tür herein.", options: { bullet: true, breakLine: true } },
    { text: "Der Kunde stöbert entspannt und will sich erst orientieren.", options: { bullet: true, breakLine: true } },
    { text: "Jemand telefoniert gerade.", options: { bullet: true, breakLine: true } },
    { text: "Dann: kurz begrüßen und Zeit lassen, aber in der Nähe bleiben.", options: { bullet: true } }
  ], { x: 7.08, y: 2.7, w: 5.35, h: 2.6, fontSize: 16, paraSpaceAfter: 8 });
  card(s, M, 5.8, 5.95, 0.9, { fill: "F8E1DE", noShadow: true });
  txt(s, [{ text: "Zu früh: ", options: { bold: true, color: HEX.bad } }, { text: "wirkt aufdringlich." }], { x: M + 0.3, y: 5.8, w: 5.35, h: 0.9, fontSize: 17, valign: "middle" });
  card(s, 6.78, 5.8, 5.95, 0.9, { fill: "F8E1DE", noShadow: true });
  txt(s, [{ text: "Zu spät: ", options: { bold: true, color: HEX.bad } }, { text: "Die Kundschaft fühlt sich ignoriert." }], { x: 7.08, y: 5.8, w: 5.35, h: 0.9, fontSize: 17, valign: "middle" });
  s.addNotes("Die beiden Fehler unten tauchen in der Partnerarbeit am Ende sehr wahrscheinlich wieder auf. Darauf können Sie bei der Auswertung zurückkommen.");

  // ===== 8 Arten der Ansprache =====
  s = content("Phase 1", "PHASE 1 · KONTAKTAUFNAHME", "So sprechen Sie Kundinnen und Kunden an", 1);
  const kinds = [
    ["Begrüßung", C.accent1, "„Guten Tag! Schauen Sie sich gern in Ruhe um.“", "Passt, wenn die Kundschaft erst stöbern möchte. Sie zeigen: Ich bin da."],
    ["Warenbezogene Ansprache", C.accent2, "„Das ist unser AeroRun, ein sehr beliebter Laufschuh. Laufen Sie eher auf der Straße oder im Gelände?“", "Am besten: Sie knüpfen an die Ware an und eröffnen sofort ein Gespräch."],
    ["Geschlossene Frage", C.accent3, "„Kann ich Ihnen helfen?“", "Ungünstig: Darauf antworten viele reflexartig „Nein danke, ich schaue nur“."]
  ];
  kinds.forEach(([h, col, ex, eff], i) => {
    const x = M + i * 4.13, w = 3.83;
    card(s, x, 1.9, w, 4.75);
    txt(s, h, { x: x + 0.3, y: 2.15, w: w - 0.6, h: 0.8, fontSize: 20, bold: true, color: col, fontFace: THEME.headFontFace });
    txt(s, ex, { x: x + 0.3, y: 3.0, w: w - 0.6, h: 1.9, fontSize: 17, italic: true });
    txt(s, eff, { x: x + 0.3, y: 5.0, w: w - 0.6, h: 1.45, fontSize: 14, color: C.accent6 });
  });
  s.addNotes("Hier lässt sich die Frage zu Frau Becker von Folie 3 auflösen: Die warenbezogene Ansprache ist die beste Wahl, weil sie den Schuh in der Hand hält. Lassen Sie die Klasse eigene warenbezogene Ansprachen für ein Smartphone oder eine Jacke formulieren.");

  // ===== 9 Je nach Kundschaft =====
  s = content("Phase 1", "PHASE 1 · KONTAKTAUFNAHME", "Jede Kundschaft braucht einen anderen Einstieg", 1);
  const types = [
    ["Herr Albers", "Älterer Kunde", "„Guten Tag! Sie schauen sich die Smartphones an. Suchen Sie eines für sich selbst?“", "ruhig und deutlich sprechen"],
    ["Herr Yilmaz", "Kurz vor Ladenschluss", "„Guten Abend! Sie haben es eilig, wobei kann ich Ihnen helfen?“", "Arbeit unterbrechen, Eile ansprechen"],
    ["Herr Brenner", "Gut informiert", "„Guten Tag! Ich sehe, Sie vergleichen schon. Welche Modelle haben Sie sich angeschaut?“", "Vorwissen anerkennen"],
    ["Lea", "Unentschlossen", "„Hallo! Suchen Sie einen Duft für sich oder ein Geschenk?“", "Alternativfrage gibt Orientierung"]
  ];
  for (let i = 0; i < types.length; i++) {
    const [who, t, said, tip] = types[i];
    const x = M + i * 3.1, w = 2.85;
    card(s, x, 1.9, w, 4.75);
    s.addImage({ data: await figurePng(who), x: x + (w - 1.3) / 2, y: 2.05, w: 1.3, h: 1.3, altText: "Kundenfigur " + who });
    txt(s, t, { x: x + 0.25, y: 3.45, w: w - 0.5, h: 0.4, fontSize: 16, bold: true, align: "center", color: C.accent1 });
    txt(s, said, { x: x + 0.25, y: 3.95, w: w - 0.5, h: 1.75, fontSize: 14, italic: true });
    txt(s, tip, { x: x + 0.25, y: 5.8, w: w - 0.5, h: 0.6, fontSize: 14, bold: true, color: C.accent2 });
  }
  s.addNotes("Alle vier Beispiele sind die besten Antworten aus der ersten Phase der App-Szenarien. Wer möchte, kann die Kontaktaufnahme in der App gleich ausprobieren: Die Kundenfigur reagiert sofort auf die gewählte Ansprache.");

  // ===== 10 Partnerarbeit =====
  pres.addSection({ title: "Partnerarbeit" });
  s = pres.addSlide({ masterName: "Aufgabe dunkel", sectionTitle: "Partnerarbeit" });
  s.addText("PARTNERARBEIT · 5 MINUTEN", { placeholder: "kicker" });
  s.addText("Denken Sie an Ihren letzten Einkauf. Wurden Sie begrüßt oder angesprochen? Wie war das für Sie?", { placeholder: "title" });
  const tasks = [
    [fa.FaUser, "Denken Sie allein nach", "1 Min.", "Erinnern Sie sich an eine Situation, z. B. im Supermarkt, im Kleidergeschäft, in der Bäckerei oder in der Drogerie."],
    [fa.FaComments, "Tauschen Sie sich aus", "2 Min.", "Erzählen Sie Ihrer Partnerin oder Ihrem Partner Ihre Situation. War das angenehm oder unangenehm? Warum?"],
    [fa.FaBullhorn, "Berichten Sie", "2 Min.", "Was ist Ihnen aufgefallen? Zwei oder drei Paare berichten kurz."]
  ];
  for (let i = 0; i < tasks.length; i++) {
    const [Comp, h, time, b] = tasks[i];
    const x = M + i * 4.13, w = 3.83;
    card(s, x, 2.75, w, 3.85);
    await iconCircle(s, Comp, x + 0.3, 3.0, 0.75);
    pill(s, time, x + w - 1.3, 3.2, C.accent1, 1.0);
    txt(s, (i + 1) + ". " + h, { x: x + 0.3, y: 3.95, w: w - 0.6, h: 0.5, fontSize: 19, bold: true, fontFace: THEME.headFontFace });
    txt(s, b, { x: x + 0.3, y: 4.5, w: w - 0.6, h: 1.95, fontSize: 16, color: C.text1 });
  }
  s.addNotes("Für die Lehrkraft: Sammeln Sie die Stichwörter an der Tafel (z. B. „aufdringlich“, „freundlich“, „ignoriert“, „zu früh angesprochen“). Anschließend lassen sich die Stichwörter den Inhalten der Stunde zuordnen: Körpersprache, richtiger Zeitpunkt, Art der Ansprache.");

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("geschrieben:", OUT);
})().catch(e => { console.error(e); process.exit(1); });
