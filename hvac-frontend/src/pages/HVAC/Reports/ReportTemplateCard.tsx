import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReportTemplateId } from "@/types/report";

interface Props {
  id: ReportTemplateId;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

export function ReportTemplateCard({ title, description, selected, onSelect }: Props) {
  return (
    <Card
      onClick={onSelect}
      className={cn(
        "cursor-pointer transition-all hover:border-primary",
        selected && "border-primary ring-2 ring-primary/20",
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
