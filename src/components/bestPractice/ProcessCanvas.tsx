import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Flex, IconButton, Text } from "@chakra-ui/react";
import { ChevronsLeftRightIcon, MaximizeIcon, MinusIcon, PlusIcon, SparklesIcon, XIcon } from "lucide-react";
import type { ProcessModel } from "../../types/bestPractice";
import { usePanZoom } from "../../hooks/usePanZoom";
import { formatWait, NODE_H, NODE_W, type ProcessLayout } from "../../utils/bestPractice";
import { SwimlaneMap, type TaskMark } from "./SwimlaneMap";
import { kindMeta, statusMeta } from "./taskMeta";
interface ProcessCanvasProps {
  asIs: ProcessModel;
  target: ProcessModel;
  layout: ProcessLayout;
  compare: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Bumped by the page to pan to the selected task. */
  focusNonce: number;
}

/** Pan/zoom viewport for the target design, or a before/after split with a draggable divider. */
export function ProcessCanvas({
  asIs,
  target,
  layout,
  compare,
  selectedId,
  onSelect,
  focusNonce
}: ProcessCanvasProps) {
  const pz = usePanZoom({
    contentW: layout.width,
    contentH: layout.height,
    onBackgroundClick: () => onSelect(null),
    onEscape: () => onSelect(null)
  });
  const [split, setSplit] = useState(50);
  const dragging = useRef(false);
  const {
    asIsMarks,
    targetMarks
  } = useMemo(() => {
    const tIds = new Map(target.tasks.map((t) => [t.id, t]));
    const aIds = new Map(asIs.tasks.map((t) => [t.id, t]));
    const a: Record<string, TaskMark> = {};
    const t: Record<string, TaskMark> = {};
    asIs.tasks.forEach((x) => {
      if (!tIds.has(x.id)) a[x.id] = "removed";
    });
    target.tasks.forEach((x) => {
      const prev = aIds.get(x.id);
      if (!prev) t[x.id] = "added";else if (prev.waitH !== undefined && x.targetH !== undefined && x.targetH < prev.waitH || prev.status !== x.status) t[x.id] = "changed";
    });
    return {
      asIsMarks: a,
      targetMarks: t
    };
  }, [asIs, target]);
  useEffect(() => {
    if (!selectedId || !focusNonce) return;
    const inTarget = target.tasks.find((t) => t.id === selectedId);
    const task = inTarget ?? asIs.tasks.find((t) => t.id === selectedId);
    if (!task) return;
    const p = layout.pos(task);
    pz.focusOn(p.x + NODE_W / 2, p.y + NODE_H / 2, 300);
    if (compare) setSplit(inTarget && !asIs.tasks.some((t) => t.id === selectedId) ? 12 : !inTarget ? 88 : 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusNonce]);
  const moveSplit = (clientX: number) => {
    const r = pz.vpRef.current?.getBoundingClientRect();
    if (!r) return;
    setSplit(Math.min(96, Math.max(4, (clientX - r.left) / r.width * 100)));
  };
  const selTarget = target.tasks.find((t) => t.id === selectedId);
  const selAsIs = asIs.tasks.find((t) => t.id === selectedId);
  const sel = selTarget ?? selAsIs;
  const laneName = (id: string) => layout.lanes.find((l) => l.lane.id === id)?.lane.label ?? id;
  return <Box className="relative">
      <div ref={pz.vpRef} {...pz.handlers} tabIndex={0} role="application" aria-label={compare ? "Before and after process comparison. Drag to pan, use the divider to compare." : "Best-practice target process. Drag to pan."} className="relative cursor-grab overflow-hidden rounded-xl bg-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:cursor-grabbing" style={{
      ...pz.viewportStyle,
      minHeight: 420
    }}>
        {compare ? <>
            <div className="absolute left-0 top-0 origin-top-left" style={pz.contentStyle}>
              <SwimlaneMap model={asIs} layout={layout} selectedId={selectedId} onSelect={onSelect} marks={asIsMarks} />
            </div>
            <div className="absolute inset-0 bg-[#0A1020]" style={{
          clipPath: `inset(0 0 0 ${split}%)`
        }}>
              <div className="absolute left-0 top-0 origin-top-left" style={pz.contentStyle}>
                <SwimlaneMap model={target} layout={layout} selectedId={selectedId} onSelect={onSelect} marks={targetMarks} />
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
          </> : <div className="absolute left-0 top-0 origin-top-left" style={pz.contentStyle}>
            <SwimlaneMap model={target} layout={layout} selectedId={selectedId} onSelect={onSelect} />
          </div>}

        <Flex className="absolute bottom-3 left-3 z-10 items-center gap-0.5 rounded-lg border border-white/[0.1] bg-[#0B1220]/90 p-0.5">
          <IconButton aria-label="Zoom out" size="xs" variant="ghost" icon={<MinusIcon size={13} />} onClick={() => pz.zoomAt(1 / 1.2)} />
          <IconButton aria-label="Zoom in" size="xs" variant="ghost" icon={<PlusIcon size={13} />} onClick={() => pz.zoomAt(1.2)} />
          <IconButton aria-label="Fit view" size="xs" variant="ghost" icon={<MaximizeIcon size={12} />} onClick={pz.fit} />
        </Flex>
        <Text className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1.5 text-[11.5px] text-slate-500 md:flex">
          {!compare && <SparklesIcon size={12} aria-hidden />}
          {compare ? "Drag the divider or use ← → · drag to pan · Ctrl/⌘ + scroll to zoom" : "Click a task to explore · Ctrl/⌘ + scroll to zoom"}
        </Text>
      </div>

      {sel && <Box role="dialog" aria-label={`${sel.label} details`} className="absolute right-3 top-12 z-20 w-[280px] rounded-xl border border-white/[0.12] bg-[#0B1220]/95 p-3.5 shadow-2xl backdrop-blur" onPointerDown={(e) => e.stopPropagation()}>
          <Flex className="items-start gap-2">
            <Box className="min-w-0 flex-1">
              <Text className="text-[13.5px] font-semibold text-white">{sel.label}</Text>
              <Text className="text-[11.5px] text-slate-400">{laneName(sel.lane)} · {kindMeta[sel.kind].label}</Text>
            </Box>
            <IconButton aria-label="Close details" size="xs" variant="ghost" icon={<XIcon size={13} />} onClick={() => onSelect(null)} />
          </Flex>
          <Box as="dl" className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[12px]">
            <Box><dt className="text-[10.5px] text-slate-500">Events</dt><dd className="num text-slate-100">{sel.events.toLocaleString()}</dd></Box>
            <Box><dt className="text-[10.5px] text-slate-500">Status</dt><dd className={`flex items-center gap-1 ${statusMeta[(selTarget ?? sel).status].tone}`}>{statusMeta[(selTarget ?? sel).status].label}</dd></Box>
            {selAsIs?.waitH !== undefined && <Box><dt className="text-[10.5px] text-slate-500">As-is wait</dt><dd className="num text-slate-100">{formatWait(selAsIs.waitH)}</dd></Box>}
            {selTarget?.targetH !== undefined && <Box><dt className="text-[10.5px] text-slate-500">Target wait</dt><dd className="num text-teal-300">{formatWait(selTarget.targetH)}</dd></Box>}
            {sel.rework !== undefined && <Box><dt className="text-[10.5px] text-slate-500">Rework</dt><dd className="num text-slate-100">{sel.rework}%</dd></Box>}
          </Box>
          {compare && <Text className="mt-3 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[11.5px] text-slate-300">
              {!selTarget ? "Removed in the best-practice design." : !selAsIs ? "New in the best-practice design." : selAsIs.status !== selTarget.status ? `${statusMeta[selAsIs.status].label} in as-is → ${statusMeta[selTarget.status].label.toLowerCase()} in target.` : "Kept unchanged in the target design."}
            </Text>}
          {(selTarget?.note ?? selAsIs?.note) && <Text className="mt-2.5 text-[12px] leading-relaxed text-slate-400">{compare && selAsIs?.note && selTarget?.note ? <>As-is: {selAsIs.note}<br />Target: {selTarget.note}</> : selTarget?.note ?? selAsIs?.note}</Text>}
        </Box>}
    </Box>;
}