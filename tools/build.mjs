/**
 * ui.js を 1 ファイルにバンドルする。
 *
 * GRAPHY-Next のプラグインは「plugin.json ＋ ui.js」をフォルダ直下に置く形で配信される
 * （backend の PluginController は `/{id}/ui.js` しか返さない）。**分割チャンク・追加アセットは
 * 配信されない**ので、必ず単一ファイル・外部依存なしにすること。
 */
import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("plugin.json", "utf8"));

const result = await build({
  entryPoints: ["src/ui.ts"],
  bundle: true,
  format: "esm",
  target: "es2022",
  platform: "browser",
  splitting: false,
  // 版をビルド時に埋め込む（実行時に plugin.json を読む手段が無い）。
  // 生成物のメタデータに「どの版が作ったか」を残すために要る。
  define: { __PLUGIN_VERSION__: JSON.stringify(pkg.version) },
  minify: false, // 医療用途なので、配布物を読んで検証できる状態を保つ
  legalComments: "inline",
  banner: {
    js:
      `/* ${pkg.name} v${pkg.version} — Art of Imaging for GRAPHY-Next\n` +
      ` * ${pkg.homepage ?? ""}\n` +
      ` * 研究・教育・芸術表現の目的。診断機器ではありません。\n` +
      ` * このファイルは tools/build.mjs が src/ から生成します。直接編集しないこと。\n */`,
  },
  write: false,
});

const out = result.outputFiles[0];
writeFileSync("ui.js", out.text);

const kb = out.contents.byteLength / 1024;
console.log(`ui.js を生成しました (${kb.toFixed(1)} KB)`);

// 画家サムネイルを data URI で抱えているぶん、うっかり膨らみやすい。
// 配信は localhost からなので致命的ではないが、気づかず太り続けないよう線を引く。
const LIMIT_KB = 600;
if (kb > LIMIT_KB) {
  console.warn(
    `⚠ ui.js が ${LIMIT_KB} KB を超えました (${kb.toFixed(1)} KB)。\n` +
      "  src/core/thumbs.ts のサムネイル枚数か画質を見直してください" +
      "（tools/fetch-thumbs.py の THUMB_PX / MAX_BYTES）。",
  );
}
