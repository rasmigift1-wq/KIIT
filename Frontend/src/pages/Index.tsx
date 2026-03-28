import { Suspense, lazy, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Recycle,
  Trash2,
  TreePine,
  Footprints,
  MapPin,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  ChevronDown,
  Activity,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ThreeBackground from "@/components/ThreeBackground";
import GlassCard from "@/components/GlassCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FloatingCrystals = lazy(() => import("@/components/FloatingCrystals"));
const Earth3D = lazy(() => import("@/components/Earth3D"));

const Landing = () => {
  const featuresRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Badge entrance
      gsap.from(badgeRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.3,
      });

      // Stats counter reveal
      gsap.from(statsRef.current?.children ?? [], {
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.7,
        ease: "power3.out",
        delay: 1.0,
      });

      // Features scroll-reveal
      if (featuresRef.current) {
        gsap.from(featuresRef.current.querySelectorAll(".feature-card"), {
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
          },
          y: 60,
          opacity: 0,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
        });
      }

      // About section scroll-reveal
      if (aboutRef.current) {
        gsap.from(aboutRef.current.querySelectorAll(".about-card"), {
          scrollTrigger: {
            trigger: aboutRef.current,
            start: "top 75%",
          },
          scale: 0.9,
          opacity: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: "back.out(1.5)",
        });
      }

      // Steps scroll-reveal
      if (stepsRef.current) {
        gsap.from(stepsRef.current.querySelectorAll(".step-card"), {
          scrollTrigger: {
            trigger: stepsRef.current,
            start: "top 80%",
          },
          x: -40,
          opacity: 0,
          stagger: 0.12,
          duration: 0.65,
          ease: "power3.out",
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Three.js 3D Background */}
      <ThreeBackground />

      {/* Premium color blobs */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-primary/8 rounded-full blur-[180px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/8 rounded-full blur-[180px] animate-pulse"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[140px] animate-pulse"
          style={{ animationDelay: "6s" }}
        />
      </div>

      <Navbar />

      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">
        {/* Floating 3D crystals behind content */}
        <div className="absolute inset-0 z-[2]">
          <Suspense fallback={null}>
            <FloatingCrystals />
          </Suspense>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center w-full relative z-[10]">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Badge */}
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-primary/10 border border-primary/25 text-[10px] font-black uppercase tracking-[0.4em] text-primary gradient-border"
            >
              <Zap className="w-4 h-4 animate-pulse" />
              Global Sentinel Protocol Active
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter uppercase italic">
                <span className="text-gradient-secondary neon-text">CLIMA</span>
                <br />
                <span className="text-foreground">CARE</span>
                <span className="text-primary opacity-40">.</span>
              </h1>
              <div className="h-1 w-36 rounded-full bg-gradient-to-r from-primary via-secondary to-accent" />
            </div>

            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed font-bold uppercase tracking-wide opacity-80">
              The Next Evolution in{" "}
              <span className="text-foreground neon-text-violet">
                Atmospheric Surveillance
              </span>{" "}
              &amp; Personal Health Mitigation.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-5 pt-4">
              <Link
                to="/signin"
                className="group relative px-10 py-5 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center gap-4 overflow-hidden glow-primary"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 shimmer" />
                Initialize System{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                to="/signup"
                className="px-10 py-5 rounded-2xl border border-secondary/30 hover:bg-secondary/10 hover:border-secondary/60 text-foreground font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center gap-4 glow-secondary"
              >
                Create Node
              </Link>
            </div>

            {/* Stats */}
            <div
              ref={statsRef}
              className="flex items-center gap-8 pt-12 border-t border-white/5"
            >
              {[
                { label: "Active Nodes", val: "50k+" },
                { label: "Sync Latency", val: "0.4ms" },
                { label: "Precision", val: "99.8%" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-xl font-black text-gradient-secondary">
                    {stat.val}
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Earth 3D */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.3, ease: "easeOut", delay: 0.2 }}
            className="relative h-[500px] lg:h-[650px] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-[100px] animate-pulse scale-75" />
            <div className="absolute inset-0 bg-secondary/5 rounded-full blur-[140px] animate-pulse scale-50" style={{ animationDelay: "2s" }} />
            <Suspense
              fallback={
                <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <Globe
                      className="w-24 h-24 text-primary animate-spin opacity-20"
                      style={{ animationDuration: "8s" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                  </div>
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">
                    Loading Global Grid...
                  </div>
                </div>
              }
            >
              <div className="w-full h-full relative z-10 transition-transform duration-1000 hover:scale-105">
                <Earth3D />
              </div>
            </Suspense>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 cursor-pointer group z-10"
          onClick={() =>
            document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground group-hover:text-primary transition-colors">
              Surveillance Deep-Dive
            </span>
            <ChevronDown className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </motion.div>
      </section>

      {/* ── Features Section ──────────────────────────────────── */}
      <section id="features" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24 space-y-4"
          >
            <div className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">
              System Capabilities
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight uppercase">
              Advanced{" "}
              <span className="text-gradient-secondary italic">Surveillance</span>
            </h2>
            <p className="text-xs font-bold text-muted-foreground max-w-xl mx-auto uppercase tracking-widest leading-loose opacity-60">
              A distributed network of atmospheric sensors and AI modules
              protecting your biological integrity.
            </p>
          </motion.div>

          <div ref={featuresRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Trash2,
                title: "Neural Waste Analysis",
                desc: "Real-time molecular classification of disposal materials using computer vision.",
                color: "primary" as const,
              },
              {
                icon: TreePine,
                title: "Sentinel Monitoring",
                desc: "Hyper-local atmospheric risk vectors processed via satellite-synchronized nodes.",
                color: "secondary" as const,
              },
              {
                icon: Footprints,
                title: "Impact Quantizer",
                desc: "Precision algorithmic tracking of carbon-delta relative to global baselines.",
                color: "warning" as const,
              },
              {
                icon: MapPin,
                title: "Geospatial Grid",
                desc: "Augmented reality mapping of hyper-local disposal infrastructure nodes.",
                color: "secondary" as const,
              },
              {
                icon: Shield,
                title: "Tactical Health Alerts",
                desc: "Predictive early-warning systems for high-velocity climate hazard events.",
                color: "danger" as const,
              },
              {
                icon: Recycle,
                title: "Circular Marketplace",
                desc: "Decentralized exchange for verified recycled materials and ecological assets.",
                color: "primary" as const,
              },
            ].map((f) => (
              <div key={f.title} className="feature-card card-3d">
                <GlassCard
                  glowColor={f.color}
                  className="h-full group hover:border-primary/30 transition-colors gradient-border"
                >
                  <div className="mb-6 p-4 bg-primary/10 rounded-2xl w-fit group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                    <f.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-black text-foreground mb-3 uppercase tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground leading-relaxed uppercase tracking-tighter opacity-70">
                    {f.desc}
                  </p>
                  <div className="mt-8 flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    <Activity className="w-3 h-3" /> Initialize Module
                  </div>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About Section ─────────────────────────────────────── */}
      <section id="about" className="py-32 relative z-10 overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-[500px] bg-secondary/5 blur-[120px] -translate-y-1/2 opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">
                  The Protocol
                </div>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight uppercase">
                  Beyond{" "}
                  <span className="text-gradient-secondary italic">Health</span>{" "}
                  Monitoring
                </h2>
              </div>
              <div className="space-y-6">
                <p className="text-sm font-bold text-muted-foreground leading-relaxed uppercase tracking-wide opacity-80">
                  ClimaCare AI bridges the gap between planetary science and
                  clinical personal health. Our algorithms ingest hyper-local data
                  streams — particulate matter density, UV intensity, thermal
                  gradients — and translate them into actionable survival
                  protocols.
                </p>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed uppercase tracking-wide opacity-80 text-gradient-gold">
                  We are building the first decentralized intelligence network for
                  climate-resilient humans.
                </p>
              </div>
              <div className="pt-8 flex gap-8">
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-black text-gradient-secondary italic">
                    98.4%
                  </div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    SLA Accuracy
                  </div>
                </div>
                <div className="w-[1px] h-12 bg-white/10" />
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-black text-gradient-gold italic">
                    NODE-01
                  </div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    Core Cluster
                  </div>
                </div>
              </div>
            </motion.div>

            <div ref={aboutRef} className="grid grid-cols-2 gap-6">
              {[
                { val: "50K+", label: "Active Nodes" },
                { val: "120M", label: "Surveillance Logs" },
                { val: "24/7", label: "Sync Protocol" },
                { val: "0.4ms", label: "Processing" },
              ].map((s) => (
                <div key={s.label} className="about-card card-3d">
                  <GlassCard className="text-center p-10 border-white/5 group hover:bg-white/5 transition-all gradient-border">
                    <div className="text-4xl font-black text-gradient-secondary mb-2 group-hover:scale-110 transition-transform italic">
                      {s.val}
                    </div>
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                      {s.label}
                    </div>
                  </GlassCard>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Operational Steps ─────────────────────────────────── */}
      <section id="how-it-works" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24 space-y-4"
          >
            <div className="text-[10px] font-black text-accent uppercase tracking-[0.5em]">
              Operational Flow
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight uppercase">
              System{" "}
              <span className="text-gradient-gold italic">Deployment</span>
            </h2>
          </motion.div>

          <div ref={stepsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                num: "MOD-01",
                title: "Initialize Node",
                desc: "Establish authenticated uplink and calibrate geospatial coordinates.",
              },
              {
                num: "MOD-02",
                title: "Ingest Context",
                desc: "Distributed AI processes bio-metrics against global climate data streams.",
              },
              {
                num: "MOD-03",
                title: "Deploy Sentinel",
                desc: "Receive hyper-personalized risk mitigation protocols in real-time.",
              },
              {
                num: "MOD-04",
                title: "Quantify Impact",
                desc: "Monitor carbon-delta and scale ecological asset contributions.",
              },
            ].map((s, i) => (
              <div key={s.num} className="step-card card-3d">
                <GlassCard className="relative overflow-hidden group border-white/5 gradient-border">
                  <div className="absolute -right-4 -top-8 text-8xl font-black text-white/[0.03] italic group-hover:text-primary/10 transition-colors">
                    {s.num.split("-")[1]}
                  </div>
                  <div
                    className={`text-xs font-black uppercase tracking-[0.3em] mb-6 ${
                      i % 2 === 0 ? "text-primary" : "text-secondary"
                    }`}
                  >
                    {s.num}
                  </div>
                  <h3 className="text-lg font-black text-foreground mb-3 uppercase tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-[11px] font-bold text-muted-foreground leading-relaxed uppercase tracking-tighter opacity-70">
                    {s.desc}
                  </p>
                  <div className="mt-8 flex items-center justify-between">
                    <div
                      className={`w-12 h-1 rounded-full transition-colors ${
                        i % 2 === 0
                          ? "bg-primary/20 group-hover:bg-primary/50"
                          : "bg-secondary/20 group-hover:bg-secondary/50"
                      }`}
                    />
                    <ChevronDown className="w-4 h-4 text-white/10 -rotate-90 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                  </div>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-24 relative z-10 bg-background/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2 space-y-6">
            <span className="text-3xl font-black text-gradient-secondary uppercase italic tracking-tighter">
              CLIMACARE.AI
            </span>
            <p className="text-xs font-bold text-muted-foreground max-w-sm uppercase tracking-widest leading-loose opacity-60">
              The world's first decentralized atmospheric surveillance and
              personal health mitigation protocol. Syncing biological health to
              planetary stability.
            </p>
            <div className="flex gap-4">
              {[Globe, Zap, Shield].map((Icon, i) => (
                <div
                  key={i}
                  className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-primary/40 hover:glow-primary transition-all cursor-pointer group"
                >
                  <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
              Protocols
            </div>
            <ul className="space-y-3">
              {["Surveillance", "Neurometrics", "Carbon-Delta", "Geo-Grid"].map(
                (item) => (
                  <li
                    key={item}
                    className="text-[11px] font-black text-muted-foreground hover:text-primary cursor-pointer transition-colors uppercase tracking-widest"
                  >
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="space-y-6">
            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
              Network
            </div>
            <ul className="space-y-3">
              {["Status", "Nodes", "Security", "Open API"].map((item) => (
                <li
                  key={item}
                  className="text-[11px] font-black text-muted-foreground hover:text-secondary cursor-pointer transition-colors uppercase tracking-widest"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5 pt-12">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
            © 2026 CLIMACARE SENTINEL PROTOCOL. VERSION 4.0.2-ALPHA
          </p>
          <div className="flex gap-8 text-[10px] font-black text-muted-foreground opacity-40 uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-secondary transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-accent transition-colors">
              System Ops
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
