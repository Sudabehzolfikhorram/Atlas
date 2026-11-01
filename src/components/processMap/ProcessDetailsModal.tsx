import React from "react";
import { Box, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text } from "@chakra-ui/react";
import { timelineMonths } from "../../data/processMaps";
import type { MapVariant, PeriodKey, ProcessDefinition } from "../../types/processMap";
import { changeMeta, getPeriod, recommendationCompatibility, stepWait, volume } from "../../utils/processMap";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  process: ProcessDefinition;
  variant: MapVariant;
  period: PeriodKey;
  month: number;
}
export function ProcessDetailsModal({
  isOpen,
  onClose,
  process,
  variant,
  period,
  month
}: Props) {
  const rec = process.recommendation;
  const compat = recommendationCompatibility(process, period);
  return <Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader className="!pb-1">
          <Text className="text-[11px] font-medium uppercase tracking-[0.1em] text-blue-300/80">{variant === "current" ? "Process details" : "Recommendation"} · illustrative</Text>
          <Text className="mt-1 text-[18px] font-semibold text-white">{process.name}</Text>
          <Text className="mt-0.5 text-[12.5px] font-normal text-slate-400">
            {process.department} · {process.owner} · {getPeriod(period).label} · snapshot {timelineMonths[month].full}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody className="!pb-6 !pt-3">
          {variant === "current" ? <Box className="space-y-4">
              <Text className="text-[13px] leading-relaxed text-slate-300">{process.description}</Text>
              <Box className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-[12.5px]">
                  <thead className="text-[10.5px] uppercase tracking-wider text-slate-500">
                    <tr className="border-b border-white/[0.06]">
                      <th className="py-2 pr-3 font-normal">Step</th>
                      <th className="py-2 pr-3 font-normal">Owner</th>
                      <th className="py-2 pr-3 font-normal">System</th>
                      <th className="py-2 pr-3 text-right font-normal">Avg. wait</th>
                      <th className="py-2 text-right font-normal">Cases / mo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {process.steps.filter((s) => s.current).map((s) => <tr key={s.id} className="border-b border-white/[0.04]">
                        <td className="py-2 pr-3 text-slate-100">{s.current!.label}{s.current!.issue && <span className="ml-1.5 text-[10px] text-amber-300">Issue</span>}</td>
                        <td className="py-2 pr-3 text-slate-400">{s.current!.owner}</td>
                        <td className="py-2 pr-3 text-slate-400">{s.current!.system}</td>
                        <td className="num py-2 pr-3 text-right text-slate-200">{stepWait(process, s.current, month) ?? "—"} d</td>
                        <td className="num py-2 text-right text-slate-200">{(volume(process, s.current!.share, month) ?? 0).toLocaleString()}</td>
                      </tr>)}
                  </tbody>
                </table>
              </Box>
              <Text className="text-[11.5px] text-slate-500">{process.sources[month]} connected evidence sources in {timelineMonths[month].full}. Meridian Energy is a fictitious organization; all figures are synthetic.</Text>
            </Box> : !rec ? <Text className="text-[13px] leading-relaxed text-slate-300">{process.unavailableReason}</Text> : <Box className="space-y-4">
              <Flex className="flex-wrap gap-2 text-[11.5px]">
                <span className="rounded-md border border-white/10 px-2 py-0.5 text-slate-300">{rec.version} · generated {rec.generatedOn}</span>
                <span className="rounded-md border border-white/10 px-2 py-0.5 text-slate-300">Baselines: {rec.baselines.map((b) => getPeriod(b).label).join(", ")}</span>
                <span className="rounded-md border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 text-violet-200">{rec.reference ? "Best-practice reference available" : "Best practice"}</span>
              </Flex>
              {!compat.ok && <Text className="rounded-lg border border-amber-400/25 bg-amber-400/[0.06] p-2.5 text-[12px] text-amber-100">{compat.reason}</Text>}
              {rec.reference && <Text className="text-[12px] text-slate-400">Reference: {rec.reference}</Text>}
              <Box as="ul" className="space-y-2">
                {rec.changes.map((c) => <Box as="li" key={c.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <Flex className="items-center gap-2">
                      <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${changeMeta[c.type].chip}`}>{changeMeta[c.type].label}</span>
                      <Text className="text-[13px] font-medium text-slate-100">{c.title}</Text>
                    </Flex>
                    <Text className="mt-1 text-[12px] text-slate-400">{c.why}</Text>
                  </Box>)}
              </Box>
              <Box className="grid gap-4 md:grid-cols-2">
                <Box>
                  <Text className="mb-1 text-[10.5px] uppercase tracking-wider text-slate-500">Assumptions</Text>
                  <Box as="ul" className="list-disc space-y-1 pl-4 text-[12px] text-slate-300">{rec.assumptions.map((a) => <li key={a}>{a}</li>)}</Box>
                </Box>
                <Box>
                  <Text className="mb-1 text-[10.5px] uppercase tracking-wider text-slate-500">Limitations</Text>
                  <Box as="ul" className="list-disc space-y-1 pl-4 text-[12px] text-slate-300">{rec.limitations.map((a) => <li key={a}>{a}</li>)}</Box>
                </Box>
              </Box>
              <Text className="text-[11.5px] text-slate-500">This is a proposal, not an observed result. No savings are estimated until a pilot is measured.</Text>
            </Box>}
        </ModalBody>
      </ModalContent>
    </Modal>;
}