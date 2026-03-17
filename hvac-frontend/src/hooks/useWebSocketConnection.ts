/* eslint-disable react-hooks/refs */
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/useTranslation";

const getWsUrl = (): string => {
  const envUrl = import.meta.env.VITE_WS_URL;

  // Si está definida en .env, usarla
  if (envUrl && envUrl.trim()) {
    return envUrl;
  }

  // Si no, usar la URL actual del navegador
  const protocol = window.location.protocol; // http: o https:
  const hostname = window.location.hostname; // IP o localhost
  const wsPort = import.meta.env.VITE_WS_PORT ?? "3000";

  return `${protocol}//${hostname}:${wsPort}`;
};

const WS_URL = getWsUrl();

interface UseWebSocketConnectionReturn {
  socket: Socket | null;
  connected: boolean;
}

/**
 * Hook responsible for managing WebSocket connection lifecycle
 */
export function useWebSocketConnection(): UseWebSocketConnectionReturn {
  const { t, tf } = useTranslation();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const tRef = useRef(t);
  const tfRef = useRef(tf);
  tRef.current = t;
  tfRef.current = tf;

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
      toast.success(tRef.current.websocket.connected, { duration: 2000 });
    });

    socket.on("disconnect", (reason) => {
      setConnected(false);
      toast.error(tRef.current.websocket.disconnected, {
        description: tfRef.current(tRef.current.websocket.disconnectReason, { reason }),
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
