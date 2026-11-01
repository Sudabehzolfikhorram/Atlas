import React from "react";
import { Box, Button, Flex, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Text } from "@chakra-ui/react";
import { DatabaseIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import type { Kpi } from "../../data/processMetrics";
export function KpiCard({
  kpi


}: {kpi: Kpi;}) {
  const color = kpi.good ? "#2DD4BF" : "#FBBF24";
  const data = kpi.spark.map((v, i) => ({
    i,
    v
  }));
  const up = kpi.delta.startsWith("+");
  return <Popover trigger="click" placement="bottom-start">
      <PopoverTrigger>
        <button className="glass w-full rounded-2xl p-4 text-left transition-colors hover:!border-white/[0.2] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <Flex className="items-center justify-between">
            <Text className="text-[12px] text-slate-400">{kpi.label}</Text>
            <Flex className={`items-center gap-0.5 text-[11px] font-medium ${kpi.good ? "text-teal-300" : "text-amber-300"}`}>
              {up ? <TrendingUpIcon size={12} /> : <TrendingDownIcon size={12} />}
              {kpi.delta}
            </Flex>
          </Flex>
          <Flex className="mt-2 items-end justify-between gap-2">
            <Text className="num text-[26px] font-medium leading-none text-white">
              {kpi.value}
              <span className="ml-1 text-[12px] text-slate-500">{kpi.unit}</span>
            </Text>
            <Box className="h-8 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.6} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Flex>
          <Flex className="mt-3 items-center justify-between text-[11px] text-slate-500">
            <span>Target {kpi.target}</span>
            <span className="flex items-center gap-1"><DatabaseIcon size={10} />{kpi.source}</span>
          </Flex>
        </button>
      </PopoverTrigger>
      <PopoverContent className="!w-72">
        <PopoverArrow bg="#121A2C" />
        <PopoverBody className="p-4">
          <Text className="text-[11px] uppercase tracking-wider text-slate-500">Metric traceability</Text>
          <Text className="mt-1 text-[14px] font-medium text-white">{kpi.label}</Text>
          <Box className="mt-3 space-y-2 text-[12px]">
            <Flex className="justify-between"><span className="text-slate-500">Sources</span><span className="text-slate-200">{kpi.source}</span></Flex>
            <Flex className="justify-between"><span className="text-slate-500">Population</span><span className="text-slate-200">{kpi.records}</span></Flex>
            <Flex className="justify-between gap-4"><span className="text-slate-500">Method</span><span className="text-right text-slate-200">{kpi.method}</span></Flex>
            <Flex className="justify-between"><span className="text-slate-500">Refreshed</span><span className="text-slate-200">4 min ago</span></Flex>
          </Box>
          <Button size="xs" className="mt-3 w-full">Open underlying records</Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>;
}