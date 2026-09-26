/**
 * Art of Imaging のダイアログ。
 *
 * <p>本体の `FourierDialog` に倣い、**モードレス＋ヘッダードラッグ**にしてある
 * （生成を待つあいだにビューアでスライスを送れるほうが自然なため）。
 * 背景の覆いは置かない。
 */
import type { PixelData, Viewer2DPluginHost, ViewerViewState } from "../hostTypes";
import { el, makeDraggable, stopWheelPropagation } from "./dom";
import { makeT, type Lang } from "../i18n/messages";
import { searchPainters, type Painter } from "../core/painters";
import { PAINTER_THUMBS } from "../core/thumbs";
import { STYLES, STYLE_BY_ID, type StyleId } from "../core/styles";
import {
  BODY_PART_TERMS,
  NOTE_MAX_CHARS,
  TITLE_MAX_CHARS,
  buildImagePrompt,
  buildNotePrompt,
} from "../core/prompt";
import {
  applyWindow,
  autoWindow,
  buildSourceImage,
  framingOutputSize,
  grayToRgba,
  resampleFraming,
  rgbaToPng,
  type Window as ViewWindow,
} from "../core/render";
import { SIGNATURE_FONTS, SIGNATURE_POSITIONS, drawSignature, type SignatureOptions, type SignaturePosition } from "../core/signature";
import { pHash, sha256Hex } from "../core/phash";
import { embedGraphyArt } from "../core/pngMeta";
import { buildMetadata, defaultFileName } from "../core/metadata";
import { readGeneration, type AppreciationNote } from "../core/parse";
import { copyText } from "./clipboard";

declare const __PLUGIN_VERSION__: string;

/**
 * モデルは**本体が決める**（利用者の環境設定に従う）。
 *
 * <p>🔑 このプラグインは用途（`capability`）を頼むだけにしてある。本体が提供元を増やしても
 * ここは書き換えなくてよい（本体の `fw/ai-routing-design.md`）。
 *
 * 🔴 **画像用とテキスト用は別のモデルになる。** `gemini-3.1-flash-image` は画像だけを返して
 * 地の文を返さず、実機で鑑賞文が丸ごと欠落した。用途を分けることで本体が別々に選ぶ。
 */
const CAPABILITY_ARTWORK = "image-to-image" as const;
const CAPABILITY_NOTE = "image-to-text" as const;

/**
 * メタデータに書くモデル名が本体から返らなかったときの値。
 *
 * <p>🔑 **これは推測ではない。** 0.3.0 の本体は `provenance` を返さないが、その版は
 * 環境設定のモデルを**読んでいなかった**ので、画像生成には必ずこのモデルが使われていた。
 * 0.3.1 以降は本体が実際に使ったモデルを返すので、そちらを優先する。
 *
 * <p>🔴 **分からないものを埋めるための既定値ではない。** 将来この前提が崩れるなら、
 * 空にする（記録が無いことを記録する）ほうが正しい。
 */
const ARTWORK_MODEL_ON_0_3_0 = "gemini-3.1-flash-image";

/**
 * 表示状態を見に行く間隔（ミリ秒）。
 *
 * <p>本体に「表示が変わった」を知らせる API が無い（`subscribeRois` だけ）ので、
 * ポーリングで拾う。`getViewState()` は同期読みで、**変化が無ければ何もしない**ため
 * 実質の負荷はこの比較だけ。人がドラッグして動かす速さに対しては 300ms で十分追いつく。
 */
