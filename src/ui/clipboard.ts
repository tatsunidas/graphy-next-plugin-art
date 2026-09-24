/**
 * クリップボードへの書き込み。
 *
 * <p>由来: vis-ionary.com のテーマ `assets/js/art-gallery.js`（引用文のコピー）。
 * **同じ判断を別実装で繰り返さない**ために、そこで実証済みの二段構えを写してある。
 *
 * <h3>なぜ退避手段を残すのか</h3>
 * 本番の GRAPHY-Next は `loadFile()` で `file://` から読み込まれる。Chromium は
 * `file:` を trustworthy 扱いにするので `isSecureContext` は真になるが、
 * **Clipboard API はそれでも拒否されうる**（権限設定、利用者操作を伴わない呼び出し、
 * 埋め込み文脈など）。拒否をそのまま利用者に見せず、古い手にもう一度だけ賭ける。
 */

/**
 * 画面外の `textarea` を経由する古い手。
 *
 * <p>`display: none` だと選択できずコピーできないので、**画面の外へ出す**。
 */
function legacyCopy(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.setAttribute("readonly", "");
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    if (ok) resolve();
    else reject(new Error("copy failed"));
  });
}

/**
 * 文字列をクリップボードへ書く。
 *
 * <p>Clipboard API →拒否されたら {@link legacyCopy} →どちらも駄目なら reject。
 */
export function copyText(text: string): Promise<void> {
  if (!navigator.clipboard || !window.isSecureContext) {
    return legacyCopy(text);
  }
  return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
}
