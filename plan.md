# Plan: Machine Designer V2 — MetricCards, Alarmas y HomeGlobal Unificado

## Context

La plataforma ya tiene un Machine Designer funcional que permite definir tipos de maquinas con variables MQTT y visualizarlos en dashboards genericos. Sin embargo:

1. Los dashboards de maquinas usan **texto plano** en lugar de los MetricCards animados que usa HVAC (TemperatureCard, HumidityCard, etc.)
2. No hay **cartas especificas para motores** (RPM, Corriente)
3. No hay **tracking de conectividad/desconexion** para maquinas genericas (solo HVAC tiene esto)
4. **HomeGlobal solo cuenta dispositivos HVAC** — las maquinas genericas no contribuyen al conteo global
5. El **preview del Designer** muestra texto plano en lugar de los MetricCards reales
6. No hay **editor de cardConfig** (min, max, target, critical) en el formulario

El objetivo: que un motor definido con `cardType: "temperature"` muestre el mismo TemperatureCard animado que HVAC, que se puedan crear RPMCard y CurrentCard para motores, y que todas las maquinas contribuyan al conteo global.

---

## Fase 1: Nuevos MetricCard Components (RPMCard + CurrentCard)

### 1.1 Extender tipos

**Modificar**: `hvac-frontend/src/components/MetricCards/types.ts`

- Agregar `"rpm"` y `"current"` al union `MetricType`
- Agregar `RpmCardProps extends BaseMetricCardProps { type: "rpm"; min?: number; max?: number; target?: number }`
- Agregar `CurrentCardProps extends BaseMetricCardProps { type: "current"; min?: number; max?: number; critical?: number }`

### 1.2 Crear RpmCard

**Crear**: `hvac-frontend/src/components/MetricCards/components/RpmCard.tsx`

- Icono: `Gauge` de lucide-react
- SVG: Tacometro de medio circulo con aguja animada, zonas de color (verde normal, amarillo alto, rojo critico)
- Patron base: seguir la estructura de `DamperCard.tsx` que ya tiene gauge arc + needle
- Defaults: `min=0, max=3600, target=1800`

### 1.3 Crear CurrentCard

**Crear**: `hvac-frontend/src/components/MetricCards/components/CurrentCard.tsx`

- Icono: `Zap` de lucide-react
- SVG: Medidor vertical de amperaje con linea de umbral critico, flujo de corriente animado
- Patron base: seguir estructura de `PowerCard.tsx` + `FilterCard.tsx`
- Defaults: `min=0, max=100, critical=80`

### 1.4 Exportar

**Modificar**: `hvac-frontend/src/components/MetricCards/index.ts`

- Agregar exports de `RpmCard` y `CurrentCard`

---

## Fase 2: Renderizador de MetricCards para Machine Dashboard

### 2.1 Crear utilidad renderMetricCard

**Crear**: `hvac-frontend/src/components/MetricCards/renderMetricCard.tsx`

Funcion que mapea `cardType` string → componente correcto:

```typescript
function renderMetricCard(props: {
  cardType: string;
  label: string;
  value: any;
  unit: string;
  quality?: MetricQuality;
  color: MetricColor;
  cardConfig?: Record<string, unknown>;
}): React.ReactElement;
```

- `switch(cardType)` → TemperatureCard, HumidityCard, FanCard, AirflowCard, DamperCard, PowerCard, FilterCard, RpmCard, CurrentCard, default → GenericCard
- Spread `cardConfig` como extra props (min, max, target, critical)
- Para Fan/PowerCard: derivar `status` del valor (boolean→ON/OFF, string directo)
- Para "gauge": mapear a RpmCard (reusar tacometro)
- Mapear colores `"chart-1".."chart-5"` → `"chart"` para compatibilidad con MetricCardBase

### 2.2 Actualizar MachineDetailPage con MetricCards reales

**Modificar**: `hvac-frontend/src/pages/Machine/MachineDetailPage.tsx`

- Reemplazar las Cards de texto plano (lineas 136-187) con `renderMetricCard()`
- Eliminar los objetos `colorMap` y `textColorMap` inline (MetricCardBase maneja colores)
- Mantener header, back button, connection info sin cambios

### 2.3 Actualizar MachineDashboardPage (mejora sutil)

