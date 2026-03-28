import { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Particle Field ──────────────────────────────────────────────────────────
function ParticleField() {
  const ref = useRef<THREE.Points>(null);

  // Generate random sphere of particles
  const count = 800;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 4 + Math.random() * 8;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.04;
    ref.current.rotation.x += delta * 0.01;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#22c55e"
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}

// ── Wireframe Torus Knot ────────────────────────────────────────────────────
function WireframeMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.08;
    meshRef.current.rotation.y += delta * 0.12;
  });

  return (
    <mesh ref={meshRef} position={[3.5, 0, -3]}>
      <torusKnotGeometry args={[1.4, 0.38, 160, 20]} />
      <meshStandardMaterial
        color="#a855f7"
        wireframe
        transparent
        opacity={0.12}
        emissive="#a855f7"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

// ── Icosahedron Wireframe ───────────────────────────────────────────────────
function IcosphereWireframe() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y -= delta * 0.06;
    meshRef.current.rotation.z += delta * 0.03;
  });

  return (
    <mesh ref={meshRef} position={[-4, 1, -4]}>
      <icosahedronGeometry args={[2.2, 1]} />
      <meshStandardMaterial
        color="#22c55e"
        wireframe
        transparent
        opacity={0.09}
        emissive="#22c55e"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

// ── Mouse Parallax Controller ───────────────────────────────────────────────
function MouseParallax() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  useFrame(() => {
    target.current.x += (mouse.current.x - target.current.x) * 0.03;
    target.current.y += (mouse.current.y - target.current.y) * 0.03;
    camera.position.x = target.current.x * 0.8;
    camera.position.y = target.current.y * 0.5;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ── GSAP Scroll Scene Rotation ──────────────────────────────────────────────
function ScrollRotator() {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    const obj = { progress: 0 };

    ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      scrub: 2,
      onUpdate: (self) => {
        obj.progress = self.progress;
        if (groupRef.current) {
          groupRef.current.rotation.y = self.progress * Math.PI * 1.5;
          groupRef.current.rotation.x = self.progress * Math.PI * 0.4;
        }
      },
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <group ref={groupRef}>
      <ParticleField />
      <WireframeMesh />
      <IcosphereWireframe />
    </group>
  );
}

// ── Main Exported Component ─────────────────────────────────────────────────
export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 65 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.6} color="#22c55e" />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#a855f7" />
        <MouseParallax />
        <ScrollRotator />
      </Canvas>
    </div>
  );
}
