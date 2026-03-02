import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EnergyRankingRow } from "@/types/energy";
import { useTranslation } from "@/i18n/useTranslation";

interface Props {
  rows: EnergyRankingRow[];
  currency: string;
}

export function EnergyRankingTable({ rows, currency }: Props) {
  const { t } = useTranslation();

  if (rows.length === 0) {
    return null;
  }

  const maxKwh = rows[0]?.totalKwh ?? 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.energy.ranking.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">#</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">
                  {t.energy.ranking.ahu}
                </th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">
                  {t.energy.ranking.plant}
                </th>
                <th className="px-4 py-3 text-right text-muted-foreground font-medium">
                  {t.energy.ranking.consumption}
                </th>
                <th className="px-4 py-3 text-right text-muted-foreground font-medium">
                  {t.energy.ranking.cost}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const barWidth = maxKwh > 0 ? (row.totalKwh / maxKwh) * 100 : 0;
                return (
                  <tr key={`${row.plantId}-${row.stationId}`} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{row.stationId}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{row.plantId}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span>
                          {row.totalKwh.toLocaleString(undefined, { maximumFractionDigits: 1 })} kWh
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {currency}{row.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
