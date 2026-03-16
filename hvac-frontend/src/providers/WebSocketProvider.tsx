/**
 * Re-exports from TelemetryProvider for backwards compatibility.
 * The actual telemetry logic lives in TelemetryProvider.tsx.
 * Use TelemetryProvider directly in new code.
 */
export { TelemetryContext, TelemetryProvider as WebSocketProvider } from "./TelemetryProvider";
export type { TelemetryContextValue } from "./TelemetryProvider";
