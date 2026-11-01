import React from "react";
import { Flex } from "@chakra-ui/react";
interface Props<T extends string> {
  tabs: {
    id: T;
    label: string;
  }[];
  active: T;
  onChange: (id: T) => void;
  /** Prefix for tab ids; panels use `${idPrefix}-panel`. */
  idPrefix: string;
  label: string;
}

/** Underlined page-level tabs used on the Mapping pages. */
export function MappingTabs<T extends string>({
  tabs,
  active,
  onChange,
  idPrefix,
  label
}: Props<T>) {
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    onChange(next.id);
    document.getElementById(`${idPrefix}-tab-${next.id}`)?.focus();
  };
  return <Flex role="tablist" aria-label={label} className="gap-6 overflow-x-auto border-b border-white/[0.08]">
      {tabs.map((t, i) => {
      const on = t.id === active;
      return <button key={t.id} id={`${idPrefix}-tab-${t.id}`} type="button" role="tab" aria-selected={on} aria-controls={`${idPrefix}-panel`} tabIndex={on ? 0 : -1} onClick={() => onChange(t.id)} onKeyDown={(e) => onKey(e, i)} className={`relative shrink-0 whitespace-nowrap pb-3 pt-1 text-[14px] transition-colors focus:outline-none focus-visible:text-white ${on ? "font-medium text-blue-300" : "text-slate-400 hover:text-slate-200"}`}>
            {t.label}
            {on && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-blue-400" aria-hidden />}
          </button>;
    })}
    </Flex>;
}