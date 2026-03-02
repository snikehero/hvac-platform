# HVAC Platform — Development Plan
## 10 New Modules + Persistent Data Layer

**Created**: 2026-02-27
**Status**: Planning / Awaiting Approval

---

## Overview

The HVAC platform currently has **zero persistent storage** — the backend uses a pure in-memory `Map<string, InternalAhuState>`, the frontend history is capped at 30 points and lost on browser refresh, and no database service exists in Docker Compose.

This plan adds:
1. A **PostgreSQL + TimescaleDB persistence layer** (prerequisite)
2. **10 new frontend modules** (12 new pages, ~106 new files)

---

## Current Architecture (no persistence)

```
MQTT → MqttService → HvacService (in-memory Map) → WebSocket → Frontend (30-point sliding window)
                                                                    ↓
                                                              localStorage (settings + acks only)
```

## Target Architecture (with persistence)

```
MQTT → MqttService → HvacService → TelemetryRepository (PostgreSQL/TimescaleDB)
                         ↓                    ↓
                    WebSocket (live)    REST API (historical queries)
                         ↓                    ↓
                    Frontend ←────────────────┘
```

---

## Implementation Order

```
Phase 1: Persistent Data Layer  ← prerequisite, must be done first
    ↓
Phase 2: Energy Analytics + Audit Log + Reports
    ↓
Phase 3: Notification Center + Predictive Maintenance + Analytics Workbench
    ↓
Phase 4: Floor Plan + Scheduling + Multi-Site Manager
    ↓
Phase 5: User Management & RBAC  ← affects all modules, best done last
```

---

## PREREQUISITE: Persistent Data Layer

> Must be completed before any of the 10 modules. Provides database, ORM, entities, and API endpoints.

### What It Does
- PostgreSQL 16 + TimescaleDB for efficient time-series queries
- TypeORM integration in NestJS backend
- Every MQTT message automatically persisted
- REST API for historical queries with date range, aggregation, and pagination
- Configurable data retention (default: 90 days)

### Docker Compose Changes

```yaml
# Add to docker-compose.yml:
postgres:
  image: timescale/timescaledb:latest-pg16
  ports:
    - "5432:5432"
  environment:
    POSTGRES_DB: hvac
    POSTGRES_USER: hvac_user
    POSTGRES_PASSWORD: hvac_pass
  volumes:
    - pgdata:/var/lib/postgresql/data
```

### New Backend Files

| File | Purpose |
|------|---------|
| `backend/src/database/database.module.ts` | TypeORM module config, PostgreSQL connection |
| `backend/src/database/entities/telemetry-record.entity.ts` | Entity: `id`, `plantId`, `stationId`, `pointName`, `value`, `unit`, `quality`, `timestamp` |
| `backend/src/database/entities/event-record.entity.ts` | Entity: `id`, `plantId`, `ahuId`, `type`, `previousType`, `message`, `timestamp` |
| `backend/src/database/entities/command-record.entity.ts` | Entity: `id`, `plantId`, `stationId`, `command`, `value`, `status`, `operatorName`, `timestamp` |
| `backend/src/database/entities/audit-record.entity.ts` | Entity: `id`, `actionType`, `actor`, `details`, `plantId`, `ahuId`, `timestamp` |
| `backend/src/database/repositories/telemetry.repository.ts` | Custom repo: `saveTelemetry()`, `queryRange()`, `aggregate()` |
| `backend/src/database/repositories/event.repository.ts` | Custom repo: `saveEvent()`, `queryByDateRange()` |
| `backend/src/database/repositories/command.repository.ts` | Custom repo: `saveCommand()`, `queryByDateRange()` |
| `backend/src/database/repositories/audit.repository.ts` | Custom repo: `saveAudit()`, `queryFiltered()` |
| `backend/src/history/history.module.ts` | NestJS module for historical data endpoints |
| `backend/src/history/history.controller.ts` | REST endpoints for historical queries |
| `backend/src/history/history.service.ts` | Service: orchestrates repository queries |
| `backend/src/history/dto/history-query.dto.ts` | DTO: `startDate`, `endDate`, `plantId?`, `stationId?`, `pointName?`, `aggregation?` |
| `backend/src/history/dto/history-response.dto.ts` | DTO: paginated response with `data[]`, `total`, `page`, `pageSize` |
| `backend/src/database/migrations/001-initial.ts` | TypeORM migration: creates tables + hypertable |
| `backend/src/database/retention.service.ts` | Scheduled job: purges records older than retention period |

