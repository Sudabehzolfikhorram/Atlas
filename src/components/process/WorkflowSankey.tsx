import React from "react";
import { Box } from "@chakra-ui/react";
import { Layer, Rectangle, ResponsiveContainer, Sankey, Tooltip } from "recharts";
import { sankeyData } from "../../data/processMetrics";
const nodeColors = ["#60A5FA", "#60A5FA", "#60A5FA", "#2DD4BF", "#FBBF24", "#FB7185", "#2DD4BF", "#2DD4BF", "#2DD4BF"];
interface NodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: {
    name: string;
    value: number;
  };
}
const TERMINAL_NODE = sankeyData.nodes.length - 1;
function SankeyNode({
  x,
  y,
  width,
  height,
  index,
  payload
}: NodeProps) {
  const isOut = index === TERMINAL_NODE;
  return <Layer key={`n-${index}`}>
      <Rectangle x={x} y={y} width={width} height={height} fill={nodeColors[index]} fillOpacity={0.9} radius={2} />
      <text x={isOut ? x - 8 : x + width + 8} y={y + height / 2 - 2} textAnchor={isOut ? "end" : "start"} fontSize={12} fill="#E2E8F0">
        {payload.name}
      </text>
      <text x={isOut ? x - 8 : x + width + 8} y={y + height / 2 + 13} textAnchor={isOut ? "end" : "start"} fontSize={10.5} fill="#64748B">
        {payload.value} cases/wk
      </text>
    </Layer>;
}
interface LinkProps {
  sourceX: number;
  targetX: number;
  sourceY: number;
  targetY: number;
  sourceControlX: number;
  targetControlX: number;
  linkWidth: number;
  index: number;
  payload: {
    target: {
      name: string;
    };
  };
}
function SankeyLink({
  sourceX,
  targetX,
  sourceY,
  targetY,
  sourceControlX,
  targetControlX,
  linkWidth,
  index,
  payload
}: LinkProps) {
  const t = payload.target.name;
  const stroke = t.startsWith("Returned") ? "#FB7185" : t.startsWith("Finance") ? "#FBBF24" : "#60A5FA";
  return <path key={`l-${index}`} d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`} fill="none" stroke={stroke} strokeOpacity={0.18} strokeWidth={Math.max(1, linkWidth)} />;
}
export function WorkflowSankey() {
  return <Box className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Sankey data={sankeyData} nodePadding={26} nodeWidth={8} margin={{
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      }} node={<SankeyNode x={0} y={0} width={0} height={0} index={0} payload={{
        name: "",
        value: 0
      }} />} link={<SankeyLink sourceX={0} targetX={0} sourceY={0} targetY={0} sourceControlX={0} targetControlX={0} linkWidth={0} index={0} payload={{
        target: {
          name: ""
        }
      }} />}>
          <Tooltip contentStyle={{
          background: "rgba(12,18,32,0.8)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          fontSize: 12
        }} />
        </Sankey>
      </ResponsiveContainer>
    </Box>;
}