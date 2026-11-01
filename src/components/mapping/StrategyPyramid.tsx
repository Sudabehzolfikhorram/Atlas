import React, { useMemo, useState } from "react";
import { Box, Flex, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, useDisclosure } from "@chakra-ui/react";
import { ArrowRightIcon, MaximizeIcon, XIcon } from "lucide-react";
import { pyramidLayers, pyramidLinks, pyramidNodes, pyramidRecords } from "../../data/strategyPyramid";
import type { PyramidLayer, PyramidNode } from "../../types/strategyPyramid";
import { InfoTip } from "../ui/InfoTip";
import { SectionHeader } from "./CollapsibleSection";
const W = 1100;
const CX = W / 2;
const H = 450;
const bands: Record<PyramidLayer, {
  y: number;
  h: number;
}> = {
  strategy: {
    y: 8,
    h: 92
  },
  policy: {
    y: 108,
    h: 92
  },
  program: {
    y: 208,
    h: 104
  },
  project: {
    y: 322,
    h: 56
  },
  action: {
    y: 388,
    h: 56
  }
};
const half = (y: number) => 150 + y * 0.92;
const labelled: PyramidLayer[] = ["strategy", "policy", "program"];
const byLayer = (l: PyramidLayer) => pyramidNodes.filter((n) => n.layer === l);
const pos = new Map<string, {
  x: number;
  y: number;
}>();
pyramidLayers.forEach(({
  id
}) => {
  const list = byLayer(id);
  const b = bands[id];
  const y = labelled.includes(id) ? b.y + b.h * 0.42 : b.y + b.h * 0.58;
  const spread = half(y) - (labelled.includes(id) ? 80 : 40);
  list.forEach((n, i) => pos.set(n.id, {
    x: CX - spread + 2 * spread * (i + 0.5) / list.length,
    y
  }));
});
const children = new Map<string, string[]>();
const parents = new Map<string, string[]>();
pyramidLinks.forEach((l) => {
  children.set(l.from, [...(children.get(l.from) ?? []), l.to]);
  parents.set(l.to, [...(parents.get(l.to) ?? []), l.from]);
});
function walk(start: string, map: Map<string, string[]>, out: Set<string>) {
  (map.get(start) ?? []).forEach((n) => {
    if (!out.has(n)) {
      out.add(n);
      walk(n, map, out);
    }
  });
}
const radius = (n: PyramidNode) => n.layer === "strategy" ? 9 + Math.sqrt(n.records) * 0.85 : n.layer === "policy" ? 5 + Math.sqrt(n.records) * 0.55 : n.layer === "program" ? 4.5 + Math.sqrt(n.records) * 0.45 : n.layer === "project" ? 2.6 : 1.5;
function wrap(s: string, max: number): string[] {
  const lines: string[] = [];
  s.split(" ").forEach((w) => {
    const last = lines[lines.length - 1];
    if (last && (last + " " + w).length <= max) lines[lines.length - 1] = `${last} ${w}`;else lines.push(w);
  });
  return lines.slice(0, 3);
}
const counts = pyramidLayers.map((l) => ({
  ...l,
  n: byLayer(l.id).length
}));

