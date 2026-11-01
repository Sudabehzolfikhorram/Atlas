import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Flex, Heading, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Popover, PopoverBody, PopoverContent, PopoverHeader, PopoverTrigger, Select, Text, useDisclosure } from "@chakra-ui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangleIcon, ChevronDownIcon, ColumnsIcon, Maximize2Icon, RotateCcwIcon, SearchIcon } from "lucide-react";
import { useOrgMap, type OrgMapModel } from "../../hooks/useOrgMap";
import type { OrgWorkflow, WorkflowFilter } from "../../types/orgMap";
import { getWorkflow, mapIssues } from "../../utils/orgMap";
import { OrgMapCanvas, PANEL_W, type MapView } from "../orgMap/OrgMapCanvas";
import { OrgMapInspector } from "../orgMap/OrgMapInspector";
import { WorkflowDetailView } from "../orgMap/WorkflowDetailView";
import { InfoTip } from "../ui/InfoTip";
import type { ComparisonTab } from "../processMap/ProcessComparisonView";
type Drill = {
  wf: OrgWorkflow;
  tab: ComparisonTab;
} | null;
const filters: {
  value: WorkflowFilter;
  label: string;
}[] = [{
  value: "all",
  label: "All workflows"
}, {
  value: "shared",
  label: "Shared by 4+ teams"
}, {
  value: "comparable",
  label: "Comparison available"
}, {
  value: "low-evidence",
  label: "Limited evidence (<60%)"
}];

/** Organization-to-workflow map; drilling into a workflow opens its process comparison. */
export function ProcessComparisonSection({
  embedded = false



}: { /** When shown inside another section, its own heading is omitted. */embedded?: boolean;} = {}) {
  const model = useOrgMap();
  const [drill, setDrill] = useState<Drill>(null);
  const expanded = useDisclosure();
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const returnTo = useRef<string | null>(null);
  const savedView = useRef<MapView | null>(null);
  const savedScroll = useRef<number | null>(null);
  const scroller = () => sectionRef.current?.closest("main") as HTMLElement | null;

  /** Overview → workflow detail. Remembers scroll so Back can restore it. */
  const open = (wf: OrgWorkflow, tab: ComparisonTab) => {
    expanded.onClose();
    model.setHover(null);
    if (!drill) savedScroll.current = scroller()?.scrollTop ?? null;
    returnTo.current = wf.id;
    setDrill({
      wf,
      tab
    });
    requestAnimationFrame(() => sectionRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start"
    }));
  };
  /** Workflow detail → overview, restoring selection, filters, search, zoom and scroll. */
  const back = () => {
    setDrill(null);
    if (returnTo.current) model.setSelection({
      kind: "workflow",
      id: returnTo.current
    });
    const y = savedScroll.current;
    window.setTimeout(() => {
      const el = scroller();
      if (el && y !== null) el.scrollTo({
        top: y,
        behavior: "auto"
      });
      document.getElementById("org-map-region")?.focus({
        preventScroll: true
      });
    }, reduce ? 0 : 260);
  };
  useEffect(() => {
    if (drill) document.getElementById("wf-crumb-root")?.focus({
      preventScroll: true
    });
  }, [drill?.wf.id]);
  const fade = reduce ? {} : {
    initial: {
      opacity: 0,
      y: 8
    },
    animate: {
      opacity: 1,
      y: 0
    },
    exit: {
      opacity: 0,
      y: -8
    },
    transition: {
      duration: 0.22
    }
  };
  return <Box as="section" id={embedded ? undefined : "overview-workflows"} ref={sectionRef} aria-labelledby={embedded ? undefined : "process-comparison-title"} aria-label={embedded ? "Process view" : undefined} className="scroll-mt-6 rounded-3xl">
      <Flex className={`mb-4 items-center gap-1.5 ${embedded ? "hidden" : ""}`}>
        <Heading as="h2" id="process-comparison-title" className="!text-[21px] !font-semibold tracking-tight text-white">Organization & workflows</Heading>
        <InfoTip label="Organization & workflows">
          {drill ? "Compare how this workflow runs today with the best-practice proposal." : "See which teams take part in each workflow. Select a team or workflow for details, or open a workflow to compare it with best practice."}
          <span className="mt-2 block text-slate-400">Meridian Energy is a fictitious organization; teams and relationships come from sample records, not a verified org chart.</span>
        </InfoTip>
      </Flex>

      <AnimatePresence mode="wait" initial={false}>
        {drill ? <motion.div key={`wf-${drill.wf.id}`} {...fade}>
            <WorkflowDetailView wf={drill.wf} tab={drill.tab} onTabChange={(tab) => setDrill((d) => d ? {
          ...d,
          tab
        } : d)} onBack={back} onOpenWorkflow={(wf) => open(wf, drill.tab)} />
          </motion.div> : <motion.div key="org-map" {...fade}>
            <Box className="glass overflow-hidden rounded-3xl">
              <MapToolbar model={model} onExpand={expanded.onOpen} />
              <Box className="p-4 md:p-5">
                <MapStage model={model} onOpenComparison={open} initialView={savedView.current} onViewChange={(v) => savedView.current = v} />
                <MapLegendRow />
              </Box>
            </Box>
          </motion.div>}
      </AnimatePresence>

      <Modal isOpen={expanded.isOpen} onClose={expanded.onClose} size="full" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent className="!m-4 !h-[calc(100vh-2rem)] !w-auto !max-w-none overflow-hidden !rounded-3xl">
          <ModalHeader className="!py-3">
            <Text className="text-[17px] font-semibold text-white">Organization & workflows</Text>
            <Text className="text-[13px] font-normal text-slate-500">Drag to pan · Ctrl/⌘ + scroll to zoom · Esc to close</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody className="!flex !min-h-0 !flex-col !pb-5">
            <MapToolbar model={model} compact />
            <Box className="mt-3 flex min-h-[420px] min-w-0 flex-1 flex-col">
              <MapStage model={model} onOpenComparison={open} fill />
              <MapLegendRow />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>;
}

