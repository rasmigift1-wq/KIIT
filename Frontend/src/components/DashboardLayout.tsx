import { ReactNode, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ThreeBackground from "@/components/ThreeBackground";
import Chatbot from "@/components/Chatbot";
import {
  LayoutDashboard,
  TreePine,
  Footprints,
  MapPin,
  Building2,
  User,
  ChevronLeft,
  Menu,
  Trash2,
  ShoppingBag,
  Truck,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

// ── Tiny sidebar 3D logo ──────────────────────────────────────────────────────
function SidebarLogo3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 1.2;
      meshRef.current.rotation.x += delta * 0.4;
    }
  });
  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.6, 0]} />
      <meshStandardMaterial
        color="#22c55e"
        emissive="#22c55e"
        emissiveIntensity={0.6}
        roughness={0.1}
        metalness={0.8}
        wireframe={false}
      />
    </mesh>
  );
}

function SidebarIcon3D() {
  return (
    <div className="w-9 h-9 shrink-0">
      <Canvas
        camera={{ position: [0, 0, 2], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 2, 2]} intensity={1.5} color="#22c55e" />
        <pointLight position={[-2, -2, -2]} intensity={0.8} color="#a855f7" />
        <SidebarLogo3D />
      </Canvas>
    </div>
  );
}

// ── Minimal background glow for dashboard ────────────────────────────────────
function DashboardBgCrystal() {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;
    gsap.to(meshRef.current.position, {
      y: 0.5,
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.z += delta * 0.15;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <octahedronGeometry args={[1.8, 0]} />
      <meshStandardMaterial
        color="#22c55e"
        emissive="#22c55e"
        emissiveIntensity={0.15}
        roughness={0.2}
        metalness={0.9}
        wireframe
        transparent
        opacity={0.07}
      />
    </mesh>
  );
}

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Waste Classification", path: "/waste", icon: Trash2 },
  { title: "Dustbin Locator", path: "/dustbin", icon: MapPin },
  { title: "Collect Garbage", path: "/collect", icon: Truck },
  { title: "Marketplace", path: "/marketplace", icon: ShoppingBag },
  { title: "Carbon Impact", path: "/carbon", icon: Footprints },
  { title: "Environment", path: "/environment", icon: TreePine },
  { title: "Hospitals", path: "/hospital", icon: Building2 },
  { title: "Profile", path: "/profile", icon: User },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAppContext();

  const SidebarContent = () => (
    <nav className="flex flex-col gap-1 mt-4 flex-1">
      {navItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            {/* Active indicator stripe */}
            {active && (
              <motion.div
                layoutId="active-nav"
                className="absolute left-0 top-0 w-[3px] h-full bg-gradient-to-b from-primary via-secondary to-accent rounded-r-full"
              />
            )}
            {/* Active glow shimmer */}
            {active && (
              <div className="absolute inset-0 shimmer rounded-xl" />
            )}
            <item.icon
              className={cn(
                "w-5 h-5 shrink-0 transition-colors",
                active ? "text-primary" : "group-hover:text-primary"
              )}
            />
            {!collapsed && (
              <span className="text-sm font-semibold truncate">{item.title}</span>
            )}
          </Link>
        );
      })}

      {/* Logout */}
      <div className={cn(
        "mt-auto pt-4 border-t border-border/50",
        collapsed && "flex justify-center"
      )}>
        <button
          onClick={() => {
            logout();
            setMobileOpen(false);
          }}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-red-400 hover:text-red-300 hover:bg-red-500/10",
            collapsed ? "w-11 h-11 justify-center p-0" : "w-full"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
        {!collapsed && user && (
          <div className="px-4 py-2 text-xs text-muted-foreground truncate">
            {user.name}
          </div>
        )}
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen relative">
      {/* Full-screen 3D background behind everything */}
      <ThreeBackground />
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col border-r border-border/50 bg-sidebar fixed top-0 left-0 h-full z-40 overflow-hidden"
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          {!collapsed ? (
            <Link to="/" className="flex items-center gap-2">
              <SidebarIcon3D />
              <span className="text-lg font-black text-gradient-secondary uppercase tracking-tight">
                CLIMA
              </span>
            </Link>
          ) : (
            <SidebarIcon3D />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors ml-auto"
          >
            <ChevronLeft
              className={cn(
                "w-4 h-4 transition-transform duration-300",
                collapsed && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Subtle 3D background in sidebar */}
        <div className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none opacity-60">
          <Canvas
            camera={{ position: [0, 0, 4], fov: 55 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: "transparent" }}
          >
            <ambientLight intensity={0.2} />
            <pointLight position={[3, 3, 3]} intensity={1} color="#22c55e" />
            <DashboardBgCrystal />
          </Canvas>
        </div>

        <SidebarContent />
      </motion.aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 glass-strong flex items-center px-4 gap-3 border-b border-border/50">
        <button onClick={() => setMobileOpen(true)} className="text-foreground">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7">
            <Canvas
              camera={{ position: [0, 0, 2], fov: 50 }}
              gl={{ antialias: true, alpha: true }}
              style={{ background: "transparent" }}
            >
              <ambientLight intensity={0.5} />
              <pointLight position={[2, 2, 2]} intensity={1.5} color="#22c55e" />
              <SidebarLogo3D />
            </Canvas>
          </div>
          <span className="font-black text-gradient-secondary">CLIMACARE</span>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 h-full w-[280px] bg-sidebar border-r border-border/50 z-50 p-4 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-8 h-8">
                    <Canvas
                      camera={{ position: [0, 0, 2], fov: 50 }}
                      gl={{ antialias: true, alpha: true }}
                      style={{ background: "transparent" }}
                    >
                      <ambientLight intensity={0.5} />
                      <pointLight position={[2, 2, 2]} intensity={1.5} color="#22c55e" />
                      <SidebarLogo3D />
                    </Canvas>
                  </div>
                  <span className="text-lg font-black text-gradient-secondary uppercase">
                    CLIMACARE
                  </span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 min-h-screen pt-14 lg:pt-0 transition-all duration-300 relative overflow-hidden",
          collapsed ? "lg:ml-[72px]" : "lg:ml-[256px]"
        )}
      >
        {/* 3D ambient background accents */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-primary/4 rounded-full blur-[120px] animate-pulse" />
          <div
            className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-secondary/4 rounded-full blur-[120px] animate-pulse"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute top-[50%] left-[50%] w-[20%] h-[20%] bg-accent/3 rounded-full blur-[80px] animate-pulse"
            style={{ animationDelay: "4s" }}
          />
        </div>

        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="p-4 md:p-8 relative z-10"
        >
          {children}
        </motion.div>
      </main>
      
      {/* Global AI Chatbot */}
      <Chatbot />
    </div>
  );
}
