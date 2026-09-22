/* Art of Imaging v0.1.0 — Art of Imaging for GRAPHY-Next
 * https://github.com/tatsunidas/graphy-next-plugin-art
 * 研究・教育・芸術表現の目的。診断機器ではありません。
 * このファイルは tools/build.mjs が src/ から生成します。直接編集しないこと。
 */

// src/ui/dom.ts
function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "style" && typeof v === "object" && v) {
      Object.assign(node.style, v);
    } else if (k === "dataset" && typeof v === "object" && v) {
      Object.assign(node.dataset, v);
    } else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (v != null) {
      node[k] = v;
    }
  }
  for (const c of children) {
    if (c == null) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}
function makeDraggable(panel, handle) {
  let startX = 0;
  let startY = 0;
  let baseX = 0;
  let baseY = 0;
  handle.style.cursor = "move";
  handle.addEventListener("pointerdown", (e) => {
    if (e.target.tagName === "BUTTON") return;
    const rect = panel.getBoundingClientRect();
    baseX = rect.left;
    baseY = rect.top;
    startX = e.clientX;
    startY = e.clientY;
    handle.setPointerCapture(e.pointerId);
    const move = (ev) => {
      panel.style.left = `${baseX + ev.clientX - startX}px`;
      panel.style.top = `${baseY + ev.clientY - startY}px`;
      panel.style.transform = "none";
    };
    const up = (ev) => {
      handle.releasePointerCapture(ev.pointerId);
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
  });
}
function stopWheelPropagation(panel) {
  panel.addEventListener("wheel", (e) => e.stopPropagation(), { passive: true });
}

// src/i18n/messages.ts
var JA = {
  title: "Art of Imaging",
  subtitle: "\u753B\u50CF\u79D1\u5B66\u3068\u7F8E\u5B66\u3092\u7D50\u3076\u4F5C\u54C1\u3092\u3064\u304F\u308B",
  step1: "1. \u4F5C\u98A8\u3068\u753B\u5BB6",
  style: "\u69D8\u5F0F",
  styleAll: "\u3059\u3079\u3066\u306E\u69D8\u5F0F",
  searchPainter: "\u753B\u5BB6\u3092\u691C\u7D22\uFF08\u90E8\u5206\u4E00\u81F4\uFF09",
  noPainter: "\u8A72\u5F53\u3059\u308B\u753B\u5BB6\u304C\u3044\u307E\u305B\u3093",
  selected: "\u9078\u629E\u4E2D",
  pdNote: "\u53CE\u9332\u3057\u3066\u3044\u308B\u306E\u306F\u30D1\u30D6\u30EA\u30C3\u30AF\u30C9\u30E1\u30A4\u30F3\u306E\u753B\u5BB6\u306E\u307F\u3067\u3059\uFF08\u6CA1\u5E74 1944 \u5E74\u4EE5\u524D\u3002\u65E5\u672C\u306E\u6226\u6642\u52A0\u7B97\u3092\u8003\u616E\uFF09\u3002",
  step2: "2. \u30B5\u30A4\u30F3",
  signatureText: "\u30B5\u30A4\u30F3\u306E\u6587\u5B57",
  signaturePosition: "\u4F4D\u7F6E",
  signatureFont: "\u30D5\u30A9\u30F3\u30C8",
  signatureSize: "\u5927\u304D\u3055",
  signatureColorNote: "\u8272\u306F\u9ED2\u306E\u307F\u3067\u3059\u3002\u65E5\u672C\u8A9E\u306E\u30B5\u30A4\u30F3\u306F OS \u306B\u3088\u3063\u3066\u5B57\u5F62\u304C\u5909\u308F\u308A\u307E\u3059\u3002",
  step3: "3. \u5143\u753B\u50CF",
  bodyPart: "\u90E8\u4F4D\uFF08\u4EFB\u610F\uFF09",
  bodyPartNone: "\u6307\u5B9A\u3057\u306A\u3044",
  bodyPartNote: "DICOM \u304B\u3089\u90E8\u4F4D\u306F\u8AAD\u307F\u51FA\u305B\u306A\u3044\u305F\u3081\u3001\u5FC5\u8981\u306A\u3089\u4E00\u89A7\u304B\u3089\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002",
  sourcePreview: "\u9001\u4FE1\u3059\u308B\u753B\u50CF",
  generate: "\u4F5C\u54C1\u3092\u751F\u6210\u3059\u308B",
  generating: "\u751F\u6210\u4E2D\u2026",
  save: "\u540D\u524D\u3092\u4ED8\u3051\u3066\u4FDD\u5B58",
  close: "\u9589\u3058\u308B",
  result: "\u751F\u6210\u7D50\u679C",
  resultModality: "\u30E2\u30C0\u30EA\u30C6\u30A3",
  resultSubject: "\u753B\u50CF\u306B\u5199\u3063\u3066\u3044\u308B\u3082\u306E",
  resultAppreciation: "\u9451\u8CDE\u306E\u305F\u3081\u306B",
  caveat: "\u3053\u306E\u8AAC\u660E\u306F AI \u304C\u751F\u6210\u3057\u305F\u9451\u8CDE\u7528\u306E\u8A18\u8FF0\u3067\u3042\u308A\u3001\u8A3A\u65AD\u30FB\u6240\u898B\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002\u7814\u7A76\u30FB\u6559\u80B2\u30FB\u82B8\u8853\u8868\u73FE\u306E\u76EE\u7684\u306B\u306E\u307F\u4F7F\u7528\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  modalityNote: "\u30E2\u30C0\u30EA\u30C6\u30A3\u306F DICOM \u306E\u5024\u3067\u3059\uFF08AI \u306E\u51FA\u529B\u3067\u306F\u4E0A\u66F8\u304D\u3057\u3066\u3044\u307E\u305B\u3093\uFF09\u3002",
  errNoTarget: "\u5BFE\u8C61\u306E\u753B\u50CF\u304C\u3042\u308A\u307E\u305B\u3093\u30022D \u30D3\u30E5\u30FC\u30A2\u3067\u753B\u50CF\u3092\u958B\u3044\u3066\u304B\u3089\u5B9F\u884C\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  errNoPixels: "\u753B\u7D20\u3092\u8AAD\u307F\u51FA\u305B\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  errNoPainter: "\u753B\u5BB6\u3092 1 \u540D\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002",
  errNoKey: "Gemini \u306E API \u30AD\u30FC\u304C\u672A\u8A2D\u5B9A\u3067\u3059\u3002\u74B0\u5883\u8A2D\u5B9A \uFF1E \u5916\u90E8 AI \u3067\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  errPermission: "\u3053\u306E\u30D7\u30E9\u30B0\u30A4\u30F3\u306B\u306F\u5916\u90E8\u9001\u4FE1\u306E\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
  errDesktopOnly: "\u3053\u306E\u6A5F\u80FD\u306F\u30C7\u30B9\u30AF\u30C8\u30C3\u30D7\u7248\u3067\u306E\u307F\u5229\u7528\u3067\u304D\u307E\u3059\u3002",
  errNoImage: "\u753B\u50CF\u304C\u8FD4\u308A\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  errBlocked: "\u751F\u6210\u304C\u62D2\u5426\u3055\u308C\u307E\u3057\u305F\uFF08\u7406\u7531: {reason}\uFF09\u3002\u30D7\u30ED\u30F3\u30D7\u30C8\u3084\u753B\u50CF\u3092\u5909\u3048\u3066\u8A66\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  errBusy: "\u524D\u306E\u751F\u6210\u304C\u307E\u3060\u5B9F\u884C\u4E2D\u3067\u3059\u3002",
  errGeneric: "\u751F\u6210\u306B\u5931\u6557\u3057\u307E\u3057\u305F: {error}",
  saved: "\u4FDD\u5B58\u3057\u307E\u3057\u305F: {path}",
  saveFailed: "\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F: {error}",
  privacyTitle: "\u500B\u4EBA\u60C5\u5831\u306E\u53D6\u308A\u6271\u3044",
  privacy1: "\u753B\u50CF\u306F\u7B2C\u4E09\u8005\uFF08Google\uFF09\u306E\u30AF\u30E9\u30A6\u30C9\u3078\u9001\u4FE1\u3055\u308C\u307E\u3059\u3002\u9662\u5185\u898F\u7A0B\u30FB\u502B\u7406\u5BE9\u67FB\u30FB\u60A3\u8005\u540C\u610F\u306E\u7BC4\u56F2\u5185\u3067\u306E\u307F\u4F7F\u7528\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  privacy2: "\u753B\u7D20\u306B\u713C\u304D\u8FBC\u307E\u308C\u305F\u60A3\u8005\u60C5\u5831\u306F\u53D6\u308A\u9664\u304B\u308C\u307E\u305B\u3093\u3002\u4E0A\u306E\u30D7\u30EC\u30D3\u30E5\u30FC\u3067\u5FC5\u305A\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  privacy3: "\u7121\u6599\u67A0\u3067\u306F\u5165\u529B\u304C\u30E2\u30C7\u30EB\u6539\u5584\u306B\u5229\u7528\u3055\u308C\u5F97\u307E\u3059\u3002\u60A3\u8005\u7531\u6765\u306E\u753B\u50CF\u306F\u6709\u6599\u30C6\u30A3\u30A2\u3067\u6271\u3063\u3066\u304F\u3060\u3055\u3044\u3002"
};
var EN = {
  title: "Art of Imaging",
  subtitle: "Create a work that connects imaging science with aesthetics",
  step1: "1. Style and painter",
  style: "Style",
  styleAll: "All styles",
  searchPainter: "Search painters (substring)",
  noPainter: "No matching painter",
  selected: "Selected",
  pdNote: "Only public-domain painters are listed (died 1944 or earlier, allowing for Japan's wartime extension).",
  step2: "2. Signature",
  signatureText: "Signature text",
  signaturePosition: "Position",
  signatureFont: "Font",
  signatureSize: "Size",
  signatureColorNote: "Black only. A Japanese signature will look different depending on the OS.",
  step3: "3. Source image",
  bodyPart: "Body part (optional)",
  bodyPartNone: "Not specified",
  bodyPartNote: "The body part cannot be read from DICOM here, so pick one from the list if you want it included.",
  sourcePreview: "Image to be sent",
  generate: "Generate artwork",
  generating: "Generating...",
  save: "Save as",
  close: "Close",
  result: "Result",
  resultModality: "Modality",
  resultSubject: "What is shown",
  resultAppreciation: "How to look at it",
  caveat: "This description is an AI-generated appreciation note, not a diagnosis or a radiological finding. Use it for research, education and artistic expression only.",
  modalityNote: "The modality comes from DICOM (it is not overwritten by the model's output).",
  errNoTarget: "No target image. Open an image in the 2D viewer first.",
  errNoPixels: "Could not read the pixel data.",
  errNoPainter: "Select one painter.",
  errNoKey: "The Gemini API key is not set. Configure it in Settings > External AI.",
  errPermission: "This plugin does not have permission to send data externally.",
  errDesktopOnly: "This feature is available in the desktop app only.",
  errNoImage: "No image was returned.",
  errBlocked: "Generation was refused (reason: {reason}). Try a different prompt or image.",
  errBusy: "A previous generation is still running.",
  errGeneric: "Generation failed: {error}",
  saved: "Saved: {path}",
  saveFailed: "Failed to save: {error}",
  privacyTitle: "Handling of personal information",
  privacy1: "The image is sent to a third-party (Google) cloud service. Use it only within your institution's policies, ethics approval and patient consent.",
  privacy2: "Patient information burned into the pixels is not removed. Always check the preview above.",
  privacy3: "On the free tier your input may be used to improve the model. Use a paid tier for patient-derived images."
};
function makeT(locale) {
  const dict = locale === "en" ? EN : JA;
  return (key, vars) => {
    let s = dict[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
    return s;
  };
}

// src/core/painters.ts
var PAINTERS = [
  // ── ルネサンス／初期フランドル ──────────────────────────────────────────
  { id: "leonardo", nameJa: "\u30EC\u30AA\u30CA\u30EB\u30C9\u30FB\u30C0\u30FB\u30F4\u30A3\u30F3\u30C1", nameEn: "Leonardo da Vinci", born: 1452, died: 1519, pdYear: 1519, styleId: "renaissance", nationality: "Italian", keywords: ["davinci", "vinci"], promptHint: "sfumato, smoky transitions with no hard outline, subtle anatomical structure, muted umber and olive" },
  { id: "michelangelo", nameJa: "\u30DF\u30B1\u30E9\u30F3\u30B8\u30A7\u30ED", nameEn: "Michelangelo", born: 1475, died: 1564, pdYear: 1564, styleId: "renaissance", nationality: "Italian", keywords: ["buonarroti"], promptHint: "monumental sculptural volume, powerful torsion, fresco surface, terracotta and cool blue" },
  { id: "raphael", nameJa: "\u30E9\u30D5\u30A1\u30A8\u30ED", nameEn: "Raphael", born: 1483, died: 1520, pdYear: 1520, styleId: "renaissance", nationality: "Italian", keywords: ["raffaello", "sanzio"], promptHint: "serene harmony, clear stable geometry, soft even light, limpid colour" },
  { id: "botticelli", nameJa: "\u30DC\u30C3\u30C6\u30A3\u30C1\u30A7\u30EA", nameEn: "Sandro Botticelli", born: 1445, died: 1510, pdYear: 1510, styleId: "renaissance", nationality: "Italian", keywords: ["sandro"], promptHint: "flowing linear contour, pale luminous flesh, decorative rhythm, tempera delicacy" },
  { id: "vanEyck", nameJa: "\u30E4\u30F3\u30FB\u30D5\u30A1\u30F3\u30FB\u30A8\u30A4\u30AF", nameEn: "Jan van Eyck", born: 1390, died: 1441, pdYear: 1441, styleId: "renaissance", nationality: "Flemish", keywords: ["eyck", "van eyck"], promptHint: "microscopic oil detail, deep translucent glazes, jewel-like saturated colour, meticulous texture" },
  { id: "durer", nameJa: "\u30A2\u30EB\u30D6\u30EC\u30D2\u30C8\u30FB\u30C7\u30E5\u30FC\u30E9\u30FC", nameEn: "Albrecht Durer", born: 1471, died: 1528, pdYear: 1528, styleId: "renaissance", nationality: "German", keywords: ["duerer", "durer", "albrecht"], promptHint: "engraving-like precision, dense parallel hatching, austere northern detail" },
  { id: "bosch", nameJa: "\u30D2\u30A8\u30ED\u30CB\u30E0\u30B9\u30FB\u30DC\u30B9", nameEn: "Hieronymus Bosch", born: 1450, died: 1516, pdYear: 1516, styleId: "renaissance", nationality: "Netherlandish", keywords: ["hieronymus"], promptHint: "fantastical proliferating detail, pale acid palette, dreamlike incongruity" },
  { id: "bruegel", nameJa: "\u30D4\u30FC\u30C6\u30EB\u30FB\u30D6\u30EA\u30E5\u30FC\u30B2\u30EB\uFF08\u7236\uFF09", nameEn: "Pieter Bruegel the Elder", born: 1525, died: 1569, pdYear: 1569, styleId: "renaissance", nationality: "Flemish", keywords: ["brueghel", "pieter"], promptHint: "high panoramic viewpoint, teeming small figures, earthy green and ochre, wintry light" },
  // ── バロック／マニエリスム ──────────────────────────────────────────────
  { id: "caravaggio", nameJa: "\u30AB\u30E9\u30F4\u30A1\u30C3\u30B8\u30E7", nameEn: "Caravaggio", born: 1571, died: 1610, pdYear: 1610, styleId: "baroque", nationality: "Italian", keywords: ["merisi"], promptHint: "extreme tenebrism, black ground, one hard raking light, unidealised naturalism" },
  { id: "rembrandt", nameJa: "\u30EC\u30F3\u30D6\u30E9\u30F3\u30C8", nameEn: "Rembrandt van Rijn", born: 1606, died: 1669, pdYear: 1669, styleId: "baroque", nationality: "Dutch", keywords: ["rijn", "van rijn"], promptHint: "golden inner glow emerging from deep brown shadow, loaded impasto in lights, profound quiet" },
  { id: "vermeer", nameJa: "\u30D5\u30A7\u30EB\u30E1\u30FC\u30EB", nameEn: "Johannes Vermeer", born: 1632, died: 1675, pdYear: 1675, styleId: "baroque", nationality: "Dutch", keywords: ["johannes", "delft"], promptHint: "cool northern window light from the left, pointille highlights, ultramarine and lemon yellow, still calm" },
  { id: "velazquez", nameJa: "\u30D9\u30E9\u30B9\u30B1\u30B9", nameEn: "Diego Velazquez", born: 1599, died: 1660, pdYear: 1660, styleId: "baroque", nationality: "Spanish", keywords: ["diego", "velasquez"], promptHint: "fluid economical brushwork, silvery grey atmosphere, effortless optical truth" },
  { id: "elGreco", nameJa: "\u30A8\u30EB\u30FB\u30B0\u30EC\u30B3", nameEn: "El Greco", born: 1541, died: 1614, pdYear: 1614, styleId: "baroque", nationality: "Spanish", keywords: ["greco", "theotokopoulos"], promptHint: "elongated attenuated forms, cold acid green and violet, flickering visionary light" },
  // ── ロマン主義／新古典 ─────────────────────────────────────────────────
  { id: "goya", nameJa: "\u30B4\u30E4", nameEn: "Francisco Goya", born: 1746, died: 1828, pdYear: 1828, styleId: "romanticism", nationality: "Spanish", keywords: ["francisco"], promptHint: "sombre earth and black, raw expressive handling, unsettling psychological weight" },
  { id: "delacroix", nameJa: "\u30C9\u30E9\u30AF\u30ED\u30EF", nameEn: "Eugene Delacroix", born: 1798, died: 1863, pdYear: 1863, styleId: "romanticism", nationality: "French", keywords: ["eugene"], promptHint: "vehement colour, sweeping diagonal movement, vibrating complementary contrasts" },
  { id: "turner", nameJa: "\u30BF\u30FC\u30CA\u30FC", nameEn: "J. M. W. Turner", born: 1775, died: 1851, pdYear: 1851, styleId: "romanticism", nationality: "British", keywords: ["jmw", "william turner"], promptHint: "form dissolved into luminous atmosphere, blazing whites and golds, veils of scumbled light" },
  { id: "constable", nameJa: "\u30B3\u30F3\u30B9\u30BF\u30D6\u30EB", nameEn: "John Constable", born: 1776, died: 1837, pdYear: 1837, styleId: "romanticism", nationality: "British", keywords: ["john"], promptHint: "fresh green landscape, broken white highlights, moving cloud and shifting daylight" },
  { id: "friedrich", nameJa: "\u30AB\u30B9\u30D1\u30FC\u30FB\u30C0\u30FC\u30F4\u30A3\u30C8\u30FB\u30D5\u30EA\u30FC\u30C9\u30EA\u30D2", nameEn: "Caspar David Friedrich", born: 1774, died: 1840, pdYear: 1840, styleId: "romanticism", nationality: "German", keywords: ["caspar", "david friedrich"], promptHint: "vast silent space, solitary silhouette against luminous haze, cold sublime stillness" },
  { id: "blake", nameJa: "\u30A6\u30A3\u30EA\u30A2\u30E0\u30FB\u30D6\u30EC\u30A4\u30AF", nameEn: "William Blake", born: 1757, died: 1827, pdYear: 1827, styleId: "romanticism", nationality: "British", keywords: ["william"], promptHint: "visionary linear figures, watercolour over engraved outline, radiant symbolic light" },
  // ── 写実主義／バルビゾン ────────────────────────────────────────────────
  { id: "courbet", nameJa: "\u30AF\u30FC\u30EB\u30D9", nameEn: "Gustave Courbet", born: 1819, died: 1877, pdYear: 1877, styleId: "realism", nationality: "French", keywords: ["gustave"], promptHint: "palette-knife density, dark tonal ground, blunt material presence" },
  { id: "millet", nameJa: "\u30DF\u30EC\u30FC", nameEn: "Jean-Francois Millet", born: 1814, died: 1875, pdYear: 1875, styleId: "realism", nationality: "French", keywords: ["jean francois"], promptHint: "grave monumental peasant forms, dusty golden light, muted earth tones" },
  { id: "repin", nameJa: "\u30EC\u30FC\u30D4\u30F3", nameEn: "Ilya Repin", born: 1844, died: 1930, pdYear: 1930, styleId: "realism", nationality: "Russian", keywords: ["ilya"], promptHint: "vigorous psychological realism, robust brushwork, sober russian palette" },
  { id: "aivazovsky", nameJa: "\u30A2\u30A4\u30F4\u30A1\u30BE\u30D5\u30B9\u30AD\u30FC", nameEn: "Ivan Aivazovsky", born: 1817, died: 1900, pdYear: 1900, styleId: "realism", nationality: "Russian", keywords: ["ivan", "aivazovski"], promptHint: "translucent luminous water, dramatic marine light, glowing transparent glazes" },
  // ── 印象派 ────────────────────────────────────────────────────────────
  { id: "monet", nameJa: "\u30AF\u30ED\u30FC\u30C9\u30FB\u30E2\u30CD", nameEn: "Claude Monet", born: 1840, died: 1926, pdYear: 1926, styleId: "impressionism", nationality: "French", keywords: ["claude"], promptHint: "dissolving atmospheric colour, repeated short strokes, violet and blue shadows, shimmering light" },
  { id: "renoir", nameJa: "\u30EB\u30CE\u30EF\u30FC\u30EB", nameEn: "Pierre-Auguste Renoir", born: 1841, died: 1919, pdYear: 1919, styleId: "impressionism", nationality: "French", keywords: ["auguste", "pierre"], promptHint: "warm rosy flesh tones, feathery soft touch, dappled sunlight" },
  { id: "degas", nameJa: "\u30C9\u30AC", nameEn: "Edgar Degas", born: 1834, died: 1917, pdYear: 1917, styleId: "impressionism", nationality: "French", keywords: ["edgar"], promptHint: "unexpected cropped viewpoint, pastel hatching, artificial stage light" },
  { id: "manet", nameJa: "\u30DE\u30CD", nameEn: "Edouard Manet", born: 1832, died: 1883, pdYear: 1883, styleId: "impressionism", nationality: "French", keywords: ["edouard"], promptHint: "flattened tonal masses, frank black, crisp economical brushwork" },
  { id: "pissarro", nameJa: "\u30D4\u30B5\u30ED", nameEn: "Camille Pissarro", born: 1830, died: 1903, pdYear: 1903, styleId: "impressionism", nationality: "French", keywords: ["camille"], promptHint: "dense woven small strokes, humble rural motif, silvery diffused light" },
  { id: "sisley", nameJa: "\u30B7\u30B9\u30EC\u30FC", nameEn: "Alfred Sisley", born: 1839, died: 1899, pdYear: 1899, styleId: "impressionism", nationality: "French", keywords: ["alfred"], promptHint: "wide luminous sky, delicate tonal harmony, quiet river light" },
  { id: "morisot", nameJa: "\u30D9\u30EB\u30C8\u30FB\u30E2\u30EA\u30BE", nameEn: "Berthe Morisot", born: 1841, died: 1895, pdYear: 1895, styleId: "impressionism", nationality: "French", keywords: ["berthe"], promptHint: "rapid open brushwork, pale airy palette, unfinished breathing edges" },
  { id: "cassatt", nameJa: "\u30E1\u30A2\u30EA\u30FC\u30FB\u30AB\u30B5\u30C3\u30C8", nameEn: "Mary Cassatt", born: 1844, died: 1926, pdYear: 1926, styleId: "impressionism", nationality: "American", keywords: ["mary"], promptHint: "tender intimate framing, japanese-influenced flat pattern, soft pastel colour" },
  // ── 後期印象派／点描 ───────────────────────────────────────────────────
  { id: "vanGogh", nameJa: "\u30D5\u30A3\u30F3\u30BB\u30F3\u30C8\u30FB\u30D5\u30A1\u30F3\u30FB\u30B4\u30C3\u30DB", nameEn: "Vincent van Gogh", born: 1853, died: 1890, pdYear: 1890, styleId: "postImpressionism", nationality: "Dutch", keywords: ["gogh", "vincent", "van gogh"], promptHint: "thick swirling directional impasto, intense chrome yellow and cobalt, pulsating rhythmic strokes" },
  { id: "cezanne", nameJa: "\u30BB\u30B6\u30F3\u30CC", nameEn: "Paul Cezanne", born: 1839, died: 1906, pdYear: 1906, styleId: "postImpressionism", nationality: "French", keywords: ["paul"], promptHint: "constructive planar patches, tilted shifting perspective, cool green and ochre modulation" },
  { id: "gauguin", nameJa: "\u30B4\u30FC\u30AE\u30E3\u30F3", nameEn: "Paul Gauguin", born: 1848, died: 1903, pdYear: 1903, styleId: "postImpressionism", nationality: "French", keywords: ["paul"], promptHint: "flat cloisonne colour fields, bold dark contour, symbolic non-naturalistic hue" },
  { id: "seurat", nameJa: "\u30B9\u30FC\u30E9", nameEn: "Georges Seurat", born: 1859, died: 1891, pdYear: 1891, styleId: "postImpressionism", nationality: "French", keywords: ["georges", "pointillism"], promptHint: "systematic pointillist dots of pure pigment, still monumental calm, luminous optical blend" },
  { id: "signac", nameJa: "\u30B7\u30CB\u30E3\u30C3\u30AF", nameEn: "Paul Signac", born: 1863, died: 1935, pdYear: 1935, styleId: "postImpressionism", nationality: "French", keywords: ["paul", "divisionism"], promptHint: "large mosaic-like divisionist tesserae, brilliant saturated harbour colour" },
  { id: "toulouseLautrec", nameJa: "\u30ED\u30FC\u30C8\u30EC\u30C3\u30AF", nameEn: "Henri de Toulouse-Lautrec", born: 1864, died: 1901, pdYear: 1901, styleId: "postImpressionism", nationality: "French", keywords: ["henri", "lautrec", "toulouse"], promptHint: "poster-like flat silhouette, sweeping calligraphic line, acid artificial light" },
  // ── 象徴主義／世紀末 ───────────────────────────────────────────────────
  { id: "klimt", nameJa: "\u30AF\u30EA\u30E0\u30C8", nameEn: "Gustav Klimt", born: 1862, died: 1918, pdYear: 1918, styleId: "symbolism", nationality: "Austrian", keywords: ["gustav"], promptHint: "gold leaf ornament, mosaic-like decorative pattern against naturalistic passages, byzantine richness" },
  { id: "schiele", nameJa: "\u30A8\u30B4\u30F3\u30FB\u30B7\u30FC\u30EC", nameEn: "Egon Schiele", born: 1890, died: 1918, pdYear: 1918, styleId: "symbolism", nationality: "Austrian", keywords: ["egon"], promptHint: "raw angular contour, gaunt attenuated form, sparse bleached ground" },
  { id: "munch", nameJa: "\u30E0\u30F3\u30AF", nameEn: "Edvard Munch", born: 1863, died: 1944, pdYear: 1944, styleId: "symbolism", nationality: "Norwegian", keywords: ["edvard"], promptHint: "undulating wave-like bands, anxious saturated colour, dissolving contour" },
  { id: "redon", nameJa: "\u30EB\u30C9\u30F3", nameEn: "Odilon Redon", born: 1840, died: 1916, pdYear: 1916, styleId: "symbolism", nationality: "French", keywords: ["odilon"], promptHint: "dreamlike floating forms, luminous pastel bloom, mysterious dark noirs" },
  { id: "bocklin", nameJa: "\u30D9\u30C3\u30AF\u30EA\u30F3", nameEn: "Arnold Bocklin", born: 1827, died: 1901, pdYear: 1901, styleId: "symbolism", nationality: "Swiss", keywords: ["arnold", "boecklin"], promptHint: "sombre mythic stillness, dark cypress green, ominous theatrical light" },
  { id: "mucha", nameJa: "\u30DF\u30E5\u30B7\u30E3", nameEn: "Alphonse Mucha", born: 1860, died: 1939, pdYear: 1939, styleId: "symbolism", nationality: "Czech", keywords: ["alphonse", "alfons"], promptHint: "art nouveau whiplash line, decorative halo and border, pale pastel with ink outline" },
  { id: "beardsley", nameJa: "\u30D3\u30A2\u30BA\u30EA\u30FC", nameEn: "Aubrey Beardsley", born: 1872, died: 1898, pdYear: 1898, styleId: "symbolism", nationality: "British", keywords: ["aubrey"], promptHint: "stark black and white, elegant sinuous line, large flat silhouettes, decadent ornament" },
  { id: "whistler", nameJa: "\u30DB\u30A4\u30C3\u30B9\u30E9\u30FC", nameEn: "James McNeill Whistler", born: 1834, died: 1903, pdYear: 1903, styleId: "symbolism", nationality: "American", keywords: ["james", "mcneill"], promptHint: "tonal nocturne, narrow close-valued harmony, veiled atmospheric haze" },
  // ── 表現主義／青騎士 ───────────────────────────────────────────────────
  { id: "kandinsky", nameJa: "\u30AB\u30F3\u30C7\u30A3\u30F3\u30B9\u30AD\u30FC", nameEn: "Wassily Kandinsky", born: 1866, died: 1944, pdYear: 1944, styleId: "expressionism", nationality: "Russian", keywords: ["wassily", "vasily"], promptHint: "musical floating abstraction, keen linear accents over colour fields, dynamic non-objective rhythm" },
  { id: "marc", nameJa: "\u30D5\u30E9\u30F3\u30C4\u30FB\u30DE\u30EB\u30AF", nameEn: "Franz Marc", born: 1880, died: 1916, pdYear: 1916, styleId: "expressionism", nationality: "German", keywords: ["franz"], promptHint: "symbolic primary colour, crystalline interlocking planes, animal forms fused with landscape" },
  { id: "macke", nameJa: "\u30A2\u30A6\u30B0\u30B9\u30C8\u30FB\u30DE\u30C3\u30B1", nameEn: "August Macke", born: 1887, died: 1914, pdYear: 1914, styleId: "expressionism", nationality: "German", keywords: ["august"], promptHint: "luminous transparent colour planes, gentle geometry, sunlit clarity" },
  { id: "klee", nameJa: "\u30D1\u30A6\u30EB\u30FB\u30AF\u30EC\u30FC", nameEn: "Paul Klee", born: 1879, died: 1940, pdYear: 1940, styleId: "expressionism", nationality: "Swiss-German", keywords: ["paul"], promptHint: "child-like sign language, tessellated watercolour squares, delicate wandering line, poetic scale" },
  { id: "modigliani", nameJa: "\u30E2\u30C7\u30A3\u30EA\u30A2\u30FC\u30CB", nameEn: "Amedeo Modigliani", born: 1884, died: 1920, pdYear: 1920, styleId: "expressionism", nationality: "Italian", keywords: ["amedeo"], promptHint: "elongated simplified form, mask-like serenity, warm ochre ground, sinuous contour" },
  // ── キュビスム／未来派／構成主義 ─────────────────────────────────────────
  { id: "gris", nameJa: "\u30D5\u30A2\u30F3\u30FB\u30B0\u30EA\u30B9", nameEn: "Juan Gris", born: 1887, died: 1927, pdYear: 1927, styleId: "cubism", nationality: "Spanish", keywords: ["juan"], promptHint: "lucid architectonic cubist grid, crisp interlocking planes, controlled ochre blue and grey" },
  { id: "boccioni", nameJa: "\u30DC\u30C3\u30C1\u30E7\u30FC\u30CB", nameEn: "Umberto Boccioni", born: 1882, died: 1916, pdYear: 1916, styleId: "cubism", nationality: "Italian", keywords: ["umberto", "futurism"], promptHint: "force-lines of motion, fragmented dynamic sequence, radiating energy" },
  { id: "malevich", nameJa: "\u30DE\u30EC\u30FC\u30F4\u30A3\u30C1", nameEn: "Kazimir Malevich", born: 1879, died: 1935, pdYear: 1935, styleId: "cubism", nationality: "Russian", keywords: ["kazimir", "suprematism"], promptHint: "suprematist floating geometric elements on white void, pure flat colour, weightless diagonal" },
  // ── 抽象／デ・ステイル ─────────────────────────────────────────────────
  { id: "mondrian", nameJa: "\u30E2\u30F3\u30C9\u30EA\u30A2\u30F3", nameEn: "Piet Mondrian", born: 1872, died: 1944, pdYear: 1944, styleId: "abstract", nationality: "Dutch", keywords: ["piet", "de stijl"], promptHint: "orthogonal black grid, asymmetric rectangles of primary red blue yellow on white, absolute flatness" },
  { id: "afKlint", nameJa: "\u30D2\u30EB\u30DE\u30FB\u30A2\u30D5\u30FB\u30AF\u30EA\u30F3\u30C8", nameEn: "Hilma af Klint", born: 1862, died: 1944, pdYear: 1944, styleId: "abstract", nationality: "Swedish", keywords: ["hilma", "klint"], promptHint: "diagrammatic spiritual abstraction, pale chalky pastel, concentric symbolic geometry" },
  // ── 素朴派／アメリカ絵画 ────────────────────────────────────────────────
  { id: "rousseau", nameJa: "\u30A2\u30F3\u30EA\u30FB\u30EB\u30BD\u30FC", nameEn: "Henri Rousseau", born: 1844, died: 1910, pdYear: 1910, styleId: "naive", nationality: "French", keywords: ["henri", "douanier"], promptHint: "naive frontal clarity, layered flat foliage, dreamlike stillness, deep saturated greens" },
  { id: "homer", nameJa: "\u30A6\u30A3\u30F3\u30B9\u30ED\u30FC\u30FB\u30DB\u30FC\u30DE\u30FC", nameEn: "Winslow Homer", born: 1836, died: 1910, pdYear: 1910, styleId: "naive", nationality: "American", keywords: ["winslow"], promptHint: "robust watercolour transparency, direct observation, strong value structure" },
  { id: "sargent", nameJa: "\u30B5\u30FC\u30B8\u30A7\u30F3\u30C8", nameEn: "John Singer Sargent", born: 1856, died: 1925, pdYear: 1925, styleId: "naive", nationality: "American", keywords: ["singer", "john"], promptHint: "bravura wet-in-wet brushwork, confident single-stroke form, luminous grey harmonies" },
  { id: "grantWood", nameJa: "\u30B0\u30E9\u30F3\u30C8\u30FB\u30A6\u30C3\u30C9", nameEn: "Grant Wood", born: 1891, died: 1942, pdYear: 1942, styleId: "naive", nationality: "American", keywords: ["grant", "regionalism"], promptHint: "smooth enamel surface, rounded stylised volumes, meticulous clarity, midwestern light" },
  // ── 浮世絵／日本画 ─────────────────────────────────────────────────────
  { id: "hokusai", nameJa: "\u845B\u98FE\u5317\u658E", nameEn: "Katsushika Hokusai", born: 1760, died: 1849, pdYear: 1849, styleId: "ukiyoe", nationality: "Japanese", keywords: ["hokusai", "katsushika", "\u307B\u304F\u3055\u3044", "\u304B\u3064\u3057\u304B"], promptHint: "bold prussian blue gradation, dynamic curving line, woodblock key-block outline, wave-like energy" },
  { id: "hiroshige", nameJa: "\u6B4C\u5DDD\u5E83\u91CD", nameEn: "Utagawa Hiroshige", born: 1797, died: 1858, pdYear: 1858, styleId: "ukiyoe", nationality: "Japanese", keywords: ["hiroshige", "utagawa", "\u3072\u308D\u3057\u3052"], promptHint: "poetic atmospheric landscape, bokashi colour gradation, dramatic foreground framing, weather and season" },
  { id: "utamaro", nameJa: "\u559C\u591A\u5DDD\u6B4C\u9EBF", nameEn: "Kitagawa Utamaro", born: 1753, died: 1806, pdYear: 1806, styleId: "ukiyoe", nationality: "Japanese", keywords: ["utamaro", "kitagawa", "\u3046\u305F\u307E\u308D"], promptHint: "elegant elongated figures, fine hairline detail, mica ground, refined restrained palette" },
  { id: "sharaku", nameJa: "\u6771\u6D32\u658E\u5199\u697D", nameEn: "Toshusai Sharaku", born: null, died: null, pdYear: 1795, styleId: "ukiyoe", nationality: "Japanese", keywords: ["sharaku", "toshusai", "\u3057\u3083\u3089\u304F"], promptHint: "exaggerated expressive caricature, dark mica ground, arresting frontal presence", note: "\u6CA1\u5E74\u4E0D\u8A73\u3002\u6D3B\u52D5\u306F1794\u201395\u5E74" },
  { id: "korin", nameJa: "\u5C3E\u5F62\u5149\u7433", nameEn: "Ogata Korin", born: 1658, died: 1716, pdYear: 1716, styleId: "ukiyoe", nationality: "Japanese", keywords: ["korin", "ogata", "rinpa", "\u7433\u6D3E", "\u3053\u3046\u308A\u3093"], promptHint: "rinpa decorative boldness, gold leaf ground, stylised natural motif, flat rhythmic arrangement" },
  { id: "sotatsu", nameJa: "\u4FF5\u5C4B\u5B97\u9054", nameEn: "Tawaraya Sotatsu", born: null, died: null, pdYear: 1640, styleId: "ukiyoe", nationality: "Japanese", keywords: ["sotatsu", "tawaraya", "rinpa", "\u305D\u3046\u305F\u3064"], promptHint: "tarashikomi pooled ink washes, gold ground, sweeping simplified silhouette", note: "\u6CA1\u5E74\u4E0D\u8A73\u30021640\u5E74\u9803\u307E\u3067\u306E\u6D3B\u52D5" },
  { id: "sesshu", nameJa: "\u96EA\u821F", nameEn: "Sesshu Toyo", born: 1420, died: 1506, pdYear: 1506, styleId: "ukiyoe", nationality: "Japanese", keywords: ["sesshu", "\u305B\u3063\u3057\u3085\u3046", "suibokuga"], promptHint: "monochrome ink wash, axe-cut brushstrokes, vast empty space, austere spiritual restraint" },
  { id: "tohaku", nameJa: "\u9577\u8C37\u5DDD\u7B49\u4F2F", nameEn: "Hasegawa Tohaku", born: 1539, died: 1610, pdYear: 1610, styleId: "ukiyoe", nationality: "Japanese", keywords: ["tohaku", "hasegawa", "\u3068\u3046\u306F\u304F"], promptHint: "soft ink mist, forms emerging and vanishing in fog, profound quiet emptiness" },
  { id: "jakuchu", nameJa: "\u4F0A\u85E4\u82E5\u51B2", nameEn: "Ito Jakuchu", born: 1716, died: 1800, pdYear: 1800, styleId: "ukiyoe", nationality: "Japanese", keywords: ["jakuchu", "ito", "\u3058\u3083\u304F\u3061\u3085\u3046"], promptHint: "hypnotically dense ornamental detail, vivid mineral pigment, eccentric decorative pattern" },
  { id: "kurodaSeiki", nameJa: "\u9ED2\u7530\u6E05\u8F1D", nameEn: "Kuroda Seiki", born: 1866, died: 1924, pdYear: 1924, styleId: "ukiyoe", nationality: "Japanese", keywords: ["kuroda", "seiki", "\u304F\u308D\u3060"], promptHint: "japanese plein-air impressionism, soft violet-tinged daylight, gentle academic modelling" },
  { id: "aokiShigeru", nameJa: "\u9752\u6728\u7E41", nameEn: "Aoki Shigeru", born: 1882, died: 1911, pdYear: 1911, styleId: "ukiyoe", nationality: "Japanese", keywords: ["aoki", "shigeru", "\u3042\u304A\u304D"], promptHint: "romantic mythic mood, deep resonant colour, lyrical romanticism" },
  { id: "hishidaShunso", nameJa: "\u83F1\u7530\u6625\u8349", nameEn: "Hishida Shunso", born: 1874, died: 1911, pdYear: 1911, styleId: "ukiyoe", nationality: "Japanese", keywords: ["hishida", "shunso", "\u3072\u3057\u3060", "moro-tai"], promptHint: "outline-less moro-tai technique, soft atmospheric colour veils, delicate nihonga pigment" }
];
var PAINTER_BY_ID = new Map(PAINTERS.map((p) => [p.id, p]));
function searchPainters(query, styleId) {
  const pool = styleId ? PAINTERS.filter((p) => p.styleId === styleId) : PAINTERS;
  const q = query.trim().toLowerCase();
  if (!q) return pool;
  return pool.filter(
    (p) => p.nameJa.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q) || p.nationality.toLowerCase().includes(q) || p.styleId.toLowerCase().includes(q) || p.keywords.some((k) => k.toLowerCase().includes(q))
  );
}

// src/core/styles.ts
var STYLES = [
  {
    id: "renaissance",
    nameJa: "\u30EB\u30CD\u30B5\u30F3\u30B9\uFF0F\u521D\u671F\u30D5\u30E9\u30F3\u30C9\u30EB",
    nameEn: "Renaissance / Early Netherlandish",
    promptHint: "balanced classical composition, precise linear perspective, sculptural modelling of form, egg-tempera and early oil glazing, restrained jewel-like colour"
  },
  {
    id: "baroque",
    nameJa: "\u30D0\u30ED\u30C3\u30AF\uFF0F\u30DE\u30CB\u30A8\u30EA\u30B9\u30E0",
    nameEn: "Baroque / Mannerism",
    promptHint: "dramatic chiaroscuro, a single raking light source, deep warm shadow, theatrical diagonal composition, rich impasto highlights"
  },
  {
    id: "romanticism",
    nameJa: "\u30ED\u30DE\u30F3\u4E3B\u7FA9\uFF0F\u65B0\u53E4\u5178",
    nameEn: "Romanticism / Neoclassicism",
    promptHint: "sublime atmosphere, turbulent light and weather, luminous glazes dissolving contour, sweeping emotive gesture"
  },
  {
    id: "realism",
    nameJa: "\u5199\u5B9F\u4E3B\u7FA9\uFF0F\u30D0\u30EB\u30D3\u30BE\u30F3",
    nameEn: "Realism / Barbizon",
    promptHint: "earthy tonal palette, unidealised observation, weighty solid forms, soft natural daylight, matte surface"
  },
  {
    id: "impressionism",
    nameJa: "\u5370\u8C61\u6D3E",
    nameEn: "Impressionism",
    promptHint: "broken brushwork, optical mixing of pure colour, luminous daylight, soft dissolved contours, coloured shadows rather than grey"
  },
  {
    id: "postImpressionism",
    nameJa: "\u5F8C\u671F\u5370\u8C61\u6D3E\uFF0F\u70B9\u63CF",
    nameEn: "Post-Impressionism / Pointillism",
    promptHint: "structural brushstrokes with expressive direction, saturated non-naturalistic colour, strong surface pattern, visible touch"
  },
  {
    id: "symbolism",
    nameJa: "\u8C61\u5FB4\u4E3B\u7FA9\uFF0F\u4E16\u7D00\u672B",
    nameEn: "Symbolism / Fin de siecle",
    promptHint: "decorative flattened space, sinuous contour, ornamental gold and pattern, dreamlike mood, stylised silhouette"
  },
  {
    id: "expressionism",
    nameJa: "\u8868\u73FE\u4E3B\u7FA9\uFF0F\u9752\u9A0E\u58EB",
    nameEn: "Expressionism / Der Blaue Reiter",
    promptHint: "emotionally charged arbitrary colour, distorted simplified form, bold contour, rhythmic abstracted shapes"
  },
  {
    id: "cubism",
    nameJa: "\u30AD\u30E5\u30D3\u30B9\u30E0\uFF0F\u672A\u6765\u6D3E\uFF0F\u69CB\u6210\u4E3B\u7FA9",
    nameEn: "Cubism / Futurism / Constructivism",
    promptHint: "faceted geometric planes, simultaneous multiple viewpoints, shallow ambiguous space, restrained ochre and grey with sharp accents"
  },
  {
    id: "abstract",
    nameJa: "\u62BD\u8C61\uFF0F\u30C7\u30FB\u30B9\u30C6\u30A4\u30EB",
    nameEn: "Abstraction / De Stijl",
    promptHint: "pure geometric abstraction, flat unmodulated planes, deliberate asymmetric balance, reduced primary palette, crisp edges"
  },
  {
    id: "naive",
    nameJa: "\u7D20\u6734\u6D3E\uFF0F\u30A2\u30E1\u30EA\u30AB\u7D75\u753B",
    nameEn: "Naive art / American painting",
    promptHint: "frontal clarity, meticulous outlined detail, flattened depth, calm even light, plain honest description"
  },
  {
    id: "ukiyoe",
    nameJa: "\u6D6E\u4E16\u7D75\uFF0F\u65E5\u672C\u753B",
    nameEn: "Ukiyo-e / Japanese painting",
    promptHint: "flat areas of colour bounded by confident outline, asymmetric cropped composition, woodblock print texture with visible key-block line, empty space as compositional element, ink wash gradation"
  }
];
var STYLE_BY_ID = new Map(STYLES.map((s) => [s.id, s]));

// src/core/prompt.ts
var MAX_VALUE_CHARS = 32;
var KNOWN_MODALITIES = /* @__PURE__ */ new Set([
  "AR",
  "ASMT",
  "AU",
  "BDUS",
  "BI",
  "BMD",
  "CR",
  "CT",
  "CTPROTOCOL",
  "DG",
  "DMS",
  "DOC",
  "DX",
  "ECG",
  "EEG",
  "EMG",
  "EOG",
  "EPS",
  "ES",
  "FID",
  "GM",
  "HC",
  "HD",
  "IO",
  "IOL",
  "IVOCT",
  "IVUS",
  "KER",
  "KO",
  "LEN",
  "LS",
  "MG",
  "MR",
  "M3D",
  "NM",
  "OAM",
  "OCT",
  "OP",
  "OPM",
  "OPT",
  "OPTBSV",
  "OPTENF",
  "OPV",
  "OSS",
  "OT",
  "PLAN",
  "POS",
  "PR",
  "PT",
  "PX",
  "REG",
  "RESP",
  "RF",
  "RG",
  "RTDOSE",
  "RTIMAGE",
  "RTINTENT",
  "RTPLAN",
  "RTRAD",
  "RTRECORD",
  "RTSEGANN",
  "RTSTRUCT",
  "RWV",
  "SEG",
  "SM",
  "SMR",
  "SR",
  "SRF",
  "STAIN",
  "TEXTUREMAP",
  "TG",
  "US",
  "VA",
  "XA",
  "XC"
]);
var BODY_PART_TERMS = [
  "ABDOMEN",
  "ABDOMENPELVIS",
  "ADRENAL",
  "ANKLE",
  "AORTA",
  "ARM",
  "AXILLA",
  "BACK",
  "BILEDUCT",
  "BLADDER",
  "BRAIN",
  "BREAST",
  "BRONCHUS",
  "BUTTOCK",
  "CALCANEUS",
  "CALF",
  "CAROTID",
  "CEREBELLUM",
  "CERVIX",
  "CHEEK",
  "CHEST",
  "CHESTABDOMEN",
  "CHESTABDPELVIS",
  "CIRCLEOFWILLIS",
  "CLAVICLE",
  "COCCYX",
  "COLON",
  "CORNEA",
  "CORONARYARTERY",
  "CSPINE",
  "CTSPINE",
  "DUODENUM",
  "EAR",
  "ELBOW",
  "ESOPHAGUS",
  "EXTREMITY",
  "EYE",
  "EYELID",
  "FACE",
  "FEMUR",
  "FIBULA",
  "FINGER",
  "FOOT",
  "GALLBLADDER",
  "HAND",
  "HEAD",
  "HEADNECK",
  "HEART",
  "HIP",
  "HUMERUS",
  "ILEUM",
  "ILIUM",
  "JAW",
  "JEJUNUM",
  "KIDNEY",
  "KNEE",
  "LARYNX",
  "LEG",
  "LIVER",
  "LSPINE",
  "LSSPINE",
  "LUNG",
  "MAXILLA",
  "MEDIASTINUM",
  "MOUTH",
  "NECK",
  "NECKCHEST",
  "NECKCHESTABDOMEN",
  "NECKCHESTABDPELVIS",
  "NOSE",
  "ORBIT",
  "OVARY",
  "PANCREAS",
  "PAROTID",
  "PATELLA",
  "PELVIS",
  "PENIS",
  "PHARYNX",
  "PROSTATE",
  "RADIUS",
  "RADIUSULNA",
  "RECTUM",
  "RIB",
  "SACRUM",
  "SCALP",
  "SCAPULA",
  "SCLERA",
  "SCROTUM",
  "SHOULDER",
  "SKULL",
  "SPINE",
  "SPLEEN",
  "SSPINE",
  "STERNUM",
  "STOMACH",
  "SUBMANDIBULAR",
  "TESTIS",
  "THIGH",
  "THUMB",
  "THYMUS",
  "THYROID",
  "TIBIA",
  "TIBIAFIBULA",
  "TLSPINE",
  "TOE",
  "TONGUE",
  "TRACHEA",
  "TSPINE",
  "ULNA",
  "URETER",
  "URETHRA",
  "UTERUS",
  "VAGINA",
  "VULVA",
  "WRIST",
  "ZYGOMA"
];
var KNOWN_BODY_PARTS = new Set(BODY_PART_TERMS);
function sanitizeFact(raw) {
  if (!raw) return "";
  return raw.replace(/[^A-Za-z0-9 _-]/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_VALUE_CHARS).toUpperCase();
}
function compact(s) {
  return s.replace(/[ _-]/g, "");
}
function toModality(raw) {
  const v = compact(sanitizeFact(raw));
  return KNOWN_MODALITIES.has(v) ? v : "";
}
function toBodyPart(raw) {
  const v = compact(sanitizeFact(raw));
  return KNOWN_BODY_PARTS.has(v) ? v : "";
}
function buildPrompt(opts) {
  const { painter, facts, locale } = opts;
  const style = STYLE_BY_ID.get(painter.styleId);
  const modality = toModality(facts.modality);
  const bodyPart = toBodyPart(facts.bodyPart);
  const subject = [
    "a greyscale medical radiological image",
    modality ? `acquired with the ${modality} modality` : null,
    bodyPart ? `showing the ${bodyPart} region` : null
  ].filter(Boolean).join(", ");
  const language = locale === "ja" ? "Japanese" : "English";
  return [
    "You are helping to create a work of art that connects imaging science with aesthetics,",
    'in the spirit of the "Art of Imaging" section of a radiology journal.',
    "",
    `Source image: ${subject}.`,
    "",
    "Task: reinterpret the given image as an original artwork, keeping its overall composition and",
    "anatomical structure recognisable, rendered in the following manner:",
    `  Style: ${style ? `${style.nameEn} \u2014 ${style.promptHint}` : painter.styleId}`,
    `  In the manner of: ${painter.nameEn} \u2014 ${painter.promptHint}`,
    "",
    "Constraints:",
    "  - Create an ORIGINAL interpretation. Do NOT reproduce, copy or closely imitate any specific",
    "    existing painting. Borrow the manner and technique of the style, not a particular work.",
    "  - Do NOT draw any text, letters, numbers, caption, signature or watermark inside the image.",
    "    A signature will be added separately by the application.",
    "  - Do NOT invent or add anatomy, lesions, devices or findings that are not present in the source.",
    "  - Keep the result suitable for public exhibition.",
    "",
    "Together with the image, return a short appreciation note as a JSON object in a ```json code block,",
    `written in ${language}, with exactly these keys:`,
    '  "subject"      \u2014 what is visible in the image, described in plain descriptive language',
    '  "appreciation" \u2014 how to look at the resulting artwork: composition, colour, light, mood (2-4 sentences)',
    "",
    "Do not include any patient information, identifiers, dates or institution names in the JSON.",
    "Describe only what is visually present; do not offer a diagnosis or clinical interpretation."
  ].join("\n");
}

// src/core/render.ts
function applyWindow(values, win) {
  const out = new Uint8ClampedArray(values.length);
  const width = win.width > 0 ? win.width : 1;
  const low = win.center - width / 2;
  const scale = 255 / width;
  for (let i = 0; i < values.length; i++) {
    let g = (values[i] - low) * scale;
    if (g < 0) g = 0;
    else if (g > 255) g = 255;
    out[i] = win.invert ? 255 - g : g;
  }
  return out;
}
function autoWindow(values) {
  const finite = [];
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (Number.isFinite(v)) finite.push(v);
  }
  if (finite.length === 0) return { center: 0, width: 1 };
  finite.sort((a, b) => a - b);
  const lo = finite[Math.floor(finite.length * 0.02)];
  const hi = finite[Math.floor(finite.length * 0.98)];
  const width = hi - lo > 0 ? hi - lo : 1;
  return { center: lo + width / 2, width };
}
function grayToRgba(gray) {
  const rgba = new Uint8ClampedArray(gray.length * 4);
  for (let i = 0; i < gray.length; i++) {
    const g = gray[i];
    const o = i * 4;
    rgba[o] = g;
    rgba[o + 1] = g;
    rgba[o + 2] = g;
    rgba[o + 3] = 255;
  }
  return rgba;
}
function toImageData(rgba, width, height) {
  const copy = new Uint8ClampedArray(new ArrayBuffer(rgba.length));
  copy.set(rgba);
  return new ImageData(copy, width, height);
}
async function rgbaToPng(rgba, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D \u30B3\u30F3\u30C6\u30AD\u30B9\u30C8\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F");
  ctx.putImageData(toImageData(rgba, width, height), 0, 0);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("PNG \u3078\u306E\u30A8\u30F3\u30B3\u30FC\u30C9\u306B\u5931\u6557\u3057\u307E\u3057\u305F");
  return new Uint8Array(await blob.arrayBuffer());
}
async function buildSourceImage(values, width, height, win, maxEdge = 1024) {
  const rgba = grayToRgba(applyWindow(values, win));
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  if (scale >= 1) {
    return { png: await rgbaToPng(rgba, width, height), width, height };
  }
  const dw = Math.max(1, Math.round(width * scale));
  const dh = Math.max(1, Math.round(height * scale));
  const src = document.createElement("canvas");
  src.width = width;
  src.height = height;
  const sctx = src.getContext("2d");
  if (!sctx) throw new Error("2D \u30B3\u30F3\u30C6\u30AD\u30B9\u30C8\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F");
  sctx.putImageData(toImageData(rgba, width, height), 0, 0);
  const dst = document.createElement("canvas");
  dst.width = dw;
  dst.height = dh;
  const dctx = dst.getContext("2d");
  if (!dctx) throw new Error("2D \u30B3\u30F3\u30C6\u30AD\u30B9\u30C8\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F");
  dctx.imageSmoothingQuality = "high";
  dctx.drawImage(src, 0, 0, dw, dh);
  const blob = await new Promise((resolve) => dst.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("PNG \u3078\u306E\u30A8\u30F3\u30B3\u30FC\u30C9\u306B\u5931\u6557\u3057\u307E\u3057\u305F");
  return { png: new Uint8Array(await blob.arrayBuffer()), width: dw, height: dh };
}

// src/core/signature.ts
var SIGNATURE_POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "middle-left",
  "middle-center",
  "middle-right",
  "bottom-left",
  "bottom-center",
  "bottom-right"
];
var SIGNATURE_FONTS = [
  { id: "serif", label: "Serif / \u660E\u671D", stack: "'Times New Roman', 'Hiragino Mincho ProN', 'Yu Mincho', serif" },
  { id: "sans", label: "Sans / \u30B4\u30B7\u30C3\u30AF", stack: "'Helvetica Neue', Arial, 'Hiragino Sans', 'Yu Gothic', sans-serif" },
  { id: "script", label: "Script / \u7B46\u8A18\u4F53", stack: "'Segoe Script', 'Brush Script MT', cursive" },
  { id: "mono", label: "Monospace", stack: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }
];
var FONT_BY_ID = new Map(SIGNATURE_FONTS.map((f) => [f.id, f]));
function placeSignature(imageWidth, imageHeight, opts) {
  const shortEdge = Math.min(imageWidth, imageHeight);
  const fontPx = Math.max(8, Math.round(shortEdge * (opts.sizeRatio ?? 0.04)));
  const margin = Math.round(shortEdge * (opts.marginRatio ?? 0.03));
  const [vertical, horizontal] = opts.position.split("-");
  let x;
  let textAlign;
  if (horizontal === "left") {
    x = margin;
    textAlign = "left";
  } else if (horizontal === "right") {
    x = imageWidth - margin;
    textAlign = "right";
  } else {
    x = Math.round(imageWidth / 2);
    textAlign = "center";
  }
  let y;
  let textBaseline;
  if (vertical === "top") {
    y = margin;
    textBaseline = "top";
  } else if (vertical === "bottom") {
    y = imageHeight - margin;
    textBaseline = "alphabetic";
  } else {
    y = Math.round(imageHeight / 2);
    textBaseline = "middle";
  }
  return { x, y, fontPx, textAlign, textBaseline };
}
function drawSignature(ctx, imageWidth, imageHeight, opts) {
  const text = opts.text.trim();
  if (!text) return;
  const place = placeSignature(imageWidth, imageHeight, opts);
  const font = FONT_BY_ID.get(opts.fontId) ?? SIGNATURE_FONTS[0];
  ctx.save();
  ctx.font = `${place.fontPx}px ${font.stack}`;
  ctx.textAlign = place.textAlign;
  ctx.textBaseline = place.textBaseline;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = Math.max(1, place.fontPx * 0.12);
  ctx.strokeText(text, place.x, place.y);
  ctx.fillStyle = "#000000";
  ctx.fillText(text, place.x, place.y);
  ctx.restore();
}