/** Full-width map with the issues control and a details panel that appears only after a selection. */
function MapStage({
  model,
  onOpenComparison,
  fill = false,
  initialView,
  onViewChange






}: {model: OrgMapModel;onOpenComparison: (wf: OrgWorkflow, tab: ComparisonTab) => void;fill?: boolean;initialView?: MapView | null;onViewChange?: (v: MapView) => void;}) {
  const reduce = useReducedMotion();
  const close = () => {
    model.setSelection(null);
    document.getElementById("org-map-region")?.focus({
      preventScroll: true
    });
  };
  return <Box className={`relative ${fill ? "min-h-0 flex-1" : ""}`}>
      <OrgMapCanvas model={model} fill={fill} initialView={initialView} onViewChange={onViewChange} />
      <NeedsAttention model={model} />
      <AnimatePresence>
        {model.selection && <motion.div key="panel" initial={reduce ? false : {
        opacity: 0,
        x: 16
      }} animate={{
        opacity: 1,
        x: 0
      }} exit={reduce ? {
        opacity: 0
      } : {
        opacity: 0,
        x: 16
      }} transition={{
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1]
      }} className="mt-3 flex max-h-[80vh] flex-col overflow-y-auto rounded-2xl border border-white/10 bg-[#0D1526]/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-md md:absolute md:bottom-3 md:right-3 md:top-3 md:z-10 md:mt-0 md:max-h-none md:w-[var(--panel-w)]" style={{
        ["--panel-w" as string]: `${PANEL_W}px`
      } as React.CSSProperties}>
            <OrgMapInspector model={model} onOpenComparison={onOpenComparison} onClose={close} />
          </motion.div>}
      </AnimatePresence>
    </Box>;
}

