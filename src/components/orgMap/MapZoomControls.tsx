import React from "react";
import { Flex, IconButton, Text, Tooltip } from "@chakra-ui/react";
import { Maximize2Icon, ScanIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
interface Props {
  pct: number;
  zoomAt: (factor: number) => void;
  fit: () => void;
  onExpand?: () => void;
  placement?: "left" | "right";
}
export function MapZoomControls({
  pct,
  zoomAt,
  fit,
  onExpand,
  placement = "right"
}: Props) {
  return <Flex role="group" aria-label="Map zoom" className={`absolute bottom-3 ${placement === "left" ? "left-3" : "right-3"} items-center gap-0.5 rounded-xl border border-white/10 bg-[#0B1222]/90 p-0.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md`}>
      <IconButton aria-label="Zoom out" size="sm" variant="ghost" icon={<ZoomOutIcon size={16} />} onClick={() => zoomAt(1 / 1.2)} />
      <Text className="num w-12 text-center text-[13px] text-slate-200" aria-live="polite">{pct}%</Text>
      <IconButton aria-label="Zoom in" size="sm" variant="ghost" icon={<ZoomInIcon size={16} />} onClick={() => zoomAt(1.2)} />
      <Tooltip label="Fit view" hasArrow openDelay={300}>
        <IconButton aria-label="Fit view" size="sm" variant="ghost" icon={<ScanIcon size={15} />} onClick={fit} />
      </Tooltip>
      {onExpand && <Tooltip label="Expand" hasArrow openDelay={300}>
          <IconButton aria-label="Expand map" size="sm" variant="ghost" icon={<Maximize2Icon size={15} />} onClick={onExpand} />
        </Tooltip>}
    </Flex>;
}