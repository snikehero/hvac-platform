const HVAC_BASE = "/hvac";

export const routes = {
  home: "/",

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
    dashboard: (machineType: string) => `/machines/${machineType}`,
    dashboardPattern: "/machines/:machineType",
    detail: (
      machineType: string,
      plantId: string,
      stationId: string,
    ) => `/machines/${machineType}/plants/${plantId}/stations/${stationId}`,
    detailPattern:
      "/machines/:machineType/plants/:plantId/stations/:stationId",
  },
};
