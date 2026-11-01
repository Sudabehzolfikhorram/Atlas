import React, { useMemo, useState } from "react";
import { Box, Flex, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Switch, Text, useDisclosure } from "@chakra-ui/react";
import { MaximizeIcon } from "lucide-react";
import { docGroups, flowEdges, histogramStart, monthlyVolume } from "../../data/outcomesFlow";
import type { DocGroup } from "../../types/outcomes";
import { OutcomesFlowGraph, type VisibleEdge } from "../outcomes/OutcomesFlowGraph";
import { InfoTip } from "../ui/InfoTip";
import { SectionHeader } from "./CollapsibleSection";
const MIN_HANDOFFS = 10;

/** Department handoffs: the existing outcomes flow graph with document-group toggles. */
export function DepartmentHandoffs() {
  const full = useDisclosure();
  const [groups, setGroups] = useState<Set<DocGroup>>(() => new Set(docGroups.map((g) => g.id)));
  const [focus, setFocus] = useState<string | null>(null);
  const edges = useMemo<VisibleEdge[]>(() => flowEdges.filter((e) => groups.has(e.group) && e.count >= MIN_HANDOFFS).map((e) => ({
    ...e,
    shown: e.count
  })), [groups]);
  const toggle = (g: DocGroup) => setGroups((prev) => {
    const next = new Set(prev);
    next.has(g) ? next.delete(g) : next.add(g);
    return next;
  });
  const max = Math.max(...monthlyVolume);
  const startYear = Number(String(histogramStart).slice(0, 4)) || 2017;
  const endYear = startYear + Math.floor((monthlyVolume.length - 1) / 12);
  const graph = <OutcomesFlowGraph edges={edges} pathPairs={null} focusNode={focus} onNode={setFocus} />;
  return <Box as="section" aria-labelledby="dh-title" className="glass overflow-hidden rounded-2xl">
      <SectionHeader id="dh-title" title={<>Department handoffs<InfoTip label="Department handoffs">Documents passed between roles. Line colour is the document type, width is the number of handoffs. Click a role to focus on its handoffs.</InfoTip></>}>
        <span className="rounded-md border border-white/[0.1] px-2 py-1 text-[11.5px] text-slate-300">All event-log cases</span>
        <IconButton aria-label="Open full screen" size="sm" variant="outline" icon={<MaximizeIcon size={14} />} onClick={full.onOpen} />
      </SectionHeader>
      <Flex className="flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/[0.06] px-5 py-3" role="group" aria-label="Document types">
        {docGroups.map((g) => <Flex key={g.id} as="label" className="cursor-pointer items-center gap-2 text-[12.5px] text-slate-300">
            <Switch size="sm" isChecked={groups.has(g.id)} onChange={() => toggle(g.id)} />
            <span className="h-2 w-2 rounded-full" style={{
          background: g.color
        }} aria-hidden />
            {g.label}
          </Flex>)}
        <Box className="ml-auto">
          <InfoTip label="Guide">Hover a line for its handoff count. Click a role to show only its handoffs; click it again to reset. Toggle document types to simplify the map.</InfoTip>
        </Box>
      </Flex>
      <Box className="p-4">{graph}</Box>
      <Flex className="flex-wrap items-center gap-3 border-t border-white/[0.06] px-5 py-3 text-[12px] text-slate-400">
        <Text>Whole log · Minimum handoffs: {MIN_HANDOFFS}</Text>
        <Text className="ml-auto">Cases arrived / ended</Text>
        <svg width="180" height="34" viewBox={`0 0 ${monthlyVolume.length * 4} 34`} preserveAspectRatio="none" role="img" aria-label="Monthly case volume" className="rounded border border-white/[0.1] bg-white/[0.02]">
          {monthlyVolume.map((v, i) => <rect key={i} x={i * 4 + 0.5} y={34 - v / max * 30} width={3} height={v / max * 30} fill="rgba(148,163,184,0.55)" />)}
        </svg>
        <Text className="num">{startYear}–{endYear}</Text>
      </Flex>

      <Modal isOpen={full.isOpen} onClose={full.onClose} size="full" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent className="!m-4 !h-[calc(100vh-2rem)] !w-auto !max-w-none overflow-hidden !rounded-3xl">
          <ModalHeader className="!py-3"><Text className="text-[17px] font-semibold text-white">Department handoffs</Text></ModalHeader>
          <ModalCloseButton />
          <ModalBody className="!pb-5">{graph}</ModalBody>
        </ModalContent>
      </Modal>
    </Box>;
}