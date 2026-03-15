import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Cpu, Wifi } from "lucide-react";
import { useMachineTypes } from "@/context/MachineTypeContext";
import { MachineDesignerApi } from "@/services/MachineDesignerApi";
import { routes } from "@/router/routes";
import { useTranslation } from "@/i18n/useTranslation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function MachineDesignerListPage() {
  const { machineTypes, loading, refetch } = useMachineTypes();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t.machineDesigner?.confirmDelete ?? `Delete "${name}"?`)) return;

    setDeleting(id);
    try {
      await MachineDesignerApi.delete(id);
      toast.success(t.machineDesigner?.deleted ?? "Machine type deleted");
      await refetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t.machineDesigner?.title ?? "Machine Designer"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t.machineDesigner?.subtitle ??
              "Define custom machine types with their variables and dashboard layouts"}
          </p>
        </div>
        <Button
          onClick={() => navigate(routes.machineDesigner.create)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {t.machineDesigner?.createNew ?? "Create Machine Type"}
        </Button>
      </div>

      {/* Grid */}
      {machineTypes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Cpu className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">
              {t.machineDesigner?.noMachineTypes ??
                "No machine types defined yet"}
            </h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              {t.machineDesigner?.noMachineTypesDesc ??
                "Create your first machine type to start monitoring custom equipment via MQTT."}
            </p>
            <Button
              onClick={() => navigate(routes.machineDesigner.create)}
              className="mt-6 gap-2"
            >
              <Plus className="h-4 w-4" />
              {t.machineDesigner?.createNew ?? "Create Machine Type"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machineTypes.map((mt) => (
            <Card
              key={mt.id}
              className="group hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(routes.machine.dashboard(mt.slug))}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{mt.name}</CardTitle>
                      <CardDescription className="text-xs font-mono">
                        {mt.slug}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs font-mono gap-1"
                  >
                    <Wifi className="h-3 w-3" />
                    {mt.mqttTopic}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {mt.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {mt.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {mt.variables.slice(0, 5).map((v) => (
                    <Badge key={v.id} variant="secondary" className="text-xs">
                      {v.label}
                      {v.unit ? ` (${v.unit})` : ""}
                    </Badge>
                  ))}
                  {mt.variables.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{mt.variables.length - 5}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {mt.variables.length}{" "}
                    {t.machineDesigner?.variables ?? "variables"}
                  </span>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        navigate(routes.machineDesigner.edit(mt.id))
                      }
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      disabled={deleting === mt.id}
                      onClick={() => handleDelete(mt.id, mt.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
