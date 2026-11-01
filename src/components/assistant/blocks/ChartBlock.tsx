import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { ChartColumnIcon } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "../../../contexts/ThemeContext";
import type { ResponseBlock } from "../../../types/assistant";
import { ExpandableCard } from "./ExpandableCard";
type Block = Extract<ResponseBlock, {
  kind: "chart";
}>;

/** Bar chart card; the largest value is highlighted. Expand shows the underlying table. */
export function ChartBlock({
  block


}: {block: Block;}) {
  const light = useTheme().resolved === "light";
  const axis = light ? "#64748B" : "#94A3B8";
  const max = Math.max(...block.data.map((d) => d.value));
  const total = block.data.reduce((s, d) => s + d.value, 0);
  return <ExpandableCard icon={ChartColumnIcon} title={block.title} meta={`${block.data.length} values · ${block.unit}`} preview={<>
          <Box className="h-[150px]" role="img" aria-label={`${block.title}: ${block.data.map((d) => `${d.label} ${d.value} ${block.unit}`).join(", ")}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={block.data} margin={{
          top: 6,
          right: 4,
          left: -24,
          bottom: 0
        }}>
                <XAxis dataKey="label" tick={{
            fill: axis,
            fontSize: 10.5
          }} axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={{
            fill: axis,
            fontSize: 10.5
          }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{
            fill: light ? "rgba(15,23,42,0.05)" : "rgba(255,255,255,0.04)"
          }} formatter={(v) => [`${v} ${block.unit}`, ""]} contentStyle={{
            background: light ? "#fff" : "#0F172A",
            border: "1px solid rgba(148,163,184,0.25)",
            borderRadius: 10,
            fontSize: 12
          }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {block.data.map((d) => <Cell key={d.label} fill={d.value === max ? "#FB7185" : "#60A5FA"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
          {block.note && <Text className="mt-1.5 text-[11px] text-slate-500">{block.note}</Text>}
        </>} details={<table className="w-full text-[12px]">
          <thead>
            <tr className="text-left text-[11px] text-slate-500">
              <th scope="col" className="pb-1.5 font-normal">Item</th>
              <th scope="col" className="pb-1.5 text-right font-normal">Value</th>
              <th scope="col" className="pb-1.5 text-right font-normal">Share</th>
            </tr>
          </thead>
          <tbody>
            {block.data.map((d) => <tr key={d.label} className="border-t border-white/[0.05]">
                <td className="py-1.5 text-slate-300">{d.label}</td>
                <td className={`num py-1.5 text-right ${d.value === max ? "text-rose-300" : "text-slate-200"}`}>{d.value} {block.unit}</td>
                <td className="num py-1.5 text-right text-slate-500">{total ? Math.round(d.value / total * 100) : 0}%</td>
              </tr>)}
          </tbody>
        </table>} />;
}