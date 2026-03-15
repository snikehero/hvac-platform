# FireIIOT Platform — Frontend

React 19 + Vite 7 + TypeScript dashboard that receives real-time telemetry from industrial machines via Socket.IO and renders live charts, health indicators, alarms, and command panels.

The frontend supports two parallel systems:

1. **HVAC module** — Specialized pages for Air Handling Unit monitoring (3D views, executive dashboard)
2. **Generic machine system** — Dynamic pages auto-generated from machine type definitions (Home, Dashboard, Detail with tabs, Alarms, Settings)

---

## How it works

```
Backend (NestJS / Socket.IO)
    │
    │  hvac_snapshot / hvac_update          → HVAC telemetry
    │  machine_snapshot / machine_update    → Generic machine telemetry
    │  device_event / machine_event         → Unified health & connectivity events
    │  command:result / command:acknowledged → Command responses
    ▼
useWebSocketConnection    ← manages Socket.IO lifecycle, reconnection, toasts
    │
    ▼
WebSocketProvider         ← composes all real-time state into TelemetryContext
    │
    ├─ useTelemetryState          ← in-memory HVAC telemetry array
    ├─ useEventManagement         ← HVAC alarm/warning events + active counts
    ├─ useHistoryManagement       ← rolling HVAC temperature/humidity history
    ├─ useAhuConnectivity         ← detects stale AHUs, fires disconnect events
    ├─ useDeviceConnectivity      ← generic machine connectivity tracking
    ├─ useDeviceEventManagement   ← unified device events for ALL machine types
    └─ useDeviceHistoryManagement ← rolling history for tracked generic variables
```

### Provider tree (outermost → innermost)

```
SettingsProvider        ← persists user settings to localStorage
  AckProvider           ← persists alarm acknowledgements per machine
    MachineTypeProvider ← fetches machine type definitions from REST API
      WebSocketProvider ← Socket.IO connection + all real-time state
        ThemeProvider   ← dark / light theme
          <App />
```

### Commands flow (frontend → backend)

```
useCommands()
    │  socket.emit('command:execute', { machineType, plantId, stationId, command, value })
    ▼
Backend CommandsGateway → MQTT device
    │
    │  socket.on('command:acknowledged')  ← immediate ACK
    │  socket.on('command:result')        ← SUCCESS / ERROR / TIMEOUT (≤10 s)
    ▼
useCommands() updates status + lastResult
```

---

## Pages & Routes

### Platform-wide

| Route | Page | Description |
|---|---|---|
| `/` | `HomeGlobal` | Platform overview with cross-type health summary |
| `/alarms` | `UnifiedAlarmsPage` | Aggregated alarms from all machine types |

### HVAC Module

| Route | Page | Description |
|---|---|---|
| `/hvac` | `HomepageHVAC` | HVAC system overview and health metrics |
| `/hvac/dashboard` | `DashboardHVAC` | Live AHU cards with health dots and filters |
| `/hvac/ejecutivo` | `DashboardEjecutivoPage` | Executive dashboard with drag-and-drop widgets |
| `/hvac/alarms` | `AlarmsPage` | HVAC-specific alarm log |
| `/hvac/settings` | `SettingsPage` | HVAC thresholds, notifications, language |
| `/hvac/plants/:plantId/ahus/:ahuId` | `AhuDetailPage` | AHU detail with tabs (Overview, Events, Commands) |
| `/hvac/plants/:plantId/ahus/:ahuId/detail` | `AhuDetailView` | 3D AHU visualization |

### Generic Machine System

| Route | Page | Description |
|---|---|---|
| `/machines/:type` | `MachineHomePage` | Machine type overview (health, averages, quick actions) |
| `/machines/:type/dashboard` | `MachineDashboardPage` | Instance cards with health dots, stat filters |
| `/machines/:type/alarms` | `MachineAlarmsPage` | Per-type alarm list with acknowledge |
| `/machines/:type/settings` | `MachineSettingsPage` | Per-type threshold and notification config |
| `/machines/:type/plants/:plantId/stations/:stationId` | `MachineDetailPage` | Instance detail with tabs (Overview, Events, Commands) |

