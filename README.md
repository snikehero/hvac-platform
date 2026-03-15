<p align="center">
  <img src="https://img.shields.io/badge/FireIIOT-Platform-0078D4?style=for-the-badge&logoColor=white" alt="FireIIOT Platform" />
</p>

<h3 align="center">Modular Industrial IoT Monitoring & Control Platform</h3>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Mosquitto-MQTT-3C5280?style=flat-square&logo=eclipsemosquitto&logoColor=white" alt="MQTT" />
  <img src="https://img.shields.io/badge/Node--RED-Flows-8F0000?style=flat-square&logo=nodered&logoColor=white" alt="Node-RED" />
  <img src="https://img.shields.io/badge/Socket.IO-Realtime-010101?style=flat-square&logo=socketdotio&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/SQLite-TypeORM-003B57?style=flat-square&logo=sqlite&logoColor=white" alt="SQLite" />
</p>

---

## About

**FireIIOT Platform** is a full-stack, real-time industrial IoT monitoring and control system. Originally built for HVAC (Heating, Ventilation and Air Conditioning) equipment, the platform has evolved into a **modular architecture** where any type of industrial machine can be defined, monitored, and controlled through a unified system.

The platform ingests telemetry from devices through an MQTT broker, processes it in a NestJS backend, persists machine type definitions in SQLite via TypeORM, and pushes live updates to a React dashboard via WebSockets.

### Key Capabilities

- **Machine Designer** — Define custom machine types with variables, commands, and thresholds through a visual UI
- **Real-time telemetry** — Live data visualization with interactive charts for any machine type
- **Dynamic commands** — Send toggle, range, or select commands to any configured device via MQTT
- **Health monitoring** — Automatic health evaluation based on configurable thresholds per variable
- **Unified alarm system** — Cross-machine-type alarm aggregation with per-instance acknowledge
- **Per-type pages** — Each machine type gets its own Home, Dashboard, Alarms, Settings, and Detail pages
- **HVAC module** — Full-featured HVAC monitoring with 3D views (serves as reference implementation)
- **Multi-language support** — English / Spanish
- **Dark / Light theme**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Docker Compose Network                       │
│                                                                     │
│  ┌─────────────┐    MQTT     ┌──────────────┐  WebSocket   ┌──────────────┐
│  │  Mosquitto  │◄───────────►│   Backend    │◄────────────►│   Frontend   │
│  │  (Broker)   │             │  (NestJS)    │              │   (React)    │
│  └─────────────┘             │              │              └──────────────┘
│         ▲                    │  ┌────────┐  │                :8080
│         │ MQTT               │  │ SQLite │  │
│  ┌──────┴──────┐             │  └────────┘  │
│  │  Node-RED   │             └──────────────┘
│  │  (Flows)    │                   :3000
│  └─────────────┘
│       :1880
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Physical Devices / Node-RED Simulators
    │
    │  MQTT publish (e.g. motor/plant-1/motor-1/telemetry)
    ▼
Mosquitto Broker (:1883)
    │
    │  Subscribe: hvac/#, <machineType>/#
    ▼
NestJS Backend (:3000)
    ├── MqttService         ← Routes messages to HvacService or MachineService
    ├── HvacService         ← HVAC-specific telemetry processing
    ├── MachineService      ← Generic machine telemetry processing
    ├── MachineDesigner     ← CRUD for machine type definitions (SQLite)
    ├── CommandsService     ← Command dispatch + response tracking
    │
    │  Socket.IO events (hvac_update, machine_update, device_event, etc.)
    ▼
React Frontend (:8080)
    ├── WebSocketProvider   ← Manages all real-time state
    ├── HVAC Pages          ← Specialized HVAC monitoring
    ├── Machine Pages       ← Generic machine monitoring (auto-generated from definitions)
    └── Machine Designer    ← Visual machine type editor
```

### Services

| Service    | Role                                                    | Port   |
|------------|---------------------------------------------------------|--------|
| Mosquitto  | Lightweight MQTT broker for device telemetry            | `1883` |
| Node-RED   | Flow-based IoT data processing and simulation           | `1880` |
| Backend    | REST API + WebSocket gateway + SQLite persistence       | `3000` |
| Frontend   | Single-page dashboard (React + Vite)                    | `8080` |

---

## Core Concepts

### Machine Types

A **Machine Type** is a definition that describes a category of industrial equipment. Each machine type specifies:

- **Variables** — Data points to monitor (e.g., temperature, rpm, pressure) with data types, units, card rendering config, and optional thresholds
- **Commands** — Actions that can be sent to the device (toggle ON/OFF, set a range value, select from options)
- **MQTT Topic** — The topic pattern used for device communication (e.g., `motor/#`)

