/**
 * 「解説を作り直す」ボタンを出すか／押せるかの判定。
 *
 * <h3>🚨 なぜ関数に切り出したか</h3>
 * **このボタンは一度も表示されたことがなかった**（2026-09-27 に利用者の指摘で発覚）。
 * 判定を `showResult()` の中に直接書いていたのが原因:
 *
 * ```ts
 * retryNoteBtn.style.display = note?.appreciation || busy ? "none" : "inline-block";
 * ```
 *
 * 🔴 **`showResult()` は必ず `busy === true` の間に呼ばれる**
 * （`busy = true` → 生成 → `showResult` → `finally` で `busy = false`）。
 * つまり `busy` の項が常に真で、**解説が取れなかったときですら出なかった**。
 * 「出ない」は例外も型エラーも出さないので、**押して確かめるまで誰も気づけない**。
 *
 * このプラグインには DOM を使う試験環境が無い（vitest は node 環境）。だから
 * **判定だけを純関数にして、ここで固定する**。表示の代入は 1 か所だけにする。
 */
export interface RetryNoteState {
  /** 作品が出来ているか（結果の欄が出ているか）。 */
  hasArtwork: boolean;
  /** 生成中か。 */
  busy: boolean;
}

/**
 * 出すか／押せるか。
 *
 * <p>🔑 **解説が取れていても出す。** 取れていても作り直したいことがある——投稿欄の上限
 * （800 文字）を超えた、内容が画に合っていない。そのために作品ごと作り直すのは
 * **画像生成の課金が 1 回増えるだけ無駄**で、解説だけなら文章 1 回分で済む。
 *
 * <p>🔴 **生成中は「隠す」のではなく「押せなくする」。** 隠すと、出ていたものが消えて
 * また出るという落ち着かない動きになるうえ、上記の事故のように
 * 「常に隠れている」状態を作りやすい。
 */
export function retryNoteState(s: RetryNoteState): { visible: boolean; disabled: boolean } {
  return { visible: s.hasArtwork, disabled: s.busy };
}
