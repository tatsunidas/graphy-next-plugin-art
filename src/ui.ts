/**
 * Art of Imaging プラグインの入口。
 *
 * <p>GRAPHY-Next は `plugin.json` の `ui` が指す **単一の ES モジュール**を動的 import し、
 * `activate(host)` を呼ぶ。分割チャンクや追加アセットは配信されないので、
 * `tools/build.mjs` で 1 ファイルにまとめる。
 */
import type { PluginModule, Viewer2DPluginHost } from "./hostTypes";
import { openArtDialog } from "./ui/ArtDialog";

const plugin: PluginModule = {
  activate(host: Viewer2DPluginHost): void {
    openArtDialog(host);
  },
};

export default plugin;
export const activate = plugin.activate;
