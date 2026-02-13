import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Bounds } from "@react-three/drei"
import { Suspense } from "react"

interface SceneProps {
  children: React.ReactNode
}

export default function Scene({ children }: SceneProps) {
  return (
    <div className="w-full h-100 rounded-xl overflow-hidden bg-black">
      <Canvas camera={{ fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.2}>
            {children}
          </Bounds>
        </Suspense>

        <OrbitControls makeDefault />
        <Environment preset="warehouse" />  
      </Canvas>
    </div>
  )
}
