import React from "react";
import { Box } from "@chakra-ui/react";
interface ProgressBarProps {
  value: number;
  color?: string;
  height?: string;
  label?: string;
}
export function ProgressBar({
  value,
  color = "bg-blue-400",
  height = "h-1.5",
  label
}: ProgressBarProps) {
  return <Box role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label} className={`w-full overflow-hidden rounded-full bg-white/[0.07] ${height}`}>
      <Box className={`h-full rounded-full transition-all duration-500 ${color}`} style={{
      width: `${Math.min(100, value)}%`
    }} />
    </Box>;
}