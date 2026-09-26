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
  generatingNote: "\u89E3\u8AAC\u3092\u751F\u6210\u4E2D\u2026",
  result: "\u751F\u6210\u7D50\u679C",
  resultModality: "\u30E2\u30C0\u30EA\u30C6\u30A3",
  resultTitle: "\u30BF\u30A4\u30C8\u30EB\u6848",
  resultAppreciation: "\u9451\u8CDE\u306E\u305F\u3081\u306B",
  copy: "\u30B3\u30D4\u30FC",
  copied: "\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F",
  copyFailed: "\u30B3\u30D4\u30FC\u3067\u304D\u307E\u305B\u3093",
  copiedTitle: "\u30BF\u30A4\u30C8\u30EB\u3092\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F\u3002",
  copiedNote: "\u9451\u8CDE\u6587\u3092\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F\u3002",
  copyFailedStatus: "\u30B3\u30D4\u30FC\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u6587\u7AE0\u3092\u9078\u3093\u3067\u624B\u3067\u30B3\u30D4\u30FC\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  charCount: "{n} / {max} \u6587\u5B57",
  charOver: "{n} / {max} \u6587\u5B57\uFF08\u8D85\u904E\u3002\u6295\u7A3F\u6642\u306B\u5F3E\u304B\u308C\u307E\u3059\uFF09",
  retryNote: "\u89E3\u8AAC\u3092\u4F5C\u308A\u76F4\u3059",
  noteHint: "vis-ionary.com \u306E\u300CArt of GRAPHY\u300D\u306B\u6295\u7A3F\u3059\u308B\u3068\u304D\u306F\u3001\u3053\u306E 2 \u3064\u3092\u305D\u306E\u307E\u307E\u8CBC\u308C\u307E\u3059\u3002",
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
  errNoteFailed: "\u89E3\u8AAC\u3092\u751F\u6210\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\uFF08{error}\uFF09\u3002\u753B\u50CF\u306F\u4FDD\u5B58\u3067\u304D\u307E\u3059\u3002",
  errNoteEmpty: "\u89E3\u8AAC\u306E\u6587\u7AE0\u3092\u53D6\u308A\u51FA\u305B\u307E\u305B\u3093\u3067\u3057\u305F\u3002\u753B\u50CF\u306F\u4FDD\u5B58\u3067\u304D\u307E\u3059\u3002",
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
  generatingNote: "Writing the note\u2026",
  result: "Result",
  resultModality: "Modality",
  resultTitle: "Suggested title",
  resultAppreciation: "How to look at it",
  copy: "Copy",
  copied: "Copied",
  copyFailed: "Cannot copy",
  copiedTitle: "Title copied.",
  copiedNote: "Appreciation note copied.",
  copyFailedStatus: "Could not copy. Select the text and copy it by hand.",
  charCount: "{n} / {max} characters",
  charOver: "{n} / {max} characters (over the limit; the upload will be rejected)",
  retryNote: "Write the note again",
  noteHint: 'When you post to "Art of GRAPHY" on vis-ionary.com, these two can be pasted as they are.',
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
  errNoteFailed: "Could not write the note ({error}). The image can still be saved.",
  errNoteEmpty: "Could not read a note from the reply. The image can still be saved.",
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
  {
    id: "leonardo",
    nameJa: "\u30EC\u30AA\u30CA\u30EB\u30C9\u30FB\u30C0\u30FB\u30F4\u30A3\u30F3\u30C1",
    nameEn: "Leonardo da Vinci",
    born: 1452,
    died: 1519,
    pdYear: 1519,
    styleId: "renaissance",
    nationality: "Italian",
    keywords: ["davinci", "vinci"],
    works: [{ ja: "\u30E2\u30CA\u30FB\u30EA\u30B6", en: "Mona Lisa" }, { ja: "\u6700\u5F8C\u306E\u6669\u9910", en: "The Last Supper" }],
    styleJa: "\u8F2A\u90ED\u3092\u6EB6\u304B\u3059\u30B9\u30D5\u30DE\u30FC\u30C8\u3002\u6ED1\u3089\u304B\u306A\u9670\u5F71\u3068\u78BA\u304B\u306A\u89E3\u5256",
    promptHint: "sfumato, smoky transitions with no hard outline, subtle anatomical structure, muted umber and olive"
  },
  {
    id: "michelangelo",
    nameJa: "\u30DF\u30B1\u30E9\u30F3\u30B8\u30A7\u30ED",
    nameEn: "Michelangelo",
    born: 1475,
    died: 1564,
    pdYear: 1564,
    styleId: "renaissance",
    nationality: "Italian",
    keywords: ["buonarroti"],
    works: [{ ja: "\u30A2\u30C0\u30E0\u306E\u5275\u9020", en: "The Creation of Adam" }, { ja: "\u6700\u5F8C\u306E\u5BE9\u5224", en: "The Last Judgment" }],
    styleJa: "\u5F6B\u523B\u306E\u3088\u3046\u306A\u91CF\u611F\u3068\u306D\u3058\u308C\u305F\u80A2\u4F53\u3002\u30D5\u30EC\u30B9\u30B3\u306E\u8CEA\u611F",
    promptHint: "monumental sculptural volume, powerful torsion, fresco surface, terracotta and cool blue"
  },
  {
    id: "raphael",
    nameJa: "\u30E9\u30D5\u30A1\u30A8\u30ED",
    nameEn: "Raphael",
    born: 1483,
    died: 1520,
    pdYear: 1520,
    styleId: "renaissance",
    nationality: "Italian",
    keywords: ["raffaello", "sanzio"],
    works: [{ ja: "\u30A2\u30C6\u30CA\u30A4\u306E\u5B66\u5802", en: "The School of Athens" }, { ja: "\u5C0F\u6905\u5B50\u306E\u8056\u6BCD", en: "Madonna della Seggiola" }],
    styleJa: "\u5747\u8861\u306E\u3068\u308C\u305F\u69CB\u56F3\u3068\u6F84\u3093\u3060\u8272\u3002\u7A4F\u3084\u304B\u3067\u5B89\u5B9A\u3057\u305F\u5149",
    promptHint: "serene harmony, clear stable geometry, soft even light, limpid colour"
  },
  {
    id: "botticelli",
    nameJa: "\u30DC\u30C3\u30C6\u30A3\u30C1\u30A7\u30EA",
    nameEn: "Sandro Botticelli",
    born: 1445,
    died: 1510,
    pdYear: 1510,
    styleId: "renaissance",
    nationality: "Italian",
    keywords: ["sandro"],
    works: [{ ja: "\u30F4\u30A3\u30FC\u30CA\u30B9\u306E\u8A95\u751F", en: "The Birth of Venus" }, { ja: "\u30D7\u30EA\u30DE\u30F4\u30A7\u30FC\u30E9", en: "Primavera" }],
    styleJa: "\u6D41\u308C\u308B\u8F2A\u90ED\u7DDA\u3068\u6DE1\u3044\u808C\u3002\u88C5\u98FE\u7684\u306A\u30EA\u30BA\u30E0",
    promptHint: "flowing linear contour, pale luminous flesh, decorative rhythm, tempera delicacy"
  },
  {
    id: "vanEyck",
    nameJa: "\u30E4\u30F3\u30FB\u30D5\u30A1\u30F3\u30FB\u30A8\u30A4\u30AF",
    nameEn: "Jan van Eyck",
    born: 1390,
    died: 1441,
    pdYear: 1441,
    styleId: "renaissance",
    nationality: "Flemish",
    keywords: ["eyck", "van eyck"],
    works: [{ ja: "\u30A2\u30EB\u30CE\u30EB\u30D5\u30A3\u30FC\u30CB\u592B\u59BB\u50CF", en: "The Arnolfini Portrait" }, { ja: "\u30D8\u30F3\u30C8\u306E\u796D\u58C7\u753B", en: "The Ghent Altarpiece" }],
    styleJa: "\u9855\u5FAE\u93E1\u306E\u3088\u3046\u306A\u7D30\u5BC6\u63CF\u5199\u3002\u900F\u660E\u306A\u6CB9\u5F69\u306E\u5C64\u3067\u5B9D\u77F3\u306E\u3088\u3046\u306A\u8272",
    promptHint: "microscopic oil detail, deep translucent glazes, jewel-like saturated colour, meticulous texture"
  },
  {
    id: "durer",
    nameJa: "\u30A2\u30EB\u30D6\u30EC\u30D2\u30C8\u30FB\u30C7\u30E5\u30FC\u30E9\u30FC",
    nameEn: "Albrecht Durer",
    born: 1471,
    died: 1528,
    pdYear: 1528,
    styleId: "renaissance",
    nationality: "German",
    keywords: ["duerer", "durer", "albrecht"],
    works: [{ ja: "\u30E1\u30E9\u30F3\u30B3\u30EA\u30A2I", en: "Melencolia I" }, { ja: "\u82E5\u3044\u91CE\u514E", en: "Young Hare" }],
    styleJa: "\u7248\u753B\u306E\u3088\u3046\u306A\u7CBE\u5BC6\u3055\u3002\u7DFB\u5BC6\u306A\u5E73\u884C\u7DDA\u306E\u9670\u5F71",
    promptHint: "engraving-like precision, dense parallel hatching, austere northern detail"
  },
  {
    id: "bosch",
    nameJa: "\u30D2\u30A8\u30ED\u30CB\u30E0\u30B9\u30FB\u30DC\u30B9",
    nameEn: "Hieronymus Bosch",
    born: 1450,
    died: 1516,
    pdYear: 1516,
    styleId: "renaissance",
    nationality: "Netherlandish",
    keywords: ["hieronymus"],
    works: [{ ja: "\u5FEB\u697D\u306E\u5712", en: "The Garden of Earthly Delights" }, { ja: "\u4E7E\u8349\u8ECA", en: "The Haywain Triptych" }],
    styleJa: "\u5E7B\u60F3\u7684\u306A\u7D30\u90E8\u306E\u5897\u6B96\u3002\u6DE1\u304F\u9178\u5473\u306E\u3042\u308B\u8272\u3068\u5922\u306E\u3088\u3046\u306A\u4E0D\u6761\u7406",
    promptHint: "fantastical proliferating detail, pale acid palette, dreamlike incongruity"
  },
  {
    id: "bruegel",
    nameJa: "\u30D4\u30FC\u30C6\u30EB\u30FB\u30D6\u30EA\u30E5\u30FC\u30B2\u30EB\uFF08\u7236\uFF09",
    nameEn: "Pieter Bruegel the Elder",
    born: 1525,
    died: 1569,
    pdYear: 1569,
    styleId: "renaissance",
    nationality: "Flemish",
    keywords: ["brueghel", "pieter"],
    works: [{ ja: "\u30D0\u30D9\u30EB\u306E\u5854", en: "The Tower of Babel" }, { ja: "\u96EA\u4E2D\u306E\u72E9\u4EBA", en: "The Hunters in the Snow" }],
    styleJa: "\u9AD8\u3044\u8996\u70B9\u306E\u4FEF\u77B0\u3002\u5C0F\u3055\u306A\u4EBA\u7269\u304C\u7FA4\u308C\u3001\u571F\u3063\u307D\u3044\u7DD1\u3068\u9EC4\u571F",
    promptHint: "high panoramic viewpoint, teeming small figures, earthy green and ochre, wintry light"
  },
  // ── バロック／マニエリスム ──────────────────────────────────────────────
  {
    id: "caravaggio",
    nameJa: "\u30AB\u30E9\u30F4\u30A1\u30C3\u30B8\u30E7",
    nameEn: "Caravaggio",
    born: 1571,
    died: 1610,
    pdYear: 1610,
    styleId: "baroque",
    nationality: "Italian",
    keywords: ["merisi"],
    works: [{ ja: "\u30CA\u30EB\u30AD\u30C3\u30BD\u30B9", en: "Narcissus" }, { ja: "\u8056\u30DE\u30BF\u30A4\u306E\u53EC\u547D", en: "The Calling of Saint Matthew" }],
    styleJa: "\u6F06\u9ED2\u306E\u95C7\u304B\u3089\u4E00\u6761\u306E\u5149\u3002\u6975\u7AEF\u306A\u660E\u6697\u3067\u5287\u7684\u306B\u6D6E\u304B\u3076",
    promptHint: "extreme tenebrism, black ground, one hard raking light, unidealised naturalism"
  },
  {
    id: "rembrandt",
    nameJa: "\u30EC\u30F3\u30D6\u30E9\u30F3\u30C8",
    nameEn: "Rembrandt van Rijn",
    born: 1606,
    died: 1669,
    pdYear: 1669,
    styleId: "baroque",
    nationality: "Dutch",
    keywords: ["rijn", "van rijn"],
    works: [{ ja: "\u591C\u8B66", en: "The Night Watch" }, { ja: "\u81EA\u753B\u50CF", en: "Self-Portrait" }],
    styleJa: "\u6DF1\u3044\u8910\u8272\u306E\u95C7\u304B\u3089\u91D1\u8272\u306E\u5149\u304C\u6EF2\u3080\u3002\u539A\u5857\u308A\u306E\u660E\u90E8",
    promptHint: "golden inner glow emerging from deep brown shadow, loaded impasto in lights, profound quiet"
  },
  {
    id: "vermeer",
    nameJa: "\u30D5\u30A7\u30EB\u30E1\u30FC\u30EB",
    nameEn: "Johannes Vermeer",
    born: 1632,
    died: 1675,
    pdYear: 1675,
    styleId: "baroque",
    nationality: "Dutch",
    keywords: ["johannes", "delft"],
    works: [{ ja: "\u771F\u73E0\u306E\u8033\u98FE\u308A\u306E\u5C11\u5973", en: "Girl with a Pearl Earring" }, { ja: "\u725B\u4E73\u3092\u6CE8\u3050\u5973", en: "The Milkmaid" }],
    styleJa: "\u5DE6\u304B\u3089\u306E\u7A93\u306E\u5149\u3002\u9759\u8B10\u3067\u3001\u30A6\u30EB\u30C8\u30E9\u30DE\u30EA\u30F3\u3068\u30EC\u30E2\u30F3\u8272\u304C\u51B4\u3048\u308B",
    promptHint: "cool northern window light from the left, pointille highlights, ultramarine and lemon yellow, still calm"
  },
  {
    id: "velazquez",
    nameJa: "\u30D9\u30E9\u30B9\u30B1\u30B9",
    nameEn: "Diego Velazquez",
    born: 1599,
    died: 1660,
    pdYear: 1660,
    styleId: "baroque",
    nationality: "Spanish",
    keywords: ["diego", "velasquez"],
    works: [{ ja: "\u30E9\u30B9\u30FB\u30E1\u30CB\u30FC\u30CA\u30B9", en: "Las Meninas" }, { ja: "\u6559\u7687\u30A4\u30F3\u30CE\u30B1\u30F3\u30C6\u30A3\u30A6\u30B910\u4E16\u306E\u8096\u50CF", en: "Portrait of Pope Innocent X" }],
    styleJa: "\u6D41\u308C\u308B\u3088\u3046\u306A\u7B46\u81F4\u3068\u9280\u7070\u8272\u306E\u7A7A\u6C17\u3002\u7121\u99C4\u306E\u306A\u3044\u63CF\u5199",
    promptHint: "fluid economical brushwork, silvery grey atmosphere, effortless optical truth"
  },
  {
    id: "elGreco",
    nameJa: "\u30A8\u30EB\u30FB\u30B0\u30EC\u30B3",
    nameEn: "El Greco",
    born: 1541,
    died: 1614,
    pdYear: 1614,
    styleId: "baroque",
    nationality: "Spanish",
    keywords: ["greco", "theotokopoulos"],
    works: [{ ja: "\u30AA\u30EB\u30AC\u30B9\u4F2F\u306E\u57CB\u846C", en: "The Burial of the Count of Orgaz" }, { ja: "\u30C8\u30EC\u30C9\u98A8\u666F", en: "View of Toledo" }],
    styleJa: "\u5F15\u304D\u4F38\u3070\u3055\u308C\u305F\u4EBA\u4F53\u3068\u51B7\u305F\u3044\u7DD1\u30FB\u7D2B\u3002\u63FA\u3089\u3081\u304F\u5E7B\u8996\u7684\u306A\u5149",
    promptHint: "elongated attenuated forms, cold acid green and violet, flickering visionary light"
  },
  // ── ロマン主義／新古典 ─────────────────────────────────────────────────
  {
    id: "goya",
    nameJa: "\u30B4\u30E4",
    nameEn: "Francisco Goya",
    born: 1746,
    died: 1828,
    pdYear: 1828,
    styleId: "romanticism",
    nationality: "Spanish",
    keywords: ["francisco"],
    works: [{ ja: "\u6211\u304C\u5B50\u3092\u55B0\u3089\u3046\u30B5\u30C8\u30A5\u30EB\u30CC\u30B9", en: "Saturn Devouring His Son" }, { ja: "1808\u5E745\u67083\u65E5", en: "The Third of May 1808" }],
    styleJa: "\u6697\u3044\u571F\u8272\u3068\u9ED2\u3002\u8352\u3044\u7B46\u81F4\u3067\u4E0D\u7A4F\u306A\u91CD\u3055",
    promptHint: "sombre earth and black, raw expressive handling, unsettling psychological weight"
  },
  {
    id: "delacroix",
    nameJa: "\u30C9\u30E9\u30AF\u30ED\u30EF",
    nameEn: "Eugene Delacroix",
    born: 1798,
    died: 1863,
    pdYear: 1863,
    styleId: "romanticism",
    nationality: "French",
    keywords: ["eugene"],
    works: [{ ja: "\u6C11\u8846\u3092\u5C0E\u304F\u81EA\u7531\u306E\u5973\u795E", en: "Liberty Leading the People" }, { ja: "\u30AD\u30AA\u30B9\u5CF6\u306E\u8650\u6BBA", en: "The Massacre at Chios" }],
    styleJa: "\u6FC0\u3057\u3044\u8272\u3068\u659C\u3081\u306E\u52D5\u304D\u3002\u88DC\u8272\u304C\u3076\u3064\u304B\u3063\u3066\u9707\u3048\u308B",
    promptHint: "vehement colour, sweeping diagonal movement, vibrating complementary contrasts"
  },
  {
    id: "turner",
    nameJa: "\u30BF\u30FC\u30CA\u30FC",
    nameEn: "J. M. W. Turner",
    born: 1775,
    died: 1851,
    pdYear: 1851,
    styleId: "romanticism",
    nationality: "British",
    keywords: ["jmw", "william turner"],
    works: [{ ja: "\u96E8\u3001\u84B8\u6C17\u3001\u901F\u5EA6", en: "Rain, Steam and Speed" }, { ja: "\u6226\u8266\u30C6\u30E1\u30EC\u30FC\u30EB\u53F7", en: "The Fighting Temeraire" }],
    styleJa: "\u5F62\u304C\u5149\u3068\u5927\u6C17\u306B\u6EB6\u3051\u308B\u3002\u767D\u3068\u91D1\u304C\u307E\u3076\u3057\u304F\u971E\u3080",
    promptHint: "form dissolved into luminous atmosphere, blazing whites and golds, veils of scumbled light"
  },
  {
    id: "constable",
    nameJa: "\u30B3\u30F3\u30B9\u30BF\u30D6\u30EB",
    nameEn: "John Constable",
    born: 1776,
    died: 1837,
    pdYear: 1837,
    styleId: "romanticism",
    nationality: "British",
    keywords: ["john"],
    works: [{ ja: "\u5E72\u8349\u8ECA", en: "The Hay Wain" }, { ja: "\u30D5\u30E9\u30C3\u30C8\u30D5\u30A9\u30FC\u30C9\u306E\u88FD\u7C89\u6240", en: "Flatford Mill" }],
    styleJa: "\u307F\u305A\u307F\u305A\u3057\u3044\u7DD1\u306E\u98A8\u666F\u3002\u767D\u3044\u5149\u306E\u6591\u3068\u52D5\u304F\u96F2",
    promptHint: "fresh green landscape, broken white highlights, moving cloud and shifting daylight"
  },
  {
    id: "friedrich",
    nameJa: "\u30AB\u30B9\u30D1\u30FC\u30FB\u30C0\u30FC\u30F4\u30A3\u30C8\u30FB\u30D5\u30EA\u30FC\u30C9\u30EA\u30D2",
    nameEn: "Caspar David Friedrich",
    born: 1774,
    died: 1840,
    pdYear: 1840,
    styleId: "romanticism",
    nationality: "German",
    keywords: ["caspar", "david friedrich"],
    works: [{ ja: "\u96F2\u6D77\u306E\u4E0A\u306E\u65C5\u4EBA", en: "Wanderer above the Sea of Fog" }, { ja: "\u6C37\u306E\u6D77", en: "The Sea of Ice" }],
    styleJa: "\u5E83\u5927\u306A\u9759\u5BC2\u3002\u971E\u3092\u80CC\u306B\u3057\u305F\u5B64\u72EC\u306A\u5F71\u3002\u51B7\u305F\u304F\u5D07\u9AD8",
    promptHint: "vast silent space, solitary silhouette against luminous haze, cold sublime stillness"
  },
  {
    id: "blake",
    nameJa: "\u30A6\u30A3\u30EA\u30A2\u30E0\u30FB\u30D6\u30EC\u30A4\u30AF",
    nameEn: "William Blake",
    born: 1757,
    died: 1827,
    pdYear: 1827,
    styleId: "romanticism",
    nationality: "British",
    keywords: ["william"],
    works: [{ ja: "\u65E5\u306E\u8001\u3044\u305F\u308B\u8005", en: "The Ancient of Days" }, { ja: "\u5DE8\u5927\u306A\u8D64\u3044\u7ADC", en: "The Great Red Dragon" }],
    styleJa: "\u7DDA\u3067\u63CF\u304F\u5E7B\u8996\u3002\u7248\u523B\u306E\u8F2A\u90ED\u306B\u6C34\u5F69\u3068\u8C61\u5FB4\u7684\u306A\u5149",
    promptHint: "visionary linear figures, watercolour over engraved outline, radiant symbolic light"
  },
  // ── 写実主義／バルビゾン ────────────────────────────────────────────────
  {
    id: "courbet",
    nameJa: "\u30AF\u30FC\u30EB\u30D9",
    nameEn: "Gustave Courbet",
    born: 1819,
    died: 1877,
    pdYear: 1877,
    styleId: "realism",
    nationality: "French",
    keywords: ["gustave"],
    works: [{ ja: "\u30AA\u30EB\u30CA\u30F3\u306E\u57CB\u846C", en: "A Burial at Ornans" }, { ja: "\u753B\u5BB6\u306E\u30A2\u30C8\u30EA\u30A8", en: "The Painter's Studio" }],
    styleJa: "\u30DA\u30A4\u30F3\u30C6\u30A3\u30F3\u30B0\u30CA\u30A4\u30D5\u306E\u539A\u307F\u3002\u6697\u3044\u5730\u306B\u7269\u8CEA\u611F\u306E\u3042\u308B\u63CF\u5199",
    promptHint: "palette-knife density, dark tonal ground, blunt material presence"
  },
  {
    id: "millet",
    nameJa: "\u30DF\u30EC\u30FC",
    nameEn: "Jean-Francois Millet",
    born: 1814,
    died: 1875,
    pdYear: 1875,
    styleId: "realism",
    nationality: "French",
    keywords: ["jean francois"],
    works: [{ ja: "\u843D\u7A42\u62FE\u3044", en: "The Gleaners" }, { ja: "\u6669\u9418", en: "The Angelus" }],
    styleJa: "\u91CD\u3005\u3057\u3044\u8FB2\u6C11\u306E\u59FF\u3002\u57C3\u3063\u307D\u3044\u91D1\u8272\u306E\u5149\u3068\u6291\u3048\u305F\u571F\u8272",
    promptHint: "grave monumental peasant forms, dusty golden light, muted earth tones"
  },
  {
    id: "repin",
    nameJa: "\u30EC\u30FC\u30D4\u30F3",
    nameEn: "Ilya Repin",
    born: 1844,
    died: 1930,
    pdYear: 1930,
    styleId: "realism",
    nationality: "Russian",
    keywords: ["ilya"],
    works: [{ ja: "\u30F4\u30A9\u30EB\u30AC\u306E\u821F\u66F3\u304D", en: "Barge Haulers on the Volga" }, { ja: "\u30A4\u30F4\u30A1\u30F3\u96F7\u5E1D\u3068\u305D\u306E\u606F\u5B50", en: "Ivan the Terrible and His Son" }],
    styleJa: "\u529B\u5F37\u3044\u5FC3\u7406\u63CF\u5199\u3002\u9AA8\u592A\u306E\u7B46\u81F4\u3068\u6C88\u3093\u3060\u8272\u8ABF",
    promptHint: "vigorous psychological realism, robust brushwork, sober russian palette"
  },
  {
    id: "aivazovsky",
    nameJa: "\u30A2\u30A4\u30F4\u30A1\u30BE\u30D5\u30B9\u30AD\u30FC",
    nameEn: "Ivan Aivazovsky",
    born: 1817,
    died: 1900,
    pdYear: 1900,
    styleId: "realism",
    nationality: "Russian",
    keywords: ["ivan", "aivazovski"],
    works: [{ ja: "\u7B2C\u4E5D\u306E\u6CE2", en: "The Ninth Wave" }, { ja: "\u9ED2\u6D77", en: "The Black Sea" }],
    styleJa: "\u900F\u304D\u3068\u304A\u308B\u6C34\u3068\u5287\u7684\u306A\u6D77\u306E\u5149\u3002\u8F1D\u304F\u900F\u660E\u306A\u5C64",
    promptHint: "translucent luminous water, dramatic marine light, glowing transparent glazes"
  },
  // ── 印象派 ────────────────────────────────────────────────────────────
  {
    id: "monet",
    nameJa: "\u30AF\u30ED\u30FC\u30C9\u30FB\u30E2\u30CD",
    nameEn: "Claude Monet",
    born: 1840,
    died: 1926,
    pdYear: 1926,
    styleId: "impressionism",
    nationality: "French",
    keywords: ["claude"],
    works: [{ ja: "\u5370\u8C61\u30FB\u65E5\u306E\u51FA", en: "Impression, Sunrise" }, { ja: "\u7761\u84EE", en: "Water Lilies" }],
    styleJa: "\u77ED\u3044\u7B46\u89E6\u3067\u6EB6\u3051\u308B\u5927\u6C17\u3002\u5F71\u304C\u9752\u3084\u7D2B\u3067\u3001\u5149\u304C\u304D\u3089\u3081\u304F",
    promptHint: "dissolving atmospheric colour, repeated short strokes, violet and blue shadows, shimmering light"
  },
  {
    id: "renoir",
    nameJa: "\u30EB\u30CE\u30EF\u30FC\u30EB",
    nameEn: "Pierre-Auguste Renoir",
    born: 1841,
    died: 1919,
    pdYear: 1919,
    styleId: "impressionism",
    nationality: "French",
    keywords: ["auguste", "pierre"],
    works: [{ ja: "\u30E0\u30FC\u30E9\u30F3\u30FB\u30C9\u30FB\u30E9\u30FB\u30AE\u30E3\u30EC\u30C3\u30C8\u306E\u821E\u8E0F\u4F1A", en: "Bal du moulin de la Galette" }, { ja: "\u821F\u904A\u3073\u306E\u4EBA\u3005\u306E\u663C\u98DF", en: "Luncheon of the Boating Party" }],
    styleJa: "\u3070\u3089\u8272\u306E\u808C\u3068\u67D4\u3089\u304B\u306A\u7B46\u3002\u6728\u6F0F\u308C\u65E5\u306E\u3088\u3046\u306A\u5149",
    promptHint: "warm rosy flesh tones, feathery soft touch, dappled sunlight"
  },
  {
    id: "degas",
    nameJa: "\u30C9\u30AC",
    nameEn: "Edgar Degas",
    born: 1834,
    died: 1917,
    pdYear: 1917,
    styleId: "impressionism",
    nationality: "French",
    keywords: ["edgar"],
    works: [{ ja: "\u30A8\u30C8\u30EF\u30FC\u30EB", en: "The Star" }, { ja: "\u8E0A\u308A\u306E\u7A3D\u53E4\u5834", en: "The Dance Class" }],
    styleJa: "\u601D\u3044\u304C\u3051\u306A\u3044\u5207\u308A\u53D6\u308A\u65B9\u3002\u30D1\u30B9\u30C6\u30EB\u306E\u7DDA\u3068\u821E\u53F0\u306E\u4EBA\u5DE5\u5149",
    promptHint: "unexpected cropped viewpoint, pastel hatching, artificial stage light"
  },
  {
    id: "manet",
    nameJa: "\u30DE\u30CD",
    nameEn: "Edouard Manet",
    born: 1832,
    died: 1883,
    pdYear: 1883,
    styleId: "impressionism",
    nationality: "French",
    keywords: ["edouard"],
    works: [{ ja: "\u8349\u4E0A\u306E\u663C\u98DF", en: "Le Dejeuner sur l'herbe" }, { ja: "\u30AA\u30E9\u30F3\u30D4\u30A2", en: "Olympia" }],
    styleJa: "\u5E73\u5766\u306A\u8272\u306E\u584A\u3068\u7387\u76F4\u306A\u9ED2\u3002\u7C21\u6F54\u3067\u5207\u308C\u306E\u3044\u3044\u7B46",
    promptHint: "flattened tonal masses, frank black, crisp economical brushwork"
  },
  {
    id: "pissarro",
    nameJa: "\u30D4\u30B5\u30ED",
    nameEn: "Camille Pissarro",
    born: 1830,
    died: 1903,
    pdYear: 1903,
    styleId: "impressionism",
    nationality: "French",
    keywords: ["camille"],
    works: [{ ja: "\u30E2\u30F3\u30DE\u30EB\u30C8\u30EB\u5927\u901A\u308A", en: "Boulevard Montmartre" }, { ja: "\u8D64\u3044\u5C4B\u6839", en: "The Red Roofs" }],
    styleJa: "\u7D30\u304B\u306A\u7B46\u89E6\u3092\u7E54\u308B\u3088\u3046\u306B\u91CD\u306D\u308B\u3002\u9280\u8272\u306B\u62E1\u6563\u3057\u305F\u5149",
    promptHint: "dense woven small strokes, humble rural motif, silvery diffused light"
  },
  {
    id: "sisley",
    nameJa: "\u30B7\u30B9\u30EC\u30FC",
    nameEn: "Alfred Sisley",
    born: 1839,
    died: 1899,
    pdYear: 1899,
    styleId: "impressionism",
    nationality: "French",
    keywords: ["alfred"],
    works: [{ ja: "\u30DD\u30FC\u30EB\u30FB\u30DE\u30EB\u30EA\u30FC\u306E\u6D2A\u6C34", en: "Flood at Port-Marly" }, { ja: "\u30E2\u30EC\u306E\u30DD\u30D7\u30E9\u4E26\u6728", en: "Poplar Avenue at Moret" }],
    styleJa: "\u5E83\u3044\u7A7A\u3068\u7A4F\u3084\u304B\u306A\u968E\u8ABF\u3002\u9759\u304B\u306A\u6C34\u8FBA\u306E\u5149",
    promptHint: "wide luminous sky, delicate tonal harmony, quiet river light"
  },
  {
    id: "morisot",
    nameJa: "\u30D9\u30EB\u30C8\u30FB\u30E2\u30EA\u30BE",
    nameEn: "Berthe Morisot",
    born: 1841,
    died: 1895,
    pdYear: 1895,
    styleId: "impressionism",
    nationality: "French",
    keywords: ["berthe"],
    works: [{ ja: "\u3086\u308A\u304B\u3054", en: "The Cradle" }, { ja: "\u590F\u306E\u65E5", en: "Summer's Day" }],
    styleJa: "\u7D20\u65E9\u304F\u958B\u3044\u305F\u7B46\u81F4\u3002\u6DE1\u304F\u8EFD\u3084\u304B\u3067\u8F2A\u90ED\u3092\u6B8B\u3055\u306A\u3044",
    promptHint: "rapid open brushwork, pale airy palette, unfinished breathing edges"
  },
  {
    id: "cassatt",
    nameJa: "\u30E1\u30A2\u30EA\u30FC\u30FB\u30AB\u30B5\u30C3\u30C8",
    nameEn: "Mary Cassatt",
    born: 1844,
    died: 1926,
    pdYear: 1926,
    styleId: "impressionism",
    nationality: "American",
    keywords: ["mary"],
    works: [{ ja: "\u821F\u904A\u3073", en: "The Boating Party" }, { ja: "\u6BCD\u3068\u5B50", en: "Mother and Child" }],
    styleJa: "\u89AA\u5BC6\u306A\u5207\u308A\u53D6\u308A\u3002\u6D6E\u4E16\u7D75\u3075\u3046\u306E\u5E73\u3089\u306A\u6A21\u69D8\u3068\u6DE1\u3044\u8272",
    promptHint: "tender intimate framing, japanese-influenced flat pattern, soft pastel colour"
  },
  // ── 後期印象派／点描 ───────────────────────────────────────────────────
  {
    id: "vanGogh",
    nameJa: "\u30D5\u30A3\u30F3\u30BB\u30F3\u30C8\u30FB\u30D5\u30A1\u30F3\u30FB\u30B4\u30C3\u30DB",
    nameEn: "Vincent van Gogh",
    born: 1853,
    died: 1890,
    pdYear: 1890,
    styleId: "postImpressionism",
    nationality: "Dutch",
    keywords: ["gogh", "vincent", "van gogh"],
    works: [{ ja: "\u661F\u6708\u591C", en: "The Starry Night" }, { ja: "\u3072\u307E\u308F\u308A", en: "Sunflowers" }],
    styleJa: "\u6E26\u3092\u5DFB\u304F\u539A\u5857\u308A\u3002\u30AF\u30ED\u30E0\u30A4\u30A8\u30ED\u30FC\u3068\u30B3\u30D0\u30EB\u30C8\u304C\u8108\u6253\u3064",
    promptHint: "thick swirling directional impasto, intense chrome yellow and cobalt, pulsating rhythmic strokes"
  },
  {
    id: "cezanne",
    nameJa: "\u30BB\u30B6\u30F3\u30CC",
    nameEn: "Paul Cezanne",
    born: 1839,
    died: 1906,
    pdYear: 1906,
    styleId: "postImpressionism",
    nationality: "French",
    keywords: ["paul"],
    works: [{ ja: "\u30B5\u30F3\u30C8\u30FB\u30F4\u30A3\u30AF\u30C8\u30EF\u30FC\u30EB\u5C71", en: "Mont Sainte-Victoire" }, { ja: "\u6797\u6A8E\u3068\u30AA\u30EC\u30F3\u30B8", en: "Apples and Oranges" }],
    styleJa: "\u9762\u3067\u69CB\u7BC9\u3059\u308B\u7B46\u89E6\u3002\u8996\u70B9\u304C\u305A\u308C\u3001\u7DD1\u3068\u9EC4\u571F\u304C\u5C64\u306B\u306A\u308B",
    promptHint: "constructive planar patches, tilted shifting perspective, cool green and ochre modulation"
  },
  {
    id: "gauguin",
    nameJa: "\u30B4\u30FC\u30AE\u30E3\u30F3",
    nameEn: "Paul Gauguin",
    born: 1848,
    died: 1903,
    pdYear: 1903,
    styleId: "postImpressionism",
    nationality: "French",
    keywords: ["paul"],
    works: [{ ja: "\u6211\u3005\u306F\u3069\u3053\u304B\u3089\u6765\u305F\u306E\u304B", en: "Where Do We Come From? What Are We? Where Are We Going?" }, { ja: "\u30BF\u30D2\u30C1\u306E\u5973\u305F\u3061", en: "Tahitian Women on the Beach" }],
    styleJa: "\u5E73\u3089\u306A\u8272\u9762\u3092\u6FC3\u3044\u8F2A\u90ED\u3067\u56F2\u3046\u3002\u8C61\u5FB4\u7684\u3067\u81EA\u7136\u3092\u96E2\u308C\u305F\u8272",
    promptHint: "flat cloisonne colour fields, bold dark contour, symbolic non-naturalistic hue"
  },
  {
    id: "seurat",
    nameJa: "\u30B9\u30FC\u30E9",
    nameEn: "Georges Seurat",
    born: 1859,
    died: 1891,
    pdYear: 1891,
    styleId: "postImpressionism",
    nationality: "French",
    keywords: ["georges", "pointillism"],
    works: [{ ja: "\u30B0\u30E9\u30F3\u30C9\u30FB\u30B8\u30E3\u30C3\u30C8\u5CF6\u306E\u65E5\u66DC\u65E5\u306E\u5348\u5F8C", en: "A Sunday on La Grande Jatte" }, { ja: "\u30A2\u30CB\u30A8\u30FC\u30EB\u306E\u6C34\u6D74", en: "Bathers at Asnieres" }],
    styleJa: "\u7D14\u8272\u306E\u70B9\u3092\u898F\u5247\u7684\u306B\u4E26\u3079\u308B\u3002\u9759\u304B\u3067\u8A18\u5FF5\u7891\u7684\u306A\u4F47\u307E\u3044",
    promptHint: "systematic pointillist dots of pure pigment, still monumental calm, luminous optical blend"
  },
  {
    id: "signac",
    nameJa: "\u30B7\u30CB\u30E3\u30C3\u30AF",
    nameEn: "Paul Signac",
    born: 1863,
    died: 1935,
    pdYear: 1935,
    styleId: "postImpressionism",
    nationality: "French",
    keywords: ["paul", "divisionism"],
    works: [{ ja: "\u8D64\u3044\u6D6E\u6A19", en: "The Red Buoy" }, { ja: "\u30B5\u30F3\u30FB\u30C8\u30ED\u30DA\u306E\u6E2F", en: "The Port of Saint-Tropez" }],
    styleJa: "\u30E2\u30B6\u30A4\u30AF\u306E\u3088\u3046\u306A\u5927\u304D\u306A\u8272\u7247\u3002\u6E2F\u306E\u8272\u304C\u9BAE\u70C8\u306B\u8F1D\u304F",
    promptHint: "large mosaic-like divisionist tesserae, brilliant saturated harbour colour"
  },
  {
    id: "toulouseLautrec",
    nameJa: "\u30ED\u30FC\u30C8\u30EC\u30C3\u30AF",
    nameEn: "Henri de Toulouse-Lautrec",
    born: 1864,
    died: 1901,
    pdYear: 1901,
    styleId: "postImpressionism",
    nationality: "French",
    keywords: ["henri", "lautrec", "toulouse"],
    works: [{ ja: "\u30E0\u30FC\u30E9\u30F3\u30FB\u30EB\u30FC\u30B8\u30E5\u306B\u3066", en: "At the Moulin Rouge" }, { ja: "\u30B8\u30E3\u30CC\u30FB\u30A2\u30F4\u30EA\u30EB", en: "Jane Avril" }],
    styleJa: "\u30DD\u30B9\u30BF\u30FC\u306E\u3088\u3046\u306A\u5E73\u3089\u306A\u5F71\u3002\u5927\u80C6\u306A\u7DDA\u3068\u4EBA\u5DE5\u5149\u306E\u9178\u5473",
    promptHint: "poster-like flat silhouette, sweeping calligraphic line, acid artificial light"
  },
  // ── 象徴主義／世紀末 ───────────────────────────────────────────────────
  {
    id: "klimt",
    nameJa: "\u30AF\u30EA\u30E0\u30C8",
    nameEn: "Gustav Klimt",
    born: 1862,
    died: 1918,
    pdYear: 1918,
    styleId: "symbolism",
    nationality: "Austrian",
    keywords: ["gustav"],
    works: [{ ja: "\u63A5\u543B", en: "The Kiss" }, { ja: "\u30A2\u30C7\u30FC\u30EC\u30FB\u30D6\u30ED\u30C3\u30DB\uFF1D\u30D0\u30A6\u30A2\u30FC\u306E\u8096\u50CF", en: "Portrait of Adele Bloch-Bauer I" }],
    styleJa: "\u91D1\u7B94\u306E\u88C5\u98FE\u3068\u30E2\u30B6\u30A4\u30AF\u72B6\u306E\u6587\u69D8\u3002\u5199\u5B9F\u306E\u90E8\u5206\u3068\u5BFE\u6BD4\u3059\u308B",
    promptHint: "gold leaf ornament, mosaic-like decorative pattern against naturalistic passages, byzantine richness"
  },
  {
    id: "schiele",
    nameJa: "\u30A8\u30B4\u30F3\u30FB\u30B7\u30FC\u30EC",
    nameEn: "Egon Schiele",
    born: 1890,
    died: 1918,
    pdYear: 1918,
    styleId: "symbolism",
    nationality: "Austrian",
    keywords: ["egon"],
    works: [{ ja: "\u62B1\u64C1", en: "The Embrace" }, { ja: "\u6B7B\u3068\u4E59\u5973", en: "Death and the Maiden" }],
    styleJa: "\u8352\u304F\u89D2\u3070\u3063\u305F\u8F2A\u90ED\u3002\u75E9\u305B\u3066\u5F15\u304D\u4F38\u3070\u3055\u308C\u305F\u4F53\u3068\u7D20\u5730",
    promptHint: "raw angular contour, gaunt attenuated form, sparse bleached ground"
  },
  {
    id: "munch",
    nameJa: "\u30E0\u30F3\u30AF",
    nameEn: "Edvard Munch",
    born: 1863,
    died: 1944,
    pdYear: 1944,
    styleId: "symbolism",
    nationality: "Norwegian",
    keywords: ["edvard"],
    works: [{ ja: "\u53EB\u3073", en: "The Scream" }, { ja: "\u30DE\u30C9\u30F3\u30CA", en: "Madonna" }],
    styleJa: "\u3046\u306D\u308B\u5E2F\u72B6\u306E\u7B46\u3002\u4E0D\u5B89\u3092\u5E2F\u3073\u305F\u5F37\u3044\u8272\u3067\u8F2A\u90ED\u304C\u6EB6\u3051\u308B",
    promptHint: "undulating wave-like bands, anxious saturated colour, dissolving contour"
  },
  {
    id: "redon",
    nameJa: "\u30EB\u30C9\u30F3",
    nameEn: "Odilon Redon",
    born: 1840,
    died: 1916,
    pdYear: 1916,
    styleId: "symbolism",
    nationality: "French",
    keywords: ["odilon"],
    works: [{ ja: "\u30AD\u30E5\u30AF\u30ED\u30D7\u30B9", en: "The Cyclops" }, { ja: "\u773C=\u6C17\u7403", en: "The Eye Like a Strange Balloon" }],
    styleJa: "\u5922\u306E\u3088\u3046\u306B\u6D6E\u304B\u3076\u5F62\u3002\u30D1\u30B9\u30C6\u30EB\u306E\u6DE1\u3044\u767A\u5149\u3068\u9ED2\u306E\u795E\u79D8",
    promptHint: "dreamlike floating forms, luminous pastel bloom, mysterious dark noirs"
  },
  {
    id: "bocklin",
    nameJa: "\u30D9\u30C3\u30AF\u30EA\u30F3",
    nameEn: "Arnold Bocklin",
    born: 1827,
    died: 1901,
    pdYear: 1901,
    styleId: "symbolism",
    nationality: "Swiss",
    keywords: ["arnold", "boecklin"],
    works: [{ ja: "\u6B7B\u306E\u5CF6", en: "Isle of the Dead" }, { ja: "\u30B1\u30F3\u30BF\u30A6\u30ED\u30B9\u306E\u95D8\u3044", en: "Battle of the Centaurs" }],
    styleJa: "\u6C88\u3093\u3060\u795E\u8A71\u7684\u306A\u9759\u3051\u3055\u3002\u7CF8\u6749\u306E\u6697\u7DD1\u3068\u4E0D\u5409\u306A\u5149",
    promptHint: "sombre mythic stillness, dark cypress green, ominous theatrical light"
  },
  {
    id: "mucha",
    nameJa: "\u30DF\u30E5\u30B7\u30E3",
    nameEn: "Alphonse Mucha",
    born: 1860,
    died: 1939,
    pdYear: 1939,
    styleId: "symbolism",
    nationality: "Czech",
    keywords: ["alphonse", "alfons"],
    works: [{ ja: "\u30B8\u30B9\u30E2\u30F3\u30C0", en: "Gismonda" }, { ja: "\u56DB\u5B63", en: "The Seasons" }],
    styleJa: "\u30A2\u30FC\u30EB\u30FB\u30CC\u30FC\u30F4\u30A9\u30FC\u306E\u66F2\u7DDA\u3002\u88C5\u98FE\u7684\u306A\u67A0\u3068\u6DE1\u3044\u8272\u306B\u8F2A\u90ED\u7DDA",
    promptHint: "art nouveau whiplash line, decorative halo and border, pale pastel with ink outline"
  },
  {
    id: "beardsley",
    nameJa: "\u30D3\u30A2\u30BA\u30EA\u30FC",
    nameEn: "Aubrey Beardsley",
    born: 1872,
    died: 1898,
    pdYear: 1898,
    styleId: "symbolism",
    nationality: "British",
    keywords: ["aubrey"],
    works: [{ ja: "\u5B54\u96C0\u306E\u88FE", en: "The Peacock Skirt" }, { ja: "\u30B5\u30ED\u30E1", en: "Salome" }],
    styleJa: "\u767D\u9ED2\u3060\u3051\u3002\u512A\u7F8E\u306A\u66F2\u7DDA\u3068\u5927\u304D\u306A\u5E73\u9762\u306E\u5F71\u3002\u9000\u5EC3\u7684\u306A\u88C5\u98FE",
    promptHint: "stark black and white, elegant sinuous line, large flat silhouettes, decadent ornament"
  },
  {
    id: "whistler",
    nameJa: "\u30DB\u30A4\u30C3\u30B9\u30E9\u30FC",
    nameEn: "James McNeill Whistler",
    born: 1834,
    died: 1903,
    pdYear: 1903,
    styleId: "symbolism",
    nationality: "American",
    keywords: ["james", "mcneill"],
    works: [{ ja: "\u9ED2\u3068\u91D1\u306E\u30CE\u30AF\u30BF\u30FC\u30F3", en: "Nocturne in Black and Gold" }, { ja: "\u7070\u8272\u3068\u9ED2\u306E\u30A2\u30EC\u30F3\u30B8\u30E1\u30F3\u30C8", en: "Arrangement in Grey and Black No.1" }],
    styleJa: "\u591C\u60F3\u66F2\u306E\u3088\u3046\u306A\u968E\u8ABF\u3002\u8FD1\u3044\u660E\u5EA6\u3067\u307E\u3068\u3081\u305F\u971E\u3093\u3060\u7A7A\u6C17",
    promptHint: "tonal nocturne, narrow close-valued harmony, veiled atmospheric haze"
  },
  // ── 表現主義／青騎士 ───────────────────────────────────────────────────
  {
    id: "kandinsky",
    nameJa: "\u30AB\u30F3\u30C7\u30A3\u30F3\u30B9\u30AD\u30FC",
    nameEn: "Wassily Kandinsky",
    born: 1866,
    died: 1944,
    pdYear: 1944,
    styleId: "expressionism",
    nationality: "Russian",
    keywords: ["wassily", "vasily"],
    works: [{ ja: "\u30B3\u30F3\u30DD\u30B8\u30B7\u30E7\u30F3VIII", en: "Composition VIII" }, { ja: "\u9EC4\u30FB\u8D64\u30FB\u9752", en: "Yellow-Red-Blue" }],
    styleJa: "\u97F3\u697D\u306E\u3088\u3046\u306B\u6F02\u3046\u62BD\u8C61\u3002\u8272\u9762\u306E\u4E0A\u3092\u92ED\u3044\u7DDA\u304C\u8D70\u308B",
    promptHint: "musical floating abstraction, keen linear accents over colour fields, dynamic non-objective rhythm"
  },
  {
    id: "marc",
    nameJa: "\u30D5\u30E9\u30F3\u30C4\u30FB\u30DE\u30EB\u30AF",
    nameEn: "Franz Marc",
    born: 1880,
    died: 1916,
    pdYear: 1916,
    styleId: "expressionism",
    nationality: "German",
    keywords: ["franz"],
    works: [{ ja: "\u9752\u3044\u99ACI", en: "Blue Horse I" }, { ja: "\u52D5\u7269\u306E\u904B\u547D", en: "Fate of the Animals" }],
    styleJa: "\u8C61\u5FB4\u3068\u3057\u3066\u306E\u539F\u8272\u3002\u7D50\u6676\u306E\u3088\u3046\u306A\u9762\u3067\u52D5\u7269\u3068\u98A8\u666F\u304C\u6EB6\u3051\u5408\u3046",
    promptHint: "symbolic primary colour, crystalline interlocking planes, animal forms fused with landscape"
  },
  {
    id: "macke",
    nameJa: "\u30A2\u30A6\u30B0\u30B9\u30C8\u30FB\u30DE\u30C3\u30B1",
    nameEn: "August Macke",
    born: 1887,
    died: 1914,
    pdYear: 1914,
    styleId: "expressionism",
    nationality: "German",
    keywords: ["august"],
    works: [{ ja: "\u7DD1\u306E\u4E0A\u7740\u306E\u5973", en: "Lady in a Green Jacket" }, { ja: "\u30C1\u30E5\u30CB\u30B9\u306E\u5E02\u5834", en: "Market in Tunis" }],
    styleJa: "\u900F\u660E\u306A\u8272\u9762\u304C\u660E\u308B\u304F\u91CD\u306A\u308B\u3002\u7A4F\u3084\u304B\u306A\u5E7E\u4F55\u3068\u967D\u5149",
    promptHint: "luminous transparent colour planes, gentle geometry, sunlit clarity"
  },
  {
    id: "klee",
    nameJa: "\u30D1\u30A6\u30EB\u30FB\u30AF\u30EC\u30FC",
    nameEn: "Paul Klee",
    born: 1879,
    died: 1940,
    pdYear: 1940,
    styleId: "expressionism",
    nationality: "Swiss-German",
    keywords: ["paul"],
    works: [{ ja: "\u30BB\u30CD\u30B7\u30AA", en: "Senecio" }, { ja: "\u3055\u3048\u305A\u308A\u6A5F\u68B0", en: "Twittering Machine" }],
    styleJa: "\u5B50\u3069\u3082\u306E\u3088\u3046\u306A\u8A18\u53F7\u3002\u6C34\u5F69\u306E\u683C\u5B50\u3068\u8FF7\u3046\u3088\u3046\u306A\u7D30\u3044\u7DDA",
    promptHint: "child-like sign language, tessellated watercolour squares, delicate wandering line, poetic scale"
  },
  {
    id: "modigliani",
    nameJa: "\u30E2\u30C7\u30A3\u30EA\u30A2\u30FC\u30CB",
    nameEn: "Amedeo Modigliani",
    born: 1884,
    died: 1920,
    pdYear: 1920,
    styleId: "expressionism",
    nationality: "Italian",
    keywords: ["amedeo"],
    works: [{ ja: "\u6A2A\u305F\u308F\u308B\u88F8\u5A66", en: "Reclining Nude" }, { ja: "\u30B8\u30E3\u30F3\u30CC\u30FB\u30A8\u30D3\u30E5\u30C6\u30EB\u30CC\u306E\u8096\u50CF", en: "Portrait of Jeanne Hebuterne" }],
    styleJa: "\u5F15\u304D\u4F38\u3070\u3055\u308C\u305F\u5358\u7D14\u306A\u5F62\u3002\u4EEE\u9762\u306E\u3088\u3046\u306A\u9759\u3051\u3055\u3068\u9EC4\u571F\u306E\u5730",
    promptHint: "elongated simplified form, mask-like serenity, warm ochre ground, sinuous contour"
  },
  // ── キュビスム／未来派／構成主義 ─────────────────────────────────────────
  {
    id: "gris",
    nameJa: "\u30D5\u30A2\u30F3\u30FB\u30B0\u30EA\u30B9",
    nameEn: "Juan Gris",
    born: 1887,
    died: 1927,
    pdYear: 1927,
    styleId: "cubism",
    nationality: "Spanish",
    keywords: ["juan"],
    works: [{ ja: "\u30D4\u30AB\u30BD\u306E\u8096\u50CF", en: "Portrait of Pablo Picasso" }, { ja: "\u30AE\u30BF\u30FC\u3068\u697D\u8B5C", en: "Guitar and Music Paper" }],
    styleJa: "\u660E\u6670\u306A\u5E7E\u4F55\u306E\u683C\u5B50\u3002\u7D44\u307F\u5408\u3046\u9762\u3068\u6291\u3048\u305F\u9EC4\u571F\u30FB\u9752\u30FB\u7070",
    promptHint: "lucid architectonic cubist grid, crisp interlocking planes, controlled ochre blue and grey"
  },
  {
    id: "boccioni",
    nameJa: "\u30DC\u30C3\u30C1\u30E7\u30FC\u30CB",
    nameEn: "Umberto Boccioni",
    born: 1882,
    died: 1916,
    pdYear: 1916,
    styleId: "cubism",
    nationality: "Italian",
    keywords: ["umberto", "futurism"],
    works: [{ ja: "\u7A7A\u9593\u306B\u304A\u3051\u308B\u9023\u7D9A\u6027\u306E\u552F\u4E00\u306E\u5F62\u614B", en: "Unique Forms of Continuity in Space" }, { ja: "\u8857\u306F\u8D77\u3061\u4E0A\u304C\u308B", en: "The City Rises" }],
    styleJa: "\u904B\u52D5\u306E\u529B\u7DDA\u3002\u5206\u5272\u3055\u308C\u305F\u9023\u7D9A\u50CF\u304C\u653E\u5C04\u3059\u308B",
    promptHint: "force-lines of motion, fragmented dynamic sequence, radiating energy"
  },
  {
    id: "malevich",
    nameJa: "\u30DE\u30EC\u30FC\u30F4\u30A3\u30C1",
    nameEn: "Kazimir Malevich",
    born: 1879,
    died: 1935,
    pdYear: 1935,
    styleId: "cubism",
    nationality: "Russian",
    keywords: ["kazimir", "suprematism"],
    works: [{ ja: "\u9ED2\u306E\u6B63\u65B9\u5F62", en: "Black Square" }, { ja: "\u767D\u306E\u4E0A\u306E\u767D", en: "Suprematist Composition: White on White" }],
    styleJa: "\u767D\u3044\u865A\u7A7A\u306B\u6D6E\u304F\u7D14\u7C8B\u306A\u5E7E\u4F55\u3002\u5E73\u3089\u306A\u8272\u3068\u7121\u91CD\u529B\u306E\u659C\u3081",
    promptHint: "suprematist floating geometric elements on white void, pure flat colour, weightless diagonal"
  },
  // ── 抽象／デ・ステイル ─────────────────────────────────────────────────
  {
    id: "mondrian",
    nameJa: "\u30E2\u30F3\u30C9\u30EA\u30A2\u30F3",
    nameEn: "Piet Mondrian",
    born: 1872,
    died: 1944,
    pdYear: 1944,
    styleId: "abstract",
    nationality: "Dutch",
    keywords: ["piet", "de stijl"],
    works: [{ ja: "\u8D64\u30FB\u9752\u30FB\u9EC4\u306E\u30B3\u30F3\u30DD\u30B8\u30B7\u30E7\u30F3", en: "Composition with Red Blue and Yellow" }, { ja: "\u30D6\u30ED\u30FC\u30C9\u30A6\u30A7\u30A4\u30FB\u30D6\u30AE\u30A6\u30AE", en: "Broadway Boogie Woogie" }],
    styleJa: "\u9ED2\u3044\u76F4\u4EA4\u683C\u5B50\u3068\u539F\u8272\u306E\u77E9\u5F62\u3002\u5B8C\u5168\u306B\u5E73\u9762\u7684",
    promptHint: "orthogonal black grid, asymmetric rectangles of primary red blue yellow on white, absolute flatness"
  },
  {
    id: "afKlint",
    nameJa: "\u30D2\u30EB\u30DE\u30FB\u30A2\u30D5\u30FB\u30AF\u30EA\u30F3\u30C8",
    nameEn: "Hilma af Klint",
    born: 1862,
    died: 1944,
    pdYear: 1944,
    styleId: "abstract",
    nationality: "Swedish",
    keywords: ["hilma", "klint"],
    works: [{ ja: "10\u306E\u6700\u5927\u7269", en: "The Ten Largest" }, { ja: "\u796D\u58C7\u753B", en: "Altarpiece" }],
    styleJa: "\u56F3\u5F0F\u7684\u306A\u7CBE\u795E\u6027\u306E\u62BD\u8C61\u3002\u767D\u4E9C\u8CEA\u306E\u6DE1\u3044\u8272\u3068\u540C\u5FC3\u306E\u5E7E\u4F55",
    promptHint: "diagrammatic spiritual abstraction, pale chalky pastel, concentric symbolic geometry"
  },
  // ── 素朴派／アメリカ絵画 ────────────────────────────────────────────────
  {
    id: "rousseau",
    nameJa: "\u30A2\u30F3\u30EA\u30FB\u30EB\u30BD\u30FC",
    nameEn: "Henri Rousseau",
    born: 1844,
    died: 1910,
    pdYear: 1910,
    styleId: "naive",
    nationality: "French",
    keywords: ["henri", "douanier"],
    works: [{ ja: "\u5922", en: "The Dream" }, { ja: "\u7720\u308B\u30B8\u30D7\u30B7\u30FC\u5973", en: "The Sleeping Gypsy" }],
    styleJa: "\u6B63\u9762\u304B\u3089\u306E\u7D20\u6734\u306A\u660E\u5FEB\u3055\u3002\u91CD\u306A\u308B\u5E73\u3089\u306A\u8449\u3068\u5922\u306E\u3088\u3046\u306A\u9759\u6B62",
    promptHint: "naive frontal clarity, layered flat foliage, dreamlike stillness, deep saturated greens"
  },
  {
    id: "homer",
    nameJa: "\u30A6\u30A3\u30F3\u30B9\u30ED\u30FC\u30FB\u30DB\u30FC\u30DE\u30FC",
    nameEn: "Winslow Homer",
    born: 1836,
    died: 1910,
    pdYear: 1910,
    styleId: "naive",
    nationality: "American",
    keywords: ["winslow"],
    works: [{ ja: "\u30E1\u30AD\u30B7\u30B3\u6E7E\u6D41", en: "The Gulf Stream" }, { ja: "\u5317\u6771\u98A8", en: "Northeaster" }],
    styleJa: "\u529B\u5F37\u3044\u6C34\u5F69\u306E\u900F\u660E\u611F\u3002\u76F4\u63A5\u306E\u89B3\u5BDF\u3068\u660E\u5FEB\u306A\u660E\u6697",
    promptHint: "robust watercolour transparency, direct observation, strong value structure"
  },
  {
    id: "sargent",
    nameJa: "\u30B5\u30FC\u30B8\u30A7\u30F3\u30C8",
    nameEn: "John Singer Sargent",
    born: 1856,
    died: 1925,
    pdYear: 1925,
    styleId: "naive",
    nationality: "American",
    keywords: ["singer", "john"],
    works: [{ ja: "\u30DE\u30C0\u30E0X", en: "Madame X" }, { ja: "\u30AB\u30FC\u30CD\u30FC\u30B7\u30E7\u30F3\u3001\u30EA\u30EA\u30FC\u3001\u30EA\u30EA\u30FC\u3001\u30ED\u30FC\u30BA", en: "Carnation, Lily, Lily, Rose" }],
    styleJa: "\u4E00\u7B46\u3067\u5F62\u3092\u6C7A\u3081\u308B\u9BAE\u3084\u304B\u306A\u7B46\u3055\u3070\u304D\u3002\u8F1D\u304F\u7070\u8272\u306E\u8ABF\u548C",
    promptHint: "bravura wet-in-wet brushwork, confident single-stroke form, luminous grey harmonies"
  },
  {
    id: "grantWood",
    nameJa: "\u30B0\u30E9\u30F3\u30C8\u30FB\u30A6\u30C3\u30C9",
    nameEn: "Grant Wood",
    born: 1891,
    died: 1942,
    pdYear: 1942,
    styleId: "naive",
    nationality: "American",
    keywords: ["grant", "regionalism"],
    works: [{ ja: "\u30A2\u30E1\u30EA\u30AB\u30F3\u30FB\u30B4\u30B7\u30C3\u30AF", en: "American Gothic" }, { ja: "\u30DD\u30FC\u30EB\u30FB\u30EA\u30D3\u30A2\u306E\u75BE\u8D70", en: "The Midnight Ride of Paul Revere" }],
    styleJa: "\u6ED1\u3089\u304B\u306A\u743A\u746F\u306E\u3088\u3046\u306A\u8868\u9762\u3002\u4E38\u307F\u306E\u3042\u308B\u5F62\u3068\u514B\u660E\u306A\u63CF\u5199",
    promptHint: "smooth enamel surface, rounded stylised volumes, meticulous clarity, midwestern light"
  },
  // ── 浮世絵／日本画 ─────────────────────────────────────────────────────
  {
    id: "hokusai",
    nameJa: "\u845B\u98FE\u5317\u658E",
    nameEn: "Katsushika Hokusai",
    born: 1760,
    died: 1849,
    pdYear: 1849,
    styleId: "ukiyoe",
    nationality: "Japanese",
    keywords: ["hokusai", "katsushika", "\u307B\u304F\u3055\u3044", "\u304B\u3064\u3057\u304B"],
    works: [{ ja: "\u795E\u5948\u5DDD\u6C96\u6D6A\u88CF", en: "Under the Wave off Kanagawa" }, { ja: "\u51F1\u98A8\u5FEB\u6674", en: "Fine Wind, Clear Morning" }],
    styleJa: "\u85CD\u306E\u307C\u304B\u3057\u3068\u529B\u5F37\u3044\u66F2\u7DDA\u3002\u6728\u7248\u306E\u8F2A\u90ED\u7DDA\u304C\u306F\u3063\u304D\u308A\u51FA\u308B",
    promptHint: "bold prussian blue gradation, dynamic curving line, woodblock key-block outline, wave-like energy"
  },
  {
    id: "hiroshige",
    nameJa: "\u6B4C\u5DDD\u5E83\u91CD",
    nameEn: "Utagawa Hiroshige",
    born: 1797,
    died: 1858,
    pdYear: 1858,
    styleId: "ukiyoe",
    nationality: "Japanese",
    keywords: ["hiroshige", "utagawa", "\u3072\u308D\u3057\u3052"],
    works: [{ ja: "\u5927\u306F\u3057\u3042\u305F\u3051\u306E\u5915\u7ACB", en: "Sudden Shower over Shin-Ohashi Bridge and Atake" }, { ja: "\u6771\u6D77\u9053\u4E94\u5341\u4E09\u6B21", en: "Fifty-three Stations of the Tokaido" }],
    styleJa: "\u8A69\u60C5\u306E\u3042\u308B\u98A8\u666F\u3068\u307C\u304B\u3057\u3002\u624B\u524D\u3092\u5927\u304D\u304F\u5207\u308A\u53D6\u308B\u69CB\u56F3",
    promptHint: "poetic atmospheric landscape, bokashi colour gradation, dramatic foreground framing, weather and season"
  },
  {
    id: "utamaro",
    nameJa: "\u559C\u591A\u5DDD\u6B4C\u9EBF",
    nameEn: "Kitagawa Utamaro",
    born: 1753,
    died: 1806,
    pdYear: 1806,
    styleId: "ukiyoe",
    nationality: "Japanese",
    keywords: ["utamaro", "kitagawa", "\u3046\u305F\u307E\u308D"],
    works: [{ ja: "\u30DD\u30C3\u30D4\u30F3\u3092\u5439\u304F\u5A18", en: "Young Woman Blowing a Poppin" }, { ja: "\u5BDB\u653F\u4E09\u7F8E\u4EBA", en: "Three Beauties of the Present Day" }],
    styleJa: "\u7D30\u304F\u3057\u306A\u3084\u304B\u306A\u4EBA\u7269\u3068\u9AEA\u306E\u7D30\u5BC6\u3002\u96F2\u6BCD\u647A\u308A\u306E\u6291\u3048\u305F\u8272",
    promptHint: "elegant elongated figures, fine hairline detail, mica ground, refined restrained palette"
  },
  {
    id: "sharaku",
    nameJa: "\u6771\u6D32\u658E\u5199\u697D",
    nameEn: "Toshusai Sharaku",
    born: null,
    died: null,
    pdYear: 1795,
    styleId: "ukiyoe",
    nationality: "Japanese",
    keywords: ["sharaku", "toshusai", "\u3057\u3083\u3089\u304F"],
    works: [{ ja: "\u4E09\u4EE3\u76EE\u5927\u8C37\u9B3C\u6B21\u306E\u6C5F\u6238\u5175\u885B", en: "Otani Oniji III as Yakko Edobei" }, { ja: "\u5E02\u5DDD\u8766\u8535\u306E\u7AF9\u6751\u5B9A\u4E4B\u9032", en: "Ichikawa Ebizo as Takemura Sadanoshin" }],
    styleJa: "\u8A87\u5F35\u3055\u308C\u305F\u8868\u60C5\u3002\u96F2\u6BCD\u306E\u6697\u3044\u5730\u306B\u6B63\u9762\u304B\u3089\u8FEB\u308B",
    promptHint: "exaggerated expressive caricature, dark mica ground, arresting frontal presence",
    note: "\u6CA1\u5E74\u4E0D\u8A73\u3002\u6D3B\u52D5\u306F1794\u201395\u5E74"
  },
  {
    id: "korin",
    nameJa: "\u5C3E\u5F62\u5149\u7433",
    nameEn: "Ogata Korin",
    born: 1658,
    died: 1716,
    pdYear: 1716,
    styleId: "ukiyoe",
    nationality: "Japanese",
    keywords: ["korin", "ogata", "rinpa", "\u7433\u6D3E", "\u3053\u3046\u308A\u3093"],
    works: [{ ja: "\u71D5\u5B50\u82B1\u56F3\u5C4F\u98A8", en: "Irises" }, { ja: "\u7D05\u767D\u6885\u56F3\u5C4F\u98A8", en: "Red and White Plum Blossoms" }],
    styleJa: "\u7433\u6D3E\u306E\u5927\u80C6\u306A\u88C5\u98FE\u3002\u91D1\u5730\u306B\u69D8\u5F0F\u5316\u3057\u305F\u81EA\u7136\u3068\u5E73\u3089\u306A\u30EA\u30BA\u30E0",
    promptHint: "rinpa decorative boldness, gold leaf ground, stylised natural motif, flat rhythmic arrangement"
  },
  {
    id: "sotatsu",
    nameJa: "\u4FF5\u5C4B\u5B97\u9054",
    nameEn: "Tawaraya Sotatsu",
    born: null,
    died: null,
    pdYear: 1640,
    styleId: "ukiyoe",
    nationality: "Japanese",
    keywords: ["sotatsu", "tawaraya", "rinpa", "\u305D\u3046\u305F\u3064"],
    works: [{ ja: "\u98A8\u795E\u96F7\u795E\u56F3\u5C4F\u98A8", en: "Wind God and Thunder God" }, { ja: "\u821E\u697D\u56F3\u5C4F\u98A8", en: "Bugaku Dancers" }],
    styleJa: "\u305F\u3089\u3057\u8FBC\u307F\u306E\u6EF2\u307F\u3002\u91D1\u5730\u306B\u5927\u304D\u304F\u7C21\u6F54\u306A\u8F2A\u90ED",
    promptHint: "tarashikomi pooled ink washes, gold ground, sweeping simplified silhouette",
    note: "\u6CA1\u5E74\u4E0D\u8A73\u30021640\u5E74\u9803\u307E\u3067\u306E\u6D3B\u52D5"
  },
  {
    id: "sesshu",
    nameJa: "\u96EA\u821F",
    nameEn: "Sesshu Toyo",
    born: 1420,
    died: 1506,
    pdYear: 1506,
    styleId: "ukiyoe",
    nationality: "Japanese",
    keywords: ["sesshu", "\u305B\u3063\u3057\u3085\u3046", "suibokuga"],
    works: [{ ja: "\u79CB\u51AC\u5C71\u6C34\u56F3", en: "Landscapes of Autumn and Winter" }, { ja: "\u6167\u53EF\u65AD\u81C2\u56F3", en: "Huike Offering His Arm to Bodhidharma" }],
    styleJa: "\u6C34\u58A8\u3060\u3051\u3002\u65A7\u3067\u65AD\u3064\u3088\u3046\u306A\u7B46\u3068\u5E83\u3044\u4F59\u767D\u3001\u53B3\u3057\u3044\u9759\u3051\u3055",
    promptHint: "monochrome ink wash, axe-cut brushstrokes, vast empty space, austere spiritual restraint"
  },
  {
    id: "tohaku",
    nameJa: "\u9577\u8C37\u5DDD\u7B49\u4F2F",
    nameEn: "Hasegawa Tohaku",
    born: 1539,
    died: 1610,
    pdYear: 1610,
    styleId: "ukiyoe",
    nationality: "Japanese",
    keywords: ["tohaku", "hasegawa", "\u3068\u3046\u306F\u304F"],
    works: [{ ja: "\u677E\u6797\u56F3\u5C4F\u98A8", en: "Pine Trees" }, { ja: "\u6953\u56F3", en: "Maple Tree" }],
    styleJa: "\u9727\u306B\u6C88\u3080\u58A8\u3002\u5F62\u304C\u73FE\u308C\u3066\u306F\u6D88\u3048\u308B\u6DF1\u3044\u9759\u5BC2\u3068\u4F59\u767D",
    promptHint: "soft ink mist, forms emerging and vanishing in fog, profound quiet emptiness"
  },
  {
    id: "jakuchu",
    nameJa: "\u4F0A\u85E4\u82E5\u51B2",
    nameEn: "Ito Jakuchu",
    born: 1716,
    died: 1800,
    pdYear: 1800,
    styleId: "ukiyoe",
    nationality: "Japanese",
    keywords: ["jakuchu", "ito", "\u3058\u3083\u304F\u3061\u3085\u3046"],
    works: [{ ja: "\u7FA4\u9D8F\u56F3", en: "Rooster and Hens" }, { ja: "\u52D5\u690D\u7DB5\u7D75", en: "Colorful Realm of Living Beings" }],
    styleJa: "\u606F\u8A70\u307E\u308B\u307B\u3069\u5BC6\u306A\u88C5\u98FE\u3002\u9BAE\u3084\u304B\u306A\u5CA9\u7D75\u5177\u3068\u5947\u77EF\u306A\u6587\u69D8",
    promptHint: "hypnotically dense ornamental detail, vivid mineral pigment, eccentric decorative pattern"
  },
  {
    id: "kurodaSeiki",
    nameJa: "\u9ED2\u7530\u6E05\u8F1D",
    nameEn: "Kuroda Seiki",
    born: 1866,
    died: 1924,
    pdYear: 1924,
    styleId: "ukiyoe",
    nationality: "Japanese",
    keywords: ["kuroda", "seiki", "\u304F\u308D\u3060"],
    works: [{ ja: "\u6E56\u7554", en: "By the Lake" }, { ja: "\u821E\u5993", en: "Maiko Girl" }],
    styleJa: "\u65E5\u672C\u306E\u5916\u5149\u6D3E\u3002\u7D2B\u3092\u5E2F\u3073\u305F\u67D4\u3089\u304B\u306A\u65E5\u5DEE\u3057\u3068\u7A4F\u3084\u304B\u306A\u9670\u5F71",
    promptHint: "japanese plein-air impressionism, soft violet-tinged daylight, gentle academic modelling"
  },
  {
    id: "aokiShigeru",
    nameJa: "\u9752\u6728\u7E41",
    nameEn: "Aoki Shigeru",
    born: 1882,
    died: 1911,
    pdYear: 1911,
    styleId: "ukiyoe",
    nationality: "Japanese",
    keywords: ["aoki", "shigeru", "\u3042\u304A\u304D"],
    works: [{ ja: "\u6D77\u306E\u5E78", en: "A Gift of the Sea" }, { ja: "\u308F\u3060\u3064\u307F\u306E\u3044\u308D\u3053\u306E\u5BAE", en: "Paradise under the Sea" }],
    styleJa: "\u795E\u8A71\u7684\u3067\u6D6A\u6F2B\u7684\u306A\u6C17\u914D\u3002\u6DF1\u304F\u97FF\u304F\u8272\u8ABF",
    promptHint: "romantic mythic mood, deep resonant colour, lyrical romanticism"
  },
  {
    id: "hishidaShunso",
    nameJa: "\u83F1\u7530\u6625\u8349",
    nameEn: "Hishida Shunso",
    born: 1874,
    died: 1911,
    pdYear: 1911,
    styleId: "ukiyoe",
    nationality: "Japanese",
    keywords: ["hishida", "shunso", "\u3072\u3057\u3060", "moro-tai"],
    works: [{ ja: "\u843D\u8449", en: "Fallen Leaves" }, { ja: "\u9ED2\u304D\u732B", en: "Black Cat" }],
    styleJa: "\u8F2A\u90ED\u3092\u7528\u3044\u306A\u3044\u6726\u6727\u4F53\u3002\u67D4\u3089\u304B\u306A\u8272\u306E\u5C64\u3068\u7E4A\u7D30\u306A\u5CA9\u7D75\u5177",
    promptHint: "outline-less moro-tai technique, soft atmospheric colour veils, delicate nihonga pigment"
  }
];
var PAINTER_BY_ID = new Map(PAINTERS.map((p) => [p.id, p]));
function searchPainters(query, styleId) {
  const pool = styleId ? PAINTERS.filter((p) => p.styleId === styleId) : PAINTERS;
  const q = query.trim().toLowerCase();
  if (!q) return pool;
  return pool.filter(
    (p) => p.nameJa.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q) || p.nationality.toLowerCase().includes(q) || p.styleId.toLowerCase().includes(q) || p.keywords.some((k) => k.toLowerCase().includes(q)) || // 作品名からも辿れるようにする（「神奈川沖浪裏」で北斎に行き着ける）。
    p.works.some((w) => w.ja.toLowerCase().includes(q) || w.en.toLowerCase().includes(q))
  );
}

