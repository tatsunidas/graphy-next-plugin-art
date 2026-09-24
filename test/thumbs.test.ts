/**
 * サムネイルの検査。
 *
 * `src/core/thumbs.ts` は `npm run thumbs` が生成する。生成物なので中身は
 * レビューしにくい——**壊れ方を機械で捕まえる**。
 *
 * 見ているのは 4 つ:
 *   1. 実在しない画家 id が混ざっていないか（カタログを直したときの取り残し）
 *   2. **収録作品がその画家の works に実在するか**（ラベルと絵の食い違い）
 *   3. data URI として妥当か（CSP の img-src data: に乗る形か）
 *   4. ui.js を膨らませすぎていないか
 */
import { describe, expect, it } from "vitest";
import { PAINTER_THUMBS } from "../src/core/thumbs";
import { PAINTER_BY_ID, PAINTERS } from "../src/core/painters";

/** base64 の実バイト数。 */
function decodedBytes(dataUri: string): number {
  const b64 = dataUri.slice(dataUri.indexOf(",") + 1);
  const padding = (b64.match(/=*$/) ?? [""])[0].length;
  return Math.floor((b64.length * 3) / 4) - padding;
}

describe("画家のサムネイル", () => {
  const ids = Object.keys(PAINTER_THUMBS);

  it("実在する画家の id しか持たない", () => {
    const orphans = ids.filter((id) => !PAINTER_BY_ID.has(id));
    expect(orphans, "カタログに無い id").toEqual([]);
  });

  it("すべて data URI（CSP の img-src data: に乗る形）", () => {
    const bad = ids.filter(
      (id) => !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(PAINTER_THUMBS[id].src),
    );
    expect(bad).toEqual([]);
  });

  // 🔴 これが本命の検査。一覧はサムネイルの隣に作品名を出すので、
  //    収録作品がカタログに無い＝**ラベルと絵が食い違う**状態。
  //    取得スクリプトの照合が緩むとここで落ちる。
  it("収録作品がその画家の代表作として登録されている", () => {
    const wrong = ids
      .filter((id) => {
        const painter = PAINTER_BY_ID.get(id);
        if (!painter) return false; // 別の検査で拾う
        return !painter.works.some(
          (w) => w.ja === PAINTER_THUMBS[id].workJa && w.en === PAINTER_THUMBS[id].workEn,
        );
      })
      .map((id) => `${id}: ${PAINTER_THUMBS[id].workJa}`);
    expect(wrong, "カタログに無い作品名").toEqual([]);
  });

  it("1 枚が大きすぎない（8KB 未満）", () => {
    const heavy = ids
      .map((id) => [id, decodedBytes(PAINTER_THUMBS[id].src)] as const)
      .filter(([, n]) => n >= 8192)
      .map(([id, n]) => `${id}: ${n}B`);
    expect(heavy).toEqual([]);
  });

  it("合計が ui.js を圧迫しない（500KB 未満）", () => {
    const total = ids.reduce((sum, id) => sum + PAINTER_THUMBS[id].src.length, 0);
    expect(total, `合計 ${(total / 1024).toFixed(0)}KB`).toBeLessThan(500 * 1024);
  });

  it("収録率が落ちていない（8 割以上）", () => {
    // 取得スクリプトの照合を緩めずに済んでいるかの見張り。
    // 大きく下がったら、代表作の英題か出典側の変化を疑う。
    const rate = ids.length / PAINTERS.length;
    expect(rate, `${ids.length}/${PAINTERS.length}`).toBeGreaterThanOrEqual(0.8);
  });
});
