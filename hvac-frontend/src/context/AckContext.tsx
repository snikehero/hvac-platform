/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

/* ============================
   Types
   ============================ */

export interface AckRecord {
  id: string;
  plantId: string;
  ahuId: string;
  forStatus: "ALARM" | "WARNING";
  acknowledgedAt: string; // ISO string
  acknowledgedBy: string;
}

interface AckContextValue {
  acks: AckRecord[];
  addAck: (
    plantId: string,
    ahuId: string,
    forStatus: "ALARM" | "WARNING",
    operatorName: string,
  ) => void;
  isAcknowledged: (
    plantId: string,
    ahuId: string,
    forStatus: "ALARM" | "WARNING",
  ) => AckRecord | undefined;
  /**
   * Clear ALL acks for an AHU (any forStatus).
   * Called automatically when the machine transitions to OK so the next
   * alarm episode always starts unacknowledged.
   */
  clearAck: (plantId: string, ahuId: string) => void;
  pruneStaleAcks: (
    currentStatuses: Record<string, string>,
  ) => void;
}

/* ============================
   Context
   ============================ */

const AckContext = createContext<AckContextValue | null>(null);

const STORAGE_KEY = "hvac-acks";

function loadAcks(): AckRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AckRecord[];
  } catch {
    return [];
  }
}

function saveAcks(acks: AckRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(acks));
}

/* ============================
   Provider
   ============================ */

export function AckProvider({ children }: { children: ReactNode }) {
  const [acks, setAcks] = useState<AckRecord[]>(loadAcks);

  const addAck = useCallback(
    (
      plantId: string,
      ahuId: string,
      forStatus: "ALARM" | "WARNING",
      operatorName: string,
    ) => {
      const record: AckRecord = {
        id: `${plantId}-${ahuId}-${Date.now()}`,
        plantId,
        ahuId,
        forStatus,
        acknowledgedAt: new Date().toISOString(),
        acknowledgedBy: operatorName || "Operator",
      };
      setAcks((prev) => {
        // Replace any existing ack for the same AHU+status combination
        const filtered = prev.filter(
          (a) => !(a.plantId === plantId && a.ahuId === ahuId && a.forStatus === forStatus),
        );
        const next = [...filtered, record];
        saveAcks(next);
        return next;
      });
    },
    [],
  );

  const isAcknowledged = useCallback(
    (
      plantId: string,
      ahuId: string,
      forStatus: "ALARM" | "WARNING",
    ): AckRecord | undefined => {
      return acks.find(
        (a) =>
          a.plantId === plantId &&
          a.ahuId === ahuId &&
          a.forStatus === forStatus,
      );
    },
    [acks],
  );

  /**
   * Remove ALL acks for a specific AHU (regardless of forStatus).
   * Called when the machine transitions to OK so the next alarm episode
   * starts fresh and must be acknowledged again.
   */
  const clearAck = useCallback((plantId: string, ahuId: string) => {
    setAcks((prev) => {
      const next = prev.filter(
        (a) => !(a.plantId === plantId && a.ahuId === ahuId),
      );
      if (next.length !== prev.length) saveAcks(next);
      return next;
    });
  }, []);

  /**
   * Remove acks where the AHU's current status no longer matches forStatus.
   * currentStatuses: map of "plantId-ahuId" → current status string
   */
  const pruneStaleAcks = useCallback(
    (currentStatuses: Record<string, string>) => {
      setAcks((prev) => {
        const next = prev.filter((a) => {
          const key = `${a.plantId}-${a.ahuId}`;
          const currentStatus = currentStatuses[key];
          return currentStatus === a.forStatus;
        });
        if (next.length !== prev.length) {
          saveAcks(next);
        }
        return next;
      });
    },
    [],
  );

  return (
    <AckContext.Provider value={{ acks, addAck, isAcknowledged, clearAck, pruneStaleAcks }}>
      {children}
    </AckContext.Provider>
  );
}

/* ============================
   Hook
   ============================ */

export function useAcks() {
  const ctx = useContext(AckContext);
  if (!ctx) {
    throw new Error("useAcks must be used within an AckProvider");
  }
  return ctx;
}
