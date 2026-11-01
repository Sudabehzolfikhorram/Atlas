import type { AccessLevel, CollectionStatus, ConnectionStatus, DocFormat, DocStatus } from "../types/catalog";

export const ACCEPTED_FORMATS: DocFormat[] = ["PDF", "DOCX", "XLSX", "CSV", "TXT", "PPTX"];
export const ACCEPT_ATTR = ".pdf,.docx,.xlsx,.csv,.txt,.pptx";
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

export function formatOf(name: string): DocFormat | "Unknown" {
  const ext = name.split(".").pop()?.toUpperCase() ?? "";
  return (ACCEPTED_FORMATS as string[]).includes(ext) ? ext as DocFormat : "Unknown";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

export function compactNumber(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export const connectionMeta: Record<ConnectionStatus, {label: string;dot: string;chip: string;}> = {
  connected: { label: "Connected", dot: "bg-teal-400", chip: "border-teal-400/30 bg-teal-400/10 text-teal-200" },
  pending: { label: "Pending authorization", dot: "bg-amber-400", chip: "border-amber-400/30 bg-amber-400/10 text-amber-200" },
  failed: { label: "Failed", dot: "bg-rose-400", chip: "border-rose-400/30 bg-rose-400/10 text-rose-200" },
  disconnected: { label: "Disconnected", dot: "bg-slate-500", chip: "border-white/10 bg-white/[0.04] text-slate-300" }
};

export const collectionLabel: Record<CollectionStatus, string> = {
  collecting: "Collecting",
  paused: "Paused",
  not_started: "Not started",
  stopped: "Stopped · error"
};

export const docStatusMeta: Record<DocStatus, {label: string;dot: string;text: string;}> = {
  uploading: { label: "Uploading", dot: "bg-blue-400", text: "text-blue-200" },
  processing: { label: "Processing", dot: "bg-blue-400", text: "text-blue-200" },
  indexed: { label: "Indexed · ready for AI", dot: "bg-teal-400", text: "text-teal-200" },
  awaiting_index: { label: "Stored · awaiting indexing", dot: "bg-amber-400", text: "text-amber-200" },
  failed: { label: "Failed", dot: "bg-rose-400", text: "text-rose-200" }
};

export const accessMeta: Record<AccessLevel, string> = {
  "All staff": "text-slate-300",
  Internal: "text-slate-300",
  Confidential: "text-amber-200",
  Restricted: "text-rose-200"
};

export const categoryLabel: Record<string, string> = {
  all: "All sources",
  documents: "Documents",
  systems: "Systems",
  emails: "Emails",
  chats: "Chats",
  meetings: "Meetings"
};