import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { HvacEvent } from "@/types/event"
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

interface Props {
  events: HvacEvent[]
}

export default function AhuEventTimeline({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Sin eventos registrados
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Línea de tiempo de eventos
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {events.map((event, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3"
          >
            <EventIcon type={event.type} />

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {event.message}
                </span>

                <Badge variant={getVariant(event.type)}>
                  {event.type}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground">
                {new Date(event.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/* ---------- helpers ---------- */

function EventIcon({ type }: { type: string }) {
  switch (type) {
    case "ALARM":
      return (
        <AlertCircle className="h-4 w-4 text-red-500 mt-1" />
      )
    case "WARNING":
      return (
        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-1" />
      )
    default:
      return (
        <CheckCircle2 className="h-4 w-4 text-green-500 mt-1" />
      )
  }
}

function getVariant(type: string) {
  if (type === "ALARM") return "destructive"
  if (type === "WARNING") return "secondary"
  return "default"
}
