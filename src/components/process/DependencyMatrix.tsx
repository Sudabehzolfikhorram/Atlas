import React, { useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { InfoIcon } from "lucide-react";
import { departments, dependencyMatrix, dependencyNotes } from "../../data/processMetrics";
function cellStyle(v: number) {
  if (v === 0) return {
    background: "var(--c-matrix-empty)",
    color: "var(--c-matrix-empty-text)"
  };
  if (v >= 25) return {
    background: `rgba(251,191,36,${0.18 + v / 120})`,
    color: "var(--c-matrix-hot-text)"
  };
  return {
    background: `rgba(59,130,246,${0.08 + v / 60})`,
    color: "var(--c-matrix-text)"
  };
}
export function DependencyMatrix() {
  const [sel, setSel] = useState<string>("3-2");
  const [r, c] = sel.split("-").map(Number);
  const note = dependencyNotes[sel] ?? `${departments[r]} causes ~${dependencyMatrix[r][c]} hours/week of downstream delay in ${departments[c]}.`;
  return <Box>
      <Box className="overflow-x-auto">
        <table className="w-full min-w-[440px] border-separate border-spacing-1 text-[11px]">
          <caption className="sr-only">Hours per week of downstream delay caused by one department on another</caption>
          <thead>
            <tr>
              <th className="text-left font-normal text-slate-500">Causes ↓ / Affects →</th>
              {departments.map((d) => <th key={d} scope="col" className="px-1 pb-1 text-center font-normal text-slate-400">{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {dependencyMatrix.map((row, ri) => <tr key={departments[ri]}>
                <th scope="row" className="whitespace-nowrap pr-2 text-left font-normal text-slate-400">{departments[ri]}</th>
                {row.map((v, ci) => {
              const key = `${ri}-${ci}`;
              return <td key={key} className="p-0">
                      <button disabled={v === 0} onClick={() => setSel(key)} aria-label={`${departments[ri]} affects ${departments[ci]}: ${v} hours per week`} className={`num h-9 w-full rounded-md text-[12px] transition ${sel === key ? "ring-2 ring-white/70" : ""}`} style={cellStyle(v)}>
                        {v === 0 ? "–" : v}
                      </button>
                    </td>;
            })}
              </tr>)}
          </tbody>
        </table>
      </Box>
      <Flex className="mt-3 items-start gap-2 rounded-xl bg-white/[0.03] px-3 py-2.5">
        <InfoIcon size={13} className="mt-0.5 shrink-0 text-blue-300" />
        <Text className="text-[12px] leading-relaxed text-slate-300">
          <span className="font-medium text-white">{departments[r]} → {departments[c]}:</span> {note}
        </Text>
      </Flex>
    </Box>;
}