### Modified Backend Files

| File | Change |
|------|--------|
| `backend/src/app.module.ts` | Import `DatabaseModule`, `HistoryModule` |
| `backend/src/hvac/hvac.service.ts` | Inject `TelemetryRepository`, call `saveTelemetry()` after in-memory update |
| `backend/src/hvac/hvac.module.ts` | Import `DatabaseModule` |
| `backend/src/commands/commands.service.ts` | Inject `CommandRepository`, call `saveCommand()` on execute + result |
| `backend/src/commands/commands.module.ts` | Import `DatabaseModule` |
| `backend/package.json` | Add: `@nestjs/typeorm`, `typeorm`, `pg` |
| `backend/.env` | Add: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DATA_RETENTION_DAYS` |

### New REST API Endpoints

| Endpoint | Purpose | Consumed By |
|----------|---------|-------------|
| `GET /history/telemetry` | Query raw telemetry by date range + filters | Modules 1, 2, 5, 8 |
| `GET /history/telemetry/aggregate` | Aggregated data (hourly/daily avg, sum, min, max) | Modules 1, 4, 5 |
| `GET /history/events` | Query events by date range | Modules 5, 6 |
| `GET /history/commands` | Query command history | Module 10 |
| `GET /history/audit` | Query audit log entries | Module 10 |
| `POST /history/audit` | Create audit entry | Module 10 |

### New Frontend Files (API client)

| File | Purpose |
|------|---------|
| `hvac-frontend/src/api/historyApi.ts` | Fetch wrapper: `fetchTelemetryHistory()`, `fetchAggregated()`, `fetchEvents()`, `fetchCommands()`, `fetchAuditLog()`, `postAuditEntry()` |
| `hvac-frontend/src/types/history-api.ts` | Types: `HistoryQuery`, `HistoryResponse`, `AggregatedData`, `AggregationType` |
| `hvac-frontend/src/hooks/useHistoryApi.ts` | Hook: manages loading/error state for history API calls |
| `hvac-frontend/.env` | Add `VITE_API_BASE_URL` (defaults to `http://localhost:3000`) |

### Persistence Tests

| Test File | Type | What It Tests |
|-----------|------|---------------|
| `backend/src/database/repositories/telemetry.repository.spec.ts` | Unit | Save + query range + aggregation logic |
| `backend/src/history/history.controller.spec.ts` | Unit | Endpoint validation, query param parsing |
| `backend/src/history/history.service.spec.ts` | Unit | Service orchestration, pagination |
| `backend/src/database/retention.service.spec.ts` | Unit | Deletes records older than retention period |
| `hvac-frontend/src/test/unit/historyApi.test.ts` | Unit | Fetch calls, error handling, response parsing |

---

## Shared Frontend Changes (all 10 modules)

| File | Change |
|------|--------|
| `hvac-frontend/src/router/routes.ts` | Add 10 new route paths |
| `hvac-frontend/src/main.tsx` | Add 10 new `<Route>` entries + 6 new providers |
| `hvac-frontend/src/components/layouts/AppSidebar.tsx` | Add 10 new sidebar menu items with icons |
| `hvac-frontend/src/i18n/es.ts` | Add translation keys for all 10 modules |
| `hvac-frontend/src/i18n/en.ts` | Add translation keys for all 10 modules |
| `hvac-frontend/src/test/factories.ts` | Add new test factories per module |
| `hvac-frontend/src/test/renderWithProviders.tsx` | Add optional props for new contexts |

---

## Module 1: Energy Analytics

**Route**: `/hvac/energy`
**Depends on**: Persistent Data Layer (aggregated power history)

### What It Does
- Queries `GET /history/telemetry/aggregate` for `points.power` data with hourly/daily/weekly grouping
- kWh trend charts (Recharts line/bar) with date range picker
- Cost calculator: kWh × configurable $/kWh rate per period
- Period comparison: current vs previous week/month
- Per-AHU efficiency ranking table

### New Files