### Machine Designer

| Route | Page | Description |
|---|---|---|
| `/machine-designer` | `MachineDesignerListPage` | List and manage machine type definitions |
| `/machine-designer/create` | `MachineDesignerFormPage` | Create new machine type |
| `/machine-designer/:id/edit` | `MachineDesignerFormPage` | Edit existing machine type |

---

## Source structure

```
src/
├── main.tsx                         App entry point and route definitions
├── providers/
│   └── WebSocketProvider.tsx        Core: Socket.IO connection + all state composition
├── context/
│   ├── SettingsContext.tsx           User settings (thresholds, language, notifications)
│   ├── AckContext.tsx                Alarm acknowledgements per machine instance
│   └── MachineTypeContext.tsx        Machine type definitions from REST API
├── hooks/
│   ├── useWebSocketConnection.ts    Socket.IO lifecycle (connect, reconnect, toasts)
│   ├── useTelemetryState.ts         In-memory HVAC telemetry array
│   ├── useAhuConnectivity.ts        Stale-AHU detection with configurable timeout
│   ├── useDeviceConnectivity.ts     Generic machine connectivity tracking
│   ├── useEventManagement.ts        HVAC alarm/warning event log + active counts
│   ├── useDeviceEventManagement.ts  Unified device events for all machine types
│   ├── useHistoryManagement.ts      Rolling HVAC temperature/humidity history
│   ├── useDeviceHistoryManagement.ts Rolling history for generic machine variables
│   ├── useCommands.ts               Send commands, track status/result via Socket.IO
│   ├── useTelemetry.ts              Consumer hook for TelemetryContext (HVAC)
│   ├── useMachineTelemetry.ts       Consumer hook for generic machine telemetry + history
│   ├── useAhuHealth.ts              HVAC health evaluation (uses SettingsContext thresholds)
│   ├── useDeviceHealth.ts           Generic device health evaluation (uses cardConfig thresholds)
│   └── useMachineSettings.ts        Per-machine-type settings stored in localStorage
├── domain/
│   ├── ahu/
│   │   ├── getAhuHealth.ts          Pure function — HVAC health logic
│   │   └── constants.ts             Threshold keys, point names
│   └── device/
│       └── getDeviceHealth.ts       Pure function — generic device health evaluation
├── components/
│   ├── Graphs/
│   │   ├── AhuHistoryTemperatureCard.tsx   HVAC temperature chart
│   │   ├── AhuHistoryHumidityChart.tsx     HVAC humidity chart
│   │   └── DeviceHistoryChart.tsx          Generic reusable chart for any variable
│   ├── MetricCards/                        Pluggable metric card system (temperature, gauge, fan, etc.)
│   ├── CommandsPanel/                      HVAC command panel (fan ON/OFF, damper slider)
│   ├── GenericCommandsPanel/               Dynamic command panel (toggle/range/select from definitions)
│   ├── DeviceEventTimeline/                Unified event timeline component
│   ├── TelemetryCard/                      HVAC dashboard card with live metrics
│   ├── layouts/
│   │   ├── AppLayout.tsx                   Main layout with sidebar
│   │   ├── AppSidebar.tsx                  Dynamic sidebar with per-type nav + alarm badges
│   │   └── AppHeader.tsx                   Top header bar
│   └── ui/                                 Radix UI primitives (button, card, tabs, dialog, etc.)
├── pages/
│   ├── HomeGlobal/                         Platform overview
│   ├── Alarms/                             Unified alarms page
│   ├── HVAC/
│   │   ├── HomePage/                       HVAC home
│   │   ├── DashboardHVAC/                  HVAC live dashboard
│   │   ├── DashboardEjecutivoPage/         Executive dashboard + 3D detail view
│   │   ├── AhuDetailPage/                  AHU detail with tabs
│   │   ├── Alarms/                         HVAC alarms
│   │   └── Settings/                       HVAC settings
│   ├── Machine/
│   │   ├── MachineHomePage.tsx              Generic machine type home page
│   │   ├── MachineDashboardPage.tsx         Instance dashboard with health dots + filters
│   │   ├── MachineDetailPage.tsx            Instance detail with tabs (Overview, Events, Commands)
│   │   ├── MachineAlarmsPage.tsx            Per-type alarm list
│   │   └── MachineSettingsPage.tsx          Per-type settings (thresholds, notifications)
│   └── MachineDesigner/
│       ├── MachineDesignerListPage.tsx      Machine type list
│       └── MachineDesignerFormPage.tsx      Machine type editor (variables, commands, drag-and-drop)
├── services/
│   ├── MachineDesignerApi.ts               REST API client for machine type CRUD
│   └── NotificationService.ts              Toast notifications for status changes
├── types/
│   ├── telemetry.ts                        HvacTelemetry, HvacPoint, Quality
│   ├── machine-type.ts                     MachineType, MachineVariable, MachineCommand
│   ├── command.ts                          CommandRequest, CommandResult, CommandStatus
│   ├── device-event.ts                     DeviceEvent (unified event type)
│   ├── machine-event.ts                    MachineEvent (connectivity events)
│   ├── event.ts                            HvacEvent
│   └── history.ts                          HistoryPoint
├── router/
│   └── routes.ts                           Route path definitions and helper functions
├── i18n/
│   ├── useTranslation.ts                   Translation hook (reads language from SettingsContext)
│   └── translations/                       es.ts (default), en.ts
└── test/
    ├── unit/                               Unit tests (health logic, contexts)
    └── integration/                        Component integration tests
```

