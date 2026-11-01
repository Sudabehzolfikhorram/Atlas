import React from "react";
import { Box, Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Flex, Text } from "@chakra-ui/react";
import { CheckIcon, ClipboardPlusIcon, FileSearchIcon, PauseIcon, SearchCheckIcon, WaypointsIcon } from "lucide-react";
import type { BusinessPriority } from "../../types/priorities";
import { severityStyles } from "../ui/SeverityTag";
import { availableActions } from "../../utils/priorities";
import { PriorityDetailContent, detailTabs, type DetailTab } from "./PriorityDetailTabs";
interface Props {
  item: BusinessPriority | null;
  tab: DetailTab;
  onTab: (t: DetailTab) => void;
  onClose: () => void;
  onTrace: () => void;
  onApprove: () => void;
  onRequestValidation: () => void;
  onDefer: () => void;
  onCreateTask: () => void;
}
export function PriorityDrawer({
  item,
  tab,
  onTab,
  onClose,
  onTrace,
  onApprove,
  onRequestValidation,
  onDefer,
  onCreateTask
}: Props) {
  const actions = item ? availableActions(item) : null;
  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = detailTabs[(i + (e.key === "ArrowRight" ? 1 : detailTabs.length - 1)) % detailTabs.length];
    onTab(next.id);
    document.getElementById(`pri-tab-${next.id}`)?.focus();
  };
  return <Drawer isOpen={!!item} onClose={onClose} placement="right" size="lg">
      <DrawerOverlay />
      <DrawerContent className="!max-w-[760px]">
        {item && actions && <>
            <DrawerCloseButton />
            <DrawerHeader className="!pb-0">
              <Flex className="items-center gap-2 text-[11.5px] font-normal text-slate-500">
                <span className={`h-2 w-2 rounded-full ${severityStyles[item.severity].dot}`} aria-hidden />
                <span className="num">{item.id}</span> · {item.category} · Illustrative data
              </Flex>
              <Text className="mt-1.5 pr-8 text-[18px] font-semibold leading-snug text-white">{item.title}</Text>
              <Flex role="tablist" aria-label="Issue details" className="-mx-1 mt-4 gap-0.5 overflow-x-auto border-b border-white/[0.07]">
                {detailTabs.map((t, i) => {
              const active = tab === t.id;
              return <button key={t.id} id={`pri-tab-${t.id}`} type="button" role="tab" aria-selected={active} aria-controls="pri-tabpanel" tabIndex={active ? 0 : -1} onClick={() => onTab(t.id)} onKeyDown={(e) => onTabKey(e, i)} className={`-mb-px shrink-0 border-b-2 px-2.5 pb-2.5 pt-1 text-[12.5px] font-medium transition-colors focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-blue-400 ${active ? "border-blue-400 text-white" : "border-transparent text-slate-400 hover:text-slate-200"}`}>
                      {t.label}
                    </button>;
            })}
              </Flex>
            </DrawerHeader>
            <DrawerBody id="pri-tabpanel" role="tabpanel" aria-labelledby={`pri-tab-${tab}`} className="!pt-5">
              <PriorityDetailContent item={item} tab={tab} />
            </DrawerBody>
            <DrawerFooter className="border-t border-white/[0.07]">
              <Flex className="w-full flex-wrap items-center justify-between gap-3">
                <Box className="min-w-0">
                  <Text className="text-[10.5px] uppercase tracking-wider text-slate-500">Recommended next step</Text>
                  <Text className="truncate text-[12.5px] text-slate-200">{item.recommendation.action}</Text>
                </Box>
                <Flex className="flex-wrap items-center gap-2">
                  <Button size="sm" variant="ghost" leftIcon={<WaypointsIcon size={13} />} onClick={onTrace}>Trace</Button>
                  {tab !== "evidence" && <Button size="sm" variant="ghost" leftIcon={<FileSearchIcon size={13} />} onClick={() => onTab("evidence")}>Inspect diligence</Button>}
                  {actions.review && <>
                      <Button size="sm" variant="ghost" leftIcon={<PauseIcon size={13} />} onClick={onDefer} isDisabled={item.status === "deferred"}>Defer</Button>
                      <Button size="sm" variant="outline" leftIcon={<SearchCheckIcon size={13} />} onClick={onRequestValidation}>Request validation</Button>
                      <Button size="sm" variant="primary" leftIcon={<CheckIcon size={13} />} onClick={onApprove}>Approve</Button>
                    </>}
                  {actions.requestValidation && <Button size="sm" variant="primary" leftIcon={<SearchCheckIcon size={13} />} onClick={onRequestValidation}>Request validation</Button>}
                  {actions.createTask && <Button size="sm" variant="primary" leftIcon={<ClipboardPlusIcon size={13} />} onClick={onCreateTask}>Create task</Button>}
                  {!actions.review && !actions.requestValidation && !actions.createTask && <Text className="text-[12px] text-slate-500">
                      {item.status === "task_created" ? "Tracked as a task — follow progress in Next steps." : "Waiting on validation results."}
                    </Text>}
                </Flex>
              </Flex>
            </DrawerFooter>
          </>}
      </DrawerContent>
    </Drawer>;
}