import { useGLTF } from "@react-three/drei"
import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface FanModelProps {
  fanStatus: boolean
  temperature: number
}

export default function FanModel({
  fanStatus,
  temperature
}: FanModelProps) {

  const { scene } = useGLTF("/models/fan/scene.gltf")

  const bladesRef = useRef<THREE.Object3D | null>(null)
  const currentSpeed = useRef(0)
  const stressIntensity = useRef(0)

  useEffect(() => {
    const blades = scene.getObjectByName("FanSupport_36_fan_0")
    if (blades) {
      bladesRef.current = blades
    }
  }, [scene])

  useFrame((state, delta) => {
    if (!bladesRef.current) return

    /* ------------------------------
       1️⃣ VELOCIDAD SEGÚN TEMP
    ------------------------------ */

    const MIN_TEMP = 20
    const MAX_TEMP = 30
    const MAX_SPEED = 20
    const MIN_SPEED = 3

    let targetSpeed = 0

    if (fanStatus) {
      const clampedTemp = Math.min(
        Math.max(temperature, MIN_TEMP),
        MAX_TEMP
      )

      const normalized =
        (clampedTemp - MIN_TEMP) /
        (MAX_TEMP - MIN_TEMP)

      targetSpeed =
        MIN_SPEED +
        normalized * (MAX_SPEED - MIN_SPEED)
    }

    currentSpeed.current +=
      (targetSpeed - currentSpeed.current) * delta * 2

    bladesRef.current.rotation.x +=
      delta * currentSpeed.current

    /* ------------------------------
       2️⃣ VIBRACIÓN POR TEMP EXTREMA
    ------------------------------ */

    let targetStress = 0

    if (temperature > 45) {
      targetStress = 1
    } else if (temperature > 38) {
      targetStress = 0.4
    }

    stressIntensity.current +=
      (targetStress - stressIntensity.current) * delta * 2

    const stress = stressIntensity.current
    const t = state.clock.elapsedTime

    bladesRef.current.rotation.y =
      Math.sin(t * 35) * 0.04 * stress

    bladesRef.current.rotation.z =
      Math.sin(t * 45) * 0.04 * stress

    bladesRef.current.position.y =
      Math.sin(t * 60) * 0.015 * stress
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
