import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, GripVertical, ArrowLeft, Eye, Send } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MachineDesignerApi } from "@/services/MachineDesignerApi";
import { useMachineTypes } from "@/context/MachineTypeContext";
import { routes } from "@/router/routes";
import { useTranslation } from "@/i18n/useTranslation";
import type {
  CreateMachineVariablePayload,
  CreateMachineCommandPayload,
} from "@/types/machine-type";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { renderMetricCard } from "@/components/MetricCards/renderMetricCard";

const CARD_TYPES = [
  "generic",
  "temperature",
  "humidity",
  "fan",
  "airflow",
  "damper",
  "power",
  "filter",
  "gauge",
  "rpm",
  "current",
];

const COLORS = [
  "primary",
  "accent",
  "success",
  "warning",
  "destructive",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
];

const DATA_TYPES = ["number", "string", "boolean"] as const;

interface VariableRow extends CreateMachineVariablePayload {
  _id: string; // local ID for drag-and-drop
}

interface CommandRow extends CreateMachineCommandPayload {
  _id: string;
}

const COMMAND_TYPES = ["toggle", "range", "select"] as const;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function MachineDesignerFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { refetch } = useMachineTypes();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [mqttTopic, setMqttTopic] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [variables, setVariables] = useState<VariableRow[]>([]);
  const [commands, setCommands] = useState<CommandRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [machineTypeId, setMachineTypeId] = useState<string | null>(null);

  // Load existing machine type when editing
  useEffect(() => {
    if (!id) return;

    MachineDesignerApi.getBySlug(id)
      .then((mt) => {
        setMachineTypeId(mt.id);
        setName(mt.name);
        setSlug(mt.slug);
        setSlugManual(true);
        setMqttTopic(mt.mqttTopic);
        setDescription(mt.description ?? "");
        setIcon(mt.icon ?? "");
        setVariables(
          (mt.variables ?? [])
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((v) => ({
              _id: v.id,
              key: v.key,
              label: v.label,
              dataType: v.dataType as "number" | "string" | "boolean",
              unit: v.unit,
              cardType: v.cardType,
              color: v.color,
              displayOrder: v.displayOrder,
              cardConfig: v.cardConfig,
            })),
        );
        setCommands(
          (mt.commands ?? [])
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((c) => ({
              _id: c.id,
              key: c.key,
              label: c.label,
              commandType: c.commandType as "toggle" | "range" | "select",
              config: c.config,
              displayOrder: c.displayOrder,
            })),
        );
      })
      .catch((err) => {
        toast.error((err as Error).message);
        navigate(routes.machineDesigner.list);
      });
  }, [id, navigate]);

  // Auto-generate slug and topic from name
  useEffect(() => {
    if (!slugManual) {
      const s = slugify(name);
      setSlug(s);
      setMqttTopic(s ? `${s}/#` : "");
    }
  }, [name, slugManual]);

  const addVariable = () => {
    setVariables((prev) => [
      ...prev,
      {
        _id: crypto.randomUUID(),
        key: "",
        label: "",
        dataType: "number",
        unit: "",
        cardType: "generic",
        color: "primary",
        displayOrder: prev.length,
      },
    ]);
  };

  const removeVariable = (id: string) => {
    setVariables((prev) => prev.filter((v) => v._id !== id));
  };

  const updateVariable = (
    id: string,
    field: keyof CreateMachineVariablePayload,
    value: string,
  ) => {
    setVariables((prev) =>
      prev.map((v) => (v._id === id ? { ...v, [field]: value } : v)),
    );
  };

  const updateVariableConfig = (
    id: string,
    field: string,
    value: string | number,
  ) => {
    setVariables((prev) =>
      prev.map((v) => {
        if (v._id === id) {
          return {
            ...v,
            cardConfig: {
              ...(v.cardConfig || {}),
              [field]: value,
            },
          };
        }
        return v;
      }),
    );
  };

  // Command management
  const addCommand = () => {
    setCommands((prev) => [
      ...prev,
      {
        _id: crypto.randomUUID(),
        key: "",
        label: "",
        commandType: "toggle",
        config: { onValue: "ON", offValue: "OFF" },
        displayOrder: prev.length,
      },
    ]);
  };

  const removeCommand = (cmdId: string) => {
    setCommands((prev) => prev.filter((c) => c._id !== cmdId));
  };

  const updateCommand = (
    cmdId: string,
    field: keyof CreateMachineCommandPayload,
    value: unknown,
  ) => {
    setCommands((prev) =>
      prev.map((c) => {
        if (c._id !== cmdId) return c;
        if (field === "commandType") {
          // Reset config when changing command type
          const defaults: Record<string, Record<string, unknown>> = {
            toggle: { onValue: "ON", offValue: "OFF" },
            range: { min: 0, max: 100, step: 1, unit: "%" },
            select: { options: ["LOW", "MEDIUM", "HIGH"] },
          };
          return { ...c, commandType: value as "toggle" | "range" | "select", config: defaults[value as string] ?? {} };
        }
        return { ...c, [field]: value };
      }),
    );
  };

  const updateCommandConfig = (cmdId: string, field: string, value: unknown) => {
    setCommands((prev) =>
      prev.map((c) =>
        c._id === cmdId
          ? { ...c, config: { ...(c.config || {}), [field]: value } }
          : c,
      ),
    );
  };

  const handleCommandDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setCommands((prev) => {
      const oldIndex = prev.findIndex((c) => c._id === active.id);
      const newIndex = prev.findIndex((c) => c._id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setVariables((prev) => {
      const oldIndex = prev.findIndex((v) => v._id === active.id);
      const newIndex = prev.findIndex((v) => v._id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleSave = useCallback(async () => {
    if (!name.trim() || !slug.trim() || !mqttTopic.trim()) {
      toast.error(
        t.machineDesigner?.requiredFields ??
        "Name, slug, and MQTT topic are required",
      );
      return;
    }

    if (variables.length === 0) {
      toast.error(
        t.machineDesigner?.noVariablesError ??
        "At least one variable is required",
      );
      return;
    }

    const invalidVars = variables.filter((v) => !v.key.trim() || !v.label.trim());
    if (invalidVars.length > 0) {
      toast.error(
        t.machineDesigner?.invalidVariables ??
        "All variables must have a key and label",
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        mqttTopic: mqttTopic.trim(),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        variables: variables.map((v, i) => ({
          key: v.key.trim(),
          label: v.label.trim(),
          dataType: v.dataType,
          unit: v.unit?.trim() || undefined,
          cardType: v.cardType || "generic",
          color: v.color || "primary",
          displayOrder: i,
          cardConfig: v.cardConfig,
        })),
        commands: commands
          .filter((c) => c.key.trim() && c.label.trim())
          .map((c, i) => ({
            key: c.key.trim(),
            label: c.label.trim(),
            commandType: c.commandType,
            config: c.config,
            displayOrder: i,
          })),
      };

      if (isEdit && machineTypeId) {
        await MachineDesignerApi.update(machineTypeId, payload);
        toast.success(t.machineDesigner?.saved ?? "Machine type saved");
      } else {
        await MachineDesignerApi.create(payload);
        toast.success(t.machineDesigner?.saved ?? "Machine type created");
      }

      await refetch();
      navigate(routes.machineDesigner.list);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }, [name, slug, mqttTopic, description, icon, variables, commands, isEdit, machineTypeId, refetch, navigate, t]);

  // Preview data
  const previewPoints = useMemo(() => {
    const points: Record<
      string,
      { value: number | string | boolean; unit?: string }
    > = {};
    for (const v of variables) {
      if (!v.key) continue;
      if (v.dataType === "number") {
        points[v.key] = { value: Math.round(Math.random() * 100), unit: v.unit };
      } else if (v.dataType === "boolean") {
        points[v.key] = { value: Math.random() > 0.5, unit: v.unit };
      } else {
        points[v.key] = { value: "sample", unit: v.unit };
      }
    }
    return points;
  }, [variables]);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(routes.machineDesigner.list)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t.common?.back ?? "Back"}
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit
              ? t.machineDesigner?.editMachine ?? "Edit Machine Type"
              : t.machineDesigner?.createNew ?? "Create Machine Type"}
          </h1>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t.machineDesigner?.basicInfo ?? "Basic Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.machineDesigner?.name ?? "Name"}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Motor, Compressor, Pump"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManual(true);
                }}
                placeholder="e.g. motor"
                className="font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.machineDesigner?.mqttTopic ?? "MQTT Topic"}</Label>
              <Input
                value={mqttTopic}
                onChange={(e) => setMqttTopic(e.target.value)}
                placeholder="e.g. motor/#"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                {t.machineDesigner?.topicHint ??
                  "Use # for multi-level wildcard (e.g. motor/#)"}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t.machineDesigner?.icon ?? "Icon"}</Label>
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="e.g. Cog, Gauge, Zap"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t.machineDesigner?.description ?? "Description"}</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                t.machineDesigner?.descriptionPlaceholder ??
                "Brief description of this machine type"
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Variables */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {t.machineDesigner?.variables ?? "Variables"}{" "}
              <Badge variant="secondary" className="ml-2">
                {variables.length}
              </Badge>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addVariable}>
              <Plus className="h-4 w-4 mr-1" />
              {t.machineDesigner?.addVariable ?? "Add Variable"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {variables.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                {t.machineDesigner?.noVariablesYet ??
                  "No variables defined yet. Add variables that this machine will send via MQTT."}
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={variables.map((v) => v._id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {variables.map((v) => (
                    <SortableVariableRow
                      key={v._id}
                      variable={v}
                      onUpdate={updateVariable}
                      onUpdateConfig={updateVariableConfig}
                      onRemove={removeVariable}
                      t={t}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Commands */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="h-4 w-4" />
              {t.machineDesigner?.commands ?? "Commands"}
              <Badge variant="secondary">{commands.length}</Badge>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addCommand}>
              <Plus className="h-4 w-4 mr-1" />
              {t.machineDesigner?.addCommand ?? "Add Command"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {commands.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                {t.machineDesigner?.noCommandsYet ??
                  "No commands defined. Commands allow you to send control instructions to devices."}
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleCommandDragEnd}
            >
              <SortableContext
                items={commands.map((c) => c._id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {commands.map((c) => (
                    <SortableCommandRow
                      key={c._id}
                      command={c}
                      onUpdate={updateCommand}
                      onUpdateConfig={updateCommandConfig}
                      onRemove={removeCommand}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Preview Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          {showPreview
            ? t.machineDesigner?.hidePreview ?? "Hide Preview"
            : t.machineDesigner?.showPreview ?? "Show Preview"}
        </Button>
      </div>

      {/* Preview */}
      {showPreview && variables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t.machineDesigner?.preview ?? "Dashboard Preview"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {variables
                .filter((v) => v.key)
                .map((v) => {
                  const point = previewPoints[v.key];
                  return (
                    <div key={v._id}>
                      {renderMetricCard({
                        cardType: v.cardType || "generic",
                        label: v.label || v.key,
                        value: point?.value ?? "--",
                        unit: v.unit || "",
                        color: v.color as any || "primary",
                        cardConfig: v.cardConfig,
                      })}
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pb-8">
        <Button
          variant="outline"
          onClick={() => navigate(routes.machineDesigner.list)}
        >
          {t.common?.cancel ?? "Cancel"}
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving
            ? t.common?.saving ?? "Saving..."
            : t.common?.save ?? "Save"}
        </Button>
      </div>
    </div>
  );
}

/* ─── Sortable Variable Row ─── */

function SortableVariableRow({
  variable,
  onUpdate,
  onUpdateConfig,
  onRemove,
  t,
}: {
  variable: VariableRow;
  onUpdate: (
    id: string,
    field: keyof CreateMachineVariablePayload,
    value: string,
  ) => void;
  onUpdateConfig: (id: string, field: string, value: string | number) => void;
  onRemove: (id: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: variable._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 p-3 rounded-lg border border-border bg-card"
    >
      <button
        type="button"
        className="mt-2 cursor-grab text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">{t.machineDesigner?.variableKey ?? "Key"}</Label>
          <Input
            value={variable.key}
            onChange={(e) => onUpdate(variable._id, "key", e.target.value)}
            placeholder="e.g. rpm"
            className="h-8 text-sm font-mono"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t.machineDesigner?.variableLabel ?? "Label"}</Label>
          <Input
            value={variable.label}
            onChange={(e) => onUpdate(variable._id, "label", e.target.value)}
            placeholder="e.g. RPM"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t.machineDesigner?.variableUnit ?? "Unit"}</Label>
          <Input
            value={variable.unit ?? ""}
            onChange={(e) => onUpdate(variable._id, "unit", e.target.value)}
            placeholder="e.g. RPM"
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t.machineDesigner?.variableType ?? "Type"}</Label>
          <select
            value={variable.dataType}
            onChange={(e) => onUpdate(variable._id, "dataType", e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            {DATA_TYPES.map((dt) => (
              <option key={dt} value={dt}>
                {dt}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t.machineDesigner?.cardType ?? "Card Type"}</Label>
          <select
            value={variable.cardType ?? "generic"}
            onChange={(e) => onUpdate(variable._id, "cardType", e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            {CARD_TYPES.map((ct) => (
              <option key={ct} value={ct}>
                {ct}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1 col-span-2 md:col-span-2">
          <Label className="text-xs">{t.machineDesigner?.color ?? "Color"}</Label>
          <select
            value={variable.color ?? "primary"}
            onChange={(e) => onUpdate(variable._id, "color", e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            {COLORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Card Config Fields */}
        {(variable.cardType === "rpm" || variable.cardType === "gauge") && (
          <div className="col-span-2 md:col-span-4 grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-border">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Min (RPM)</Label>
              <Input
                type="number"
                value={(variable.cardConfig?.min as number) ?? 0}
                onChange={(e) => onUpdateConfig(variable._id, "min", Number(e.target.value))}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Max (RPM)</Label>
              <Input
                type="number"
                value={(variable.cardConfig?.max as number) ?? 3600}
                onChange={(e) => onUpdateConfig(variable._id, "max", Number(e.target.value))}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Target (RPM)</Label>
              <Input
                type="number"
                value={(variable.cardConfig?.target as number) ?? 1800}
                onChange={(e) => onUpdateConfig(variable._id, "target", Number(e.target.value))}
                className="h-7 text-xs"
              />
            </div>
          </div>
        )}

        {variable.cardType === "current" && (
          <div className="col-span-2 md:col-span-4 grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-border">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Min Current</Label>
              <Input
                type="number"
                value={(variable.cardConfig?.min as number) ?? 0}
                onChange={(e) => onUpdateConfig(variable._id, "min", Number(e.target.value))}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Max Current</Label>
              <Input
                type="number"
                value={(variable.cardConfig?.max as number) ?? 100}
                onChange={(e) => onUpdateConfig(variable._id, "max", Number(e.target.value))}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Critical Level</Label>
              <Input
                type="number"
                value={(variable.cardConfig?.critical as number) ?? 80}
                onChange={(e) => onUpdateConfig(variable._id, "critical", Number(e.target.value))}
                className="h-7 text-xs"
              />
            </div>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="mt-5 h-8 w-8 p-0 text-destructive hover:text-destructive"
        onClick={() => onRemove(variable._id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

/* ─── Sortable Command Row ─── */

function SortableCommandRow({
  command,
  onUpdate,
  onUpdateConfig,
  onRemove,
}: {
  command: CommandRow;
  onUpdate: (id: string, field: keyof CreateMachineCommandPayload, value: unknown) => void;
  onUpdateConfig: (id: string, field: string, value: unknown) => void;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: command._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 p-3 rounded-lg border border-border bg-card"
    >
      <button
        type="button"
        className="mt-2 cursor-grab text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 space-y-2">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Key</Label>
            <Input
              value={command.key}
              onChange={(e) => onUpdate(command._id, "key", e.target.value)}
              placeholder="e.g. speed"
              className="h-8 text-sm font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Label</Label>
            <Input
              value={command.label}
              onChange={(e) => onUpdate(command._id, "label", e.target.value)}
              placeholder="e.g. Motor Speed"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Type</Label>
            <select
              value={command.commandType}
              onChange={(e) => onUpdate(command._id, "commandType", e.target.value)}
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {COMMAND_TYPES.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic config fields based on command type */}
        {command.commandType === "toggle" && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">ON Value</Label>
              <Input
                value={(command.config?.onValue as string) ?? "ON"}
                onChange={(e) => onUpdateConfig(command._id, "onValue", e.target.value)}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">OFF Value</Label>
              <Input
                value={(command.config?.offValue as string) ?? "OFF"}
                onChange={(e) => onUpdateConfig(command._id, "offValue", e.target.value)}
                className="h-7 text-xs"
              />
            </div>
          </div>
        )}

        {command.commandType === "range" && (
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Min</Label>
              <Input
                type="number"
                value={(command.config?.min as number) ?? 0}
                onChange={(e) => onUpdateConfig(command._id, "min", Number(e.target.value))}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Max</Label>
              <Input
                type="number"
                value={(command.config?.max as number) ?? 100}
                onChange={(e) => onUpdateConfig(command._id, "max", Number(e.target.value))}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Step</Label>
              <Input
                type="number"
                value={(command.config?.step as number) ?? 1}
                onChange={(e) => onUpdateConfig(command._id, "step", Number(e.target.value))}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Unit</Label>
              <Input
                value={(command.config?.unit as string) ?? ""}
                onChange={(e) => onUpdateConfig(command._id, "unit", e.target.value)}
                className="h-7 text-xs"
                placeholder="%"
              />
            </div>
          </div>
        )}

        {command.commandType === "select" && (
          <div className="pt-2 border-t border-border space-y-1">
            <Label className="text-[10px] text-muted-foreground">
              Options (comma-separated)
            </Label>
            <Input
              value={
                Array.isArray(command.config?.options)
                  ? (command.config.options as string[]).join(", ")
                  : ""
              }
              onChange={(e) =>
                onUpdateConfig(
                  command._id,
                  "options",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                )
              }
              className="h-7 text-xs"
              placeholder="LOW, MEDIUM, HIGH"
            />
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="mt-5 h-8 w-8 p-0 text-destructive hover:text-destructive"
        onClick={() => onRemove(command._id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
