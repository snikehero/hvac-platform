import { Palette, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { useGlobalSettings } from "@/context/GlobalSettingsContext";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ConnectionIndicator } from "@/components/ConnectionIndicator";

export default function AppHeader() {
  const { setTheme } = useTheme();
  const { settings, updateLanguage } = useGlobalSettings();

  return (
    <header className="h-15 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Connection indicator */}
        <ConnectionIndicator />

        {/* Theme switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Palette className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("violet")}>Violet</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("hvac")}>HVAC</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("industrial")}>Industrial</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language switcher */}
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

        {/* User placeholder */}
        <Button variant="ghost" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
