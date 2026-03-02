import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ReportData } from "@/types/report";
import { useTranslation } from "@/i18n/useTranslation";

interface Props {
  report: ReportData;
}

export function ReportPreview({ report }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      {/* Report header */}
      <div className="flex items-center gap-3 flex-wrap">
        <h3 className="font-semibold text-lg">{report.title}</h3>
        <Badge variant="secondary">
          {new Date(report.generatedAt).toLocaleString()}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {report.config.startDate} → {report.config.endDate}
        </span>
      </div>

      {/* Sections */}
      {report.sections.map((section) => (
        <Card key={section.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {section.rows.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">{t.common.noData}</div>
            ) : (
              <ScrollArea className="max-h-72">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        {section.columns.map((col) => (
                          <th key={col} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.slice(0, 100).map((row, idx) => (
                        <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/30">
                          {section.columns.map((col) => (
                            <td key={col} className="px-3 py-2 whitespace-nowrap">
                              {String(row[col] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {section.rows.length > 100 && (
                        <tr>
                          <td
                            colSpan={section.columns.length}
                            className="px-3 py-2 text-center text-muted-foreground"
                          >
                            … and {section.rows.length - 100} more rows
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
