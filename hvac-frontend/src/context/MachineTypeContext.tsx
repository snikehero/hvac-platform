import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { MachineType } from "@/types/machine-type";
import { MachineDesignerApi } from "@/services/MachineDesignerApi";

interface MachineTypeContextValue {
  machineTypes: MachineType[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const MachineTypeContext = createContext<MachineTypeContextValue | null>(null);

export function MachineTypeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MachineDesignerApi.getAll();
      setMachineTypes(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const value = useMemo<MachineTypeContextValue>(
    () => ({ machineTypes, loading, error, refetch }),
    [machineTypes, loading, error, refetch],
  );

  return (
    <MachineTypeContext.Provider value={value}>
      {children}
    </MachineTypeContext.Provider>
  );
}

export function useMachineTypes(): MachineTypeContextValue {
  const ctx = useContext(MachineTypeContext);
  if (!ctx) {
    throw new Error("useMachineTypes must be used within MachineTypeProvider");
  }
  return ctx;
}
