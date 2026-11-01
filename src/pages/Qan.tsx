import React, { useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { QanKpis } from "../components/diligence/QanKpis";
import { isActionable, reviewerTask } from "../utils/workflow";
import { qanUrl } from "../utils/qanLinks";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ActivityIcon, Building2Icon, ShieldCheckIcon } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { QualityControlTab } from "../components/diligence/QualityControlTab";
import { AssuranceTab } from "../components/diligence/AssuranceTab";
import { FindingDrawer } from "../components/diligence/FindingDrawer";
import { useDiligence } from "../contexts/DiligenceContext";
import { useScreenInit } from "../useScreenInit.js";
import type { DiligenceArea, QanTab } from "../types/diligence";
type QanView = Exclude<QanTab, "asbuilt">;
const views: {
  id: QanView;
  label: string;
  Icon: typeof ActivityIcon;
}[] = [{
  id: "quality",
  label: "Continuous Quality Control",
  Icon: ActivityIcon
}, {
  id: "assurance",
  label: "Control assurance",
  Icon: ShieldCheckIcon
}];
const descriptions: Record<DiligenceArea, string> = {
  data: "Quality Control runs checks; Assurance makes decisions and approvals on data findings.",
  process: "Quality Control runs checks; Assurance makes decisions and approvals on process findings."
};
const spring = {
  type: "spring",
  stiffness: 500,
  damping: 40
} as const;
const toView = (t?: QanTab): QanView => t === "assurance" ? "assurance" : "quality";

/** QAN for one area (reached from the sidebar: QAN → Data / Process): continuous quality control and control assurance. */
export function Qan() {
  const {
    area: param
  } = useParams();
  const reduce = useReducedMotion();
  const {
    findings
  } = useDiligence();
  const [params, setParams] = useSearchParams();
  const focusId = params.get("finding");
  const screen = useScreenInit() as {
    tab?: QanTab;
  } | null;
  const [view, setViewState] = useState<QanView>(toView(params.get("view") as QanTab | null ?? screen?.tab));
  useEffect(() => {
    if (screen?.tab) setViewState(toView(screen.tab));
  }, [screen?.tab]);
  useEffect(() => {
    const v = params.get("view");
    if (v) setViewState(toView(v as QanTab));
  }, [params]);
  const setView = (v: QanView) => {
    setViewState(v);
    const next = new URLSearchParams(params);
    next.set("view", v);
    setParams(next, {
      replace: true
    });
  };
  const selectFinding = (id: string) => {
    const next = new URLSearchParams(params);
    next.set("finding", id);
    setParams(next, {
      replace: true
    });
  };
  if (param !== "data" && param !== "process") return <Navigate to={focusId ? qanUrl(findings.find((f) => f.id === focusId)?.area ?? "data", view, focusId) : "/qan/data"} replace />;
  const area: DiligenceArea = param;
  // A finding always opens under its own area (e.g. F-02 is Data), never the other one.
  const focusFinding = focusId ? findings.find((f) => f.id === focusId) : undefined;
  if (focusFinding && focusFinding.area !== area) return <Navigate to={qanUrl(focusFinding.area, view, focusFinding.id)} replace />;
  const areaFindings = findings.filter((f) => f.area === area);
  const open = areaFindings.filter(isActionable).length;
  const pendingReviews = areaFindings.filter((f) => reviewerTask(f)).length;
  const onViewKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = views[(i + (e.key === "ArrowRight" ? 1 : views.length - 1)) % views.length];
    setView(next.id);
    document.getElementById(`qan-view-${next.id}`)?.focus();
  };
  return <Box className="space-y-5">
      <PageHeader eyebrow="QAN" title={area === "data" ? "Data" : "Process"} description={descriptions[area]} />
      <QanKpis area={area} />

      <Box className="glass overflow-hidden rounded-2xl">
        <Flex className="flex-wrap items-center gap-3 border-b border-white/[0.06] px-4 py-3">
          <Flex role="tablist" aria-label="QAN views" className="w-fit max-w-full gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-black/20 p-1">
            {views.map((t, i) => {
            const on = view === t.id;
            return <button key={t.id} id={`qan-view-${t.id}`} type="button" role="tab" aria-selected={on} aria-controls="qan-panel" tabIndex={on ? 0 : -1} onClick={() => setView(t.id)} onKeyDown={(e) => onViewKey(e, i)} className={`relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${on ? "text-white" : "text-slate-400 hover:text-slate-200"}`}>
                  {on && <motion.span layoutId="qan-view-active" className="absolute inset-0 rounded-lg border border-white/[0.12] bg-white/[0.08]" transition={reduce ? {
                duration: 0
              } : spring} aria-hidden />}
                  <t.Icon size={13} className="relative" aria-hidden />
                  <span className="relative">{t.label}</span>
                </button>;
          })}
          </Flex>
          <Flex className="ml-auto items-center gap-2 text-[11.5px] text-slate-400">
            <Building2Icon size={14} className="text-slate-500" aria-hidden />
            <span>Procurement · Operations · Finance</span>
            <span className="text-slate-600">·</span>
            <span>{open} open · {pendingReviews} awaiting review</span>
            {focusId && <span className="num rounded-md border border-blue-400/35 bg-blue-500/10 px-1.5 py-0.5 text-blue-200">Focus: {focusId}</span>}
          </Flex>
        </Flex>

        <Box className="p-4 md:p-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={`${area}-${view}`} id="qan-panel" role="tabpanel" aria-labelledby={`qan-view-${view}`} initial={reduce ? false : {
            opacity: 0,
            y: 6
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={reduce ? undefined : {
            opacity: 0,
            y: -4
          }} transition={{
            duration: 0.18
          }}>
              {view === "quality" ? <QualityControlTab area={area} focusId={focusId} /> : <AssuranceTab area={area} focusId={focusId} onSelect={selectFinding} />}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>

      <FindingDrawer />
      <Text className="text-right text-[11.5px] text-slate-500">Illustrative · local sample state · no production integrations</Text>
    </Box>;
}