| File | Purpose |
|------|---------|
| `hvac-frontend/src/pages/HVAC/Energy/EnergyPage.tsx` | Main page — chart selector, date range, plant filter |
| `hvac-frontend/src/pages/HVAC/Energy/EnergyTrendChart.tsx` | Recharts line/bar chart for kWh over time |
| `hvac-frontend/src/pages/HVAC/Energy/EnergyCostCard.tsx` | KPI card: total cost, avg cost/AHU, period delta |
| `hvac-frontend/src/pages/HVAC/Energy/EnergyRankingTable.tsx` | Table ranking AHUs by consumption |
| `hvac-frontend/src/pages/HVAC/Energy/EnergyComparisonChart.tsx` | Side-by-side period comparison chart |
| `hvac-frontend/src/hooks/useEnergyData.ts` | Hook: calls `fetchAggregated()` for power points |
| `hvac-frontend/src/domain/energy/calculateEnergy.ts` | Pure function: kWh calculation, cost projection, period delta % |
| `hvac-frontend/src/types/energy.ts` | Types: `EnergyDataPoint`, `EnergySummary`, `EnergyPeriod` |

### Modified Files

| File | Change |
|------|--------|
| `hvac-frontend/src/context/SettingsContext.tsx` | Add `energy: { costPerKwh: number, currency: string }` |
| `hvac-frontend/src/pages/HVAC/Settings/SettingsPage.tsx` | Add Energy tab with cost/currency inputs |

### Tests

| Test File | Type | What It Tests |
|-----------|------|---------------|
| `src/test/unit/calculateEnergy.test.ts` | Unit | kWh aggregation, cost calculation, period delta % |
| `src/test/integration/EnergyPage.test.tsx` | Integration | Chart renders, date range filter, cost display |

---

## Module 2: Predictive Maintenance

**Route**: `/hvac/maintenance`
**Depends on**: Persistent Data Layer (airflow history for regression)

### What It Does
- Queries `GET /history/telemetry` for airflow data over past 30/60/90 days
- Linear regression on airflow values → estimated days until filter replacement
- Maintenance calendar with upcoming service dates
- Maintenance ticket creation
- Color-coded urgency: green (>30 days), yellow (7–30 days), red (<7 days)

### New Files

| File | Purpose |
|------|---------|
| `hvac-frontend/src/pages/HVAC/Maintenance/MaintenancePage.tsx` | Main page — tabs: Predictions, Calendar, Tickets |
| `hvac-frontend/src/pages/HVAC/Maintenance/PredictionCard.tsx` | Per-AHU card: days remaining, trend sparkline, urgency color |
| `hvac-frontend/src/pages/HVAC/Maintenance/MaintenanceCalendar.tsx` | Calendar grid with scheduled maintenance tasks |
| `hvac-frontend/src/pages/HVAC/Maintenance/TicketForm.tsx` | Form to create/edit maintenance tickets |
| `hvac-frontend/src/hooks/useMaintenancePredictions.ts` | Hook: fetches history, runs prediction, returns results |
| `hvac-frontend/src/domain/maintenance/predictFilterLife.ts` | Pure function: linear regression on airflow data |
| `hvac-frontend/src/types/maintenance.ts` | Types: `MaintenanceTicket`, `PredictionResult`, `MaintenanceSchedule` |
| `hvac-frontend/src/context/MaintenanceContext.tsx` | Context: stores tickets/schedules in localStorage |

### Modified Files

| File | Change |
|------|--------|
| `hvac-frontend/src/main.tsx` | Wrap with `MaintenanceProvider` |

### Tests

| Test File | Type | What It Tests |
|-----------|------|---------------|
| `src/test/unit/predictFilterLife.test.ts` | Unit | Linear regression: declining/flat/rising trends, insufficient data |
| `src/test/integration/MaintenancePage.test.tsx` | Integration | Prediction cards, urgency colors, calendar view |
| `src/test/unit/MaintenanceContext.test.tsx` | Unit | Ticket CRUD, localStorage persistence |

---

## Module 3: Scheduling & Automation

**Route**: `/hvac/schedules`
**Depends on**: existing `command:execute` WebSocket event

### What It Does
- Rule builder: IF (time condition) THEN (execute command on target AHU)
- Cron-like scheduling: weekdays, weekends, specific hours
- Holiday/exception calendar
- Rule enable/disable toggle
- Commands sent via existing `command:execute` WebSocket event
- Rule execution log with success/failure

### New Files

