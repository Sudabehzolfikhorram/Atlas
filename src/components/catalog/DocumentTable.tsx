import React, { useMemo, useState } from "react";
import { Box, Button, Flex, IconButton, Select, Text, Tooltip } from "@chakra-ui/react";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, DownloadIcon, EyeIcon, FileUpIcon, Trash2Icon } from "lucide-react";
import type { CatalogDocument, DocFormat, DocStatus } from "../../types/catalog";
import { ACCEPTED_FORMATS, accessMeta, docStatusMeta, formatBytes, formatDateTime, relativeTime } from "../../utils/catalog";
import { ProgressBar } from "../ui/ProgressBar";
type SortKey = "name" | "size" | "updatedAt" | "status";
interface Props {
  documents: CatalogDocument[];
  totalCount: number;
  onPreview: (d: CatalogDocument) => void;
  onDownload: (d: CatalogDocument) => void;
  onRemove: (d: CatalogDocument) => void;
  onUpload: () => void;
  onClearFilters: () => void;
}
export function DocumentTable({
  documents,
  totalCount,
  onPreview,
  onDownload,
  onRemove,
  onUpload,
  onClearFilters
}: Props) {
  const [format, setFormat] = useState<"all" | DocFormat>("all");
  const [status, setStatus] = useState<"all" | DocStatus>("all");
  const [sort, setSort] = useState<{
    key: SortKey;
    dir: "asc" | "desc";
  }>({
    key: "updatedAt",
    dir: "desc"
  });
  const rows = useMemo(() => {
    const r = documents.filter((d) => (format === "all" || d.format === format) && (status === "all" || d.status === status));
    return [...r].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [documents, format, status, sort]);
  const toggleSort = (key: SortKey) => setSort((s) => s.key === key ? {
    key,
    dir: s.dir === "asc" ? "desc" : "asc"
  } : {
    key,
    dir: key === "name" ? "asc" : "desc"
  });
  const header = (key: SortKey, label: string) => {
    const active = sort.key === key;
    const Icon = !active ? ChevronsUpDownIcon : sort.dir === "asc" ? ArrowUpIcon : ArrowDownIcon;
    return <th className="px-3 py-2 font-medium" aria-sort={active ? sort.dir === "asc" ? "ascending" : "descending" : "none"}>
        <button type="button" onClick={() => toggleSort(key)} className={`inline-flex items-center gap-1 uppercase tracking-wider focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${active ? "text-slate-200" : "hover:text-slate-300"}`}>
          {label}<Icon size={11} aria-hidden />
        </button>
      </th>;
  };
  return <Box>
      

      {rows.length === 0 ? <Flex className="flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 px-6 py-10 text-center" role="status">
          <FileUpIcon size={20} className="text-slate-500" aria-hidden />
          <Text className="text-[13.5px] font-medium text-slate-200">{totalCount === 0 ? "No documents yet" : "No documents match these filters"}</Text>
          {totalCount === 0 ? <Button size="sm" variant="primary" onClick={onUpload}>Upload documents</Button> : <Button size="sm" onClick={() => {
        setFormat("all");
        setStatus("all");
        onClearFilters();
      }}>Clear filters</Button>}
        </Flex> : <Box className="overflow-x-auto rounded-xl border border-white/[0.07]">
          <table className="w-full min-w-[900px] text-left text-[12.5px]">
            <caption className="sr-only">Uploaded documents</caption>
            <thead className="bg-white/[0.03] text-[10.5px] text-slate-500">
              <tr>
                {header("name", "Document")}
                <th className="px-3 py-2 font-medium uppercase tracking-wider">Type</th>
                {header("size", "Size")}
                <th className="px-3 py-2 font-medium uppercase tracking-wider">Department</th>
                <th className="px-3 py-2 font-medium uppercase tracking-wider">Access</th>
                {header("status", "Status")}
                {header("updatedAt", "Updated")}
                <th className="px-3 py-2"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
            const sm = docStatusMeta[d.status];
            const busy = d.status === "uploading" || d.status === "processing";
            const canDownload = !!d.file;
            return <tr key={d.id} className="group border-t border-white/[0.05] align-middle transition-colors hover:bg-white/[0.025]">
                    <td className="max-w-[300px] px-3 py-2">
                      <button type="button" onClick={() => onPreview(d)} className="block max-w-full truncate text-left font-medium text-slate-100 hover:text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" title={d.name}>{d.name}</button>
                      <Text className="num text-[11px] text-slate-500">{d.id}</Text>
                    </td>
                    <td className="px-3 py-2"><span className="rounded border border-white/10 px-1.5 py-0.5 text-[10.5px] font-medium text-slate-300">{d.format}</span></td>
                    <td className="num whitespace-nowrap px-3 py-2 text-slate-400">{formatBytes(d.size)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-300">{d.department}</td>
                    <td className={`whitespace-nowrap px-3 py-2 ${accessMeta[d.access]}`}>{d.access}</td>
                    <td className="min-w-[160px] px-3 py-2">
                      <Flex className={`items-center gap-1.5 whitespace-nowrap text-[12px] ${sm.text}`}><span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} aria-hidden />{sm.label}</Flex>
                      {busy && <Box className="mt-1.5"><ProgressBar value={d.progress} color="bg-blue-500" label={`${d.name} progress`} /></Box>}
                      {d.error && <Text className="mt-0.5 max-w-[220px] truncate text-[11px] text-rose-200/80" title={d.error}>{d.error}</Text>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-400">
                      <span title={`Updated ${formatDateTime(d.updatedAt)} · uploaded ${formatDateTime(d.uploadedAt)} by ${d.uploadedBy}`}>{relativeTime(d.updatedAt)}</span>
                    </td>
                    <td className="px-3 py-2">
                      <Flex className="justify-end gap-0.5 opacity-70 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        <Tooltip label="Preview" openDelay={300}><IconButton aria-label={`Preview ${d.name}`} size="xs" variant="ghost" icon={<EyeIcon size={14} />} onClick={() => onPreview(d)} /></Tooltip>
                        <Tooltip label={canDownload ? "Download" : "Sample record — nothing to download"} openDelay={300}>
                          <span><IconButton aria-label={`Download ${d.name}`} size="xs" variant="ghost" icon={<DownloadIcon size={14} />} isDisabled={!canDownload} onClick={() => onDownload(d)} /></span>
                        </Tooltip>
                        {d.status === "failed" && !d.sample && <Tooltip label="Remove from list" openDelay={300}><IconButton aria-label={`Remove ${d.name}`} size="xs" variant="ghost" icon={<Trash2Icon size={14} />} onClick={() => onRemove(d)} /></Tooltip>}
                      </Flex>
                    </td>
                  </tr>;
          })}
            </tbody>
          </table>
        </Box>}
    </Box>;
}