/* eslint-disable react-hooks/refs */
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";

const WS_URL = import.meta.env.VITE_WS_URL ?? "http://localhost:3000";

interface UseWebSocketConnectionReturn {
  socket: Socket | null;
  connected: boolean;
}

/**
 * Hook responsible for managing WebSocket connection lifecycle
 */
export function useWebSocketConnection(): UseWebSocketConnectionReturn {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket: Socket = io(WS_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      toast.success("Conectado al servidor", { duration: 2000 });
    });

    socket.on("disconnect", (reason) => {
      setConnected(false);
      toast.error("Desconectado del servidor", {
        description: `Razón: ${reason}. Reconectando...`,
        duration: 5000,
      });
    });

    socket.on("connect_error", (error) => {
      // Only log detailed errors in development
      if (import.meta.env.DEV) {
        console.warn(
          `[WebSocket] No se pudo conectar al servidor (${WS_URL}):`,
          error.message,
        );
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return {
    socket: socketRef.current,
    connected,
  };
}