| File | Purpose |
|------|---------|
| `hvac-frontend/src/pages/HVAC/Schedules/SchedulesPage.tsx` | Main page — rule list, add/edit/delete |
| `hvac-frontend/src/pages/HVAC/Schedules/RuleEditor.tsx` | Modal form: target AHU, command, schedule expression |
| `hvac-frontend/src/pages/HVAC/Schedules/ScheduleCalendarView.tsx` | Weekly calendar showing when rules fire |
| `hvac-frontend/src/pages/HVAC/Schedules/RuleExecutionLog.tsx` | History table of executed rules |
| `hvac-frontend/src/hooks/useScheduleEngine.ts` | Hook: evaluates rules on interval, triggers commands |
| `hvac-frontend/src/domain/schedules/evaluateRule.ts` | Pure function: determines if a rule fires at a given time |
| `hvac-frontend/src/types/schedule.ts` | Types: `ScheduleRule`, `RuleExecution`, `TimeCondition` |
| `hvac-frontend/src/context/ScheduleContext.tsx` | Context: stores rules in localStorage, runs evaluation loop |

### Modified Files

| File | Change |
|------|--------|
| `hvac-frontend/src/main.tsx` | Wrap with `ScheduleProvider` |

### Tests

| Test File | Type | What It Tests |
|-----------|------|---------------|
| `src/test/unit/evaluateRule.test.ts` | Unit | Weekday-only, time ranges, holidays, disabled rules |
| `src/test/integration/SchedulesPage.test.tsx` | Integration | Rule list, add/edit/delete, enable/disable |
| `src/test/unit/ScheduleContext.test.tsx` | Unit | Rule storage, evaluation loop timing |

---

## Module 4: Multi-Site Manager

**Route**: `/hvac/sites`
**Depends on**: Persistent Data Layer (cross-plant aggregation)

### What It Does
- Portfolio KPI dashboard: total AHUs, total alarms, avg temperature across all plants
- Per-plant summary cards with health distribution pie chart
- Drill-down: click plant → filtered DashboardEjecutivoPage
- Comparison mode: 2 plants side-by-side
- Optional map view (Leaflet.js) with plant pins colored by worst status

### New Files

| File | Purpose |
|------|---------|
| `hvac-frontend/src/pages/HVAC/Sites/SitesPage.tsx` | Main page — portfolio KPIs + plant card grid |
| `hvac-frontend/src/pages/HVAC/Sites/PlantSummaryCard.tsx` | Card: plant name, AHU count, health pie chart |
| `hvac-frontend/src/pages/HVAC/Sites/PlantComparisonView.tsx` | Side-by-side plant metrics comparison |
| `hvac-frontend/src/pages/HVAC/Sites/SiteMapView.tsx` | Leaflet map with plant pins (optional, lazy loaded) |
| `hvac-frontend/src/hooks/usePlantAggregation.ts` | Hook: groups live telemetry by plantId, computes KPIs |
| `hvac-frontend/src/domain/sites/aggregatePlantHealth.ts` | Pure function: plant-level health from AHU array |
| `hvac-frontend/src/types/site.ts` | Types: `PlantSummary`, `PortfolioKpi` |

### Optional New Dependencies

| Package | Purpose |
|---------|---------|
| `leaflet` + `react-leaflet` | Map view (only if map feature is included) |

### Tests

| Test File | Type | What It Tests |
|-----------|------|---------------|
| `src/test/unit/aggregatePlantHealth.test.ts` | Unit | Groups by plantId, alarm/warning counts, worst-status |
| `src/test/integration/SitesPage.test.tsx` | Integration | Plant cards render, drill-down, comparison mode |

---

## Module 5: Reports & Export Center

**Route**: `/hvac/reports`
**Depends on**: Persistent Data Layer (historical data for report content)

### What It Does
- Report templates: "Daily Summary", "Alarm Log", "Energy Report", "AHU Performance"
- Configurable date range picker (queries `/history/*` endpoints)
- Preview rendered report before download
- Export formats: PDF (jsPDF) and CSV (papaparse)
- Report generation history (localStorage)

### New Files

| File | Purpose |
|------|---------|
| `hvac-frontend/src/pages/HVAC/Reports/ReportsPage.tsx` | Main page — template selector, date range, generate button |
| `hvac-frontend/src/pages/HVAC/Reports/ReportPreview.tsx` | Rendered preview of report content |
| `hvac-frontend/src/pages/HVAC/Reports/ReportTemplateCard.tsx` | Template option card |
| `hvac-frontend/src/domain/reports/generateReport.ts` | Pure function: builds report data from API response |
| `hvac-frontend/src/domain/reports/exportPdf.ts` | PDF generation using jsPDF |
| `hvac-frontend/src/domain/reports/exportCsv.ts` | CSV generation using papaparse |
| `hvac-frontend/src/types/report.ts` | Types: `ReportTemplate`, `ReportData`, `ReportConfig` |

### New Dependencies

