/** Event other components listen to so a filter can be applied as part of a focus request. */
export const FOCUS_FILTER_EVENT = "atlas:focus-filter";

export interface FocusFilterDetail {
  target: string;
  value: string;
}

export interface FocusRequest {
  /** DOM id of the section to scroll to and highlight. */
  focus: string;
  filter?: string;
}

const HIGHLIGHT_MS = 2400;
const WAIT_MS = 2500;

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Waits for an element to exist (pages may still be mounting), applies any filter,
 * scrolls it into view and briefly highlights it. Resolves false if it never appears.
 */
export function focusTarget({ focus, filter }: FocusRequest): Promise<boolean> {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const attempt = () => {
      const el = document.getElementById(focus);
      if (!el) {
        if (Date.now() - startedAt > WAIT_MS) return resolve(false);
        window.setTimeout(attempt, 60);
        return;
      }
      if (filter) window.dispatchEvent(new CustomEvent<FocusFilterDetail>(FOCUS_FILTER_EVENT, { detail: { target: focus, value: filter } }));
      // Let the filter render before measuring the scroll position.
      window.requestAnimationFrame(() => {
        el.style.scrollMarginTop = "24px";
        el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
        el.classList.remove("focus-highlight");
        void el.offsetWidth; // restart the animation if it's already highlighted
        el.classList.add("focus-highlight");
        window.setTimeout(() => el.classList.remove("focus-highlight"), HIGHLIGHT_MS);
        resolve(true);
      });
    };
    attempt();
  });
}