**Modificar**: `hvac-frontend/src/pages/Machine/MachineDashboardPage.tsx`

- Mantener como summary cards compactas (NOT full MetricCards — seria muy pesado para N instancias x M variables)
- Agregar indicador visual de estado de conexion por instancia (dot verde/rojo)
- Agregar badge de tiempo desde ultimo update

---

## Fase 3: Tracking de Conectividad y Eventos para Maquinas Genericas

### 3.1 Crear tipo MachineEvent

**Crear**: `hvac-frontend/src/types/machine-event.ts`

```typescript
export type MachineEventType = "OK" | "DISCONNECTED" | "RECONNECTED";
export interface MachineEvent {
  timestamp: string;
  machineType: string;
  instanceId: string; // stationId
  plantId: string;
  type: MachineEventType;
  previousType?: MachineEventType;
  message: string;
}
```

### 3.2 Crear useMachineConnectivity hook

**Crear**: `hvac-frontend/src/hooks/useMachineConnectivity.ts`

Hook paralelo a `useAhuConnectivity` (NO modificar el existente):

- Key compuesto: `${machineType}-${plantId}-${stationId}`
- Misma logica: `lastSeenRef`, check periodico con `setInterval`, callback `onDisconnected` en transicion
- Razon de no reusar `useAhuConnectivity`: esta acoplado a `HvacTelemetry[]` y la estructura de datos es diferente (`Record<string, MachineTelemetry[]>`)

### 3.3 Crear useMachineEventManagement hook

**Crear**: `hvac-frontend/src/hooks/useMachineEventManagement.ts`

- `machineEvents: MachineEvent[]` (max 100 eventos)
- `handleMachineDisconnection(info)`: crea evento DISCONNECTED
- `handleMachineReconnection(info)`: crea evento RECONNECTED
- Sin sistema de alarmas por threshold (futuro) — solo conectividad

### 3.4 Integrar en WebSocketProvider

**Modificar**: `hvac-frontend/src/providers/WebSocketProvider.tsx`

- Importar y usar `useMachineConnectivity` y `useMachineEventManagement`
- En `handleMachineUpdate`: llamar `machineConnectivity.updateMachineLastSeen()`
- En `handleMachineSnapshot`: inicializar conectividad de todas las instancias
- En `connected === false`: llamar `markAllMachinesDisconnected()`
- Extender `TelemetryContextValue` con:
  - `machineConnectionStatus: Record<string, MachineConnectionStatus>`
  - `isMachineConnected: (machineType, plantId, stationId) => boolean`
  - `machineEvents: MachineEvent[]`

### 3.5 Extender useMachineTelemetry hook

**Modificar**: `hvac-frontend/src/hooks/useMachineTelemetry.ts`

- Agregar `machineConnectionStatus` e `isMachineConnected` al return value

---

## Fase 4: HomeGlobal — Conteo de TODOS los Dispositivos

### 4.1 Actualizar metricas de HomeGlobal

**Modificar**: `hvac-frontend/src/pages/HomeGlobal/HomeGlobal.tsx`

En el `useMemo` de `metrics` (lineas 47-83):

- Sumar instancias de maquinas conectadas al `totalDevices`
- Unificar conteo de plantas (HVAC + maquinas)
- `healthy` = totalDevices - alarms - warnings (alarmas solo HVAC por ahora)
- Obtener `machineConnectionStatus` del contexto

### 4.2 Actualizar SystemStatus

- "Monitoring X devices across Y plants" ahora refleja todos los dispositivos

---

## Fase 5: Machine Designer Form — Preview con MetricCards + cardConfig

### 5.1 Agregar nuevos cardTypes

**Modificar**: `hvac-frontend/src/pages/MachineDesigner/MachineDesignerFormPage.tsx`

- Agregar `"rpm"` y `"current"` al array `CARD_TYPES`

### 5.2 Reemplazar preview con MetricCards reales

- En la seccion Preview (lineas 430-481), usar `renderMetricCard()` en lugar de Cards de texto plano
- Generar valores de preview mas relevantes segun `cardType` (e.g., temperatura entre 15-35°C, RPM entre 1000-3600)

### 5.3 Agregar editor de cardConfig

En `SortableVariableRow`, agregar campos condicionales segun `cardType`:

- `temperature`: inputs para min, max, target
- `rpm`: inputs para min, max, target
- `current`: inputs para min, max, critical
- `filter`: inputs para min, max, critical
- `airflow`: inputs para min, max
- Otros: sin config adicional

Esto requiere:

- Extender `updateVariable` para manejar `cardConfig` como objeto
- Guardar en formato JSON: `{ min: 0, max: 3600, target: 1800 }`

---

## Fase 6: i18n

**Modificar**: `hvac-frontend/src/i18n/translations/en.ts` y `es.ts`

- Agregar traducciones para: nombres de cardTypes (rpm, current), labels de cardConfig (min, max, target, critical), estados de maquina (connected, disconnected, reconnected)
- Agregar seccion `machineEvents` si es necesario

---

## Archivos a Crear (~6)

| Archivo                                                               | Proposito                               |
| --------------------------------------------------------------------- | --------------------------------------- |
| `hvac-frontend/src/components/MetricCards/components/RpmCard.tsx`     | Carta de tacometro RPM                  |
| `hvac-frontend/src/components/MetricCards/components/CurrentCard.tsx` | Carta de medidor de corriente           |
| `hvac-frontend/src/components/MetricCards/renderMetricCard.tsx`       | Utilidad de mapeo cardType → componente |
| `hvac-frontend/src/types/machine-event.ts`                            | Tipo MachineEvent                       |
| `hvac-frontend/src/hooks/useMachineConnectivity.ts`                   | Hook de conectividad para maquinas      |
| `hvac-frontend/src/hooks/useMachineEventManagement.ts`                | Hook de gestion de eventos de maquinas  |

## Archivos a Modificar (~8)

| Archivo                                                               | Cambio                                                      |
| --------------------------------------------------------------------- | ----------------------------------------------------------- |
| `hvac-frontend/src/components/MetricCards/types.ts`                   | Agregar RpmCardProps, CurrentCardProps, extender MetricType |
| `hvac-frontend/src/components/MetricCards/index.ts`                   | Exportar RpmCard, CurrentCard                               |
| `hvac-frontend/src/pages/Machine/MachineDetailPage.tsx`               | Usar renderMetricCard() en lugar de texto plano             |
| `hvac-frontend/src/pages/Machine/MachineDashboardPage.tsx`            | Agregar indicadores de conexion por instancia               |
| `hvac-frontend/src/providers/WebSocketProvider.tsx`                   | Integrar machine connectivity/events                        |
| `hvac-frontend/src/hooks/useMachineTelemetry.ts`                      | Exponer connectionStatus                                    |
| `hvac-frontend/src/pages/HomeGlobal/HomeGlobal.tsx`                   | Contar todos los dispositivos                               |
| `hvac-frontend/src/pages/MachineDesigner/MachineDesignerFormPage.tsx` | Nuevos cardTypes, preview real, editor cardConfig           |
| `hvac-frontend/src/i18n/translations/en.ts`                           | Nuevas traducciones                                         |
| `hvac-frontend/src/i18n/translations/es.ts`                           | Nuevas traducciones                                         |

## Sin cambios en Backend

El backend ya soporta todo lo necesario:

- `MachineVariableEntity.cardType` ya acepta cualquier string
- `MachineVariableEntity.cardConfig` ya es JSON flexible
- `MachineService` ya emite `machine_snapshot`/`machine_update` con timestamps
- La conectividad se trackea client-side (misma arquitectura que HVAC)

---

## Verificacion

1. **Nuevas cartas**: Crear motor con variable RPM (cardType: "rpm"), verificar que muestra tacometro animado en detail page
2. **Carta de temperatura reutilizada**: Motor con variable temperatura (cardType: "temperature") muestra TemperatureCard identico a HVAC
3. **Conectividad**: Publicar datos de motor, dejar de enviar por 60s, verificar que aparece como disconnected
4. **HomeGlobal**: Con HVAC + Motor conectados, verificar que el conteo total incluye ambos tipos
5. **Designer preview**: Abrir form de edicion de motor, activar preview, verificar que muestra MetricCards reales
6. **cardConfig**: Editar variable RPM, definir min=0, max=5000, target=2850, verificar que el tacometro refleja estos limites
7. **HVAC intacto**: Verificar que dashboards HVAC, alarmas, 3D, comandos no se ven afectados
