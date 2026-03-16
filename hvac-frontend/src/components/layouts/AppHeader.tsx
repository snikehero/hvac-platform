import { Wifi, Palette, User, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { useTranslation } from "@/i18n/useTranslation";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";

export default function AppHeader() {
  const connected = useWebSocket();
  const { setTheme } = useTheme();
  const { t } = useTranslation();
  const { settings, updateLanguage } = useGlobalSettings();

  return (
    <header className="h-15 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      {/* 🔥 Plataforma */}
      <div className="flex items-center gap-2 text-sm font-medium tracking-tight">
        <span className="text-muted-foreground">{t.header.controlCenter}</span>
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

        {/* 🌐 Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Globe className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => updateLanguage("es")}>
              {settings.language === "es" ? "✓ " : ""}Español
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateLanguage("en")}>
              {settings.language === "en" ? "✓ " : ""}English
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
            {connected ? t.header.online : t.header.offline}
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
