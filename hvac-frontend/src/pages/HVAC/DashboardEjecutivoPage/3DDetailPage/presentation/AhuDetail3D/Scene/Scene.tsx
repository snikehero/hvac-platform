import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Bounds, ContactShadows } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { audioManager } from "../../Audio/AudioManager";
import type { AhuHealthStatus } from "@/domain/ahu/getAhuHealth";

const STATUS_LIGHT_COLOR: Record<AhuHealthStatus, string> = {
  OK: "#22c55e",
  WARNING: "#eab308",
  ALARM: "#ef4444",
  DISCONNECTED: "#6b7280",
};

interface SceneProps {
  children: React.ReactNode;
  status?: AhuHealthStatus;
}

export default function Scene({ children, status = "OK" }: SceneProps) {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-b from-zinc-950 to-zinc-900">
      <Canvas camera={{ fov: 50, position: [0, 2, 5] }} shadows>
        <fog attach="fog" args={["#09090b", 8, 20]} />

        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.2}>
            <InitAudio />
            {children}
          </Bounds>

          <StatusLight status={status} />

          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={10}
            blur={2.5}
          />
        </Suspense>

        <OrbitControls
          makeDefault
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          enablePan={false}
        />
        <Environment preset="warehouse" />
      </Canvas>
    </div>
  );
}

function StatusLight({ status }: { status: AhuHealthStatus }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const targetColor = useRef(new THREE.Color(STATUS_LIGHT_COLOR[status]));

  useEffect(() => {
    targetColor.current.set(STATUS_LIGHT_COLOR[status]);
  }, [status]);

  useFrame((state, delta) => {
    if (!lightRef.current) return;

    lightRef.current.color.lerp(targetColor.current, delta * 3);

    if (status === "ALARM") {
      const pulse = 0.6 + 0.4 * Math.sin(state.clock.elapsedTime * 4);
      lightRef.current.intensity = 3 * pulse;
    } else {
      const target = status === "DISCONNECTED" ? 0.5 : 1.5;
      lightRef.current.intensity += (target - lightRef.current.intensity) * delta * 3;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 3, 0]}
      color={STATUS_LIGHT_COLOR[status]}
      intensity={1.5}
      distance={12}
      decay={2}
    />
  );
}

function InitAudio() {
  const { camera } = useThree();

  useEffect(() => {
    audioManager.init(camera);
  }, [camera]);

  return null;
}
