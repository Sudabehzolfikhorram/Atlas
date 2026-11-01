import { useRef } from "react";

/**
 * Returns a list where items keep their previous object identity while their signature is unchanged.
 * Lets memoised renderers (e.g. React Flow nodes/edges) skip work for items that didn't change.
 */
export function useStableById<T extends {id: string;}>(items: T[], signature: (item: T) => string): T[] {
  const cache = useRef(new Map<string, {sig: string;item: T;}>());
  const next = new Map<string, {sig: string;item: T;}>();
  const out = items.map((item) => {
    const sig = signature(item);
    const prev = cache.current.get(item.id);
    const kept = prev && prev.sig === sig ? prev.item : item;
    next.set(item.id, { sig, item: kept });
    return kept;
  });
  cache.current = next;
  return out;
}