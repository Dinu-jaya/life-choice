import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function FloatingBlob({
  position,
  color,
  speed = 0.4,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  speed?: number;
  scale?: number;
}) {
  const ref = React.useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * speed) * 0.4;
    ref.current.position.x = position[0] + Math.cos(t * speed * 0.7) * 0.3;
    ref.current.rotation.x = t * speed * 0.3;
    ref.current.rotation.y = t * speed * 0.2;
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 4]} />
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={0.6}
        emissive={color}
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffd1a4" />
      <directionalLight position={[-5, -3, 2]} intensity={0.8} color="#7c5cff" />
      <FloatingBlob position={[-3, 1, -2]} color="#7c5cff" speed={0.35} scale={1.4} />
      <FloatingBlob position={[3.2, -1, -1]} color="#ff6b9d" speed={0.45} scale={1.1} />
      <FloatingBlob position={[0, 2.5, -3]} color="#22d3ee" speed={0.3} scale={0.9} />
      <FloatingBlob position={[-2, -2, -1.5]} color="#fbbf24" speed={0.5} scale={0.7} />
    </>
  );
}

export function Background3D() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 opacity-60 dark:opacity-50">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/60 backdrop-blur-3xl" />
    </div>
  );
}