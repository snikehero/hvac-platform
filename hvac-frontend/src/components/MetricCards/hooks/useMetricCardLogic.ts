/**
 * Common logic shared across MetricCard components.
 * Centralizes value parsing, percentage calculation, and status checks.
 */

/** Parse raw value (number | string | unknown) to a numeric float */
export function parseNumValue(value: unknown): number {
  if (typeof value === "number") return value;
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
}

/** Calculate fill percentage clamped to [0, 100] given a range */
export function calcHealthPercent(
  numValue: number,
  min: number,
  max: number,
): number {
  if (max === min) return 0;
  return Math.min(Math.max(((numValue - min) / (max - min)) * 100, 0), 100);
}

/** Determine if a status string represents an active / ON state */
export function isActiveStatus(status: unknown): boolean {
  const s = String(status);
  return s === "ON" || s === "1" || s === "true";
}

/**
 * Returns fill color class name based on threshold comparisons.
 * Pass threshold checks in priority order (highest severity first).
 */
export function colorByThreshold(
  checks: Array<{ condition: boolean; className: string }>,
  fallback: string,
): string {
  for (const { condition, className } of checks) {
    if (condition) return className;
  }
  return fallback;
}
