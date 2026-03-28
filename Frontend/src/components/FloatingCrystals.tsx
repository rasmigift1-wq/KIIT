import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

// ── Single Crystal ──────────────────────────────────────────────────────────
interface CrystalProps {
  position: [number, number, number];
  color: string;
  emissive: string;
  scale?: number;
  speed?: number;
}

function Crystal({ position, color, emissive, scale = 1, speed = 1 }: CrystalProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startY = position[1];

  useEffect(() => {
    if (!meshRef.current) return;
    // GSAP float
    gsap.to(meshRef.current.position, {
      y: startY + 0.4 * scale,
      duration: 2.5 / speed,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
    // GSAP initial fade-in
    gsap.fromTo(
      meshRef.current.scale,
      { x: 0, y: 0, z: 0 },
      { x: scale, y: scale, z: scale, duration: 1.2, ease: "elastic.out(1, 0.5)" }
    );
  }, [scale, speed, startY]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.6 * speed;
      meshRef.current.rotation.x += delta * 0.2 * speed;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={0}>
      <octahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.6}
        roughness={0.1}
        metalness={0.9}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

// ── Small decorative ring ────────────────────────────────────────────────────
function Ring({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.5;
      ref.current.rotation.z += delta * 0.3;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[0.28, 0.04, 16, 48]} />
      <meshStandardMaterial
        color="#f59e0b"
        emissive="#f59e0b"
        emissiveIntensity={0.5}
        roughness={0.1}
        metalness={0.8}
      />
    </mesh>
  );
}

// ── The full 3D scene ────────────────────────────────────────────────────────
function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#22c55e" />
      <pointLight position={[-5, -3, 3]} intensity={1.0} color="#a855f7" />
      <pointLight position={[0, 5, -5]} intensity={0.8} color="#f59e0b" />

      {/* Emerald crystals */}
      <Crystal position={[-2.5, 0.5, 0]} color="#16a34a" emissive="#22c55e" scale={1.1} speed={0.9} />
      <Crystal position={[2.8, -0.8, -1]} color="#15803d" emissive="#22c55e" scale={0.75} speed={1.3} />

      {/* Violet crystals */}
      <Crystal position={[1.8, 1.2, 0.5]} color="#7c3aed" emissive="#a855f7" scale={0.9} speed={1.1} />
      <Crystal position={[-1.5, -1.2, -0.5]} color="#6d28d9" emissive="#a855f7" scale={0.6} speed={0.8} />

      {/* Gold ring accents */}
      <Ring position={[0, 0.8, -0.5]} />
      <Ring position={[-3.2, -0.3, 0.3]} />
    </>
  );
}

// ── Exported wrapper ─────────────────────────────────────────────────────────
export default function FloatingCrystals() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 5 }}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
