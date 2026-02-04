// src/mockData.ts
export interface TelemetryDto {
  topic: string; // e.g., hvac/planta1/AHU-01/temperature
  payload: {
    timestamp: string;
    quality: "GOOD" | "BAD" | "UNCERTAIN";
    value: number | string | boolean;
    unit?: string;
  };
}

export const ahus = ["AHU-01", "AHU-02", "AHU-03"];

export const generateMockTelemetry = (): TelemetryDto[] => {
  const messages: TelemetryDto[] = [];

  ahus.forEach((ahu) => {
    const temperature = +(20 + Math.random() * 12).toFixed(1);
    const humidity = +(40 + Math.random() * 30).toFixed(1);
    const fan_status = Math.random() > 0.15 ? "ON" : "OFF";

    let status = "OK";
    if (fan_status === "OFF") status = "ALARM";
    else if (temperature < 20 || temperature > 28 || humidity > 65)
      status = "WARNING";

    const basePayload = {
      timestamp: new Date().toISOString(),
      quality: "GOOD" as const,
    };

    messages.push(
      {
        topic: `hvac/planta1/${ahu}/temperature`,
        payload: { ...basePayload, value: temperature, unit: "°C" },
      },
      {
        topic: `hvac/planta1/${ahu}/humidity`,
        payload: { ...basePayload, value: humidity, unit: "%" },
      },
      {
        topic: `hvac/planta1/${ahu}/fan_status`,
        payload: { ...basePayload, value: fan_status, unit: "" },
      },
      {
        topic: `hvac/planta1/${ahu}/status`,
        payload: { ...basePayload, value: status, unit: "" },
      },
    );
  });

  return messages;
};