const VIEW_POLL_MS = 300;

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
  /** 閉じる手順。ポーリングを止めてから外す（組み立ての最後で差し替える）。 */
  let closeDialog = (): void => undefined;
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
    el("button", { style: CLOSE_BTN, dataset: { testid: "art-close" }, onclick: () => closeDialog() }, ["✕"]),
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
      const thumb = PAINTER_THUMBS[p.id];
      // 🔴 **ラベルは絵に合わせる。** サムネイルがあるときは、works[0] ではなく
      //    その画像が実際に何の絵かを出す。1 点目のパブリックドメイン画像が
      //    見つからず 2 点目に落ちることがあり、works[0] を出すと
      //    「群鶏図」と書いてある隣に別の絵が並ぶ。
      const work = thumb ? { ja: thumb.workJa, en: thumb.workEn } : p.works[0];

      // サムネイルが無い画家は無地の枠を出す。**壊れた画像アイコンを出さない**し、
      // 別の絵で代用もしない（何が写っているか分からないものを見せない）。
      const figure = thumb
        ? el("img", { src: thumb.src, alt: "", style: THUMB, loading: "lazy" })
        : el("div", { style: { ...THUMB, ...THUMB_EMPTY } }, ["—"]);

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
          figure,
          el("div", { style: ROW_BODY }, [
            el("div", { style: ROW_LINE1 }, [
              el("span", { style: { fontWeight: "600" } }, [lang === "en" ? p.nameEn : p.nameJa]),
              el("span", { style: MUTED_INLINE }, [
                ` ${style ? (lang === "en" ? style.nameEn : style.nameJa) : p.styleId}`,
                p.died ? ` / ${p.died}` : p.note ? ` / ${p.note}` : "",
              ]),
            ]),
            // 2 行目に「代表作 — 作風」。名前だけでは何が出てくるか分からないため。
            el("div", { style: ROW_LINE2 }, [
              `${lang === "en" ? work.en : work.ja} — ${lang === "en" ? p.promptHint : p.styleJa}`,
            ]),
          ]),
        ],
      );
      painterList.appendChild(row);
    }
  }

  function renderSelected(): void {
    if (!selectedPainter) {
      selectedLabel.textContent = "";
    } else {
      const shown = PAINTER_THUMBS[selectedPainter.id];
      const w = shown ? { ja: shown.workJa, en: shown.workEn } : selectedPainter.works[0];
      const name = lang === "en" ? selectedPainter.nameEn : selectedPainter.nameJa;
      selectedLabel.textContent =
        `${t("selected")}: ${name}（${lang === "en" ? w.en : w.ja}）`;
    }
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
  /** 解説を作り直すときに使う。生成時の条件を覚えておく。 */
  let noteContext: { painter: Painter; modality: string; bodyPart: string; seriesUid: string } | null = null;
  const retryNoteBtn = el("button", {
    style: { ...BTN, display: "none", marginTop: "8px" },
    type: "button",
    dataset: { testid: "art-retry-note" },
  }, [t("retryNote")]) as HTMLButtonElement;

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
  const closeBtn = el("button", { style: BTN, dataset: { testid: "art-close-footer" }, onclick: () => closeDialog() }, [t("close")]);

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
  /** 取り直しを避けるため、画素はスライス単位で持っておく。 */
  let cachedPixels: PixelData | null = null;
  /** 直前に作ったときの表示状態。同じなら何もしない。 */
  let lastSignature = "";
  /** 再構築の多重実行よけ。 */
  let rebuilding = false;

  /**
   * 表示状態の指紋。**これが変わったときだけ**作り直す。
   *
   * <p>四隅は小数第 2 位で丸める。パンの途中は連続的に動くので、丸めないと
   * 1 フレームごとに作り直しが走る。
   */
  function viewSignature(view: ViewerViewState | null, imageId: string): string {
    if (!view) return imageId;
    const r = view.visibleRegion;
    return [
      imageId,
      view.windowCenter,
      view.windowWidth,
      view.invert,
      r ? r.corners.map((c) => `${c[0].toFixed(2)},${c[1].toFixed(2)}`).join(";") : "-",
      r ? `${Math.round(r.screenWidth)}x${Math.round(r.screenHeight)}` : "-",
    ].join("|");
  }

  /**
   * 範囲外を埋める値。**窓処理したあと黒になる側**を選ぶ。
   * 階調反転しているときに下端を渡すと白くなり、画面の黒帯と食い違う。
   */
  function backgroundValue(win: ViewWindow): number {
    const half = (win.width > 0 ? win.width : 1) / 2;
    return win.invert ? win.center + half : win.center - half;
  }

  /**
   * 画面の見え方を送信画像へ写す。
   *
   * @param force 表示状態が同じでも作り直す（初回）
   */
  async function refreshSource(force = false): Promise<void> {
    // 生成中は触らない。送信中に元画像が差し替わると、メタデータに記録した
    // ハッシュと実際に送ったものが食い違う。
    if (rebuilding || busy) return;

    const target = host.getTargets()[0];
    if (!target) {
      if (force) setStatus(t("errNoTarget"), "error");
      return;
    }
    const view = host.getViewState(target.tileId);
    const signature = viewSignature(view, target.imageId);
    if (!force && signature === lastSignature) return;

    rebuilding = true;
    try {
      // 画素の取り直しはスライスが変わったときだけ（非同期で重い）。
      // W/L や回転・拡大の変更は、持っている画素から作り直せる。
      if (!cachedPixels || cachedPixels.imageId !== target.imageId) {
        cachedPixels = await host.getPixelData(target.tileId);
      }
      const pixels = cachedPixels;
      if (!pixels) {
        if (force) setStatus(t("errNoPixels"), "error");
        return;
      }

      // W/L は視覚モデルに渡すので意図的に適用する。取れなければ 2–98 パーセンタイルで代用。
      const win =
        view && view.windowWidth > 0
          ? { center: view.windowCenter, width: view.windowWidth, invert: view.invert }
          : autoWindow(pixels.data);

      // 🔑 回転・反転・拡大・パンは `visibleRegion` の四隅に畳み込まれている。
      //    本体が出せなかったとき（null）は画像全体へ落ちる——**機能が増えたせいで
      //    今まで動いていたものが動かなくなる、を避ける**。
      const region = view?.visibleRegion;
      let values = pixels.data;
      let width = pixels.cols;
      let height = pixels.rows;
      if (region && region.corners.length === 4) {
        const size = framingOutputSize(region, 1024);
        values = resampleFraming(
          pixels.data, pixels.cols, pixels.rows, region, size.width, size.height, backgroundValue(win),
        );
        width = size.width;
        height = size.height;
      }

      const built = await buildSourceImage(values, width, height, win);
      sourcePng = built.png;
      // 🔴 ハッシュは**実際に送る画素**で取る。全体画像で取ると、記録と送信物が食い違う。
      sourceSha = await sha256Hex(grayToRgba(applyWindow(values, win)));
      sourceImg.src = URL.createObjectURL(new Blob([built.png as BlobPart], { type: "image/png" }));
      modalityLabel.textContent = `${t("resultModality")}: ${target.modality || "-"}`;
      lastSignature = signature;
      updateButtons();
    } finally {
      rebuilding = false;
    }
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
      const prompt = buildImagePrompt({
        painter: selectedPainter,
        facts: { modality, bodyPart },
        locale: lang,
      });
      const outcome = await host.ai.generate({
        capability: CAPABILITY_ARTWORK,
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

      const parsed = readGeneration(outcome);
      if (!parsed.image) {
        const reason = parsed.blockReason;
        setStatus(reason ? t("errBlocked", { reason }) : t("errNoImage"), "error");
        return;
      }

      artwork = await composeArtwork(parsed.image, selectedPainter, signature);
      const meta = buildMetadata({
        appVersion: "",
        pluginVersion: typeof __PLUGIN_VERSION__ === "string" ? __PLUGIN_VERSION__ : "",
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
        pHash: pHash(artwork.rgba, artwork.width, artwork.height),
      });
      artwork.png = embedGraphyArt(artwork.png, meta);

      // 🔴 解説は**作品が出来てから**、テキストモデルに作品そのものを見せて書かせる。
      //    画像モデルは地の文を返さないので、同じ応答から取ろうとすると空になる。
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

  /**
   * 出来上がった作品を送って、鑑賞のための解説を書かせる。
   *
   * 🔴 **ここで失敗しても作品を失わせない。** 同意を断られても、遮断されても、
   * 鍵が無くても、画像は表示されたままで保存できる。解説が無いことより、
   * 出来た絵が消えることのほうが利用者にとって重い損失。
   *
   * @return 取れた鑑賞情報。取れなければ null（理由は状態表示に出す）
   */
  async function generateNote(): Promise<AppreciationNote | null> {
    if (!artwork || !noteContext) return null;
    const ctx = noteContext;

    const outcome = await host.ai.generate({
      capability: CAPABILITY_NOTE,
      prompt: buildNotePrompt({
        painter: ctx.painter,
        facts: { modality: ctx.modality, bodyPart: ctx.bodyPart },
        locale: lang,
      }),
      // 送るのは**生成した作品**。元画像を二度送らずに済み、実物を見て書ける。
      imageBytes: artwork.png,
      mimeType: "image/png",
      // 画像を返させない。文章だけでよい。
      responseModalities: ["TEXT"],
      // 1 回目と同じ単位。「記憶する」に印が付いていれば同意は再掲されない。
      scopeKey: ctx.seriesUid,
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

  /** 解説だけを作り直す。画像はそのまま。 */
  async function retryNote(): Promise<void> {
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

  /**
   * コピーボタン。押したら表示を「コピーしました」に変え、2 秒で戻す。
   *
   * <p>成否は**ボタンと状態表示の両方**に出す。ボタンだけだと、目を離していた
   * 利用者に何も伝わらない。
   */
  function copyButton(label: string, okStatus: string, getText: () => string): HTMLButtonElement {
    const btn = el("button", { style: COPY_BTN, type: "button" }, [label]) as HTMLButtonElement;
    btn.addEventListener("click", () => {
      const text = getText();
      if (!text) return;
      void copyText(text)
        .then(() => {
          btn.textContent = t("copied");
          setStatus(okStatus, "ok");
        })
        .catch(() => {
          btn.textContent = t("copyFailed");
          setStatus(t("copyFailedStatus"), "error");
        })
        .then(() => {
          window.setTimeout(() => {
            btn.textContent = label;
          }, 2000);
        });
    });
    return btn;
  }

  /**
   * 文字数の表示。投稿先の上限を超えていたら色で知らせる。
   *
   * 🔴 **勝手に切り詰めない。** 文の途中で切れた文章を貼らせるより、超えたことを
   * 見せて直してもらうほうがよい。
   */
  function charCount(text: string, max: number): HTMLElement {
    const n = [...text].length;
    const over = n > max;
    return el(
      "div",
      { style: over ? CHAR_OVER : CHAR_OK },
      [t(over ? "charOver" : "charCount", { n: String(n), max: String(max) })],
    );
  }

  /** 一行ぶんの「見出し＋本文＋コピー」。本文が空なら `-` を出してコピーは置かない。 */
  function noteField(
    label: string,
    value: string,
    max: number,
    okStatus: string,
    testid: string,
  ): HTMLElement[] {
    if (!value) {
      return [
        el("div", { style: FIELD_LABEL }, [label]),
        el("div", { style: FIELD_VALUE, dataset: { testid } }, ["-"]),
      ];
    }
    return [
      el("div", { style: FIELD_LABEL_ROW }, [
        el("span", {}, [label]),
        copyButton(t("copy"), okStatus, () => value),
      ]),
      el("div", { style: FIELD_VALUE, dataset: { testid } }, [value]),
      charCount(value, max),
    ];
  }

  function showResult(art: GeneratedArtwork, note: AppreciationNote | null, modality: string): void {
    resultImg.src = URL.createObjectURL(new Blob([art.png as BlobPart], { type: "image/png" }));
    resultText.textContent = "";
    resultText.append(
      // 🔴 モダリティはローカルの DICOM 値を正とする。AI の出力で上書きしない。
      el("div", { style: FIELD_LABEL }, [t("resultModality")]),
      el("div", { style: FIELD_VALUE, dataset: { testid: "art-result-modality" } }, [modality || "-"]),
      el("div", { style: MUTED }, [t("modalityNote")]),
      ...noteField(t("resultTitle"), note?.title ?? "", TITLE_MAX_CHARS, t("copiedTitle"), "art-result-title"),
      ...noteField(t("resultAppreciation"), note?.appreciation ?? "", NOTE_MAX_CHARS, t("copiedNote"), "art-result-note"),
      // 🔴 注意書きは末尾ではなく内容の直後に置く（本体 analysisResults.ts の規範）。
      el("div", { style: CAVEAT, dataset: { testid: "art-caveat" } }, [t("caveat")]),
    );
    if (note?.appreciation) {
      resultText.append(el("div", { style: MUTED }, [t("noteHint")]));
    }
    // 解説が取れなかったときだけ、作り直す手立てを出す。
    // 🔴 生成中は出さない。状態表示が「解説を生成中…」なのに
    //    「作り直す」が並ぶと、何が起きているのか読めなくなる。
    retryNoteBtn.style.display = note?.appreciation || busy ? "none" : "inline-block";
    resultText.append(retryNoteBtn);
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
  retryNoteBtn.addEventListener("click", () => void retryNote());
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
  void refreshSource(true);

  // ビューアで回転・拡大・パン・W/L を変えたら、送信画像もそれに合わせる。
  // 🔴 **必ず止める。** ダイアログを閉じても回り続けると、閉じたあとも
  //    `getPixelData` を呼ぶことになり、しかも誰も気付けない。
  const pollTimer = window.setInterval(() => void refreshSource(), VIEW_POLL_MS);
  closeDialog = () => {
    window.clearInterval(pollTimer);
    panel.remove();
  };
}

function labeled(label: string, control: HTMLElement): HTMLElement {
  return el("label", { style: LABEL_ROW }, [el("span", { style: LABEL_TEXT }, [label]), control]);
}

// ── スタイル ─────────────────────────────────────────────────────────────
/**
 * パネルの位置。
 *
 * <p>🔴 **画像の真ん中に置かない。** 以前は `left:50%` で中央に出していたが、ビューアの画像も
 * 中央に描かれるため、**パネルが画像をほぼ覆ってしまう**。この機能は「画面で構図を決めて、
 * それを送る」ものなので、覆われると**構図を決める操作そのものができない**
 * ——拡大しようとドラッグしてもパネルを掴むだけで、ビューアは 1 ミリも動かない。
 *
 * <p>2026-09-24 に利用者から「拡大・パンニングが Image to be sent に引き継がれない」と
 * 報告された。実機で測ると切り出し自体は正しく追従しており（automator の
 * `viewStateFramingCheck` が 9/9）、**掴めていなかったのが実体**だった。
 * 右端へ寄せて画像を空ける。足りなければヘッダでドラッグして動かせる。
 */
const PANEL: Partial<CSSStyleDeclaration> = {
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
  // 1 件が 2 行＋サムネイルになったぶん広げる。検索で絞る前提なのでこれで足りる。
  maxHeight: "260px",
  overflowY: "auto",
  border: "1px solid #dfe6ee",
  borderRadius: "3px",
  margin: "4px 0",
};
const ROW: Partial<CSSStyleDeclaration> = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
  padding: "4px 6px",
  cursor: "pointer",
  borderBottom: "1px solid #f0f4f8",
};
// flex の子は既定で縮まないので、明示的に 0 にしないと長い作風説明で行が溢れる。
const ROW_BODY: Partial<CSSStyleDeclaration> = { minWidth: "0", flex: "1" };
const ROW_LINE1: Partial<CSSStyleDeclaration> = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const ROW_LINE2: Partial<CSSStyleDeclaration> = {
  color: "#6b7785",
  fontSize: "11px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
const THUMB: Partial<CSSStyleDeclaration> = {
  width: "44px",
  height: "44px",
  flex: "0 0 auto",
  objectFit: "cover",
  borderRadius: "3px",
  border: "1px solid #dfe6ee",
  background: "#f4f7fa",
};
const THUMB_EMPTY: Partial<CSSStyleDeclaration> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#b9c6d4",
  fontSize: "14px",
};
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
/** 見出しとコピーボタンを同じ行に置く。ボタンは見出しの右端へ寄せる。 */
const FIELD_LABEL_ROW: Partial<CSSStyleDeclaration> = {
  color: "#5a6b7d",
  marginTop: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
};
const FIELD_VALUE: Partial<CSSStyleDeclaration> = { whiteSpace: "pre-wrap", wordBreak: "break-word" };
const COPY_BTN: Partial<CSSStyleDeclaration> = {
  padding: "1px 8px",
  fontSize: "11px",
  color: "#1f2a37",
  background: "#eef2f6",
  border: "1px solid #c7d0da",
  borderRadius: "3px",
  cursor: "pointer",
  whiteSpace: "nowrap",
};
const CHAR_OK: Partial<CSSStyleDeclaration> = { color: "#6b7785", fontSize: "11px", marginTop: "2px" };
/** 上限超過。投稿時に弾かれるので、見て分かる色にする。 */
const CHAR_OVER: Partial<CSSStyleDeclaration> = { color: "#b3261e", fontSize: "11px", marginTop: "2px" };
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
