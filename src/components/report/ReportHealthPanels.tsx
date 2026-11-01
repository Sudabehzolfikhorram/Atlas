import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Panel } from "../ui/Panel";
import { ProgressBar } from "../ui/ProgressBar";
import { governanceStatus, maturity, maturityLabels, risks } from "../../data/report";
const levels = ["Low", "Medium", "High"];

/** Supporting context: process maturity, governance foundations and risk prioritization. */
export function ReportHealthPanels() {
  return <Box className="grid gap-6 xl:grid-cols-3">
      <Panel eyebrow="Process maturity" title="Maturity by process" subtitle="Level 1–5 with observational coverage of the underlying evidence.">
        <Box as="ul" className="space-y-3.5">
          {maturity.map((m) => <Box as="li" key={m.process}>
              <Flex className="items-baseline justify-between gap-2">
                <Text className="text-[13px] text-slate-200">{m.process}</Text>
                <Text className="shrink-0 text-[12px] text-slate-400">L{m.level} · {maturityLabels[m.level]}</Text>
              </Flex>
              <Flex className="mt-1.5 gap-1">
                {[1, 2, 3, 4, 5].map((l) => <span key={l} className={`h-2 flex-1 rounded-sm ${l <= m.level ? m.level >= 4 ? "bg-teal-400" : m.level === 3 ? "bg-blue-400" : "bg-amber-400" : "bg-white/[0.07]"}`} />)}
              </Flex>
              <Text className={`mt-1 text-[11px] ${m.coverage < 75 ? "text-amber-300/80" : "text-slate-500"}`}>
                Evidence coverage {m.coverage}%{m.coverage < 75 ? " · rating provisional" : ""}
              </Text>
            </Box>)}
        </Box>
      </Panel>

      <Panel eyebrow="Governance status" title="Foundations vs target" subtitle="White marker shows the target.">
        <Box as="ul" className="space-y-4">
          {governanceStatus.map((g) => <Box as="li" key={g.label}>
              <Flex className="items-baseline justify-between gap-2">
                <Text className="text-[13px] text-slate-200">{g.label}</Text>
                <Text className="num shrink-0 text-[13px] text-white">
                  {g.value}%<span className="ml-1.5 text-[11px] text-slate-500">target {g.target}%</span>
                </Text>
              </Flex>
              <Box className="relative mt-1.5">
                <ProgressBar value={g.value} color={g.value >= g.target ? "bg-teal-400" : g.value >= g.target - 20 ? "bg-blue-400" : "bg-amber-400"} label={g.label} />
                <span className="absolute -top-0.5 h-2.5 w-px bg-white/60" style={{
              left: `${g.target}%`
            }} aria-hidden />
              </Box>
            </Box>)}
        </Box>
      </Panel>

      <Panel eyebrow="Risk prioritization" title="Impact × likelihood" subtitle="Top-right cells carry the highest risk.">
        <Flex className="gap-2">
          <Flex className="flex-col justify-between py-1 text-[10px] text-slate-500" style={{
          writingMode: "vertical-rl",
          transform: "rotate(180deg)"
        }}>Impact →</Flex>
          <Box className="flex-1">
            <Box className="grid grid-cols-3 gap-1">
              {[3, 2, 1].map((imp) => [1, 2, 3].map((lik) => {
              const cell = risks.filter((r) => r.impact === imp && r.likelihood === lik);
              const score = imp * lik;
              const bg = score >= 6 ? "bg-rose-400/15" : score >= 3 ? "bg-amber-400/10" : "bg-white/[0.03]";
              return <Box key={`${imp}-${lik}`} className={`min-h-[60px] rounded-md p-1.5 ${bg}`}>
                      {cell.map((r) => <Text key={r.id} title={r.label} className="truncate text-[10.5px] text-slate-200">
                          <span className="font-medium text-white">{r.id}</span> {r.label}
                        </Text>)}
                    </Box>;
            }))}
            </Box>
            <Flex className="mt-1 justify-between text-[10px] text-slate-500">
              {levels.map((l) => <span key={l}>{l}</span>)}
              <span>Likelihood →</span>
            </Flex>
          </Box>
        </Flex>
      </Panel>
    </Box>;
}