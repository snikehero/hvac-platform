// src/app/page.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Thermometer, AlertTriangle } from "lucide-react"
import { Link } from "react-router-dom"

export default function HomePage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Sistema HVAC</h1>
      <p className="text-muted-foreground">
        Monitoreo en tiempo real de PLCs vía S7 / MQTT
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Activity className="text-green-500" />
            <CardTitle>Estado del sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-green-600">ONLINE</p>
            <p className="text-sm text-muted-foreground">
              WebSocket activo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Thermometer />
            <CardTitle>Temperatura promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">22.4 °C</p>
            <p className="text-sm text-muted-foreground">
              Últimos 60s
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="text-yellow-500" />
            <CardTitle>Alarmas activas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">2</p>
            <p className="text-sm text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <Link to="/dashboard">
          <Button size="lg">Ir al Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
