# FireIIOT Platform — Frontend

React 19 + Vite 7 + TypeScript dashboard that receives real-time telemetry from industrial machines via Socket.IO and renders live charts, health indicators, alarms, command panels, executive dashboards, and analytics.

The frontend is built around a **fully generic machine system** — all pages are driven by machine type definitions fetched from the backend. Any machine type (including HVAC) uses the same set of pages.

---

## How it works

```
Backend (NestJS / Socket.IO)
    │
    │  machine_snapshot / machine_update    → Generic machine telemetry
    │  device_event / machine_event         → Health & connectivity events
    │  command:result / command:acknowledged → Command responses
    ▼
useWebSocketConnection    ← manages Socket.IO lifecycle, reconnection, toasts
    │
    ▼
TelemetryProvider         ← composes all real-time state into TelemetryContext
    │
    ├─ useDeviceConnectivity      ← per-instance connectivity tracking (stale detection)
    ├─ useDeviceEventManagement   ← unified device events for all machine types
    └─ useDeviceHistoryManagement ← rolling history for variables marked trackHistory: true
```

### Provider tree (outermost → innermost)

```
BrowserRouter
  GlobalSettingsProvider  ← persists user settings to localStorage
    AckProvider           ← persists alarm acknowledgements per machine instance
      MachineTypeProvider ← fetches machine type definitions from REST API
        TelemetryProvider ← Socket.IO connection + all real-time state
          ThemeProvider   ← dark / light theme
            ErrorBoundary
              <App />
```

> `WebSocketProvider` is a backwards-compatible re-export of `TelemetryProvider`. Use `TelemetryProvider` directly in new code.

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

### Generic Machine System

| Route | Page | Description |
|---|---|---|
| `/machines/:machineType` | `MachineHomePage` | Machine type overview (health, averages, quick actions) |
| `/machines/:machineType/dashboard` | `MachineDashboardPage` | Instance cards with health dots and stat filters |
| `/machines/:machineType/executive` | `ExecutiveDashboardPage` | Executive KPI widgets, heat maps, and activity panels |
| `/machines/:machineType/analytics` | `AnalyticsDashboardPage` | Historical charts and trend analysis per machine type |
| `/machines/:machineType/alarms` | `MachineAlarmsPage` | Per-type alarm list with acknowledge |
| `/machines/:machineType/settings` | `MachineSettingsPage` | Per-type threshold and notification config |
| `/machines/:machineType/plants/:plantId/stations/:stationId` | `MachineDetailPage` | Instance detail with tabs (Overview, Events, Commands) |

### Kiosk

| Route | Page | Description |
|---|---|---|
| `/kiosk/:machineType` | `KioskPage` | Full-screen display mode (no sidebar/header) |

### Machine Designer

| Route | Page | Description |
|---|---|---|
| `/machine-designer` | `MachineDesignerListPage` | List and manage machine type definitions |
| `/machine-designer/create` | `MachineDesignerFormPage` | Create new machine type |
| `/machine-designer/:id/edit` | `MachineDesignerFormPage` | Edit existing machine type |

### Legacy redirects

All `/hvac/*` routes redirect to their `/machines/hvac/*` equivalents.

---

## Source structure

