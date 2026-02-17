export const es = {
  // ===== Common / Shared =====
  common: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    close: "Cerrar",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    noData: "Sin datos",
    search: "Buscar",
    filter: "Filtrar",
    all: "Todos",
    apply: "Aplicar",
    reset: "Restablecer",
    and: "y",
  },

  // ===== Status =====
  status: {
    ok: "OK",
    warning: "WARNING",
    alarm: "ALARM",
    disconnected: "DISCONNECTED",
    optimal: "Óptimo",
    degraded: "Degradado",
    critical: "Crítico",
    noData: "Sin Datos",
  },

  // ===== Navigation =====
  nav: {
    home: "Inicio",
    dashboard: "Dashboard",
    executive: "Dashboard Ejecutivo",
    alarms: "Alarmas",
    settings: "Configuración",
    ahuDetail: "Detalle AHU",
    homeHvac: "Home HVAC",
    generalDashboard: "Dashboard General",
    activeHvac: "HVAC Activos",
    comingSoon: "Próximamente",
  },

  // ===== Hero System Status =====
  heroSystem: {
    systemOptimal: "Sistema Óptimo",
    systemDegraded: "Sistema Degradado",
    systemCritical: "Sistema Crítico",
    noData: "Sin Datos",
    allUnitsOperating: "Todas las unidades operando normalmente",
    someUnitsAttention: "Algunas unidades requieren atención",
    immediateAction: "Acción inmediata requerida",
    waitingTelemetry: "Esperando telemetría",
    totalUnits: "Unidades Totales",
    alarms: "Alarmas",
    warnings: "Advertencias",
    operational: "Operacionales",
    systemHealthDistribution: "Distribución de Salud del Sistema",
  },

  // ===== Dashboard Widgets =====
  widgets: {
    alarmsActive: "Alarmas Activas",
    warningsActive: "Advertencias Activas",
    disconnectedUnits: "Unidades Desconectadas",
    operationalCapacity: "Capacidad Operacional",
    avgTemperature: "Temperatura Promedio",
    avgHumidity: "Humedad Promedia",
    clickToFilter: "Click para filtrar",
    unitsWithAlarms: "unidades con alarmas",
    unitsWithWarnings: "unidades con advertencias",
    unitsDisconnected: "unidades desconectadas",
    unitsOperational: "unidades operacionales",
    overallAvg: "Promedio general",
    systemWide: "del sistema",
    unitsAffected: "Unidades Afectadas",
    noCommunication: "Sin Comunicación",
    offlineUnits: "Unidades fuera de línea",
    impact: "Impacto",
  },

  // ===== Plant Panel =====
  plantPanel: {
    plantOverview: "Vista por Planta",
    statusByPlant: "Estado y distribución por planta",
    plant: "Planta",
    units: "unidades",
    operational: "Operacional",
    viewDetails: "Ver Detalles",
  },

  // ===== System Activity =====
  activity: {
    recentActivity: "Actividad Reciente del Sistema",
    systemActivity: "Actividad del Sistema",
    last10Events: "Últimos 10 eventos registrados",
    statusChange: "Cambio de estado",
    now: "ahora",
    minuteAgo: "hace 1 minuto",
    minutesAgo: "hace {minutes} minutos",
    hourAgo: "hace 1 hora",
    hoursAgo: "hace {hours} horas",
    noRecentActivity: "Sin actividad reciente",
    stable: "Estable",
    degraded: "Degradado",
    unstable: "Inestable",
    critical5min: "Críticos (5min)",
    disconnects5min: "Desconexiones (5min)",
    lastEvent: "Último Evento",
    stabilityScore: "Score de Estabilidad",
    ago: "hace",
    secondsAgo: "{seconds}s hace",
    minutesAgoShort: "{minutes}m hace",
    hoursAgoShort: "{hours}h hace",
    daysAgoShort: "{days}d hace",
    noEvents: "Sin eventos",
    recentEvents: "Eventos Recientes",
    moreEvents: "más eventos",
    noRecentEvents: "Sin eventos recientes",
  },

  // ===== Dashboard Page =====
  dashboardPage: {
    title: "Dashboard Overview",
    subtitle: "Vista ejecutiva del estado global del sistema HVAC",
    filterByPlant: "Planta",
    filterByStatus: "Estado",
    allPlants: "Todas las plantas",
    allStatuses: "Todos los estados",
    noAhusMatch: "No hay AHUs que coincidan con los filtros",
  },

  // ===== AHU Card =====
  ahuCard: {
    temperature: "Temperatura",
    humidity: "Humedad",
    speed: "Velocidad",
    lastUpdate: "Última actualización",
    clickForDetails: "Click para ver detalles",
    plant: "Planta",
    errors: "errores",
    error: "error",
    fan: "Ventilador",
    avg60s: "Promedio (60s)",
    additionalData: "Datos Adicionales",
    moreData: "más datos",
  },

  // ===== Alarms Page =====
  alarmsPage: {
    title: "Sistema de Alarmas",
    subtitle: "Monitoreo en tiempo real de unidades HVAC con alarmas y advertencias",
    activeAlarms: "Alarmas Activas",
    activeWarnings: "Advertencias Activas",
    resolvedToday: "Resueltas Hoy",
    avgResolutionTime: "Tiempo Promedio de Resolución",
    allAlarms: "Todas las Alarmas",
    active: "Activas",
    resolved: "Resueltas",
    noActiveAlarms: "No hay alarmas activas",
    noActiveWarnings: "No hay advertencias activas",
    noResolvedAlarms: "No hay alarmas resueltas hoy",
    criticalAlarms: "Alarmas Críticas",
    requiresImmediate: "Requieren atención inmediata",
    warnings: "Advertencias",
    preventiveMonitoring: "Monitoreo preventivo",
    criticality: "Criticidad",
    impact: "Impacto",
    all: "Todos",
    alarms: "Alarmas",
    warningsLabel: "Warnings",
    searchPlaceholder: "Buscar AHU o planta...",
    temp: "Temp",
    humidity: "Humedad",
    updated: "Actualizado",
    clickDetails: "Click para ver detalles →",
    noAlarmsFound: "No se encontraron AHUs que coincidan con tu búsqueda",
    allSystemsNormal: "Todos los sistemas están operando normalmente",
    acknowledged: "Reconocidas",
    ackButton: "Reconocer",
    noAcknowledged: "No hay alarmas reconocidas",
    ackStamp: "Reconocida por {name} · {time}",
    ackToast: "Alarma reconocida por {name}",
    detailedAnalysis: "Análisis detallado de métricas",
    plant: "Planta",
    lastUpdate: "Última actualización",
    errorPoints: "Puntos en error",
    connectionStatus: "Estado de conexión",
    connected: "Conectado",
  },

  // ===== Settings Page =====
  settings: {
    title: "Configuración",
    subtitle: "Administra los umbrales de alarma, notificaciones y preferencias generales de la plataforma HVAC.",

    // Tabs
    tabs: {
      thresholds: "Umbrales",
      notifications: "Notificaciones",
      general: "General",
    },

    // Thresholds
    thresholds: {
      temperature: "Umbrales de Temperatura",
      temperatureDesc: "Define los límites que disparan advertencias y alarmas por temperatura.",
      humidity: "Umbrales de Humedad",
      humidityDesc: "Define los límites que disparan advertencias y alarmas por humedad relativa.",
      disconnection: "Tiempo de Desconexión",
      disconnectionDesc: "Tiempo sin recibir datos antes de marcar un AHU como desconectado.",

      warning: "Advertencia (WARNING)",
      alarm: "Alarma (ALARM)",
      warningDesc: "Se activa cuando {metric} supera este valor",
      alarmDesc: "Se activa cuando {metric} supera este valor",

      timeout: "Timeout (segundos)",
      currentValue: "Valor actual:",

      errorWarningAlarm: "El umbral de advertencia debe ser menor al de alarma.",
    },

    // Notifications
    notifications: {
      alarmSound: "Sonido de Alarma",
      alarmSoundDesc: "Configura las alertas sonoras cuando un AHU entra en estado de alarma.",
      soundEnabled: "Sonido habilitado",
      soundEnabledDesc: "Reproduce un sonido al detectar una nueva alarma.",
      volume: "Volumen",
      testSound: "Probar sonido",
      testSoundDesc: "Reproduce el sonido de alarma con el volumen configurado.",
      play: "Reproducir",
    },

    // General
    general: {
      preferences: "Preferencias Generales",
      preferencesDesc: "Ajustes de idioma y comportamiento general de la plataforma.",
      language: "Idioma",
      languageDesc: "Idioma preferido para la interfaz.",
      refreshInterval: "Intervalo de refresco",
      refreshIntervalDesc: "Frecuencia de actualización de datos en el dashboard.",
      realTime: "tiempo real",
      lowConsumption: "bajo consumo",
      operatorName: "Nombre del Operador",
      operatorNameDesc: "Nombre o iniciales que aparecen al reconocer alarmas.",
      operatorNamePlaceholder: "ej. Juan D.",
    },

    // Actions
    resetDefaults: "Restablecer valores por defecto",
    unsavedChanges: "Cambios sin guardar",
    saveChanges: "Guardar cambios",

    // Toasts
    toast: {
      saved: "Configuración guardada correctamente",
      reset: "Configuración restablecida a valores por defecto",
    },

    // Dashboard layout
    dashboard: {
      tabLabel: "Dashboard",
      layoutTitle: "Diseño del Dashboard",
      layoutDesc: "Activa o desactiva secciones y arrástralas para reordenarlas.",
      widgetLabels: {
        "hero-system-status": "Banner de Estado del Sistema",
        "plant-activity-block": "Vista por Planta y Actividad",
        "kpi-widgets": "Widgets KPI",
        "plant-heat-map": "Mapa de Calor por Planta",
      },
      visibleLabel: "Visible",
      dragHint: "Arrastra las filas para reordenar",
    },
  },

  // ===== AHU Detail Content =====
  ahuDetail: {
    ahuNotFound: "AHU no encontrado",
    unitNotExist: "La unidad solicitada no existe o está desconectada",
    goBack: "Volver",
  },