| Package | Purpose |
|---------|---------|
| `jspdf` | PDF generation |
| `papaparse` | CSV export |

### Tests

| Test File | Type | What It Tests |
|-----------|------|---------------|
| `src/test/unit/generateReport.test.ts` | Unit | Report data from API, date range filtering |
| `src/test/unit/exportCsv.test.ts` | Unit | CSV string output correctness |
| `src/test/integration/ReportsPage.test.tsx` | Integration | Template selection, preview, download triggers |

---

## Module 6: Notification Center

**Route**: `/hvac/notifications`
**Depends on**: live telemetry (existing WebSocket)

### What It Does
- Notification bell in AppHeader with unread count badge
- In-app notification list (dropdown + full page view)
- Custom alert rules: "Notify if AHU-X temp > Y for Z minutes"
- Browser Notifications API (with permission request)
- Notification history with read/unread state
- Severity levels: info, warning, critical

### New Files

| File | Purpose |
|------|---------|
| `hvac-frontend/src/pages/HVAC/Notifications/NotificationsPage.tsx` | Full page — notification list + rule management |
| `hvac-frontend/src/pages/HVAC/Notifications/AlertRuleEditor.tsx` | Form: condition builder (metric, operator, threshold, duration) |
| `hvac-frontend/src/pages/HVAC/Notifications/NotificationList.tsx` | Scrollable list with mark-read/delete |
| `hvac-frontend/src/components/NotificationBell.tsx` | Header bell icon with unread count badge |
| `hvac-frontend/src/hooks/useNotificationEngine.ts` | Hook: evaluates alert rules against live telemetry |
| `hvac-frontend/src/domain/notifications/evaluateAlertRule.ts` | Pure function: checks if rule conditions are met |
| `hvac-frontend/src/types/notification.ts` | Types: `Notification`, `AlertRule`, `NotificationSeverity` |
| `hvac-frontend/src/context/NotificationContext.tsx` | Context: stores notifications/rules in localStorage |

### Modified Files

| File | Change |
|------|--------|
| `hvac-frontend/src/components/layouts/AppHeader.tsx` | Add `<NotificationBell />` component |
| `hvac-frontend/src/main.tsx` | Wrap with `NotificationProvider` |

### Tests

| Test File | Type | What It Tests |
|-----------|------|---------------|
| `src/test/unit/evaluateAlertRule.test.ts` | Unit | Threshold comparison, duration window, severity |
| `src/test/integration/NotificationsPage.test.tsx` | Integration | List renders, mark-read, rule creation |
| `src/test/integration/NotificationBell.test.tsx` | Integration | Unread count badge, dropdown opens |
| `src/test/unit/NotificationContext.test.tsx` | Unit | Storage, read state, rule persistence |

---

## Module 7: User Management & RBAC

**Route**: `/hvac/users`, `/hvac/profile`, `/auth/login`
**Depends on**: Persistent Data Layer (user records in DB)

### What It Does
- Login page with JWT authentication
- User list (admin only) with role assignment
- Roles: Admin (full access), Operator (view + commands), Viewer (view only)
- Auth guards on CommandsPanel (Viewer) and SettingsPage (Admin only)
- User profile page with activity summary
- Session management (logout, token refresh)

### New Frontend Files

| File | Purpose |
|------|---------|
| `hvac-frontend/src/pages/HVAC/Users/UsersPage.tsx` | Admin page — user list, role management |
| `hvac-frontend/src/pages/HVAC/Users/UserProfilePage.tsx` | Current user profile + preferences |
| `hvac-frontend/src/pages/Auth/LoginPage.tsx` | Login form (outside HVAC layout) |
| `hvac-frontend/src/context/AuthContext.tsx` | Context: JWT storage, current user, role |
| `hvac-frontend/src/hooks/useAuth.ts` | Hook: login, logout, token refresh |
| `hvac-frontend/src/hooks/usePermissions.ts` | Hook: `canSendCommands()`, `canEditSettings()`, `isAdmin()` |
| `hvac-frontend/src/components/AuthGuard.tsx` | HOC: wraps protected routes/components |
| `hvac-frontend/src/types/auth.ts` | Types: `User`, `Role`, `AuthState` |

### Modified Frontend Files

| File | Change |
|------|--------|
| `hvac-frontend/src/main.tsx` | Add `AuthProvider`, wrap routes with `AuthGuard` |
| `hvac-frontend/src/components/CommandsPanel/CommandsPanel.tsx` | Wrap with permission check |
| `hvac-frontend/src/pages/HVAC/Settings/SettingsPage.tsx` | Wrap with admin permission check |
| `hvac-frontend/src/components/layouts/AppHeader.tsx` | Show user name + logout button |

