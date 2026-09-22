/**
 * 署名（サイン）の合成。文字・位置・フォント・大きさを指定でき、**色は黒固定**。
 *
 * <p>フォントはバンドルしない。プラグインの配信物は `plugin.json` と `ui.js` だけで、
 * 追加アセットは配信されないうえ、本体の CSP は `font-src 'self'` なので外部フォントも
 * 読めない。そのため選べるのはシステムに載っているものだけになる。
 *
 * <p>⚠ **日本語の署名は OS によって字形が変わる。** Windows・macOS・Linux で
 * 同じ指定でも別の書体で描かれる。UI ではプレビューを必ず見せること。
 */

/** 9 分割の位置指定。 */
export type SignaturePosition =
  | "top-left" | "top-center" | "top-right"
  | "middle-left" | "middle-center" | "middle-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

export const SIGNATURE_POSITIONS: SignaturePosition[] = [
  "top-left", "top-center", "top-right",
  "middle-left", "middle-center", "middle-right",
  "bottom-left", "bottom-center", "bottom-right",
];

/** 選べるフォント。実体はシステム依存なのでスタックで指定する。 */
export const SIGNATURE_FONTS: { id: string; label: string; stack: string }[] = [
  { id: "serif", label: "Serif / 明朝", stack: "'Times New Roman', 'Hiragino Mincho ProN', 'Yu Mincho', serif" },
  { id: "sans", label: "Sans / ゴシック", stack: "'Helvetica Neue', Arial, 'Hiragino Sans', 'Yu Gothic', sans-serif" },
  { id: "script", label: "Script / 筆記体", stack: "'Segoe Script', 'Brush Script MT', cursive" },
  { id: "mono", label: "Monospace", stack: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" },
];

export const FONT_BY_ID = new Map(SIGNATURE_FONTS.map((f) => [f.id, f]));

export interface SignatureOptions {
  text: string;
  position: SignaturePosition;
  /** {@link SIGNATURE_FONTS} の id。 */
  fontId: string;
  /** 画像の短辺に対する文字高の割合（既定 0.04）。 */
  sizeRatio?: number;
  /** 画像の短辺に対する余白の割合（既定 0.03）。 */
  marginRatio?: number;
}

export interface SignaturePlacement {
  x: number;
  y: number;
  fontPx: number;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
}

/**
 * 描画位置を決める。**純関数**なので、canvas 無しで（＝テストで）検証できる。
 */
export function placeSignature(
  imageWidth: number,
  imageHeight: number,
  opts: SignatureOptions,
): SignaturePlacement {
  const shortEdge = Math.min(imageWidth, imageHeight);
  const fontPx = Math.max(8, Math.round(shortEdge * (opts.sizeRatio ?? 0.04)));
  const margin = Math.round(shortEdge * (opts.marginRatio ?? 0.03));

  const [vertical, horizontal] = opts.position.split("-") as [string, string];

  let x: number;
  let textAlign: CanvasTextAlign;
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

  let y: number;
  let textBaseline: CanvasTextBaseline;
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

/**
 * 署名を canvas へ焼き込む。**色は黒のみ**（仕様）。
 *
 * <p>白い画面では黒が読めなくなるため、ごく薄い白のハローを先に敷く。
 * これは色の指定ではなく可読性のための下地で、署名そのものは黒である。
 */
export function drawSignature(
  ctx: CanvasRenderingContext2D,
  imageWidth: number,
  imageHeight: number,
  opts: SignatureOptions,
): void {
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
