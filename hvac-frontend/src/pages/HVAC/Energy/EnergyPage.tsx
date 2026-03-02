import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, RefreshCw } from "lucide-react";
import { useEnergyData } from "@/hooks/useEnergyData";
import { EnergyCostCard } from "./EnergyCostCard";
import { EnergyTrendChart } from "./EnergyTrendChart";
import { EnergyRankingTable } from "./EnergyRankingTable";
import { EnergyComparisonChart } from "./EnergyComparisonChart";
import { useSettings } from "@/context/SettingsContext";
import { useTranslation } from "@/i18n/useTranslation";
import type { EnergyPeriod, AggregationType } from "@/types/energy";

export default function EnergyPage() {
  const { t } = useTranslation();
  const { settings } = useSettings();

  const costPerKwh = settings.energy?.costPerKwh ?? 0.12;
  const currency = settings.energy?.currency ?? "$";

  const [period, setPeriod] = useState<EnergyPeriod>("last7d");
  const [aggregation, setAggregation] = useState<AggregationType>("daily");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  const { currentPoints, previousPoints, summary, loading, error, fetch } = useEnergyData();

  const load = () => {
    void fetch({ period, aggregation, costPerKwh });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, aggregation, costPerKwh]);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            {t.energy.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t.energy.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Period Selector */}
          <Select value={period} onValueChange={(v) => setPeriod(v as EnergyPeriod)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last24h">{t.energy.period.last24h}</SelectItem>
              <SelectItem value="last7d">{t.energy.period.last7d}</SelectItem>
              <SelectItem value="last30d">{t.energy.period.last30d}</SelectItem>
            </SelectContent>
          </Select>

          {/* Aggregation */}
          <Tabs value={aggregation} onValueChange={(v) => setAggregation(v as AggregationType)}>
            <TabsList>
              <TabsTrigger value="hourly">{t.energy.aggregation.hourly}</TabsTrigger>
              <TabsTrigger value="daily">{t.energy.aggregation.daily}</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Chart Type */}
          <Tabs value={chartType} onValueChange={(v) => setChartType(v as "bar" | "line")}>
            <TabsList>
              <TabsTrigger value="bar">Bar</TabsTrigger>
              <TabsTrigger value="line">Line</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="outline" size="icon" onClick={load} title="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      {loading && !summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : summary ? (
        <EnergyCostCard summary={summary} currency={currency} />
      ) : null}

      {/* Trend Chart */}
      {loading && !summary ? (
        <Skeleton className="h-80 rounded-xl" />
      ) : (
        <EnergyTrendChart points={currentPoints} chartType={chartType} />
      )}

      {/* Comparison + Ranking */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnergyComparisonChart
            currentPoints={currentPoints}
            previousPoints={previousPoints}
          />
          <EnergyRankingTable rows={summary.rankingRows} currency={currency} />
        </div>
      )}
    </div>
  );
}
