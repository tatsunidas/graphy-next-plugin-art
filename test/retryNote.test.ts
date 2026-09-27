/**
 * 🚨 2026-09-27 の回帰試験。「解説を作り直す」が**一度も表示されていなかった**件。
 *
 * 発端は利用者の「『解説を作り直す』が見当たらない」。原因は判定式に `busy` が入っていたこと
 * ——`showResult()` は必ず `busy === true` の間に呼ばれるので、**常に隠れていた**。
 */
import { describe, expect, it } from "vitest";
import { retryNoteState } from "../src/ui/retryNote";

describe("retryNoteState", () => {
  it("🔴 生成中でも隠さない（判定に busy を入れない）", () => {
    // showResult() は必ずこの状態で呼ばれる。ここで visible が false になると永久に出ない。
    expect(retryNoteState({ hasArtwork: true, busy: true }).visible).toBe(true);
  });

  it("生成中は押せなくする（隠すのではなく無効にする）", () => {
    expect(retryNoteState({ hasArtwork: true, busy: true }).disabled).toBe(true);
    expect(retryNoteState({ hasArtwork: true, busy: false }).disabled).toBe(false);
  });

  it("🔑 解説が取れていても出す（長すぎる・画に合わないときに作り直せる）", () => {
    // 解説の有無は判定に入れない。入れると「取れたら作り直せない」という不便が生まれる。
    expect(retryNoteState({ hasArtwork: true, busy: false }).visible).toBe(true);
  });

  it("作品がまだ無いうちは出さない", () => {
    expect(retryNoteState({ hasArtwork: false, busy: false }).visible).toBe(false);
    expect(retryNoteState({ hasArtwork: false, busy: true }).visible).toBe(false);
  });
});
