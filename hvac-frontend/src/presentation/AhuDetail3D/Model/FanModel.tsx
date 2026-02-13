import { useGLTF } from "@react-three/drei"
import { useEffect } from "react"
import * as THREE from "three"

interface FanModelProps {
  status: "OK" | "WARNING" | "ALARM" | "DISCONNECTED"
}

export default function FanModel({ status }: FanModelProps) {
  const { scene } = useGLTF("/models/fan/scene.gltf")

  useEffect(() => {
    scene.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh

        const colorMap = {
          OK: "#22c55e",
          WARNING: "#eab308",
          ALARM: "#ef4444",
          DISCONNECTED: "#6b7280"
        }

        mesh.material = new THREE.MeshStandardMaterial({
          color: colorMap[status]
        })
      }
    })
  }, [scene, status])

  return <primitive object={scene} scale={0.8} rotation={[0,180,0]} />
}

useGLTF.preload("/models/fan/scene.gltf")
