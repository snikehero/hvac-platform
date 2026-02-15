import { Wifi, Palette, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

export default function AppHeader() {
  const connected = true;
  const { setTheme } = useTheme();

  return (
    <header className="h-15 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      {/* 🔥 Plataforma */}
      <div className="flex items-center gap-2 text-sm font-medium tracking-tight">
        <span className="text-muted-foreground">Control Center</span>
      </div>

      {/* 🔥 Acciones derecha */}
      <div className="flex items-center gap-4">
        {/* 🎨 Theme Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Palette className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("violet")}>
              Violet
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("hvac")}>
              HVAC
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("industrial")}>
              Industrial
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* 📡 Estado Global */}
        <div className="flex items-center gap-2">
          <Wifi
            className={`h-4 w-4 transition-colors ${
              connected ? "text-green-500" : "text-red-500"
            }`}
          />
          <Badge variant={connected ? "default" : "destructive"}>
            {connected ? "ONLINE" : "OFFLINE"}
          </Badge>
        </div>
        {/* 👤 Usuario (placeholder futuro) */}
        <Button variant="ghost" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