// src/core/thumbs.ts
var PAINTER_THUMBS = {
  "afKlint": {
    src: "data:image/jpeg;base64,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",
    workJa: "10\u306E\u6700\u5927\u7269",
    workEn: "The Ten Largest"
  },
  "aivazovsky": {
    src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wAARCAA/AGADASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAABAYCAwUAAQf/xAAwEAACAQMDAQYEBgMAAAAAAAABAgMABBEFEiExBhMiQVFhFDJxoRUWI2KBkULB8P/EABoBAAMBAQEBAAAAAAAAAAAAAAMEBQABBgL/xAAkEQACAgIBBAIDAQAAAAAAAAABAgADBBEhBRIxQRNRFSIygf/aAAwDAQACEQMRAD8AUO69RzURH4iMcVt/h5DFWGMVQ9iwY+gFSfmXetykMZwN6gXcqB0rvhxj5aPSEHjzqw2x6YOa62Qohq8RjM+KAZ5FXmFceEZotLM7qKFmBSVmWPUqV4OhzM1bbPUVNrTwg7ea37bSXmg71drY6r51KbTZFjL7CEB9OlTmy/28xn4a1GorvbbecVywEdRWy8OGwRg+lRFqSvTr500mT9xSzGHqZJhwflzmrkh56Uc1qdmQOavitiE6c02MgESbZQROkI5NdG67snBqv4qOZiCQM0NdZi5BJU+YpDydGX0Qhd+ob3KmTfgDNERhRwwBB4rGjv8AbgGi4rkS5KSBiOo8xQ3rf3G6uzxNg2cciAwY3DqPWujtS55yKBtrxlnAVvPnNM2k3qpOFuI1COepHBpC0ug2IS1Cq7XmRs7fuVUorb/M+orde3he0QmRPFxzxg+4rRtbG3Z/0flHIBo+40uN7fJUf1UJ8gs3iQLrgTzEG/06HfngMDjK8g0EbHcp5FMOr2MNsrHlTjIwaw1lDRN3Uo3qeR0qlTYzKCIzWGccSo2PI48IqaWmPlHlXgu3B5OaujvotuftToZxCtjtrc+UHV8EHk0Qmshl2lxz60uSs0QDMCF6ZxUfjlBClQSPUc17BqUbyJ5mvOtr8GNrSoYxIZFC4zweapjmwxZGO393FLj6lIgG6NlBHHhwDXttrUkUwIUge9Basj+RNdnPZoDiPVnJmASAMWzk5/7mtJdScRKC5C9QDSJ+YrVjlsH2fI/rFUt2jhhT9F5lyfly2PvSdmIbDuV6etCtApXf+z65pXa1rZwHmXYKa4e2tjNCMuw4+Yjg/WvgVp2ljLAsM58+M1vLeyX+lI8FysnJzGI8FfqRUu7pKM2zxPps7FyB3MNGOvaTtVDNdAQeNQOeaW/xSNm3buTzzSs80rSMiOkjD/FTmhjeSjqDjpxVWnplSIFUwH5U08IOI7zavGF48LY8jQrapujI6f7pOOourdTj3qS6wBkYFFXAUTN1snwJ4upRGJlyNp8iMg0Fdm0unVmTY6gjcnBPpn1pakv3BwmapF9MCPEaeFGj3AyCG41GgRRGMBrnhegIoi2sLScEfFLEwXIyMgn39KV7eeSa5RGJAPoauuriWGICImPnPDknP2ohDHicBE250eBH7sxM6rnAYZ+tC9/BeTd1LKgZf3gg++ax2u3lZZCqiUDazBQCT6+9CrE0j56nNd+P7m2I2WmkrcyMLdmlIGfAM4prn7LatDoCFdWDQ8/oBiAD6Y6E0h6Tqz6ehRHZCecgZOftimLVO1Vze6Eiy3k1wyPgB1ChBjyI5J9zSN62lgF1qc7lEjHo0huTDe3SW4Xli2eP4HOaomuNN09isd0z4P0+1YL6oxtyFUbyOXJJP8CsueWSQZYkqOmTR0pYnbGbv+hGK516Fm8O0r9K8h1W2Z8lI+aVia9DHORTYUAagyNz/9k=",
    workJa: "\u7B2C\u4E5D\u306E\u6CE2",
    workEn: "The Ninth Wave"
  },
  "aokiShigeru": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u6D77\u306E\u5E78",
    workEn: "A Gift of the Sea"
  },
  "beardsley": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u5B54\u96C0\u306E\u88FE",
    workEn: "The Peacock Skirt"
  },
  "blake": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u65E5\u306E\u8001\u3044\u305F\u308B\u8005",
    workEn: "The Ancient of Days"
  },
  "boccioni": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u7A7A\u9593\u306B\u304A\u3051\u308B\u9023\u7D9A\u6027\u306E\u552F\u4E00\u306E\u5F62\u614B",
    workEn: "Unique Forms of Continuity in Space"
  },
  "bocklin": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u6B7B\u306E\u5CF6",
    workEn: "Isle of the Dead"
  },
  "bosch": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u5FEB\u697D\u306E\u5712",
    workEn: "The Garden of Earthly Delights"
  },
  "botticelli": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30F4\u30A3\u30FC\u30CA\u30B9\u306E\u8A95\u751F",
    workEn: "The Birth of Venus"
  },
  "bruegel": {
    src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wAARCABIAGADASIAAhEBAxEB/8QAHAAAAgMBAAMAAAAAAAAAAAAABQYAAwQHAQII/8QAMhAAAgECBAQEBAYDAQAAAAAAAQIDBBEABRIhBhMxQSJRYXEUgZGhBxUyUrHBFkLRI//EABkBAAMBAQEAAAAAAAAAAAAAAAIDBAUAAf/EACYRAAICAQQBBAIDAAAAAAAAAAECABEDBBIhMVETIjJBBTNxofD/2gAMAwEAAhEDEQA/AOqU9IyMQxPK66QNr+eCBgo6LLp52iaVQuoqd/kMFIYBLAq6NJ6k4y5xlb1mSVNPGW5jISljY6huPvhIXnmOJoGomrndPV8yKOhkgVRpQqRZvlbbHvSRMYhdUEZvqN/ED7YIZRwxJRZKr1z6q+Tx2db8q/8Ar1sT64y5pDJDGGidppZWsQW7fbbFZdMSFvEmCu5AMzzmNbgDVfY364FZxl+WmmWSozZoCzeIJH19Lnf6DGTiJq/8meWjlEc0N2Bja5Pp5DthNjzbNZ62WHMYBO9OLh41CqoJ2uel8Z+X8grYzQ5lmPSEOPE21k0GW5ukiVkk0LRhPFCbAarg9flfBivlyqlhE89TEqEApZgdXthKzyvqTCeVDa62JGlvthZddcEiwSvIUiLyKegt29Nv4wvT610Wu47Lo1dr6nZG4cM0IkjeBR+q5kAuMD6jIWichgCD3XcY1fh/nbcT8ONLJHHDPTOICVW9xpBDb9/+YZly8m4MrSWP7QMb+Ny43CY74wh2mJseUi2xsB6Wx4bJmuSoFvMYefy8m4V2Qe5N/titssX9xa/pilaMSQROh09UhHTbzxcZ0IuLY+WZOKeOIZBLJn8sbobKoa5+wt9cWVPGXGc6RK3EtU4tqKx2Qj6DfGCc6DuX7rn0zLOrA3t72wp8STRrWRQ69B5ZdCNrNuL79vTHFYePONooQWzyuj095FQ397r/ADhto86qanK4KrN3aarcENLJGF1kHw7Cw+mJ9XqFbFtX7j9OCXvxGGVMs+D5dSEnAQ69cuxsLHp5i+3bHNuLJMr4eSpynJ4giyvrkYXYIpa4AO+5P2GHiXOoIoQ3K1a1JDCFrXBO3p/eB8tVlzZwuZSxKrQFUSR0YqyMd7C9u57bYywamgDRnOaSeqzA1NOahIyCeWzrexFutx6H64H0LNFUvLVsjxuphnuF8AN1JFhvsbjDNW1NK/E9RaCh+HatiDSaRcq2rXvfr0wJzTJdNZWQwKDStICsYF/CD2N9+v23waEA/wAwnyFhDPDHGeVcF8a5hC8TnLHpo4oVgGq5U3v7kE747rl7wZtltLWwoyx1MayoGG9mFwDj5oqMupKtGqIA7M+xZCAoUenmfphv4T414jy+hOXfmIQUsaiGNo0ZVTsL+Xqca2l1YT2mZeZLFzu6ZcoTp9cefy9Wa2gY5av4jZ0SI6rOIqcjqyxBvtbFa/iDLUylRxLUMwPZeULj7Y0F1QfoyJlA+ojQ09NTzMyq0QBP6T1x7M6IA8UbM5P6tO/tv74sqaFKAPHLUiWZdBDx+NQe6lRv/WMVVmEU0sqJUeBELFSuhtf94wt1/Uu2Ady+lq5anMEjhErObgBWF+u+3T64b4c2eSnlYU8pjVg0bad2Kv2FrdP4OFDhkGOtlrJSobSFUE7aO5uR1wbfO3opqGKoLQOZ5GAuCLFdiO1t8JyncaqPxDaLhyXNKhKqRBHUctouYGEBa5BPh6jfrt3xkzedGrJZF1vGjFkB8Kt4R37b7b4A59m+eSyomXPJC0sUbsy6dKk6bi/fYHpjFU5uWzSoScaiW/SNxYoP+HAKhBuoxmmjJOFKGupamszOWRJS/OMfMGkOt9JuB64J5dn8VXRNEyBCHIYkG/uPp98CqsT02VJGkiwRaNJBtq0kdh57jCTHU1Ubyu/PNNGSQ5BANnBvb5W+uGfuFeIPx5jDWUs5zpoFrIVpgza4UJDC/Ym2BvEL07QpNDEUQNpA1EkAb2/nGh4K2XN5s1hEK006h3bVsAB1+VsXLl9LKXLVInWeUSKoOwFht6YYhVauAwJHEXYqp40OidwoFwAcFcqFTUzqGSWQHoQLkDHily6b8yqEhiUiE3F+gJ9LXttg7HmjZeZcunpoUmibU0ivfqBsfb+8W40DtzJH4FiB+HeMMuecQ5tTukj2RWRrKqnoxGDcuWZVmTO6NBPGgDL4jCwHQb388CZsopeMc6+FopkjU+IEqFMa6t+9yADc2xnpaDK6WtqaOqjqJJY6N31M2gK6gg2BNmPl2xI22rHBlKoSRHZ+HIJsgono5pKepp5BzUlmWTUu+xI69dv4wkcS01fX19OtODNVpK8PLQ7je4H0GKM7qXp8oy2SCnihBhiEjqNLPI2o6mPc2/rF3+TZk8kVTDRJUa20xu0il7rsbkbjY97dcEMbI24G56WBFAQzHkdfPUSoZqWNEjgQmap2W1g1/c398WZpRVcWazJVS00MaqrhUuZJALAgW37YC1nGMWUVUxny1krHYahKt9Q6g6jf6YEN+I1d8W8slHSTgm13TxafK4OAOPLk6E4Mo7jWcnzfPa5J6eKQIo5QaQBbC3n3+W+Buf0gyaugoZw0sw0ySyMNrHoB7eR88WZVx/C7adEsdVKLRxxyaIge1yTYYIZpmNHLUxUGaosck9mZGs7b9Bcf9wi3RqYf7zDUg9GXRLQT5QfCrnm9E6svQ9PIG/yxZRZMK3h6OJCaVg5s8m2rfy9v4xTRU1HlmVTfCa41Z9HhYkluuykdPM3xbU5tmldCY6isRY2BBEUaxk+hPl6Y9x4y/wAer+52TIMZ939TXU0tBkRWSpnBmc6mjBuxIt+3tbzwIp6Vais+JkUu0zl7A6jub4tosvvURyIwkQNdgT+oeWL6ijqFnllp3VCbcrxkcsjv741cS+mL7mfkf1DXUXHqK/4aozeKniFJq/8AOWFuW0b2Kqvh99z373xdBkUUmWVGY52kL1M0VoUpZbyagDe46dOvtiYmEKBKiTB1TlbZlyaiKSWuC2aSmWNtMVlsFv7D3wSy+hhqMyEBy6GjVOW7Ry2TWwG/h62Pl0xMTCWY3UKV8Ux0c88JnoAeTZGhg3RDuFF99z39MK1Vw/POzUuWgTcsGd4QAGS+1r/7dO3T3xMTDlJUWIB5MGUmXymrWKpEkAA3OncfLDJLSMFSsSvVp4irprN9+tvt0xMTHZSSQYIhyHiJczaSWqVo5U8WkNdbeQHbHvRVkWaUxeRGis5Ci97+uJiYAKFFARbcmzN0OmkcCOcop7WBxcMxh1X1ki+4xMTDF46izyeZ/9k=",
    workJa: "\u30D0\u30D9\u30EB\u306E\u5854",
    workEn: "The Tower of Babel"
  },
  "caravaggio": {
    src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//ggVQ0FSQVZBR0dJTw0KKGIuIDE1NzEsIENhcmF2YWdnaW8sIGQuIDE2MTAsIFBvcnRvIEVyY29sZSkNCg0KTmFyY2lzc3VzDQoxNTk4LTk5DQpPaWwgb24gY2FudmFzLCAxMTAgeCA5MiBjbQ0KR2FsbGVyaWEgTmF6aW9uYWxlIGQnQXJ0ZSBBbnRpY2EsIFJvbWUNCg0KVGhlIGF0dHJpYnV0aW9uIG9mIHRoaXMgcGFpbnRpbmcgdG8gQ2FyYXZhZ2dpbyBoYXMgYmVlbiBkaXNjdXNzZWQgYXQgbGVuZ3RoIGFuZCBpdCBpcyBzdGlsbCBxdWVzdGlvbmVkIGJ5IHNvbWUgc2Nob2xhcnMuIFRoZXJlIGFyZSBubyBjb250ZW1wb3Jhcnkgc291cmNlcyB0byByZWZlciB0bywgYW5kIHRoZSBhdHRyaWJ1dGlvbiByZXN0cyBlbnRpcmVseSBvbiBzdHlsaXN0aWMgYmFzZXMuDQoNClRoZSB0aGVvcnkgdGhhdCB0aGUgcGljdHVyZSBpcyBieSBDYXJhdmFnZ2lvIG1pZ2h0IGJlIGNvbmZpcm1lZCBieSBhbiBleHBvcnQgbGljZW5zZSBkYXRpbmcgdG8gMTY0NSwgcmVmZXJyaW5nIHRvIGEgTmFyY2lzc3VzIGJ5IENhcmF2YWdnaW8gb2Ygc2ltaWxhciBtZWFzdXJlbWVudHMgdG8gb3VyIGNhbnZhcy4gV2hpbGUgaXQgaXMgZGlmZmljdWx0IHRvIHByb3Bvc2Ugd2l0aCBhYnNvbHV0ZSBjZXJ0YWludHkgYSBzZWN1cmUgY29ubmVjdGlvbiBiZXR3ZWVuIHRoZSBkb2N1bWVudCBhbmQgdGhlIHByZXNlbnQgY2FudmFzLCBzZXZlcmFsIG1ham9yIENhcmF2YWdnaW8gc2Nob2xhcnMgaGF2ZSByZWNvbnNpZGVyZWQgdGhlIGlzc3VlLCBhY2NlcHRlZCB0aGUgbGluayBiZXR3ZWVuIHRoZSBsaWNlbnNlIGFuZCB0aGUgcGFpbnRpbmcsIGFuZCBjb25maXJtZWQgdGhlIGF1dG9ncmFwaCBxdWFsaXR5IG9mIHRoZSB3b3JrLg0KDQpBbmFseXNpcyBvZiB0aGUgZGV0YWlscyBvZiBleGVjdXRpb24gKGNhcnJpZWQgb3V0IGFzIHBhcnQgb2YgYSByZWNlbnQgcmVzdG9yYXRpb24pLCBzdHlsaXN0aWMgY29tcGFyaXNvbiB0byBvdGhlciB3b3JrcyBvZiBDYXJhdmFnZ2lvLCBhbmQgdGhlIGljb25vZ3JhcGhpYyBpbm5vdmF0aXZlbmVzcyBvZiB0aGUgc3ViamVjdCBhbGwgbGVhZCB0byBhY2NlcHRhbmNlIG9mIHRoZSBOYXJjaXNzdXMgYXMgYSB3b3JrIG9mIENhcmF2YWdnaW8uIE9uIHRoZSBzdWJqZWN0IG9mIGludmVudGlvbiwgaXQgc3VmZmljZXMgdG8gbWVudGlvbiB0aGUgZXhjZXB0aW9uYWwgdGhlIGRvdWJsZSBmaWd1cmUgd2hpY2ggLSBsaWtlIGEgcGxheWluZyBjYXJkIC0gdHVybnMgb24gdGhlIGZ1bGNydW0gb2YgdGhlIGhpZ2hsaXQga25lZSBhdCB0aGUgY2VudHJlIG9mIHRoZSBjb21wb3NpdGlvbi4NCg0KVGhlIHdvcmsgYmVsb25ncyB0byB0aGUgeWVhcnMgYmV0d2VlbiAxNTk3IGFuZCAxNTk5LCBhIHRyYW5zaXRpb25hbCBwZXJpb2Qgb2YgQ2FyYXZhZ2dpbydzIGNhcmVlciB0aGF0IGlzIHN0aWxsIG5vdCBlbnRpcmVseSBzb3J0ZWQgb3V0IG9yIGZ1bGx5IHVuZGVyc3Rvb2QuIEl0IGlzIGEgbW9tZW50IGluIHdoaWNoIENhcmF2YWdnaW8gdGVuZGVkIHRvd2FyZHMgYSBtYWdpY2FsIHNlbnNlIG9mIGF0bW9zcGhlcmUsIHN1c3BlbnNlLCBhbmQgaW50cm9zcGVjdGlvbjogc3RpbGwgc3Ryb25nbHkgaW5mbHVlbmNlZCBieSB0aGUgTG9tYmFyZCBzdHlsZSBvZiBNb3JldHRvIGFuZCBTYXZvbGRvLCBoZSBpcyBhbHNvIHRlc3RpbmcgdGhlIGluZmluaXRlIHBvc3NpYmlsaXRpZXMgb2YgbGlnaHQgYW5kIHNoYWRvdy4gRGF0aW5nIGZyb20gdGhlIHNhbWUgcGhhc2Ugb2YgQ2FyYXZhZ2dpbydzIGNhcmVlciBhcmUgdGhlIEx1dGUgUGxheWVyLCB0aGUgRG9y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",
    workJa: "\u30CA\u30EB\u30AD\u30C3\u30BD\u30B9",
    workEn: "Narcissus"
  },
  "cassatt": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u821F\u904A\u3073",
    workEn: "The Boating Party"
  },
  "cezanne": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30B5\u30F3\u30C8\u30FB\u30F4\u30A3\u30AF\u30C8\u30EF\u30FC\u30EB\u5C71",
    workEn: "Mont Sainte-Victoire"
  },
  "constable": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u5E72\u8349\u8ECA",
    workEn: "The Hay Wain"
  },
  "courbet": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30AA\u30EB\u30CA\u30F3\u306E\u57CB\u846C",
    workEn: "A Burial at Ornans"
  },
  "degas": {
    src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wAARCABGAGADASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAABAUAAwYCAQf/xAAyEAACAQMCBAQEBAcAAAAAAAABAgMABBESIQUxQVETImFxBhQygRUjYpFCUrHB0eHw/8QAGQEAAwEBAQAAAAAAAAAAAAAAAAECAwQF/8QAIBEAAwEAAgICAwAAAAAAAAAAAAECEQMxBBIFQRQhIv/aAAwDAQACEQMRAD8AQpeQqMCeMAfqq5eIw7AXEW366otuC2LyiJVLEbkk4zTlPhnhxix8qQxGzZOAa3ny+Ndo5K8K39lUPEI8b3MWPRqJjv7QHLTRn7iiIvhiwkt1jeGPUObqNJo+y+GuGW6gfLxyMNy7jJ/xVfncX0mQvj+TewBL6xZ0T5iMFzgU+htvAZgxwRsay3ELG3k4+WsWXyIPpQ4XoSMDetHwuwezeQvdGeOQhiX3Ocd64+byHa6xHpcHiTxY91l11BHIA4wCdsDrQUttJGUGPLq39u1Pi4ydAUDHOgpJZHfCg6e+ARWC57z1Lfix7ewPGqupXSQAOeKVcVsElh1OfNnygd6Y3U5iTykaztpzz9qAEYkZpp5ViJ5AnJ98Vik09N6xr1YmThyws8ssm7nkDsPSiLmCOG11Iq4ZTyru4ijeUEyLKFPL0qieQCAqkRXY9c023XYpUx0XQQQCSPAOoEZwdqdrkkFRg8hisxw25s4kORI2RuW3pxb3sbKFjcgdn5D0yKpwxTSYy/NUnw1RyoyVzXMk9xcwmMoIgTg43GPWroJJEYCSL8pt9jnP3pnHb29wpMY0n+U7ZraYkxu7ntHPC4YrZMQx7suWJO5PrVwWPQRNbR6uZJ2NC/Jvw5iVJCncA7jNIb6S/MzeNOzBjnIOx/7tVVLwmbW6PzJbAE+EAP1Mf6UNPNHKSNRxWeFxIv1Oce9Vy3JKnEzE+9SpB8jHciQpjYN60JcyWyoS7IAN9zSJ72Q+Us3vmgp5i/NiaTQlQyuOJouoRIMdyaWSXcrZJkyvUUJK5A3NCySNg5JK96WFaGxKyqFPMc80ZFN4ZHUVZcWhVNQBLKNj3HrQRkI2xVEqjYcC4n4i+EihAg788+laW0ma41IyhWTqq4OK+b2UkkMqyRnSw3zW6+Hr03fiGTCHSBnoaG8RcL2eDO6n1WwjClwDjK7lazPEIipLljzxjPOmqcRiS5Vw+xY5/Y/6pRfXiSAAAMwJ37VonvZlX8/pCl8E7rVEzLgjYCiZCDQk3PakIElYd6FfuGO/pRMuc0M7YzzqRgzsuPM+ftQsrLuFPSrJcnOKGcYJ3zQPTV3U/hqsSFjIRqGO1AgB5NWAMnkOlCQPIZPEZjqxzPSi02OSMk0gSDI9gMDNajh8iR/Dtw30uGxn3ArLwxtsTjHYU+hif8AmcAAF1x32pM0hg4Y6TpXVmqWOOZHsKgSaTbf+1WCzcjfA+9UkZN6CyOOgNDyEnpTf5AADLVU9tGpO4PpVEiR0dhkVS8DsMAVoPChC/SP2oaUcwFGKQGeazfG+aHltWU5I27U8lU0DMh0tntRoz1YvEUAHAG9MYbXyggipUqDRh0aAAAKDjvTGKWU2YiOgR6tWAN81KlMg6RWbkR9xVqxMf4uVSpQGHRiYdRVLoVHTepUoDAV4NzuAfShZoWJ+rFSpQAJLE2PqpZeI3hnDVKlAH//Z",
    workJa: "\u30A8\u30C8\u30EF\u30FC\u30EB",
    workEn: "The Star"
  },
  "delacroix": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u6C11\u8846\u3092\u5C0E\u304F\u81EA\u7531\u306E\u5973\u795E",
    workEn: "Liberty Leading the People"
  },
  "durer": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30E1\u30E9\u30F3\u30B3\u30EA\u30A2I",
    workEn: "Melencolia I"
  },
  "elGreco": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30AA\u30EB\u30AC\u30B9\u4F2F\u306E\u57CB\u846C",
    workEn: "The Burial of the Count of Orgaz"
  },
  "friedrich": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u96F2\u6D77\u306E\u4E0A\u306E\u65C5\u4EBA",
    workEn: "Wanderer above the Sea of Fog"
  },
  "gauguin": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u6211\u3005\u306F\u3069\u3053\u304B\u3089\u6765\u305F\u306E\u304B",
    workEn: "Where Do We Come From? What Are We? Where Are We Going?"
  },
  "goya": {
    src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gQ5R09ZQSBZIExVQ0lFTlRFUywgRnJhbmNpc2NvIGRlDQooYi4gMTc0NiwgRnVlbmRldG9kb3MsIGQuIDE4MjgsIEJvcmRlYXV4KQ0KDQpTYXR1cm4gRGV2b3VyaW5nIE9uZSBvZiBoaXMgQ2hpbGRyZW4NCjE4MTktMjMNClBsYXN0ZXIgbW91bnRlZCBvbiBjYW52YXMsIDE0NiB4IDgzIGNtDQpNdXNlbyBkZWwgUHJhZG8sIE1hZHJpZA0KDQpUaGlzIHBhaW50aW5nIChTYXR1cm5vIGRldm9yYW5kbyBhIHVuIGhpam8pIHdhcyBvcmlnaW5hbGx5IGluIHRoZSBncm91bmQgZmxvb3Igcm9vbSBvZiB0aGUgUXVpbnRhIGRlbCBTb3Jkby4NCg0KU2F0dXJuIERldm91cmluZyBPbmUgb2YgaGlzIENoaWxkcmVuIGlzIHBlcmhhcHMgdGhlIGNydWVsbGVzdCBvZiB0aGUgQmxhY2sgUGFpbnRpbmdzLlRoZSBuaWdodG1hcmUgcXVhbGl0eSBpcyBjb21iaW5lZCB3aXRoIG15dGggdG8gbWFrZSBhbiBlcG9jaGFsIHN0YXRlbWVudDogdGhpcyBpcyB0aGUgbWFkbmVzcyBvZiB0cnV0aC4gV2hldGhlciB0aGlzIGlzIGEgcmVmbGVjdGlvbiBvZiBHb3lhJ3Mgb3duIG1lbnRhbCBzdGF0ZSwgb3IgYW4gYWxsZWdvcnkgb24gdGhlIHNpdHVhdGlvbiBpbiBhIGNvdW50cnkgdGhhdCB3YXMgY29uc3VtaW5nIGl0cyBvd24gY2hpbGRyZW4gaW4gYmxvb2R5IHdhcnMgYW5kIHJldm9sdXRpb25zLCBvciBhIHN0YXRlbWVudCBvbiB0aGUgaHVtYW4gY29uZGl0aW9uIGdlbmVyYWxseSwgbWF5IHJlbWFpbiBvcGVuLiBJdCBjb3VsZCBhbHNvIGJlIGEgcmVmbGVjdGlvbiBvZiB0aGUgc2l0dWF0aW9uIG9mIHRoZSBlbmxpZ2h0ZW5lZCBtYW4gd2hvIGhhcyBsb3N0IGhpcyBHb2QgYW5kIGlzIGFibGUgdG8gZXhwZXJpZW5jZSBvbmx5IG1lcmNpbGVzc25lc3Mgb24gY29zbWljIHNj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",
    workJa: "\u6211\u304C\u5B50\u3092\u55B0\u3089\u3046\u30B5\u30C8\u30A5\u30EB\u30CC\u30B9",
    workEn: "Saturn Devouring His Son"
  },
  "grantWood": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30A2\u30E1\u30EA\u30AB\u30F3\u30FB\u30B4\u30B7\u30C3\u30AF",
    workEn: "American Gothic"
  },
  "gris": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30D4\u30AB\u30BD\u306E\u8096\u50CF",
    workEn: "Portrait of Pablo Picasso"
  },
  "hiroshige": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u5927\u306F\u3057\u3042\u305F\u3051\u306E\u5915\u7ACB",
    workEn: "Sudden Shower over Shin-Ohashi Bridge and Atake"
  },
  "hishidaShunso": {
    src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wAARCAApAGADASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAABAUCAwYBAAf/xAA7EAACAQMCAgUHCgcBAAAAAAABAgMABBESIQUxEyJBUXEGFDJhobHBJTQ1QnJzgYKR4RUWIzNiktGy/8QAGQEBAQEBAQEAAAAAAAAAAAAAAgMBAAQF/8QAHBEBAQACAwEBAAAAAAAAAAAAAAERMQISIRNB/9oADAMBAAIRAxEAPwD6/eBSkZwdmqPEQPMm58wa7PmSMBcc8791VXzt5ig2ySAd6+ZF8L4SotUd2CqFySaonhiuUWXWrxYyBzHiDWZ8o+I3SWipaSI9t0emUBh1Sar8k765uUmtZ5sxRR6FUdtbZmB9McurXhG6pDAgDGAOdAXln0cbvGoAOSxPMnNHQIsCBQSQOWeyoXrhrOXt6po7V1pRImYLdjnZ05D8KTxRJ/NV1G2+BrH+q/8Aabhg3DFOcEafYwpbpVfK24fbOjH6oP8AlODT24QGyAA7BSXjkai5tToyTCcsTtzxj207uHHmQHhSO/nEvHIrW7iUWxEUMTZzrLbsPZVIFGOnyJhj3A/gf2ouKIC1hH+A91B3LfJxAPKU7frTDUFhQY5KPdXNV9IRjqk5qEsqtF1sDG3WoTzhgUAIKY3Od80v4xDJdWeIHWNk3BPaahFeVxPCni/BZ7VnMc2q3uZQdKqSw7apa0vrCTRZhnFxpYkL6O+9cmXiehJr64ZEAHSCE9bTRtmCkzXXnzvGq4WJj6P7VR5ekvs8amJ2WJA7amAwT669O4aF1J2IIpStyxyzNjB20tkNUTxFXikO8YA+scZoYekdK4jsHCkkAZ3/AFpc0oPlRKdXNFGPyVyW6zZOQ2oaT27nalSXobygZicf048Z9aGlIFrYXUo8zAzzApf0om41A2AdJB78EL796it3qgUsuokAYG9LkuRHxs4wN2OeW+O6nHcjS5l0qy4OC+aYPN69qztzetNDgI2QTgHt/Cr14gCSn1Au5G2DWjoF/EZhGD1VTsOSWNDTcUMwMkE2ANijADVuPZz3oWfkn3y/Cllr85k8W9xqamTXifEJOjRI5ljlHWB7CO40ngje4dpJLxQxXB0k5JB91C3/AM3h/N8a5wbnP4t8aX4FmfK1EPEVQ6TNq0DBHh3d9T89MsDsVwjAnGNxWci5r40fL6LfdD31hWLb3iDx2jR26nLArpU945Uvi4lp4iGOCyIgIJ7gRUj/AHZ/A+6gV+IpQLGukeWS0Gk74DAHACjHbQTwNC/TzXGnDFlUDIxXIvo+38D/AOapuPoxPt/Cujbo1S4d7cBFVt99XZ+4r0c+hsKeseb+v199C2voR/Yrj/Oj9j41ov/Z",
    workJa: "\u843D\u8449",
    workEn: "Fallen Leaves"
  },
  "hokusai": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u795E\u5948\u5DDD\u6C96\u6D6A\u88CF",
    workEn: "Under the Wave off Kanagawa"
  },
  "homer": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30E1\u30AD\u30B7\u30B3\u6E7E\u6D41",
    workEn: "The Gulf Stream"
  },
  "jakuchu": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u52D5\u690D\u7DB5\u7D75",
    workEn: "Colorful Realm of Living Beings"
  },
  "kandinsky": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30B3\u30F3\u30DD\u30B8\u30B7\u30E7\u30F3VIII",
    workEn: "Composition VIII"
  },
  "klee": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30BB\u30CD\u30B7\u30AA",
    workEn: "Senecio"
  },
  "klimt": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u63A5\u543B",
    workEn: "The Kiss"
  },
  "korin": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u71D5\u5B50\u82B1\u56F3\u5C4F\u98A8",
    workEn: "Irises"
  },
  "kurodaSeiki": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u6E56\u7554",
    workEn: "By the Lake"
  },
  "leonardo": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30E2\u30CA\u30FB\u30EA\u30B6",
    workEn: "Mona Lisa"
  },
  "macke": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30C1\u30E5\u30CB\u30B9\u306E\u5E02\u5834",
    workEn: "Market in Tunis"
  },
  "malevich": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u9ED2\u306E\u6B63\u65B9\u5F62",
    workEn: "Black Square"
  },
  "manet": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u8349\u4E0A\u306E\u663C\u98DF",
    workEn: "Le Dejeuner sur l'herbe"
  },
  "marc": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u9752\u3044\u99ACI",
    workEn: "Blue Horse I"
  },
  "michelangelo": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30A2\u30C0\u30E0\u306E\u5275\u9020",
    workEn: "The Creation of Adam"
  },
  "millet": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u843D\u7A42\u62FE\u3044",
    workEn: "The Gleaners"
  },
  "modigliani": {
    src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wAARCABIAGADASIAAhEBAxEB/8QAGwAAAQUBAQAAAAAAAAAAAAAABAADBQYHAgj/xAA2EAACAQMCAwUGBQMFAAAAAAABAgMABBEFIQYSMRMiQVFhBxQyQoGRI1JxodFyscEkM0Nigv/EABkBAAMBAQEAAAAAAAAAAAAAAAIDBAUBAP/EACURAAICAgICAQQDAAAAAAAAAAECABEDIQQSEzFRBRQiQXGBkf/aAAwDAQACEQMRAD8AsenaDYLbLE1rCzBRljEpPr1FTWm6RpAlWGTTrLJOzGBcMftsaoI9pmn2s5SG3luExjmXAyfTPhU7o3HOjapKIZme0kb4e1+HP9Q8ahV+Sh7MCRLnxcfIOqmjF7U/Zfa6hp513RbCKO9hTNxbxRgLKoHxAD5h+9Yzb2sCmMGCMkg7FRvtXq/RNQ9754JiPeIgDkf8i+DD/NYt7U+FF0HixLu0j5LPUeaRVA7qP8y/5+taIIZbEzsTnHk8byhvY2zcwNvFgHpyCiUsIgOb3eJ1Iz8ArrsX5nOBgnqTiulPNygx55T4Gl9TNDyC9TgWVoIwfd4iT/0H2od7C0VSy28Q9OUUVM5ClmXA6Z2oN7jJAZSPHpQ1CLiByWdpkn3aHI8eUUDJaW4APYIP/IqRM0ZYgEAHbpTLorZAdT65zTAJM7XIp7e3jIdYo8g/lG1DyyRKSBDFk7Z5B/FHTRJ+Ygk+FATRYkwrZGd80UQbmocJ8L2V9w1NqNxzSSl2VVK5UAYGw88nrU9BwjpuoWzNHaNbNHI0YZWIZgDjO/nTOhz6vp3CsFs+mTQyxfOoDKwOTk46VK2c+LVHmvRDKyguGOBnx6YrLyZHskN+9TcwYsZG1vW9Q/h+41jROSCQJcrbL+A6fGBn4Wz1Uj7YqZ1Ge34qWKPU4DJFE5aONVOEbpuwqItIrieBDM5PePNIowOU+Gas1laQM6yrGAyjlBHlUzcnIPxuv4hfZ4b7VZlM4g4Jt0CXOlQ9ohOJIC2eX1XP9qq19w5JCgeaCe2ydmKkA/etiuLaKVyGGw8tqDubBXt3Q9+NhhkbcGiTmuumNzp4+MiuomF3Wk3MW0bc4/TBFR0thebHHQeJrS9U4YuonZrFe1i69mx76+g8x+9VecTQ3HZTwtE+ejqQfsa0U5IYWBcQeEh9MRKpJa3KEkxOw8utCSIGbBHIR4E1bpCOoIwds0w9m10cLEZGPgBkn6UYzhjQEB/p3Qdu0qTLhjsox0oSaMGRebqT4VdJOCb+5HOti8f9Xd/vQU/Bep2vNIYByqMnvg03uvzIDhcH5mu6fr9rLFGUmGSowrDlP2NSjPaXijtYI38nwCRWbcO8YwwyImsRtIFXlV0XOR6irI/FfCPZc4nuLefOwgibP1HSshuJq0b/AGaozurdcmM/1uWyO2iUKTJJJ3OTLPnI9ach7W1PKk55PIjJ+9Zdc8f3/bslpAHgB7rS91yPUA7UVFx7fo4EsEUigA5DEHH2pQwZTLRU1D3kc2AcmnBOpQ9KzqHj2BlybSVT+oNPR8eWq/7sM0aE45sZH7VL4st+p3QlykxPOcELy+PnQmsWFrqdkbe/g51x3HUd5D5g9RQVhqsVzGJYZVdH3BBqUS5Vxua4rFTr9QXT5lK0fgN2uJJtQuCbZT3EXus48z5Vb4bK2sbYR21ukSgdEGP38afkcKuxG9DTXC9lj08Ko8rPEgb3uDzuAcHoag9ZwbObG3cNGXVwWOAcCoLVrtUtJMsGLAgAdSaNQfc8wFTOg45sKxzjbb9q67RBgkbA74oZXB5QAcjG9OyOSOViN/DFW6HuVCzdQ9ZEDggMYWwy56j0OKJc9o3MowAPCo+J0kUICck7fxRiL+HjPpgnFCGqNVbGzOoC3Mqp9KfkOQAzAKN2IHQ0KWaKXmXoD4HGK4+Ik5B8etCSYwA+h6kvoOoGz1cRpKRFMDt0yw9PPFaBFcd0MGzmsfnLIQVOCDnI6g1YtH4vWKFYb48pG3aAZB/XypObGX/ISVh1JDTQjdlsd765oK41FEyWcAeZNQD8V6dsq3UbM23XAH1o7Q4l1+b/AETxlA2HuXGUXHUL5mkpjcn1Es6JZJnMl81w3JDGzZ+YjC0xc2cUVlNK57SYocMflHkB4Vbbrg3uKbbWX5vmDRKc/pvQF3w1bQ6VeSy3dzO0cTEAKqDONs9T18KsODJVST7zCZh/M3NhTjz8zTyqeuM+uaVKnNNDGNXHo3AxzEKD60VHJGBs3pilSpZErxmO96RcHYelcsrxw5Vc77YpUqSGN1CcURUbJ7Q4YcvnXPu5Uk7/AGpUqMnUD2aMHlQhMYO/jinNL1PUdFvDc6fO8UrbHs/mHkR0NKlTUJEmy41OiJcD7WNV9xWJrCE3K/FKzEK2/wCXwP1qZteM7bX9Eu4gGgukgYGMklcHyb+d6VKnljUyc3GxqnZRP//Z",
    workJa: "\u6A2A\u305F\u308F\u308B\u88F8\u5A66",
    workEn: "Reclining Nude"
  },
  "mondrian": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u8D64\u30FB\u9752\u30FB\u9EC4\u306E\u30B3\u30F3\u30DD\u30B8\u30B7\u30E7\u30F3",
    workEn: "Composition with Red Blue and Yellow"
  },
  "monet": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u5370\u8C61\u30FB\u65E5\u306E\u51FA",
    workEn: "Impression, Sunrise"
  },
  "morisot": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u3086\u308A\u304B\u3054",
    workEn: "The Cradle"
  },
  "mucha": {
    src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wAARCABgACIDASIAAhEBAxEB/8QAGwAAAwADAQEAAAAAAAAAAAAAAAUGAgMEBwH/xAAyEAACAQMDAQUHBAIDAAAAAAABAgMABBEFEiExBhMiQVEUFTJhcYGRB7HB0SMkoeHw/8QAGAEAAwEBAAAAAAAAAAAAAAAAAAIDBAH/xAAfEQEAAgIDAAMBAAAAAAAAAAABAAIRIQMSMRMiQbH/2gAMAwEAAhEDEQA/AKftl231XQ9fms7Rou7RA/jHI46D16Uhb9S+0G8qO48JIYFeRz0Hzx+9d/bK5gPae5EunwXLRlfFITkDA6enWuOxhimSRjplsgjO4E5yc85HrUC3GBqD2bJmZL+pmvhc/wCu3Gfh8sA/nmurTf1I1i81O3tZHgUyY3bUzjny+2a1i0tcf49Os38ZTbkrk9TitME1nb3EeNIgiYOuCCcg+ornfjTz+QxcfZ7KPhFFYqfCPpRWSbJ5D2yjI1/UXxnO0AHoRhf5xSuW8l39z7QzFFAYBsAc8genPWmvbLvG7S3AUnO4DOeDkA4x6j+aRm0K73JUknJycYx0qqAbmU3dxG1jFcmQFLkgkYTcMJkdefTy4rcIzdxCRY9ssDBWUL0A8yc81s02RfcsUd9IgMErhduQSNm5vtyKx06WNbhgCu1yHRnbAIxj7/Q0raqtQl8fUZ6yD4RRX1CCinrkUUkeea9t40j1qMlCA6iQnyJBwfvjFLbi2CKi42sUD7ccZJJ/6NWXaaxgn9jnmheYRTEMiDllPOPyBSK9W49+p7XCUkmkV/ko8h8uKe7moEjWuLLFj2LWV5Jc6jIkiyJ4Xix4GJA6Y6fKtNzbCOxmmhMD5YKCJVZipPIwPPmmvaAbLqNsGUMCCMZHGfyP6rj7N6Qmo625Ze8jT/LIMYAxwo/n7UZGx2IAhqeqxMsMKRIAqIoVR6AUVivwiiklpyP8cPPWU/sal9bhLdrUY8AImD59D5fmqwusULu7BVUkknoBUbczNqGrm6Zii/Ci9CAAcHP/ADQsV8mnUneRoSM+AAlNw4GOapOzGn+xaMkrriacd4/36D7CprUXPdN4gSQxJ45yv9VdWZHu+LBBBQHP2oP1ins2qPCPpRWSjwj6UUSkme02piG39jiBLu25+ONo8vuf2pLYRSGfMiMWB3bjxgEHpTHWIDdanP4kYR4VQRyGOPOuaLvHV3jjLMuC2SF8+c/TB/FUaZJFtuLtVlkiG0gAbGJGR0JAH91f6cQdKtmXG0wqRj02ioD262lYs4mzIpXd3YyQPTJ+YPSmuk9qUsrKKzdLmfuwI1doCpx0Gea78aV2bgWO2SWijwj6UVmOABRUpWTOpQFNQmZw6pIcFyeAMeX/AL1pNNc23cTW8bNhm2u65wR5gH881bXlmLmP4CZFJKnHB+Rrig0GHYxuLdTI3BK88VoravrM9q2XBIaKKGLepAG5eQnBI4B59f3pvplxPbzKWkaVS4iKyef0+dUraWkYEcNouweuKLWySB9/u8Rv0yGGPrjPFUtyibIhxI+xnjHFFAHAorJNc//Z",
    workJa: "\u30B8\u30B9\u30E2\u30F3\u30C0",
    workEn: "Gismonda"
  },
  "munch": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u53EB\u3073",
    workEn: "The Scream"
  },
  "pissarro": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30E2\u30F3\u30DE\u30EB\u30C8\u30EB\u5927\u901A\u308A",
    workEn: "Boulevard Montmartre"
  },
  "raphael": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30A2\u30C6\u30CA\u30A4\u306E\u5B66\u5802",
    workEn: "The School of Athens"
  },
  "redon": {
    src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gAeQ29weXJpZ2h0IDE5OTUgTmljb2xhcyBQaW9jaP/bAEMABwUFBgUEBwYGBggHBwgLEgsLCgoLFg8QDRIaFhsaGRYZGBwgKCIcHiYeGBkjMCQmKistLi0bIjI1MSw1KCwtLP/bAEMBBwgICwkLFQsLFSwdGR0sLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLP/AABEIAGAATAMBIgACEQEDEQH/xAAaAAADAAMBAAAAAAAAAAAAAAAEBQYBAwcC/8QANhAAAgEDAwIFAwIEBQUAAAAAAQIDAAQRBRIhMUEGEyJRYRRxgTKRFSPB0QcWUuHwJEJisfH/xAAZAQADAQEBAAAAAAAAAAAAAAACAwQFAQD/xAAiEQACAgMAAgMAAwAAAAAAAAABAgADERIhIjEEQVETMmH/2gAMAwEAAhEDEQA/AOox2KG9kON0YPTHet8luJc7ot8eDjb70fBa72KFtpZiM4oi4h+lhREUHb1PSpHu15AWuS97pSQIXKFAewPehobe3hgPmxs47570P4t8Y2ulP9MitPdNyIl5xnjn2qWj8ZGO6VL+0kt4n4yuSB9x/akG+sHVz0wv4WI2UclpNY27R4tjg9ffNDm2mtlMKyrGGyV6Z9682pWe2WeNxID6lYHqPisxsHmDTnO39JxR6I+A0AMR6ipp7w77aWIlucNnqK0mFJMSRkegY/Ptiqh7KO9XeCfTwMVsh8OKib/MRix3YIp9dddf9Yt934xkpJpUVvH5l0gbccj4NDrb2x3ZjJwf+0cVX3/ho3ce8zkIuPSeAfighpDWo8teB14pmwPqTvXgy/8AIw7kHHq615v2VbZyxGay92i7l5BLcmhbthdoTlcqemah0O00ducnHpbaefUb66dF+oadozvPTk4H2AxU9a6rcaot7ZXumy2ht5SgZvUH/wDJDgf2q08bWsmkMdWSNnt/T56g/pPQP/T9q59c+LrK5ll+nBG89+5+BWNdSwsYFc/h/JrUuGQEHAHuW3g28aTRvp3dkMMhUY7qeQftnNU1tbBlJEysoOCa45pfiu70Wef/AKJJkuCDu34YEdqotK8bpLMBcj6YtyvPpP3Pataq1BWA5mVfUwsOg5OsW0cUaEZ57c0bDdo+UyCOgwa5+nie1WEyvdLGM4yeefYe9aP8728LFYLK6mZRv3EBAR+Tmq10K7bCSksDgidMcRgKxJb33c0BLseVmJIzzgGpbQ/G8OvxSJabhLFgmN8Zx+DTx7suQRHIOO22iPOiCWB5Fknjy0eZ1t7WRwMndI23NZi8e2jhvOgkiPbaAwI/eoa1lgZPNdguAQATk/etFwxXDAnMuQAQTj8UpAzEmdUsRmXcvjHSby3kSXeqt6SJEyDXINYsbCy1ucaeo+nkO5SQeCeo+1OknMCsFG91GcnoT2PPaljJ513GuPUxO3b2GeTXHq3GCY6t2Q7RS1vsB2SKJi2Bg8r84rZZJDMCJgC8ZJfuXz7jtWrUb7+FXsf06oxlGQGHK/J/tXma+ea5DeYU3Jvk2nG7jGKWKQoM8bWsbs3zanBbtm3gjMyEZIIXA/57+1C6h4qub+VbQF1QDA2vksfkjGRREOn/AMbuljs1iaUgEK3CjOMZz/8AawPBl0Jv5wKzbtu1GBAY8r8AHrXkNSHLRZYnxE16PqLaffRslw0MzKfKYH9fI9PsR14+aeN/ifcWsrwS2i3DxsVLKNoyOwyakr2xexuZbGcYaNuWdshW9gB0pc8RtpWVXkbcdxJHfHPenBu5B5AOrDBHZ1GKeOS08mNOBknA5Htmlx12ziiJjBncMUOMnkHnr81Nm/NrJi2kMhMQOW4+4+9Jjeur+pB5TvuB6nFEzHgE7XkjJlxf6vAJInJkxJ61K/bpQV3cOknnQbSzuBuJwVGelSlnNc3LGKGFnUthfV0Xpj9sftTmBJLcNFIokhXBXHBXnBoGJ+4wKPYhIsWvJ1nkZd2MEY5/aj7DR4Ddu115irtxGEGCSevPtxXnSR9VqcKtC7IcgsRgDvT620q81C88qOYRuPVcSHBVF/0/JPHSpbn1XBOI2pCzeoFHpV5Lbzz2OYIgxKMx2bscZHHWkSWetwRzD6mT1MA6dGPsfY4xiujanqUFlFsLpsGI9hAVWPYKKQX98tpA8pG0Aq38iIYJ5x169aiqusJwByW2UUquTIVImuJrkziWVoGz5qE5yeg7980DMlyk8inJIbkYzj4qoncSxXqwkRzzsknpXbsXGBnHHz7jNB2SySQEveQwuGKsPMxuI4zWnW5LdEy7Kwo1z2Io7xTBNG2ZDn0P7CswXqxwiJVBldyD6c5Pb8dac+Erew/gt/8AXIpM8ojQMcYC9we3JpTrMP0c0Codqxt6c9Dz2P8AzvThhyR+RasUbAhNlqtvFYL9fGrzFsJsXGQc9ffB7VW+HtLGt6ffXEUTokKKEYNkM2Tkc88DkmpRVtdRksreK2MPkSjDEcjPJye/WrvRZoNHsJbSfUIo4griNg5wn4AwO4PyantwgyZZWxY4HuYRGs9nkELvA2/cgZOabaaJbexlt41KrKS89y3AIx0Hzmmv0ViIYi9xGVjjGSCBjI4qf1S7sIo5Y7SZVlCAo8h3cnuM/n9qzX2tlyutfFHYsulW81J7iO2W5uIcfTwdTjPLf1PwKR2kd1qHilVuHMsaO8RAbCnnkjHbg088JWl7pupz3l1qEcgmUhkCYbaeM7jx3PGKe/RW9hpN09pwbhtrv2H9B+Pb3o9wvinfqCEL9skz4g8qSKc2ltFGpByYegI9sduufeo3ZcWaqsio7yDzCQoPXsc96tPEENtNMZI7yCERjy9gGCDtAwT36VMQXCxq299pZtwDgE4/aqKM6yT5tqBgQsFs9QSHTJ7Ewm4hM28uRjqTngc9vevdzYtd6vBpwYTRxsWfMnbqMn4Jx96XRW+fNiDEFiSNvJxnrj9/zTfSIooboS3sDzLg7uCCQep+D3/NWt4AkGTKufqPrbSWFubyDymtoQFJjYgDGM59zVPaaMWtkvbO9eISRAPLsVio9lBOMnnGc1MalqMBjXylkmsjtAh/SQQeAB7AYHI5NbLnxQkcimVJJLVQNrocgcZOR1BHFRMrPLVwixp4kS4sL0NF500LBWXPBzgDIwMbsZGccUin8m+1uG1twyRxx8NNltxHbI+Peh73Xbe7hBju5mELsDtk3HaTwO2RWu41m0neOJImMYJLyFec47EHj3oDWxAEelwQE4wYbeaq2hiW5UqWf+VDG0hKqRwXO3PHXGfcVvOpzrp9tE10huXcMEHq5PVsnqP9qktYuLacRx2+4KzZO/8A1YOCfft9uaU3OrXsdwpaRZpAQysgDf79qanxgw/2dNmNSDzsr9btVt4Y5GuHdbgEnC9cf+uaR32q2t1c7rgRiVUVWYApvIUc4HFB3Ov3V9I0Msqqm3OHGBvxj+pr3bW9u0ZaW5tWYnqcN2Hc1Sleg8pB8kqwGfqf/9k=",
    workJa: "\u30AD\u30E5\u30AF\u30ED\u30D7\u30B9",
    workEn: "The Cyclops"
  },
  "rembrandt": {
    src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wAARCABQAGADASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAABAUBAgMGAAf/xAA9EAACAQMCAwQGBggHAAAAAAABAgMABBESIQUTMSJBUdEGFDJhcbEkNERSgZQVU2KCg6GisnKEkcHS4fH/xAAYAQADAQEAAAAAAAAAAAAAAAAAAQIDBP/EAB8RAAIDAAEFAQAAAAAAAAAAAAABAhEhEgMiQVFhMf/aAAwDAQACEQMRAD8A+Hy6YFtljt4APV42OYVJJKgkkkVKTk6RyLQZOM+rJ5VN3ubbbpbQj+gVmowBXP4NjVrlomZWtrMFSQfoyeVV9fYfZrP8snlVeJH6Yzdx+eKDLU4q1YrDv0g/TkWn5ZPKrrxA6fq1n+WTypcGOKspwd6fFApDEXjE5EFpt3erp5VY3kmPq1n4/V08qAXJOBtWwk0bMc/7VLjRSkbC7cDeC1/G3TyqiXs7AfRrT8unlUYVurdakKgcdqlgMJgnZz27e06H7OnlW0Yint7pZLa1I9XlI0wKpDBSQRgUEJAmkKcnvom0LFLktt9Hl/sNS/Y0wO9yGt8Z+rQ/2CsATjO5xRV6hzbtjb1aEf0CswFEI65yc/yrRPCGtLzxmUy+KjUKAI3FMUbDSH9il5VgQMe4UQfgGQPDerAVtNZyQKuv2iASPjVY7eSWdYQNLscYO1Vaeiqiikqc1clmJ2PvrwjIk0Ebg4phHbLyJCdiOlJugSsBwMHFTjq21EiIFT023qhi69AKmx0ZxjtnbORR1pjTdZ2zbS9/7BoaIKhLYDEDvo+2Uci8Ybg2sxB/cqZMpIpPNEtgkL41NDAV2/YHU1ha23rTvoBZAcAbeGcZrDiG/J1Ng8iHGP8AAK2sLuK2jMbJzFdu1nu7vlTrMC9JeItKWjQ6WTp93f31RdMMaiWMOAcYYbUymnsp45mVXhbsqqMxcBcePjn50rjjuruQQRxPIyZxpGTipTspxoPu4ojeq+gldAZSe6hDcJPxF5GhaRvuxbYx37VQBjB2pAu+kDO9dH6Px8IsrCW4vL26huSpVuTGGGnH+p/l1pN8VoRTkxDMxuZedbwrGjHGCRVmlufV1V0OAMDs4BHjnvrQ33D9U0cETiBXDhbghi/xK4x8BTbi3Gr+54jqQA295GqqOVpUqOzjT0wNx+FFu6oSX0QCURjDEd5NXVA6swPQZqzcy0eeNSNbKY3O2CM7H3ViZJJpGjmfKhRuDgY/Cq/RPAmy4U9/FLJzuVBGDlgASW8MZraGOI8PuZUm1yrbTo6gbAaDggik6PHFzBpDalIyeo+FNLcW7cJmmh1K3q8ysvd7Bx/7RJNDiwG9UNLACNjbw/2CqxQPG7gocpvv31a9LaocDpBDv+4KvZvIZmEhypU7Gn4JZE0gLqAMtgA12HovE8dhz1VxIdSLIqZCAjqa4sgF1lGcZ6+Fd16OzFLaK3uJS3D7pXIKoSytp6MR0U9c/Gsuou01Utw5G9LiGV1C9ptnXYtvQNhxSTh8hIUOCQdJ6fhRk81xfI0MKFoYiQugbYz1pNodixAzpGT7hW6imqZlyadxOg4TxD130qgvZI4uZJKq4KDSCdgcdK+t3Vnw9IFtEtiIZ4n7Zj6PjUFU9wGDtXxv0biEnF7NSqtzJdJ1+yNutddc8cmHCBaR82SK3kDJMowVIBGSeqgg7ZFcvWj3UjaGq2chdyE3Ey+1pJUHHWlzSEAbe0KNuVZLmUas53zQjp0z3CumJlIN4NZ3F7dScq3ilVUIJl9lT3H3mjrwSJHMZcgi3lTSF0gdg1l6O3bWt0Y+5twPf3004wsQtLkBtTcmQ7bgdk1jOTXUouMU4WJrhVdYcn7PDgfw1rOBEQasHVv0o6JraS2gYT2xJgiBzMgwQgBBBPurwMIJPNtwcfrk/wCVVyrBUC5RrdmZSCMkZNMW4mbi0hsF1Q27DEkiDcr938e+sk9XcAtcwjPcZU862CWipgX1mP4i5+dS5fBqP03SxsNLyW928bBTpjXAycbbmk1jaKFuYZn0O4wWxn4j/unlvHwpTmXito23TmgDNRw5bS2jm53FuFF5G1A69ZXboOgpKeMOAp4DE0PFLVwW1CZSmMEnx699WmupIOJXSB3MczFXB6sM7ZpjZWfDbSTX+mrJwra0RpAAG9+/Sqpwzhhk1ycesS2rOzAD503O2CjSEqgSEhifCiQqnskZGPCnB4dwNELJxi2d/DmqB86q0HDEHY4jZtt+uApOfpBxE4tmM4mHZYdMV6aSUrOsjaiLeXbw7Jpuos8H6ZaD/ML50Dew2kdlcyi+t3YQyAATqSSVI6ZpqVvQapH/2Q==",
    workJa: "\u591C\u8B66",
    workEn: "The Night Watch"
  },
  "renoir": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30E0\u30FC\u30E9\u30F3\u30FB\u30C9\u30FB\u30E9\u30FB\u30AE\u30E3\u30EC\u30C3\u30C8\u306E\u821E\u8E0F\u4F1A",
    workEn: "Bal du moulin de la Galette"
  },
  "repin": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30F4\u30A9\u30EB\u30AC\u306E\u821F\u66F3\u304D",
    workEn: "Barge Haulers on the Volga"
  },
  "rousseau": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u5922",
    workEn: "The Dream"
  },
  "sargent": {
    src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wAARCABgADEDASIAAhEBAxEB/8QAGwAAAgIDAQAAAAAAAAAAAAAABAUAAwECBgf/xAAzEAABAwIEBAQFAgcAAAAAAAABAAIDBBEFEiExBhNBURQiYZEHUnGBoTLRFRYzU2Kxwf/EABkBAAMBAQEAAAAAAAAAAAAAAAEDBAIFAP/EAB0RAAICAgMBAAAAAAAAAAAAAAABAhESIQMTMUH/2gAMAwEAAhEDEQA/APLxG3IPKNuywYmDZrfZEADKNOi0cDfZQ2UtFBYLbD2VTo23/Q32UmrGR1gpw3O7rY7IuWCSMN5sMkWdoe3O3Lmadj9EXaAlYEWNtq0eywGC2gtfsr3M0UawFyGQaALP/uP91FbynKJ1iqHPLOUa7hZDLIgts0D0V+HUXjsSpqQv5fOkDM3bufZT7KWgfhrhZuO8a07DEH05BdIDtfYf7XTfEYYW2uoYMPeHmng5Tssgc1jW6BtuhuCfuvROFOGaCh8uHvE2V2fmXBc4jqfRczxhg/C7cYnwls0MGOzwuniiZcHMAXC/QFwBFtzomO2jKpI8rO2irDTdEloNrKsiz0oIJY/KFFb9lE0XQ2y3Y03THAaaSpxumjjBLrkn0GU/ulzbWFk1wnEv4RTVdaG3lOWKI/5an9vZYS2Mfh5/JVYnw9jviaOsnpaqJ5Mc0Ly06G3TdPeFMWm4g+LeH4tjMwkllqRNK4CwNm6ADoNAkmPVhqKjkNaCIjcu6klUYTPLQYrSV+obBM1x+gNyPa6uW42RtqMqR2OJUTsPxCppHjzQSuj9jp+EEW3IXV8exR/zbUTQgcqojinaR1zMGq5nLpfquf8AS6hfmCi25Le59lE3Qo2jxXy6xnTfVZlx2N1KYZIXgMlztcDfcAEf9SkPjifaSORzTtlIUGSWodG2PI0NzauufpsFrFegy+Cypk5lVK8E2c4kfRbc974RFm8p32Hpp9lisGWre21gNgsUwaZbv/SNSFYvCVqmepcVVdNU4pTNpZxLHHQ07N9RZltUgvrZKcHije6SrsQ/NlGulrDomWbzHQrnSWMqLoyyjYLzB835UW+VndRbtGKYnc/MC47C2/3VbJLTE36LaVmSjc6+vMA/BQpdZoPU3VCVk7dFNQ8yVDnFascW6hYcbuJ7qMte52AT1pC3s6DB5R4R7OrHAfhGiTzLnaOu8LzBlLs9tjsiBijXd2lRz4m5NopjyJRSHPNb8pUSLxkndyi91MHagsHxFO45QfOOtgNDqUHUxR8q8bi8j5GHL7lOKajaIHhwGTmAlpsL6HQj6q9xGXLmAb26IdmL0afHktnIndZDrAjon8+GwT3cAAe4KEdhDGv/AKhI7aKhc0WK62hW1uZ1lYI7G6YGmbE2zGi3fdVOZboj2J+GXBg+UqKzIPVRGzFH/9k=",
    workJa: "\u30DE\u30C0\u30E0X",
    workEn: "Madame X"
  },
  "schiele": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u62B1\u64C1",
    workEn: "The Embrace"
  },
  "sesshu": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u79CB\u51AC\u5C71\u6C34\u56F3",
    workEn: "Landscapes of Autumn and Winter"
  },
  "seurat": {
    src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wAARCABAAGADASIAAhEBAxEB/8QAGgAAAwEBAQEAAAAAAAAAAAAABAUGAwIHAf/EADUQAAIBAgUCBQIDBwUAAAAAAAECAwQRAAUSITETQQYiUWFxFIEysdEHI0KRocHhJFJysvD/xAAZAQADAQEBAAAAAAAAAAAAAAABAgQDAAX/xAAnEQACAQMEAgEEAwAAAAAAAAABAgADESEEEjFBE2FxIjJRgZHR4f/aAAwDAQACEQMRAD8AvMryTLmyugaogiEtQoVbp+I2v+Qxzn+SUNNlrvFQU4NudAJGA6XLo6zKMuaLOJ6edQvIZ/Mdtt7DG9VSVfVnp589lndRbpPCdvvxx3xlV3spUDP7/qANY3kUKGAsS0EX3UYw+hpupoSCIsx8o0gYYpRZjU1c6RwsEiuS2nY+2GGW+G0qoY6irqulqsRGENyD2Jx51PS1lNyYrVS/EifENHAlbDDTsBsOoV2F8DpBSwSLTTqs0u4N2IBvwfti9GQ5XPI5edpIrfjeE+Xe3F7j5OF2Z+BMvgJqaaod4wjN51LG4F9v/dsXsGsLHj1AisWsWt+5EmBI83IqUEUDLZD/AA3/AFwSKSGSkapTYMGUqNgrBb3HsRb+uKfL/AcFZ13fMz0tWho3i/F5Qw3vsd9vTGUHhusbL5ICIYhFJfqFhbQFsW+d+MBlK9xrNkA3kVlcU0s6GOW8g/hc7HFBVUqxo7zKsL/TOxN7DUD+mC6jwJPSymaGqAj0hiW2YX9bfPGE+d5BmmX1tTVpE1Uym5mvdTHp40n1G/GNLB3upGIFFQfdAainaXOZfppi8Jn0r03uCC23GG80bLDB5jvNGObbEvf/AK4CzWgOV5k+b0iJFElWAsIGymwa221u2HE8XUpKbTsf9PIfYMZD/fD2yDNVySCZ6FQQSSZXRdIkHSLgWOGDIKsS1QkuwYxncG2k8bY5yeanqMqgghm0SpGGIUb++FWVxtrr6MTFRCWqNSm1wTuD78YLVQjA9ZmfiLq3q0YTVUyrS3ZIdbWdWIbYAnketv64XLMIYkLSFV6aoNRCgEE3/MYHyyoaohEm07pUHS0ybjvxe236YX+JdZy+axQSQtoDltxYglQLb/i/PEZ1LO1kxn5lK6cD6WhNaYTDV0YRg9TUDplmG/lDfr/PGGd1DjwxqpKlkaMCJWDWHZWFx8EYApKcZhFFM9GZkZQbSt04kNrHSBuePTFdluWJDlVPLaJad2IECoAotfex5xN5GZggbI5/n1GQguCRJfJ5J1yOiqpqsBa9mTWbFlKAjm/O1tx2GDI62nqYKqGJmMdNpj1ubB7rub34uMcZtl0dRQVEqQNM8DO0cIbSguRc6Rycd0NTJlXhqOthoaiTrgMadnssfNyLi4Btx8YNRluWXLXtbHPz8RgCG9TaiaNaeKGaqjk13LO5DWN72Jvv/jEX4u8T1v1s9HTyuoudTiw8u+w+eScWWa11FVZcUiqotcig6A1mKm223fHmfiCk61TRpCl3MTgkm1wD64p0IZgajC0wqkYAlnRwz5pldJUzU6GGp88oUXszoU497DG0uUTpE72UwwxRRFiy6g8b7gjtscD5V4go5qaGli10yxU0cYSRQNTKPa9xz74IpM1o6aOrotHUFTKZFIJ8rEW784pKsACB2Meou4X5ldlkcFHQQzeSB2jALty49gLnthCYczir6iSHpwxzhkLub3BN+B8YIyumaoooW3sVHfGuZ1dHk9DLU1cwjVRtcjUfQAdzjxq+sapU2IowSJvTU0w3uTmaU1RksdJWx5tLDD1h9QtrLINtrDfi+D88eKSgWWJWqoKuYTaxF1EAttbi19uffEHmdbmeY18C18zSI41wx61OgE7A22B453w2TNs5ovCtdl/00SJBEbTqxDIhJJHuebemL/BUARrgm+esf5F8nP4lukKvlNM6RrTh41fRGLAXGPi12YJQw0tMySJG2ohxawvfkC55x5Zl/iXNKXw+tNTVwgijZmbYFlB+eB8YBh8TZlmNaYGzCqZCCS3VK3HwMRLoaqVGdWEBrqBxxPUMzqZ4KCrZs1hpGkQ2RE1Nqt63uMKoczdf2emFMxm+sZHQQrdmClvw8enc+u2JKmrZIdXm8vubn9cFDM51ljdSpKm4FvTFy0VAG43N78DqTnVA9Szy2tox4Ghgaoj+rEWh4msJAdXFjvsMStVNHIwjU3eJWjIt6m9v5YHWpmqarqnShDXsF4OO7FaiUsB5rEn3I/xizSItMkDs3imsHwJjFUNT1wnjNjE6uL+xvj0/Ms6o5ad4aWWlbqDch0vxwBjympHTYcWYWw1pgo+llPJIP34x2spB6iueppTbYLW5lVllF4mnymSZ/wB3QABYULJHrT/cSTx2whzGghrUZ5AonS6hlbVe3a/pgPOPFEsWSw5fRQSNMECySvey+yjj74lTmOYOPM8u47YFIqAfptmCpfjmOoSlIjjdjsDcXO3GDMzmkqMgpY9Twxyn96hupcDe2Jpc2zGOIIks6KDwCRzjCSszGoax67knbXv+eFtm81ardNqpaE5zQQxwxmjsom2e0oey/wBt8D0NDeaEIY4WUWJJ5vz+ePtZlldTlWd0m6m94nD2+cZxw1aixicfItjhmTMr9iVVLkFPp1S1LSf8bAYIkgyukCrMQgckKbnsO5xMwRVRU/vVjtxra2OZY6tV0sBKh7qdWG2GLt/Kx+z0q6jBJ1PNb1H88BzVVU7a4o43Q2Fr7i1+R98LIjPGrBYJBfmykY7PVkNpKeS/Y2IOArbDeOFtjbO6iaqdfNAE4POGsFTalpNaaShH398LNOy3hm2+cbKs81VEUhlKhhyDsMCpU3mOMkWE/9k=",
    workJa: "\u30B0\u30E9\u30F3\u30C9\u30FB\u30B8\u30E3\u30C3\u30C8\u5CF6\u306E\u65E5\u66DC\u65E5\u306E\u5348\u5F8C",
    workEn: "A Sunday on La Grande Jatte"
  },
  "sharaku": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u4E09\u4EE3\u76EE\u5927\u8C37\u9B3C\u6B21\u306E\u6C5F\u6238\u5175\u885B",
    workEn: "Otani Oniji III as Yakko Edobei"
  },
  "signac": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30B5\u30F3\u30FB\u30C8\u30ED\u30DA\u306E\u6E2F",
    workEn: "The Port of Saint-Tropez"
  },
  "sisley": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30DD\u30FC\u30EB\u30FB\u30DE\u30EB\u30EA\u30FC\u306E\u6D2A\u6C34",
    workEn: "Flood at Port-Marly"
  },
  "sotatsu": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u98A8\u795E\u96F7\u795E\u56F3\u5C4F\u98A8",
    workEn: "Wind God and Thunder God"
  },
  "tohaku": {
    src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wAARCAAtAGADASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAAAwUEBgcBAgD/xAA4EAACAQIFAQIKCgMBAAAAAAABAgMABAUGERIhMUHhBxMUIjJRYXGx0RYjJDRCUmKBkqEVF8GR/8QAFwEBAQEBAAAAAAAAAAAAAAAAAQIABf/EABwRAQEAAgMBAQAAAAAAAAAAAAEAAhEhMVESQf/aAAwDAQACEQMRAD8Ac4HlrDbzCYJZ7SNnI0JKimP0PwfnWxi6flHyqZlvQ5ftm9mtNwSwPGlca6i81ejyfgrRIxsouQNfNHyr58oYMsbFbKMHQngCnnlcEQjjcgEgaUlzDm2ywK4itrmGYrOhImUDYDoeOutYNsOWqEMs4KI4hNbRb2UdQPV7qO2TsFCk+QxcDjzR8qHZX4xFIH2LIm0Dep0PTirJHG3iCCwPmnn9qpNQMhXJ+EFVPkMWpH5F+VcmyrhcVvIyWUakKTwo9XuqbdXnkhM6wFyIwV3voAfWfZVXwzNGK4iLkXSjaAxUougA5GmnaPbWMdx9U+fLuEeRmSKySSTTjVR/0V2DK+HPZF5MOiDBSddq8/1UoxvNCDuOxl1qZh8UosniZSugJBHQ8UoW2y9Mp4aT9wi4/QPlUbF8t4dZ4TPLFaRKwU8hB8qukMZCgn1UszSumA3J6HaT/VRUKsPLSr/gbYDTXbTcoVQ+6k+V3DYBat27adMfqzz2U/kPcrngBMUzKC4AGgPojSqdnLDPK7B54rVRIWGsg4/99nsq9SIos1UdSuvHUnSq3mAT3uFlhE9t4khtWOu4a+rsqsXmnLqSZPDwxou5mYLzuHZ6te2r1azFo/2pJl+JHs4pGQB+1h0arJGiCE6LpxVZctjgqpisEt+wjkB2BQDu4X9h20G2tBbI/i0+q2EcdlWqSzE0SEqPRHwrxLZqllKVQDzW+FA2pFlBF5Kvmj0QOlSXRVgcKB6J+FChXxcaDrxRZG+pfjXg0NtxgwCL06UmzNq2BXOo42n4U03AqugpRmiXZl66PI0WpepOyX5VnH0ftOfwCnTXACnkdKxvDs9XNlYQQxWw0RANS/Xj3VJbwiXzqQbdf5d1V8vko7tXjuI1jQjqVHNLsWu4ksJ0BAJAZde07hWcJn+8SNdIB0H4+6g3Gdp7pCs1orqewv3UmL5SjaZhohg12SL4s/h05FNDeRCMjxg6Vj8OdbqMaCAEe1+6jfTm72/dk/l3VSPkabXI7yEW8erc7R8KBNiET28yhxrsb/orLP8AYN74tQbZDoNPS7qE+frjafsa8gj0+6p0+Tptaivo2jXRudBRZLpDC+jdAayFPCHdovm2iDT9XdXs+Ea9KH7JHyPzd1Ony3y2ux3AKjU9lJc1T65du/UENUFfCRfoBpax/wAu6ouJZ/u7/D5reW1QK6kaq2nZ7qnT5Ic7v//Z",
    workJa: "\u677E\u6797\u56F3\u5C4F\u98A8",
    workEn: "Pine Trees"
  },
  "toulouseLautrec": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30E0\u30FC\u30E9\u30F3\u30FB\u30EB\u30FC\u30B8\u30E5\u306B\u3066",
    workEn: "At the Moulin Rouge"
  },
  "turner": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u96E8\u3001\u84B8\u6C17\u3001\u901F\u5EA6",
    workEn: "Rain, Steam and Speed"
  },
  "utamaro": {
    src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wAARCABgAEEDASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAAAwQAAgYFAQf/xAA9EAABAwIEAwUFBAgHAAAAAAABAgMRAAQFEiExE0FRBjJhcbEUIlKBkSM1U3MVJCVCobLR4URUY4KSwfD/xAAZAQACAwEAAAAAAAAAAAAAAAACBAABAwX/xAAeEQACAgMBAQEBAAAAAAAAAAAAAQIRAyExEkEicf/aAAwDAQACEQMRAD8A+h4o/cJx28Cbh1IDpgBZAFDReXSf8U8f95q2LIP6cvTyLqqChM7muK27Z1EtDScQvTp7U9/zNEGI3o1Fy981mlQmIirDRUGpZKHBiV7/AJp75LNXTiN5mH6y981mkVvttTnWlMbzpRmlpVCkqBHUGRV2yUgzuJ32aPanh5LNBOIX4StRv35jSFmln3yi6baCZzg6ztVeKVOraKNEDvSNaptkpGu49x+O59alTKOlSmbFjMYmuMavBAP2yqX8aLisjHLzpxlUBJ60pLo2uBQqBE69KwXbvtZiGHYgnDMPX7PLYWt4d8k7BPTz3rpdqcYctsQtsPsBF7c5Qp0ieEgqyggc1b79KLjnZC1vcNS1aMzeKUkquHgorIG+Y9a2goxacvplNuSaifNsKfubrGGmru6edF4rgO51kkhWnPmJB+Vd/sM12gwftIm3Ra3K7NS+HcJynhpHxTsCN9PKuHiVleYXinsz7bRcSqRk3EHqIra9h8Wu8QuH7K4cVxWUcVCidVJmCD1Ika01kf5bXBeC3T6bK5STf2yoSRqJIEjTkaKpCuOs6ZY0geFCuCpN1bAAqEnMdOm+v/VFKE8RTiUgLUCCZ3jaue3odNdBqV5J6ipTgmZXFT+2rv8AOV60tOtHxSTjN3P4qvWgpgnypOXWOR4CXh9ldPB163accEDOUjMIO008loZkkggpEDUx9KWaYbQXDJVm2FMIdShtKQghI5japIkf4cS7wbDjjdu9dWyXrm6fUvMoSAhCTCfQ+Jo3Z7C27HD2nXLJti8cCi5AGYAqJCZ8BH0rpvtoeW06AVLZJIjfUQaoy/LmRaSCI1jT+1F6bVFeKdhHGUOuJUoDMjumNqo4nKhS8xMA7xRyAdj5Us9q2oeBoEWzXzUq0HrUp6hIyOJffF3P4yvWhpGpJomJffF3+cr1pZayHGkD99WvkNaSfWOx4XuIShKCJzDWKChpLZJGdrnoTFVffKr05e62Ag+e8/Kr5swjMBBoWbxVIIzcLSj7UBQ+JO4+VWfjiNvAztJHPpQ1HKEqSSAQZHI1QyG8qRCVGVJjaOlUiUPMqBlI0y+M0N+Q2sgHY7UNlxSFgEJygRvE+NWeuwlCjCSkAwQdxRIylE2Ofz+lSvOOj4h9RUp8QMpiAzYrdn/WV6mkX3Sw82rLJykAc5roXnvYldmNOMv+Y0pcI+0aUYnUCkZdH4fBVLRaQj3gVTKp1k1664GFpKzIUCQI1VHodautOuupUDOm+nSl7lvPZhYXJCtOpPPyoVvps9LR4q/X3kICI6nNRbWXUlx/LkIIAjeOdJtpDxQ2hJBUcpnfxruJbyoQEpHuwAOkbfwomkjHHKUnbYJQlwDIUpManWeulVShC0qc7x1gzM6V66vOIJBSNCAYzf2pV+/CWiiUgiRoPDrtQ0aNm893oKlTOmpXQOaZe4M4hc/nL/mNL3qkoty4VRw/emn7nDMQN4+pNo8QpxRBCeUmuTi2H4oooZRh12tHeUUtEjwFKeW2NeqRbTMFZtCZA66VUjJCUDTaOcDelLO0xhoJbdwq9UlJMQ0qQOm2tPG1xBUKVh90iNjwVk/SKFwaNY5YtdJb27aHFKIGbbfn0r29eS2EoEiR3p2HjQX2r9JWlnC7wzzLChB67Uk7Y4mtJK7K9JmZ4Cv6Vag30CWWKWjx5xaishWg11HoKvfW+RpSk75Z28KGbK/GabC6hSY1ZV/Suhe2N57IoptXlLKQCA2STpHT/wBFE4sCGS7s2Wvw/wAalG9lf+FX0qU4KWf/2Q==",
    workJa: "\u30DD\u30C3\u30D4\u30F3\u3092\u5439\u304F\u5A18",
    workEn: "Young Woman Blowing a Poppin"
  },
  "vanEyck": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30A2\u30EB\u30CE\u30EB\u30D5\u30A3\u30FC\u30CB\u592B\u59BB\u50CF",
    workEn: "The Arnolfini Portrait"
  },
  "vanGogh": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u661F\u6708\u591C",
    workEn: "The Starry Night"
  },
  "velazquez": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u30E9\u30B9\u30FB\u30E1\u30CB\u30FC\u30CA\u30B9",
    workEn: "Las Meninas"
  },
  "vermeer": {
    src: "data:image/jpeg;base64,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",
    workJa: "\u771F\u73E0\u306E\u8033\u98FE\u308A\u306E\u5C11\u5973",
    workEn: "Girl with a Pearl Earring"
  },
  "whistler": {
    src: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcICgiHB4mHhgZIzAkJiorLS4tGyIyNTEsNSgsLSz/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wAARCABGAGADASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAgMAAQQFB//EADgQAAICAQICBgYIBwEAAAAAAAECABEDEiEEMQUTIkFRYXFygZKx0RQVIzIzYpGiQkNSU5Ohs8H/xAAYAQEBAQEBAAAAAAAAAAAAAAABAAIDBP/EABoRAQEBAQEBAQAAAAAAAAAAAAABETEhAhL/2gAMAwEAAhEDEQA/APJmXAAoHDYKCKPw18B5RLrjNjqMPP8AtL8o2tLC9wFA/wBCQjVyH6TwO+kqEH8jD/iX5Qtia6vGPQg+UII13pMu6vaS1VfkX3RDF/0Jv+QfKVe9y9QAEDqUxF0vo0iWoK8tPuiED9nCUSWq3BsAA+qIwcTkU/f/AGiKLUak7jDDom4jI7feutuQmjgPtM9NjRwVa7UHuMyrQudHopR9OxL3MGB90w4euSSNS3zofCaMTBUvzmNm7XLuHwjFyEVa3N2OetZ5bDYxOcDV7JBkNcqgka2hItB/DyhabhDHdC5r+gMgBbIo1Rtk6mNthULVp85obgqH4yeUTlwMmkKwcnwlsWF67MLbxg9S6gkrtK0rpsk+yDUWKur3nS6Js8ZjA27L37pnMVBuQROl0UNXGDfZceTl6jTN4Z1ysgAy8+4fCGrAAbxb2X9lSV51OjB5rQTz8ICHme/xggkDntLQ8/OURwPaE1ZXLabC7DxmIOB5xrZCV5DeFnqE5IpuyRt3y01DOhNAG63mdstKykWD3XLXLqKkCiPGZsMa+O6vGo6s8x2vTOeXGmqnQ4kq4JQALpG3n3zCF8BD540FXpgJ0ejXB4liCQepy1XqNMXVhRyubejKHEZSDRGDN/zMao5RZTk2uM2rcExauC1mN1KO+bYQLYFLGYlXe1uorrNI5w0yKo9MzSaiqQTpMm2ogBoAz16JZz2ezD0+KdF1m5aopgO+ptiISsQIo7q1I5wTiFwddi9pYYmZaU2NhutfrH8Cjrkyk8zhyD9hlbgDaNwuuPDxD7Aricj3TLaHDZ1U8jyE18Lg+k4wytW9biSSdq5xHwBRu17Xyiiypzs+ySSBiw6kd9eiX1+PGTZb3R85JJYqU3GJZoNXoF/GD9Y4gQCr+wCSSP5i1PrPBva5P0HzlnpfhF7sxPqgf+ySQ/MOqbpnh2OwzBe7sj5wW6ZwrhypoyHWjLyHeCPHzkkm58xm2v/Z",
    workJa: "\u9ED2\u3068\u91D1\u306E\u30CE\u30AF\u30BF\u30FC\u30F3",
    workEn: "Nocturne in Black and Gold"
  }
};

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
var TITLE_MAX_CHARS = 80;
var NOTE_MAX_CHARS = 800;
function subjectPhrase(facts) {
  const modality = toModality(facts.modality);
  const bodyPart = toBodyPart(facts.bodyPart);
  return [
    "a greyscale medical radiological image",
    modality ? `acquired with the ${modality} modality` : null,
    bodyPart ? `showing the ${bodyPart} region` : null
  ].filter(Boolean).join(", ");
}
function buildImagePrompt(opts) {
  const { painter } = opts;
  const style = STYLE_BY_ID.get(painter.styleId);
  return [
    "You are helping to create a work of art that connects imaging science with aesthetics,",
    'in the spirit of the "Art of Imaging" section of a radiology journal.',
    "",
    `Source image: ${subjectPhrase(opts.facts)}.`,
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
    "  - Keep the result suitable for public exhibition."
  ].join("\n");
}
function buildNotePrompt(opts) {
  const { painter, locale } = opts;
  const style = STYLE_BY_ID.get(painter.styleId);
  const language = locale === "ja" ? "Japanese" : "English";
  return [
    "The attached image is an artwork that was generated from a medical radiological image,",
    'for the "Art of Imaging" section of a radiology journal.',
    "",
    `Source of the artwork: ${subjectPhrase(opts.facts)}.`,
    `  Style: ${style ? style.nameEn : painter.styleId}`,
    `  In the manner of: ${painter.nameEn}`,
    "",
    "Task: look at the attached artwork and write an appreciation note for a viewer.",
    `Reply with a single JSON object in a \`\`\`json code block, written in ${language},`,
    "with exactly these keys:",
    `  "title"        \u2014 a title for this artwork (at most ${TITLE_MAX_CHARS} characters)`,
    `  "appreciation" \u2014 how to look at this artwork (at most ${NOTE_MAX_CHARS} characters).`,
    "                   Begin with what can be seen, then move on to composition, colour,",
    "                   light, brushwork and mood. Describe THIS image, not the style in general.",
    "",
    "Constraints:",
    "  - Do NOT include any patient information, identifiers, dates or institution names.",
    "  - Do NOT offer a diagnosis, a finding or any clinical interpretation.",
    "  - Do NOT name the painter, the style or the modality: they are shown separately.",
    "  - Describe only what is visually present in the attached image.",
    "  - Return the JSON only, with no commentary outside the code block."
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
function sampleBilinear(values, cols, rows, x, y, bg) {
  if (x < -0.5 || y < -0.5 || x > cols - 0.5 || y > rows - 0.5) return bg;
  const cx = x < 0 ? 0 : x > cols - 1 ? cols - 1 : x;
  const cy = y < 0 ? 0 : y > rows - 1 ? rows - 1 : y;
  const x0 = Math.floor(cx);
  const y0 = Math.floor(cy);
  const fx = cx - x0;
  const fy = cy - y0;
  const x1 = x0 + 1 >= cols ? cols - 1 : x0 + 1;
  const y1 = y0 + 1 >= rows ? rows - 1 : y0 + 1;
  const v00 = values[y0 * cols + x0];
  const v10 = values[y0 * cols + x1];
  const v01 = values[y1 * cols + x0];
  const v11 = values[y1 * cols + x1];
  return v00 * (1 - fx) * (1 - fy) + v10 * fx * (1 - fy) + v01 * (1 - fx) * fy + v11 * fx * fy;
}
function resampleFraming(values, cols, rows, framing, outW, outH, bg) {
  const [tl, tr, bl] = framing.corners;
  const ux = tr[0] - tl[0];
  const uy = tr[1] - tl[1];
  const vx = bl[0] - tl[0];
  const vy = bl[1] - tl[1];
  const out = new Float32Array(outW * outH);
  for (let j = 0; j < outH; j++) {
    const v = (j + 0.5) / outH;
    for (let i = 0; i < outW; i++) {
      const u = (i + 0.5) / outW;
      const x = tl[0] + u * ux + v * vx;
      const y = tl[1] + u * uy + v * vy;
      out[j * outW + i] = sampleBilinear(values, cols, rows, x, y, bg);
    }
  }
  return out;
}
function framingOutputSize(framing, maxEdge) {
  const [tl, tr, bl] = framing.corners;
  const srcW = Math.hypot(tr[0] - tl[0], tr[1] - tl[1]);
  const srcH = Math.hypot(bl[0] - tl[0], bl[1] - tl[1]);
  const aspect = framing.screenWidth / framing.screenHeight;
  let w = Math.min(maxEdge, Math.max(srcW, srcH * aspect));
  let h = w / aspect;
  if (h > maxEdge) {
    h = maxEdge;
    w = h * aspect;
  }
  return { width: Math.max(1, Math.round(w)), height: Math.max(1, Math.round(h)) };
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
      const title = typeof obj.title === "string" ? obj.title.trim() : "";
      const appreciation = typeof obj.appreciation === "string" ? obj.appreciation.trim() : "";
      if (title || appreciation) return { title, appreciation };
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
function readGeneration(outcome) {
  if (outcome.image || outcome.text !== void 0) {
    const text = outcome.text ?? "";
    return {
      image: outcome.image ? outcome.image.bytes : null,
      imageMimeType: outcome.image ? outcome.image.mimeType : null,
      text,
      note: extractNote(text),
      blockReason: outcome.blockReason
    };
  }
  return { ...parseGeneration(outcome.data), blockReason: outcome.blockReason };
}

// src/ui/clipboard.ts
function legacyCopy(text) {
  return new Promise((resolve, reject) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.setAttribute("readonly", "");
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    if (ok) resolve();
    else reject(new Error("copy failed"));
  });
}
function copyText(text) {
  if (!navigator.clipboard || !window.isSecureContext) {
    return legacyCopy(text);
  }
  return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
}

// src/ui/ArtDialog.ts
var CAPABILITY_ARTWORK = "image-to-image";
var CAPABILITY_NOTE = "image-to-text";
var ARTWORK_MODEL_ON_0_3_0 = "gemini-3.1-flash-image";
var VIEW_POLL_MS = 300;
function openArtDialog(host) {
  let closeDialog = () => void 0;
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
    el("button", { style: CLOSE_BTN, dataset: { testid: "art-close" }, onclick: () => closeDialog() }, ["\u2715"])
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
      const thumb = PAINTER_THUMBS[p.id];
      const work = thumb ? { ja: thumb.workJa, en: thumb.workEn } : p.works[0];
      const figure = thumb ? el("img", { src: thumb.src, alt: "", style: THUMB, loading: "lazy" }) : el("div", { style: { ...THUMB, ...THUMB_EMPTY } }, ["\u2014"]);
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
          figure,
          el("div", { style: ROW_BODY }, [
            el("div", { style: ROW_LINE1 }, [
              el("span", { style: { fontWeight: "600" } }, [lang === "en" ? p.nameEn : p.nameJa]),
              el("span", { style: MUTED_INLINE }, [
                ` ${style ? lang === "en" ? style.nameEn : style.nameJa : p.styleId}`,
                p.died ? ` / ${p.died}` : p.note ? ` / ${p.note}` : ""
              ])
            ]),
            // 2 行目に「代表作 — 作風」。名前だけでは何が出てくるか分からないため。
            el("div", { style: ROW_LINE2 }, [
              `${lang === "en" ? work.en : work.ja} \u2014 ${lang === "en" ? p.promptHint : p.styleJa}`
            ])
          ])
        ]
      );
      painterList.appendChild(row);
    }
  }
  function renderSelected() {
    if (!selectedPainter) {
      selectedLabel.textContent = "";
    } else {
      const shown = PAINTER_THUMBS[selectedPainter.id];
      const w = shown ? { ja: shown.workJa, en: shown.workEn } : selectedPainter.works[0];
      const name = lang === "en" ? selectedPainter.nameEn : selectedPainter.nameJa;
      selectedLabel.textContent = `${t("selected")}: ${name}\uFF08${lang === "en" ? w.en : w.ja}\uFF09`;
    }
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
  let noteContext = null;
  const retryNoteBtn = el("button", {
    style: { ...BTN, display: "none", marginTop: "8px" },
    type: "button",
    dataset: { testid: "art-retry-note" }
  }, [t("retryNote")]);
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
  const closeBtn = el("button", { style: BTN, dataset: { testid: "art-close-footer" }, onclick: () => closeDialog() }, [t("close")]);
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
  let cachedPixels = null;
  let lastSignature = "";
  let rebuilding = false;
  function viewSignature(view, imageId) {
    if (!view) return imageId;
    const r = view.visibleRegion;
    return [
      imageId,
      view.windowCenter,
      view.windowWidth,
      view.invert,
      r ? r.corners.map((c) => `${c[0].toFixed(2)},${c[1].toFixed(2)}`).join(";") : "-",
      r ? `${Math.round(r.screenWidth)}x${Math.round(r.screenHeight)}` : "-"
    ].join("|");
  }
  function backgroundValue(win) {
    const half = (win.width > 0 ? win.width : 1) / 2;
    return win.invert ? win.center + half : win.center - half;
  }
  async function refreshSource(force = false) {
    if (rebuilding || busy) return;
    const target = host.getTargets()[0];
    if (!target) {
      if (force) setStatus(t("errNoTarget"), "error");
      return;
    }
    const view = host.getViewState(target.tileId);
    const signature2 = viewSignature(view, target.imageId);
    if (!force && signature2 === lastSignature) return;
    rebuilding = true;
    try {
      if (!cachedPixels || cachedPixels.imageId !== target.imageId) {
        cachedPixels = await host.getPixelData(target.tileId);
      }
      const pixels = cachedPixels;
      if (!pixels) {
        if (force) setStatus(t("errNoPixels"), "error");
        return;
      }
      const win = view && view.windowWidth > 0 ? { center: view.windowCenter, width: view.windowWidth, invert: view.invert } : autoWindow(pixels.data);
      const region = view?.visibleRegion;
      let values = pixels.data;
      let width = pixels.cols;
      let height = pixels.rows;
      if (region && region.corners.length === 4) {
        const size = framingOutputSize(region, 1024);
        values = resampleFraming(
          pixels.data,
          pixels.cols,
          pixels.rows,
          region,
          size.width,
          size.height,
          backgroundValue(win)
        );
        width = size.width;
        height = size.height;
      }
      const built = await buildSourceImage(values, width, height, win);
      sourcePng = built.png;
      sourceSha = await sha256Hex(grayToRgba(applyWindow(values, win)));
      sourceImg.src = URL.createObjectURL(new Blob([built.png], { type: "image/png" }));
      modalityLabel.textContent = `${t("resultModality")}: ${target.modality || "-"}`;
      lastSignature = signature2;
      updateButtons();
    } finally {
      rebuilding = false;
    }
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
      const prompt = buildImagePrompt({
        painter: selectedPainter,
        facts: { modality, bodyPart },
        locale: lang
      });
      const outcome = await host.ai.generate({
        capability: CAPABILITY_ARTWORK,
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
      const parsed = readGeneration(outcome);
      if (!parsed.image) {
        const reason = parsed.blockReason;
        setStatus(reason ? t("errBlocked", { reason }) : t("errNoImage"), "error");
        return;
      }
      artwork = await composeArtwork(parsed.image, selectedPainter, signature);
      const meta = buildMetadata({
        appVersion: "",
        pluginVersion: true ? "0.1.0" : "",
        // 🔴 **本体が実際に使ったモデルを記録する。** プラグインが送った定数ではない
        //    ——利用者が環境設定でモデルを変えていれば、記録と実物が食い違う。
        model: outcome.provenance?.model ?? ARTWORK_MODEL_ON_0_3_0,
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
      noteContext = { painter: selectedPainter, modality, bodyPart, seriesUid: target.seriesUid };
      showResult(artwork, null, modality);
      setStatus(t("generatingNote"));
      const note = await generateNote();
      showResult(artwork, note, modality);
    } catch (e) {
      setStatus(t("errGeneric", { error: String(e) }), "error");
    } finally {
      busy = false;
      updateButtons();
    }
  }
  async function generateNote() {
    if (!artwork || !noteContext) return null;
    const ctx = noteContext;
    const outcome = await host.ai.generate({
      capability: CAPABILITY_NOTE,
      prompt: buildNotePrompt({
        painter: ctx.painter,
        facts: { modality: ctx.modality, bodyPart: ctx.bodyPart },
        locale: lang
      }),
      // 送るのは**生成した作品**。元画像を二度送らずに済み、実物を見て書ける。
      imageBytes: artwork.png,
      mimeType: "image/png",
      // 画像を返させない。文章だけでよい。
      responseModalities: ["TEXT"],
      // 1 回目と同じ単位。「記憶する」に印が付いていれば同意は再掲されない。
      scopeKey: ctx.seriesUid
    });
    if (!outcome.ok) {
      const msg = errorMessage(outcome.error);
      setStatus(msg ? t("errNoteFailed", { error: msg }) : "", outcome.error === "canceled" ? "info" : "error");
      return null;
    }
    const read = readGeneration(outcome);
    const note = read.note;
    if (!note) {
      const reason = read.blockReason;
      setStatus(reason ? t("errBlocked", { reason }) : t("errNoteEmpty"), "error");
      return null;
    }
    setStatus("", "ok");
    return note;
  }
  async function retryNote() {
    if (!artwork || !noteContext || busy) return;
    busy = true;
    updateButtons();
    retryNoteBtn.disabled = true;
    setStatus(t("generatingNote"));
    try {
      const note = await generateNote();
      showResult(artwork, note, noteContext.modality);
    } catch (e) {
      setStatus(t("errGeneric", { error: String(e) }), "error");
    } finally {
      busy = false;
      retryNoteBtn.disabled = false;
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
  function copyButton(label, okStatus, getText) {
    const btn = el("button", { style: COPY_BTN, type: "button" }, [label]);
    btn.addEventListener("click", () => {
      const text = getText();
      if (!text) return;
      void copyText(text).then(() => {
        btn.textContent = t("copied");
        setStatus(okStatus, "ok");
      }).catch(() => {
        btn.textContent = t("copyFailed");
        setStatus(t("copyFailedStatus"), "error");
      }).then(() => {
        window.setTimeout(() => {
          btn.textContent = label;
        }, 2e3);
      });
    });
    return btn;
  }
  function charCount(text, max) {
    const n = [...text].length;
    const over = n > max;
    return el(
      "div",
      { style: over ? CHAR_OVER : CHAR_OK },
      [t(over ? "charOver" : "charCount", { n: String(n), max: String(max) })]
    );
  }
  function noteField(label, value, max, okStatus, testid) {
    if (!value) {
      return [
        el("div", { style: FIELD_LABEL }, [label]),
        el("div", { style: FIELD_VALUE, dataset: { testid } }, ["-"])
      ];
    }
    return [
      el("div", { style: FIELD_LABEL_ROW }, [
        el("span", {}, [label]),
        copyButton(t("copy"), okStatus, () => value)
      ]),
      el("div", { style: FIELD_VALUE, dataset: { testid } }, [value]),
      charCount(value, max)
    ];
  }
  function showResult(art, note, modality) {
    resultImg.src = URL.createObjectURL(new Blob([art.png], { type: "image/png" }));
    resultText.textContent = "";
    resultText.append(
      // 🔴 モダリティはローカルの DICOM 値を正とする。AI の出力で上書きしない。
      el("div", { style: FIELD_LABEL }, [t("resultModality")]),
      el("div", { style: FIELD_VALUE, dataset: { testid: "art-result-modality" } }, [modality || "-"]),
      el("div", { style: MUTED }, [t("modalityNote")]),
      ...noteField(t("resultTitle"), note?.title ?? "", TITLE_MAX_CHARS, t("copiedTitle"), "art-result-title"),
      ...noteField(t("resultAppreciation"), note?.appreciation ?? "", NOTE_MAX_CHARS, t("copiedNote"), "art-result-note"),
      // 🔴 注意書きは末尾ではなく内容の直後に置く（本体 analysisResults.ts の規範）。
      el("div", { style: CAVEAT, dataset: { testid: "art-caveat" } }, [t("caveat")])
    );
    if (note?.appreciation) {
      resultText.append(el("div", { style: MUTED }, [t("noteHint")]));
    }
    retryNoteBtn.style.display = note?.appreciation || busy ? "none" : "inline-block";
    resultText.append(retryNoteBtn);
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
  retryNoteBtn.addEventListener("click", () => void retryNote());
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
  void refreshSource(true);
  const pollTimer = window.setInterval(() => void refreshSource(), VIEW_POLL_MS);
  closeDialog = () => {
    window.clearInterval(pollTimer);
    panel.remove();
  };
}
function labeled(label, control) {
  return el("label", { style: LABEL_ROW }, [el("span", { style: LABEL_TEXT }, [label]), control]);
}
var PANEL = {
  position: "fixed",
  top: "60px",
  right: "16px",
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
  // 1 件が 2 行＋サムネイルになったぶん広げる。検索で絞る前提なのでこれで足りる。
  maxHeight: "260px",
  overflowY: "auto",
  border: "1px solid #dfe6ee",
  borderRadius: "3px",
  margin: "4px 0"
};
var ROW = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
  padding: "4px 6px",
  cursor: "pointer",
  borderBottom: "1px solid #f0f4f8"
};
var ROW_BODY = { minWidth: "0", flex: "1" };
var ROW_LINE1 = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
var ROW_LINE2 = {
  color: "#6b7785",
  fontSize: "11px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};
var THUMB = {
  width: "44px",
  height: "44px",
  flex: "0 0 auto",
  objectFit: "cover",
  borderRadius: "3px",
  border: "1px solid #dfe6ee",
  background: "#f4f7fa"
};
var THUMB_EMPTY = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#b9c6d4",
  fontSize: "14px"
};
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
var FIELD_LABEL_ROW = {
  color: "#5a6b7d",
  marginTop: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px"
};
var FIELD_VALUE = { whiteSpace: "pre-wrap", wordBreak: "break-word" };
var COPY_BTN = {
  padding: "1px 8px",
  fontSize: "11px",
  color: "#1f2a37",
  background: "#eef2f6",
  border: "1px solid #c7d0da",
  borderRadius: "3px",
  cursor: "pointer",
  whiteSpace: "nowrap"
};
var CHAR_OK = { color: "#6b7785", fontSize: "11px", marginTop: "2px" };
var CHAR_OVER = { color: "#b3261e", fontSize: "11px", marginTop: "2px" };
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