### New Backend Files

| File | Purpose |
|------|---------|
| `backend/src/auth/auth.module.ts` | Auth module with JWT strategy |
| `backend/src/auth/auth.controller.ts` | `POST /auth/login`, `POST /auth/refresh` |
| `backend/src/auth/auth.service.ts` | JWT sign/verify, credential validation |
| `backend/src/auth/jwt.strategy.ts` | Passport JWT strategy |
| `backend/src/auth/auth.guard.ts` | Route guard decorator |
| `backend/src/users/users.module.ts` | Users CRUD module |
| `backend/src/users/users.controller.ts` | `GET /users`, `POST /users`, `PATCH /users/:id` |
| `backend/src/users/users.service.ts` | User CRUD operations |
| `backend/src/database/entities/user.entity.ts` | Entity: `id`, `username`, `passwordHash`, `role`, `createdAt` |

### New Backend Dependencies

| Package | Purpose |
|---------|---------|
| `@nestjs/passport`, `passport`, `passport-jwt` | JWT authentication |
| `@nestjs/jwt` | JWT token generation |
| `bcrypt` | Password hashing |

### Tests

| Test File | Type | What It Tests |
|-----------|------|---------------|
| `src/test/unit/AuthContext.test.tsx` | Unit | Login sets token, logout clears, role from JWT |
| `src/test/integration/LoginPage.test.tsx` | Integration | Form validation, submit, error display |
| `src/test/integration/UsersPage.test.tsx` | Integration | User list (admin), role changes |
| `src/test/integration/AuthGuard.test.tsx` | Integration | Viewer hides commands, non-admin redirect |
| `backend/src/auth/auth.service.spec.ts` | Unit | JWT sign/verify, password validation |
| `backend/src/users/users.service.spec.ts` | Unit | User CRUD operations |

---

## Module 8: Analytics Workbench

**Route**: `/hvac/analytics`
**Depends on**: Persistent Data Layer (long-range metric history)

### What It Does
- Multi-AHU overlay: select N AHUs and overlay temperature/humidity/power on one chart
- Correlation scatter plot: any metric vs any other (e.g., temp vs power)
- Anomaly highlighting: points exceeding ±2σ from rolling average shown in red
- Chart export as PNG
- Saved chart configurations (localStorage)

### New Files

| File | Purpose |
|------|---------|
| `hvac-frontend/src/pages/HVAC/Analytics/AnalyticsPage.tsx` | Main page — chart type selector, AHU/metric pickers |
| `hvac-frontend/src/pages/HVAC/Analytics/OverlayChart.tsx` | Multi-line Recharts chart with AHU selector |
| `hvac-frontend/src/pages/HVAC/Analytics/CorrelationChart.tsx` | Scatter plot for metric correlation |
| `hvac-frontend/src/pages/HVAC/Analytics/AnomalyDetector.tsx` | Chart with anomaly points + σ bands |
| `hvac-frontend/src/domain/analytics/detectAnomalies.ts` | Pure function: rolling average + σ calculation |
| `hvac-frontend/src/domain/analytics/correlate.ts` | Pure function: pairs two metric arrays for scatter data |
| `hvac-frontend/src/types/analytics.ts` | Types: `ChartConfig`, `AnomalyPoint`, `CorrelationPair` |

### Tests

| Test File | Type | What It Tests |
|-----------|------|---------------|
| `src/test/unit/detectAnomalies.test.ts` | Unit | Rolling avg, σ bounds, anomaly flagging |
| `src/test/unit/correlate.test.ts` | Unit | Pairs metrics correctly, handles gaps |
| `src/test/integration/AnalyticsPage.test.tsx` | Integration | Multi-select AHUs, chart renders, anomalies highlighted |

---

## Module 9: Floor Plan View

**Route**: `/hvac/floorplan`
**Depends on**: live telemetry (existing WebSocket)

### What It Does
- Upload floor plan image (SVG/PNG) stored in localStorage as base64
- Edit mode: drag-and-drop AHU icons to position them on floor plan
- Live mode: AHU icons color-coded by health status (green/yellow/red/gray)
- Click AHU icon → side panel with quick metrics + link to AhuDetailPage
- Zoom and pan controls
- Multiple floors (tab per floor)

### New Files

