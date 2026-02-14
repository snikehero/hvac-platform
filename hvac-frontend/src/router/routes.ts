const HVAC_BASE = "/hvac";

export const routes = {
  home: "/",

  hvac: {
    home: HVAC_BASE,
    dashboard: `${HVAC_BASE}/dashboard`,
    ejecutivo: `${HVAC_BASE}/Ejecutivo`,
    alarms: `${HVAC_BASE}/alarms`,
    settings: `${HVAC_BASE}/settings`,

    ahuDetailPattern: `${HVAC_BASE}/plants/:plantId/ahus/:ahuId`,
    ahuDetail3DPattern: `${HVAC_BASE}/plants/:plantId/ahus/:ahuId/detail`,

    ahuDetail: (plantId: string, ahuId: string) =>
      `${HVAC_BASE}/plants/${plantId}/ahus/${ahuId}`,

    ahuDetail3D: (plantId: string, ahuId: string) =>
      `${HVAC_BASE}/plants/${plantId}/ahus/${ahuId}/detail`,
  },
};
