import React from "react";
import { Box, Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Flex, Text } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { ActivityIcon, CalendarClockIcon, CheckCircle2Icon, CircleDotIcon, FileTextIcon, LinkIcon, SearchIcon, ShieldCheckIcon, XCircleIcon } from "lucide-react";
import { SeverityTag } from "../ui/SeverityTag";
import { RelationshipMini } from "./RelationshipMini";
import { DemoTag, WorkflowStatus } from "./WorkflowStatus";
import { RemediationPlanEditor } from "./RemediationPlanEditor";
import { useDiligence, reviewOf } from "../../contexts/DiligenceContext";
import { demoFindingId } from "../../data/demoScenario";
import { dimensionMeta, fmtDate, kindMeta, urgencyMeta } from "../../utils/diligence";
import { remediationAllowed, wfOf } from "../../utils/workflow";
import { diligenceUrl, qanUrl } from "../../utils/qanLinks";
import type { Basis } from "../../types/diligence";
export function BasisChip({
  basis


}: {basis: Basis;}) {
  return basis === "verified" ? <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-teal-400/30 bg-teal-400/10 px-1.5 py-0.5 text-[10.5px] font-medium text-teal-300">Verified</span> : <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-dashed border-blue-400/40 bg-blue-400/10 px-1.5 py-0.5 text-[10.5px] font-medium text-blue-300">AI-inferred</span>;
}
function Section({
  title,
  children,
  aside




}: {title: string;children: React.ReactNode;aside?: React.ReactNode;}) {
  return <Box as="section" className="border-t border-white/[0.06] pt-4">
      <Flex className="mb-2.5 items-center justify-between gap-2">
        <Text as="h4" className="text-[12px] font-semibold uppercase tracking-[0.06em] text-slate-400">{title}</Text>
        {aside}
      </Flex>
      {children}
    </Box>;
}
function Chips({
  label,
  items



}: {label: string;items: string[];}) {
  return <Box>
      <Text className="text-[11px] text-slate-500">{label}</Text>
      <Flex className="mt-1 flex-wrap gap-1.5">
        {items.length ? items.map((i) => <span key={i} className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[12px] text-slate-200">{i}</span>) : <Text className="text-[12px] text-slate-500">Not available</Text>}
      </Flex>
    </Box>;
}

/** Contextual detail panel for a gap or red flag. Opens over the current tab without losing place. */
export function FindingDrawer() {
  const {
    selectedId,
    openFinding,
    getFinding,
    reviews,
    setExecution,
    linked
  } = useDiligence();
  const navigate = useNavigate();
  const loc = useLocation();
  const here = loc.pathname.startsWith("/diligence") ? "diligence" : loc.search.includes("view=assurance") ? "assurance" : loc.pathname.startsWith("/qan") ? "quality" : "other";
  const inDiligence = here === "diligence";
  const f = selectedId ? getFinding(selectedId) : undefined;
  const review = f ? reviewOf(reviews, f.id) : null;
  const w = f ? wfOf(f) : null;
  const isDemo = f?.id === demoFindingId;
  const links = f ? linked[f.id] ?? [] : [];
  const canSubmit = !!w && w.validation === "accepted" && (w.plan === "not_submitted" || w.plan === "changes");
  const canStart = !!w && remediationAllowed(w) && w.execution === "not_started";
  const canReady = !!w && remediationAllowed(w) && w.execution === "in_progress";
  const fromChecks = links.filter((l) => l.source === "check").length;
  const fromMonitoring = links.length - fromChecks;
  const go = (to: string, keepOpen = false) => {
    if (!keepOpen) openFinding(null);
    navigate(to);
  };
  return <Drawer isOpen={!!f} onClose={() => openFinding(null)} placement="right" size="lg">
      <DrawerOverlay />
      <DrawerContent className="!max-w-[720px]">
        {f && review && w && <>
            <DrawerCloseButton />
            <DrawerHeader className="!pb-3">
              <Flex className="flex-wrap items-center gap-2 text-[11.5px] font-normal text-slate-500">
                <span className={`rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${kindMeta[f.kind].chip}`}>{kindMeta[f.kind].label}</span>
                <span className="num">{f.id}</span>· {f.area === "data" ? "Data" : "Process"}{f.alsoArea && ` (also ${f.alsoArea === "data" ? "Data" : "Process"})`} · {dimensionMeta[f.dimension].label} · Illustrative
              </Flex>
              <Text className="mt-1.5 pr-8 text-[19px] font-semibold leading-snug text-white">{f.title}</Text>
              <Text className="mt-1 text-[13px] font-normal text-slate-400">{f.shift}</Text>
            </DrawerHeader>
            <DrawerBody className="space-y-5 !pb-8">
              <Text className="text-[13.5px] leading-relaxed text-slate-200">{f.summary}</Text>

              <Box className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <Box className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <Text className="text-[11px] text-slate-500">Severity</Text>
                  <Box className="mt-1"><SeverityTag severity={f.severity} /></Box>
                </Box>
                <Box className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <Text className="text-[11px] text-slate-500">Urgency</Text>
                  <Text className="mt-1 text-[12.5px] font-medium text-slate-200">{urgencyMeta[f.urgency].label}</Text>
                </Box>
                <Box className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <Text className="text-[11px] text-slate-500">Occurrences</Text>
                  <Text className="num mt-1 text-[12.5px] font-medium text-slate-200">{links.length}</Text>
                  <Text className="text-[10.5px] text-slate-500">{fromMonitoring} monitoring · {fromChecks} check</Text>
                </Box>
                <Box className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <Text className="text-[11px] text-slate-500">Evidence records</Text>
                  <Text className="num mt-1 text-[12.5px] font-medium text-slate-200">{f.evidence.length}</Text>
                  <Text className="text-[10.5px] text-slate-500">{f.evidence.filter((e) => e.basis === "verified").length} verified</Text>
                </Box>
              </Box>

              <Box className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-3">
                <Text className="text-[11px] font-medium text-amber-300">Business impact</Text>
                <Text className="mt-0.5 text-[13px] text-slate-200">{f.impact}</Text>
              </Box>

              <Section title="Status" aside={<Flex className="gap-1.5">
                  {here !== "assurance" && <Button size="xs" variant="outline" leftIcon={<ShieldCheckIcon size={12} />} onClick={() => go(qanUrl(f.area, "assurance", f.id))}>Review in Assurance</Button>}
                  {here !== "quality" && <Button size="xs" variant="outline" leftIcon={<ActivityIcon size={12} />} onClick={() => go(qanUrl(f.area, "quality", f.id))}>Quality Control</Button>}
                  {here !== "diligence" && <Button size="xs" variant="outline" leftIcon={<SearchIcon size={12} />} onClick={() => go(diligenceUrl(f.area, f.id), true)}>Diligence</Button>}
                </Flex>}>
                <WorkflowStatus f={f} />
                {(canSubmit || canStart || canReady) && (inDiligence ? <Flex className="mt-2.5 flex-wrap items-center gap-2 rounded-xl border border-blue-400/25 bg-blue-500/[0.05] px-3 py-2.5">
                    <Text className="text-[12px] text-slate-300">Diligence action:</Text>
                    {canSubmit && <Button size="sm" variant="primary" onClick={() => document.getElementById("dil-plan-editor")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
              })}>{w.plan === "changes" ? "Revise & resubmit plan" : "Review & submit plan"}</Button>}
                    {canStart && <Button size="sm" variant="outline" onClick={() => setExecution(f.id, "in_progress")}>Start remediation</Button>}
                    {canReady && (isDemo ? <Text className="text-[12px] text-slate-400">Use “Simulate remediation” in Quality Control (demo).</Text> : <Button size="sm" variant="outline" onClick={() => setExecution(f.id, "ready")}>Mark ready for verification</Button>)}
                  </Flex> : <Flex className="mt-2.5 flex-wrap items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
                    <Text className="text-[12px] text-slate-400">{canSubmit ? w.plan === "changes" ? "Waiting for Diligence to revise and resubmit the plan." : "Waiting for Diligence to submit the plan." : "Remediation is tracked in Diligence."}</Text>
                    <Button size="sm" variant="outline" className="ml-auto" leftIcon={<SearchIcon size={13} />} onClick={() => go(diligenceUrl(f.area, f.id), true)}>Open in Diligence</Button>
                  </Flex>)}
                {w.execution === "ready" && !isDemo && !w.closed && w.verification === "not_tested" && <Text className="mt-2 text-[11.5px] text-slate-500">No automated verification test is defined for this finding in the demo, so it cannot be closed yet.</Text>}
                {w.validation === "rejected" && <Text className="mt-2 text-[11.5px] text-slate-400">Rejected — excluded from remediation queues. History is kept.</Text>}
              </Section>

              {links.length > 0 && <Section title={`Occurrences (${links.length} unique)`} aside={<DemoTag />}>
                  <Box as="ul" className="space-y-1.5">
                    {links.map((e) => <Flex as="li" key={e.eventId} className="items-center gap-2.5 rounded-lg border border-rose-400/20 bg-rose-500/[0.04] px-3 py-2 text-[12.5px]">
                        <XCircleIcon size={14} className="shrink-0 text-rose-300" aria-hidden />
                        <Text className="min-w-0 flex-1 text-slate-200">{e.label}</Text>
                        <span className="num shrink-0 text-[11px] text-slate-500">{e.eventId}{e.source === "check" ? ` · ${e.runId} · ${e.sampleId}` : " · monitoring"}</span>
                      </Flex>)}
                  </Box>
                </Section>}

              <Section title="Origin & root cause" aside={<BasisChip basis={f.rootCauseBasis} />}>
                <Text className="text-[13px] text-slate-200">{f.rootCause}</Text>
                <Text className="mt-1.5 text-[12px] text-slate-500">Source: {f.source} · {f.detection.method}</Text>
              </Section>

              <Section title="Affected">
                <Box className="grid gap-3 md:grid-cols-2">
                  <Chips label="Team" items={[f.team]} />
                  <Chips label="Systems" items={f.systems} />
                  <Chips label="Data assets" items={f.dataAssets} />
                  <Chips label="Processes" items={f.processes} />
                </Box>
                <Box className="mt-3"><RelationshipMini finding={f} onOpen={openFinding} /></Box>
              </Section>

              <Section title="Supporting evidence">
                <Box as="ul" className="space-y-1.5">
                  {f.evidence.map((e) => <Flex as="li" key={e.ref + e.label} className="items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                      <FileTextIcon size={14} className="shrink-0 text-slate-500" aria-hidden />
                      <Text className="min-w-0 flex-1 text-[12.5px] text-slate-200">{e.label}</Text>
                      <span className="num text-[11px] text-slate-500">{e.ref}</span>
                      <BasisChip basis={e.basis} />
                    </Flex>)}
                </Box>
              </Section>

              <Section title="Dependencies">
                <Flex className="flex-wrap gap-1.5">
                  {f.dependencies.map((d) => <span key={d} className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] px-2 py-0.5 text-[12px] text-slate-300"><LinkIcon size={11} aria-hidden />{d}</span>)}
                </Flex>
              </Section>

              <Section title="Remediation timeline">
                <Box as="ol" className="relative ml-1.5 space-y-3 border-l border-white/[0.1] pl-5">
                  {f.timeline.map((t, i) => <li key={i} className="relative">
                      <CheckCircle2Icon size={14} className="dil-tl-dot absolute -left-[27px] top-0.5 rounded-full text-teal-300" aria-hidden />
                      <Text className="text-[12.5px] text-slate-200">{t.label}</Text>
                      <Text className="num text-[11px] text-slate-500">{fmtDate(t.date)} · {t.actor}</Text>
                    </li>)}
                  {!w.closed && w.validation !== "rejected" && f.nextSteps.map((s, i) => <li key={`n${i}`} className="relative">
                      <CircleDotIcon size={14} className={`dil-tl-dot absolute -left-[27px] top-0.5 rounded-full ${i === 0 ? "text-blue-300" : "text-slate-500"}`} aria-hidden />
                      <Text className={`text-[12.5px] ${i === 0 ? "font-medium text-blue-200" : "text-slate-400"}`}>{i === 0 ? "Next: " : ""}{s}</Text>
                    </li>)}
                  <li className="relative">
                    <CalendarClockIcon size={14} className="dil-tl-dot absolute -left-[27px] top-0.5 rounded-full text-amber-300" aria-hidden />
                    <Text className="text-[12.5px] text-slate-200">Target resolution</Text>
                    <Text className="num text-[11px] text-slate-500">{fmtDate(f.target)}</Text>
                  </li>
                </Box>
              </Section>

              <Box id="dil-plan-editor" className="scroll-mt-4">
                <Section title="Owner & remediation plan">
                  <RemediationPlanEditor f={f} readOnlyNote={inDiligence ? undefined : <>Edited and submitted in Diligence. <button type="button" onClick={() => go(diligenceUrl(f.area, f.id), true)} className="text-blue-300 hover:underline">Open in Diligence</button></>} />
                </Section>
              </Box>

              <Section title="Related findings">
                <Box className="grid gap-2 md:grid-cols-2">
                  {f.relatedIds.map((id) => {
                const r = getFinding(id);
                if (!r) return null;
                return <button key={id} type="button" onClick={() => openFinding(id)} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-left transition-colors hover:border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                        <Flex className="items-center gap-2">
                          <span className={`rounded-md border px-1.5 py-0.5 text-[10.5px] ${kindMeta[r.kind].chip}`}>{kindMeta[r.kind].label}</span>
                          <span className="num text-[11px] text-slate-500">{r.id} · {r.area === "data" ? "Data" : "Process"}</span>
                        </Flex>
                        <Text className="mt-1 text-[12.5px] font-medium text-slate-100">{r.title}</Text>
                        <Box className="mt-1"><SeverityTag severity={r.severity} /></Box>
                      </button>;
              })}
                </Box>
              </Section>
            </DrawerBody>
          </>}
      </DrawerContent>
    </Drawer>;
}