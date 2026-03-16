import { useState } from "react";
import { Send, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCommands } from "@/hooks/useCommands";
import { useTranslation } from "@/i18n/useTranslation";
import type { MachineCommand } from "@/types/machine-type";
import type { CommandRequest, CommandStatus } from "@/types/command";

interface GenericCommandsPanelProps {
  machineType: string;
  plantId: string;
  stationId: string;
  commands: MachineCommand[];
  currentPoints: Record<string, { value: unknown }>;
}

function StatusBadge({ status }: { status: CommandStatus }) {
  const { t } = useTranslation();
  if (status === "idle") return null;

  const config = {
    pending: {
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
      label: t.commandsPanel.sending,
      className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    success: {
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: t.commandsPanel.success,
      className: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    error: {
      icon: <XCircle className="w-3 h-3" />,
      label: t.commandsPanel.error,
      className: "bg-destructive/20 text-destructive border-destructive/30",
    },
    timeout: {
      icon: <Clock className="w-3 h-3" />,
      label: t.commandsPanel.timeout,
      className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
  };

  const cfg = config[status];
  return (
    <Badge variant="outline" className={`flex items-center gap-1 text-xs ${cfg.className}`}>
      {cfg.icon}
      {cfg.label}
    </Badge>
  );
}

export function GenericCommandsPanel({
  machineType,
  plantId,
  stationId,
  commands,
  currentPoints,
}: GenericCommandsPanelProps) {
  const { t } = useTranslation();
  const { sendCommand, status, lastResult, reset } = useCommands();
  const isPending = status === "pending";

  const sortedCommands = [...commands].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  function send(req: Omit<CommandRequest, "machineType" | "plantId" | "stationId">) {
    if (isPending) return;
    reset();
    sendCommand({ machineType, plantId, stationId, ...req });
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            {t.commandsPanel.title}
          </CardTitle>
          <StatusBadge status={status} />
        </div>
        {lastResult?.message && status !== "pending" && (
          <p className="text-xs text-muted-foreground mt-1">{lastResult.message}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-5">
        {sortedCommands.map((cmd, idx) => (
          <div key={cmd.id}>
            {idx > 0 && <div className="border-t border-border mb-5" />}
            <CommandControl
              command={cmd}
              currentValue={currentPoints[cmd.key]?.value}
              isPending={isPending}
              onSend={send}
            />
          </div>
        ))}

        {sortedCommands.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t.commandsPanel.noCommands}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface CommandControlProps {
  command: MachineCommand;
  currentValue: unknown;
  isPending: boolean;
  onSend: (req: { command: string; value: string | number }) => void;
}

function CommandControl({ command, currentValue, isPending, onSend }: CommandControlProps) {
  switch (command.commandType) {
    case "toggle":
      return (
        <ToggleControl
          command={command}
          currentValue={currentValue}
          isPending={isPending}
          onSend={onSend}
        />
      );
    case "range":
      return (
        <RangeControl
          command={command}
          currentValue={currentValue}
          isPending={isPending}
          onSend={onSend}
        />
      );
    case "select":
      return (
        <SelectControl
          command={command}
          currentValue={currentValue}
          isPending={isPending}
          onSend={onSend}
        />
      );
    default:
      return null;
  }
}

function ToggleControl({ command, currentValue, isPending, onSend }: CommandControlProps) {
  const { t } = useTranslation();
  const config = (command.config ?? {}) as { onValue?: string; offValue?: string };
  const onValue = config.onValue ?? t.commandsPanel.on;
  const offValue = config.offValue ?? t.commandsPanel.off;
  const currentStr = String(currentValue ?? "");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{command.label}</span>
        {currentValue !== undefined && (
          <Badge
            variant="outline"
            className={
              currentStr === onValue
                ? "border-green-500/50 text-green-400"
                : "border-muted text-muted-foreground"
            }
          >
            {currentStr}
          </Badge>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={currentStr === onValue ? "default" : "outline"}
          className="flex-1"
          disabled={isPending || currentStr === onValue}
          onClick={() => onSend({ command: command.key, value: onValue })}
        >
          {onValue}
        </Button>
        <Button
          size="sm"
          variant={currentStr === offValue ? "destructive" : "outline"}
          className="flex-1"
          disabled={isPending || currentStr === offValue}
          onClick={() => onSend({ command: command.key, value: offValue })}
        >
          {offValue}
        </Button>
      </div>
    </div>
  );
}

function RangeControl({ command, currentValue, isPending, onSend }: CommandControlProps) {
  const { t, tf } = useTranslation();
  const config = (command.config ?? {}) as {
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
  };
  const min = config.min ?? 0;
  const max = config.max ?? 100;
  const step = config.step ?? 1;
  const unit = config.unit ?? "";

  const [localValue, setLocalValue] = useState<number>(
    typeof currentValue === "number" ? currentValue : Math.round((min + max) / 2),
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{command.label}</span>
        {currentValue !== undefined && (
          <Badge variant="outline" className="text-muted-foreground">
            {tf(t.commandsPanel.current, { value: `${String(currentValue)}${unit}` })}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          disabled={isPending}
          onChange={(e) => setLocalValue(Number(e.target.value))}
          className="flex-1 h-2 rounded-full accent-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span className="text-sm font-mono w-16 text-right">
          {localValue}{unit}
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        disabled={isPending}
        onClick={() => onSend({ command: command.key, value: localValue })}
      >
        <Send className="w-3 h-3 mr-2" />
        {tf(t.commandsPanel.setTo, { label: command.label, value: `${localValue}${unit}` })}
      </Button>
    </div>
  );
}

function SelectControl({ command, currentValue, isPending, onSend }: CommandControlProps) {
  const { t, tf } = useTranslation();
  const config = (command.config ?? {}) as { options?: string[] };
  const options = config.options ?? [];
  const [selected, setSelected] = useState<string>(
    typeof currentValue === "string" ? currentValue : options[0] ?? "",
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{command.label}</span>
        {currentValue !== undefined && (
          <Badge variant="outline" className="text-muted-foreground">
            {tf(t.commandsPanel.current, { value: String(currentValue) })}
          </Badge>
        )}
      </div>
      <div className="flex gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={isPending}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending || !selected}
          onClick={() => onSend({ command: command.key, value: selected })}
        >
          <Send className="w-3 h-3 mr-1" />
          {t.commandsPanel.send}
        </Button>
      </div>
    </div>
  );
}
