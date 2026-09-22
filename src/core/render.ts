/**
 * 校正済みモダリティ値（HU など）→ 表示 8-bit RGB。
 *
 * <h3>なぜ canvas を読み取らないのか</h3>
 * 表示中のキャンバスを `toDataURL` で掴む方法は 2 つの理由で採らない。
 *   1. `preserveDrawingBuffer=false` のとき空になり得る（本体側にも注意書きがある）。
 *   2. **オーバーレイ（患者名・スケールバー）は DOM の別要素**なので、掴めるかどうかが
 *      実装の都合で変わる。画素から自前で描けば、患者情報が入り込む経路が構造的に消える。
 *
 * <p>したがって W/L は本体の `applyWindow` と同じ式で自前に掛ける
 * （視覚モデルに渡すので、W/L は意図的に適用する）。
 */

export interface Window {
  center: number;
  width: number;
  invert?: boolean;
}

/**
 * 線形の窓処理で 0..255 に落とす。本体 `frontend/src/viewer/xaFrameExport.ts#applyWindow` と同一の式。
 * **この式を勝手に変えないこと**（本体の書き出しと見た目が食い違う）。
 */
export function applyWindow(values: Float32Array, win: Window): Uint8ClampedArray {
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

/**
 * W/L が取れないときの保険。2–98 パーセンタイルで窓を作る。
 * 本体 `autoWindow` と同じ考え方（外れ値で窓が潰れるのを避ける）。
 */
export function autoWindow(values: Float32Array): Window {
  const finite: number[] = [];
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

/** グレースケール 8-bit を RGBA へ広げる（不透明）。 */
export function grayToRgba(gray: Uint8ClampedArray): Uint8ClampedArray {
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

/**
 * `ImageData` は `ArrayBuffer` 実体を持つ配列しか受け取らない（`ArrayBufferLike` は不可）ので、
 * 新しいバッファへ詰め替える。
 */
function toImageData(rgba: Uint8ClampedArray, width: number, height: number): ImageData {
  const copy = new Uint8ClampedArray(new ArrayBuffer(rgba.length));
  copy.set(rgba);
  return new ImageData(copy, width, height);
}

/** RGBA を canvas に載せて PNG バイト列にする（ブラウザ専用）。 */
export async function rgbaToPng(rgba: Uint8ClampedArray, width: number, height: number): Promise<Uint8Array> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D コンテキストを取得できませんでした");
  ctx.putImageData(toImageData(rgba, width, height), 0, 0);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("PNG へのエンコードに失敗しました");
  return new Uint8Array(await blob.arrayBuffer());
}

/**
 * 送信用の画像を作る。長辺を `maxEdge` に収める（帯域と課金、そして送りすぎの抑制）。
 * 縮小は最近傍ではなく canvas の既定補間に任せる。
 */
export async function buildSourceImage(
  values: Float32Array,
  width: number,
  height: number,
  win: Window,
  maxEdge = 1024,
): Promise<{ png: Uint8Array; width: number; height: number }> {
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
  if (!sctx) throw new Error("2D コンテキストを取得できませんでした");
  sctx.putImageData(toImageData(rgba, width, height), 0, 0);

  const dst = document.createElement("canvas");
  dst.width = dw;
  dst.height = dh;
  const dctx = dst.getContext("2d");
  if (!dctx) throw new Error("2D コンテキストを取得できませんでした");
  dctx.imageSmoothingQuality = "high";
  dctx.drawImage(src, 0, 0, dw, dh);

  const blob = await new Promise<Blob | null>((resolve) => dst.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("PNG へのエンコードに失敗しました");
  return { png: new Uint8Array(await blob.arrayBuffer()), width: dw, height: dh };
}