| File | Purpose |
|------|---------|
| `hvac-frontend/src/pages/HVAC/FloorPlan/FloorPlanPage.tsx` | Main page — floor selector, view/edit mode toggle |
| `hvac-frontend/src/pages/HVAC/FloorPlan/FloorPlanCanvas.tsx` | Canvas: floor plan image + positioned AHU markers |
| `hvac-frontend/src/pages/HVAC/FloorPlan/AhuMarker.tsx` | Draggable AHU icon with health-based color |
| `hvac-frontend/src/pages/HVAC/FloorPlan/AhuQuickPanel.tsx` | Side panel: AHU metrics on marker click |
| `hvac-frontend/src/pages/HVAC/FloorPlan/FloorPlanUploader.tsx` | File upload dialog for floor plan images |
| `hvac-frontend/src/hooks/useFloorPlanState.ts` | Hook: manages marker positions + floor plan data |
| `hvac-frontend/src/types/floorplan.ts` | Types: `FloorPlan`, `AhuMarkerPosition`, `FloorConfig` |
| `hvac-frontend/src/context/FloorPlanContext.tsx` | Context: stores floor plans + positions in localStorage |

### Modified Files

| File | Change |
|------|--------|
| `hvac-frontend/src/main.tsx` | Wrap with `FloorPlanProvider` |

### Tests

| Test File | Type | What It Tests |
|-----------|------|---------------|
| `src/test/integration/FloorPlanPage.test.tsx` | Integration | Image renders, markers show, click opens panel |
| `src/test/unit/FloorPlanContext.test.tsx` | Unit | Marker CRUD, multi-floor, localStorage |

---

## Module 10: Audit Log

**Route**: `/hvac/audit`
**Depends on**: Persistent Data Layer (audit records in DB)

### What It Does
- Chronological table: timestamp, actor, action type, details, result
- Filter by: date range, action type, actor name
- Search by AHU ID or plant ID
- Export filtered results to CSV
- Action types: `COMMAND_SENT`, `ALARM_ACKNOWLEDGED`, `SETTINGS_CHANGED`, `ALARM_CLEARED`
- Queries `GET /history/audit` for persistent log

### New Files

| File | Purpose |
|------|---------|
| `hvac-frontend/src/pages/HVAC/AuditLog/AuditLogPage.tsx` | Main page — filterable table with date range picker |
| `hvac-frontend/src/pages/HVAC/AuditLog/AuditLogTable.tsx` | Table with sorting and pagination |
| `hvac-frontend/src/pages/HVAC/AuditLog/AuditLogFilters.tsx` | Filter bar: action type, date range, actor search |
| `hvac-frontend/src/domain/audit/formatAuditEntry.ts` | Pure function: formats raw entry for display |
| `hvac-frontend/src/types/audit.ts` | Types: `AuditEntry`, `AuditActionType` |
| `hvac-frontend/src/context/AuditContext.tsx` | Context: provides `logAction()` that POSTs to `/history/audit` |

### Modified Files

| File | Change |
|------|--------|
| `hvac-frontend/src/main.tsx` | Wrap with `AuditProvider` |
| `hvac-frontend/src/context/AckContext.tsx` | Call `logAction()` on acknowledge/clear |
| `hvac-frontend/src/components/CommandsPanel/CommandsPanel.tsx` | Call `logAction()` on command send |
| `hvac-frontend/src/context/SettingsContext.tsx` | Call `logAction()` on settings save |

### Tests

| Test File | Type | What It Tests |
|-----------|------|---------------|
| `src/test/unit/formatAuditEntry.test.ts` | Unit | Entry formatting per action type |
| `src/test/integration/AuditLogPage.test.tsx` | Integration | Table renders, filters work, CSV export |
| `src/test/unit/AuditContext.test.tsx` | Unit | `logAction()` POSTs to API, handles errors |

---

## Summary

### New Page Count

| # | Module | New Pages | Route(s) |
|---|--------|-----------|----------|
| 0 | Persistent Data Layer | 0 | backend only |
| 1 | Energy Analytics | 1 | `/hvac/energy` |
| 2 | Predictive Maintenance | 1 | `/hvac/maintenance` |
| 3 | Scheduling & Automation | 1 | `/hvac/schedules` |
| 4 | Multi-Site Manager | 1 | `/hvac/sites` |
| 5 | Reports & Export | 1 | `/hvac/reports` |
| 6 | Notification Center | 1 | `/hvac/notifications` |
| 7 | User Management (RBAC) | **3** | `/hvac/users`, `/hvac/profile`, `/auth/login` |
| 8 | Analytics Workbench | 1 | `/hvac/analytics` |
| 9 | Floor Plan View | 1 | `/hvac/floorplan` |
| 10 | Audit Log | 1 | `/hvac/audit` |
| **Total** | | **12 new pages** | |

