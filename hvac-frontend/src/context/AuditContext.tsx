/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from "react";
import { postAuditEntry } from "@/api/historyApi";
import type { CreateAuditEntryParams } from "@/types/history-api";

interface AuditContextValue {
  logAction: (params: CreateAuditEntryParams) => void;
}

const AuditContext = createContext<AuditContextValue | null>(null);

export function AuditProvider({ children }: { children: ReactNode }) {
  const logAction = useCallback((params: CreateAuditEntryParams) => {
    // Fire-and-forget — never block the UI for audit logging
    postAuditEntry(params).catch((err: unknown) => {
      console.warn("[AuditContext] Failed to log action:", err);
    });
  }, []);

  return (
    <AuditContext.Provider value={{ logAction }}>
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const ctx = useContext(AuditContext);
  if (!ctx) {
    throw new Error("useAudit must be used within an AuditProvider");
  }
  return ctx;
}
