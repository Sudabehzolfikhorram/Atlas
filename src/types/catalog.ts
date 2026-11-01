export type SourceCategory = "documents" | "systems" | "emails" | "chats" | "meetings";
export type CatalogView = "all" | SourceCategory;

export type ConnectionStatus = "connected" | "disconnected" | "pending" | "failed";
export type CollectionStatus = "collecting" | "paused" | "not_started" | "stopped";
export type PermissionLevel = "Read-only" | "Metadata only" | "No access";
export type AccessLevel = "All staff" | "Internal" | "Confidential" | "Restricted";

export interface CatalogSource {
  id: string;
  name: string;
  /** Product / platform identity, e.g. "Microsoft Exchange Online". */
  identity: string;
  category: SourceCategory;
  department: string;
  owner: string;
  status: ConnectionStatus;
  statusNote: string;
  permission: PermissionLevel;
  access: AccessLevel;
  /** What the platform is authorised to read. */
  scope: string[];
  /** What stays outside the authorised scope. */
  excluded: string[];
  collection: CollectionStatus;
  lastSync: string | null;
  records: number | null;
  recordUnit: string;
  authorizedBy: string | null;
  /** When true the current user cannot see scope details. */
  restricted?: boolean;
}

export type DocStatus = "uploading" | "processing" | "indexed" | "awaiting_index" | "failed";
export type DocFormat = "PDF" | "DOCX" | "XLSX" | "CSV" | "TXT" | "PPTX";

export interface CatalogDocument {
  id: string;
  name: string;
  format: DocFormat | "Unknown";
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  department: string;
  status: DocStatus;
  progress: number;
  access: AccessLevel;
  updatedAt: string;
  error?: string;
  /** Session-only file content; sample records have none. */
  file?: File;
  sample: boolean;
}