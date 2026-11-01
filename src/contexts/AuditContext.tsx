import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { auditSeed } from "../data/auditSeed";
import { currentUser } from "../data/currentUser";
import type { AuditCategory, AuditEntry, DecisionStatus } from "../types/intel";
interface LogInput {
  category: AuditCategory;
  action: string;
  target: string;
  detail?: string;
}
interface AuditContextValue {
  entries: AuditEntry[];
  log: (input: LogInput) => void;
  decisionStatus: Record<string, DecisionStatus>;
  setDecisionStatus: (id: string, status: DecisionStatus) => void;
  attentionStatus: Record<string, string>;
  setAttentionStatus: (id: string, status: string) => void;
}
const AuditContext = createContext<AuditContextValue | null>(null);
export function AuditProvider({
  children


}: {children: React.ReactNode;}) {
  const [entries, setEntries] = useState<AuditEntry[]>(auditSeed);
  const [decisionStatus, setDecisionMap] = useState<Record<string, DecisionStatus>>({});
  const [attentionStatus, setAttentionMap] = useState<Record<string, string>>({});
  const log = useCallback((input: LogInput) => {
    setEntries((prev) => [{
      id: `AUD-${1043 + prev.length - auditSeed.length}`,
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      role: currentUser.role,
      ...input
    }, ...prev]);
  }, []);
  const setDecisionStatus = useCallback((id: string, status: DecisionStatus) => {
    setDecisionMap((prev) => ({
      ...prev,
      [id]: status
    }));
  }, []);
  const setAttentionStatus = useCallback((id: string, status: string) => {
    setAttentionMap((prev) => ({
      ...prev,
      [id]: status
    }));
  }, []);
  const value = useMemo(() => ({
    entries,
    log,
    decisionStatus,
    setDecisionStatus,
    attentionStatus,
    setAttentionStatus
  }), [entries, log, decisionStatus, setDecisionStatus, attentionStatus, setAttentionStatus]);
  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}
export function useAudit(): AuditContextValue {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error("useAudit must be used within AuditProvider");
  return ctx;
}