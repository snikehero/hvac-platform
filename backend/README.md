# HVAC Platform — Backend

NestJS 11 backend that ingests real-time AHU (Air Handling Unit) telemetry from an MQTT broker and pushes live updates to connected frontend clients via Socket.IO.

---

## How it works

```
MQTT Broker
    │
    │  hvac/#  (telemetry topics)
    ▼
MqttService          ← subscribes on startup, parses every message
    │
    │  handleTelemetry(payload)
    ▼
HvacService          ← merges payload into in-memory AHU state map
    │
    │  emitUpdate(dto)
    ▼
HvacGateway          ← broadcasts hvac_update to all Socket.IO clients
```

### Data flow — telemetry (MQTT → WebSocket)

1. `MqttService` connects to the broker on startup (`MQTT_BROKER_URL`) and subscribes to `MQTT_TOPIC` (default `hvac/#`).
2. On each message it parses the JSON payload and forwards it to `HvacService.handleTelemetry()`.
3. `HvacService` keeps an **in-memory `Map<string, InternalAhuState>`** keyed by `plantId-stationId`. It merges the incoming data points into the existing state entry (or creates a new one).
4. `HvacGateway` emits `hvac_update` to every connected Socket.IO client with the updated `TelemetryDto`.
5. When a new client connects, `HvacGateway.handleConnection()` immediately sends a `hvac_snapshot` (the full current state of all known AHUs) so the dashboard does not need to wait for the next MQTT tick.

### Data flow — commands (WebSocket → MQTT)

```
Frontend client
    │  command:execute  (Socket.IO event)
    ▼
CommandsGateway      ← receives CommandRequestDto from the client
    │
    │  executeCommand(dto, socket)
    ▼
CommandsService      ← generates a unique commandId, publishes to MQTT
    │
    │  hvac/<plantId>/<stationId>/commands/set
    ▼
MQTT Broker  ──►  Physical device / simulator
    │
    │  hvac/.../commands/response
    ▼
MqttService  ──►  CommandsService.handleResponse()
    │
    │  command:result  (Socket.IO event, back to originating client)
    ▼
Frontend client
```

Commands time out after **10 seconds** if no device response arrives.

---

## Module structure

```
src/
├── app.module.ts          Root module — wires ConfigModule + HvacModule + MqttModule + CommandsModule
├── main.ts                Bootstrap: reads PORT from env, starts HTTP + Socket.IO server
│
├── hvac/
│   ├── hvac.module.ts     Provides HvacService + HvacGateway
│   ├── hvac.service.ts    In-memory AHU state store; merges telemetry, serves snapshots
│   ├── hvac.gateway.ts    WebSocket gateway: pushes hvac_update / hvac_snapshot
│   ├── hvac.controller.ts REST GET /hvac/snapshot (returns current state as JSON)
│   ├── dto/
│   │   └── telemetry.dto.ts     TelemetryDto + HvacPointDto (wire format)
│   ├── internal/
│   │   └── ahu-state.ts         InternalAhuState (rich internal representation with Map)
│   └── mappers/
│       └── telemetry.mapper.ts  toTelemetryDto() — converts internal state → DTO
│
├── mqtt/
│   ├── mqtt.module.ts     Imports HvacModule; provides + exports MqttService
│   └── mqtt.service.ts    MQTT client lifecycle; routes telemetry vs command responses
│
└── commands/
    ├── commands.module.ts   Imports MqttModule; provides CommandsService + CommandsGateway
    ├── commands.service.ts  Pending-command map, timeout logic, response routing
    ├── commands.gateway.ts  WebSocket handler for command:execute events
    └── dto/
        └── command.dto.ts   CommandRequestDto + CommandResultDto
```

---

## Socket.IO events

| Direction | Event | Payload |
|---|---|---|
| Server → Client | `hvac_snapshot` | `TelemetryDto[]` — full state on connect |
| Server → Client | `hvac_update` | `TelemetryDto` — single AHU update |
| Client → Server | `command:execute` | `CommandRequestDto` |
| Server → Client | `command:acknowledged` | `{ commandId, timestamp }` |
| Server → Client | `command:result` | `CommandResultDto` (`SUCCESS` / `ERROR` / `TIMEOUT`) |

---

## REST endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/hvac/snapshot` | Returns the current state of all known AHUs as `TelemetryDto[]` |

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP / WebSocket server port |
| `MQTT_BROKER_URL` | `mqtt://mosquitto:1883` | MQTT broker connection URL |
| `MQTT_TOPIC` | `hvac/#` | Topic pattern to subscribe to |
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
