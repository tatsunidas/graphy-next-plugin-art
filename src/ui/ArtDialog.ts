/**
 * Art of Imaging のダイアログ。
 *
 * <p>本体の `FourierDialog` に倣い、**モードレス＋ヘッダードラッグ**にしてある
 * （生成を待つあいだにビューアでスライスを送れるほうが自然なため）。
 * 背景の覆いは置かない。
 */
import type { Viewer2DPluginHost } from "../hostTypes";
import { el, makeDraggable, stopWheelPropagation } from "./dom";
import { makeT, type Lang } from "../i18n/messages";
import { searchPainters, type Painter } from "../core/painters";
import { STYLES, STYLE_BY_ID, type StyleId } from "../core/styles";
import { BODY_PART_TERMS, buildPrompt } from "../core/prompt";
import { applyWindow, autoWindow, buildSourceImage, grayToRgba, rgbaToPng } from "../core/render";
import { SIGNATURE_FONTS, SIGNATURE_POSITIONS, drawSignature, type SignatureOptions, type SignaturePosition } from "../core/signature";
import { pHash, sha256Hex } from "../core/phash";
import { embedGraphyArt } from "../core/pngMeta";
import { buildMetadata, defaultFileName } from "../core/metadata";
import { parseGeneration, readBlockReason } from "../core/parse";

declare const __PLUGIN_VERSION__: string;

const MODEL_FALLBACK = "gemini-3.1-flash-image";

interface GeneratedArtwork {
  /** 署名を焼き込んだ最終 RGBA。 */
  rgba: Uint8ClampedArray;
  width: number;
  height: number;
  /** メタデータを埋め込んだ PNG。 */
  png: Uint8Array;
  painterId: string;
}