// ====== AHU Detail View =====
ahuDetailView: {
  ahuNotFound: "AHU no encontrado",
  goBack: "Volver",

  // Mensaje not found (placeholders)
  notAvailableMessage: "El equipo {ahuId} en planta {plantId} no está disponible.",

  // Header
  plantLabel: "Planta {plantId}",
  updatedAgo: "hace {value}",
  badPointsShort: "{count} BAD",

  // General formatting
  valueWithUnit: "{value}{unit}",

  // Quick stats
  quickStats: {
    status: "Estado",
    temperature: "Temperatura",
    humidity: "Humedad",
    fan: "Ventilador",
  },

  // Fan labels
  fan: {
    onLabel: "Encendido",
    offLabel: "Apagado",
    on: "ON",
    off: "OFF",
  },

  // 3D viewer
  viewer3d: {
    title: "Visualización 3D",
    fanActive: "Fan activo",
    fanInactive: "Fan inactivo",
  },

  // Technical panel
  technical: {
    title: "Información Técnica",
    operationalStatus: "Estado operativo",
    badPoints: "Puntos BAD",
    extraSensors: "Sensores adicionales",
  },
},
ahuDetailPage: {
  backToDashboard: "Volver al Dashboard",
  plantLabel: "Planta {plantId}",

  badPointsOutOfRange: "{count} punto{suffix} fuera de rango",
  lastUpdate: "Última actualización: {value}",
  eventsLogged: "{count} evento{suffix} registrado{suffix2}",

  tabs: {
    overview: "Resumen",
    events: "Eventos",
  },

  sections: {
    environmental: "Condiciones Ambientales",
    airMovement: "Movimiento de Aire",
    energyFiltration: "Energía y Filtración",
    additionalData: "Datos Adicionales",
  },

  metrics: {
    temperature: "Temperatura",
    humidity: "Humedad",
    fanStatus: "Estado del Ventilador",
    airflow: "Flujo de Aire",
    damperPosition: "Posición del Damper",
    powerStatus: "Estado de Energía",
    filterDp: "ΔP del Filtro",
  },

  charts: {
    temperatureHistory: "Histórico de Temperatura",
    humidityHistory: "Histórico de Humedad",
  },

  events: {
    noEventsTitle: "Sin eventos registrados",
    noEventsDesc: "Esta unidad no tiene eventos recientes o alarmas",
    timelineTitle: "Línea de tiempo de eventos",
    eventTypeLabel: "{type}",
  },

  statusLabels: {
    alarm: "Alarma crítica activa",
    warning: "Advertencias detectadas",
    ok: "Operación normal",
    disconnected: "Sin comunicación",
  },

  units: {
    airflowFallback: "m³/h",
    filterDpFallback: "Pa",
  },
},

