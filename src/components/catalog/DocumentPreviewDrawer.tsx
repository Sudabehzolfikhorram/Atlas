import React, { useEffect, useState } from "react";
import { Box, Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Flex, Text } from "@chakra-ui/react";
import { DownloadIcon, FileTextIcon, LockIcon } from "lucide-react";
import type { CatalogDocument } from "../../types/catalog";
import { accessMeta, docStatusMeta, formatBytes, formatDateTime } from "../../utils/catalog";
interface Props {
  doc: CatalogDocument | null;
  onClose: () => void;
  onDownload: (d: CatalogDocument) => void;
  onRequestAccess: (d: CatalogDocument) => void;
}
const TEXT_FORMATS = ["TXT", "CSV"];
export function DocumentPreviewDrawer({
  doc,
  onClose,
  onDownload,
  onRequestAccess
}: Props) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [readError, setReadError] = useState(false);
  useEffect(() => {
    setText(null);
    setReadError(false);
    if (!doc?.file || !TEXT_FORMATS.includes(doc.format)) return;
    setLoading(true);
    let cancelled = false;
    doc.file.slice(0, 20_000).text().then((t) => !cancelled && setText(t)).catch(() => !cancelled && setReadError(true)).finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [doc]);
  const restricted = doc?.access === "Restricted";
  return <Drawer isOpen={!!doc} onClose={onClose} placement="right" size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        {doc && <>
            <DrawerHeader className="!pb-2">
              <Text className="num text-[11.5px] font-normal text-slate-500">{doc.id} · {doc.sample ? "Sample record" : "Uploaded this session"}</Text>
              <Text className="mt-1 pr-8 text-[17px] font-semibold leading-snug text-white">{doc.name}</Text>
            </DrawerHeader>
            <DrawerBody>
              <Box className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-[12.5px]">
                <Meta label="Format" value={doc.format} />
                <Meta label="Size" value={formatBytes(doc.size)} />
                <Meta label="Uploaded" value={formatDateTime(doc.uploadedAt)} />
                <Meta label="Uploaded by" value={doc.uploadedBy} />
                <Meta label="Department" value={doc.department} />
                <Box><Text className="text-slate-500">Access</Text><Text className={accessMeta[doc.access]}>{doc.access}</Text></Box>
                <Box><Text className="text-slate-500">Status</Text><Text className={docStatusMeta[doc.status].text}>{docStatusMeta[doc.status].label}</Text></Box>
                <Meta label="Last updated" value={formatDateTime(doc.updatedAt)} />
              </Box>
              {doc.error && <Text className="mt-3 rounded-lg border border-rose-400/25 bg-rose-400/[0.06] px-3 py-2 text-[12.5px] text-rose-200">{doc.error}</Text>}

              <Text className="mb-2 mt-5 text-[11px] uppercase tracking-wider text-slate-500">Preview</Text>
              <Box className="min-h-[200px] rounded-xl border border-white/[0.07] bg-[#0C1220] p-4">
                {restricted && doc.sample ? <Empty icon={<LockIcon size={18} />} title="Restricted document" body="You need the document owner's approval to view its content.">
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => onRequestAccess(doc)}>Request access</Button>
                  </Empty> : doc.sample ? <Empty icon={<FileTextIcon size={18} />} title="No content in this demo" body="Sample records describe files without including their content." /> : !doc.file ? <Empty icon={<FileTextIcon size={18} />} title="Nothing to preview" body="This file failed validation, so its content wasn't kept." /> : loading ? <Text className="text-[12.5px] text-slate-400" role="status">Loading preview…</Text> : readError ? <Empty icon={<FileTextIcon size={18} />} title="Couldn't read this file" body="Download it to open it on your device." /> : text != null ? <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap break-words font-mono text-[11.5px] leading-relaxed text-slate-300">{text || "(empty file)"}{doc.size > 20_000 ? "\n\n… preview shows the first 20 KB" : ""}</pre> : <Empty icon={<FileTextIcon size={18} />} title={`In-browser preview isn't available for ${doc.format}`} body="Download the file to open it on your device." />}
              </Box>
            </DrawerBody>
            <DrawerFooter className="gap-2 border-t border-white/[0.07]">
              <Button onClick={onClose}>Close</Button>
              <Button variant="primary" leftIcon={<DownloadIcon size={14} />} isDisabled={!doc.file} onClick={() => onDownload(doc)}>Download</Button>
            </DrawerFooter>
          </>}
      </DrawerContent>
    </Drawer>;
}
function Meta({
  label,
  value



}: {label: string;value: string;}) {
  return <Box className="min-w-0"><Text className="text-slate-500">{label}</Text><Text className="truncate text-slate-200" title={value}>{value}</Text></Box>;
}
function Empty({
  icon,
  title,
  body,
  children





}: {icon: React.ReactNode;title: string;body: string;children?: React.ReactNode;}) {
  return <Flex className="h-full min-h-[170px] flex-col items-center justify-center text-center">
      <Box className="text-slate-500">{icon}</Box>
      <Text className="mt-2 text-[13px] font-medium text-slate-200">{title}</Text>
      <Text className="mt-1 max-w-xs text-[12px] text-slate-500">{body}</Text>
      {children}
    </Flex>;
}