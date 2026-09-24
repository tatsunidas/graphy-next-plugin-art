/**
 * ホスト（GRAPHY-Next 本体）から渡される API のうち、**このプラグインが使うものだけ**を宣言する。
 *
 * <p>`graphy-plugin.d.ts` の全体を写さない理由は、写すと本体の更新のたびに差分が出て、
 * 実際には使っていない箇所の食い違いに時間を取られるため。ここに書いたものだけが
 * 「依存している契約」であり、本体を上げるときに確認すべき範囲でもある。
 *
 * <p>元の定義: GRAPHY-Next の `examples/plugin-template/graphy-plugin.d.ts`
 * （リポジトリ直下にコピーがある）。
 */

export interface ViewerTarget {
  tileId: string;
  patientKey: string;
  studyUid: string;
  seriesUid: string;
  seriesLabel: string;
  imageId: string;
  sliceIndex: number;
  sliceCount: number;
  modality: string;
}

/**
 * 画面に見えている画像上の範囲。
 *
 * <p>🔑 **回転・左右上下反転・拡大・パン・Fit 倍率が、すべてこの 4 点に畳み込まれている。**
 * プラグイン側で `rotation` / `zoom` / `pan` から組み立て直してはいけない——`pan` は
 * world mm で、その原点は IPP（患者座標）だが**プラグインは IPP/IOP を取得できない**。
 * さらに XA は幾何を持たず、world→画素の変換が成立しない（本体 `roiRead.ts` の注記）。
 */
export interface VisibleRegion {
  /**
   * 四隅の画像画素座標（0 origin＝最初の画素の中心が 0）。
   * 並びは**画面から見た** 左上・右上・左下・右下。回転・反転が入っているので、
   * 左上が画像の右下を指すこともある。
   */
  corners: [number, number][];
  /** その範囲の画面上の大きさ（CSS px）。出力の縦横比に使う。 */
  screenWidth: number;
  screenHeight: number;
}

export interface ViewerViewState {
  tileId: string;
  windowCenter: number;
  windowWidth: number;
  unit: string;
  colormap: string | null;
  invert: boolean;
  flipH: boolean;
  flipV: boolean;
  /** 度。 */
  rotation: number;
  /** Fit を 1.0 とした相対倍率。 */
  zoom: number;
  /** 既定（画像が中央）からのオフセット（world mm）。 */
  pan: [number, number];
  /**
   * 画面に見えている範囲。**送信画像のフレーミングはこれだけを見る。**
   * 算出できなければ null（そのときは画像全体を送る）。
   */
  visibleRegion: VisibleRegion | null;
}

export interface PixelData {
  tileId: string;
  imageId: string;
  sliceIndex: number;
  rows: number;
  cols: number;
  /** row-major。**校正済みモダリティ値**（CT なら HU）で、表示 W/L は掛かっていない。 */
  data: Float32Array;
  unit: string;
}

/** `host.ai.generate()` の要求（H40）。 */
export interface AiGenerationRequest {
  model: string;
  apiVersion?: string;
  prompt: string;
  imageBytes: Uint8Array;
  mimeType?: string;
  /** 同意を覚える単位。シリーズ UID を渡す。 */
  scopeKey?: string;
  temperature?: number;
  responseModalities?: string[];
}

export type AiGenerationOutcome =
  | { ok: true; data: unknown }
  | { ok: false; error: string; status?: number; kind?: string };

export interface PluginSaveFileOptions {
  defaultName: string;
  bytes: Uint8Array;
  filters?: { name: string; extensions: string[] }[];
}

export type SaveFileResult =
  | { ok: true; filePath: string }
  | { ok: false; canceled?: boolean; error?: string };

export interface Viewer2DPluginHost {
  pluginId: string;
  /** 本体のキーしか引けない。プラグイン自身の文言は `src/i18n/messages.ts`。 */
  t: (key: string) => string;
  /** 活性化した時点の表示言語（`"ja"` / `"en"`）。途中の切り替えには追従しない。 */
  locale: string;
  notify: (message: string) => void;
  getTargets: () => ViewerTarget[];
  getViewState: (tileId?: string) => ViewerViewState | null;
  getPixelData: (tileId?: string, opts?: { sliceIndex?: number }) => Promise<PixelData | null>;
  /** 外部 AI への送信（要 `ai-egress` 権限。同意ダイアログは本体が出す）。 */
  ai: { generate: (req: AiGenerationRequest) => Promise<AiGenerationOutcome> };
  /** 名前を付けて保存（上書き確認は OS のダイアログが出す）。 */
  file: { saveAs: (opts: PluginSaveFileOptions) => Promise<SaveFileResult> };
}

export interface PluginModule {
  activate(host: Viewer2DPluginHost): void | Promise<void>;
}
