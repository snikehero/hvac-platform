import { describe, it, expect } from "vitest";
import {
  STATUS_DOT,
  STATUS_COLOR,
  STATUS_BADGE_VARIANT,
  STATUS_CELL,
  STATUS_ICON,
  EVENT_ICON,
  EVENT_COLOR,
  getStatusDot,
  getStatusColor,
  getStatusBadgeVariant,
  getEventBadgeVariant,
} from "@/constants/status";

describe("STATUS_DOT", () => {
  it("has entries for all four statuses", () => {
    expect(STATUS_DOT.OK).toBeDefined();
    expect(STATUS_DOT.WARNING).toBeDefined();
    expect(STATUS_DOT.ALARM).toBeDefined();
    expect(STATUS_DOT.DISCONNECTED).toBeDefined();
  });

  it("returns green for OK", () => {
    expect(STATUS_DOT.OK).toContain("green");
  });

  it("returns yellow/amber for WARNING", () => {
    expect(STATUS_DOT.WARNING).toMatch(/yellow|amber/);
  });

  it("returns red/destructive for ALARM", () => {
    expect(STATUS_DOT.ALARM).toMatch(/red|destructive/);
  });
});

describe("STATUS_COLOR", () => {
  it("has entries for all four statuses", () => {
    expect(STATUS_COLOR.OK).toBeDefined();
    expect(STATUS_COLOR.WARNING).toBeDefined();
    expect(STATUS_COLOR.ALARM).toBeDefined();
    expect(STATUS_COLOR.DISCONNECTED).toBeDefined();
  });
});

describe("STATUS_BADGE_VARIANT", () => {
  it("returns 'default' for OK", () => {
    expect(STATUS_BADGE_VARIANT.OK).toBe("default");
  });

  it("returns 'secondary' for WARNING", () => {
    expect(STATUS_BADGE_VARIANT.WARNING).toBe("secondary");
  });

  it("returns 'destructive' for ALARM", () => {
    expect(STATUS_BADGE_VARIANT.ALARM).toBe("destructive");
  });

  it("returns 'outline' for DISCONNECTED", () => {
    expect(STATUS_BADGE_VARIANT.DISCONNECTED).toBe("outline");
  });
});

describe("STATUS_CELL", () => {
  it("has entries for all four statuses", () => {
    expect(STATUS_CELL.OK).toBeDefined();
    expect(STATUS_CELL.WARNING).toBeDefined();
    expect(STATUS_CELL.ALARM).toBeDefined();
    expect(STATUS_CELL.DISCONNECTED).toBeDefined();
  });

  it("ALARM cell has animate-pulse", () => {
    expect(STATUS_CELL.ALARM).toContain("animate-pulse");
  });
});

describe("STATUS_ICON", () => {
  it("has icon components for all four statuses", () => {
    expect(STATUS_ICON.OK).toBeDefined();
    expect(STATUS_ICON.WARNING).toBeDefined();
    expect(STATUS_ICON.ALARM).toBeDefined();
    expect(STATUS_ICON.DISCONNECTED).toBeDefined();
  });

  it("ALARM and OK use different icons", () => {
    expect(STATUS_ICON.ALARM).not.toBe(STATUS_ICON.OK);
  });
});

describe("EVENT_ICON", () => {
  it("has icons for all event types", () => {
    expect(EVENT_ICON.OK).toBeDefined();
    expect(EVENT_ICON.WARNING).toBeDefined();
    expect(EVENT_ICON.ALARM).toBeDefined();
    expect(EVENT_ICON.DISCONNECTED).toBeDefined();
    expect(EVENT_ICON.RECONNECTED).toBeDefined();
  });
});

describe("EVENT_COLOR", () => {
  it("has color strings for all event types", () => {
    expect(EVENT_COLOR.OK).toBeDefined();
    expect(EVENT_COLOR.WARNING).toBeDefined();
    expect(EVENT_COLOR.ALARM).toBeDefined();
    expect(EVENT_COLOR.DISCONNECTED).toBeDefined();
    expect(EVENT_COLOR.RECONNECTED).toBeDefined();
  });
});

describe("getStatusDot", () => {
  it("returns same value as STATUS_DOT lookup", () => {
    expect(getStatusDot("OK")).toBe(STATUS_DOT.OK);
    expect(getStatusDot("ALARM")).toBe(STATUS_DOT.ALARM);
    expect(getStatusDot("WARNING")).toBe(STATUS_DOT.WARNING);
    expect(getStatusDot("DISCONNECTED")).toBe(STATUS_DOT.DISCONNECTED);
  });
});

describe("getStatusColor", () => {
  it("returns same value as STATUS_COLOR lookup", () => {
    expect(getStatusColor("OK")).toBe(STATUS_COLOR.OK);
    expect(getStatusColor("ALARM")).toBe(STATUS_COLOR.ALARM);
  });
});

describe("getStatusBadgeVariant", () => {
  it("returns correct variant for each status", () => {
    expect(getStatusBadgeVariant("OK")).toBe("default");
    expect(getStatusBadgeVariant("WARNING")).toBe("secondary");
    expect(getStatusBadgeVariant("ALARM")).toBe("destructive");
    expect(getStatusBadgeVariant("DISCONNECTED")).toBe("outline");
  });
});

describe("getEventBadgeVariant", () => {
  it("returns destructive for ALARM", () => {
    expect(getEventBadgeVariant("ALARM")).toBe("destructive");
  });

  it("returns secondary for WARNING", () => {
    expect(getEventBadgeVariant("WARNING")).toBe("secondary");
  });

  it("returns default for OK", () => {
    expect(getEventBadgeVariant("OK")).toBe("default");
  });

  it("returns default for unknown types", () => {
    // Implementation falls through to 'default' for unrecognized types
    expect(getEventBadgeVariant("UNKNOWN_TYPE")).toBe("default");
  });
});
