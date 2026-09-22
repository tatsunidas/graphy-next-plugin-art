/**
 * 画家カタログの機械的な検査。
 *
 * <p>ここが守っているのは「収録した画家がパブリックドメインであること」。
 * 有名な画家を思いつきで足したときに、静かに保護期間内の作家が混ざるのを防ぐ。
 */
import { describe, expect, it } from "vitest";
import { PAINTERS, PAINTER_BY_ID, PD_CUTOFF_YEAR, searchPainters } from "../src/core/painters";
import { STYLES, STYLE_BY_ID } from "../src/core/styles";

describe("画家カタログ", () => {
  it("全員が戦時加算を織り込んだパブリックドメイン基準を満たす", () => {
    const violators = PAINTERS.filter((p) => p.pdYear > PD_CUTOFF_YEAR).map(
      (p) => `${p.nameJa} (${p.pdYear})`,
    );
    expect(violators, "保護期間内の可能性がある画家").toEqual([]);
  });

  it("没年が判明している場合は pdYear と一致する（判定の根拠をずらさない）", () => {
    const mismatched = PAINTERS.filter((p) => p.died !== null && p.died !== p.pdYear).map((p) => p.id);
    expect(mismatched).toEqual([]);
  });

  it("没年不詳の画家には必ず根拠の注記がある", () => {
    const missing = PAINTERS.filter((p) => p.died === null && !p.note).map((p) => p.id);
    expect(missing, "died が null なのに note が無い").toEqual([]);
  });

  it("id が重複しない", () => {
    expect(PAINTER_BY_ID.size).toBe(PAINTERS.length);
  });

  it("全員が実在する様式に属する", () => {
    const orphans = PAINTERS.filter((p) => !STYLE_BY_ID.has(p.styleId)).map((p) => p.id);
    expect(orphans).toEqual([]);
  });

  it("どの様式にも最低 1 人は画家が居る（空の選択肢を出さない）", () => {
    const empty = STYLES.filter((s) => !PAINTERS.some((p) => p.styleId === s.id)).map((s) => s.id);
    expect(empty).toEqual([]);
  });

  it("日英の名前と作風ヒントが空でない", () => {
    const incomplete = PAINTERS.filter(
      (p) => !p.nameJa.trim() || !p.nameEn.trim() || !p.promptHint.trim(),
    ).map((p) => p.id);
    expect(incomplete).toEqual([]);
  });

  it("除外すべき画家が紛れ込んでいない", () => {
    // 有名さに引きずられて足しやすいものを名指しで止める。
    const banned = ["matisse", "picasso", "chagall", "dali", "pollock", "hopper", "kahlo", "foujita", "hasui", "taikan"];
    const found = PAINTERS.filter((p) => banned.includes(p.id)).map((p) => p.id);
    expect(found).toEqual([]);
  });
});

describe("searchPainters — 部分一致", () => {
  it("日本語名の一部で引ける", () => {
    expect(searchPainters("ゴッホ").map((p) => p.id)).toContain("vanGogh");
  });

  it("英語名の一部で引ける（大文字小文字を問わない）", () => {
    expect(searchPainters("MONET").map((p) => p.id)).toContain("monet");
  });

  it("別名・ローマ字表記の揺れを吸収する", () => {
    expect(searchPainters("hokusai").map((p) => p.id)).toContain("hokusai");
    expect(searchPainters("van gogh").map((p) => p.id)).toContain("vanGogh");
  });

  it("様式で絞り込める", () => {
    const result = searchPainters("", "ukiyoe");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.styleId === "ukiyoe")).toBe(true);
  });

  it("様式で絞ったうえで部分一致できる", () => {
    const result = searchPainters("広重", "ukiyoe");
    expect(result.map((p) => p.id)).toEqual(["hiroshige"]);
  });

  it("空文字なら全件（絞り込み無し）", () => {
    expect(searchPainters("  ").length).toBe(PAINTERS.length);
  });

  it("該当が無ければ空", () => {
    expect(searchPainters("該当しない文字列xyz")).toEqual([]);
  });
});
