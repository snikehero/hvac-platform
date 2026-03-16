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
    errorSingular: "error",
    errorPlural: "errores",
    success: "Éxito",
    noData: "Sin datos",
    search: "Buscar",
    filter: "Filtrar",
    all: "Todos",
    apply: "Aplicar",
    reset: "Restablecer",
    and: "y",
    back: "Volver",
    saving: "Guardando...",
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
    analytics: "Analítica",
    kiosk: "Kiosk",
    alarms: "Alarmas",
    settings: "Configuración",
    generalDashboard: "Dashboard General",
    comingSoon: "Próximamente",
    generalSection: "General",
    overview: "Vista General",
    unifiedAlarms: "Alarmas",
  },


  // ===== Time Ago (used by alarms) =====
  activity: {
    secondsAgo: "{seconds}s hace",
    minutesAgoShort: "{minutes}m hace",
    hoursAgoShort: "{hours}h hace",
    daysAgoShort: "{days}d hace",
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

  // ===== Unified Alarms =====
  unifiedAlarms: {
    title: "Sistema de Alarmas Unificado",
    subtitle: "Monitoreo en tiempo real de todos los dispositivos con alarmas y advertencias",
    filterByType: "Filtrar por tipo",
    allTypes: "Todos los Tipos",
    searchPlaceholder: "Buscar dispositivo o planta...",
    noDevicesFound: "Ningún dispositivo coincide con su búsqueda",
    machineType: "Tipo de Máquina",
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
    deviceAlarm: "{machineType} {stationId} en ALARMA",
    deviceWarning: "{machineType} {stationId} en WARNING",
    deviceNormal: "{machineType} {stationId} volvió a NORMAL",
    deviceDisconnected: "{machineType} {stationId} desconectado",
    deviceReconnected: "{machineType} {stationId} reconectado",
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


  // ===== Units =====
  units: {
    celsius: "°C",
    percent: "%",
    rpm: "RPM",
  },

  // ===== Machine Designer =====
  machineDesigner: {
    title: "Machine Designer",
    subtitle: "Define tipos de maquina personalizados con sus variables y layouts de dashboard",
    createNew: "Crear Tipo de Maquina",
    editMachine: "Editar Tipo de Maquina",
    deleteMachine: "Eliminar Tipo de Maquina",
    confirmDelete: "Estas seguro de que quieres eliminar este tipo de maquina? Esta accion no se puede deshacer.",
    name: "Nombre",
    slug: "Slug",
    mqttTopic: "Topic MQTT",
    description: "Descripcion",
    descriptionPlaceholder: "Breve descripcion de este tipo de maquina",
    icon: "Icono",
    variables: "Variables",
    addVariable: "Agregar Variable",
    variableKey: "Clave",
    variableLabel: "Etiqueta",
    variableType: "Tipo de Dato",
    variableUnit: "Unidad",
    cardType: "Tipo de Card",
    color: "Color",
    preview: "Vista Previa del Dashboard",
    showPreview: "Mostrar Vista Previa",
    hidePreview: "Ocultar Vista Previa",
    basicInfo: "Informacion Basica",
    noMachineTypes: "No hay tipos de maquina definidos",
    noMachineTypesDesc: "Crea tu primer tipo de maquina para empezar a monitorear equipo personalizado via MQTT.",
    saved: "Tipo de maquina guardado exitosamente",
    deleted: "Tipo de maquina eliminado exitosamente",
    topicHint: "Usa # para wildcard multi-nivel (ej. motor/#)",
    manage: "Gestionar Tipos",
    requiredFields: "Nombre, slug y topic MQTT son requeridos",
    noVariablesError: "Se requiere al menos una variable",
    noVariablesYet: "No hay variables definidas. Agrega variables que esta maquina enviara via MQTT.",
    invalidVariables: "Todas las variables deben tener clave y etiqueta",
    commands: "Comandos",
    addCommand: "Agregar Comando",
    noCommandsYet: "No hay comandos definidos. Los comandos te permiten enviar instrucciones de control a los dispositivos.",
  },

  // ===== Machine Dashboard =====
  machineDashboard: {
    dashboard: "Dashboard",
    connected: "Conectado",
    disconnected: "Desconectado",
    instances: "instancias",
    noInstances: "No hay instancias conectadas",
    noInstancesDesc: "Esperando mensajes MQTT. Asegurate de que tus dispositivos esten enviando datos.",
    plant: "Planta",
    lastUpdate: "Ultima actualizacion",
    waitingForData: "Esperando datos de esta instancia...",
  },

  // ===== Generic Machine Pages =====
  machinePages: {
    // MachineHomePage
    machineTypeNotFound: "Tipo de máquina no encontrado.",
    systemHealth: "Salud del Sistema",
    avgMetric: "Métrica Promedio",
    connectedCount: "Conectados",
    activeAlerts: "Alertas Activas",
    systemOverview: "Vista General del Sistema",
    operational: "Operativos",
    warnings: "Advertencias",
    critical: "Críticos",
    offline: "Desconectados",
    serverOnline: "Servidor Online",
    serverOffline: "Servidor Offline",
    viewInstances: "Ver todas las instancias y su estado",
    viewAlarms: "Ver alarmas y advertencias activas",
    configureSettings: "Configurar umbrales y notificaciones",
    healthCritical: "CRÍTICO",
    healthDegraded: "DEGRADADO",
    healthHealthy: "SALUDABLE",
    healthNoData: "SIN DATOS",

    // MachineDetailPage
    overview: "Vista General",
    events: "Eventos",
    commands: "Comandos",

    // MachineDashboardPage
    liveMonitoring: "Monitoreo en Vivo",
    total: "Total",
    ok: "OK",
    warning: "Warning",
    alarm: "Alarma",
    noInstancesMatch: "No hay instancias que coincidan con el filtro seleccionado.",
    showAll: "Mostrar todo",
    plant: "Planta",
    alarmSingular: "alarma",
    alarmPlural: "alarmas",
    warningSingular: "advertencia",
    warningPlural: "advertencias",
    on: "ON",
    off: "OFF",

    // MachineAlarmsPage
    back: "Volver",
    alarms: "Alarmas",
    activeAlertCount: "{count} alerta(s) activa(s)",
    noActiveAlarms: "Sin alarmas activas",
    allNormal: "Todas las instancias de {name} están operando normalmente.",
    acknowledge: "Reconocer",
    acknowledged: "Reconocida",
    alarmAcknowledged: "Alarma reconocida: {id}",
    viewDetails: "Ver Detalles",
    badPointSingular: "punto malo",
    badPointPlural: "puntos malos",

    // MachineSettingsPage
    settings: "Configuración",
    configureThresholds: "Configurar umbrales y notificaciones",
    thresholds: "Umbrales",
    notificationsTab: "Notificaciones",
    noThresholdVars: "No hay variables con configuración de umbrales.",
    warningThreshold: "Umbral de Advertencia",
    alarmThreshold: "Umbral de Alarma",
    defaultValue: "Por defecto: {value}",
    notSet: "No configurado",
    resetDefaults: "Restablecer valores predeterminados",
    soundNotifications: "Notificaciones de Sonido",
    enableSound: "Habilitar alertas sonoras",
    volume: "Volumen",
  },

  // ===== Device Event Timeline =====
  deviceTimeline: {
    title: "Línea de Eventos",
    count: "{count} eventos",
    noEvents: "Sin eventos registrados",
    noEventsDesc: "Este dispositivo no tiene eventos recientes.",
  },

  // ===== Generic Commands Panel =====
  commandsPanel: {
    title: "Comandos",
    noCommands: "No hay comandos configurados para este tipo de máquina.",
    sending: "Enviando...",
    success: "Enviado",
    error: "Error",
    timeout: "Timeout",
    on: "ON",
    off: "OFF",
    current: "Actual: {value}",
    setTo: "Establecer {label} en {value}",
    send: "Enviar",
  },

  // ===== Device History Chart =====
  historyChart: {
    noData: "Sin datos disponibles",
    avg: "prom",
  },

  // ===== Executive Dashboard =====
  executiveDashboard: {
    title: "Dashboard Ejecutivo",
    systemStatus: "Estado del Sistema",
    totalUnits: "Unidades Totales",
    operationalCapacity: "Capacidad Operativa",
    affectedUnits: "Unidades Afectadas",
    noCommunication: "Sin Comunicación",
    plantOverview: "Vista por Planta",
    heatMap: "Mapa de Calor",
    systemActivity: "Actividad del Sistema",
    stabilityScore: "Índice de Estabilidad",
    recentEvents: "Eventos Recientes",
    operational: "Operativo",
    clickToFilter: "Click para filtrar",
    allPlants: "Todas las Plantas",
    noEvents: "Sin eventos recientes",
    stable: "ESTABLE",
    degraded: "DEGRADADO",
    unstable: "INESTABLE",
    legend: "Leyenda",
    instances: "instancias",
    alarms: "alarmas",
    warnings: "advertencias",
    disconnected: "desconectados",
    impact: "Impacto",
    noInstances: "No hay instancias conectadas",
    noInstancesDesc: "Esperando datos de telemetría para este tipo de máquina.",
    trend: "Tendencia",
    badPoints: "puntos en error",
  },

} as const;

export type TranslationKeys = typeof es;
