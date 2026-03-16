import { useState, useEffect, useCallback, useContext } from "react";
import { TelemetryContext } from "@/providers/WebSocketProvider";
import type { CommandRequest, CommandResult, CommandStatus } from "@/types/command";

interface UseCommandsReturn {
  sendCommand: (req: CommandRequest) => void;
  status: CommandStatus;
  lastResult: CommandResult | null;
  reset: () => void;
}

export function useCommands(): UseCommandsReturn {
  const ctx = useContext(TelemetryContext);
  const socket = ctx?.socket ?? null;
  const [status, setStatus] = useState<CommandStatus>("idle");
  const [lastResult, setLastResult] = useState<CommandResult | null>(null);

  useEffect(() => {
    if (!socket) return;

    const onResult = (data: CommandResult) => {
      setLastResult(data);
      if (data.status === "SUCCESS") setStatus("success");
      else if (data.status === "TIMEOUT") setStatus("timeout");
      else setStatus("error");
    };

    socket.on("command:result", onResult);
    return () => {
      socket.off("command:result", onResult);
    };
  }, [socket]);

  const sendCommand = useCallback(
    (req: CommandRequest) => {
      if (!socket || status === "pending") return;
      setStatus("pending");
      setLastResult(null);
      socket.emit("command:execute", req);
    },
    [socket, status],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setLastResult(null);
  }, []);

  return { sendCommand, status, lastResult, reset };
}
