import axios from "axios";
import type { Telemetry } from "../types/telemetry";

const API_URL = "http://localhost:3000";

export const getLatestTelemetry = async (): Promise<Telemetry[]> => {
  const res = await axios.get(`${API_URL}/hvac/latest`);
  return res.data;
};
