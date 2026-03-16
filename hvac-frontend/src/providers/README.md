# Providers

React context providers for the FireIIOT platform.

## Provider Tree

```
<Providers>                    ← src/Providers.tsx — full provider tree for HMR optimization
  <BrowserRouter>
    <GlobalSettingsProvider>   ← language, operatorName, disconnect timeout settings
      <AckProvider>            ← alarm acknowledgment state (persisted to localStorage)
        <MachineTypeProvider>  ← machine type definitions from the backend REST API
          <TelemetryProvider>  ← WebSocket connection + all real-time telemetry state
            <ThemeProvider>    ← light/dark theme
              <App />
            </ThemeProvider>
          </TelemetryProvider>
        </MachineTypeProvider>
      </AckProvider>
    </GlobalSettingsProvider>
  </BrowserRouter>
</Providers>
```

## Data Flow

```
MQTT → Backend → Socket.IO → TelemetryProvider → TelemetryContext
                                     ↓
                          useMachineTelemetry(slug)
                                     ↓
                             Page Components
```

## TelemetryProvider (`TelemetryProvider.tsx`)

The central real-time state manager. Listens to three Socket.IO events:

| Event | Handler | Effect |
|-------|---------|--------|
| `machine_snapshot` | `handleMachineSnapshot` | Replaces full telemetry state + initializes history |
| `machine_update` | `handleMachineUpdate` | Updates a single instance in state + appends to history |
| `device_event` | `handleDeviceEvent` | Appends to event log + clears acks on OK recovery |

Exposes everything via `TelemetryContext` (consumed by `useMachineTelemetry`).

## WebSocketProvider (`WebSocketProvider.tsx`)

Re-exports `TelemetryProvider` as `WebSocketProvider` for backwards compatibility.
**Use `TelemetryProvider` directly in new code.**
