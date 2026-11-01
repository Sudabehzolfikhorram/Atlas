import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { ArrowRightIcon, ChevronsLeftRightIcon, MaximizeIcon, MinusIcon, PlusIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import { usePanZoom } from "../../hooks/usePanZoom";
import { dataControls, dataFixes, dataReroutes } from "../../data/bestPracticeData";
import { categoryMeta, cleanList, isSupplyNode, statusMeta } from "../../utils/supplyGraph";
import type { DataGraph } from "../../utils/bestPracticeData";
import { DataFlowMap, MAP_H, MAP_W, NODE_H, NODE_W, OFFSET_Y, type DataMark, type EdgeMark } from "./DataFlowMap";
interface Props {
  asIs: DataGraph;
  target: DataGraph;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Bumped by the page to pan to the selected node. */
  focusNonce: number;
}

/** Before/after split of the as-is data flow and the best-practice target, with synced pan/zoom. */
export function DataCompareCanvas({
  asIs,
  target,
  selectedId,
  onSelect,
  focusNonce
}: Props) {
  const pz = usePanZoom({
    contentW: MAP_W,
    contentH: MAP_H,
    onBackgroundClick: () => onSelect(null),
    onEscape: () => onSelect(null)
  });
  const [split, setSplit] = useState(50);
  const dragging = useRef(false);
  const {
    asIsMarks,
    targetMarks,
    asIsEdgeMarks,
    targetEdgeMarks
  } = useMemo(() => {
    const a: Record<string, DataMark> = {};
    const t: Record<string, DataMark> = {};
    dataFixes.forEach((f) => {
      a[f.nodeId] = "gap";
      t[f.nodeId] = "fixed";
    });
    dataControls.forEach((c) => t[c.id] = "added");
    const ae: Record<string, EdgeMark> = {};
    const te: Record<string, EdgeMark> = {};
    dataReroutes.forEach((r) => {
      ae[r.removeEdgeId] = "removed";
      te[`e-${r.source}-${r.target}`] = "added";
    });
    dataControls.forEach((c) => te[`e-${c.controls[0]}-${c.id}`] = "added");
    return {
      asIsMarks: a,
      targetMarks: t,
      asIsEdgeMarks: ae,
      targetEdgeMarks: te
    };
  }, []);
  const before = asIs.nodes.filter(isSupplyNode).find((n) => n.id === selectedId);
  const after = target.nodes.filter(isSupplyNode).find((n) => n.id === selectedId);
  const sel = after ?? before;
  useEffect(() => {
    if (!sel || !focusNonce) return;
    pz.focusOn(sel.position.x + NODE_W / 2, sel.position.y + OFFSET_Y + NODE_H / 2, 300);
    setSplit(!before ? 12 : 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNonce]);
  const moveSplit = (clientX: number) => {
    const r = pz.vpRef.current?.getBoundingClientRect();
    if (!r) return;
    setSplit(Math.min(96, Math.max(4, (clientX - r.left) / r.width * 100)));
  };
  const fix = dataFixes.find((f) => f.nodeId === selectedId);
  const control = dataControls.find((c) => c.id === selectedId);
  const beforeFlags = cleanList(before?.data.details.redFlags);
  const statusOf = (s?: keyof typeof statusMeta) => s ? statusMeta[s] : null;
  const sBefore = statusOf(before?.data.details.status);
  const sAfter = statusOf(after?.data.details.status);
  return <Box className="relative">
      <div ref={pz.vpRef} {...pz.handlers} tabIndex={0} role="application" aria-label="Before and after data flow comparison. Drag to pan, use the divider to compare." className="relative cursor-grab overflow-hidden rounded-xl bg-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:cursor-grabbing" style={{
      ...pz.viewportStyle,
      minHeight: 460
    }}>
        <div className="absolute left-0 top-0 origin-top-left" style={pz.contentStyle}>
          <DataFlowMap graph={asIs} marks={asIsMarks} edgeMarks={asIsEdgeMarks} selectedId={selectedId} onSelect={onSelect} />
        </div>
        <div className="absolute inset-0 bg-[#0A1020]" style={{
        clipPath: `inset(0 0 0 ${split}%)`
      }}>
          <div className="absolute left-0 top-0 origin-top-left" style={pz.contentStyle}>
            <DataFlowMap graph={target} marks={targetMarks} edgeMarks={targetEdgeMarks} selectedId={selectedId} onSelect={onSelect} />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-blue-400" style={{
        left: `${split}%`
      }} aria-hidden />
        <button type="button" role="slider" aria-label="Comparison divider" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(split)} aria-valuetext={`${Math.round(split)}% as-is shown`} onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      }} onPointerMove={(e) => dragging.current && moveSplit(e.clientX)} onPointerUp={() => dragging.current = false} onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          e.stopPropagation();
          setSplit((s) => Math.min(96, Math.max(4, s + (e.key === "ArrowLeft" ? -4 : 4))));
        }
      }} className="absolute top-1/2 z-10 flex h-9 w-6 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-blue-400 bg-[#0B1220] text-blue-300 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300" style={{
        left: `${split}%`
      }}>
          <ChevronsLeftRightIcon size={13} aria-hidden />
        </button>
        <span className="pointer-events-none absolute left-3 top-3 rounded-md border border-white/15 bg-[#0B1220]/90 px-2 py-0.5 text-[11px] font-medium text-slate-200">Before · as-is</span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-md border border-violet-400/40 bg-[#0B1220]/90 px-2 py-0.5 text-[11px] font-medium text-violet-300">After · best practice</span>

        <Flex className="absolute bottom-3 left-3 z-10 items-center gap-0.5 rounded-lg border border-white/[0.1] bg-[#0B1220]/90 p-0.5">
          <IconButton aria-label="Zoom out" size="xs" variant="ghost" icon={<MinusIcon size={13} />} onClick={() => pz.zoomAt(1 / 1.2)} />
          <IconButton aria-label="Zoom in" size="xs" variant="ghost" icon={<PlusIcon size={13} />} onClick={() => pz.zoomAt(1.2)} />
          <IconButton aria-label="Fit view" size="xs" variant="ghost" icon={<MaximizeIcon size={12} />} onClick={pz.fit} />
        </Flex>
        <Text className="pointer-events-none absolute bottom-3 right-3 hidden text-[11.5px] text-slate-500 md:block">
          Drag the divider or use ← → · drag to pan · Ctrl/⌘ + scroll to zoom
        </Text>
      </div>

      {sel && <Box role="dialog" aria-label={`${sel.data.label} comparison`} className="absolute right-3 top-12 z-20 w-[300px] rounded-xl border border-white/[0.12] bg-[#0B1220]/95 p-3.5 shadow-2xl backdrop-blur" onPointerDown={(e) => e.stopPropagation()}>
          <Flex className="items-start gap-2">
            <Box className="min-w-0 flex-1">
              <Text className="text-[13.5px] font-semibold text-white">{sel.data.label}</Text>
              <Text className="text-[11.5px] text-slate-400">{categoryMeta[sel.data.category].label}{before && after && before.data.label !== after.data.label ? ` · was ${before.data.label}` : ""}</Text>
            </Box>
            <IconButton aria-label="Close details" size="xs" variant="ghost" icon={<XIcon size={13} />} onClick={() => onSelect(null)} />
          </Flex>

          <Box as="dl" className="mt-3 grid grid-cols-[auto_1fr_auto_1fr] items-center gap-x-2 gap-y-2 text-[12px]">
            {sBefore && sAfter && <>
                <dt className="text-[10.5px] text-slate-500">Status</dt>
                <dd className={sBefore === sAfter ? "col-span-3 text-slate-200" : "text-slate-300"}>{sBefore.label}</dd>
                {sBefore !== sAfter && <><ArrowRightIcon size={11} className="text-slate-600" aria-hidden /><dd className="text-teal-300">{sAfter.label}</dd></>}
              </>}
            {before && after && <>
                <dt className="text-[10.5px] text-slate-500">Weight</dt>
                <dd className="num text-slate-300">{before.data.weight.toFixed(2)}</dd>
                <ArrowRightIcon size={11} className="text-slate-600" aria-hidden />
                <dd className="num text-teal-300">{after.data.weight.toFixed(2)}</dd>
              </>}
          </Box>

          {beforeFlags.length > 0 && <Box className="mt-3 rounded-lg border border-rose-400/25 bg-rose-500/[0.06] px-2.5 py-2">
              <Text className="flex items-center gap-1 text-[11px] font-semibold text-rose-300"><TriangleAlertIcon size={11} aria-hidden />As-is red flags</Text>
              <Box as="ul" className="mt-1 space-y-0.5 text-[11.5px] text-slate-300">
                {beforeFlags.map((f) => <li key={f}>• {f}</li>)}
              </Box>
            </Box>}
          {(fix || control) && <Box className="mt-2 rounded-lg border border-teal-400/25 bg-teal-500/[0.06] px-2.5 py-2">
              <Text className="text-[11px] font-semibold text-teal-300">{control ? "New in best practice" : "Best practice"}</Text>
              <Text className="mt-0.5 text-[11.5px] leading-relaxed text-slate-300">{fix?.fix ?? control?.summary}</Text>
            </Box>}
          {!fix && !control && <Text className="mt-3 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[11.5px] text-slate-300">No gaps recorded — kept in the target design.</Text>}
        </Box>}
    </Box>;
}