/** Compact control listing every issue on the map; picking one selects its workflow. */
function NeedsAttention({
  model


}: {model: OrgMapModel;}) {
  const {
    isOpen,
    onOpen,
    onClose
  } = useDisclosure();
  const count = mapIssues.length;
  const high = mapIssues.filter((i) => i.severity === "high").length;
  return <Box className="absolute left-3 top-3 z-10">
      <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} placement="bottom-start" isLazy>
        <PopoverTrigger>
          <Button size="sm" variant="outline" aria-haspopup="dialog" leftIcon={<AlertTriangleIcon size={15} className={count ? "text-amber-300" : "text-slate-500"} />} rightIcon={<ChevronDownIcon size={15} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />} className="!h-9 !bg-[#0B1222]/90 !text-[13.5px] backdrop-blur-md" style={{
          width: "fit-content",
          alignItems: "center",
          justifyContent: "flex-end"
        }}>
            Needs attention · <span className="num ml-1">{count}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="!w-[360px] !max-w-[calc(100vw-2rem)]">
          <PopoverHeader className="!border-white/[0.06] !py-2.5">
            <Text className="text-[14px] font-semibold text-white">Needs attention</Text>
            <Text className="text-[12.5px] font-normal text-slate-400">{count} items · {high} high · from workflow records</Text>
          </PopoverHeader>
          <PopoverBody className="!max-h-[360px] !overflow-y-auto !p-1.5">
            {count === 0 ? <Text className="px-2 py-6 text-center text-[13.5px] text-slate-400">Nothing needs attention right now.</Text> : <Box as="ul">
                {mapIssues.map((i) => {
              const wf = getWorkflow(i.workflowId);
              const active = model.selection?.kind === "workflow" && model.selection.id === i.workflowId;
              return <li key={i.id}>
                      <button type="button" onClick={() => {
                  model.setSelection({
                    kind: "workflow",
                    id: i.workflowId
                  });
                  onClose();
                }} className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${active ? "bg-blue-500/10" : ""}`}>
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${i.severity === "high" ? "bg-rose-400" : "bg-amber-400"}`} aria-label={i.severity === "high" ? "High" : "Medium"} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] font-medium text-slate-100">{wf?.name}</span>
                          <span className="block truncate text-[12.5px] text-slate-400">{i.title}</span>
                        </span>
                      </button>
                    </li>;
            })}
              </Box>}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>;
}
function MapToolbar({
  model,
  onExpand,
  compact = false




}: {model: OrgMapModel;onExpand?: () => void;compact?: boolean;}) {
  const {
    query,
    setQuery,
    filter,
    setFilter,
    visible,
    reset
  } = model;
  const count = visible.teams.size + visible.workflows.size;
  return <Flex role="search" className={`flex-wrap items-center gap-2 ${compact ? "" : "border-b border-white/[0.06] px-4 py-3 md:px-5"}`}>
      <InputGroup className="!w-full sm:!w-72">
        <InputLeftElement pointerEvents="none"><SearchIcon size={16} className="text-slate-500" /></InputLeftElement>
        <Input aria-label="Search teams and workflows" placeholder="Search teams, workflows, stages…" value={query} onChange={(e) => setQuery(e.target.value)} className="!text-[14px]" />
      </InputGroup>
      
      {visible.active && <Text className="text-[13px] text-slate-400" aria-live="polite">
          {count === 0 ? "No matches — try a different search or filter" : `${visible.teams.size} teams · ${visible.workflows.size} workflows match`}
        </Text>}
      <Flex className="items-center gap-2 sm:ml-auto">
        <Button variant="ghost" size="sm" leftIcon={<RotateCcwIcon size={15} />} onClick={reset}>Reset</Button>
        {onExpand && <Button variant="outline" size="sm" leftIcon={<Maximize2Icon size={15} />} onClick={onExpand}>Expand</Button>}
      </Flex>
    </Flex>;
}
function MapLegendRow() {
  return <Flex className="mt-3 flex-wrap items-center gap-x-5 gap-y-2 px-1 text-[13px] text-slate-400">
      <Flex className="items-center gap-1.5"><svg width="24" height="6" aria-hidden><line x1="0" y1="3" x2="24" y2="3" stroke="#60A5FA" strokeWidth="2.2" /></svg>Owner</Flex>
      <Flex className="items-center gap-1.5"><svg width="24" height="6" aria-hidden><line x1="0" y1="3" x2="24" y2="3" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="6 4" /></svg>Participant · verified</Flex>
      <Flex className="items-center gap-1.5"><svg width="24" height="6" aria-hidden><line x1="0" y1="3" x2="24" y2="3" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="1.5 4.5" /></svg>Participant · AI-inferred</Flex>
      <Flex className="items-center gap-1.5"><AlertTriangleIcon size={14} className="text-amber-300" aria-hidden />Needs attention</Flex>
      <Flex className="items-center gap-1.5"><ColumnsIcon size={14} className="text-violet-300" aria-hidden />Comparison available</Flex>
    </Flex>;
}