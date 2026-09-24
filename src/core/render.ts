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

/** 画面に見えている範囲（`hostTypes.VisibleRegion` と同じ形。core は host に依存しない）。 */
export interface Framing {
  /** 四隅の画像画素座標。画面から見た 左上・右上・左下・右下。 */
  corners: [number, number][];
  screenWidth: number;
  screenHeight: number;
}

/**
 * 双線形でサンプルする。範囲外は背景（0）。
 *
 * <p>最近傍だと、拡大したときに階段が出て**画風の翻案より先に補間の粗さが目立つ**。
 */
function sampleBilinear(values: Float32Array, cols: number, rows: number, x: number, y: number, bg: number): number {
  // 画像の外形は「画素の外縁」＝ -0.5 .. n-0.5。そこから出たら背景。
  if (x < -0.5 || y < -0.5 || x > cols - 0.5 || y > rows - 0.5) return bg;

  // 🔴 **座標を先に画素中心の範囲へ収める。** `Math.floor` の結果を後から切り詰めると、
  //    x ∈ [-0.5, 0) で x0 = -1 → fx = x + 1 ≈ 0.75 となり、0 へ丸めた途端に
  //    **重みが逆向き**（左端なのに隣の画素へ 0.75 寄る）になる。
  //    実際これで出力の 1 行目と 2 行目が入れ替わった（test/render.test.ts が捕まえた）。
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

/**
 * 画面に見えているとおりに切り出して、モダリティ値の格子を作る。
 *
 * <p>出力の画素 `(i, j)` は、四隅が張る平行四辺形の中を素直に内挿した位置から取る。
 *
 * ```
 * P(u, v) = TL + u·(TR − TL) + v·(BL − TL)      u, v ∈ [0, 1]
 * ```
 *
 * <p>回転・反転・拡大・パンは**すべて四隅に入っている**ので、ここでは場合分けをしない。
 * 場合分けを持つと、反転と回転が重なったときのような**組み合わせでだけ壊れる**経路ができる。
 *
 * <p>🔴 **キャンバスは読まない**（このファイル冒頭の理由）。表示状態を反映するためであっても、
 * 画面から取ると患者情報のオーバーレイが混入する経路が開く。あくまで画素から描く。
 *
 * @param bg 範囲外を埋める値。窓処理前のモダリティ値なので、窓の下端を渡すと黒になる
 */
export function resampleFraming(
  values: Float32Array,
  cols: number,
  rows: number,
  framing: Framing,
  outW: number,
  outH: number,
  bg: number,
): Float32Array {
  const [tl, tr, bl] = framing.corners;
  const ux = tr[0] - tl[0];
  const uy = tr[1] - tl[1];
  const vx = bl[0] - tl[0];
  const vy = bl[1] - tl[1];
  const out = new Float32Array(outW * outH);
  for (let j = 0; j < outH; j++) {
    // 画素の中心でサンプルする（端が半画素ずれないように）。
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

/**
 * 出力の画素数を決める。画面上の縦横比を保ったまま長辺を `maxEdge` に収める。
 *
 * <p>元画像より細かくはしない（拡大しても、無い情報は増えない）。
 */
export function framingOutputSize(framing: Framing, maxEdge: number): { width: number; height: number } {
  const [tl, tr, bl] = framing.corners;
  // 切り出しが元画像の何画素ぶんか（斜めでも辺の長さで測る）。
  const srcW = Math.hypot(tr[0] - tl[0], tr[1] - tl[1]);
  const srcH = Math.hypot(bl[0] - tl[0], bl[1] - tl[1]);
  const aspect = framing.screenWidth / framing.screenHeight;
  // 画面の縦横比を保ちつつ、元の情報量を超えない大きさ。
  let w = Math.min(maxEdge, Math.max(srcW, srcH * aspect));
  let h = w / aspect;
  if (h > maxEdge) {
    h = maxEdge;
    w = h * aspect;
  }
  return { width: Math.max(1, Math.round(w)), height: Math.max(1, Math.round(h)) };
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
