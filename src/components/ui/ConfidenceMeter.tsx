import React from "react";
import { Flex, Text, Tooltip } from "@chakra-ui/react";
interface ConfidenceMeterProps {
  value: number;
  showLabel?: boolean;
}
export function ConfidenceMeter({
  value,
  showLabel = true
}: ConfidenceMeterProps) {
  const segments = 10;
  const filled = Math.round(value / 100 * segments);
  const color = value >= 80 ? "bg-teal-400" : value >= 60 ? "bg-blue-400" : "bg-amber-400";
  const label = value >= 80 ? "High" : value >= 60 ? "Moderate" : "Low";
  return <Tooltip label={`${label} confidence in supporting evidence`} hasArrow openDelay={300}>
      <Flex className="items-center gap-2" aria-label={`Confidence ${value}%`}>
        <Flex className="gap-[2px]">
          {Array.from({
          length: segments
        }).map((_, i) => <span key={i} className={`h-2.5 w-[4px] rounded-[1px] ${i < filled ? color : "bg-white/10"}`} />)}
        </Flex>
        {showLabel && <Text className="num text-[12px] font-medium text-slate-300">{value}%</Text>}
      </Flex>
    </Tooltip>;
}