eventMessages: {
  enteredAlarm: "Unidad entró en ALARMA",
  warningCondition: "Unidad en condición de ADVERTENCIA",
  communicationRestored: "Unidad restableció comunicación",
  backToNormal: "Unidad volvió a estado NORMAL",
  communicationLost: "Unidad perdió comunicación",
  statusChange: "Cambio de estado: {previous} → {current}",
},



  // ===== Home Page HVAC =====
  homePageHvac: {
    hvacModule: "Módulo HVAC",
    airHandling: "Manejo de Aire",
    control: "Control",
    subtitle: "Monitoreo y diagnósticos en tiempo real para unidades de manejo de aire en su instalación",
    serverOnline: "SERVIDOR EN LÍNEA",
    serverOffline: "SERVIDOR FUERA DE LÍNEA",
    telemetryActive: "Telemetría en tiempo real activa",
    reconnecting: "Intentando reconectar...",
    connected: "Conectado",
    disconnected: "Desconectado",
    critical: "Crítico",
    degraded: "Degradado",
    healthy: "Saludable",
    noData: "Sin Datos",
    systemHealth: "Salud del Sistema",
    connectedAhus: "AHUs Conectados",
    units: "unidades",
    avgTemperature: "Temp Promedio",
    criticalAlarms: "Alarmas Críticas",
    active: "activas",
    systemOverview: "Vista General del Sistema",
    operational: "Operacionales",
    warnings: "Advertencias",
    criticalLabel: "Críticos",
    ofUnits: "{value} de {total} unidades",
    quick: "Acciones",
    actions: "Rápidas",
    dashboard: "Dashboard",
    viewAllAhus: "Ver todos los AHUs",
    alarms: "Alarmas",
    activeAlerts: "Alertas activas",
    temperature: "Temperatura",
    thermalMonitoring: "Monitoreo térmico",
    analytics: "Análisis",
    systemInsights: "Conocimientos del sistema",
    open: "Abrir",
  },

  // ===== Dashboard HVAC =====
  dashboardHvac: {
    liveMonitoring: "Monitoreo en Vivo",
    hvac: "HVAC",
    dashboard: "Dashboard",
    subtitle: "Estado en tiempo real de unidades de manejo de aire en todas las instalaciones",
    totalUnits: "Unidades Totales",
    operational: "Operacionales",
    warnings: "Advertencias",
    critical: "Críticos",
    filteringBy: "Filtrando por:",
    clear: "Limpiar",
    noConnectedAhus: "No se encontraron AHUs conectados",
    noAhusWithStatus: "No hay AHUs con estado \"{status}\"",
    plant: "Planta",
    unitActive: "unidad activa",
    unitsActive: "unidades activas",
    ok: "OK",
    warn: "ADVERT",
    alarm: "ALARMA",
  },

  // ===== Home Global =====
  homeGlobal: {
    platformBadge: "Plataforma IoT Industrial",
    heroTitle: "Fire",
    heroSubtitle: "Plataforma de monitoreo industrial de próxima generación que ofrece",
    realtimeTelemetry: "telemetría en tiempo real",
    predictiveInsights: "información predictiva",
    modularScalability: "escalabilidad modular",
    acrossOperation: "en toda tu operación.",
    enterHvacModule: "Ingresar al Módulo HVAC",
    viewLiveSystems: "Ver Sistemas en Vivo",
    connected: "Conectados",
    devices: "dispositivos",
    activePlants: "Plantas Activas",
    sites: "sitios",
    healthy: "Saludables",
    units: "unidades",
    warnings: "Advertencias",
    active: "activas",
    critical: "Críticos",
    alarms: "alarmas",
    avgTemp: "Temp Promedio",
    systemStatus: "Estado del Sistema:",
    online: "EN LÍNEA",
    offline: "FUERA DE LÍNEA",
    monitoringDevices: "Monitoreando {devices} dispositivos en {plants} planta",
    monitoringDevicesPlural: "Monitoreando {devices} dispositivos en {plants} plantas",
    reconnecting: "Intentando reconectar al servidor de telemetría...",
    operational: "Operacionales",
    warningsLabel: "Advertencias",
    criticalLabel: "Críticos",
    available: "Disponibles",
    modules: "Módulos",
    hvacControl: "Control HVAC",
    hvacControlDesc: "Monitoreo de unidades de manejo de aire en tiempo real, diagnósticos y mantenimiento predictivo.",
    statusActive: "ACTIVO",
    energyManagement: "Gestión de Energía",
    energyManagementDesc: "Seguimiento del consumo de energía, algoritmos de optimización y análisis de costos.",
    statusComingSoon: "PRÓXIMAMENTE",
    processControl: "Control de Procesos",
    processControlDesc: "Automatización industrial, integración PLC y optimización de procesos en tiempo real.",
    devicesLabel: "Dispositivos",
    uptime: "Tiempo Activo",
    enterModule: "Ingresar al Módulo",
    footerMonitoring: "Monitoreo Industrial y Telemetría",
  },

  // ===== Notifications =====
  notifications: {
    ahuAlarm: "AHU {stationId} en ALARMA",
    ahuWarning: "AHU {stationId} en WARNING",
    ahuNormal: "AHU {stationId} volvió a NORMAL",
    ahuDisconnected: "AHU {stationId} desconectado",
    ahuReconnected: "AHU {stationId} reconectado",
    plant: "Planta {plantId}",
    noDataTimeout: "Sin datos por más de {minutes} minutos",
  },

  // ===== Time Units =====
  time: {
    seconds: "segundos",
    minutes: "minutos",
    hours: "horas",
    days: "días",
    min: "min",
    sec: "s",
  },

  // ===== WebSocket =====
  websocket: {
    connected: "Conectado al servidor",
    disconnected: "Desconectado del servidor",
    disconnectReason: "Razón: {reason}. Reconectando...",
  },

  // ===== Header =====
  header: {
    controlCenter: "Centro de Control",
    online: "EN LÍNEA",
    offline: "FUERA DE LÍNEA",
  },

  // ===== Charts =====
  charts: {
    noData: "Sin datos",
    noHistoricalData: "Sin datos históricos",
    temperature: "Temperatura",
    humidity: "Humedad",
    avgSuffix: "avg",
  },

  // ===== Plant Heat Map =====
  plantHeatMap: {
    title: "Mapa de Calor por Planta",
    legend: "Leyenda",
  },

  // ===== Plant Health Panel =====
  plantHealth: {
    plant: "Planta",
    ahus: "AHUs",
    alarms: "Alarmas",
    warnings: "Advertencias",
    disconnected: "Desconectados",
  },

  // ===== Units =====
  units: {
    celsius: "°C",
    percent: "%",
    rpm: "RPM",
  },



  
} as const;

export type TranslationKeys = typeof es;
