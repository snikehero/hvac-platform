import { describe, it, expect } from "vitest";
import {
  parseNumValue,
  calcHealthPercent,
  isActiveStatus,
  colorByThreshold,
} from "@/components/MetricCards/hooks/useMetricCardLogic";

describe("parseNumValue", () => {
  it("returns the number as-is for numeric input", () => {
    expect(parseNumValue(42)).toBe(42);
    expect(parseNumValue(0)).toBe(0);
    expect(parseNumValue(-5.5)).toBe(-5.5);
  });

  it("parses a numeric string", () => {
    expect(parseNumValue("3.14")).toBe(3.14);
    expect(parseNumValue("100")).toBe(100);
  });

  it("returns 0 for non-numeric strings", () => {
    expect(parseNumValue("abc")).toBe(0);
    expect(parseNumValue("")).toBe(0);
  });

  it("returns 0 for null and undefined", () => {
    expect(parseNumValue(null)).toBe(0);
    expect(parseNumValue(undefined)).toBe(0);
  });

  it("returns 0 for boolean input", () => {
    expect(parseNumValue(true)).toBe(0);
    expect(parseNumValue(false)).toBe(0);
  });
});

describe("calcHealthPercent", () => {
  it("returns 100 for value at max", () => {
    expect(calcHealthPercent(100, 0, 100)).toBe(100);
  });

  it("returns 0 for value at min", () => {
    expect(calcHealthPercent(0, 0, 100)).toBe(0);
  });

  it("returns 50 for midpoint", () => {
    expect(calcHealthPercent(50, 0, 100)).toBe(50);
  });

  it("clamps below 0 to 0", () => {
    expect(calcHealthPercent(-10, 0, 100)).toBe(0);
  });

  it("clamps above 100 to 100", () => {
    expect(calcHealthPercent(200, 0, 100)).toBe(100);
  });

  it("works with non-zero min", () => {
    expect(calcHealthPercent(15, 10, 20)).toBe(50);
  });

  it("returns 0 when min equals max to avoid division by zero", () => {
    expect(calcHealthPercent(5, 5, 5)).toBe(0);
  });
});

describe("isActiveStatus", () => {
  it("returns true for uppercase 'ON'", () => {
    expect(isActiveStatus("ON")).toBe(true);
  });

  it("returns true for string '1'", () => {
    expect(isActiveStatus("1")).toBe(true);
  });

  it("returns true for string 'true'", () => {
    expect(isActiveStatus("true")).toBe(true);
  });

  it("returns true for boolean true (coerces to 'true')", () => {
    expect(isActiveStatus(true)).toBe(true);
  });

  it("returns true for number 1 (coerces to '1')", () => {
    expect(isActiveStatus(1)).toBe(true);
  });

  it("returns false for lowercase 'on'", () => {
    // Implementation checks exact uppercase 'ON'
    expect(isActiveStatus("on")).toBe(false);
  });

  it("returns false for 'off'", () => {
    expect(isActiveStatus("off")).toBe(false);
  });

  it("returns false for boolean false (coerces to 'false')", () => {
    expect(isActiveStatus(false)).toBe(false);
  });

  it("returns false for 0 (coerces to '0')", () => {
    expect(isActiveStatus(0)).toBe(false);
  });

  it("returns false for null (coerces to 'null')", () => {
    expect(isActiveStatus(null)).toBe(false);
  });

  it("returns false for undefined (coerces to 'undefined')", () => {
    expect(isActiveStatus(undefined)).toBe(false);
  });
});

describe("colorByThreshold", () => {
  it("returns the first matching class", () => {
    const result = colorByThreshold(
      [
        { condition: false, className: "text-red-500" },
        { condition: true, className: "text-yellow-500" },
        { condition: true, className: "text-green-500" },
      ],
      "text-gray-500",
    );
    expect(result).toBe("text-yellow-500");
  });

  it("returns fallback when no condition is true", () => {
    const result = colorByThreshold(
      [
        { condition: false, className: "text-red-500" },
        { condition: false, className: "text-yellow-500" },
      ],
      "text-gray-500",
    );
    expect(result).toBe("text-gray-500");
  });

  it("returns first match when all conditions are true", () => {
    const result = colorByThreshold(
      [
        { condition: true, className: "text-red-500" },
        { condition: true, className: "text-green-500" },
      ],
      "text-gray-500",
    );
    expect(result).toBe("text-red-500");
  });

  it("returns fallback for empty checks array", () => {
    const result = colorByThreshold([], "text-gray-500");
    expect(result).toBe("text-gray-500");
  });
});
