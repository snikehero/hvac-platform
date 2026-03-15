# Plan: Machine Designer V2 — MetricCards, Alarmas y HomeGlobal Unificado (Actualizado con Revisión Arquitectónica)

## Context

La plataforma ya tiene un Machine Designer funcional que permite definir tipos de máquinas con variables MQTT y visualizarlos en dashboards genéricos. Sin embargo:

1. Los dashboards de máquinas usan **texto plano** en lugar de los MetricCards animados que usa HVAC (TemperatureCard, HumidityCard, etc.)
2. No hay **cartas específicas para motores** (RPM, Corriente)
3. No hay **tracking de conectividad/desconexión** para máquinas genéricas (solo HVAC tiene esto)
4. **HomeGlobal solo cuenta dispositivos HVAC** — las máquinas genéricas no contribuyen al conteo global
5. El **preview del Designer** muestra texto plano en lugar de los MetricCards reales
6. No hay **editor de cardConfig** (min, max, target, critical) en el formulario

El objetivo: que un motor definido con `cardType: "temperature"` muestre el mismo TemperatureCard animado que HVAC, que se puedan crear RPMCard y CurrentCard para motores, y que todas las máquinas contribuyan al conteo global.

> **Nota de Arquitectura (PlanAG):** Durante la revisión técnica de este plan, se detectaron áreas de mejora respecto al manejo de eventos y conectividad propuestos originalmente. Rastrear eventos puramente en memoria del cliente genera pérdida de datos al recargar la página e inconsistencia entre múltiples usuarios. Por ello, se ha introducido una **Fase 0** de refactorización para abstraer la conectividad actual, y se ha reestructurado la **Fase 3** para un manejo robusto de los eventos desde el backend.

---

## Fase 0 (NUEVA): Refactorización a un Hook Genérico de Conectividad