// src/core/phash.ts
async function sha256Hex(bytes) {
  const buf = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buf).set(new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength));
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function luma(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
function toGrayResized(rgba, width, height, size) {
  const out = new Float64Array(size * size);
  for (let y = 0; y < size; y++) {
    const y0 = Math.floor(y * height / size);
    const y1 = Math.max(y0 + 1, Math.floor((y + 1) * height / size));
    for (let x = 0; x < size; x++) {
      const x0 = Math.floor(x * width / size);
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * width / size));
      let sum = 0;
      let n = 0;
      for (let sy = y0; sy < y1 && sy < height; sy++) {
        for (let sx = x0; sx < x1 && sx < width; sx++) {
          const o = (sy * width + sx) * 4;
          sum += luma(rgba[o], rgba[o + 1], rgba[o + 2]);
          n++;
        }
      }
      out[y * size + x] = n > 0 ? sum / n : 0;
    }
  }
  return out;
}
function dct2(input, size) {
  const cos = new Float64Array(size * size);
  for (let u = 0; u < size; u++) {
    for (let x = 0; x < size; x++) {
      cos[u * size + x] = Math.cos((2 * x + 1) * u * Math.PI / (2 * size));
    }
  }
  const tmp = new Float64Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let u = 0; u < size; u++) {
      let s = 0;
      for (let x = 0; x < size; x++) s += input[y * size + x] * cos[u * size + x];
      tmp[y * size + u] = s;
    }
  }
  const out = new Float64Array(size * size);
  for (let u = 0; u < size; u++) {
    for (let v = 0; v < size; v++) {
      let s = 0;
      for (let y = 0; y < size; y++) s += tmp[y * size + u] * cos[v * size + y];
      out[v * size + u] = s;
    }
  }
  return out;
}
function pHash(rgba, width, height) {
  const SIZE = 32;
  const LOW = 8;
  const gray = toGrayResized(rgba, width, height, SIZE);
  const freq = dct2(gray, SIZE);
  const vals = [];
  for (let v = 0; v < LOW; v++) {
    for (let u = 0; u < LOW; u++) {
      if (u === 0 && v === 0) continue;
      vals.push(freq[v * SIZE + u]);
    }
  }
  const sorted = [...vals].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  let hex = "";
  let bits = 0;
  let acc = 0;
  const push = (bit) => {
    acc = acc << 1 | bit;
    bits++;
    if (bits === 4) {
      hex += acc.toString(16);
      acc = 0;
      bits = 0;
    }
  };
  push(0);
  for (const v of vals) push(v > median ? 1 : 0);
  return hex;
}

