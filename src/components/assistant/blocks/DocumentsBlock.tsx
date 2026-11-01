import React from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon, DatabaseIcon, FileTextIcon, FolderOpenIcon } from "lucide-react";
import { catalogSources, sampleDocuments } from "../../../data/catalog";
import { connectionMeta, docStatusMeta, formatBytes, relativeTime } from "../../../utils/catalog";
import type { ResponseBlock } from "../../../types/assistant";
import { ExpandableCard } from "./ExpandableCard";
type Block = Extract<ResponseBlock, {
  kind: "documents";
}>;
const PREVIEW = 3;
const formatTone: Record<string, string> = {
  PDF: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  DOCX: "border-blue-400/30 bg-blue-400/10 text-blue-300",
  XLSX: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  CSV: "border-teal-400/30 bg-teal-400/10 text-teal-300",
  TXT: "border-slate-400/30 bg-slate-400/10 text-slate-300",
  PPTX: "border-orange-400/30 bg-orange-400/10 text-orange-300"
};

/** Source documents card. Every entry resolves against the Organization Catalog — unknown ids are dropped, never invented. */
export function DocumentsBlock({
  block


}: {block: Block;}) {
  const navigate = useNavigate();
  const docs = block.documents.map((d) => ({
    ...d,
    doc: sampleDocuments.find((x) => x.id === d.id)
  })).filter((d): d is typeof d & {
    doc: NonNullable<typeof d.doc>;
  } => Boolean(d.doc));
  const systems = (block.systems ?? []).map((s) => ({
    ...s,
    src: catalogSources.find((x) => x.id === s.id)
  })).filter((s): s is typeof s & {
    src: NonNullable<typeof s.src>;
  } => Boolean(s.src));
  const excluded = (block.excluded ?? []).map((e) => ({
    ...e,
    doc: sampleDocuments.find((x) => x.id === e.id)
  })).filter((e) => e.doc);
  const row = (d: (typeof docs)[number], full: boolean) => <li key={d.id} className="flex items-start gap-2.5 py-2 first:pt-0 last:pb-0">
      <span className={`mt-0.5 w-11 shrink-0 rounded-md border px-1 py-0.5 text-center text-[10px] font-semibold ${formatTone[d.doc.format] ?? formatTone.TXT}`}>{d.doc.format}</span>
      <Box className="min-w-0 flex-1">
        <Text className="truncate text-[12.5px] font-medium text-slate-100">{d.doc.name}</Text>
        <Text className="text-[11.5px] leading-snug text-slate-400">{d.usedFor}</Text>
        {full && <Flex className="mt-1 flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
            <span className="num">{d.doc.id}</span>
            <span>{d.doc.department}</span>
            <span>{formatBytes(d.doc.size)}</span>
            <span>{d.doc.access}</span>
            <span>Updated {relativeTime(d.doc.updatedAt)}</span>
            <span className={docStatusMeta[d.doc.status].text}>{docStatusMeta[d.doc.status].label}</span>
          </Flex>}
      </Box>
    </li>;
  const hidden = docs.length - PREVIEW;
  return <ExpandableCard icon={FileTextIcon} title={block.title} meta={`${docs.length} documents · ${systems.length} connected systems · from Organization Catalog`} preview={<>
          <ul className="divide-y divide-white/[0.05]">{docs.slice(0, PREVIEW).map((d) => row(d, false))}</ul>
          {hidden > 0 && <Text className="mt-2 text-[11.5px] text-slate-500">+{hidden} more documents and {systems.length} systems — expand to see all with metadata</Text>}
        </>} details={<Box className="space-y-4">
          <Box>
            <Text className="mb-1.5 text-[11px] uppercase tracking-wider text-slate-500">All documents used</Text>
            <ul className="divide-y divide-white/[0.05]">{docs.map((d) => row(d, true))}</ul>
          </Box>
          {systems.length > 0 && <Box>
              <Text className="mb-1.5 text-[11px] uppercase tracking-wider text-slate-500">Connected systems</Text>
              <ul className="space-y-1.5">
                {systems.map((s) => <li key={s.id} className="flex items-start gap-2.5 rounded-lg bg-white/[0.03] px-2.5 py-2">
                    <DatabaseIcon size={13} className="mt-0.5 shrink-0 text-slate-400" aria-hidden />
                    <Box className="min-w-0 flex-1">
                      <Flex className="items-center gap-2">
                        <Text className="truncate text-[12.5px] font-medium text-slate-100">{s.src.name}</Text>
                        <span className={`shrink-0 rounded border px-1.5 py-px text-[10px] ${connectionMeta[s.src.status].chip}`}>{connectionMeta[s.src.status].label}</span>
                      </Flex>
                      <Text className="text-[11px] text-slate-500">{s.src.identity} · {s.src.permission}</Text>
                      <Text className="text-[11.5px] text-slate-400">{s.usedFor}</Text>
                    </Box>
                  </li>)}
              </ul>
            </Box>}
          {excluded.length > 0 && <Box>
              <Text className="mb-1.5 text-[11px] uppercase tracking-wider text-slate-500">Not used</Text>
              <ul className="space-y-1">
                {excluded.map((e) => <li key={e.id} className="flex flex-wrap items-baseline gap-x-2 text-[12px]">
                    <span className="text-slate-300">{e.doc!.name}</span>
                    <span className="text-[11px] text-amber-300">{e.reason}</span>
                  </li>)}
              </ul>
            </Box>}
        </Box>} footer={<Button size="xs" variant="link" className="!text-blue-300" leftIcon={<FolderOpenIcon size={12} />} rightIcon={<ArrowRightIcon size={12} />} onClick={() => navigate("/catalog", {
    state: {
      focus: "catalog-documents"
    }
  })}>
          View All Documents in Organization Catalog
        </Button>} />;
}