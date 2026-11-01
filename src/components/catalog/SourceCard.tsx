import React, { useState } from "react";
import { Box, Button, Flex, Text, Tooltip } from "@chakra-ui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BanIcon, CheckIcon, ChevronDownIcon, DatabaseIcon, FileTextIcon, LockIcon, MailIcon, MessageSquareIcon, PlugZapIcon, UploadIcon, VideoIcon } from "lucide-react";
import type { CatalogSource, SourceCategory } from "../../types/catalog";
import { collectionLabel, compactNumber, connectionMeta, formatDateTime, relativeTime } from "../../utils/catalog";
import { accessMeta } from "../../utils/catalog";
const categoryIcon: Record<SourceCategory, typeof DatabaseIcon> = {
  documents: FileTextIcon,
  systems: DatabaseIcon,
  emails: MailIcon,
  chats: MessageSquareIcon,
  meetings: VideoIcon
};
const iconTone: Record<SourceCategory, string> = {
  documents: "text-violet-300 bg-violet-400/10",
  systems: "text-blue-300 bg-blue-500/10",
  emails: "text-sky-300 bg-sky-400/10",
  chats: "text-teal-300 bg-teal-400/10",
  meetings: "text-amber-300 bg-amber-400/10"
};
interface Props {
  source: CatalogSource;
  onRequestConnection: (s: CatalogSource) => void;
  onReportFailure: (s: CatalogSource) => void;
  onRequestAccess: (s: CatalogSource) => void;
  onUpload: () => void;
}
export function SourceCard({
  source: s,
  onRequestConnection,
  onReportFailure,
  onRequestAccess,
  onUpload
}: Props) {
  const [scopeOpen, setScopeOpen] = useState(false);
  const reduce = useReducedMotion();
  const meta = connectionMeta[s.status];
  const Icon = categoryIcon[s.category];
  const scopeId = `${s.id}-scope`;
  // Connect reflects the real connection state; nothing is collected until the owner authorizes.
  const connect = s.status === "connected" ? {
    disabled: true,
    primary: false,
    hint: "Already connected",
    onClick: undefined
  } : s.status === "pending" ? {
    disabled: true,
    primary: false,
    hint: "Awaiting owner authorization",
    onClick: undefined
  } : s.status === "failed" ? {
    disabled: false,
    primary: true,
    hint: "Connection failed — ask the owner to renew access",
    onClick: () => onReportFailure(s)
  } : {
    disabled: false,
    primary: true,
    hint: `Request a connection from ${s.owner}`,
    onClick: () => onRequestConnection(s)
  };
  const facts = [{
    label: "Indexed",
    value: s.records == null ? "—" : `${compactNumber(s.records)} ${s.recordUnit}`
  }, {
    label: "Last sync",
    value: relativeTime(s.lastSync),
    title: s.lastSync ? formatDateTime(s.lastSync) : undefined
  }, {
    label: "Access",
    value: s.permission,
    title: `${s.permission} · collection ${collectionLabel[s.collection].toLowerCase()}`
  }];
  return <Box as="article" aria-labelledby={`${s.id}-name`} className={`glass flex flex-col rounded-2xl p-4 transition-colors hover:border-white/[0.14] ${s.status === "failed" ? "!border-rose-400/25" : ""}`} style={{
    paddingTop: "20px",
    paddingBottom: "20px",
    paddingLeft: "20px",
    paddingRight: "20px",
    gap: "12px"
  }}>
      <Flex className="items-start gap-3">
        <Flex className={`h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconTone[s.category]}`}>
          <Icon size={16} aria-hidden />
        </Flex>
        <Box className="min-w-0 flex-1">
          <Text id={`${s.id}-name`} className="truncate text-[14px] font-medium text-slate-100">{s.name}</Text>
          <Text className="truncate text-[11.5px] text-slate-500" title={s.identity}>{s.identity}</Text>
        </Box>
        <Tooltip label={s.statusNote} openDelay={250} hasArrow placement="top">
          <span tabIndex={0} className={`inline-flex shrink-0 cursor-default items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${meta.chip}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />{meta.label}
          </span>
        </Tooltip>
      </Flex>

      <Box as="dl" className="mt-3.5 grid grid-cols-3 gap-2" style={{
      gap: "12px"
    }}>
        {facts.map((f) => <Box key={f.label} className="min-w-0 rounded-lg bg-white/[0.03] px-2.5 py-2">
            <Text as="dt" className="text-[10.5px] text-slate-500">{f.label}</Text>
            <Text as="dd" className="truncate text-[12.5px] font-medium text-slate-200" title={f.title ?? f.value}>{f.value}</Text>
          </Box>)}
      </Box>

      {s.restricted ? <Flex className="mt-3 items-center gap-2 rounded-lg border border-white/[0.06] px-2.5 py-2">
          <LockIcon size={13} className="shrink-0 text-slate-400" aria-hidden />
          <Text className="flex-1 text-[12px] text-slate-400">Scope restricted to HR data stewards</Text>
          <Button size="xs" variant="ghost" onClick={() => onRequestAccess(s)}>Request access</Button>
        </Flex> : <Box className="mt-3">
          <button type="button" aria-expanded={scopeOpen} aria-controls={scopeId} onClick={() => setScopeOpen((o) => !o)} className="flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left text-[12px] transition-colors hover:bg-white/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
            <span className="flex items-center gap-1 text-teal-300" style={{
          color: "#5FAADC"
        }}><CheckIcon size={12} aria-hidden /><span className="num">{s.scope.length}</span> authorized</span>
            <span className="flex items-center gap-1 text-slate-400"><BanIcon size={12} aria-hidden /><span className="num">{s.excluded.length}</span> outside scope</span>
            <ChevronDownIcon size={14} className={`ml-auto text-slate-500 transition-transform ${scopeOpen ? "rotate-180" : ""}`} aria-hidden />
          </button>
          <AnimatePresence initial={false}>
            {scopeOpen && <motion.div id={scopeId} key="scope" initial={reduce ? false : {
          height: 0,
          opacity: 0
        }} animate={{
          height: "auto",
          opacity: 1
        }} exit={reduce ? {
          opacity: 0
        } : {
          height: 0,
          opacity: 0
        }} transition={{
          duration: 0.18
        }} className="overflow-hidden">
                <Box className="mt-1.5 space-y-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                  <Box as="ul" className="space-y-0.5">
                    {s.scope.length ? s.scope.map((x) => <Text as="li" key={x} className="flex items-start gap-1.5 text-[12px] text-slate-300"><CheckIcon size={12} className="mt-0.5 shrink-0 text-teal-300" aria-hidden />{x}</Text>) : <Text as="li" className="text-[12px] text-slate-500">Nothing authorized yet</Text>}
                  </Box>
                  {s.excluded.length > 0 && <Box as="ul" className="space-y-0.5 border-t border-white/[0.06] pt-2">
                      {s.excluded.map((x) => <Text as="li" key={x} className="flex items-start gap-1.5 text-[12px] text-slate-400"><BanIcon size={12} className="mt-0.5 shrink-0 text-slate-500" aria-hidden />{x}</Text>)}
                    </Box>}
                </Box>
              </motion.div>}
          </AnimatePresence>
        </Box>}

      <Box className="min-h-3 flex-1" aria-hidden style={{
      height: "16px"
    }} />
      <Flex className="items-center gap-2 border-t border-white/[0.05] pt-3">
        
        <Button size="xs" variant="outline" leftIcon={<UploadIcon size={12} />} onClick={onUpload}>Upload</Button>
        <Tooltip label={connect.hint} openDelay={300} hasArrow placement="top">
          <span>
            <Button size="xs" variant={connect.primary ? "primary" : "outline"} leftIcon={<PlugZapIcon size={12} />} isDisabled={connect.disabled} onClick={connect.onClick}>
              Connect
            </Button>
          </span>
        </Tooltip>
      </Flex>
    </Box>;
}