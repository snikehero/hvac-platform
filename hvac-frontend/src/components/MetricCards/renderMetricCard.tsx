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
import type { MetricColor, MetricQuality } from "./types";

export interface RenderMetricCardProps {
    cardType: string;
    label: string;
    value: any;
    unit: string;
    quality?: MetricQuality;
    color: MetricColor;
    cardConfig?: Record<string, unknown>;
}

export function renderMetricCard({
    cardType,
    label,
    value,
    unit,
    quality,
    color,
    cardConfig = {},
}: RenderMetricCardProps): React.ReactElement {
    // Map standard chart colors to "chart" if they are chart-1 to chart-5
    const mappedColor: MetricColor =
        color && color.toString().startsWith("chart-")
            ? "chart"
            : color || "primary";

    // Shared props for all cards
    const baseProps = {
        label,
        value,
        unit,
        quality,
        color: mappedColor,
    };

    switch (cardType.toLowerCase()) {
        case "temperature":
            return (
                <TemperatureCard
                    type="temperature"
                    {...baseProps}
                    {...(cardConfig as any)}
                />
            );
        case "humidity":
            return (
                <HumidityCard
                    type="humidity"
                    {...baseProps}
                    {...(cardConfig as any)}
                />
            );
        case "fan":
            return (
                <FanCard
                    type="fan"
                    {...baseProps}
                    status={typeof value === "boolean" ? (value ? "ON" : "OFF") : String(value)}
                    {...(cardConfig as any)}
                />
            );
        case "airflow":
            return (
                <AirflowCard
                    type="airflow"
                    {...baseProps}
                    {...(cardConfig as any)}
                />
            );
        case "damper":
            return (
                <DamperCard
                    type="damper"
                    {...baseProps}
                    {...(cardConfig as any)}
                />
            );
        case "power":
            return (
                <PowerCard
                    type="power"
                    {...baseProps}
                    status={typeof value === "boolean" ? (value ? "ON" : "OFF") : String(value)}
                    {...(cardConfig as any)}
                />
            );
        case "filter":
            return (
                <FilterCard
                    type="filter"
                    {...baseProps}
                    {...(cardConfig as any)}
                />
            );
        case "rpm":
        case "gauge": // Map "gauge" to RPM card as requested
            return (
                <RpmCard
                    type="rpm"
                    {...baseProps}
                    {...(cardConfig as any)}
                />
            );
        case "current":
            return (
                <CurrentCard
                    type="current"
                    {...baseProps}
                    {...(cardConfig as any)}
                />
            );
        default:
            return (
                <GenericCard
                    type="generic"
                    {...baseProps}
                    {...(cardConfig as any)}
                />
            );
    }
}
