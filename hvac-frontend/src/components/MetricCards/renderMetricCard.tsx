import React from "react";
import {
    TemperatureCard,
    HumidityCard,
    FanCard,
    AirflowCard,
    DamperCard,
    PowerCard,
    FilterCard,
    RpmCard,
    CurrentCard,
    GenericCard,
} from "./index";
import type { MetricColor, MetricQuality, TrendInfo } from "./types";
import type { HistoryPoint } from "@/types/history";

export interface RenderMetricCardProps {
    cardType: string;
    label: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
    unit: string;
    quality?: MetricQuality;
    color: MetricColor;
    cardConfig?: Record<string, unknown>;
    /** Optional history data for sparkline */
    historyData?: HistoryPoint[];
    /** Optional pre-calculated trend */
    trend?: TrendInfo;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

// Cast a component to accept any props — avoids TS2769 on React.createElement
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mkEl(Comp: React.ComponentType<any>, props: AnyRecord): React.ReactElement {
    return React.createElement(Comp, props);
}

type CardRenderer = (baseProps: AnyRecord, cardConfig: AnyRecord) => React.ReactElement;

const CARD_RENDERERS: Record<string, CardRenderer> = {
    temperature: (p, cfg) => mkEl(TemperatureCard, { type: "temperature", ...p, ...cfg }),
    humidity: (p, cfg) => mkEl(HumidityCard, { type: "humidity", ...p, ...cfg }),
    fan: (p, cfg) => mkEl(FanCard, {
        type: "fan",
        status: typeof p.value === "boolean" ? (p.value ? "ON" : "OFF") : String(p.value),
        ...p,
        ...cfg,
    }),
    airflow: (p, cfg) => mkEl(AirflowCard, { type: "airflow", ...p, ...cfg }),
    damper: (p, cfg) => mkEl(DamperCard, { type: "damper", ...p, ...cfg }),
    power: (p, cfg) => mkEl(PowerCard, {
        type: "power",
        status: typeof p.value === "boolean" ? (p.value ? "ON" : "OFF") : String(p.value),
        ...p,
        ...cfg,
    }),
    filter: (p, cfg) => mkEl(FilterCard, { type: "filter", ...p, ...cfg }),
    rpm: (p, cfg) => mkEl(RpmCard, { type: "rpm", ...p, ...cfg }),
    gauge: (p, cfg) => mkEl(RpmCard, { type: "rpm", ...p, ...cfg }),
    current: (p, cfg) => mkEl(CurrentCard, { type: "current", ...p, ...cfg }),
};

export function renderMetricCard({
    cardType,
    label,
    value,
    unit,
    quality,
    color,
    cardConfig = {},
    historyData,
    trend,
}: RenderMetricCardProps): React.ReactElement {
    const validColors = new Set<string>(["primary", "accent", "success", "warning", "destructive", "chart"]);
    let mappedColor: MetricColor;
    if (color && color.toString().startsWith("chart-")) {
        mappedColor = "chart";
    } else if (color && validColors.has(color.toString())) {
        mappedColor = color as MetricColor;
    } else {
        mappedColor = "primary";
    }

    const baseProps: AnyRecord = { label, value, unit, quality, color: mappedColor, historyData, trend };
    const renderer = CARD_RENDERERS[cardType.toLowerCase()];

    if (renderer) {
        return renderer(baseProps, cardConfig as AnyRecord);
    }

    return mkEl(GenericCard, { type: "generic", ...baseProps, ...cardConfig });
}
