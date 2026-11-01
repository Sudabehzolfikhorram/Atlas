import React, { useId, useRef, useState } from "react";
import { Box, Button, Flex, Heading, IconButton, Menu, MenuButton, MenuItem, MenuList, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, Tooltip, useToast } from "@chakra-ui/react";
import { ChevronDownIcon, DownloadIcon, FileCodeIcon, ImageIcon, Maximize2Icon, ZoomInIcon } from "lucide-react";
import { timelineMonths } from "../../data/processMaps";
import type { MapMode, MapVariant, ProcessDefinition } from "../../types/processMap";
import { downloadSvgChart } from "../../utils/exportSvg";
import { ProcessMapCanvas } from "./ProcessMapCanvas";
import { MapLegend } from "./MapLegend";
import { ZoomControls, ZoomViewport, clampZoom } from "./ZoomViewport";
interface Props {
  variant: MapVariant;
  title: string;
  subtitle: string;
  chips?: React.ReactNode;
  process: ProcessDefinition;
  mode: MapMode;
  month: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  unavailable: React.ReactNode | null;
}
const accent = {
  current: "bg-blue-400",
  recommended: "bg-violet-400"
};
export function MapChartPanel({
  variant,
  title,
  subtitle,
  chips,
  process,
  mode,
  month,
  selectedId,
  onSelect,
  unavailable
}: Props) {
  const uid = useId();
  const [scale, setScale] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [exporting, setExporting] = useState(false);
  const inlineRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const expandBtn = useRef<HTMLButtonElement>(null);
  const toast = useToast();
  const isCurrent = variant === "current";
  const canvas = <ProcessMapCanvas process={process} variant={variant} mode={mode} month={month} selectedId={selectedId} onSelect={onSelect} label={`${title}: ${process.name}, ${mode === "flow" ? "data flow" : "relationships"} view, ${timelineMonths[month].full}`} />;
  const download = async (format: "png" | "svg") => {
    const svg = (expanded ? expandedRef.current : inlineRef.current)?.querySelector("svg");
    if (!svg) return;
    setExporting(true);
    try {
      const slug = process.name.toLowerCase().replace(/\s+/g, "-");
      await downloadSvgChart(svg, `best-practice-${slug}-${mode}-${timelineMonths[month].short.toLowerCase()}`, format);
      toast({
        title: "Map downloaded",
        description: `${format.toUpperCase()} export of the Best practice map (illustrative data).`,
        status: "success",
        duration: 2500,
        position: "bottom-right"
      });
    } catch {
      toast({
        title: "Couldn't export the map",
        description: "Please try again, or choose the SVG format.",
        status: "error",
        duration: 3500,
        position: "bottom-right"
      });
    } finally {
      setExporting(false);
    }
  };
  const downloadMenu = <Menu placement="bottom-end">
      <MenuButton as={Button} size="sm" variant="outline" leftIcon={<DownloadIcon size={13} />} rightIcon={<ChevronDownIcon size={13} />} isDisabled={!!unavailable} isLoading={exporting}>
        Download output
      </MenuButton>
      <MenuList className="!min-w-[180px]">
        <MenuItem icon={<ImageIcon size={14} />} onClick={() => download("png")}>PNG image</MenuItem>
        <MenuItem icon={<FileCodeIcon size={14} />} onClick={() => download("svg")}>SVG vector</MenuItem>
      </MenuList>
    </Menu>;
  return <Box as="article" aria-labelledby={`${uid}-title`} className="glass-tile flex min-w-0 flex-col rounded-2xl">
      {/* Header + chart-specific actions */}
      <Flex className="flex-wrap items-start justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <Flex className="min-w-0 items-start gap-2.5">
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${accent[variant]} shadow-[0_0_0_4px_rgba(255,255,255,0.05)]`} aria-hidden />
          <Box className="min-w-0">
            <Heading as="h3" id={`${uid}-title`} className="!text-[14.5px] !font-semibold tracking-tight text-white">{title}</Heading>
            <Text className="text-[12px] text-slate-400">{subtitle}</Text>
          </Box>
        </Flex>
        <Flex role="toolbar" aria-label={`${title} actions`} className="items-center gap-1.5">
          <Button ref={expandBtn} size="sm" variant="outline" leftIcon={<Maximize2Icon size={13} />} onClick={() => setExpanded(true)} isDisabled={!!unavailable}>
            Expand
          </Button>
          {!isCurrent && downloadMenu}
        </Flex>
      </Flex>

      {chips && <Flex className="flex-wrap items-center gap-1.5 px-4 pt-3 text-[11px]">{chips}</Flex>}

      {/* Chart */}
      <Box className="relative m-3 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0C1220]">
        {unavailable ?? <>
            <ZoomViewport scale={scale} onScale={setScale} label={title} viewportRef={inlineRef} className="px-1 py-1">
              {canvas}
            </ZoomViewport>
            <Box className="absolute bottom-2.5 right-2.5">
              {scale === 1 ? <Tooltip label="Zoom in" hasArrow placement="top" openDelay={200}>
                  <IconButton aria-label={`Zoom in on ${title}`} size="sm" variant="ghost" icon={<ZoomInIcon size={15} />} onClick={() => setScale((s) => clampZoom(s + 0.25))} className="!h-8 !w-8 !min-w-0 !rounded-xl !border !border-white/10 !bg-[#0B1222]/90 !text-slate-300 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md hover:!bg-white/[0.08] hover:!text-white" />
                </Tooltip> : <ZoomControls scale={scale} onScale={setScale} label={title} />}
            </Box>
          </>}
      </Box>

      {!unavailable && <Flex className="mt-auto flex-wrap items-center justify-between gap-2 px-4 pb-3">
          <MapLegend variant={variant} mode={mode} />
        </Flex>}

      {/* Expanded view */}
      <Modal isOpen={expanded} onClose={() => setExpanded(false)} size="full" finalFocusRef={expandBtn} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent className="!m-3 !max-h-[calc(100vh-24px)] !rounded-3xl md:!m-6 md:!max-h-[calc(100vh-48px)]">
          <ModalHeader className="!pr-14">
            <Flex className="flex-wrap items-center justify-between gap-3">
              <Flex className="items-center gap-2.5">
                <span className={`h-2 w-2 rounded-full ${accent[variant]}`} aria-hidden />
                <Box>
                  <Text className="text-[16px] font-semibold text-white">{title}</Text>
                  <Text className="text-[12px] font-normal text-slate-400">{process.name} · {timelineMonths[month].full} · illustrative data</Text>
                </Box>
              </Flex>
              <Flex className="items-center gap-2">
                <ZoomControls scale={scale} onScale={setScale} label={`${title} expanded`} />
                {!isCurrent && downloadMenu}
              </Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton aria-label="Close expanded view" />
          <ModalBody className="!pb-6">
            <Box className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0C1220]">
              <ZoomViewport scale={scale} onScale={setScale} label={`${title} expanded`} viewportRef={expandedRef} className="max-h-[calc(100vh-220px)] p-3">
                {canvas}
              </ZoomViewport>
            </Box>
            <Flex className="mt-3 flex-wrap items-center justify-between gap-2">
              <MapLegend variant={variant} mode={mode} />
              <Text className="text-[11px] text-slate-500">Ctrl/⌘ + scroll to zoom · scroll to pan · Esc to close</Text>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>;
}