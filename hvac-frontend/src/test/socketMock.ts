import { vi } from "vitest";
import type { Socket } from "socket.io-client";

/**
 * Creates a mock Socket.IO socket.
 * The `triggerEvent` helper lets tests simulate incoming socket events.
 */
export function createMockSocket() {
  const listeners: Map<string, ((...args: unknown[]) => void)[]> = new Map();

  const mockSocket = {
    on: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event)!.push(callback);
    }),
    off: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
      const cbs = listeners.get(event) ?? [];
      listeners.set(
        event,
        cbs.filter((cb) => cb !== callback),
      );
    }),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
  } as unknown as Socket;

  /** Simulate an incoming event from the server */
  function triggerEvent(event: string, ...args: unknown[]) {
    (listeners.get(event) ?? []).forEach((cb) => cb(...args));
  }

  return { mockSocket, triggerEvent };
}
