# FireIIOT Platform — Backend

NestJS 11 backend that ingests real-time telemetry from industrial machines via MQTT, manages machine type definitions in SQLite, and pushes live updates to connected frontend clients via Socket.IO.

---

## How it works

The backend serves two parallel pipelines:

1. **HVAC pipeline** — Specialized processing for Air Handling Units with hardcoded variable semantics
2. **Generic machine pipeline** — Dynamic processing for any machine type defined in the Machine Designer

Both pipelines converge at the **Commands** module (unified command dispatch) and the **unified device event** system.

### Data flow — telemetry (MQTT → WebSocket)

```
MQTT Broker
    │
    │  hvac/#           → HvacService (specialized)
    │  <machineType>/#  → MachineService (generic)
    ▼
MqttService              ← subscribes on startup, routes by topic pattern
    │
    ├──► HvacService     ← merges into in-memory AHU state Map
    │       │
    │       ▼
    │    HvacGateway      ← broadcasts hvac_update / hvac_snapshot
    │
    └──► MachineService  ← merges into per-type in-memory state Maps
            │
            ▼
         MachineGateway   ← broadcasts machine_update / machine_snapshot / device_event
```

**HVAC flow:**

1. `MqttService` subscribes to `hvac/#` and forwards parsed JSON to `HvacService.handleTelemetry()`.
2. `HvacService` maintains an in-memory `Map<string, InternalAhuState>` keyed by `plantId-stationId`.
3. `HvacGateway` emits `hvac_update` per tick and sends `hvac_snapshot` on client connect.

**Generic machine flow:**

1. `MqttService` subscribes to topics from all registered machine types (e.g., `motor/#`).
2. `MachineService` maintains per-type in-memory state maps and evaluates device health.
3. `MachineGateway` emits `machine_update`, `machine_snapshot`, `device_event`, and `machine_event`.

### Data flow — commands (WebSocket → MQTT)

```
Frontend client
    │  command:execute  { machineType, plantId, stationId, command, value }
    ▼
CommandsGateway
    │
    ▼
CommandsService
    │  ├── machineType === 'hvac' → topic: hvac/<plantId>/<stationId>/commands/set
    │  └── machineType === other  → looks up MachineType.mqttTopic from DB
    │                                topic: <base>/<plantId>/<stationId>/commands/set
    ▼
MQTT Broker ──► Physical device / simulator
    │
    │  <base>/.../commands/response
    ▼
MqttService ──► CommandsService.handleResponse()
    │
    │  command:result  (SUCCESS / ERROR / TIMEOUT)
    ▼
Frontend client
```

Commands time out after **10 seconds** if no device response arrives.

### Data flow — machine definitions (REST ↔ SQLite)

```
Frontend (Machine Designer UI)
    │
    │  REST API calls
    ▼
MachineDesignerController  (/api/machine-types)
    │
    ▼
MachineDesignerService
    │
    ▼
TypeORM ──► SQLite database (./data/database.sqlite)
    │
    ├── machine_types       (name, slug, mqttTopic, description, icon)
    ├── machine_variables   (key, label, dataType, unit, cardType, color, cardConfig)
    └── machine_commands    (key, label, commandType, config, displayOrder)
```

---

## Module structure