---

## Socket.IO events

| Direction | Event | Payload |
|---|---|---|
| Server → Client | `hvac_snapshot` | `HvacTelemetry[]` — full HVAC state on connect |
| Server → Client | `hvac_update` | `HvacTelemetry` — single AHU update |
| Server → Client | `machine_snapshot` | `Record<string, MachineTelemetry[]>` — all generic machine state |
| Server → Client | `machine_update` | `MachineTelemetry` — single generic machine update |
| Server → Client | `machine_event` | `MachineEvent` — connectivity events |
| Server → Client | `device_event` | `DeviceEvent` — unified health events (OK/WARNING/ALARM/DISCONNECTED/RECONNECTED) |
| Client → Server | `command:execute` | `CommandRequest` — send command to device |
| Server → Client | `command:acknowledged` | `{ commandId, timestamp }` — immediate ACK |
| Server → Client | `command:result` | `CommandResult` — SUCCESS / ERROR / TIMEOUT |

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
| `hvac-acks` | Alarm acknowledgements per machine instance |
| `machine-settings-<slug>` | Per-machine-type settings (thresholds, notification config) |
| `vite-ui-theme` | Theme preference (light / dark) |

---

## User-configurable settings

### Global (HVAC Settings)

| Setting | Default | Description |
|---|---|---|
| Temperature warning | 28 °C | Triggers WARNING badge |
| Temperature alarm | 35 °C | Triggers ALARM badge |
| Humidity warning | 70 % | Triggers WARNING badge |
| Humidity alarm | 85 % | Triggers ALARM badge |
| Disconnect timeout | 120 s | Device marked offline after this period |
| Refresh interval | 5 s | Connectivity check interval |
| Language | `es` | Dashboard language (Spanish / English) |
| Sound notifications | enabled | Play audio on alarm/warning events |

### Per-machine-type (Machine Settings)

Thresholds are auto-derived from the machine type's variable `cardConfig` (warning/alarm fields) and can be customized per type through the Settings page.

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
