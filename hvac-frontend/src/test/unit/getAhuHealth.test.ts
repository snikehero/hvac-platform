import { describe, it, expect } from "vitest";
import { getAhuHealth } from "@/domain/ahu/getAhuHealth";
import { STALE_THRESHOLD_MS } from "@/domain/ahu/constants";
import {
  makeAhu,
  makeAlarmAhu,
  makeWarningAhu,
  makeDisconnectedAhu,
  makeBadQualityAhu,
} from "@/test/factories";

// Default thresholds that match DEFAULT_SETTINGS
const defaultThresholds = {
  disconnectTimeoutMs: 120_000,
  temperatureWarning: 28,
  temperatureAlarm: 35,
  humidityWarning: 70,
  humidityAlarm: 85,
};

describe("getAhuHealth", () => {
  // =====================================================================
  // Branch 1: DISCONNECTED
  // =====================================================================
  describe("DISCONNECTED branch", () => {
    it("returns DISCONNECTED when timestamp is older than the disconnect timeout", () => {
      const ahu = makeDisconnectedAhu(); // 10 min stale
      const result = getAhuHealth(ahu, defaultThresholds);
      expect(result.status).toBe("DISCONNECTED");
    });

    it("returns DISCONNECTED with badPoints = 0 regardless of data quality", () => {
      // Even if there are BAD points, DISCONNECTED takes priority and badPoints is forced to 0
      const ahu = makeDisconnectedAhu({
        points: {
          ...makeAhu().points,
          temperature: { value: 22, unit: "°C", quality: "BAD" },
        },
      });
      const result = getAhuHealth(ahu, defaultThresholds);
      expect(result.status).toBe("DISCONNECTED");
      expect(result.badPoints).toBe(0);
    });

    it("uses STALE_THRESHOLD_MS (2 min) as default when no thresholds provided", () => {
      const staleAhu = makeAhu({
        timestamp: new Date(Date.now() - STALE_THRESHOLD_MS - 1000).toISOString(),
      });
      const result = getAhuHealth(staleAhu); // no thresholds
      expect(result.status).toBe("DISCONNECTED");
    });

    it("does NOT return DISCONNECTED for a fresh timestamp", () => {
      const ahu = makeAhu(); // timestamp = now
      const result = getAhuHealth(ahu, defaultThresholds);
      expect(result.status).not.toBe("DISCONNECTED");
    });

    it("does NOT return DISCONNECTED when timestamp is exactly at the boundary", () => {
      // timestamp is exactly disconnectTimeoutMs old → NOT stale (> not >=)
      const ahu = makeAhu({
        timestamp: new Date(Date.now() - defaultThresholds.disconnectTimeoutMs).toISOString(),
      });
      const result = getAhuHealth(ahu, defaultThresholds);
      expect(result.status).not.toBe("DISCONNECTED");
    });
  });

  // =====================================================================
  // Branch 2: ALARM via status point
  // =====================================================================
  describe("ALARM via status point", () => {
    it("returns ALARM when points.status.value === 'ALARM'", () => {
      const ahu = makeAlarmAhu();
      const result = getAhuHealth(ahu, defaultThresholds);
      expect(result.status).toBe("ALARM");
    });

    it("ALARM status point takes precedence over temperature below alarm threshold", () => {
      const ahu = makeAlarmAhu({
        points: { ...makeAhu().points, temperature: { value: 20, unit: "°C", quality: "GOOD" }, status: { value: "ALARM" } },
      });
      const result = getAhuHealth(ahu, defaultThresholds);
      expect(result.status).toBe("ALARM");
    });

    it("ALARM status point takes precedence over WARNING status", () => {
      // Even if logic would produce WARNING, status=ALARM wins
      const ahu = makeAlarmAhu();
      const result = getAhuHealth(ahu, { ...defaultThresholds, temperatureWarning: 10 });
      expect(result.status).toBe("ALARM");
    });
  });

  // =====================================================================
  // Branch 3: ALARM via temperature / humidity threshold
  // =====================================================================
  describe("ALARM via threshold", () => {
    it("returns ALARM when temperature >= temperatureAlarm", () => {
      const ahu = makeAhu({
        points: { ...makeAhu().points, temperature: { value: 35, unit: "°C", quality: "GOOD" }, status: { value: "OK" } },
      });
      const result = getAhuHealth(ahu, defaultThresholds);
      expect(result.status).toBe("ALARM");
    });

    it("returns ALARM when humidity >= humidityAlarm", () => {
      const ahu = makeAhu({
        points: { ...makeAhu().points, humidity: { value: 85, unit: "%", quality: "GOOD" }, status: { value: "OK" } },
      });
      const result = getAhuHealth(ahu, defaultThresholds);
      expect(result.status).toBe("ALARM");
    });

    it("does NOT trigger threshold ALARM when temperatureAlarm is undefined", () => {
      const thresholdsWithoutAlarm = { ...defaultThresholds, temperatureAlarm: undefined };
      const ahu = makeAhu({
        points: { ...makeAhu().points, temperature: { value: 40, unit: "°C", quality: "GOOD" }, status: { value: "OK" } },
      });
      const result = getAhuHealth(ahu, thresholdsWithoutAlarm);
      expect(result.status).not.toBe("ALARM");
    });

    it("does NOT trigger threshold ALARM when temperature value is not a number", () => {
      const ahu = makeAhu({
        points: { ...makeAhu().points, temperature: { value: "N/A", quality: "GOOD" }, status: { value: "OK" } },
      });
      const result = getAhuHealth(ahu, defaultThresholds);
      expect(result.status).not.toBe("ALARM");
    });
  });

  // =====================================================================
  // Branch 4: WARNING via threshold
  // =====================================================================
  describe("WARNING via threshold", () => {
    it("returns WARNING when temperature >= temperatureWarning but < temperatureAlarm", () => {
      const ahu = makeAhu({
        points: { ...makeAhu().points, temperature: { value: 30, unit: "°C", quality: "GOOD" }, status: { value: "OK" } },
      });
      const result = getAhuHealth(ahu, defaultThresholds); // warning=28, alarm=35
      expect(result.status).toBe("WARNING");
    });

    it("returns WARNING when humidity >= humidityWarning but < humidityAlarm", () => {
      const ahu = makeAhu({
        points: { ...makeAhu().points, humidity: { value: 72, unit: "%", quality: "GOOD" }, status: { value: "OK" } },
      });
      const result = getAhuHealth(ahu, defaultThresholds); // warning=70, alarm=85
      expect(result.status).toBe("WARNING");
    });
  });

  // =====================================================================
  // Branch 5: WARNING via BAD quality
  // =====================================================================
  describe("WARNING via BAD quality", () => {
    it("returns WARNING when any point has quality === 'BAD'", () => {
      const ahu = makeBadQualityAhu();
      const result = getAhuHealth(ahu, defaultThresholds);
      expect(result.status).toBe("WARNING");
    });

    it("counts badPoints correctly", () => {
      const ahu = makeAhu({
        points: {
          ...makeAhu().points,
          temperature: { value: 22, unit: "°C", quality: "BAD" },
          humidity: { value: 50, unit: "%", quality: "BAD" },
          status: { value: "OK" },
        },
      });
      const result = getAhuHealth(ahu, defaultThresholds);
      expect(result.badPoints).toBe(2);
    });

    it("BAD quality triggers WARNING even when temperature is within normal range", () => {
      const ahu = makeBadQualityAhu();
      // temp=22 which is well below the warning threshold of 28
      const result = getAhuHealth(ahu, defaultThresholds);
      expect(result.status).toBe("WARNING");
    });
  });

  // =====================================================================
  // Branch 6: WARNING via status point
  // =====================================================================
  describe("WARNING via status point", () => {
    it("returns WARNING when points.status.value === 'WARNING' with no threshold violations", () => {
      const ahu = makeWarningAhu();
      const result = getAhuHealth(ahu, defaultThresholds);
      expect(result.status).toBe("WARNING");
    });
  });

  // =====================================================================
  // Branch 7: OK
  // =====================================================================
  describe("OK branch", () => {
    it("returns OK for a healthy AHU with all values in range and GOOD quality", () => {
      const ahu = makeAhu(); // default: temp=22, hum=50, all GOOD, status=OK
      const result = getAhuHealth(ahu, defaultThresholds);
      expect(result.status).toBe("OK");
    });

    it("returns OK when points object is empty", () => {
      const ahu = makeAhu({ points: {} });
      const result = getAhuHealth(ahu, defaultThresholds);
      expect(result.status).toBe("OK");
    });

    it("returns badPoints = 0 when all points have GOOD quality", () => {
      const ahu = makeAhu();
      const result = getAhuHealth(ahu, defaultThresholds);
      expect(result.badPoints).toBe(0);
    });
  });

  // =====================================================================
  // lastUpdate field
  // =====================================================================
  describe("lastUpdate", () => {
    it("lastUpdate matches the ahu.timestamp as a Date", () => {
      const ts = "2025-01-15T10:30:00.000Z";
      const ahu = makeAhu({ timestamp: ts });
      const result = getAhuHealth(ahu, defaultThresholds);
      expect(result.lastUpdate).toEqual(new Date(ts));
    });
  });
});