```
src/
├── main.tsx                         App entry point, route definitions, lazy page imports
├── Providers.tsx                    Provider tree composition (extracted for HMR stability)
├── providers/
│   ├── TelemetryProvider.tsx        Core: Socket.IO connection + all real-time state composition
│   └── WebSocketProvider.tsx        Re-export of TelemetryProvider (backwards compatibility)
├── context/
│   ├── GlobalSettingsContext.tsx    User settings (disconnect timeout, refresh interval, language)
│   ├── AckContext.tsx               Alarm acknowledgements per machine instance
│   └── MachineTypeContext.tsx       Machine type definitions from REST API
├── hooks/
│   ├── useWebSocketConnection.ts   Socket.IO lifecycle (connect, reconnect, toasts)
│   ├── useWebSocket.ts             Consumer hook for TelemetryContext
│   ├── useDeviceConnectivity.ts    Generic machine connectivity tracking (stale detection)
│   ├── useDeviceEventManagement.ts Unified device events for all machine types
│   ├── useDeviceHistoryManagement.ts Rolling history for tracked generic variables
│   ├── useDeviceHealth.ts          Generic device health evaluation (uses cardConfig thresholds)
│   ├── useMachineTelemetry.ts      Consumer hook for generic machine telemetry + history
│   ├── useCommands.ts              Send commands, track status/result via Socket.IO
│   └── useMachineSettings.ts       Per-machine-type settings stored in localStorage
├── domain/
│   └── device/
│       └── getDeviceHealth.ts      Pure function — generic device health evaluation
├── components/
│   ├── Graphs/
│   │   └── DeviceHistoryChart.tsx  Reusable history chart for any variable
│   ├── MetricCards/                Pluggable metric card system (temperature, gauge, fan, etc.)
│   ├── GenericCommandsPanel/       Dynamic command panel (toggle/range/select from definitions)
│   ├── DeviceEventTimeline/        Unified event timeline component
│   ├── AlarmTimeline.tsx           Alarm list with acknowledge controls
│   ├── Breadcrumbs.tsx             Contextual navigation breadcrumbs
│   ├── ConnectionIndicator.tsx     Visual connection status badge
│   ├── ErrorBoundary.tsx           React error boundary wrapper
│   ├── InstanceDrawer.tsx          Slide-over drawer for instance details
│   ├── skeletons/                  Loading skeleton components
│   ├── layouts/
│   │   ├── AppLayoutWrapper.tsx    Layout outlet wrapper
│   │   ├── AppSidebar.tsx          Dynamic sidebar with per-type nav + alarm badges
│   │   └── AppHeader.tsx           Top header bar
│   └── ui/                         Radix UI primitives (button, card, tabs, dialog, etc.)
├── pages/
│   ├── HomeGlobal/                 Platform overview
│   ├── Alarms/                     Unified alarms page
│   ├── Kiosk/
│   │   └── KioskPage.tsx           Full-screen kiosk display (no chrome)
│   ├── Machine/
│   │   ├── MachineHomePage.tsx      Machine type home page
│   │   ├── MachineDashboardPage.tsx Instance dashboard with health dots + filters
│   │   ├── MachineDetailPage.tsx    Instance detail with tabs (Overview, Events, Commands)
│   │   ├── MachineAlarmsPage.tsx    Per-type alarm list
│   │   ├── MachineSettingsPage.tsx  Per-type settings (thresholds, notifications)
│   │   ├── Executive/
│   │   │   └── ExecutiveDashboardPage.tsx  KPI widgets, heat maps, activity panels
│   │   ├── Analytics/
│   │   │   └── AnalyticsDashboardPage.tsx  Historical trend charts
│   │   └── components/
│   │       ├── InstanceCardCompact.tsx     Compact card for dashboard grids
│   │       └── InstanceCardExpanded.tsx    Expanded instance card
│   └── MachineDesigner/
│       ├── MachineDesignerListPage.tsx     Machine type list
│       └── MachineDesignerFormPage.tsx     Machine type editor (variables, commands, drag-and-drop)
├── services/
│   ├── MachineDesignerApi.ts       REST API client for machine type CRUD
│   └── NotificationService.ts      Toast notifications for status changes
├── types/
│   ├── machine-type.ts             MachineType, MachineVariable, MachineCommand, MachineTelemetry
│   ├── command.ts                  CommandRequest, CommandResult, CommandStatus
│   ├── device-event.ts             DeviceEvent (unified event type)
│   ├── machine-event.ts            MachineEvent (connectivity events)
│   └── history.ts                  HistoryPoint
├── router/
│   └── routes.ts                   Route path definitions and helper functions
├── i18n/
│   ├── useTranslation.ts           Translation hook (reads language from GlobalSettingsContext)
│   └── translations/               es.ts (default), en.ts
└── test/
    ├── unit/                       Unit tests (health logic, hooks, status constants)
    └── integration/                Component integration tests
```

---

## Socket.IO events

| Direction | Event | Payload |
|---|---|---|
| Server → Client | `machine_snapshot` | `Record<string, MachineTelemetry[]>` — all machine state on connect |
| Server → Client | `machine_update` | `MachineTelemetry` — single machine instance update |
| Server → Client | `machine_event` | `MachineEvent` — connectivity events (DISCONNECTED/RECONNECTED) |
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
| `hvac-settings` | Global user preferences (disconnect timeout, refresh interval, language) |
| `hvac-acks` | Alarm acknowledgements per machine instance |
| `machine-settings-<slug>` | Per-machine-type settings (thresholds, notification config) |
| `vite-ui-theme` | Theme preference (light / dark) |

---

## User-configurable settings

### Global (Settings)

| Setting | Default | Description |
|---|---|---|
| Disconnect timeout | 120 s | Device marked offline after this period of silence |
| Refresh interval | 5 s | Connectivity check interval |
| Language | `es` | Dashboard language (Spanish / English) |

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