// src/core/pngMeta.ts
var GRAPHY_ART_KEYWORD = "graphy-art";
var GRAPHY_ART_SPEC = "graphy-art/1";
var PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
var CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();
function crc32(bytes) {
  let c = 4294967295;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 255] ^ c >>> 8;
  return (c ^ 4294967295) >>> 0;
}
function isPng(bytes) {
  if (bytes.length < 8) return false;
  return PNG_SIGNATURE.every((b, i) => bytes[i] === b);
}
function readU32(bytes, at) {
  return (bytes[at] << 24 | bytes[at + 1] << 16 | bytes[at + 2] << 8 | bytes[at + 3]) >>> 0;
}
function writeU32(view, at, value) {
  view[at] = value >>> 24 & 255;
  view[at + 1] = value >>> 16 & 255;
  view[at + 2] = value >>> 8 & 255;
  view[at + 3] = value & 255;
}
function buildChunk(type, data) {
  const typeBytes = new Uint8Array(4);
  for (let i = 0; i < 4; i++) typeBytes[i] = type.charCodeAt(i);
  const chunk = new Uint8Array(12 + data.length);
  writeU32(chunk, 0, data.length);
  chunk.set(typeBytes, 4);
  chunk.set(data, 8);
  const forCrc = new Uint8Array(4 + data.length);
  forCrc.set(typeBytes, 0);
  forCrc.set(data, 4);
  writeU32(chunk, 8 + data.length, crc32(forCrc));
  return chunk;
}
function buildITxtData(keyword, text) {
  const kw = new TextEncoder().encode(keyword);
  const body = new TextEncoder().encode(text);
  const data = new Uint8Array(kw.length + 1 + 1 + 1 + 1 + 1 + body.length);
  let o = 0;
  data.set(kw, o);
  o += kw.length;
  data[o++] = 0;
  data[o++] = 0;
  data[o++] = 0;
  data[o++] = 0;
  data[o++] = 0;
  data.set(body, o);
  return data;
}
function* chunks(bytes) {
  let at = 8;
  while (at + 8 <= bytes.length) {
    const length = readU32(bytes, at);
    const type = String.fromCharCode(bytes[at + 4], bytes[at + 5], bytes[at + 6], bytes[at + 7]);
    yield { type, start: at, dataStart: at + 8, length };
    at += 12 + length;
    if (type === "IEND") return;
  }
}
function embedGraphyArt(png, metadata) {
  if (!isPng(png)) throw new Error("PNG \u3067\u306F\u3042\u308A\u307E\u305B\u3093");
  const json = JSON.stringify(metadata);
  const chunk = buildChunk("iTXt", buildITxtData(GRAPHY_ART_KEYWORD, json));
  let insertAt = -1;
  for (const c of chunks(png)) {
    if (c.type === "IHDR") {
      insertAt = c.start + 12 + c.length;
      break;
    }
  }
  if (insertAt < 0) throw new Error("IHDR \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093");
  const out = new Uint8Array(png.length + chunk.length);
  out.set(png.subarray(0, insertAt), 0);
  out.set(chunk, insertAt);
  out.set(png.subarray(insertAt), insertAt + chunk.length);
  return out;
}

