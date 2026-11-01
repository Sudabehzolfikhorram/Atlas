import { useCallback, useMemo, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { catalogSources, sampleDocuments } from "../data/catalog";
import { currentUser } from "../data/currentUser";
import { useAudit } from "../contexts/AuditContext";
import type { AccessLevel, CatalogDocument, CatalogSource, CatalogView, ConnectionStatus } from "../types/catalog";
import { ACCEPTED_FORMATS, MAX_UPLOAD_BYTES, formatBytes, formatOf } from "../utils/catalog";

export type DateFilter = "any" | "24h" | "7d" | "30d";

export interface CatalogFilters {
  query: string;
  department: string;
  status: "all" | ConnectionStatus;
  access: "all" | AccessLevel;
  date: DateFilter;
}

const DEFAULT_FILTERS: CatalogFilters = { query: "", department: "all", status: "all", access: "all", date: "any" };
const dateWindow: Record<DateFilter, number> = { any: Infinity, "24h": 24, "7d": 168, "30d": 720 };

function withinDate(iso: string | null, f: DateFilter) {
  if (f === "any") return true;
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() <= dateWindow[f] * 3_600_000;
}

export function useCatalog() {
  const toast = useToast();
  const { log } = useAudit();
  const [view, setView] = useState<CatalogView>("all");
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [sources, setSources] = useState<CatalogSource[]>(catalogSources);
  const [documents, setDocuments] = useState<CatalogDocument[]>(sampleDocuments);

  const setFilter = <K extends keyof CatalogFilters,>(key: K, value: CatalogFilters[K]) => setFilters((f) => ({ ...f, [key]: value }));
  const clearFilters = () => setFilters(DEFAULT_FILTERS);
  const hasFilters = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  const q = filters.query.trim().toLowerCase();

  const filteredSources = useMemo(
    () =>
    sources.filter(
      (s) =>
      (view === "all" || s.category === view) && (
      filters.department === "all" || s.department === filters.department) && (
      filters.status === "all" || s.status === filters.status) && (
      filters.access === "all" || s.access === filters.access) &&
      withinDate(s.lastSync, filters.date) && (
      !q || [s.name, s.identity, s.owner, s.department, ...s.scope].some((t) => t.toLowerCase().includes(q)))
    ),
    [sources, view, filters, q]
  );

  const filteredDocuments = useMemo(
    () =>
    documents.filter(
      (d) =>
      (filters.department === "all" || d.department === filters.department) && (
      filters.access === "all" || d.access === filters.access) &&
      withinDate(d.uploadedAt, filters.date) && (
      !q || [d.name, d.uploadedBy, d.department, d.format].some((t) => t.toLowerCase().includes(q)))
    ),
    [documents, filters, q]
  );

  const stats = useMemo(() => {
    const connected = sources.filter((s) => s.status === "connected").length;
    const attentionSources = sources.filter((s) => s.status !== "connected").length;
    const failedDocs = documents.filter((d) => d.status === "failed").length;
    return {
      total: sources.length,
      connected,
      imported: documents.filter((d) => d.status === "indexed" || d.status === "awaiting_index").length,
      indexed: documents.filter((d) => d.status === "indexed").length,
      processing: documents.filter((d) => d.status === "processing" || d.status === "uploading").length,
      attention: attentionSources + failedDocs,
      attentionSources,
      failedDocs
    };
  }, [sources, documents]);

  const counts = useMemo(() => {
    const c: Record<CatalogView, number> = { all: sources.length, documents: 0, systems: 0, emails: 0, chats: 0, meetings: 0 };
    sources.forEach((s) => c[s.category] += 1);
    return c;
  }, [sources]);

  const patchDoc = (id: string, patch: Partial<CatalogDocument>) => setDocuments((ds) => ds.map((d) => d.id === id ? { ...d, ...patch } : d));

  /** Reads files locally in the browser. Content stays in this session; nothing is sent to a server. */
  const uploadFiles = useCallback(
    (files: File[], meta: {department: string;access: AccessLevel;}) => {
      const now = new Date().toISOString();
      const entries: CatalogDocument[] = files.map((file, i) => {
        const format = formatOf(file.name);
        const error =
        format === "Unknown" ?
        `Unsupported format. Use ${ACCEPTED_FORMATS.join(", ")}.` :
        file.size > MAX_UPLOAD_BYTES ?
        `File is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)}.` :
        file.size === 0 ?
        "File is empty." :
        undefined;
        return {
          id: `DOC-U${Date.now().toString(36)}${i}`,
          name: file.name,
          format,
          size: file.size,
          uploadedAt: now,
          uploadedBy: currentUser.name,
          department: meta.department,
          status: error ? "failed" : "uploading",
          progress: 0,
          access: meta.access,
          updatedAt: now,
          error,
          file: error ? undefined : file,
          sample: false
        };
      });
      setDocuments((ds) => [...entries, ...ds]);

      entries.forEach((entry) => {
        if (entry.status === "failed" || !entry.file) return;
        const reader = new FileReader();
        reader.onprogress = (e) => {
          if (e.lengthComputable) patchDoc(entry.id, { progress: Math.round(e.loaded / e.total * 100) });
        };
        reader.onload = () => patchDoc(entry.id, { status: "awaiting_index", progress: 100, updatedAt: new Date().toISOString() });
        reader.onerror = () => patchDoc(entry.id, { status: "failed", error: "The browser couldn't read this file. Try uploading it again.", file: undefined });
        reader.readAsArrayBuffer(entry.file);
      });

      const ok = entries.filter((e) => !e.error).length;
      const failed = entries.length - ok;
      log({ category: "Governance", action: "Uploaded documents", target: `${ok} file${ok === 1 ? "" : "s"} · ${meta.department}`, detail: failed ? `${failed} rejected during validation` : undefined });
      toast({
        title: ok ? `${ok} file${ok === 1 ? "" : "s"} added` : "No files were added",
        description: failed ? `${failed} file${failed === 1 ? "" : "s"} failed validation — see the list for details.` : "Stored in this session. Indexing needs the processing service.",
        status: failed ? ok ? "warning" : "error" : "success",
        duration: 4000,
        position: "bottom-right"
      });
    },
    [log, toast]
  );

  const removeDocument = (doc: CatalogDocument) => {
    setDocuments((ds) => ds.filter((d) => d.id !== doc.id));
    log({ category: "Governance", action: "Removed failed upload", target: doc.name });
  };

  const requestConnection = (source: CatalogSource) => {
    setSources((ss) =>
    ss.map((s) =>
    s.id === source.id ? { ...s, status: "pending", statusNote: `Connection requested by ${currentUser.name}. Awaiting authorization from ${s.owner}.` } : s
    )
    );
    log({ category: "Access", action: "Requested source connection", target: source.name, detail: "Nothing is collected until the owner authorizes access." });
    toast({ title: "Connection requested", description: `${source.owner} must authorize it before any data is collected.`, status: "info", duration: 3500, position: "bottom-right" });
  };

  const reportFailure = (source: CatalogSource) => {
    log({ category: "Access", action: "Escalated failed connection", target: source.name, detail: source.statusNote });
    toast({ title: "Escalated to the source owner", description: `${source.owner} has been asked to renew access. Retrying needs the connector service, which isn't available in this demo.`, status: "info", duration: 4500, position: "bottom-right" });
  };

  const requestAccess = (source: CatalogSource) => {
    log({ category: "Access", action: "Requested access to source details", target: source.name });
    toast({ title: "Access request recorded", description: `${source.owner} will review your request.`, status: "info", duration: 3200, position: "bottom-right" });
  };

  return {
    view,
    setView,
    filters,
    setFilter,
    clearFilters,
    hasFilters,
    sources: filteredSources,
    documents: filteredDocuments,
    allDocumentsCount: documents.length,
    stats,
    counts,
    uploadFiles,
    removeDocument,
    requestConnection,
    reportFailure,
    requestAccess
  };
}