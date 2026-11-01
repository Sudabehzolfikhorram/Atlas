import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Heading, Text, useToast } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DatabaseIcon, FileTextIcon, LayersIcon, MailIcon, MessageSquareIcon, PlugZapIcon, SearchXIcon, UploadIcon, VideoIcon } from "lucide-react";
import { CatalogStats } from "../components/catalog/CatalogStats";
import { SourceCard } from "../components/catalog/SourceCard";
import { DocumentTable } from "../components/catalog/DocumentTable";
import { UploadModal } from "../components/catalog/UploadModal";
import { DocumentPreviewDrawer } from "../components/catalog/DocumentPreviewDrawer";
import { DemoBadge } from "../components/ui/DemoBadge";
import { InfoTip } from "../components/ui/InfoTip";
import { useCatalog } from "../hooks/useCatalog";
import { useAudit } from "../contexts/AuditContext";
import type { CatalogDocument, CatalogView } from "../types/catalog";
import { categoryLabel } from "../utils/catalog";
type MainTab = "documents" | "connections";
const connectionTabs: {
  id: CatalogView;
  label: string;
  Icon: typeof LayersIcon;
}[] = [{
  id: "all",
  label: "All",
  Icon: LayersIcon
}, {
  id: "systems",
  label: categoryLabel.systems,
  Icon: DatabaseIcon
}, {
  id: "emails",
  label: categoryLabel.emails,
  Icon: MailIcon
}, {
  id: "chats",
  label: categoryLabel.chats,
  Icon: MessageSquareIcon
}, {
  id: "meetings",
  label: categoryLabel.meetings,
  Icon: VideoIcon
}, {
  id: "documents",
  label: "Repositories",
  Icon: FileTextIcon
}];
export function OrganizationCatalog() {
  const c = useCatalog();
  const toast = useToast();
  const reduce = useReducedMotion();
  const location = useLocation();
  const {
    log
  } = useAudit();
  const focus = (location.state as {
    focus?: string;
  } | null)?.focus;
  const [tab, setTab] = useState<MainTab>("documents");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [preview, setPreview] = useState<CatalogDocument | null>(null);

  // Deep links (e.g. "View All Documents" from AI Chat) land on the Documents tab.
  useEffect(() => {
    if (focus === "catalog-documents") setTab("documents");
  }, [focus]);

  // The source-category view only applies to the connections tab.
  const switchTab = (t: MainTab) => {
    setTab(t);
    if (t === "documents") c.setView("all");
  };
  const download = (d: CatalogDocument) => {
    if (!d.file) return;
    const url = URL.createObjectURL(d.file);
    const a = document.createElement("a");
    a.href = url;
    a.download = d.name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    log({
      category: "Access",
      action: "Downloaded document",
      target: d.name
    });
  };
  const requestDocAccess = (d: CatalogDocument) => {
    log({
      category: "Access",
      action: "Requested document access",
      target: d.name
    });
    toast({
      title: "Access request recorded",
      description: `The ${d.department} document owner will review it.`,
      status: "info",
      duration: 3200,
      position: "bottom-right"
    });
  };
  const mainTabs: {
    id: MainTab;
    label: string;
    Icon: typeof LayersIcon;
    count: number;
  }[] = [{
    id: "documents",
    label: "Documents",
    Icon: FileTextIcon,
    count: c.allDocumentsCount
  }, {
    id: "connections",
    label: "Data connections",
    Icon: PlugZapIcon,
    count: c.stats.total
  }];
  const onMainKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = mainTabs[(i + 1) % mainTabs.length];
    switchTab(next.id);
    document.getElementById(`cat-main-${next.id}`)?.focus();
  };
  const onSubKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = connectionTabs[(i + (e.key === "ArrowRight" ? 1 : connectionTabs.length - 1)) % connectionTabs.length];
    c.setView(next.id);
    document.getElementById(`cat-sub-${next.id}`)?.focus();
  };
  return <Box className="space-y-5">
      <Flex className="flex-wrap items-center gap-3">
        <Flex className="min-w-0 items-center gap-2">
          <Heading as="h1" className="!text-[24px] !font-semibold tracking-tight text-white">Data sources</Heading>
          <InfoTip label="Data sources">
            Every authorized source the AI can learn from — what it covers, who can see it, when it last updated and whether it's ready for analysis.
            <span className="mt-2 block text-slate-400">
              The AI only reads a source's <span className="text-slate-200">authorized scope</span>, with read-only or metadata-only access. Anything outside scope is never collected. Connections in this demo are illustrative.
            </span>
          </InfoTip>
          <DemoBadge />
        </Flex>
        <Button variant="primary" size="sm" className="ml-auto" leftIcon={<UploadIcon size={14} />} onClick={() => setUploadOpen(true)}>Upload and connect</Button>
      </Flex>

      <CatalogStats stats={c.stats} />

      <Box className="glass overflow-hidden rounded-2xl">
        <Flex className="items-center gap-2 border-b border-white/[0.06] px-3 pr-4 md:pr-5">
        <Flex role="tablist" aria-label="Data sources sections" className="w-fit shrink-0 gap-1 pt-2">
          {mainTabs.map((t, i) => {
            const on = tab === t.id;
            return <button key={t.id} id={`cat-main-${t.id}`} type="button" role="tab" aria-selected={on} aria-controls="cat-main-panel" tabIndex={on ? 0 : -1} onClick={() => switchTab(t.id)} onKeyDown={(e) => onMainKey(e, i)} className={`relative flex h-11 items-center gap-2 px-3 text-[13.5px] font-medium transition-colors focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-blue-400 ${on ? "text-white" : "text-slate-400 hover:text-slate-200"}`}>
                <t.Icon size={15} className={on ? "text-blue-300" : ""} aria-hidden />
                {t.label}
                <span className={`num rounded px-1.5 text-[11px] ${on ? "bg-blue-500/20 text-blue-200" : "bg-white/[0.06] text-slate-400"}`}>{t.count}</span>
                {on && <motion.span layoutId="cat-main-underline" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-blue-400" transition={reduce ? {
                duration: 0
              } : {
                type: "spring",
                stiffness: 500,
                damping: 40
              }} aria-hidden />}
              </button>;
          })}
        </Flex>
          <Flex className="ml-auto items-center gap-1.5">
            {tab === "documents" ? <InfoTip label="Documents">Files added directly to the catalog. New uploads stay in this session and wait for indexing before the AI can use them.</InfoTip> : <InfoTip label="Data connections">Systems, mailboxes, chat workspaces, meeting recordings and document repositories connected with read-only or metadata-only access. Expand a card to see exactly what is in and out of scope.</InfoTip>}
            <Button size="sm" variant="outline" leftIcon={<UploadIcon size={13} />} onClick={() => setUploadOpen(true)}>Upload</Button>
          </Flex>
        </Flex>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab} id="cat-main-panel" role="tabpanel" aria-labelledby={`cat-main-${tab}`} initial={reduce ? false : {
          opacity: 0,
          y: 4
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={reduce ? undefined : {
          opacity: 0
        }} transition={{
          duration: 0.16
        }} className="space-y-4 p-4 md:p-5">
            {tab === "documents" ? <Box as="section" id="catalog-documents" aria-label="Documents" className="space-y-3">
                <DocumentTable documents={c.documents} totalCount={c.allDocumentsCount} onPreview={setPreview} onDownload={download} onRemove={c.removeDocument} onUpload={() => setUploadOpen(true)} onClearFilters={c.clearFilters} />
              </Box> : <Box as="section" aria-label="Data connections" className="space-y-3">
                <Flex className="flex-wrap items-center gap-3">
                  <Flex role="tablist" aria-label="Connection type" className="inline-flex w-fit max-w-full overflow-x-auto rounded-xl border border-white/[0.08] bg-black/20 p-1">
                    {connectionTabs.map(({
                  id,
                  label,
                  Icon
                }, i) => {
                  const active = c.view === id;
                  return <button key={id} id={`cat-sub-${id}`} type="button" role="tab" aria-selected={active} aria-controls="cat-sources" tabIndex={active ? 0 : -1} onClick={() => c.setView(id)} onKeyDown={(e) => onSubKey(e, i)} className={`inline-flex h-8 shrink-0 items-center gap-2 rounded-lg border px-3 text-[12.5px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${active ? "border-white/10 bg-white/[0.1] text-white" : "border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"}`}>
                          <Icon size={13} aria-hidden className={active ? "text-blue-300" : ""} />
                          {label}
                          <span className={`num rounded px-1 text-[10.5px] ${active ? "bg-blue-500/20 text-blue-200" : "bg-white/[0.06] text-slate-400"}`}>{c.counts[id]}</span>
                        </button>;
                })}
                  </Flex>
                </Flex>
                <Box id="cat-sources">
                  {c.sources.length ? <Box className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3" style={{
                gap: "20px"
              }}>
                      {c.sources.map((s) => <SourceCard key={s.id} source={s} onRequestConnection={c.requestConnection} onReportFailure={c.reportFailure} onRequestAccess={c.requestAccess} onUpload={() => setUploadOpen(true)} />)}
                    </Box> : <Flex className="flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 px-6 py-10 text-center" role="status">
                      <SearchXIcon size={20} className="text-slate-500" aria-hidden />
                      <Text className="text-[13.5px] font-medium text-slate-200">No connections match these filters</Text>
                      <Button size="sm" onClick={() => {
                  c.clearFilters();
                  c.setView("all");
                }}>Show all connections</Button>
                    </Flex>}
                </Box>
              </Box>}
          </motion.div>
        </AnimatePresence>
      </Box>

      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onUpload={c.uploadFiles} />
      <DocumentPreviewDrawer doc={preview} onClose={() => setPreview(null)} onDownload={download} onRequestAccess={requestDocAccess} />
    </Box>;
}