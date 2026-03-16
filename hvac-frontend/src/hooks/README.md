# Hooks

Custom React hooks for the FireIIOT platform.

## Real-time Data

### `useMachineTelemetry(machineType?)`
Access machine telemetry data from the WebSocket context.
- If `machineType` is provided, returns only instances of that type.
- Otherwise returns all machine telemetry via `allMachineTelemetry`.
- Returns: `{ instances, allMachineTelemetry, connected, isMachineConnected, deviceEvents, deviceActiveCounts, totalAlarms, totalWarnings, machineHistory, getInstanceHistory }`

### `useDeviceHealth(machineTypeSlug)`
Returns a `getHealth(points, isConnected)` function that evaluates a device's health status based on its current telemetry points and threshold configuration.
- Status priority: `DISCONNECTED → ALARM → WARNING → OK`

### `useDeviceConnectivity(connected, onDisconnect?, disconnectTimeoutMs?, checkIntervalMs?)`
Tracks per-device connection status using a heartbeat timer.
- Returns: `{ connectionStatus, isConnected(key), isMachineConnected(key), updateLastSeen(key), setConnectionStatus, markAllAsDisconnected }`

## History

### `useDeviceHistoryManagement()`
Manages in-memory rolling history for tracked variables (up to 30 points per variable, 500 instances total via LRU eviction).
- Returns: `{ history, updateHistory, initializeFromSnapshot, getInstanceHistory }`

## Events

### `useDeviceEventManagement()`
Manages the list of device events (alarms, warnings, disconnections, etc.) with active counts per machine type.
- Returns: `{ allEvents, activeCounts, totalAlarms, totalWarnings, addEvent }`

## WebSocket

### `useWebSocketConnection()`
Establishes and manages the Socket.IO connection lifecycle.
- Auto-reconnects with exponential backoff.
- Returns: `{ socket, connected }`
