import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricCardBase } from "@/components/MetricCards/components/MetricCardBase";
import { Thermometer } from "lucide-react";

const placeholder = <div data-testid="svg-placeholder" />;

describe("MetricCardBase - Disconnected State", () => {
  it("shows '--' when value is undefined (disconnected machine)", () => {
    render(
      <MetricCardBase
        icon={Thermometer}
        label="Temperature"
        value={undefined}
        unit="°C"
        quality={undefined}
        color="primary"
      >{placeholder}</MetricCardBase>,
    );

    expect(screen.getByText("--")).toBeInTheDocument();
  });

  it("shows '--' when value is null", () => {
    render(
      <MetricCardBase
        icon={Thermometer}
        label="Humidity"
        value={null as any}
        unit="%"
        quality={undefined}
        color="accent"
      >{placeholder}</MetricCardBase>,
    );

    expect(screen.getByText("--")).toBeInTheDocument();
  });

  it("shows the actual value when provided", () => {
    render(
      <MetricCardBase
        icon={Thermometer}
        label="Temperature"
        value="22.0"
        unit="°C"
        quality="GOOD"
        color="primary"
      >{placeholder}</MetricCardBase>,
    );

    expect(screen.getByText("22.0")).toBeInTheDocument();
    expect(screen.queryByText("--")).not.toBeInTheDocument();
  });

  it("does not show quality indicator when quality is undefined", () => {
    render(
      <MetricCardBase
        icon={Thermometer}
        label="Temperature"
        value={undefined}
        unit="°C"
        quality={undefined}
        color="primary"
      >{placeholder}</MetricCardBase>,
    );

    expect(screen.queryByText(/Quality:/)).not.toBeInTheDocument();
    expect(screen.getByText("Temperature")).toBeInTheDocument();
  });

  it("shows quality indicator when provided", () => {
    render(
      <MetricCardBase
        icon={Thermometer}
        label="Temperature"
        value="22.0"
        unit="°C"
        quality="GOOD"
        color="primary"
      >{placeholder}</MetricCardBase>,
    );

    expect(screen.getByText("Quality: GOOD")).toBeInTheDocument();
  });

  it("renders label regardless of value", () => {
    render(
      <MetricCardBase
        icon={Thermometer}
        label="Custom Sensor"
        value={undefined}
        unit="V"
        quality={undefined}
        color="chart"
      >{placeholder}</MetricCardBase>,
    );

    expect(screen.getByText("Custom Sensor")).toBeInTheDocument();
  });

  it("renders unit text when provided", () => {
    render(
      <MetricCardBase
        icon={Thermometer}
        label="Temperature"
        value="22.0"
        unit="°C"
        quality="GOOD"
        color="primary"
      >{placeholder}</MetricCardBase>,
    );

    expect(screen.getByText("°C")).toBeInTheDocument();
  });
});
