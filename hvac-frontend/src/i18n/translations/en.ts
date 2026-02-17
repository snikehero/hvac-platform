export const en = {
  // ===== Common / Shared =====
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    noData: "No Data",
    search: "Search",
    filter: "Filter",
    all: "All",
    apply: "Apply",
    reset: "Reset",
    and: "and",
  },

  // ===== Status =====
  status: {
    ok: "OK",
    warning: "WARNING",
    alarm: "ALARM",
    disconnected: "DISCONNECTED",
    optimal: "Optimal",
    degraded: "Degraded",
    critical: "Critical",
    noData: "No Data",
  },

  // ===== Navigation =====
  nav: {
    home: "Home",
    dashboard: "Dashboard",
    executive: "Executive Dashboard",
    alarms: "Alarms",
    settings: "Settings",
    ahuDetail: "AHU Detail",
    homeHvac: "HVAC Home",
    generalDashboard: "General Dashboard",
    activeHvac: "Active HVAC",
    comingSoon: "Coming Soon",
  },

  // ===== Hero System Status =====
  heroSystem: {
    systemOptimal: "System Optimal",
    systemDegraded: "System Degraded",
    systemCritical: "System Critical",
    noData: "No Data",
    allUnitsOperating: "All units operating normally",
    someUnitsAttention: "Some units require attention",
    immediateAction: "Immediate action required",
    waitingTelemetry: "Waiting for telemetry",
    totalUnits: "Total Units",
    alarms: "Alarms",
    warnings: "Warnings",
    operational: "Operational",
    systemHealthDistribution: "System Health Distribution",
  },

  // ===== Dashboard Widgets =====
  widgets: {
    alarmsActive: "Active Alarms",
    warningsActive: "Active Warnings",
    disconnectedUnits: "Disconnected Units",
    operationalCapacity: "Operational Capacity",
    avgTemperature: "Average Temperature",
    avgHumidity: "Average Humidity",
    clickToFilter: "Click to filter",
    unitsWithAlarms: "units with alarms",
    unitsWithWarnings: "units with warnings",
    unitsDisconnected: "units disconnected",
    unitsOperational: "units operational",
    overallAvg: "Overall average",
    systemWide: "system-wide",
    unitsAffected: "Units Affected",
    noCommunication: "No Communication",
    offlineUnits: "Offline Units",
    impact: "Impact",
  },

  // ===== Plant Panel =====
  plantPanel: {
    plantOverview: "Plant Overview",
    statusByPlant: "Status and distribution by plant",
    plant: "Plant",
    units: "units",
    operational: "Operational",
    viewDetails: "View Details",
  },

  // ===== System Activity =====
  activity: {
    recentActivity: "Recent System Activity",
    systemActivity: "System Activity",
    last10Events: "Last 10 recorded events",
    statusChange: "Status change",
    now: "now",
    minuteAgo: "1 minute ago",
    minutesAgo: "{minutes} minutes ago",
    hourAgo: "1 hour ago",
    hoursAgo: "{hours} hours ago",
    noRecentActivity: "No recent activity",
    stable: "Stable",
    degraded: "Degraded",
    unstable: "Unstable",
    critical5min: "Critical (5min)",
    disconnects5min: "Disconnects (5min)",
    lastEvent: "Last Event",
    stabilityScore: "Stability Score",
    ago: "ago",
    secondsAgo: "{seconds}s ago",
    minutesAgoShort: "{minutes}m ago",
    hoursAgoShort: "{hours}h ago",
    daysAgoShort: "{days}d ago",
    noEvents: "No events",
    recentEvents: "Recent Events",
    moreEvents: "more events",
    noRecentEvents: "No recent events",
  },

  // ===== Dashboard Page =====
  dashboardPage: {
    title: "Dashboard Overview",
    subtitle: "Executive overview of the global HVAC system status",
    filterByPlant: "Plant",
    filterByStatus: "Status",
    allPlants: "All plants",
    allStatuses: "All statuses",
    noAhusMatch: "No AHUs match the current filters",
  },

  // ===== AHU Card =====
  ahuCard: {
    temperature: "Temperature",
    humidity: "Humidity",
    speed: "Speed",
    lastUpdate: "Last update",
    clickForDetails: "Click for details",
    plant: "Plant",
    errors: "errors",
    error: "error",
    fan: "Fan",
    avg60s: "Avg (60s)",
    additionalData: "Additional Data",
    moreData: "more data",
  },

  // ===== Alarms Page =====
  alarmsPage: {
    title: "Alarm System",
    subtitle: "Real-time monitoring of HVAC units with alarms and warnings",
    activeAlarms: "Active Alarms",
    activeWarnings: "Active Warnings",
    resolvedToday: "Resolved Today",
    avgResolutionTime: "Avg Resolution Time",
    allAlarms: "All Alarms",
    active: "Active",
    resolved: "Resolved",
    noActiveAlarms: "No active alarms",
    noActiveWarnings: "No active warnings",
    noResolvedAlarms: "No alarms resolved today",
    criticalAlarms: "Critical Alarms",
    requiresImmediate: "Require immediate attention",
    warnings: "Warnings",
    preventiveMonitoring: "Preventive monitoring",
    criticality: "Criticality",
    impact: "Impact",
    all: "All",
    alarms: "Alarms",
    warningsLabel: "Warnings",
    searchPlaceholder: "Search AHU or plant...",
    temp: "Temp",
    humidity: "Humidity",
    updated: "Updated",
    clickDetails: "Click for details →",
    noAlarmsFound: "No AHUs match your search",
    allSystemsNormal: "All systems are operating normally",
    detailedAnalysis: "Detailed metrics analysis",
    plant: "Plant",
    lastUpdate: "Last update",
    errorPoints: "Error points",
    connectionStatus: "Connection status",
    connected: "Connected",
  },

  // ===== Settings Page =====
  settings: {
    title: "Settings",
    subtitle: "Manage alarm thresholds, notifications, and general preferences for the HVAC platform.",

    // Tabs
    tabs: {
      thresholds: "Thresholds",
      notifications: "Notifications",
      general: "General",
    },

    // Thresholds
    thresholds: {
      temperature: "Temperature Thresholds",
      temperatureDesc: "Define the limits that trigger warnings and alarms for temperature.",
      humidity: "Humidity Thresholds",
      humidityDesc: "Define the limits that trigger warnings and alarms for relative humidity.",
      disconnection: "Disconnection Timeout",
      disconnectionDesc: "Time without receiving data before marking an AHU as disconnected.",

      warning: "Warning (WARNING)",
      alarm: "Alarm (ALARM)",
      warningDesc: "Triggered when {metric} exceeds this value",
      alarmDesc: "Triggered when {metric} exceeds this value",

      timeout: "Timeout (seconds)",
      currentValue: "Current value:",

      errorWarningAlarm: "The warning threshold must be lower than the alarm threshold.",
    },

    // Notifications
    notifications: {
      alarmSound: "Alarm Sound",
      alarmSoundDesc: "Configure sound alerts when an AHU enters alarm state.",
      soundEnabled: "Sound enabled",
      soundEnabledDesc: "Play a sound when a new alarm is detected.",
      volume: "Volume",
      testSound: "Test sound",
      testSoundDesc: "Play the alarm sound with the configured volume.",
      play: "Play",
    },

    // General
    general: {
      preferences: "General Preferences",
      preferencesDesc: "Language settings and general platform behavior.",
      language: "Language",
      languageDesc: "Preferred language for the interface.",
      refreshInterval: "Refresh interval",
      refreshIntervalDesc: "Dashboard data refresh frequency.",
      realTime: "real-time",
      lowConsumption: "low consumption",
    },

    // Actions
    resetDefaults: "Reset to default values",
    unsavedChanges: "Unsaved changes",
    saveChanges: "Save changes",

    // Toasts
    toast: {
      saved: "Settings saved successfully",
      reset: "Settings reset to default values",
    },

    // Dashboard layout
    dashboard: {
      tabLabel: "Dashboard",
      layoutTitle: "Dashboard Layout",
      layoutDesc: "Toggle visibility and drag to reorder the dashboard sections.",
      widgetLabels: {
        "hero-system-status": "System Status Banner",
        "plant-activity-block": "Plant Overview & Activity",
        "kpi-widgets": "KPI Widgets",
      },
      visibleLabel: "Visible",
      dragHint: "Drag rows to reorder",
    },
  },

  // ===== AHU Detail Content =====
  ahuDetail: {
    ahuNotFound: "AHU not found",
    unitNotExist: "The requested unit does not exist or is disconnected",
    goBack: "Go Back",
  },

  // ====== AHU Detail View =====
  ahuDetailView: {
    ahuNotFound: "AHU not found",
    goBack: "Go Back",

    notAvailableMessage: "Unit {ahuId} in plant {plantId} is unavailable.",

    plantLabel: "Plant {plantId}",
    updatedAgo: "{value} ago",
    badPointsShort: "{count} BAD",

    valueWithUnit: "{value}{unit}",

    quickStats: {
      status: "Status",
      temperature: "Temperature",
      humidity: "Humidity",
      fan: "Fan",
    },

    fan: {
      onLabel: "On",
      offLabel: "Off",
      on: "ON",
      off: "OFF",
    },

    viewer3d: {
      title: "3D Visualization",
      fanActive: "Fan active",
      fanInactive: "Fan inactive",
    },

    technical: {
      title: "Technical Information",
      operationalStatus: "Operational status",
      badPoints: "BAD points",
      extraSensors: "Additional sensors",
    },
  },

  ahuDetailPage: {
  backToDashboard: "Back to Dashboard",
  plantLabel: "Plant {plantId}",

  badPointsOutOfRange: "{count} point{suffix} out of range",
  lastUpdate: "Last update: {value}",
  eventsLogged: "{count} event{suffix} logged",

  tabs: {
    overview: "Overview",
    events: "Events",
  },

  sections: {
    environmental: "Environmental Conditions",
    airMovement: "Air Movement",
    energyFiltration: "Energy & Filtration",
    additionalData: "Additional Data",
  },

  metrics: {
    temperature: "Temperature",
    humidity: "Humidity",
    fanStatus: "Fan Status",
    airflow: "Airflow",
    damperPosition: "Damper Position",
    powerStatus: "Power Status",
    filterDp: "Filter ΔP",
  },

  charts: {
    temperatureHistory: "Temperature History",
    humidityHistory: "Humidity History",
  },

  events: {
    noEventsTitle: "No Events Logged",
    noEventsDesc: "This unit has no recent events or alarms",
    timelineTitle: "Event Timeline",
    eventTypeLabel: "{type}",
  },

  statusLabels: {
    alarm: "Critical Alarm Active",
    warning: "Warnings Detected",
    ok: "Normal Operation",
    disconnected: "No Communication",
  },

  units: {
    airflowFallback: "m³/h",
    filterDpFallback: "Pa",
  },
},