// src/core/metadata.ts
function buildMetadata(input) {
  return {
    spec: GRAPHY_ART_SPEC,
    generator: "GRAPHY-Next Art of Imaging",
    appVersion: input.appVersion,
    pluginVersion: input.pluginVersion,
    createdAt: (input.now ?? /* @__PURE__ */ new Date()).toISOString(),
    model: input.model,
    style: { styleId: input.styleId, painterId: input.painterId, painterName: input.painterName },
    signature: {
      text: input.signature.text,
      position: input.signature.position,
      font: input.signature.fontId
    },
    source: { modality: input.modality, bodyPart: input.bodyPart },
    prompt: input.prompt,
    sourceImageSha256: input.sourceImageSha256,
    imageSha256: input.imageSha256,
    pHash: input.pHash
  };
}
function defaultFileName(painterId, now = /* @__PURE__ */ new Date()) {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "-");
  return `graphy-art-${painterId}-${stamp}.png`;
}

// src/core/parse.ts
function asRecord(v) {
  return v && typeof v === "object" && !Array.isArray(v) ? v : null;
}
function base64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function readInlineData(part) {
  const inline = asRecord(part.inlineData) ?? asRecord(part.inline_data);
  if (!inline) return null;
  const data = inline.data;
  if (typeof data !== "string" || data.length === 0) return null;
  const mime = inline.mimeType ?? inline.mime_type;
  return { data, mimeType: typeof mime === "string" ? mime : "image/png" };
}
function extractNote(text) {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const candidates = [fenced?.[1], text];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start < 0 || end <= start) continue;
    try {
      const obj = asRecord(JSON.parse(candidate.slice(start, end + 1)));
      if (!obj) continue;
      const subject = typeof obj.subject === "string" ? obj.subject.trim() : "";
      const appreciation = typeof obj.appreciation === "string" ? obj.appreciation.trim() : "";
      if (subject || appreciation) return { subject, appreciation };
    } catch {
    }
  }
  return null;
}
function parseGeneration(raw) {
  const root = asRecord(raw);
  const candidates = root?.candidates;
  const first = Array.isArray(candidates) ? asRecord(candidates[0]) : null;
  const content = asRecord(first?.content);
  const parts = Array.isArray(content?.parts) ? content.parts : [];
  let image = null;
  let imageMimeType = null;
  const texts = [];
  for (const p of parts) {
    const part = asRecord(p);
    if (!part) continue;
    if (typeof part.text === "string" && part.text.length > 0) texts.push(part.text);
    if (!image) {
      const inline = readInlineData(part);
      if (inline) {
        try {
          image = base64ToBytes(inline.data);
          imageMimeType = inline.mimeType;
        } catch {
        }
      }
    }
  }
  const text = texts.join("\n").trim();
  return { image, imageMimeType, text, note: extractNote(text) };
}
function readBlockReason(raw) {
  const root = asRecord(raw);
  const feedback = asRecord(root?.promptFeedback);
  if (typeof feedback?.blockReason === "string") return feedback.blockReason;
  const candidates = root?.candidates;
  const first = Array.isArray(candidates) ? asRecord(candidates[0]) : null;
  const finish = first?.finishReason;
  if (typeof finish === "string" && finish !== "STOP") return finish;
  return null;
}