**Current views: 18 → After plan: 30 routable views**

### New File Count

| Category | Count |
|----------|-------|
| Backend: Database layer (entities, repos, migrations, services) | 16 |
| Backend: Auth + Users modules | 9 |
| Backend: History API (module, controller, service, DTOs) | 5 |
| Frontend: Pages / page components | 35 |
| Frontend: Hooks | 9 |
| Frontend: Domain functions (pure) | 11 |
| Frontend: Types | 12 |
| Frontend: Contexts | 6 |
| Frontend: Shared components | 2 |
| Frontend: API client | 1 |
| **Total new files** | **~106** |

### Existing Files Modified

| File | Modules Affecting It |
|------|---------------------|
| `docker-compose.yml` | Prerequisite |
| `backend/src/app.module.ts` | Prerequisite, Module 7 |
| `backend/src/hvac/hvac.service.ts` | Prerequisite |
| `backend/src/commands/commands.service.ts` | Prerequisite |
| `backend/package.json` | Prerequisite, Module 7 |
| `backend/.env` | Prerequisite, Module 7 |
| `hvac-frontend/src/router/routes.ts` | All 10 modules |
| `hvac-frontend/src/main.tsx` | All 10 (routes) + 6 (providers) |
| `hvac-frontend/src/components/layouts/AppSidebar.tsx` | All 10 |
| `hvac-frontend/src/i18n/es.ts` | All 10 |
| `hvac-frontend/src/i18n/en.ts` | All 10 |
| `hvac-frontend/src/test/factories.ts` | Modules 1, 2, 3, 6, 10 |
| `hvac-frontend/src/test/renderWithProviders.tsx` | Modules 2, 3, 6, 7, 9, 10 |
| `hvac-frontend/src/context/SettingsContext.tsx` | Modules 1, 10 |
| `hvac-frontend/src/pages/HVAC/Settings/SettingsPage.tsx` | Modules 1, 7 |
| `hvac-frontend/src/components/layouts/AppHeader.tsx` | Modules 6, 7 |
| `hvac-frontend/src/context/AckContext.tsx` | Module 10 |
| `hvac-frontend/src/components/CommandsPanel/CommandsPanel.tsx` | Modules 7, 10 |
| `hvac-frontend/.env` | Prerequisite |

---

## Testing Plan

### Testing Strategy

| Layer | Tool | Approach |
|-------|------|----------|
| Backend unit | Jest (NestJS default) | Repository methods, service logic, DTO validation |
| Frontend unit | Vitest | Pure domain functions, context behavior |
| Frontend integration | Vitest + RTL | Page rendering with `renderWithProviders()` + mock data |
| E2E | Cypress | Critical cross-module user flows |

### Cypress E2E Tests

| Test File | What It Tests |
|-----------|---------------|
| `cypress/e2e/energy.cy.ts` | Navigate to energy, chart loads, change date range |
| `cypress/e2e/notifications.cy.ts` | Create alert rule, trigger alarm, notification in bell |
| `cypress/e2e/reports.cy.ts` | Select template, pick dates, generate + download |
| `cypress/e2e/schedules.cy.ts` | Create rule, see in calendar, disable it |
| `cypress/e2e/floorplan.cy.ts` | Upload floor plan, place marker, verify status color |
| `cypress/e2e/audit.cy.ts` | Send command, ack alarm, both in audit log |

### Test Count

| Test Type | Count |
|-----------|-------|
| Backend unit tests | 8 files |
| Frontend unit tests | 19 files |
| Frontend integration tests | 13 files |
| Cypress E2E tests | 6 files |
| **Total** | **46 test files** |

---

## Verification Checklist (after each module)

- [ ] `cd backend && npm test` — all NestJS tests pass
- [ ] `cd hvac-frontend && npm test` — all Vitest tests pass
- [ ] `cd hvac-frontend && npm run build` — no TypeScript errors
- [ ] `npm run cy:open` — E2E tests pass
- [ ] `docker-compose up` — all services start, DB initializes
- [ ] Navigate to new page via sidebar — data renders correctly
- [ ] Switch language (es ↔ en) — all new strings translate
- [ ] Switch theme (light ↔ dark) — no visual issues
