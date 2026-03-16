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
  instanceId: string;
  machineType: string;
  forStatus: "ALARM" | "WARNING";
  acknowledgedAt: string; // ISO string
  acknowledgedBy: string;
}

interface AckContextValue {
  acks: AckRecord[];
  addAck: (
    plantId: string,
    instanceId: string,
    forStatus: "ALARM" | "WARNING",
    operatorName: string,
    machineType?: string,
  ) => void;
  isAcknowledged: (
    plantId: string,
    instanceId: string,
    forStatus: "ALARM" | "WARNING",
    machineType?: string,
  ) => AckRecord | undefined;
  /**
   * Clear ALL acks for a specific device (any forStatus).
   * Called automatically when the machine transitions to OK so the next
   * alarm episode always starts unacknowledged.
   */
  clearAck: (plantId: string, instanceId: string, machineType?: string) => void;
  pruneStaleAcks: (
    currentStatuses: Record<string, string>,
  ) => void;
}

/* ============================
   Context
   ============================ */

const AckContext = createContext<AckContextValue | null>(null);

const STORAGE_KEY = "device-acks";
const LEGACY_STORAGE_KEY = "hvac-acks";

interface LegacyAckRecord {
  id: string;
  plantId: string;
  ahuId: string;
  forStatus: "ALARM" | "WARNING";
  acknowledgedAt: string;
  acknowledgedBy: string;
}

function migrateFromLegacy(): AckRecord[] {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const legacy = JSON.parse(raw) as LegacyAckRecord[];
    const migrated: AckRecord[] = legacy.map((a) => ({
      id: a.id,
      plantId: a.plantId,
      instanceId: a.ahuId,
      machineType: "hvac",
      forStatus: a.forStatus,
      acknowledgedAt: a.acknowledgedAt,
      acknowledgedBy: a.acknowledgedBy,
    }));
    // Save to new key and remove legacy
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return migrated;
  } catch {
    return [];
  }
}

function loadAcks(): AckRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AckRecord[];
    // Try legacy migration
    return migrateFromLegacy();
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
      instanceId: string,
      forStatus: "ALARM" | "WARNING",
      operatorName: string,
      machineType: string = "hvac",
    ) => {
      const record: AckRecord = {
        id: `${machineType}-${plantId}-${instanceId}-${Date.now()}`,
        plantId,
        instanceId,
        machineType,
        forStatus,
        acknowledgedAt: new Date().toISOString(),
        acknowledgedBy: operatorName || "Operator",
      };
      setAcks((prev) => {
        // Replace any existing ack for the same device+status combination
        const filtered = prev.filter(
          (a) =>
            !(
              a.plantId === plantId &&
              a.instanceId === instanceId &&
              a.machineType === machineType &&
              a.forStatus === forStatus
            ),
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
      instanceId: string,
      forStatus: "ALARM" | "WARNING",
      machineType: string = "hvac",
    ): AckRecord | undefined => {
      return acks.find(
        (a) =>
          a.plantId === plantId &&
          a.instanceId === instanceId &&
          a.machineType === machineType &&
          a.forStatus === forStatus,
      );
    },
    [acks],
  );

  /**
   * Remove ALL acks for a specific device (regardless of forStatus).
   * Called when the machine transitions to OK so the next alarm episode
   * starts fresh and must be acknowledged again.
   */
  const clearAck = useCallback(
    (plantId: string, instanceId: string, machineType: string = "hvac") => {
      setAcks((prev) => {
        const next = prev.filter(
          (a) =>
            !(
              a.plantId === plantId &&
              a.instanceId === instanceId &&
              a.machineType === machineType
            ),
        );
        if (next.length !== prev.length) saveAcks(next);
        return next;
      });
    },
    [],
  );

  /**
   * Remove acks where the device's current status no longer matches forStatus.
   * currentStatuses: map of "machineType-plantId-instanceId" → current status string
   */
  const pruneStaleAcks = useCallback(
    (currentStatuses: Record<string, string>) => {
      setAcks((prev) => {
        const next = prev.filter((a) => {
          const key = `${a.machineType}-${a.plantId}-${a.instanceId}`;
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
    <AckContext.Provider
      value={{ acks, addAck, isAcknowledged, clearAck, pruneStaleAcks }}
    >
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
