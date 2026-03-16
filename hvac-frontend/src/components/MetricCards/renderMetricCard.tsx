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
    // Map color strings to valid MetricColor values
    const validColors = new Set<string>(["primary", "accent", "success", "warning", "destructive", "chart"]);
    let mappedColor: MetricColor;
    if (color && color.toString().startsWith("chart-")) {
        mappedColor = "chart";
    } else if (color && validColors.has(color.toString())) {
        mappedColor = color as MetricColor;
    } else {
        mappedColor = "primary";
    }

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
