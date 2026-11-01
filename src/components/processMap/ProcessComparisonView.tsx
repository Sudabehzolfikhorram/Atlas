import React, { useState } from "react";
import { Box, Button, Flex, Text, useDisclosure } from "@chakra-ui/react";
import { BookOpenIcon, ColumnsIcon, NetworkIcon, RotateCcwIcon, SparklesIcon, TriangleAlertIcon, WorkflowIcon } from "lucide-react";
import type { MapMode, MapVariant, PeriodKey, ProcessId } from "../../types/processMap";
import { usePlayback } from "../../hooks/usePlayback";
import { LAST_MONTH, casesAt, clampMonth, defaultSelection, getPeriod, getProcess, periodStart, recommendationCompatibility } from "../../utils/processMap";
import { MapChartPanel } from "./MapChartPanel";
import { MapInspector } from "./MapInspector";
import { ProcessDetailsModal } from "./ProcessDetailsModal";
import { TimelineFooter } from "./TimelineFooter";
export type ComparisonTab = "current" | "ai" | "side";
const tabs: {
  id: ComparisonTab;
  label: string;
  icon: typeof NetworkIcon;
}[] = [{
  id: "current",
  label: "Current process",
  icon: NetworkIcon
}, {
  id: "ai",
  label: "Best practice",
  icon: SparklesIcon
}, {
  id: "side",
  label: "Side by side",
  icon: ColumnsIcon
}];
interface Props {
  processId: ProcessId;
  /** Controlled so the selected view survives navigation between workflows. */
  tab: ComparisonTab;
  onTabChange: (t: ComparisonTab) => void;
}

