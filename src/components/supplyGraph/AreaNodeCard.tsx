import '@xyflow/react/dist/style.css';
import React, { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import type { AreaNode } from "../../types/supplyGraph";

/** Dashed grouping region drawn behind related nodes. Not interactive. */
function AreaNodeCardBase({
  data
}: NodeProps<AreaNode>) {
  return <div className="relative h-full w-full rounded-2xl border border-dashed border-white/[0.16] bg-white/[0.015]">
      <span className="absolute left-3 top-2 text-[10.5px] font-medium uppercase tracking-[0.08em] text-slate-400">{data.label}</span>
    </div>;
}
export const AreaNodeCard = memo(AreaNodeCardBase);