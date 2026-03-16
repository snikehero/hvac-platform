import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMachineTypes } from "@/context/MachineTypeContext";
import { useAnalyticsData, linearRegression } from "./hooks/useAnalyticsData";
import { TrendChart } from "./components/TrendChart";
import { ComparisonChart } from "./components/ComparisonChart";
import { DistributionChart } from "./components/DistributionChart";

export default function AnalyticsDashboardPage() {
  const { machineType: slug } = useParams<{ machineType: string }>();
  const { machineTypes } = useMachineTypes();
  const machineType = useMemo(
    () => machineTypes.find((mt) => mt.slug === slug),
    [machineTypes, slug],
  );

  const numericVars = useMemo(
    () => (machineType?.variables ?? [])
      .filter((v) => v.dataType === "number")
      .sort((a, b) => a.displayOrder - b.displayOrder),
    [machineType],
  );

  const [selectedKey, setSelectedKey] = useState<string>(() => numericVars[0]?.key ?? "");
  const selectedVar = numericVars.find((v) => v.key === selectedKey) ?? numericVars[0];

  const { stationSeries } = useAnalyticsData(slug, selectedVar?.key);

  const currentValues = useMemo(
    () => stationSeries.map((s) => s.currentValue).filter((v): v is number => v !== null),
    [stationSeries],
  );

  const trendSummaries = useMemo(
    () =>
      stationSeries
        .filter((s) => s.points.length >= 2)
        .map((s) => {
          const reg = linearRegression(s.points);
          const direction = !reg ? "stable" : reg.slope > 0.01 ? "up" : reg.slope < -0.01 ? "down" : "stable";
          const last = s.points[s.points.length - 1]?.value ?? null;
          return { ...s, direction, last };
        }),
    [stationSeries],
  );

  if (!machineType) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Machine type not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{machineType.name} Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Historical trends and variable analysis
            </p>
          </div>
        </div>

        {/* Variable selector */}
        <Select
          value={selectedVar?.key ?? ""}
          onValueChange={setSelectedKey}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select variable" />
          </SelectTrigger>
          <SelectContent>
            {numericVars.map((v) => (
              <SelectItem key={v.key} value={v.key}>
                {v.label}{v.unit ? ` (${v.unit})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {numericVars.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground text-sm">
            No numeric variables configured for this machine type.
          </CardContent>
        </Card>
      )}

      {selectedVar && (
        <>
          {/* Trend summary cards */}
          {trendSummaries.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
              {trendSummaries.map((s) => (
                <Card key={`${s.plantId}-${s.stationId}`} className="py-3 px-4">
                  <p className="text-xs text-muted-foreground truncate">{s.stationId}</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-black tabular-nums">
                      {s.last !== null ? s.last.toFixed(1) : "--"}
                    </span>
                    {selectedVar.unit && (
                      <span className="text-xs text-muted-foreground">{selectedVar.unit}</span>
                    )}
                    <span className={`text-xs ml-auto ${
                      s.direction === "up" ? "text-red-400" :
                      s.direction === "down" ? "text-green-400" :
                      "text-muted-foreground"
                    }`}>
                      {s.direction === "up" ? "↑" : s.direction === "down" ? "↓" : "→"}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Trend chart — first station with history */}
          {(() => {
            const primary = stationSeries.find((s) => s.points.length >= 2);
            if (!primary) return null;
            return (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Trend — {primary.stationId}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      with linear regression
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TrendChart
                    points={primary.points}
                    label={selectedVar.label}
                    unit={selectedVar.unit}
                    color="#3b82f6"
                  />
                </CardContent>
              </Card>
            );
          })()}

          {/* Comparison chart */}
          {stationSeries.filter((s) => s.points.length >= 2).length > 1 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Station Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ComparisonChart series={stationSeries} unit={selectedVar.unit} />
              </CardContent>
            </Card>
          )}

          {/* Distribution */}
          {currentValues.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Current Value Distribution
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    {currentValues.length} station{currentValues.length !== 1 ? "s" : ""}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DistributionChart
                  values={currentValues}
                  unit={selectedVar.unit}
                  color="#3b82f6"
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