/** Current process / Best practice / Side by side for one workflow. */
export function ProcessComparisonView({
  processId,
  tab,
  onTabChange: setTab
}: Props) {
  const process = getProcess(processId);
  const initialSelection = () => defaultSelection(process, process.recommendation ? "recommended" : "current");
  const [period, setPeriod] = useState<PeriodKey>("12m");
  const [month, setMonth] = useState(LAST_MONTH);
  const [mode, setMode] = useState<MapMode>("relationships");
  const [selectedId, setSelectedId] = useState<string | null>(initialSelection);
  const details = useDisclosure();
  const {
    playing,
    toggle,
    stop
  } = usePlayback({
    month,
    start: periodStart(period),
    end: LAST_MONTH,
    setMonth
  });
  const compat = recommendationCompatibility(process, period);
  const rec = process.recommendation;
  const recUnavailable = !compat.ok ? compat.reason : null;
  const detailsVariant: MapVariant = tab === "current" ? "current" : "recommended";
  const changePeriod = (p: PeriodKey) => {
    setPeriod(p);
    setMonth((m) => clampMonth(p, m));
  };
  const reset = () => {
    stop();
    setMonth(LAST_MONTH);
    setMode("relationships");
    setSelectedId(initialSelection());
  };
  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    setTab(next.id);
    document.getElementById(`pc-tab-${next.id}`)?.focus();
  };
  const unavailableState = recUnavailable && <Flex className="aspect-[800/360] min-h-[240px] flex-col items-center justify-center gap-3 px-6 text-center" role="status">
      <Flex className="h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300"><TriangleAlertIcon size={18} /></Flex>
      <Text className="text-[14px] font-medium text-white">No recommendation for this selection</Text>
      <Text className="max-w-lg text-[12.5px] leading-relaxed text-slate-400">{recUnavailable}</Text>
      {rec && <Flex className="flex-wrap justify-center gap-2">
          {rec.baselines.map((b) => <Button key={b} size="xs" onClick={() => changePeriod(b)}>Use {getPeriod(b).label}</Button>)}
        </Flex>}
    </Flex>;
  const currentChips = <span className="rounded-md border border-teal-400/25 bg-teal-400/[0.08] px-2 py-0.5 text-teal-200">Observed · {getPeriod(period).label}</span>;
  const aiChips = rec ? <>
      <span className="inline-flex items-center gap-1 rounded-md border border-violet-400/25 bg-violet-400/[0.08] px-2 py-0.5 text-violet-200">
        {rec.reference ? <><BookOpenIcon size={11} aria-hidden />Best-practice reference</> : <><SparklesIcon size={11} aria-hidden />Best practice</>}
      </span>
      <span className="rounded-md border border-white/10 px-2 py-0.5 text-slate-300">{rec.version} · {rec.generatedOn}</span>
      <span className="rounded-md border border-white/10 px-2 py-0.5 text-slate-400">Proposal · not observed</span>
    </> : null;
  const shared = {
    process,
    mode,
    month,
    selectedId,
    onSelect: setSelectedId
  };
  const currentPanel = <MapChartPanel variant="current" title="Current process" subtitle="How work happens across your company today." chips={currentChips} unavailable={null} {...shared} />;
  const aiPanel = <MapChartPanel variant="recommended" title="Best practice" subtitle="The proposed workflow and the changes behind it." chips={aiChips} unavailable={unavailableState || null} {...shared} />;
  return <Box className="glass overflow-hidden rounded-3xl">
      <Flex className="flex-wrap items-baseline gap-x-2 px-4 pt-4 md:px-5">
        <Text className="text-[15px] font-semibold text-white">Process comparison</Text>
        <Text className="text-[12px] text-slate-500">Observed workflow vs. best-practice proposal</Text>
      </Flex>

      {/* Tabs + view controls */}
      <Flex className="flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3 md:px-5">
        <Flex role="tablist" aria-label="Process view" className="inline-flex rounded-xl border border-white/[0.08] bg-black/20 p-1">
          {tabs.map((t, i) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return <button key={t.id} id={`pc-tab-${t.id}`} type="button" role="tab" aria-selected={active} aria-controls="pc-panel" tabIndex={active ? 0 : -1} onClick={() => setTab(t.id)} onKeyDown={(e) => onTabKey(e, i)} className={`relative inline-flex h-8 items-center gap-2 rounded-lg px-3 text-[12.5px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${active ? "border border-white/10 bg-white/[0.1] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" : "border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"}`}>
                <Icon size={13} aria-hidden className={active ? t.id === "current" ? "text-blue-300" : "text-violet-300" : ""} />
                {t.label}
              </button>;
        })}
        </Flex>
        <Flex className="flex-wrap items-center gap-2 sm:ml-auto">
          <Flex role="group" aria-label="Map view" className="rounded-xl border border-white/[0.08] bg-black/20 p-0.5">
            {([["relationships", "Relationships", NetworkIcon], ["flow", "Data flow", WorkflowIcon]] as const).map(([m, label, Icon]) => <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={`inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${mode === m ? "bg-white/[0.12] text-white" : "text-slate-400 hover:text-slate-200"}`}>
                <Icon size={13} aria-hidden />{label}
              </button>)}
          </Flex>
          <Button variant="ghost" size="sm" leftIcon={<RotateCcwIcon size={13} />} onClick={reset}>Reset</Button>
          <Button variant="outline" size="sm" onClick={details.onOpen}>{tab === "current" ? "View process details" : "View recommendation"}</Button>
        </Flex>
      </Flex>

      <Box id="pc-panel" role="tabpanel" aria-labelledby={`pc-tab-${tab}`} className={`grid gap-4 p-4 md:p-5 ${tab === "side" ? "xl:grid-cols-2" : ""}`}>
        {tab !== "ai" && currentPanel}
        {tab !== "current" && aiPanel}
      </Box>

      {tab !== "current" && !recUnavailable && <Box as="aside" aria-label="Recommendation inspector" aria-live="polite" className="border-t border-white/[0.06] p-4 md:p-5">
          <Box className="max-w-3xl">
            <MapInspector process={process} variant="recommended" period={period} month={month} selectedId={selectedId} />
          </Box>
        </Box>}

      <TimelineFooter period={period} month={month} onMonth={(m) => {
      stop();
      setMonth(m);
    }} playing={playing} onTogglePlay={toggle} snapshotLabel={tab === "side" ? "Shared snapshot" : "Map snapshot"} sliderLabel="Snapshot month" count={<><b className="num font-medium text-violet-200">{process.sources[month]}</b> sources · {casesAt(process, month).toLocaleString()} cases</>} />
      <ProcessDetailsModal isOpen={details.isOpen} onClose={details.onClose} process={process} variant={detailsVariant} period={period} month={month} />
    </Box>;
}