> **Comentario PlanAG:** Actualmente existe `useAhuConnectivity`. El plan original proponía duplicar esta lógica en un nuevo `useMachineConnectivity`. Esto viola el principio DRY (Don't Repeat Yourself). La mejor práctica antes de agregar nuevas máquinas es abstraer la funcionalidad de chequeo de conectividad (ping/pong y timeouts) en un hook genérico.

### 0.1 Crear hook unificado de conectividad

**Crear**: `hvac-frontend/src/hooks/useDeviceConnectivity.ts`

- Abstraer lógica de `lastSeenRef`, `setInterval` periódico y verificación de timeout de `useAhuConnectivity`.
- Firma genérica que tome un identificador unívoco (ej. `plantId-stationId` o `machineType-plantId-instanceId`) sin depender de la estructura interna del objeto de telemetría.
- Refactorizar `useAhuConnectivity` para que por dentro simplemente llame a este nuevo hook genérico.

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
- SVG: Tacómetro de medio círculo con aguja animada, zonas de color (verde normal, amarillo alto, rojo crítico)
- Patrón base: seguir la estructura de `DamperCard.tsx` que ya tiene gauge arc + needle
- Defaults: `min=0, max=3600, target=1800`

### 1.3 Crear CurrentCard

**Crear**: `hvac-frontend/src/components/MetricCards/components/CurrentCard.tsx`

- Icono: `Zap` de lucide-react
- SVG: Medidor vertical de amperaje con línea de umbral crítico, flujo de corriente animado
- Patrón base: seguir estructura de `PowerCard.tsx` + `FilterCard.tsx`
- Defaults: `min=0, max=100, critical=80`

### 1.4 Exportar

**Modificar**: `hvac-frontend/src/components/MetricCards/index.ts`

- Agregar exports de `RpmCard` y `CurrentCard`

---

## Fase 2: Renderizador de MetricCards para Machine Dashboard

### 2.1 Crear utilidad renderMetricCard

**Crear**: `hvac-frontend/src/components/MetricCards/renderMetricCard.tsx`

Función que mapea `cardType` string → componente correcto:

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
- Para "gauge": mapear a RpmCard (reusar tacómetro)
- Mapear colores `"chart-1".."chart-5"` → `"chart"` para compatibilidad con MetricCardBase

### 2.2 Actualizar MachineDetailPage con MetricCards reales

**Modificar**: `hvac-frontend/src/pages/Machine/MachineDetailPage.tsx`

- Reemplazar las Cards de texto plano con `renderMetricCard()`
- Eliminar objetos `colorMap` y `textColorMap` inline (MetricCardBase maneja colores)
- Mantener header, back button, connection info sin cambios

### 2.3 Actualizar MachineDashboardPage

**Modificar**: `hvac-frontend/src/pages/Machine/MachineDashboardPage.tsx`

- Mantener como summary cards compactas
- Agregar indicador visual de estado de conexión por instancia (dot verde/rojo)
- Agregar badge de tiempo desde último update

---

## Fase 3: Tracking de Conectividad y Eventos para Máquinas Genéricas (MODIFICADA)

> **Comentario PlanAG:** La retención de un arreglo `MachineEvent[]` en memoria del frontend desaparece al cerrar la pestaña. Además, asumir desconexión solo porque el frontend dejó de recibir websockets generaría falsas alarmas si es solo el cliente quien perdió internet. Lo correcto y robusto (Server-Side Driven) es que el servidor centralice y evalúe la telemetría, y sea el único encargado de decretar que una máquina murió y guardarlo físicamente.

### 3.1 Seguimiento y Eventos en el Backend

**Modificar**: `hvac-platform/backend/src/machine/machine.service.ts`

- Implementar un cronjob o `setInterval` interno en el backend que recorra el `state` en memoria.
- Si `Date.now() - instance.lastUpdate` > Threshold, el backend decreta la desconexión.
- Despachar evento WebSocket (`machine_event`) a los clientes desde el gateway.
- *(Opcional pero muy recomendado)*: Guardar el evento en Base de Datos usando una nueva entidad `MachineEventEntity`.

### 3.2 Consumo de Eventos en el Frontend

**Modificar**: `hvac-frontend/src/providers/WebSocketProvider.tsx`

- En vez de un `useMachineEventManagement` con timeouts en el cliente, el cliente simplemente se suscribe a `socket.on('machine_event', ...)` y acopla este evento a un feed de alarmas visual o toast global (`sonner`).

### 3.3 Integración de Conectividad en UI

**Crear/Modificar**: `hvac-frontend/src/hooks/useMachineTelemetry.ts`
- Utilizar el `useDeviceConnectivity` genérico creado en la **Fase 0** para pintar localmente si está online/offline en base a la última trama recibida, pero delegando la *generación de alarmas críticas* al servidor.

---

## Fase 4: HomeGlobal — Conteo de TODOS los Dispositivos

### 4.1 Actualizar métricas de HomeGlobal

**Modificar**: `hvac-frontend/src/pages/HomeGlobal/HomeGlobal.tsx`

- Sumar instancias de máquinas conectadas al `totalDevices`
- Unificar conteo de plantas (HVAC + máquinas)
- `healthy` = totalDevices - alarms - warnings
- Obtener `machineConnectionStatus` del contexto expandido

### 4.2 Actualizar SystemStatus

- "Monitoring X devices across Y plants" ahora refleja todos los dispositivos (HVAC y genéricos).

---

## Fase 5: Machine Designer Form — Preview con MetricCards + cardConfig (REFINADA)

> **Comentario PlanAG:** El plan original proponía que el usuario escribiera manualmente un JSON en el formulario de la variable para configurar el `cardConfig`. Esto es muy propenso a errores. En su lugar, sugerimos inyectar dinámicamente campos nativos.

### 5.1 Agregar nuevos cardTypes

**Modificar**: `hvac-frontend/src/pages/MachineDesigner/MachineDesignerFormPage.tsx`

- Agregar `"rpm"` y `"current"` al array `CARD_TYPES`

### 5.2 Reemplazar preview con MetricCards reales

- Utilizar `renderMetricCard()` en lugar de Cards de texto plano en la vista previa del diseñador.
- Generar valores de simulación realistas según `cardType`.

### 5.3 Editor UI Dinámico para `cardConfig`

En `SortableVariableRow`, en lugar de un `textarea` de JSON, renderizar `Input` nativos de manera condicional según el `cardType` seleccionado:

- `temperature`: `<Input type="number" placeholder="Min" />`, Max, Target
- `rpm`: `<Input type="number" placeholder="Min" />`, Max, Target
- `current`: `<Input type="number" placeholder="Min" />`, Max, Critical
- Al guardar o hacer "submit", el formulario consolidará esos campos independientes en un payload estructurado `cardConfig: { min, max, target }`, serializándolo para el API sin que el usuario toque código JSON crudo.

---

## Fase 6: i18n

**Modificar**: `hvac-frontend/src/i18n/translations/en.ts` y `es.ts`

- Agregar traducciones para: nombres de cardTypes (rpm, current), labels de config (Min, Max, Target, Critical), estados de máquina.

---

## Archivos a Crear / Modificar (CONSOLIDADO)

### Archivos Nuevos (~5)

| Archivo | Propósito |
|---------|-----------|
| `hvac-frontend/src/hooks/useDeviceConnectivity.ts` | **(NUEVO - Fase 0)** Hook unificado para reusar lógica de online/offline tanto en HVAC como Machines. |
| `hvac-frontend/src/components/MetricCards/components/RpmCard.tsx`     | Carta de tacómetro RPM (Fase 1) |
| `hvac-frontend/src/components/MetricCards/components/CurrentCard.tsx` | Carta de medidor de corriente (Fase 1) |
| `hvac-frontend/src/components/MetricCards/renderMetricCard.tsx`       | Utilidad de mapeo cardType → componente (Fase 2) |
| `hvac-frontend/src/types/machine-event.ts`                            | Tipos de eventos (Fase 3) |

### Archivos a Modificar (~9)

| Archivo | Cambio |
|----------|---------|
| `hvac-frontend/src/hooks/useAhuConnectivity.ts` | **(Fase 0)** Refactorizar para delegar al hook unificado. |
| `backend/src/machine/machine.service.ts` | **(Fase 3)** Añadir validación de timeouts en el backend y emitir `machine_event`. |
| `hvac-frontend/src/components/MetricCards/types.ts` | **(Fase 1)** Agregar `RpmCardProps`, `CurrentCardProps`, etc. |
| `hvac-frontend/src/components/MetricCards/index.ts` | **(Fase 1)** Exportar barriles nuevos. |
| `hvac-frontend/src/pages/Machine/MachineDetailPage.tsx` | **(Fase 2)** Usar `renderMetricCard()`. |
| `hvac-frontend/src/pages/Machine/MachineDashboardPage.tsx` | **(Fase 2)** Indicadores de conexión de instancia. |
| `hvac-frontend/src/providers/WebSocketProvider.tsx` | **(Fase 3)** Consumir eventos del server. |
| `hvac-frontend/src/pages/HomeGlobal/HomeGlobal.tsx` | **(Fase 4)** Contar todos los dispositivos (+máquinas). |
| `hvac-frontend/src/pages/MachineDesigner/MachineDesignerFormPage.tsx` | **(Fase 5)** Preview visual y UI de inputs numéricos en lugar de texto plano JSON. |
| `hvac-frontend/src/i18n/translations/*.ts` | **(Fase 6)** Traducciones ES y EN. |

---

## Verificación

1. **Test de Conectividad Unificado (Fase 0):** Verificar que el dashboard HVAC sigue pintando correctamente equipos caídos luego del refactor a `useDeviceConnectivity`.
2. **Nuevas cartas (Fase 1):** Crear motor con variable RPM, verificar que muestra tacómetro animado en detail page.
3. **Eventos Server-Side (Fase 3):** Simular desconexión deteniendo el publicador MQTT. El **backend** debe detectar el timeout y avisar al frontend. Recargar la página (F5) no debería ocultar el estado caído (ya sea por snapshot general de telemetría o registro en base de datos).
4. **HomeGlobal (Fase 4):** Con HVAC + Motor conectados, verificar que el conteo de la izquierda incluye todos.
5. **cardConfig UI (Fase 5):** Seleccionar "RPM" en Form de Máquina, llenar casillas numéricas "Min/Max/Target", guardar, refrescar y verificar que se haya serializado correctamente el esquema y que la gauge muestre las zonas de color en esos límites.
