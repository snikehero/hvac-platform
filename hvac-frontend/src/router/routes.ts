const HVAC_BASE = "/hvac";

export const routes = {
  home: "/",

  general: {
    overview: "/",
    alarms: "/alarms",
  },

  hvac: {
    home: HVAC_BASE,
    dashboard: `${HVAC_BASE}/dashboard`,
    ejecutivo: `${HVAC_BASE}/ejecutivo`,
    alarms: `${HVAC_BASE}/alarms`,
    settings: `${HVAC_BASE}/settings`,

    ahuDetailPattern: `${HVAC_BASE}/plants/:plantId/ahus/:ahuId`,
    ahuDetail3DPattern: `${HVAC_BASE}/plants/:plantId/ahus/:ahuId/detail`,

    ahuDetail: (plantId: string, ahuId: string) =>
      `${HVAC_BASE}/plants/${plantId}/ahus/${ahuId}`,

    ahuDetail3D: (plantId: string, ahuId: string) =>
      `${HVAC_BASE}/plants/${plantId}/ahus/${ahuId}/detail`,
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
    detail: (
      machineType: string,
      plantId: string,
      stationId: string,
    ) => `/machines/${machineType}/plants/${plantId}/stations/${stationId}`,
    detailPattern:
      "/machines/:machineType/plants/:plantId/stations/:stationId",
  },
};
