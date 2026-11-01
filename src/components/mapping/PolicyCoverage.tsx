import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { pyramidLinks, pyramidNodes } from "../../data/strategyPyramid";
import { CollapsibleSection } from "./CollapsibleSection";
const policies = pyramidNodes.filter((n) => n.layer === "policy");
const programs = pyramidNodes.filter((n) => n.layer === "program");
const cell = new Map(pyramidLinks.filter((l) => l.layer === "policy").map((l) => [`${l.from}>${l.to}`, l.records]));
const max = Math.max(...cell.values());

/** Policy × program matrix of traced records (collapsed by default). */
export function PolicyCoverage() {
  return <CollapsibleSection id="policy-coverage" title="Policy × program coverage" meta={`${policies.length} policies · ${programs.length} programs`}>
      <Box className="overflow-x-auto p-5">
        <table className="w-full min-w-[980px] border-separate border-spacing-1 text-[11.5px]">
          <thead>
            <tr>
              <th scope="col" className="w-[200px] text-left font-medium text-slate-500">Policy \ Program</th>
              {programs.map((p) => <th key={p.id} scope="col" title={p.label} className="max-w-[80px] truncate px-1 text-left align-bottom font-medium text-slate-400">{p.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {policies.map((pol) => <tr key={pol.id}>
                <th scope="row" className="truncate pr-2 text-left font-medium text-slate-200" title={pol.label}>{pol.label}</th>
                {programs.map((pr) => {
              const v = cell.get(`${pol.id}>${pr.id}`);
              return <td key={pr.id} className="h-8 rounded-md text-center" style={{
                background: v ? `rgba(59,130,246,${0.12 + v / max * 0.6})` : "rgba(255,255,255,0.025)"
              }} aria-label={v ? `${pol.label} to ${pr.label}: ${v} records` : `${pol.label} to ${pr.label}: none`}>
                      <span className={`num ${v ? "text-white" : "text-slate-600"}`}>{v ?? "·"}</span>
                    </td>;
            })}
              </tr>)}
          </tbody>
        </table>
        <Text className="mt-2 text-[11.5px] text-slate-500">Empty cells mean no records connect that policy to that program.</Text>
      </Box>
    </CollapsibleSection>;
}