```
src/
├── app.module.ts              Root module — wires all modules + TypeORM + ConfigModule
├── main.ts                    Bootstrap: reads PORT from env, starts HTTP + Socket.IO
│
├── hvac/                      HVAC-specific telemetry module
│   ├── hvac.module.ts         Provides HvacService + HvacGateway + HvacController
│   ├── hvac.service.ts        In-memory AHU state store; merges telemetry, serves snapshots
│   ├── hvac.gateway.ts        WebSocket gateway: hvac_update / hvac_snapshot
│   ├── hvac.controller.ts     REST GET /hvac/snapshot
│   ├── dto/
│   │   └── telemetry.dto.ts   TelemetryDto + HvacPointDto
│   ├── internal/
│   │   └── ahu-state.ts       InternalAhuState (rich internal representation)
│   └── mappers/
│       └── telemetry.mapper.ts
│
├── machine/                   Generic machine telemetry module
│   ├── machine.module.ts      Provides MachineService + MachineGateway + MachineController
│   ├── machine.service.ts     Per-type in-memory state maps, health evaluation, event emission
│   ├── machine.gateway.ts     WebSocket gateway: machine_update / machine_snapshot / device_event
│   ├── machine.controller.ts  REST GET /machines/snapshot, /machines/:type/snapshot
│   └── dto/
│       └── generic-telemetry.dto.ts
│
├── machine-designer/          Machine type CRUD module (TypeORM + SQLite)
│   ├── machine-designer.module.ts
│   ├── machine-designer.service.ts   CRUD operations for machine types with variables & commands
│   ├── machine-designer.controller.ts  REST /api/machine-types (GET, POST, PUT, DELETE)
│   ├── entities/
│   │   ├── machine-type.entity.ts      MachineTypeEntity (name, slug, mqttTopic)
│   │   ├── machine-variable.entity.ts  MachineVariableEntity (key, label, dataType, cardConfig)
│   │   └── machine-command.entity.ts   MachineCommandEntity (key, label, commandType, config)
│   └── dto/
│       ├── create-machine-type.dto.ts
│       ├── create-machine-command.dto.ts
│       └── update-machine-type.dto.ts
│
├── commands/                  Unified command dispatch module
│   ├── commands.module.ts     Imports MqttModule + MachineDesignerModule
│   ├── commands.service.ts    Pending-command map, timeout logic, dynamic topic construction
│   ├── commands.gateway.ts    WebSocket handler for command:execute events
│   └── dto/
│       └── command.dto.ts     CommandRequestDto + CommandResultDto
│
├── mqtt/                      MQTT broker connection module
│   ├── mqtt.module.ts         Imports HvacModule + MachineModule; provides + exports MqttService
│   └── mqtt.service.ts        MQTT client lifecycle, topic routing, response handler registry
│
└── common/                    Shared utilities
    └── dto/
        └── device-event.dto.ts  DeviceEventDto (unified event type for all machines)
```

---

## Socket.IO events

| Direction | Event | Payload |
|---|---|---|
| Server → Client | `hvac_snapshot` | `TelemetryDto[]` — full HVAC state on connect |
| Server → Client | `hvac_update` | `TelemetryDto` — single AHU update |
| Server → Client | `machine_snapshot` | `Record<string, MachineTelemetryDto[]>` — all generic machine state on connect |
| Server → Client | `machine_update` | `MachineTelemetryDto` — single machine instance update |
| Server → Client | `machine_event` | `MachineEventDto` — connectivity events (DISCONNECTED/RECONNECTED) |
| Server → Client | `device_event` | `DeviceEventDto` — unified health events (OK/WARNING/ALARM/DISCONNECTED/RECONNECTED) |
| Client → Server | `command:execute` | `CommandRequestDto` — send command to device |
| Server → Client | `command:acknowledged` | `{ commandId, timestamp }` — immediate ACK |
| Server → Client | `command:result` | `CommandResultDto` — final result (SUCCESS/ERROR/TIMEOUT) |

---

## REST endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/hvac/snapshot` | Current state of all HVAC AHUs |
| GET | `/machines/snapshot` | Current state of all generic machine instances |
| GET | `/machines/:machineType/snapshot` | Current state of a specific machine type |
| GET | `/api/machine-types` | List all machine type definitions |
| GET | `/api/machine-types/:slug` | Get a machine type by slug |
| POST | `/api/machine-types` | Create a new machine type (with variables and commands) |
| PUT | `/api/machine-types/:id` | Update a machine type |
| DELETE | `/api/machine-types/:id` | Delete a machine type |

---

## Database (SQLite + TypeORM)

The backend persists machine type definitions in an SQLite database at `./data/database.sqlite`. Three tables:

| Table | Description |
|---|---|
| `machine_types` | Machine type definitions (name, slug, mqttTopic, description, icon) |
| `machine_variables` | Variable definitions per type (key, label, dataType, unit, cardType, color, cardConfig, displayOrder) |
| `machine_commands` | Command definitions per type (key, label, commandType, config, displayOrder) |

TypeORM is configured with `synchronize: true` in development — schema changes are applied automatically.

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP / WebSocket server port |
| `MQTT_BROKER_URL` | `mqtt://mosquitto:1883` | MQTT broker connection URL |
| `MQTT_TOPIC` | `hvac/#` | Base topic pattern to subscribe to |
| `CORS_ORIGIN` | `*` | Allowed CORS origin(s) |

Copy `.env.example` to `.env` and adjust as needed.

---

## Running locally

```bash
# Install dependencies
npm install

# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

## Running tests

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Docker

```bash
docker build -t hvac-backend .
docker run -p 3000:3000 --env-file .env hvac-backend
```
