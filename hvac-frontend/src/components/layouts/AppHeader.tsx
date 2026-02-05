import { Wifi } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AppHeader() {
  const connected = true // luego viene del WebSocket

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-6">
      <div className="text-sm text-muted-foreground">
        Sistema de monitoreo
      </div>

      <div className="flex items-center gap-2">
        <Wifi className={`h-4 w-4 ${connected ? "text-green-500" : "text-red-500"}`} />
        <Badge variant={connected ? "default" : "destructive"}>
          {connected ? "ONLINE" : "OFFLINE"}
        </Badge>
      </div>
    </header>
  )
}
