import React, { useEffect, useRef } from "react";
import { Flex, IconButton, Text, Tooltip } from "@chakra-ui/react";
import { RotateCcwIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
export const ZOOM_MIN = 1;
export const ZOOM_MAX = 3;
export const clampZoom = (z: number) => Math.round(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z)) * 100) / 100;
interface ViewportProps {
  scale: number;
  onScale: React.Dispatch<React.SetStateAction<number>>;
  label: string;
  children: React.ReactNode;
  viewportRef?: React.RefObject<HTMLDivElement>;
  className?: string;
}

/** Scrollable zoom viewport. The chart scales from its intrinsic width; Ctrl/⌘ + wheel zooms. */
export function ZoomViewport({
  scale,
  onScale,
  label,
  children,
  viewportRef,
  className = ""
}: ViewportProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const ref = viewportRef ?? localRef;
  const onScaleRef = useRef(onScale);
  onScaleRef.current = onScale;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      onScaleRef.current((s) => clampZoom(s * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
    };
    el.addEventListener("wheel", onWheel, {
      passive: false
    });
    return () => el.removeEventListener("wheel", onWheel);
  }, [ref]);
  return <div ref={ref} role="region" aria-label={`${label}, zoom ${Math.round(scale * 100)}%`} className={`overflow-auto ${className}`}>
      <div style={{
      width: `${scale * 100}%`,
      transition: "width .15s ease-out"
    }}>{children}</div>
    </div>;
}
export function ZoomControls({
  scale,
  onScale,
  label




}: {scale: number;onScale: React.Dispatch<React.SetStateAction<number>>;label: string;}) {
  return <Flex role="group" aria-label={`${label} zoom`} className="items-center gap-0.5 rounded-xl border border-white/10 bg-[#0B1222]/90 p-0.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <IconButton aria-label="Zoom out" size="xs" variant="ghost" icon={<ZoomOutIcon size={14} />} onClick={() => onScale((s) => clampZoom(s - 0.25))} isDisabled={scale <= ZOOM_MIN} />
      <Text className="num w-11 text-center text-[11.5px] text-slate-200" aria-live="polite">{Math.round(scale * 100)}%</Text>
      <IconButton aria-label="Zoom in" size="xs" variant="ghost" icon={<ZoomInIcon size={14} />} onClick={() => onScale((s) => clampZoom(s + 0.25))} isDisabled={scale >= ZOOM_MAX} />
      <Tooltip label="Reset zoom" hasArrow openDelay={300}>
        <IconButton aria-label="Reset zoom" size="xs" variant="ghost" icon={<RotateCcwIcon size={13} />} onClick={() => onScale(1)} isDisabled={scale === 1} />
      </Tooltip>
    </Flex>;
}