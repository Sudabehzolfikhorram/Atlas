import '@xyflow/react/dist/style.css';
import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { TriangleAlertIcon } from "lucide-react";
import { useSupplyGraphView } from "../../contexts/SupplyGraphViewContext";
import type { SupplyNode } from "../../types/supplyGraph";
import { categoryMeta, cleanList, statusMeta } from "../../utils/supplyGraph";
import { supplyIcons } from "./supplyIcons";
function SupplyNodeCardBase({
  id,
  data
}: NodeProps<SupplyNode>) {
  const view = useSupplyGraphView();
  const Icon = supplyIcons[data.icon] ?? supplyIcons.circle;
  const cat = categoryMeta[data.category] ?? categoryMeta.pipeline;
  const status = data.details.status ? statusMeta[data.details.status] : null;
  const flags = cleanList(data.details.redFlags).length;
  const selected = view.selectedId === id;
  const searching = view.query.trim().length > 0;
  const dim = searching ? !view.matches.has(id) : view.selectedId !== null && !selected && !view.relatedIds.has(id);
  const handle = `!h-2 !w-2 ${view.editing ? "" : "!pointer-events-none !opacity-0"}`;
  return <div aria-label={`${data.label}${status ? `, ${status.label}` : ""}${flags ? `, ${flags} red flag${flags > 1 ? "s" : ""}` : ""}`} className={`glass-tile relative w-[150px] rounded-xl border px-2.5 pb-2.5 pt-2 transition-[opacity,box-shadow,border-color] duration-200 ${selected ? "!border-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.28)]" : flags ? "!border-amber-400/45" : ""} ${dim ? "opacity-30" : ""} ${view.editing ? "cursor-grab" : "cursor-pointer"}`}>
      <Handle type="target" position={Position.Left} id="l" className={handle} />
      <Handle type="source" position={Position.Right} id="r" className={handle} />
      <Handle type="target" position={Position.Top} id="t" className={handle} />
      <Handle type="source" position={Position.Bottom} id="b" className={handle} />

      <div className="flex min-h-[16px] items-center justify-between gap-1">
        {view.showWeight ? <span className="num rounded border border-white/[0.1] bg-white/[0.04] px-1 text-[9.5px] leading-[14px] text-slate-400">W {data.weight.toFixed(2)}</span> : <span />}
        <span className="flex items-center gap-1">
          {flags > 0 && <span className="inline-flex items-center gap-0.5 rounded bg-amber-400/15 px-1 text-[9.5px] font-semibold leading-[14px] text-amber-300" title={`${flags} red flag${flags > 1 ? "s" : ""}`}>
              <TriangleAlertIcon size={9} aria-hidden />
              {flags}
            </span>}
          {status && <span className={`h-2 w-2 rounded-full ${status.dot}`} title={status.label} />}
        </span>
      </div>

      <div className="mt-1.5 flex items-start gap-2">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${cat.tile}`}>
          <Icon size={14} aria-hidden />
        </span>
        <div className="min-w-0">
          <div className="text-[12px] font-medium leading-tight text-slate-100">{data.label || "Untitled node"}</div>
          {data.subtitle && <div className="mt-0.5 text-[10.5px] leading-snug text-slate-400">{data.subtitle}</div>}
        </div>
      </div>
    </div>;
}
export const SupplyNodeCard = memo(SupplyNodeCardBase);