// src/ui/ArtDialog.ts
var MODEL_FALLBACK = "gemini-3.1-flash-image";
function openArtDialog(host) {
  const t = makeT(host.locale);
  const lang = host.locale === "en" ? "en" : "ja";
  let styleFilter = "";
  let query = "";
  let selectedPainter = null;
  let busy = false;
  let sourcePng = null;
  let sourceSha = "";
  let artwork = null;
  const signature = {
    text: "",
    position: "bottom-right",
    fontId: "serif",
    sizeRatio: 0.04
  };
  const panel = el("div", { style: PANEL, dataset: { testid: "art-dialog" } });
  const header = el("div", { style: HEADER }, [
    el("div", {}, [
      el("div", { style: { fontWeight: "600" } }, [t("title")]),
      el("div", { style: { fontSize: "11px", opacity: "0.85" } }, [t("subtitle")])
    ]),
    el("button", { style: CLOSE_BTN, dataset: { testid: "art-close" }, onclick: () => panel.remove() }, ["\u2715"])
  ]);
  const body = el("div", { style: BODY });
  const footer = el("div", { style: FOOTER });
  panel.append(header, body, footer);
  makeDraggable(panel, header);
  stopWheelPropagation(panel);
  const status = el("div", { style: STATUS, dataset: { testid: "art-status" } });
  const styleSelect = el("select", { style: INPUT, dataset: { testid: "art-style" } }, [
    el("option", { value: "" }, [t("styleAll")]),
    ...STYLES.map((s) => el("option", { value: s.id }, [lang === "en" ? s.nameEn : s.nameJa]))
  ]);
  const searchInput = el("input", {
    style: INPUT,
    type: "text",
    spellcheck: false,
    placeholder: t("searchPainter"),
    dataset: { testid: "art-painter-search" }
  });
  const painterList = el("div", { style: LIST, dataset: { testid: "art-painter-list" } });
  const selectedLabel = el("div", { style: SELECTED, dataset: { testid: "art-painter-selected" } });
  function renderPainters() {
    painterList.textContent = "";
    const hits = searchPainters(query, styleFilter || void 0);
    if (hits.length === 0) {
      painterList.appendChild(el("div", { style: MUTED }, [t("noPainter")]));
      return;
    }
    for (const p of hits) {
      const style = STYLE_BY_ID.get(p.styleId);
      const row = el(
        "div",
        {
          style: { ...ROW, background: selectedPainter?.id === p.id ? "#dbeafe" : "transparent" },
          dataset: { testid: `art-painter-${p.id}` },
          onclick: () => {
            selectedPainter = p;
            renderPainters();
            renderSelected();
          }
        },
        [
          el("span", {}, [lang === "en" ? p.nameEn : p.nameJa]),
          el("span", { style: MUTED_INLINE }, [
            ` ${style ? lang === "en" ? style.nameEn : style.nameJa : p.styleId}`,
            p.died ? ` / ${p.died}` : p.note ? ` / ${p.note}` : ""
          ])
        ]
      );
      painterList.appendChild(row);
    }
  }
  function renderSelected() {
    selectedLabel.textContent = selectedPainter ? `${t("selected")}: ${lang === "en" ? selectedPainter.nameEn : selectedPainter.nameJa}` : "";
    updateButtons();
  }
  styleSelect.addEventListener("change", () => {
    styleFilter = styleSelect.value;
    renderPainters();
  });
  searchInput.addEventListener("input", () => {
    query = searchInput.value;
    renderPainters();
  });
  const sigText = el("input", {
    style: INPUT,
    type: "text",
    placeholder: "T. Kobayashi",
    dataset: { testid: "art-signature-text" }
  });
  const sigPosition = el(
    "select",
    { style: INPUT, dataset: { testid: "art-signature-position" } },
    SIGNATURE_POSITIONS.map((p) => el("option", { value: p }, [p]))
  );
  sigPosition.value = signature.position;
  const sigFont = el(
    "select",
    { style: INPUT, dataset: { testid: "art-signature-font" } },
    SIGNATURE_FONTS.map((f) => el("option", { value: f.id }, [f.label]))
  );
  const sigSize = el("input", {
    style: INPUT,
    type: "range",
    min: "2",
    max: "10",
    value: "4",
    dataset: { testid: "art-signature-size" }
  });
  const sigPreview = el("canvas", { style: SIG_PREVIEW, width: 260, height: 60 });
  function readSignature() {
    signature.text = sigText.value;
    signature.position = sigPosition.value;
    signature.fontId = sigFont.value;
    signature.sizeRatio = Number(sigSize.value) / 100;
  }
  function renderSignaturePreview() {
    readSignature();
    const ctx = sigPreview.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#e9eef4";
    ctx.fillRect(0, 0, sigPreview.width, sigPreview.height);
    drawSignature(ctx, sigPreview.width, sigPreview.height, {
      ...signature,
      position: "middle-center",
      sizeRatio: (signature.sizeRatio ?? 0.04) * 8
    });
  }
  for (const input of [sigText, sigPosition, sigFont, sigSize]) {
    input.addEventListener("input", renderSignaturePreview);
    input.addEventListener("change", renderSignaturePreview);
  }
  const bodyPartSelect = el("select", { style: INPUT, dataset: { testid: "art-bodypart" } }, [
    el("option", { value: "" }, [t("bodyPartNone")]),
    ...BODY_PART_TERMS.map((b) => el("option", { value: b }, [b]))
  ]);
  const sourceImg = el("img", { style: PREVIEW_IMG, alt: "", dataset: { testid: "art-source-preview" } });
  const modalityLabel = el("div", { style: MUTED });
  const resultImg = el("img", { style: RESULT_IMG, alt: "", dataset: { testid: "art-result-image" } });
  const resultText = el("div", { style: RESULT_TEXT, dataset: { testid: "art-result-text" } });
  const resultBox = el("div", { style: { ...SECTION, display: "none" }, dataset: { testid: "art-result" } }, [
    el("h3", { style: H3 }, [t("result")]),
    el("div", { style: TWO_COL }, [
      el("div", { style: { flex: "0 0 auto" } }, [resultImg]),
      resultText
    ])
  ]);
  const generateBtn = el("button", { style: PRIMARY_BTN, dataset: { testid: "art-generate" } }, [t("generate")]);
  const saveBtn = el("button", { style: BTN, dataset: { testid: "art-save" } }, [t("save")]);
  const closeBtn = el("button", { style: BTN, dataset: { testid: "art-close-footer" }, onclick: () => panel.remove() }, [t("close")]);
  function updateButtons() {
    generateBtn.disabled = busy || !selectedPainter || !sourcePng;
    generateBtn.textContent = busy ? t("generating") : t("generate");
    saveBtn.disabled = busy || !artwork;
    for (const c of [styleSelect, searchInput, sigText, sigPosition, sigFont, sigSize, bodyPartSelect]) {
      c.disabled = busy;
    }
  }
  function setStatus(message, kind = "info") {
    status.textContent = message;
    status.style.color = kind === "error" ? "#b00020" : kind === "ok" ? "#2e7d32" : "#5a6b7d";
  }
  async function prepareSource() {
    const target = host.getTargets()[0];
    if (!target) {
      setStatus(t("errNoTarget"), "error");
      return;
    }
    const pixels = await host.getPixelData(target.tileId);
    if (!pixels) {
      setStatus(t("errNoPixels"), "error");
      return;
    }
    const view = host.getViewState(target.tileId);
    const win = view && view.windowWidth > 0 ? { center: view.windowCenter, width: view.windowWidth, invert: view.invert } : autoWindow(pixels.data);
    const built = await buildSourceImage(pixels.data, pixels.cols, pixels.rows, win);
    sourcePng = built.png;
    sourceSha = await sha256Hex(grayToRgba(applyWindow(pixels.data, win)));
    sourceImg.src = URL.createObjectURL(new Blob([built.png], { type: "image/png" }));
    modalityLabel.textContent = `${t("resultModality")}: ${target.modality || "-"}`;
    updateButtons();
  }
  async function generate() {
    if (!selectedPainter) {
      setStatus(t("errNoPainter"), "error");
      return;
    }
    if (!sourcePng) {
      setStatus(t("errNoPixels"), "error");
      return;
    }
    const target = host.getTargets()[0];
    if (!target) {
      setStatus(t("errNoTarget"), "error");
      return;
    }
    readSignature();
    busy = true;
    artwork = null;
    updateButtons();
    setStatus(t("generating"));
    try {
      const modality = target.modality ?? "";
      const bodyPart = bodyPartSelect.value;
      const prompt = buildPrompt({
        painter: selectedPainter,
        facts: { modality, bodyPart },
        locale: lang
      });
      const model = MODEL_FALLBACK;
      const outcome = await host.ai.generate({
        model,
        prompt,
        imageBytes: sourcePng,
        mimeType: "image/png",
        // 同意はシリーズ単位で覚える。別シリーズに移ったら必ず出し直す。
        scopeKey: target.seriesUid
      });
      if (!outcome.ok) {
        setStatus(errorMessage(outcome.error), outcome.error === "canceled" ? "info" : "error");
        return;
      }
      const parsed = parseGeneration(outcome.data);
      if (!parsed.image) {
        const reason = readBlockReason(outcome.data);
        setStatus(reason ? t("errBlocked", { reason }) : t("errNoImage"), "error");
        return;
      }
      artwork = await composeArtwork(parsed.image, selectedPainter, signature);
      const meta = buildMetadata({
        appVersion: "",
        pluginVersion: true ? "0.1.0" : "",
        model,
        styleId: selectedPainter.styleId,
        painterId: selectedPainter.id,
        painterName: selectedPainter.nameEn,
        signature,
        modality,
        bodyPart,
        prompt,
        sourceImageSha256: sourceSha,
        imageSha256: await sha256Hex(artwork.rgba),
        pHash: pHash(artwork.rgba, artwork.width, artwork.height)
      });
      artwork.png = embedGraphyArt(artwork.png, meta);
      showResult(artwork, parsed.note, modality);
      setStatus("", "ok");
    } catch (e) {
      setStatus(t("errGeneric", { error: String(e) }), "error");
    } finally {
      busy = false;
      updateButtons();
    }
  }
  function errorMessage(code) {
    switch (code) {
      case "no-api-key":
        return t("errNoKey");
      case "permission-denied":
        return t("errPermission");
      case "desktop-only":
        return t("errDesktopOnly");
      case "busy":
        return t("errBusy");
      case "canceled":
        return "";
      default:
        return t("errGeneric", { error: code });
    }
  }
  async function composeArtwork(imageBytes, painter, sig) {
    const bitmap = await createImageBitmap(new Blob([imageBytes]));
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D \u30B3\u30F3\u30C6\u30AD\u30B9\u30C8\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F");
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    drawSignature(ctx, canvas.width, canvas.height, sig);
    const rgba = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const png = await rgbaToPng(rgba, canvas.width, canvas.height);
    return { rgba, width: canvas.width, height: canvas.height, png, painterId: painter.id };
  }
  function showResult(art, note, modality) {
    resultImg.src = URL.createObjectURL(new Blob([art.png], { type: "image/png" }));
    resultText.textContent = "";
    resultText.append(
      // 🔴 モダリティはローカルの DICOM 値を正とする。AI の出力で上書きしない。
      el("div", { style: FIELD_LABEL }, [t("resultModality")]),
      el("div", { style: FIELD_VALUE, dataset: { testid: "art-result-modality" } }, [modality || "-"]),
      el("div", { style: MUTED }, [t("modalityNote")]),
      el("div", { style: FIELD_LABEL }, [t("resultSubject")]),
      el("div", { style: FIELD_VALUE }, [note?.subject || "-"]),
      el("div", { style: FIELD_LABEL }, [t("resultAppreciation")]),
      el("div", { style: FIELD_VALUE }, [note?.appreciation || "-"]),
      // 🔴 注意書きは末尾ではなく内容の直後に置く（本体 analysisResults.ts の規範）。
      el("div", { style: CAVEAT, dataset: { testid: "art-caveat" } }, [t("caveat")])
    );
    resultBox.style.display = "block";
  }
  async function save() {
    if (!artwork) return;
    const result = await host.file.saveAs({
      defaultName: defaultFileName(artwork.painterId),
      bytes: artwork.png,
      filters: [{ name: "PNG", extensions: ["png"] }]
    });
    if (result.ok) setStatus(t("saved", { path: result.filePath }), "ok");
    else if (!result.canceled) setStatus(t("saveFailed", { error: result.error ?? "" }), "error");
  }
  generateBtn.addEventListener("click", () => void generate());
  saveBtn.addEventListener("click", () => void save());
  body.append(
    el("div", { style: SECTION }, [
      el("h3", { style: H3 }, [t("step1")]),
      labeled(t("style"), styleSelect),
      searchInput,
      painterList,
      selectedLabel,
      el("div", { style: MUTED }, [t("pdNote")])
    ]),
    el("div", { style: SECTION }, [
      el("h3", { style: H3 }, [t("step2")]),
      labeled(t("signatureText"), sigText),
      labeled(t("signaturePosition"), sigPosition),
      labeled(t("signatureFont"), sigFont),
      labeled(t("signatureSize"), sigSize),
      sigPreview,
      el("div", { style: MUTED }, [t("signatureColorNote")])
    ]),
    el("div", { style: SECTION }, [
      el("h3", { style: H3 }, [t("step3")]),
      labeled(t("bodyPart"), bodyPartSelect),
      el("div", { style: MUTED }, [t("bodyPartNote")]),
      el("div", { style: FIELD_LABEL }, [t("sourcePreview")]),
      sourceImg,
      modalityLabel
    ]),
    resultBox,
    el("div", { style: PRIVACY, dataset: { testid: "art-privacy" } }, [
      el("div", { style: { fontWeight: "600" } }, [t("privacyTitle")]),
      el("div", {}, [`\u30FB${t("privacy1")}`]),
      el("div", {}, [`\u30FB${t("privacy2")}`]),
      el("div", {}, [`\u30FB${t("privacy3")}`])
    ])
  );
  footer.append(status, el("div", { style: { flex: "1" } }), closeBtn, saveBtn, generateBtn);
  document.body.appendChild(panel);
  renderPainters();
  renderSelected();
  renderSignaturePreview();
  updateButtons();
  void prepareSource();
}
function labeled(label, control) {
  return el("label", { style: LABEL_ROW }, [el("span", { style: LABEL_TEXT }, [label]), control]);
}
var PANEL = {
  position: "fixed",
  top: "60px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "620px",
  maxWidth: "94vw",
  maxHeight: "86vh",
  display: "flex",
  flexDirection: "column",
  background: "#fff",
  color: "#22303d",
  border: "1px solid #b9c6d4",
  borderRadius: "6px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
  zIndex: "2147482000",
  font: "12px system-ui, sans-serif"
};
var HEADER = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 12px",
  background: "#0b5cad",
  color: "#fff",
  borderRadius: "5px 5px 0 0"
};
var BODY = { padding: "12px", overflowY: "auto", minHeight: "0", flex: "1" };
var FOOTER = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  borderTop: "1px solid #dfe6ee"
};
var SECTION = { marginBottom: "16px" };
var H3 = {
  fontSize: "12px",
  margin: "0 0 6px",
  paddingBottom: "3px",
  borderBottom: "1px solid #dfe6ee",
  color: "#5a6b7d"
};
var LABEL_ROW = { display: "flex", alignItems: "center", gap: "8px", margin: "4px 0" };
var LABEL_TEXT = { width: "110px", flex: "0 0 auto", color: "#5a6b7d" };
var INPUT = {
  flex: "1",
  minWidth: "0",
  padding: "3px 6px",
  fontSize: "12px",
  border: "1px solid #b9c6d4",
  borderRadius: "3px"
};
var LIST = {
  maxHeight: "170px",
  overflowY: "auto",
  border: "1px solid #dfe6ee",
  borderRadius: "3px",
  margin: "4px 0"
};
var ROW = { padding: "3px 6px", cursor: "pointer" };
var SELECTED = { fontWeight: "600", margin: "2px 0" };
var MUTED = { color: "#6b7785", fontSize: "11px", margin: "2px 0" };
var MUTED_INLINE = { color: "#6b7785" };
var SIG_PREVIEW = { border: "1px solid #dfe6ee", borderRadius: "3px", margin: "4px 0" };
var PREVIEW_IMG = {
  maxWidth: "200px",
  maxHeight: "200px",
  background: "#000",
  border: "1px solid #b9c6d4",
  display: "block"
};
var RESULT_IMG = {
  width: "240px",
  maxHeight: "300px",
  objectFit: "contain",
  background: "#000",
  border: "1px solid #b9c6d4",
  display: "block"
};
var TWO_COL = { display: "flex", gap: "12px", alignItems: "flex-start" };
var RESULT_TEXT = { flex: "1", minWidth: "0" };
var FIELD_LABEL = { color: "#5a6b7d", marginTop: "6px" };
var FIELD_VALUE = { whiteSpace: "pre-wrap", wordBreak: "break-word" };
var CAVEAT = {
  marginTop: "8px",
  padding: "6px 8px",
  background: "#fff6e5",
  borderLeft: "3px solid #8a4b00",
  color: "#8a4b00"
};
var PRIVACY = {
  padding: "8px",
  background: "#fff6e5",
  border: "1px solid #f0d9b5",
  borderRadius: "3px",
  color: "#8a4b00",
  lineHeight: "1.6"
};
var STATUS = { fontSize: "11px", maxWidth: "260px" };
var BTN = {
  padding: "4px 12px",
  fontSize: "12px",
  border: "1px solid #b9c6d4",
  borderRadius: "3px",
  background: "#f4f7fa",
  cursor: "pointer"
};
var PRIMARY_BTN = { ...BTN, background: "#0b5cad", borderColor: "#0b5cad", color: "#fff" };
var CLOSE_BTN = {
  background: "transparent",
  border: "none",
  color: "#fff",
  fontSize: "14px",
  cursor: "pointer"
};

// src/ui.ts
var plugin = {
  activate(host) {
    openArtDialog(host);
  }
};
var ui_default = plugin;
var activate = plugin.activate;
export {
  activate,
  ui_default as default
};
