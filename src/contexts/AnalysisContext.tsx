import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { ANALYSIS_DURATION_MS, baselineResults } from "../data/analysis";
import { catalogSources, sampleDocuments } from "../data/catalog";
import { currentUser } from "../data/currentUser";
import type { AnalysisInput, AnalysisResults, AnalysisRun, SkippedInput } from "../types/analysis";
import type { AccessLevel, CatalogDocument, CatalogSource } from "../types/catalog";
import { simulateAnalysis, sourceToInput, toResultItem } from "../utils/analysis";
import { ACCEPTED_FORMATS, MAX_UPLOAD_BYTES, formatBytes, formatOf } from "../utils/catalog";
import { useAudit } from "./AuditContext";
interface AnalysisContextValue {
  documents: CatalogDocument[];
  sources: CatalogSource[];
  uploadFiles: (files: File[], meta: {
    department: string;
    access: AccessLevel;
  }) => void;
  /** Results currently shown on the Overview (the last COMPLETED run). */
  results: AnalysisResults;
  run: AnalysisRun | null;
  isRunning: boolean;
  start: (inputs: AnalysisInput[], skipped?: SkippedInput[]) => void;
  cancel: () => void;
  dismiss: () => void;
}
const TICK_MS = 120;
/** Catalog documents not offered in the analysis input picker. */
const HIDDEN_FROM_ANALYSIS = ["DOC-2038", "DOC-2039", "DOC-2036"];
const AnalysisContext = createContext<AnalysisContextValue | null>(null);
export function AnalysisProvider({
  children


}: {children: React.ReactNode;}) {
  const toast = useToast();
  const {
    log
  } = useAudit();
  const [documents, setDocuments] = useState<CatalogDocument[]>(() => sampleDocuments.filter((d) => !HIDDEN_FROM_ANALYSIS.includes(d.id)));
  const [results, setResults] = useState<AnalysisResults>(() => ({
    ...baselineResults,
    items: catalogSources.map(sourceToInput).map((i) => toResultItem(i, i.ready ? "analyzed" : "excluded", i.blockedReason))
  }));
  const [run, setRun] = useState<AnalysisRun | null>(null);
  const isRunning = run?.status === "running";

  // Simulated progress
  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      setRun((r) => r && r.status === "running" ? {
        ...r,
        progress: Math.min(100, r.progress + 100 * TICK_MS / ANALYSIS_DURATION_MS)
      } : r);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [isRunning]);

  // Publish on completion — previous results stay until this point.
  useEffect(() => {
    if (!run || run.status !== "running" || run.progress < 100) return;
    setResults({
      ...run.results,
      items: [...run.inputs.map((i) => toResultItem(i, "analyzed")), ...(run.skipped ?? []).map((s) => toResultItem(s.input, s.status, s.input.blockedReason))]
    });
    setRun({
      ...run,
      status: "completed"
    });
    log({
      category: "Investigation",
      action: "Completed process analysis (simulated)",
      target: `Run ${run.runId}`,
      detail: `${run.inputs.length} inputs · results published to Overview`
    });
    toast({
      title: `Run ${run.runId} complete`,
      description: "Process Health now shows the new results. Processing was simulated for this demo.",
      status: "success",
      duration: 4000,
      position: "bottom-right"
    });
  }, [run, log, toast]);
  const start = useCallback((inputs: AnalysisInput[], skipped: SkippedInput[] = []) => {
    const ready = inputs.filter((i) => i.ready);
    if (!ready.length || isRunning) return;
    const runId = Math.max(results.runId, run?.runId ?? 0) + 1;
    const {
      results: next,
      summaries
    } = simulateAnalysis(runId, ready);
    setRun({
      runId,
      inputs: ready,
      startedAt: new Date().toISOString(),
      progress: 0,
      status: "running",
      summaries,
      results: next,
      skipped,
      previousRunId: results.runId
    });
    log({
      category: "Investigation",
      action: "Started process analysis (simulated)",
      target: `Run ${runId}`,
      detail: ready.map((i) => i.name).join(", ")
    });
  }, [isRunning, results.runId, run, log]);
  const cancel = useCallback(() => {
    if (!run || run.status !== "running") return;
    log({
      category: "Investigation",
      action: "Cancelled process analysis",
      target: `Run ${run.runId}`,
      detail: `Overview keeps Run ${run.previousRunId} results`
    });
    setRun(null);
    toast({
      title: "Analysis cancelled",
      description: `The Overview still shows Run ${run.previousRunId}.`,
      status: "info",
      duration: 3000,
      position: "bottom-right"
    });
  }, [run, log, toast]);
  const dismiss = useCallback(() => setRun((r) => r?.status === "completed" ? null : r), []);
  const patchDoc = (id: string, patch: Partial<CatalogDocument>) => setDocuments((ds) => ds.map((d) => d.id === id ? {
    ...d,
    ...patch
  } : d));

  /** Files are read locally in the browser for this session; nothing is sent to a server. */
  const uploadFiles = useCallback((files: File[], meta: {
    department: string;
    access: AccessLevel;
  }) => {
    const now = new Date().toISOString();
    const entries: CatalogDocument[] = files.map((file, i) => {
      const format = formatOf(file.name);
      const error = format === "Unknown" ? `Unsupported format. Use ${ACCEPTED_FORMATS.join(", ")}.` : file.size > MAX_UPLOAD_BYTES ? `File is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)}.` : file.size === 0 ? "File is empty." : undefined;
      return {
        id: `DOC-A${Date.now().toString(36)}${i}`,
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
      if (!entry.file) return;
      const reader = new FileReader();
      reader.onload = () => patchDoc(entry.id, {
        status: "awaiting_index",
        progress: 100
      });
      reader.onerror = () => patchDoc(entry.id, {
        status: "failed",
        error: "The browser couldn't read this file. Try uploading it again.",
        file: undefined
      });
      reader.readAsArrayBuffer(entry.file);
    });
    const ok = entries.filter((e) => !e.error).length;
    log({
      category: "Governance",
      action: "Uploaded documents for analysis",
      target: `${ok} file${ok === 1 ? "" : "s"} · ${meta.department}`
    });
  }, [log]);
  const value = useMemo(() => ({
    documents,
    sources: catalogSources,
    uploadFiles,
    results,
    run,
    isRunning,
    start,
    cancel,
    dismiss
  }), [documents, uploadFiles, results, run, isRunning, start, cancel, dismiss]);
  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}
export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}