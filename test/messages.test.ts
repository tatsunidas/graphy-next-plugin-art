import { describe, expect, it } from "vitest";
import { makeT, type MessageKey } from "../src/i18n/messages";

/**
 * 利用者に見せる文言が、特定の提供元（Gemini・Google）を前提にしていないこと。
 *
 * このプラグインは送信先の提供元を知らない（本体の環境設定で OpenAI・Gemini などから選ぶ）。
 * 提供元名を書くと、別の提供元を使う利用者に誤った説明（「Google に送られる」など）になる。
 */
const KEYS: MessageKey[] = [
  "errNoKey", "errNoImage", "errBlocked", "errGeneric", "privacy1", "privacy2", "privacy3", "privacyTitle",
];
const PROVIDER_WORDS = /google|gemini|無料枠|ティア|free tier|paid tier/i;

describe("文言は提供元に依存しない", () => {
  for (const lang of ["ja", "en"] as const) {
    const t = makeT(lang);
    it(`${lang}: 提供元名・無料枠の記述が無い`, () => {
      for (const k of KEYS) expect(t(k, { reason: "x", error: "y" }), `${lang}.${k}`).not.toMatch(PROVIDER_WORDS);
    });
    it(`${lang}: 送信先は「環境設定 ＞ 外部 AI」で選んだものだと案内する`, () => {
      expect(t("privacy1")).toMatch(/外部 AI|External AI/);
      expect(t("errNoKey")).toMatch(/外部 AI|External AI/);
    });
    it(`${lang}: 画像が返らないときは、画像編集に対応したモデルの確認へ誘導する`, () => {
      expect(t("errNoImage")).toMatch(/画像編集|image editing/);
    });
  }

  it("対照: 検査が効いていること（旧文言なら該当する）", () => {
    expect("画像は第三者（Google）のクラウドへ送信されます。").toMatch(PROVIDER_WORDS);
    expect("Gemini の API キーが未設定です。").toMatch(PROVIDER_WORDS);
    expect("無料枠では入力がモデル改善に利用され得ます。").toMatch(PROVIDER_WORDS);
  });
});
