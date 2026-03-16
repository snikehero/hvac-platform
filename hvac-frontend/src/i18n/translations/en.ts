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
    errorSingular: "error",
    errorPlural: "errors",
    success: "Success",
    noData: "No Data",
    search: "Search",
    filter: "Filter",
    all: "All",
    apply: "Apply",
    reset: "Reset",
    and: "and",
    back: "Back",
    saving: "Saving...",
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
    analytics: "Analytics",
    kiosk: "Kiosk",
    alarms: "Alarms",
    settings: "Settings",
    generalDashboard: "General Dashboard",
    comingSoon: "Coming Soon",
    generalSection: "General",
    overview: "Overview",
    unifiedAlarms: "Alarms",
  },


  // ===== Time Ago (used by alarms) =====
  activity: {
    secondsAgo: "{seconds}s ago",
    minutesAgoShort: "{minutes}m ago",
    hoursAgoShort: "{hours}h ago",
    daysAgoShort: "{days}d ago",
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
    acknowledged: "Acknowledged",
    ackButton: "Acknowledge",
    noAcknowledged: "No acknowledged alarms",
    ackStamp: "Acked by {name} · {time}",
    ackToast: "Alarm acknowledged by {name}",
    detailedAnalysis: "Detailed metrics analysis",
    plant: "Plant",
    lastUpdate: "Last update",
    errorPoints: "Error points",
    connectionStatus: "Connection status",
    connected: "Connected",
  },

  // ===== Unified Alarms =====
  unifiedAlarms: {
    title: "Unified Alarm System",
    subtitle: "Real-time monitoring of all devices with alarms and warnings",
    filterByType: "Filter by type",
    allTypes: "All Types",
    searchPlaceholder: "Search device or plant...",
    noDevicesFound: "No devices match your search",
    machineType: "Machine Type",
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
      operatorName: "Operator Name",
      operatorNameDesc: "Name or initials shown when acknowledging alarms.",
      operatorNamePlaceholder: "e.g. John D.",
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
        "plant-heat-map": "Plant Heat Map",
      },
      visibleLabel: "Visible",
      dragHint: "Drag rows to reorder",
    },
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
    deviceAlarm: "{machineType} {stationId} in ALARM",
    deviceWarning: "{machineType} {stationId} in WARNING",
    deviceNormal: "{machineType} {stationId} returned to NORMAL",
    deviceDisconnected: "{machineType} {stationId} disconnected",
    deviceReconnected: "{machineType} {stationId} reconnected",
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


  // ===== Units =====
  units: {
    celsius: "°C",
    percent: "%",
    rpm: "RPM",
  },

  // ===== Machine Designer =====
  machineDesigner: {
    title: "Machine Designer",
    subtitle: "Define custom machine types with their variables and dashboard layouts",
    createNew: "Create Machine Type",
    editMachine: "Edit Machine Type",
    deleteMachine: "Delete Machine Type",
    confirmDelete: "Are you sure you want to delete this machine type? This cannot be undone.",
    name: "Name",
    slug: "Slug",
    mqttTopic: "MQTT Topic",
    description: "Description",
    descriptionPlaceholder: "Brief description of this machine type",
    icon: "Icon",
    variables: "Variables",
    addVariable: "Add Variable",
    variableKey: "Key",
    variableLabel: "Label",
    variableType: "Data Type",
    variableUnit: "Unit",
    cardType: "Card Type",
    color: "Color",
    preview: "Dashboard Preview",
    showPreview: "Show Preview",
    hidePreview: "Hide Preview",
    basicInfo: "Basic Information",
    noMachineTypes: "No machine types defined yet",
    noMachineTypesDesc: "Create your first machine type to start monitoring custom equipment via MQTT.",
    saved: "Machine type saved successfully",
    deleted: "Machine type deleted successfully",
    topicHint: "Use # for multi-level wildcard (e.g. motor/#)",
    manage: "Manage Types",
    requiredFields: "Name, slug, and MQTT topic are required",
    noVariablesError: "At least one variable is required",
    noVariablesYet: "No variables defined yet. Add variables that this machine will send via MQTT.",
    invalidVariables: "All variables must have a key and label",
    commands: "Commands",
    addCommand: "Add Command",
    noCommandsYet: "No commands defined. Commands allow you to send control instructions to devices.",
  },

  // ===== Machine Dashboard =====
  machineDashboard: {
    dashboard: "Dashboard",
    connected: "Connected",
    disconnected: "Disconnected",
    instances: "instances",
    noInstances: "No instances connected",
    noInstancesDesc: "Waiting for MQTT messages. Make sure your devices are sending data.",
    plant: "Plant",
    lastUpdate: "Last update",
    waitingForData: "Waiting for data from this instance...",
  },

  // ===== Generic Machine Pages =====
  machinePages: {
    // MachineHomePage
    machineTypeNotFound: "Machine type not found.",
    systemHealth: "System Health",
    avgMetric: "Average Metric",
    connectedCount: "Connected",
    activeAlerts: "Active Alerts",
    systemOverview: "System Overview",
    operational: "Operational",
    warnings: "Warnings",
    critical: "Critical",
    offline: "Offline",
    serverOnline: "Server Online",
    serverOffline: "Server Offline",
    viewInstances: "View all instances and their status",
    viewAlarms: "View active alarms and warnings",
    configureSettings: "Configure thresholds and notifications",
    healthCritical: "CRITICAL",
    healthDegraded: "DEGRADED",
    healthHealthy: "HEALTHY",
    healthNoData: "NO DATA",

    // MachineDetailPage
    overview: "Overview",
    events: "Events",
    commands: "Commands",

    // MachineDashboardPage
    liveMonitoring: "Live Monitoring",
    total: "Total",
    ok: "OK",
    warning: "Warning",
    alarm: "Alarm",
    noInstancesMatch: "No instances match the selected filter.",
    showAll: "Show all",
    plant: "Plant",
    alarmSingular: "alarm",
    alarmPlural: "alarms",
    warningSingular: "warning",
    warningPlural: "warnings",
    on: "ON",
    off: "OFF",

    // MachineAlarmsPage
    back: "Back",
    alarms: "Alarms",
    activeAlertCount: "{count} active alert(s)",
    noActiveAlarms: "No active alarms",
    allNormal: "All {name} instances are operating normally.",
    acknowledge: "Acknowledge",
    acknowledged: "Acknowledged",
    alarmAcknowledged: "Alarm acknowledged: {id}",
    viewDetails: "View Details",
    badPointSingular: "bad point",
    badPointPlural: "bad points",

    // MachineSettingsPage
    settings: "Settings",
    configureThresholds: "Configure thresholds and notifications",
    thresholds: "Thresholds",
    notificationsTab: "Notifications",
    noThresholdVars: "No variables with threshold configuration found.",
    warningThreshold: "Warning Threshold",
    alarmThreshold: "Alarm Threshold",
    defaultValue: "Default: {value}",
    notSet: "Not set",
    resetDefaults: "Reset to Defaults",
    soundNotifications: "Sound Notifications",
    enableSound: "Enable sound alerts",
    volume: "Volume",
  },

  // ===== Device Event Timeline =====
  deviceTimeline: {
    title: "Event Timeline",
    count: "{count} events",
    noEvents: "No events recorded",
    noEventsDesc: "This device has no recent events.",
  },

  // ===== Generic Commands Panel =====
  commandsPanel: {
    title: "Commands",
    noCommands: "No commands configured for this machine type.",
    sending: "Sending...",
    success: "Success",
    error: "Error",
    timeout: "Timeout",
    on: "ON",
    off: "OFF",
    current: "Current: {value}",
    setTo: "Set {label} to {value}",
    send: "Send",
  },

  // ===== Device History Chart =====
  historyChart: {
    noData: "No data available",
    avg: "avg",
  },

  // ===== Executive Dashboard =====
  executiveDashboard: {
    title: "Executive Dashboard",
    systemStatus: "System Status",
    totalUnits: "Total Units",
    operationalCapacity: "Operational Capacity",
    affectedUnits: "Affected Units",
    noCommunication: "No Communication",
    plantOverview: "Plant Overview",
    heatMap: "Heat Map",
    systemActivity: "System Activity",
    stabilityScore: "Stability Score",
    recentEvents: "Recent Events",
    operational: "Operational",
    clickToFilter: "Click to filter",
    allPlants: "All Plants",
    noEvents: "No recent events",
    stable: "STABLE",
    degraded: "DEGRADED",
    unstable: "UNSTABLE",
    legend: "Legend",
    instances: "instances",
    alarms: "alarms",
    warnings: "warnings",
    disconnected: "disconnected",
    impact: "Impact",
    noInstances: "No instances connected",
    noInstancesDesc: "Waiting for telemetry data for this machine type.",
    trend: "Trend",
    badPoints: "bad points",
  },
} as const;
