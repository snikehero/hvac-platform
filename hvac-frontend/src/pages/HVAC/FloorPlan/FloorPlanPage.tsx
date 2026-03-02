import { useState } from "react";
import {
  Map as MapIcon,
  Plus,
  Pencil,
  Eye,
  Trash2,
  Upload,
  Wifi,
  WifiOff,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useFloorPlan } from "@/context/FloorPlanContext";
import { FloorPlanCanvas } from "./FloorPlanCanvas";
import { FloorPlanStatusBar } from "./FloorPlanStatusBar";
import { AhuQuickPanel } from "./AhuQuickPanel";
import { useTelemetry } from "@/hooks/useTelemetry";
import { getAhuHealth, type AhuHealthStatus } from "@/domain/ahu/getAhuHealth";
import { useTranslation } from "@/i18n/useTranslation";
import type { AhuMarkerPosition } from "@/types/floorplan";
import type { HvacTelemetry } from "@/types/telemetry";

export default function FloorPlanPage() {
  const { t } = useTranslation();
  const {
    floors,
    activeFloor,
    activeFloorId,
    setActiveFloor,
    addFloor,
    renameFloor,
    removeFloor,
    setFloorImage,
    addMarker,
    updateMarkerPosition,
    removeMarker,
  } = useFloorPlan();

  const { telemetry, ahuConnectionStatus } = useTelemetry();

  // Build lookup maps for fast access in the canvas
  const telemetryMap = new Map<string, HvacTelemetry>(
    telemetry.map((ahu) => [`${ahu.plantId}-${ahu.stationId}`, ahu]),
  );
  const connectionMap = new Map<string, boolean>(
    Object.entries(ahuConnectionStatus).map(([k, v]) => [k, v.isConnected]),
  );

  const [editMode, setEditMode] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<AhuMarkerPosition | null>(null);

  // Add floor dialog state
  const [showAddFloor, setShowAddFloor] = useState(false);
  const [newFloorName, setNewFloorName] = useState("");

  // Add AHU dialog state
  const [showAddAhu, setShowAddAhu] = useState(false);
  const [addAhuTab, setAddAhuTab] = useState<"pick" | "manual">("pick");
  const [ahuSearch, setAhuSearch] = useState("");
  const [newAhuId, setNewAhuId] = useState("");
  const [newPlantId, setNewPlantId] = useState("");
  const [newAhuLabel, setNewAhuLabel] = useState("");

  // Rename floor state
  const [renamingFloorId, setRenamingFloorId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  function handleAddFloor() {
    if (!newFloorName.trim()) return;
    addFloor(newFloorName.trim());
    setNewFloorName("");
    setShowAddFloor(false);
  }

  function resetAddAhuDialog() {
    setNewAhuId("");
    setNewPlantId("");
    setNewAhuLabel("");
    setAhuSearch("");
    setAddAhuTab("pick");
  }

  function handleAddAhu() {
    if (!activeFloorId || !newAhuId.trim() || !newPlantId.trim()) return;
    addMarker(activeFloorId, {
      ahuId: newAhuId.trim(),
      plantId: newPlantId.trim(),
      label: newAhuLabel.trim() || newAhuId.trim(),
      x: 50,
      y: 50,
    });
    resetAddAhuDialog();
    setShowAddAhu(false);
  }

  function handlePickAhu(ahu: { plantId: string; stationId: string }) {
    if (!activeFloorId) return;
    addMarker(activeFloorId, {
      ahuId: ahu.stationId,
      plantId: ahu.plantId,
      label: ahu.stationId,
      x: 50,
      y: 50,
    });
    resetAddAhuDialog();
    setShowAddAhu(false);
  }

  function handleMarkerClick(marker: AhuMarkerPosition) {
    const mid = `${marker.plantId}::${marker.ahuId}`;
    if (selectedMarkerId === mid) {
      setSelectedMarkerId(null);
      setSelectedMarker(null);
    } else {
      setSelectedMarkerId(mid);
      setSelectedMarker(marker);
    }
  }

  function handleMarkerMove(ahuId: string, plantId: string, x: number, y: number) {
    if (!activeFloorId) return;
    updateMarkerPosition(activeFloorId, ahuId, plantId, x, y);
  }

  function handleRemoveSelectedMarker() {
    if (!activeFloorId || !selectedMarker) return;
    removeMarker(activeFloorId, selectedMarker.ahuId, selectedMarker.plantId);
    setSelectedMarkerId(null);
    setSelectedMarker(null);
  }

  function handleStartRename(floor: { id: string; name: string }) {
    setRenamingFloorId(floor.id);
    setRenameValue(floor.name);
  }

  function handleCommitRename() {
    if (renamingFloorId && renameValue.trim()) {
      renameFloor(renamingFloorId, renameValue.trim());
    }
    setRenamingFloorId(null);
    setRenameValue("");
  }

  // Derive quick panel data
  const quickPanelTelemetry = selectedMarker
    ? telemetryMap.get(`${selectedMarker.plantId}-${selectedMarker.ahuId}`) ?? null
    : null;
  const quickPanelConnected = selectedMarker
    ? (connectionMap.get(`${selectedMarker.plantId}-${selectedMarker.ahuId}`) ?? false)
    : false;
  const quickPanelStatus = quickPanelTelemetry
    ? getAhuHealth(quickPanelTelemetry).status
    : "DISCONNECTED";

  // Compute status counts for the active floor
  const statusCounts = { OK: 0, WARNING: 0, ALARM: 0, DISCONNECTED: 0 };
  if (activeFloor) {
    for (const marker of activeFloor.markers) {
      const key = `${marker.plantId}-${marker.ahuId}`;
      const isConnected = connectionMap.get(key) ?? false;
      if (!isConnected) {
        statusCounts.DISCONNECTED++;
      } else {
        const tel = telemetryMap.get(key);
        const s: AhuHealthStatus = tel ? getAhuHealth(tel).status : "DISCONNECTED";
        statusCounts[s]++;
      }
    }
  }

  // Jump to first marker with the given status
  function handleStatusChipClick(status: AhuHealthStatus) {
    if (!activeFloor) return;
    for (const marker of activeFloor.markers) {
      const key = `${marker.plantId}-${marker.ahuId}`;
      const isConnected = connectionMap.get(key) ?? false;
      let markerStatus: AhuHealthStatus = "DISCONNECTED";
      if (isConnected) {
        const tel = telemetryMap.get(key);
        markerStatus = tel ? getAhuHealth(tel).status : "DISCONNECTED";
      }
      if (markerStatus === status) {
        setSelectedMarkerId(`${marker.plantId}::${marker.ahuId}`);
        setSelectedMarker(marker);
        return;
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapIcon className="h-6 w-6" />
            {t.floorPlan.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t.floorPlan.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {activeFloor && (
            <>
              {/* View / Edit toggle */}
              <Button
                variant={editMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setEditMode((v) => !v);
                  setSelectedMarkerId(null);
                  setSelectedMarker(null);
                }}
                className="gap-2"
              >
                {editMode ? (
                  <><Eye className="h-4 w-4" />View Mode</>
                ) : (
                  <><Pencil className="h-4 w-4" />Edit Mode</>
                )}
              </Button>

              {/* Upload image */}
              {editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file || !activeFloorId) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const result = ev.target?.result;
                        if (typeof result === "string") setFloorImage(activeFloorId, result);
                      };
                      reader.readAsDataURL(file);
                    };
                    input.click();
                  }}
                >
                  <Upload className="h-4 w-4" />
                  {activeFloor.imageDataUrl ? "Replace Image" : "Upload Image"}
                </Button>
              )}

              {/* Add AHU (edit mode only) */}
              {editMode && (
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowAddAhu(true)}
                >
                  <Plus className="h-4 w-4" />
                  {t.floorPlan.addAhu}
                </Button>
              )}
            </>
          )}

          {/* Add floor */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowAddFloor(true)}
          >
            <Plus className="h-4 w-4" />
            {t.floorPlan.addFloor}
          </Button>
        </div>
      </div>

      {/* Floor tabs */}
      {floors.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {floors.map((floor) => (
            <div key={floor.id} className="flex items-center gap-1">
              {renamingFloorId === floor.id ? (
                <Input
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={handleCommitRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCommitRename();
                    if (e.key === "Escape") setRenamingFloorId(null);
                  }}
                  className="h-7 w-32 text-xs"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setActiveFloor(floor.id)}
                  onDoubleClick={() => handleStartRename(floor)}
                  className={`rounded-md px-3 py-1 text-sm transition-colors ${
                    activeFloorId === floor.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {floor.name}
                </button>
              )}
              {activeFloorId === floor.id && editMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (confirm(`Remove floor "${floor.name}"?`)) removeFloor(floor.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main area */}
      {floors.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border text-center p-10">
          <MapIcon className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="font-medium">{t.floorPlan.noFloors}</p>
            <p className="text-sm text-muted-foreground mt-1">{t.floorPlan.noFloorsHint}</p>
          </div>
          <Button onClick={() => setShowAddFloor(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t.floorPlan.addFloor}
          </Button>
        </div>
      ) : activeFloor ? (
        <div className="flex flex-1 flex-col gap-3 min-h-0">
          {/* Status summary bar */}
          <FloorPlanStatusBar
            counts={statusCounts}
            total={activeFloor.markers.length}
            onStatusClick={handleStatusChipClick}
          />

          <div className="flex flex-1 gap-4 min-h-0">
            {/* Canvas */}
            <div className="flex flex-1 flex-col">
              <FloorPlanCanvas
                floor={activeFloor}
                telemetryMap={telemetryMap}
                connectionMap={connectionMap}
                editMode={editMode}
                selectedMarkerId={selectedMarkerId}
                onMarkerClick={handleMarkerClick}
                onMarkerMove={handleMarkerMove}
                onImageUploaded={(url) => setFloorImage(activeFloor.id, url)}
                onCanvasClick={() => {
                  if (!editMode) {
                    setSelectedMarkerId(null);
                    setSelectedMarker(null);
                  }
                }}
              />
            </div>

            {/* Quick panel — view mode */}
            {selectedMarker && !editMode && (
              <div className="shrink-0">
                <AhuQuickPanel
                  ahuId={selectedMarker.ahuId}
                  plantId={selectedMarker.plantId}
                  label={selectedMarker.label ?? selectedMarker.ahuId}
                  status={quickPanelStatus}
                  telemetry={quickPanelTelemetry}
                  isConnected={quickPanelConnected}
                  onClose={() => {
                    setSelectedMarkerId(null);
                    setSelectedMarker(null);
                  }}
                />
              </div>
            )}

            {/* Edit mode: selected marker actions */}
            {selectedMarker && editMode && (
              <div className="shrink-0 w-48">
                <div className="rounded-lg border border-border bg-card p-3 flex flex-col gap-2">
                  <p className="text-xs font-semibold">Selected</p>
                  <p className="text-xs text-muted-foreground font-mono">{selectedMarker.ahuId}</p>
                  <p className="text-xs text-muted-foreground">{selectedMarker.plantId}</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2 mt-1"
                    onClick={handleRemoveSelectedMarker}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove Marker
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Add Floor dialog — accessible via shadcn Dialog */}
      <Dialog open={showAddFloor} onOpenChange={(open) => { setShowAddFloor(open); if (!open) setNewFloorName(""); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.floorPlan.addFloor}</DialogTitle>
          </DialogHeader>
          <div>
            <Label className="text-xs text-muted-foreground">{t.floorPlan.floorName}</Label>
            <Input
              autoFocus
              value={newFloorName}
              onChange={(e) => setNewFloorName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddFloor()}
              placeholder={t.floorPlan.floorNamePlaceholder}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFloor(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFloor} disabled={!newFloorName.trim()}>
              {t.floorPlan.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add AHU dialog — two-tab: picker + manual */}
      <Dialog open={showAddAhu} onOpenChange={(open) => { setShowAddAhu(open); if (!open) resetAddAhuDialog(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.floorPlan.addAhu}</DialogTitle>
          </DialogHeader>

          {/* Tab switcher */}
          <div className="flex rounded-md border border-border overflow-hidden text-sm">
            <button
              onClick={() => setAddAhuTab("pick")}
              className={`flex-1 py-1.5 transition-colors font-medium ${
                addAhuTab === "pick"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              Connected AHUs
            </button>
            <button
              onClick={() => setAddAhuTab("manual")}
              className={`flex-1 py-1.5 transition-colors font-medium ${
                addAhuTab === "manual"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              Manual Entry
            </button>
          </div>

          {addAhuTab === "pick" ? (() => {
            // AHUs already placed on this floor
            const placedKeys = new Set(
              (activeFloor?.markers ?? []).map((m) => `${m.plantId}::${m.stationId ?? m.ahuId}`)
            );
            // Also track by ahuId key format used in markers
            const placedByAhu = new Set(
              (activeFloor?.markers ?? []).map((m) => `${m.plantId}::${m.ahuId}`)
            );

            const searchLower = ahuSearch.toLowerCase();
            const filtered = telemetry.filter((ahu) => {
              if (!searchLower) return true;
              return (
                ahu.stationId.toLowerCase().includes(searchLower) ||
                ahu.plantId.toLowerCase().includes(searchLower)
              );
            });

            return (
              <div className="flex flex-col gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    autoFocus
                    value={ahuSearch}
                    onChange={(e) => setAhuSearch(e.target.value)}
                    placeholder="Search by AHU ID or Plant ID..."
                    className="pl-8 h-8 text-sm"
                  />
                </div>

                {/* AHU list */}
                <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
                  {filtered.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-6">
                      {telemetry.length === 0
                        ? "No AHUs are currently connected."
                        : "No AHUs match your search."}
                    </p>
                  )}
                  {filtered.map((ahu) => {
                    const key = `${ahu.plantId}::${ahu.stationId}`;
                    const isPlaced = placedKeys.has(key) || placedByAhu.has(key);
                    const isConnected = connectionMap.get(`${ahu.plantId}-${ahu.stationId}`) ?? false;

                    return (
                      <div
                        key={key}
                        className={`flex items-center justify-between rounded-md border px-3 py-2 gap-2 transition-colors
                          ${isPlaced
                            ? "border-border/40 bg-muted/30 opacity-60 cursor-default"
                            : "border-border hover:bg-muted/50 cursor-pointer"
                          }
                        `}
                        onClick={() => !isPlaced && handlePickAhu(ahu)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isConnected
                            ? <Wifi className="h-3.5 w-3.5 text-green-400 shrink-0" />
                            : <WifiOff className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          }
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate">{ahu.stationId}</span>
                            <span className="text-xs text-muted-foreground truncate">{ahu.plantId}</span>
                          </div>
                        </div>
                        {isPlaced ? (
                          <Badge variant="outline" className="text-[10px] shrink-0">Placed</Badge>
                        ) : (
                          <Button size="sm" variant="outline" className="h-6 text-xs px-2 shrink-0"
                            onClick={(e) => { e.stopPropagation(); handlePickAhu(ahu); }}
                          >
                            Place
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="text-[10px] text-muted-foreground">
                  {telemetry.length} AHU{telemetry.length !== 1 ? "s" : ""} connected · Click a row or "Place" to add to the floor
                </p>
              </div>
            );
          })() : (
            // Manual entry tab
            <div className="flex flex-col gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Plant ID</Label>
                <Input
                  autoFocus
                  value={newPlantId}
                  onChange={(e) => setNewPlantId(e.target.value)}
                  placeholder="e.g. plant-1"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">AHU ID</Label>
                <Input
                  value={newAhuId}
                  onChange={(e) => setNewAhuId(e.target.value)}
                  placeholder="e.g. AHU-01"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Label (optional)</Label>
                <Input
                  value={newAhuLabel}
                  onChange={(e) => setNewAhuLabel(e.target.value)}
                  placeholder="Display name"
                  onKeyDown={(e) => e.key === "Enter" && handleAddAhu()}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {addAhuTab === "manual" && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddAhu(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddAhu}
                disabled={!newAhuId.trim() || !newPlantId.trim()}
              >
                Place AHU
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
