/** 素の DOM を組むための最小ヘルパ。プラグインに React は無い。 */

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<Record<string, unknown>> = {},
  children: (Node | string | null)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "style" && typeof v === "object" && v) {
      Object.assign(node.style, v as Partial<CSSStyleDeclaration>);
    } else if (k === "dataset" && typeof v === "object" && v) {
      Object.assign(node.dataset, v as Record<string, string>);
    } else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    } else if (v != null) {
      (node as unknown as Record<string, unknown>)[k] = v;
    }
  }
  for (const c of children) {
    if (c == null) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

/** ヘッダーを掴んで動かせるようにする（本体の FourierDialog と同じ作法）。 */
export function makeDraggable(panel: HTMLElement, handle: HTMLElement): void {
  let startX = 0;
  let startY = 0;
  let baseX = 0;
  let baseY = 0;
  handle.style.cursor = "move";
  handle.addEventListener("pointerdown", (e) => {
    if ((e.target as HTMLElement).tagName === "BUTTON") return;
    const rect = panel.getBoundingClientRect();
    baseX = rect.left;
    baseY = rect.top;
    startX = e.clientX;
    startY = e.clientY;
    handle.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent): void => {
      panel.style.left = `${baseX + ev.clientX - startX}px`;
      panel.style.top = `${baseY + ev.clientY - startY}px`;
      panel.style.transform = "none";
    };
    const up = (ev: PointerEvent): void => {
      handle.releasePointerCapture(ev.pointerId);
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
  });
}

/**
 * ダイアログ内のホイールがビューアのフレーム送りに化けるのを止める。
 *
 * <p>本体のビューアはホイールを無条件に `preventDefault` するため、上へ伝播させると
 * ダイアログをスクロールしたつもりで背後のスライスが進む。本体側では
 * `viewerOverlayProps` がこれを担っているが、プラグインは素の DOM なので自前で止める。
 */
export function stopWheelPropagation(panel: HTMLElement): void {
  panel.addEventListener("wheel", (e) => e.stopPropagation(), { passive: true });
}
