/**
 * メタデータ組み立ての検査。**患者識別子が入らないこと**が要点。
 */
import { describe, expect, it } from "vitest";
import { buildMetadata, defaultFileName } from "../src/core/metadata";
import { GRAPHY_ART_SPEC } from "../src/core/pngMeta";

const input = {
  appVersion: "0.3.0",
  pluginVersion: "0.1.0",
  model: "gemini-3.1-flash-image",
  styleId: "ukiyoe",
  painterId: "hokusai",
  painterName: "Katsushika Hokusai",
  signature: { text: "T.K.", position: "bottom-right" as const, fontId: "serif" },
  modality: "CT",
  bodyPart: "CHEST",
  prompt: "prompt text",
  sourceImageSha256: "a".repeat(64),
  imageSha256: "b".repeat(64),
  pHash: "0123456789abcdef",
  now: new Date("2026-09-22T03:04:05.000Z"),
};

describe("buildMetadata", () => {
  it("spec と生成器名が入る", () => {
    const m = buildMetadata(input);
    expect(m.spec).toBe(GRAPHY_ART_SPEC);
    expect(m.generator).toBe("GRAPHY-Next Art of Imaging");
  });

  it("createdAt は ISO8601（差し替え可能なので決定的に検査できる）", () => {
    expect(buildMetadata(input).createdAt).toBe("2026-09-22T03:04:05.000Z");
  });

  it("🔴 患者識別子に相当するキーを一切持たない", () => {
    const json = JSON.stringify(buildMetadata(input));
    for (const forbidden of ["patient", "Patient", "studyUid", "seriesUid", "StudyInstance", "SeriesInstance", "accession"]) {
      expect(json, `${forbidden} が含まれている`).not.toContain(forbidden);
    }
  });

  it("source はモダリティと部位の 2 項目だけ", () => {
    expect(Object.keys(buildMetadata(input).source).sort()).toEqual(["bodyPart", "modality"]);
  });

  it("ハッシュ 3 種が揃う（Web 側の三層判定に要る）", () => {
    const m = buildMetadata(input);
    expect(m.sourceImageSha256).toHaveLength(64);
    expect(m.imageSha256).toHaveLength(64);
    expect(m.pHash).toMatch(/^[0-9a-f]{16}$/);
  });

  it("appVersion が取れないときは空文字（捏造しない）", () => {
    expect(buildMetadata({ ...input, appVersion: "" }).appVersion).toBe("");
  });
});

describe("defaultFileName", () => {
  it("画家 id と日時を含む png 名になる", () => {
    const name = defaultFileName("hokusai", new Date("2026-09-22T03:04:05.000Z"));
    expect(name).toBe("graphy-art-hokusai-20260922-030405.png");
  });

  it("ファイル名として使えない文字を含まない", () => {
    expect(defaultFileName("hokusai")).not.toMatch(/[\\/:*?"<>|]/);
  });
});