eventMessages: {
  enteredAlarm: "Unit entered ALARM",
  warningCondition: "Unit in WARNING condition",
  communicationRestored: "Unit communication restored",
  backToNormal: "Unit returned to NORMAL",
  communicationLost: "Unit lost communication",
  statusChange: "Status change: {previous} → {current}",
},


  // ===== Home Page HVAC =====
  homePageHvac: {
    hvacModule: "HVAC Module",
    airHandling: "Air Handling",
    control: "Control",
    subtitle: "Real-time monitoring and diagnostics for air handling units across your facility",
    serverOnline: "SERVER ONLINE",
    serverOffline: "SERVER OFFLINE",
    telemetryActive: "Real-time telemetry active",
    reconnecting: "Attempting to reconnect...",
    connected: "Connected",
    disconnected: "Disconnected",
    critical: "Critical",
    degraded: "Degraded",
    healthy: "Healthy",
    noData: "No Data",
    systemHealth: "System Health",
    connectedAhus: "Connected AHUs",
    units: "units",
    avgTemperature: "Avg Temperature",
    criticalAlarms: "Critical Alarms",
    active: "active",
    systemOverview: "System Overview",
    operational: "Operational",
    warnings: "Warnings",
    criticalLabel: "Critical",
    ofUnits: "{value} of {total} units",
    quick: "Quick",
    actions: "Actions",
    dashboard: "Dashboard",
    viewAllAhus: "View all AHUs",
    alarms: "Alarms",
    activeAlerts: "Active alerts",
    temperature: "Temperature",
    thermalMonitoring: "Thermal monitoring",
    analytics: "Analytics",
    systemInsights: "System insights",
    open: "Open",
  },

  // ===== Dashboard HVAC =====
  dashboardHvac: {
    liveMonitoring: "Live Monitoring",
    hvac: "HVAC",
    dashboard: "Dashboard",
    subtitle: "Real-time status of air handling units across all facilities",
    totalUnits: "Total Units",
    operational: "Operational",
    warnings: "Warnings",
    critical: "Critical",
    filteringBy: "Filtering by:",
    clear: "Clear",
    noConnectedAhus: "No connected AHUs found",
    noAhusWithStatus: "No AHUs with status \"{status}\"",
    plant: "Plant",
    unitActive: "unit active",
    unitsActive: "units active",
    ok: "OK",
    warn: "WARN",
    alarm: "ALARM",
  },

  // ===== Home Global =====
  homeGlobal: {
    platformBadge: "Industrial IoT Platform",
    heroTitle: "Fire",
    heroSubtitle: "Next-generation industrial monitoring platform delivering",
    realtimeTelemetry: "real-time telemetry",
    predictiveInsights: "predictive insights",
    modularScalability: "modular scalability",
    acrossOperation: "across your entire operation.",
    enterHvacModule: "Enter HVAC Module",
    viewLiveSystems: "View Live Systems",
    connected: "Connected",
    devices: "devices",
    activePlants: "Active Plants",
    sites: "sites",
    healthy: "Healthy",
    units: "units",
    warnings: "Warnings",
    active: "active",
    critical: "Critical",
    alarms: "alarms",
    avgTemp: "Avg Temp",
    systemStatus: "System Status:",
    online: "ONLINE",
    offline: "OFFLINE",
    monitoringDevices: "Monitoring {devices} devices across {plants} plant",
    monitoringDevicesPlural: "Monitoring {devices} devices across {plants} plants",
    reconnecting: "Attempting to reconnect to telemetry server...",
    operational: "Operational",
    warningsLabel: "Warnings",
    criticalLabel: "Critical",
    available: "Available",
    modules: "Modules",
    hvacControl: "HVAC Control",
    hvacControlDesc: "Real-time air handling unit monitoring, diagnostics, and predictive maintenance.",
    statusActive: "ACTIVE",
    energyManagement: "Energy Management",
    energyManagementDesc: "Power consumption tracking, optimization algorithms, and cost analysis.",
    statusComingSoon: "COMING SOON",
    processControl: "Process Control",
    processControlDesc: "Industrial automation, PLC integration, and real-time process optimization.",
    devicesLabel: "Devices",
    uptime: "Uptime",
    enterModule: "Enter Module",
    footerMonitoring: "Industrial Monitoring & Telemetry",
  },

  // ===== Notifications =====
  notifications: {
    ahuAlarm: "AHU {stationId} in ALARM",
    ahuWarning: "AHU {stationId} in WARNING",
    ahuNormal: "AHU {stationId} returned to NORMAL",
    ahuDisconnected: "AHU {stationId} disconnected",
    ahuReconnected: "AHU {stationId} reconnected",
    plant: "Plant {plantId}",
    noDataTimeout: "No data for more than {minutes} minutes",
  },

  // ===== Time Units =====
  time: {
    seconds: "seconds",
    minutes: "minutes",
    hours: "hours",
    days: "days",
    min: "min",
    sec: "s",
  },

  // ===== WebSocket =====
  websocket: {
    connected: "Connected to server",
    disconnected: "Disconnected from server",
    disconnectReason: "Reason: {reason}. Reconnecting...",
  },

  // ===== Header =====
  header: {
    controlCenter: "Control Center",
    online: "ONLINE",
    offline: "OFFLINE",
  },

  // ===== Charts =====
  charts: {
    noData: "No data",
    noHistoricalData: "No historical data",
    temperature: "Temperature",
    humidity: "Humidity",
    avgSuffix: "avg",
  },

  // ===== Plant Health Panel =====
  plantHealth: {
    plant: "Plant",
    ahus: "AHUs",
    alarms: "Alarms",
    warnings: "Warnings",
    disconnected: "Disconnected",
  },

  // ===== Units =====
  units: {
    celsius: "°C",
    percent: "%",
    rpm: "RPM",
  },
};