export function openArtDialog(host: Viewer2DPluginHost): void {
  const t = makeT(host.locale as Lang);
  const lang: Lang = host.locale === "en" ? "en" : "ja";

  // ── 状態 ───────────────────────────────────────────────────────────────
  let styleFilter: StyleId | "" = "";
  let query = "";
  let selectedPainter: Painter | null = null;
  let busy = false;
  let sourcePng: Uint8Array | null = null;
  let sourceSha = "";
  let artwork: GeneratedArtwork | null = null;

  const signature: SignatureOptions = {
    text: "",
    position: "bottom-right",
    fontId: "serif",
    sizeRatio: 0.04,
  };

  // ── 骨格 ───────────────────────────────────────────────────────────────
  const panel = el("div", { style: PANEL, dataset: { testid: "art-dialog" } });
  const header = el("div", { style: HEADER }, [
    el("div", {}, [
      el("div", { style: { fontWeight: "600" } }, [t("title")]),
      el("div", { style: { fontSize: "11px", opacity: "0.85" } }, [t("subtitle")]),
    ]),
    el("button", { style: CLOSE_BTN, dataset: { testid: "art-close" }, onclick: () => panel.remove() }, ["✕"]),
  ]);
  const body = el("div", { style: BODY });
  const footer = el("div", { style: FOOTER });
  panel.append(header, body, footer);
  makeDraggable(panel, header);
  stopWheelPropagation(panel);

  const status = el("div", { style: STATUS, dataset: { testid: "art-status" } });

  // ── 1. 作風と画家 ───────────────────────────────────────────────────────
  const styleSelect = el("select", { style: INPUT, dataset: { testid: "art-style" } }, [
    el("option", { value: "" }, [t("styleAll")]),
    ...STYLES.map((s) => el("option", { value: s.id }, [lang === "en" ? s.nameEn : s.nameJa])),
  ]) as HTMLSelectElement;
  const searchInput = el("input", {
    style: INPUT,
    type: "text",
    spellcheck: false,
    placeholder: t("searchPainter"),
    dataset: { testid: "art-painter-search" },
  }) as HTMLInputElement;
  const painterList = el("div", { style: LIST, dataset: { testid: "art-painter-list" } });
  const selectedLabel = el("div", { style: SELECTED, dataset: { testid: "art-painter-selected" } });

  function renderPainters(): void {
    painterList.textContent = "";
    const hits = searchPainters(query, styleFilter || undefined);
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
            // 🔴 1 名のみ選択。複数選ぶと様式が混ざって作品として成立しない。
            selectedPainter = p;
            renderPainters();
            renderSelected();
          },
        },
        [
          el("span", {}, [lang === "en" ? p.nameEn : p.nameJa]),
          el("span", { style: MUTED_INLINE }, [
            ` ${style ? (lang === "en" ? style.nameEn : style.nameJa) : p.styleId}`,
            p.died ? ` / ${p.died}` : p.note ? ` / ${p.note}` : "",
          ]),
        ],
      );
      painterList.appendChild(row);
    }
  }

  function renderSelected(): void {
    selectedLabel.textContent = selectedPainter
      ? `${t("selected")}: ${lang === "en" ? selectedPainter.nameEn : selectedPainter.nameJa}`
      : "";
    updateButtons();
  }

  styleSelect.addEventListener("change", () => {
    styleFilter = styleSelect.value as StyleId | "";
    renderPainters();
  });
  searchInput.addEventListener("input", () => {
    query = searchInput.value;
    renderPainters();
  });

  // ── 2. サイン ──────────────────────────────────────────────────────────
  const sigText = el("input", {
    style: INPUT,
    type: "text",
    placeholder: "T. Kobayashi",
    dataset: { testid: "art-signature-text" },
  }) as HTMLInputElement;
  const sigPosition = el(
    "select",
    { style: INPUT, dataset: { testid: "art-signature-position" } },
    SIGNATURE_POSITIONS.map((p) => el("option", { value: p }, [p])),
  ) as HTMLSelectElement;
  sigPosition.value = signature.position;
  const sigFont = el(
    "select",
    { style: INPUT, dataset: { testid: "art-signature-font" } },
    SIGNATURE_FONTS.map((f) => el("option", { value: f.id }, [f.label])),
  ) as HTMLSelectElement;
  const sigSize = el("input", {
    style: INPUT,
    type: "range",
    min: "2",
    max: "10",
    value: "4",
    dataset: { testid: "art-signature-size" },
  }) as HTMLInputElement;

  const sigPreview = el("canvas", { style: SIG_PREVIEW, width: 260, height: 60 }) as HTMLCanvasElement;

  function readSignature(): void {
    signature.text = sigText.value;
    signature.position = sigPosition.value as SignaturePosition;
    signature.fontId = sigFont.value;
    signature.sizeRatio = Number(sigSize.value) / 100;
  }

  function renderSignaturePreview(): void {
    readSignature();
    const ctx = sigPreview.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#e9eef4";
    ctx.fillRect(0, 0, sigPreview.width, sigPreview.height);
    // プレビューでは位置ではなく「字形と大きさ」を見せたいので中央に描く。
    drawSignature(ctx, sigPreview.width, sigPreview.height, {
      ...signature,
      position: "middle-center",
      sizeRatio: (signature.sizeRatio ?? 0.04) * 8,
    });
  }
  for (const input of [sigText, sigPosition, sigFont, sigSize]) {
    input.addEventListener("input", renderSignaturePreview);
    input.addEventListener("change", renderSignaturePreview);
  }

  // ── 3. 元画像 ──────────────────────────────────────────────────────────
  const bodyPartSelect = el("select", { style: INPUT, dataset: { testid: "art-bodypart" } }, [
    el("option", { value: "" }, [t("bodyPartNone")]),
    ...BODY_PART_TERMS.map((b) => el("option", { value: b }, [b])),
  ]) as HTMLSelectElement;
  const sourceImg = el("img", { style: PREVIEW_IMG, alt: "", dataset: { testid: "art-source-preview" } }) as HTMLImageElement;
  const modalityLabel = el("div", { style: MUTED });

  // ── 結果 ───────────────────────────────────────────────────────────────
  const resultImg = el("img", { style: RESULT_IMG, alt: "", dataset: { testid: "art-result-image" } }) as HTMLImageElement;
  const resultText = el("div", { style: RESULT_TEXT, dataset: { testid: "art-result-text" } });
  const resultBox = el("div", { style: { ...SECTION, display: "none" }, dataset: { testid: "art-result" } }, [
    el("h3", { style: H3 }, [t("result")]),
    el("div", { style: TWO_COL }, [
      el("div", { style: { flex: "0 0 auto" } }, [resultImg]),
      resultText,
    ]),
  ]);

  // ── ボタン ─────────────────────────────────────────────────────────────
  const generateBtn = el("button", { style: PRIMARY_BTN, dataset: { testid: "art-generate" } }, [t("generate")]) as HTMLButtonElement;
  const saveBtn = el("button", { style: BTN, dataset: { testid: "art-save" } }, [t("save")]) as HTMLButtonElement;
  const closeBtn = el("button", { style: BTN, dataset: { testid: "art-close-footer" }, onclick: () => panel.remove() }, [t("close")]);

  function updateButtons(): void {
    generateBtn.disabled = busy || !selectedPainter || !sourcePng;
    generateBtn.textContent = busy ? t("generating") : t("generate");
    saveBtn.disabled = busy || !artwork;
    for (const c of [styleSelect, searchInput, sigText, sigPosition, sigFont, sigSize, bodyPartSelect]) {
      (c as HTMLInputElement).disabled = busy;
    }
  }

  function setStatus(message: string, kind: "info" | "error" | "ok" = "info"): void {
    status.textContent = message;
    status.style.color = kind === "error" ? "#b00020" : kind === "ok" ? "#2e7d32" : "#5a6b7d";
  }

  // ── 元画像の準備 ───────────────────────────────────────────────────────
  async function prepareSource(): Promise<void> {
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
    // W/L は視覚モデルに渡すので意図的に適用する。取れなければ 2–98 パーセンタイルで代用。
    const win =
      view && view.windowWidth > 0
        ? { center: view.windowCenter, width: view.windowWidth, invert: view.invert }
        : autoWindow(pixels.data);

    const built = await buildSourceImage(pixels.data, pixels.cols, pixels.rows, win);
    sourcePng = built.png;
    sourceSha = await sha256Hex(grayToRgba(applyWindow(pixels.data, win)));
    sourceImg.src = URL.createObjectURL(new Blob([built.png as BlobPart], { type: "image/png" }));
    modalityLabel.textContent = `${t("resultModality")}: ${target.modality || "-"}`;
    updateButtons();
  }

  // ── 生成 ───────────────────────────────────────────────────────────────
  async function generate(): Promise<void> {
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
        locale: lang,
      });
      const model = MODEL_FALLBACK;

      const outcome = await host.ai.generate({
        model,
        prompt,
        imageBytes: sourcePng,
        mimeType: "image/png",
        // 同意はシリーズ単位で覚える。別シリーズに移ったら必ず出し直す。
        scopeKey: target.seriesUid,
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
        pluginVersion: typeof __PLUGIN_VERSION__ === "string" ? __PLUGIN_VERSION__ : "",
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
        pHash: pHash(artwork.rgba, artwork.width, artwork.height),
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

  function errorMessage(code: string): string {
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

  /** 生成画像に署名を焼き込み、PNG に戻す。 */
  async function composeArtwork(
    imageBytes: Uint8Array,
    painter: Painter,
    sig: SignatureOptions,
  ): Promise<GeneratedArtwork> {
    const bitmap = await createImageBitmap(new Blob([imageBytes as BlobPart]));
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D コンテキストを取得できませんでした");
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    drawSignature(ctx, canvas.width, canvas.height, sig);

    const rgba = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const png = await rgbaToPng(rgba, canvas.width, canvas.height);
    return { rgba, width: canvas.width, height: canvas.height, png, painterId: painter.id };
  }

  function showResult(art: GeneratedArtwork, note: { subject: string; appreciation: string } | null, modality: string): void {
    resultImg.src = URL.createObjectURL(new Blob([art.png as BlobPart], { type: "image/png" }));
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
      el("div", { style: CAVEAT, dataset: { testid: "art-caveat" } }, [t("caveat")]),
    );
    (resultBox as HTMLElement).style.display = "block";
  }

  // ── 保存 ───────────────────────────────────────────────────────────────
  async function save(): Promise<void> {
    if (!artwork) return;
    const result = await host.file.saveAs({
      defaultName: defaultFileName(artwork.painterId),
      bytes: artwork.png,
      filters: [{ name: "PNG", extensions: ["png"] }],
    });
    if (result.ok) setStatus(t("saved", { path: result.filePath }), "ok");
    else if (!result.canceled) setStatus(t("saveFailed", { error: result.error ?? "" }), "error");
  }

  generateBtn.addEventListener("click", () => void generate());
  saveBtn.addEventListener("click", () => void save());

  // ── 組み立て ───────────────────────────────────────────────────────────
  body.append(
    el("div", { style: SECTION }, [
      el("h3", { style: H3 }, [t("step1")]),
      labeled(t("style"), styleSelect),
      searchInput,
      painterList,
      selectedLabel,
      el("div", { style: MUTED }, [t("pdNote")]),
    ]),
    el("div", { style: SECTION }, [
      el("h3", { style: H3 }, [t("step2")]),
      labeled(t("signatureText"), sigText),
      labeled(t("signaturePosition"), sigPosition),
      labeled(t("signatureFont"), sigFont),
      labeled(t("signatureSize"), sigSize),
      sigPreview,
      el("div", { style: MUTED }, [t("signatureColorNote")]),
    ]),
    el("div", { style: SECTION }, [
      el("h3", { style: H3 }, [t("step3")]),
      labeled(t("bodyPart"), bodyPartSelect),
      el("div", { style: MUTED }, [t("bodyPartNote")]),
      el("div", { style: FIELD_LABEL }, [t("sourcePreview")]),
      sourceImg,
      modalityLabel,
    ]),
    resultBox,
    el("div", { style: PRIVACY, dataset: { testid: "art-privacy" } }, [
      el("div", { style: { fontWeight: "600" } }, [t("privacyTitle")]),
      el("div", {}, [`・${t("privacy1")}`]),
      el("div", {}, [`・${t("privacy2")}`]),
      el("div", {}, [`・${t("privacy3")}`]),
    ]),
  );
  footer.append(status, el("div", { style: { flex: "1" } }), closeBtn, saveBtn, generateBtn);

  document.body.appendChild(panel);
  renderPainters();
  renderSelected();
  renderSignaturePreview();
  updateButtons();
  void prepareSource();
}

function labeled(label: string, control: HTMLElement): HTMLElement {
  return el("label", { style: LABEL_ROW }, [el("span", { style: LABEL_TEXT }, [label]), control]);
}

// ── スタイル ─────────────────────────────────────────────────────────────
const PANEL: Partial<CSSStyleDeclaration> = {
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
  font: "12px system-ui, sans-serif",
};
const HEADER: Partial<CSSStyleDeclaration> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 12px",
  background: "#0b5cad",
  color: "#fff",
  borderRadius: "5px 5px 0 0",
};
const BODY: Partial<CSSStyleDeclaration> = { padding: "12px", overflowY: "auto", minHeight: "0", flex: "1" };
const FOOTER: Partial<CSSStyleDeclaration> = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  borderTop: "1px solid #dfe6ee",
};
const SECTION: Partial<CSSStyleDeclaration> = { marginBottom: "16px" };
const H3: Partial<CSSStyleDeclaration> = {
  fontSize: "12px",
  margin: "0 0 6px",
  paddingBottom: "3px",
  borderBottom: "1px solid #dfe6ee",
  color: "#5a6b7d",
};
const LABEL_ROW: Partial<CSSStyleDeclaration> = { display: "flex", alignItems: "center", gap: "8px", margin: "4px 0" };
const LABEL_TEXT: Partial<CSSStyleDeclaration> = { width: "110px", flex: "0 0 auto", color: "#5a6b7d" };
const INPUT: Partial<CSSStyleDeclaration> = {
  flex: "1",
  minWidth: "0",
  padding: "3px 6px",
  fontSize: "12px",
  border: "1px solid #b9c6d4",
  borderRadius: "3px",
};
const LIST: Partial<CSSStyleDeclaration> = {
  maxHeight: "170px",
  overflowY: "auto",
  border: "1px solid #dfe6ee",
  borderRadius: "3px",
  margin: "4px 0",
};
const ROW: Partial<CSSStyleDeclaration> = { padding: "3px 6px", cursor: "pointer" };
const SELECTED: Partial<CSSStyleDeclaration> = { fontWeight: "600", margin: "2px 0" };
const MUTED: Partial<CSSStyleDeclaration> = { color: "#6b7785", fontSize: "11px", margin: "2px 0" };
const MUTED_INLINE: Partial<CSSStyleDeclaration> = { color: "#6b7785" };
const SIG_PREVIEW: Partial<CSSStyleDeclaration> = { border: "1px solid #dfe6ee", borderRadius: "3px", margin: "4px 0" };
const PREVIEW_IMG: Partial<CSSStyleDeclaration> = {
  maxWidth: "200px",
  maxHeight: "200px",
  background: "#000",
  border: "1px solid #b9c6d4",
  display: "block",
};
const RESULT_IMG: Partial<CSSStyleDeclaration> = {
  width: "240px",
  maxHeight: "300px",
  objectFit: "contain",
  background: "#000",
  border: "1px solid #b9c6d4",
  display: "block",
};
const TWO_COL: Partial<CSSStyleDeclaration> = { display: "flex", gap: "12px", alignItems: "flex-start" };
// flex の子で折り返しを効かせるための minWidth:0（この repo で繰り返し踏まれている罠）。
const RESULT_TEXT: Partial<CSSStyleDeclaration> = { flex: "1", minWidth: "0" };
const FIELD_LABEL: Partial<CSSStyleDeclaration> = { color: "#5a6b7d", marginTop: "6px" };
const FIELD_VALUE: Partial<CSSStyleDeclaration> = { whiteSpace: "pre-wrap", wordBreak: "break-word" };
const CAVEAT: Partial<CSSStyleDeclaration> = {
  marginTop: "8px",
  padding: "6px 8px",
  background: "#fff6e5",
  borderLeft: "3px solid #8a4b00",
  color: "#8a4b00",
};
const PRIVACY: Partial<CSSStyleDeclaration> = {
  padding: "8px",
  background: "#fff6e5",
  border: "1px solid #f0d9b5",
  borderRadius: "3px",
  color: "#8a4b00",
  lineHeight: "1.6",
};
const STATUS: Partial<CSSStyleDeclaration> = { fontSize: "11px", maxWidth: "260px" };
const BTN: Partial<CSSStyleDeclaration> = {
  padding: "4px 12px",
  fontSize: "12px",
  border: "1px solid #b9c6d4",
  borderRadius: "3px",
  background: "#f4f7fa",
  cursor: "pointer",
};
const PRIMARY_BTN: Partial<CSSStyleDeclaration> = { ...BTN, background: "#0b5cad", borderColor: "#0b5cad", color: "#fff" };
const CLOSE_BTN: Partial<CSSStyleDeclaration> = {
  background: "transparent",
  border: "none",
  color: "#fff",
  fontSize: "14px",
  cursor: "pointer",
};
