# FireIIOT Platform — Backend

NestJS 11 backend that ingests real-time telemetry from industrial machines via MQTT, manages machine type definitions in SQLite, and pushes live updates to connected frontend clients via Socket.IO.

---

## How it works

The backend is built around a **fully generic machine pipeline**. Any machine type defined in the Machine Designer is dynamically registered as an MQTT topic handler and processed through the same telemetry, event, and command infrastructure.

### Data flow — telemetry (MQTT → WebSocket)

```
MQTT Broker
    │
    │  <machineType>/#  → MachineService (dynamic, one handler per registered type)
    ▼
MqttService              ← subscribes on startup, routes by topic pattern
    │
    └──► MachineService  ← merges into per-type in-memory state Maps
            │
            ▼
         MachineGateway   ← broadcasts machine_update / machine_snapshot / device_event
```

**Generic machine flow:**

1. On startup, `MachineService` loads all machine types from the DB and calls `MqttService.registerTopicHandler()` for each MQTT topic pattern (e.g., `motor/#`).
2. `MqttService` subscribes to each pattern on the broker and dispatches incoming messages to the matching handler.
3. `MachineService` maintains per-type in-memory state maps and evaluates device health against configurable thresholds.
4. `MachineGateway` emits `machine_update`, `machine_snapshot`, `device_event`, and `machine_event` to connected clients.

When a new machine type is created or deleted via the REST API, `MachineService` dynamically registers or unregisters the corresponding MQTT topic handler at runtime.

### Data flow — commands (WebSocket → MQTT)

```
Frontend client
    │  command:execute  { machineType, plantId, stationId, command, value }
    ▼
CommandsGateway
    │
    ▼
CommandsService
    │  looks up MachineType.mqttTopic from DB
    │  topic: <base>/<plantId>/<stationId>/commands/set
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
TypeORM ──► SQLite database (./data/machine-designer.sqlite)
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
├── config/
│   └── app.config.ts          Typed configuration factory (reads env vars)
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
│   ├── mqtt.module.ts         Imports MachineModule; provides + exports MqttService
│   └── mqtt.service.ts        MQTT client lifecycle, dynamic topic handler registry, message routing
│
└── common/                    Shared utilities
    └── dto/
        └── device-event.dto.ts  DeviceEventDto (unified event type for all machines)
```

---

## Socket.IO events

| Direction | Event | Payload |
|---|---|---|
| Server → Client | `machine_snapshot` | `Record<string, MachineTelemetryDto[]>` — all machine state on connect |
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
| GET | `/machines/snapshot` | Current state of all machine instances (all types) |
| GET | `/machines/:machineType/snapshot` | Current state of a specific machine type |
| GET | `/api/machine-types` | List all machine type definitions |
| GET | `/api/machine-types/:slug` | Get a machine type by slug |
| POST | `/api/machine-types` | Create a new machine type (with variables and commands) |
| PUT | `/api/machine-types/:id` | Update a machine type |
| DELETE | `/api/machine-types/:id` | Delete a machine type |

---

## Database (SQLite + TypeORM)

The backend persists machine type definitions in an SQLite database at `./data/machine-designer.sqlite`. Three tables:

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
