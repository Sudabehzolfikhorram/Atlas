import React, { useRef } from "react";
import { Flex, Text } from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import { NetworkIcon, SparklesIcon, WorkflowIcon, BoxIcon } from "lucide-react";
import { GraphView, GraphViewId } from "../../data/teamGraphViews";
interface Props {
  views: GraphView[];
  active: GraphViewId;
  onChange: (id: GraphViewId) => void;
}
const icons: Record<GraphViewId, BoxIcon> = {
  processes: NetworkIcon,
  outcomes: WorkflowIcon,
  strategy: SparklesIcon
};

/** Horizontal tab bar choosing which view of the organization graph is shown. */
export function GraphViewTabs({
  views,
  active,
  onChange
}: Props) {
  const reduce = useReducedMotion();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % views.length;else if (e.key === "ArrowLeft") next = (i + views.length - 1) % views.length;else if (e.key === "Home") next = 0;else if (e.key === "End") next = views.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(views[next].id);
    refs.current[next]?.focus();
  };
  return <Flex role="tablist" aria-label="Graph view" className="overflow-x-auto rounded-xl border border-white/[0.08] bg-black/20 p-1 [scrollbar-width:none]">
      {views.map((v, i) => {
      const on = v.id === active;
      const Icon = icons[v.id];
      return <button key={v.id} ref={(el) => refs.current[i] = el} type="button" role="tab" id={`tg-tab-${v.id}`} aria-selected={on} aria-controls="tg-panel" tabIndex={on ? 0 : -1} onClick={() => onChange(v.id)} onKeyDown={(e) => onKey(e, i)} className={`relative flex min-w-[170px] flex-1 items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${on ? "text-white" : "text-slate-400 hover:text-slate-200"}`}>
            {on && <motion.span layoutId="tg-tab-active" className="absolute inset-0 rounded-lg border border-blue-400/40 bg-blue-500/[0.12] shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]" transition={reduce ? {
          duration: 0
        } : {
          type: "spring",
          stiffness: 500,
          damping: 40
        }} aria-hidden />}
            <span className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${on ? "border-blue-400/40 bg-blue-400/15 text-blue-200" : "border-white/[0.08] bg-white/[0.03] text-slate-400"}`}>
              <Icon size={13} aria-hidden />
            </span>
            <span className="relative min-w-0">
              <Text as="span" className="block truncate text-[13px] font-medium leading-tight">{v.label}</Text>
              <Text as="span" className="block truncate text-[11px] text-slate-500">{v.hint}</Text>
            </span>
          </button>;
    })}
    </Flex>;
}