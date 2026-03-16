export const routes = {
  home: "/",

  general: {
    overview: "/",
    alarms: "/alarms",
  },

  machineDesigner: {
    list: "/machine-designer",
    create: "/machine-designer/create",
    edit: (id: string) => `/machine-designer/${id}/edit`,
    editPattern: "/machine-designer/:id/edit",
  },

  machine: {
    home: (machineType: string) => `/machines/${machineType}`,
    homePattern: "/machines/:machineType",
    dashboard: (machineType: string) => `/machines/${machineType}/dashboard`,
    dashboardPattern: "/machines/:machineType/dashboard",
    alarms: (machineType: string) => `/machines/${machineType}/alarms`,
    alarmsPattern: "/machines/:machineType/alarms",
    settings: (machineType: string) => `/machines/${machineType}/settings`,
    settingsPattern: "/machines/:machineType/settings",
    executive: (machineType: string) => `/machines/${machineType}/executive`,
    executivePattern: "/machines/:machineType/executive",
    analytics: (machineType: string) => `/machines/${machineType}/analytics`,
    analyticsPattern: "/machines/:machineType/analytics",
    detail: (
      machineType: string,
      plantId: string,
      stationId: string,
    ) => `/machines/${machineType}/plants/${plantId}/stations/${stationId}`,
    detailPattern:
      "/machines/:machineType/plants/:plantId/stations/:stationId",
  },

  kiosk: {
    page: (machineType: string) => `/kiosk/${machineType}`,
    pattern: "/kiosk/:machineType",
  },
};
