/**
 * クリップボードの二段構えの検査。
 *
 * <p>本番は `file://` から読み込まれ、Clipboard API が拒否されることがある。
 * **拒否をそのまま利用者に見せない**ための退避経路が生きているかを見る。
 *
 * <h3>jsdom を入れない</h3>
 * この repo の devDependencies は esbuild / typescript / vitest の 3 つだけで、
 * 依存を増やさない流儀で来ている。必要なのは `navigator.clipboard` と
 * `document.execCommand` の 2 つだけなので、**そこだけ差し替える**。
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { copyText } from "../src/ui/clipboard";

interface Stub {
  execCommand: ReturnType<typeof vi.fn>;
  appended: number;
  removed: number;
}

/**
 * `document` / `navigator` / `window` を必要な分だけ用意する。
 *
 * @param writeText Clipboard API の挙動。`null` なら API 自体が無いことにする
 * @param legacyOk  `execCommand("copy")` が成功するか
 */
function stubEnv(writeText: (() => Promise<void>) | null, legacyOk: boolean): Stub {
  const stub: Stub = { execCommand: vi.fn(() => legacyOk), appended: 0, removed: 0 };

  const textarea = {
    value: "",
    style: {} as Record<string, string>,
    setAttribute: () => undefined,
    select: () => undefined,
  };

  (globalThis as Record<string, unknown>).document = {
    createElement: () => textarea,
    execCommand: stub.execCommand,
    body: {
      appendChild: () => {
        stub.appended++;
      },
      removeChild: () => {
        stub.removed++;
      },
    },
  };
  (globalThis as Record<string, unknown>).navigator = writeText ? { clipboard: { writeText } } : {};
  (globalThis as Record<string, unknown>).window = { isSecureContext: true };

  return stub;
}

afterEach(() => {
  for (const k of ["document", "navigator", "window"]) {
    delete (globalThis as Record<string, unknown>)[k];
  }
});

describe("copyText", () => {
  it("Clipboard API が使えればそれで済ませる", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    const stub = stubEnv(writeText, false);

    await expect(copyText("こんにちは")).resolves.toBeUndefined();

    expect(writeText).toHaveBeenCalledWith("こんにちは");
    // 退避経路は触らない。
    expect(stub.execCommand).not.toHaveBeenCalled();
  });

  // 🔴 これが本命。権限設定や埋め込み文脈で writeText は拒否されうる。
  //    そこで諦めると、利用者は「コピーできません」しか受け取れない。
  it("Clipboard API に拒否されたら退避経路へ落ちる", async () => {
    const writeText = vi.fn(() => Promise.reject(new Error("NotAllowedError")));
    const stub = stubEnv(writeText, true);

    await expect(copyText("こんにちは")).resolves.toBeUndefined();

    expect(writeText).toHaveBeenCalled();
    expect(stub.execCommand).toHaveBeenCalledWith("copy");
  });

  it("Clipboard API が無い環境でも退避経路で書ける", async () => {
    const stub = stubEnv(null, true);

    await expect(copyText("こんにちは")).resolves.toBeUndefined();

    expect(stub.execCommand).toHaveBeenCalledWith("copy");
  });

  it("どちらも駄目なときだけ失敗する（UI はそこで初めて謝る）", async () => {
    const writeText = vi.fn(() => Promise.reject(new Error("NotAllowedError")));
    stubEnv(writeText, false);

    await expect(copyText("こんにちは")).rejects.toThrow();
  });

  // 画面に残したままにすると、次のコピーで増え続ける。
  it("退避用の textarea は必ず片付ける（成功でも失敗でも）", async () => {
    const okStub = stubEnv(null, true);
    await copyText("あ");
    expect(okStub.appended).toBe(1);
    expect(okStub.removed).toBe(1);

    const ngStub = stubEnv(null, false);
    await copyText("あ").catch(() => undefined);
    expect(ngStub.appended).toBe(1);
    expect(ngStub.removed).toBe(1);
  });

  it("execCommand が例外を投げても握りつぶさず reject する", async () => {
    const stub = stubEnv(null, true);
    stub.execCommand.mockImplementation(() => {
      throw new Error("boom");
    });

    await expect(copyText("あ")).rejects.toThrow();
    // 例外が出ても片付けは済ませる。
    expect(stub.removed).toBe(1);
  });
});
