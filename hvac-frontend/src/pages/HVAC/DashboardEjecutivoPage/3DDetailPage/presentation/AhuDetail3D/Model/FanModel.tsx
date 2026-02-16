import { useGLTF } from "@react-three/drei"
import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { AhuHealthStatus } from "@/domain/ahu/getAhuHealth"

interface FanModelProps {
  fanStatus: boolean
  temperature: number
  status: AhuHealthStatus
}

const STATUS_CONFIG = {
  OK: {
    emissiveColor: new THREE.Color("#22c55e"),
    emissiveIntensity: 0.15,
    speedMultiplier: 1,
    vibration: 0,
  },
  WARNING: {
    emissiveColor: new THREE.Color("#eab308"),
    emissiveIntensity: 0.3,
    speedMultiplier: 1,
    vibration: 0.3,
  },
  ALARM: {
    emissiveColor: new THREE.Color("#ef4444"),
    emissiveIntensity: 0.5,
    speedMultiplier: 1.3,
    vibration: 1,
  },
  DISCONNECTED: {
    emissiveColor: new THREE.Color("#6b7280"),
    emissiveIntensity: 0.05,
    speedMultiplier: 0,
    vibration: 0,
  },
}

export default function FanModel({
  fanStatus,
  temperature,
  status,
}: FanModelProps) {
  const { scene } = useGLTF("/models/fan/scene.gltf")

  const bladesRef = useRef<THREE.Object3D | null>(null)
  const currentSpeed = useRef(0)
  const stressIntensity = useRef(0)
  const currentEmissive = useRef(new THREE.Color("#000000"))
  const currentEmissiveIntensity = useRef(0)

  // Clone materials so we can mutate emissive without linter issues
  const meshMaterials = useRef<THREE.MeshStandardMaterial[]>([])

  useEffect(() => {
    const mats: THREE.MeshStandardMaterial[] = []
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        const cloned = child.material.clone()
        child.material = cloned
        mats.push(cloned)
      }
    })
    meshMaterials.current = mats
  }, [scene])

  useEffect(() => {
    const blades = scene.getObjectByName("FanSupport_36_fan_0")
    if (blades) {
      bladesRef.current = blades
    }
  }, [scene])

  useFrame((state, delta) => {
    if (!bladesRef.current) return

    const cfg = STATUS_CONFIG[status]
    const t = state.clock.elapsedTime

    /* ----- 1. ROTATION SPEED ----- */

    const MIN_TEMP = 20
    const MAX_TEMP = 30
    const MAX_SPEED = 20
    const MIN_SPEED = 3

    let targetSpeed = 0

    if (status === "DISCONNECTED") {
      targetSpeed = 0
    } else if (fanStatus) {
      const clampedTemp = Math.min(Math.max(temperature, MIN_TEMP), MAX_TEMP)
      const normalized = (clampedTemp - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)
      targetSpeed = (MIN_SPEED + normalized * (MAX_SPEED - MIN_SPEED)) * cfg.speedMultiplier
    }

    currentSpeed.current += (targetSpeed - currentSpeed.current) * delta * 2
    bladesRef.current.rotation.x += delta * currentSpeed.current

    /* ----- 2. VIBRATION ----- */

    let targetStress = cfg.vibration

    if (temperature > 45) {
      targetStress = Math.max(targetStress, 1)
    } else if (temperature > 38) {
      targetStress = Math.max(targetStress, 0.4)
    }

    stressIntensity.current += (targetStress - stressIntensity.current) * delta * 2

    const stress = stressIntensity.current

    bladesRef.current.rotation.y = Math.sin(t * 35) * 0.04 * stress
    bladesRef.current.rotation.z = Math.sin(t * 45) * 0.04 * stress
    bladesRef.current.position.y = Math.sin(t * 60) * 0.015 * stress

    /* ----- 3. EMISSIVE TINTING ----- */

    currentEmissive.current.lerp(cfg.emissiveColor, delta * 3)

    const targetIntensity = status === "ALARM"
      ? cfg.emissiveIntensity * (0.7 + 0.3 * Math.sin(t * 4))
      : cfg.emissiveIntensity

    currentEmissiveIntensity.current +=
      (targetIntensity - currentEmissiveIntensity.current) * delta * 3

    const mats = meshMaterials.current
    for (let i = 0; i < mats.length; i++) {
      mats[i].emissive.copy(currentEmissive.current)
      mats[i].emissiveIntensity = currentEmissiveIntensity.current
    }
  })

  return (
    <primitive
      object={scene}
      scale={0.8}
      rotation={[0, -Math.PI / 2, 0]}
    />
  )
}

useGLTF.preload("/models/fan/scene.gltf")
