import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Trash2,
  Recycle,
  TreePine,
  Footprints,
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";

const metrics = [
  {
    title: "Waste Categorized",
    value: "124",
    unit: " kg",
    change: "+12%",
    trend: "up" as const,
    icon: Trash2,
    glow: "primary" as const,
    desc: "85% recyclable rate",
  },
  {
    title: "Environmental Risk",
    value: "45",
    unit: "/100",
    change: "-8%",
    trend: "down" as const,
    icon: TreePine,
    glow: "secondary" as const,
    desc: "Air quality: Good",
  },
  {
    title: "Carbon Footprint",
    value: "2.4",
    unit: " tons",
    change: "-12%",
    trend: "down" as const,
    icon: Footprints,
    glow: "warning" as const,
    desc: "Below average",
  },
  {
    title: "Climate Alert",
    value: "2",
    unit: " active",
    change: "+1",
    trend: "up" as const,
    icon: AlertTriangle,
    glow: "danger" as const,
    desc: "Heat advisory",
  },
];

const Dashboard = () => {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <DashboardLayout>
      <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10 p-4 sm:p-8 max-w-7xl mx-auto space-y-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-3 text-primary mb-1">
                <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">Executive Surveillance Protocol</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight uppercase">
                Control <span className="text-gradient-secondary">Center</span>
              </h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3 h-3 text-primary" />
                System Synchronization Active
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDetails(!showDetails)}
                className="group relative overflow-hidden flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:shadow-primary/50 glow-primary transition-all"
              >
                <Info className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                {showDetails ? "Hide Analytics" : "Detailed Intelligence"}
              </motion.button>
            </motion.div>
          </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <motion.div 
            key={m.title} 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.12, duration: 0.5, ease: "easeOut" }}
            className="metric-card card-3d"
          >
          <GlassCard glowColor={m.glow} delay={i * 0.1} className="gradient-border h-full">
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                "p-2.5 rounded-lg",
                m.glow === "primary" ? "bg-primary/10" :
                m.glow === "secondary" ? "bg-secondary/10" :
                m.glow === "warning" ? "bg-warning/10" : "bg-destructive/10"
              )}>
                <m.icon className={cn(
                  "w-5 h-5",
                  m.glow === "primary" ? "text-primary" :
                  m.glow === "secondary" ? "text-secondary" :
                  m.glow === "warning" ? "text-warning" : "text-destructive"
                )} />
              </div>
              <span className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                m.trend === "down" ? "bg-secondary/10 text-secondary" : 
                m.glow === "danger" ? "bg-destructive/10 text-destructive" : 
                "bg-primary/10 text-primary"
              )}>
                {m.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {m.change}
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {m.value}
              <span className="text-lg text-muted-foreground font-normal ml-1">{m.unit}</span>
            </div>
            <div className="text-sm text-muted-foreground font-medium">{m.title}</div>
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{m.desc}</span>
              </div>
            </div>
          </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Details Button with premium motion */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8">
        <motion.button
          whileHover={{ scale: 1.02, x: 5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
        >
          <Info className="w-4 h-4" />
          {showDetails ? "Hide Personal Metrics" : "View Personal Metrics"}
        </motion.button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="overflow-hidden"
            >
              <GlassCard className="mt-4 border-primary/20" hover={false} glowColor="primary">
                <h3 className="text-lg font-bold text-foreground mb-4">Personal Health Profile</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    { label: "Full Name", placeholder: "Enter your name", icon: Activity },
                    { label: "Location", placeholder: "Enter your city", icon: TreePine },
                    { label: "Age", placeholder: "Enter age", type: "number" },
                    { label: "Health Conditions", placeholder: "e.g. Asthma, Allergies" }
                  ].map((field, idx) => (
                    <motion.div 
                      key={field.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <label className="text-xs font-bold text-muted-foreground mb-1.5 block uppercase tracking-wider ml-1">{field.label}</label>
                      <input 
                        type={field.type || "text"}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/20" 
                        placeholder={field.placeholder} 
                      />
                    </motion.div>
                  ))}
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Update Profile Data
                </motion.button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Activity with staggered animations */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-10"
      >
        <GlassCard hover={false} className="overflow-hidden gradient-border" glowColor="secondary">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-secondary" />
              Environmental Interaction Log
            </h3>
            <span className="text-xs font-bold text-white/50 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">Recent</span>
          </div>
          <div className="space-y-1">
            {[
              { text: "New waste item classified: Recyclable", time: "2 min ago", icon: Trash2, color: "primary" },
              { text: "New climate alert: Heat advisory", time: "15 min ago", icon: AlertTriangle, color: "danger" },
              { text: "Carbon footprint reduced by 0.3 tons", time: "1 hour ago", icon: Footprints, color: "secondary" },
              { text: "Waste sorting efficiency improved by 15%", time: "3 hours ago", icon: Recycle, color: "warning" },
            ].map((a, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1), duration: 0.4 }}
                className="activity-row flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-white/10 transition-colors group border-b border-white/5 last:border-0 card-3d"
              >
                <div className={cn(
                  "p-2.5 rounded-xl group-hover:scale-110 transition-transform",
                  a.color === "primary" ? "bg-primary/10 text-primary" :
                  a.color === "secondary" ? "bg-secondary/10 text-secondary" :
                  a.color === "warning" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                )}>
                  <a.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{a.text}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Activity className="w-3 h-3 opacity-50" />
                    {a.time}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <TrendingUp className="w-4 h-4 text-primary/50" />
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
