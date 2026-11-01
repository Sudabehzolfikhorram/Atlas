import React from "react";
import { Box, Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Flex, Text } from "@chakra-ui/react";
import { ArrowRightIcon, FileTextIcon, SparklesIcon } from "lucide-react";
import { SeverityTag } from "../ui/SeverityTag";
import { useDiligence } from "../../contexts/DiligenceContext";
import { eventTypeMeta, fmtDateTime, kindMeta } from "../../utils/diligence";
import type { MonitorEvent } from "../../types/diligence";

/** Detection details for a monitoring event, with a link into its related finding. */
export function EventDrawer({
  event,
  onClose



}: {event: MonitorEvent | null;onClose: () => void;}) {
  const {
    getFinding,
    openFinding
  } = useDiligence();
  const related = event?.relatedFindingId ? getFinding(event.relatedFindingId) : undefined;
  return <Drawer isOpen={!!event} onClose={onClose} placement="right" size="md">
      <DrawerOverlay />
      <DrawerContent>
        {event && <>
            <DrawerCloseButton />
            <DrawerHeader className="!pb-2">
              <Flex className="items-center gap-2 text-[11.5px] font-normal text-slate-500">
                <span className={`rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${eventTypeMeta[event.type].chip}`}>{eventTypeMeta[event.type].label}</span>
                <span className="num">{event.id}</span> · Simulated event
              </Flex>
              <Text className="mt-1.5 pr-8 text-[18px] font-semibold leading-snug text-white">{event.title}</Text>
            </DrawerHeader>
            <DrawerBody className="space-y-4 !pb-8">
              <Text className="text-[13.5px] text-slate-200">{event.explanation}</Text>
              <Box className="grid grid-cols-2 gap-2">
                {[["Source", event.source], ["Affected team", event.team], ["Timestamp", fmtDateTime(new Date(event.at).toISOString())], ["Area", event.area === "data" ? "Data" : "Process"]].map(([k, v]) => <Box key={k} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                    <Text className="text-[11px] text-slate-500">{k}</Text>
                    <Text className="mt-0.5 text-[12.5px] text-slate-200">{v}</Text>
                  </Box>)}
                <Box className="col-span-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <Text className="text-[11px] text-slate-500">Severity</Text>
                  <Box className="mt-0.5"><SeverityTag severity={event.severity} /></Box>
                </Box>
              </Box>
              <Box>
                <Text className="text-[12px] font-semibold uppercase tracking-[0.06em] text-slate-400">Evidence</Text>
                <Box as="ul" className="mt-2 space-y-1.5">
                  {event.evidence.map((e) => <Flex as="li" key={e} className="items-center gap-2 rounded-lg border border-white/[0.06] px-3 py-2 text-[12.5px] text-slate-200">
                      <FileTextIcon size={13} className="text-slate-500" aria-hidden />{e}
                      <span className="ml-auto text-[10.5px] text-slate-500">Sample reference</span>
                    </Flex>)}
                </Box>
              </Box>
              <Box className="rounded-xl border border-blue-400/25 bg-blue-500/[0.06] p-3">
                <Flex className="items-center gap-1.5 text-[11.5px] font-medium text-blue-300"><SparklesIcon size={12} aria-hidden />Recommended action</Flex>
                <Text className="mt-1 text-[13px] text-slate-200">{event.recommendation}</Text>
              </Box>
              {related ? <Box className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <Text className="text-[11px] text-slate-500">Related finding</Text>
                  <Flex className="mt-1 items-center gap-2">
                    <span className={`rounded-md border px-1.5 py-0.5 text-[10.5px] ${kindMeta[related.kind].chip}`}>{kindMeta[related.kind].label}</span>
                    <Text className="text-[13px] font-medium text-slate-100">{related.id} · {related.title}</Text>
                  </Flex>
                  <Button size="sm" variant="outline" className="!mt-3" rightIcon={<ArrowRightIcon size={13} />} onClick={() => {
              onClose();
              openFinding(related.id);
            }}>
                    Open finding
                  </Button>
                </Box> : <Text className="text-[12px] text-slate-500">No related finding — this event is not linked to an open gap or red flag.</Text>}
            </DrawerBody>
          </>}
      </DrawerContent>
    </Drawer>;
}