/** Strategy pyramid: strategies → policies → programs → projects → actions, with traced records. */
export function StrategyPyramid() {
  const full = useDisclosure();
  const [sel, setSel] = useState<string | null>(null);
  const related = useMemo(() => {
    if (!sel) return null;
    const s = new Set([sel]);
    walk(sel, children, s);
    walk(sel, parents, s);
    return s;
  }, [sel]);
  const selNode = pyramidNodes.find((n) => n.id === sel);
  const svg = <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Strategy pyramid">
      {pyramidLayers.map((l, i) => {
      const b = bands[l.id];
      const t = half(b.y);
      const bt = half(b.y + b.h);
      return <g key={l.id}>
            <polygon points={`${CX - t},${b.y} ${CX + t},${b.y} ${CX + bt},${b.y + b.h} ${CX - bt},${b.y + b.h}`} fill="rgba(148,163,184,0.05)" stroke="rgba(148,163,184,0.12)" />
            <text x={CX - t + 18} y={b.y + 16} fill="#E2E8F0" fontSize={11.5} fontWeight={600}>{i + 1}. {l.title}</text>
            <text x={CX - t + 18} y={b.y + 29} fill="#64748B" fontSize={9.5}>{counts[i].n} nodes · {pyramidRecords} records</text>
          </g>;
    })}
      {pyramidLinks.map((l) => {
      const a = pos.get(l.from);
      const b = pos.get(l.to);
      if (!a || !b) return null;
      const deep = l.layer === "project" || l.layer === "program";
      const hot = related ? related.has(l.from) && related.has(l.to) : false;
      const my = (a.y + b.y) / 2;
      return <path key={l.id} d={`M${a.x},${a.y} C${a.x},${my} ${b.x},${my} ${b.x},${b.y}`} fill="none" stroke={hot ? "#2DD4BF" : "rgba(96,165,250,0.5)"} strokeWidth={deep ? hot ? 0.9 : 0.4 : 0.6 + Math.log2(1 + l.records) * (hot ? 0.7 : 0.45)} opacity={related ? hot ? 0.95 : 0.06 : deep ? 0.2 : 0.55} />;
    })}
      {pyramidNodes.map((n) => {
      const p = pos.get(n.id)!;
      const r = radius(n);
      const on = related?.has(n.id);
      const isSel = sel === n.id;
      const big = labelled.includes(n.layer);
      const dim = related && !on;
      return <g key={n.id} role={big ? "button" : undefined} tabIndex={big ? 0 : undefined} aria-label={big ? `${n.label}, ${n.records} records` : undefined} aria-pressed={big ? isSel : undefined} onClick={() => setSel(isSel ? null : n.id)} onKeyDown={(e) => {
        if (big && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          setSel(isSel ? null : n.id);
        }
      }} className="cursor-pointer outline-none" opacity={dim ? 0.3 : 1}>
            <title>{`${n.label} · ${n.records} records`}</title>
            <circle cx={p.x} cy={p.y} r={r + (big ? 3 : 1.5)} fill="transparent" />
            <circle cx={p.x} cy={p.y} r={r} fill={on ? "rgba(45,212,191,0.3)" : "rgba(59,130,246,0.28)"} stroke={isSel ? "#fff" : on ? "#2DD4BF" : "#60A5FA"} strokeWidth={isSel ? 2 : big ? 1.2 : 0.6} />
            {n.layer !== "project" && n.layer !== "action" && n.layer !== "program" && <text x={p.x} y={p.y + 3} textAnchor="middle" fill="#fff" fontSize={n.layer === "strategy" ? 9 : 7.5} fontWeight={600}>{n.records}</text>}
            {big && wrap(n.label, n.layer === "strategy" ? 30 : 16).map((line, k) => <text key={k} x={p.x} y={p.y + r + 11 + k * 10} textAnchor="middle" fill={on ? "#F8FAFC" : "#CBD5E1"} fontSize={n.layer === "strategy" ? 10.5 : 8.5} fontWeight={n.layer === "strategy" ? 600 : 500}>{line}</text>)}
          </g>;
    })}
    </svg>;
  return <Box as="section" aria-labelledby="sp-title" className="glass overflow-hidden rounded-2xl">
      <SectionHeader id="sp-title" title={<>Strategy pyramid<InfoTip label="Strategy pyramid">How corporate strategies cascade into policies, programs, projects (processes) and operational actions. Circle size and line width show how many catalog records trace through each item.</InfoTip></>}>
        <IconButton aria-label="Open full screen" size="sm" variant="outline" icon={<MaximizeIcon size={14} />} onClick={full.onOpen} />
      </SectionHeader>
      <Flex className="flex-wrap items-center gap-1.5 px-5 pt-3 text-[11.5px] text-slate-300">
        {counts.map((c, i) => <React.Fragment key={c.id}>
            {i > 0 && <ArrowRightIcon size={12} className="text-slate-600" aria-hidden />}
            <span className="num rounded-md border border-white/[0.1] bg-white/[0.03] px-2 py-0.5">{c.n} {c.plural}</span>
          </React.Fragment>)}
      </Flex>
      <Box className="overflow-x-auto px-3 py-2"><Box className="min-w-[760px]">{svg}</Box></Box>
      <Flex className="min-h-[48px] flex-wrap items-center gap-2 border-t border-white/[0.06] px-5 py-2.5 text-[12px] text-slate-400">
        {selNode ? <>
            <Text className="text-slate-200"><span className="font-medium text-white">{selNode.label}</span> · {selNode.records} records · {(children.get(selNode.id) ?? []).length} downstream · {(parents.get(selNode.id) ?? []).length} upstream</Text>
            <button type="button" onClick={() => setSel(null)} className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-blue-300 hover:text-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"><XIcon size={12} />Clear</button>
          </> : <Text>Select a labeled item to inspect its connections.</Text>}
        <Box className="ml-auto"><InfoTip label="How to read this map">Each band is one layer. Lines connect an item to the items that deliver it; thicker lines carry more records. Select a strategy, policy or program to highlight everything above and below it.</InfoTip></Box>
      </Flex>

      <Modal isOpen={full.isOpen} onClose={full.onClose} size="full" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent className="!m-4 !h-[calc(100vh-2rem)] !w-auto !max-w-none overflow-hidden !rounded-3xl">
          <ModalHeader className="!py-3"><Text className="text-[17px] font-semibold text-white">Strategy pyramid</Text></ModalHeader>
          <ModalCloseButton />
          <ModalBody className="!flex !items-center !pb-5">{svg}</ModalBody>
        </ModalContent>
      </Modal>
    </Box>;
}