import { useRef, useState } from "react";
import { Upload, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloorPlanUploaderProps {
  onImageLoaded: (dataUrl: string) => void;
}

export function FloorPlanUploader({ onImageLoaded }: FloorPlanUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") onImageLoaded(result);
    };
    reader.readAsDataURL(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200
        ${isDragOver
          ? "border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/10"
          : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
        }
      `}
    >
      <div className={`transition-transform duration-200 ${isDragOver ? "scale-110" : ""}`}>
        <ImagePlus className={`h-10 w-10 transition-colors duration-200 ${isDragOver ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div>
        <p className={`text-sm font-medium transition-colors duration-200 ${isDragOver ? "text-primary" : ""}`}>
          {isDragOver ? "Drop to upload" : "No floor plan uploaded"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {isDragOver ? "Release to add your floor plan image" : "Drag & drop an image here, or click to browse"}
        </p>
        {!isDragOver && (
          <p className="text-xs text-muted-foreground">PNG, SVG, JPG accepted</p>
        )}
      </div>
      {!isDragOver && (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Floor Plan
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