Machine types are created and managed through the **Machine Designer** UI and stored in SQLite via TypeORM.

### HVAC Module

The HVAC module is a **specialized, first-class implementation** that predates the generic system. It includes custom features like 3D visualization, executive dashboards, and hardcoded telemetry processing. The generic machine system has been elevated to feature parity with HVAC, enabling future migration of HVAC to the generic system.

---

## Tech Stack

### Backend

| Technology     | Purpose                                      |
|----------------|----------------------------------------------|
| NestJS 11      | Server framework, API & WebSocket gateway    |
| TypeScript 5   | Static typing                                |
| TypeORM        | ORM for machine type persistence             |
| SQLite         | Embedded database for machine definitions    |
| MQTT.js        | MQTT client for broker communication         |
| Socket.IO      | Real-time bidirectional events               |

### Frontend

| Technology              | Purpose                                |
|-------------------------|----------------------------------------|
| React 19                | UI library                             |
| TypeScript 5            | Static typing                          |
| Vite 7                  | Build tool & dev server                |
| Tailwind CSS 4          | Utility-first styling                  |
| Radix UI                | Accessible UI primitives               |
| Recharts                | Data visualization & charts            |
| React Three Fiber / Drei| 3D visualizations with Three.js        |
| Socket.IO Client        | WebSocket connection to backend        |
| React Router DOM 7      | Client-side routing                    |
| dnd-kit                 | Drag and drop interactions             |
| Lucide React            | Icon library                           |
| Sonner                  | Toast notifications                    |

### Infrastructure

| Technology            | Purpose                                  |
|-----------------------|------------------------------------------|
| Docker Compose        | Multi-container orchestration            |
| Eclipse Mosquitto 2   | MQTT message broker                      |
| Node-RED              | IoT flow processing & data simulation    |

---

## Project Structure

```
hvac-platform/
├── backend/                  # NestJS API, WebSocket gateway, SQLite persistence
│   └── src/
│       ├── hvac/             # HVAC-specific: controller, service, gateway, DTOs
│       ├── machine/          # Generic machine telemetry: service, gateway, controller
│       ├── machine-designer/ # Machine type CRUD: entities, DTOs, service, controller
│       ├── commands/         # Command dispatch: service, gateway, DTOs
│       ├── mqtt/             # MQTT broker connection & message routing
│       └── common/           # Shared utilities (DeviceEventDto)
├── hvac-frontend/            # React + Vite web application
│   └── src/
│       ├── pages/            # Page views organized by module
│       │   ├── HVAC/         # HVAC-specific pages (Home, Dashboard, Detail, Alarms, Settings)
│       │   ├── Machine/      # Generic machine pages (Home, Dashboard, Detail, Alarms, Settings)
│       │   ├── MachineDesigner/  # Machine type editor
│       │   ├── Alarms/       # Unified cross-type alarms
│       │   └── HomeGlobal/   # Platform-wide overview
│       ├── components/       # Reusable components (Charts, MetricCards, CommandPanels, UI)
│       ├── hooks/            # Custom hooks (telemetry, health, history, commands, connectivity)
│       ├── providers/        # WebSocketProvider (real-time state management)
│       ├── context/          # React contexts (Settings, Acks, MachineTypes)
│       ├── domain/           # Pure business logic (health evaluation)
│       ├── services/         # API clients & notification service
│       ├── i18n/             # Translations (en / es)
│       ├── types/            # TypeScript type definitions
│       └── router/           # Route configuration
├── mosquitto/                # Mosquitto broker configuration
├── nodered/                  # Node-RED flow data
└── docker-compose.yml        # Service orchestration
```

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) >= 18 *(only for local development without Docker)*

### Quick Start with Docker

```bash
git clone https://github.com/<your-username>/hvac-platform.git
cd hvac-platform
docker compose up --build
```

Once running, open **http://localhost:8080** in your browser.

### Local Development

**Backend:**

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

**Frontend:**

```bash
cd hvac-frontend
npm install
npm run dev
```

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure as needed:

| Variable           | Description                  | Default                  |
|--------------------|------------------------------|--------------------------|
| `PORT`             | Backend server port          | `3000`                   |
| `MQTT_BROKER_URL`  | MQTT broker connection URL   | `mqtt://mosquitto:1883`  |
| `MQTT_TOPIC`       | MQTT topic subscription      | `hvac/#`                 |
| `CORS_ORIGIN`      | Allowed CORS origins         | `*`                      |

Frontend environment (`hvac-frontend/.env`):

| Variable       | Description                      | Default                  |
|----------------|----------------------------------|--------------------------|
| `VITE_WS_URL`  | Backend WebSocket / HTTP base URL| `http://localhost:3000`  |

---

<p align="center">
  Built with industrial precision for smart building and factory automation
</p>
