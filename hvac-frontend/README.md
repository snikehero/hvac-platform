# HVAC Platform — Frontend

React 19 + Vite 7 + TypeScript dashboard that receives real-time AHU (Air Handling Unit) telemetry from the backend via Socket.IO and renders live charts, health badges, alarms, and control panels.

---

## How it works

```
Backend (NestJS / Socket.IO)
    │
    │  hvac_snapshot  (on connect — full state)
    │  hvac_update    (on each MQTT tick — single AHU)
    ▼
useWebSocketConnection   ← manages Socket.IO lifecycle, reconnection
    │
    ▼
WebSocketProvider        ← merges telemetry, tracks events, history, connectivity
    │
    ├─ TelemetryContext      ← consumed by all pages/components
    ├─ useTelemetryState     ← in-memory AHU telemetry array
    ├─ useEventManagement    ← alarm/warning events + active counts
    ├─ useHistoryManagement  ← rolling temperature/humidity history per AHU
    └─ useAhuConnectivity    ← detects stale AHUs and fires disconnect events
```

### Provider tree (outermost → innermost)

```
SettingsProvider      ← persists user settings to localStorage (hvac-settings)
  AckProvider         ← persists alarm acknowledgements (hvac-acks)
    WebSocketProvider ← Socket.IO connection + all telemetry state
      ThemeProvider   ← dark / light theme
        <App />
```

### Commands flow (frontend → backend)

```
useCommands()
    │  socket.emit('command:execute', CommandRequest)
    ▼
Backend CommandsGateway → MQTT device
    │
    │  socket.on('command:acknowledged')  ← immediate ACK
    │  socket.on('command:result')        ← SUCCESS / ERROR / TIMEOUT (≤10 s)
    ▼
useCommands() updates status + lastResult
```

---

## Key source locations

```
src/
├── providers/
│   └── WebSocketProvider.tsx      Core: Socket.IO connection + all state composition
├── context/
│   ├── SettingsContext.tsx         User settings (thresholds, language, notifications)
│   └── AckContext.tsx              Alarm acknowledgements
├── hooks/
│   ├── useWebSocketConnection.ts  Socket.IO lifecycle (connect, reconnect, toasts)
│   ├── useTelemetryState.ts       In-memory AHU telemetry array
│   ├── useAhuConnectivity.ts      Stale-AHU detection with configurable timeout
│   ├── useEventManagement.ts      Alarm/warning event log + active counts
│   ├── useHistoryManagement.ts    Rolling history per AHU
│   ├── useCommands.ts             Send commands, track status/result
│   ├── useTelemetry.ts            Consumer hook for TelemetryContext
│   └── useAhuHealth.ts            Derives health status from raw telemetry
├── domain/
│   └── ahu/
│       ├── getAhuHealth.ts        Pure function — core health logic (alarms, warnings)
│       └── constants.ts           Threshold keys, point names
├── types/
│   ├── telemetry.ts               HvacTelemetry, HvacPoint, Quality
│   ├── command.ts                 CommandRequest, CommandResult, CommandStatus
│   └── event.ts                   HvacEvent
├── pages/HVAC/
│   ├── DashboardEjecutivoPage/    Main operator dashboard (drag-and-drop widgets)
│   ├── Alarms/AlarmsPage          Alarm event log
│   └── Settings/SettingsPage      Thresholds, language, notifications
├── i18n/
│   ├── useTranslation.ts          Custom hook — reads language from SettingsContext
│   └── translations/              es.ts (default), en.ts
└── services/
    └── NotificationService.ts     Toast notifications for status changes
```

---

## Socket.IO events

| Direction | Event | Payload |
|---|---|---|
| Server → Client | `hvac_snapshot` | `HvacTelemetry[]` — full state on connect / reconnect |
| Server → Client | `hvac_update` | `HvacTelemetry` — single AHU update |
| Client → Server | `command:execute` | `CommandRequest` |
| Server → Client | `command:acknowledged` | `{ commandId, timestamp }` |
| Server → Client | `command:result` | `CommandResult` (`SUCCESS` / `ERROR` / `TIMEOUT`) |

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_WS_URL` | `http://localhost:3000` | Backend WebSocket / HTTP base URL |

Copy `.env.example` to `.env` and adjust for your environment.

---

## localStorage keys

| Key | Contents |
|---|---|
| `hvac-settings` | User preferences (thresholds, language, notifications, dashboard layout) |
| `hvac-acks` | Alarm acknowledgements per AHU |

---

## User-configurable settings

| Setting | Default | Description |
|---|---|---|
| Temperature warning | 28 °C | Triggers WARNING badge |
| Temperature alarm | 35 °C | Triggers ALARM badge |
| Humidity warning | 70 % | Triggers WARNING badge |
| Humidity alarm | 85 % | Triggers ALARM badge |
| Disconnect timeout | 120 s | AHU marked offline if no update received within this period |
| Refresh interval | 5 s | Connectivity check interval |
| Language | `es` | Dashboard language (Spanish / English) |
| Sound notifications | enabled | Play audio on alarm/warning events |

---

## Running locally

```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Running tests

```bash
# Unit tests (Vitest)
npm test

# Unit tests — watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Cypress E2E — interactive
npm run cy:open

# Cypress E2E — headless
npm run cy:run
```
