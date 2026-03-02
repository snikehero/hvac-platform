import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Zap, DollarSign } from "lucide-react";
import type { EnergySummary } from "@/types/energy";
import { useTranslation } from "@/i18n/useTranslation";

interface Props {
  summary: EnergySummary;
  currency: string;
}

export function EnergyCostCard({ summary, currency }: Props) {
  const { t } = useTranslation();

  const DeltaIcon =
    summary.deltaPercent === null
      ? Minus
      : summary.deltaPercent > 0
        ? TrendingUp
        : TrendingDown;

  const deltaColor =
    summary.deltaPercent === null
      ? "text-muted-foreground"
      : summary.deltaPercent > 0
        ? "text-red-500"
        : "text-green-500";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Consumption */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="h-4 w-4" />
            {t.energy.totalConsumption}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {summary.totalKwh.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            <span className="text-sm font-normal text-muted-foreground ml-1">kWh</span>
          </p>
          {summary.deltaPercent !== null && (
            <p className={`text-sm flex items-center gap-1 mt-1 ${deltaColor}`}>
              <DeltaIcon className="h-3 w-3" />
              {Math.abs(summary.deltaPercent)}% {t.energy.periodDelta}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Total Cost */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            {t.energy.totalCost}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {currency}{summary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>

      {/* Avg per AHU */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t.energy.avgPerAhu}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {summary.avgKwhPerAhu.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            <span className="text-sm font-normal text-muted-foreground ml-1">kWh</span>
          </p>
          <Badge variant="secondary" className="mt-1 text-xs">
            {summary.rankingRows.length} AHUs
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
