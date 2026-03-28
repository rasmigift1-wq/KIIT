import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Footprints, Car, Zap, Utensils, ShoppingBag, TrendingDown, TrendingUp, Info, Leaf, ChevronRight, Activity, Globe, Wind, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";
import CircularProgress from "@/components/CircularProgress";
import axios from "axios";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CarbonFootprint = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    annual_carbon_emission_kg: number;
    impact_level: string;
    sustainability_score: number;
  } | null>(null);

  const [form, setForm] = useState({
    privateVehicleKm: "",
    publicVehicleKm: "",
    electricityKwh: "",
    meatKg: "",
    dairyKg: "",
    vegKg: "",
    plasticWasteKg: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCalculate = async () => {
    const hasEmpty = Object.values(form).some(v => v === "");
    if (hasEmpty) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        car_km_per_week: parseFloat(form.privateVehicleKm),
        public_transport_km: parseFloat(form.publicVehicleKm),
        electricity_kwh: parseFloat(form.electricityKwh),
        meat_meals_per_week: parseFloat(form.meatKg),
        dairy_consumption: parseFloat(form.dairyKg),
        veg_consumption: parseFloat(form.vegKg),
        plastic_waste_kg: parseFloat(form.plasticWasteKg),
      };

      const res = await axios.post(`${API_URL}/api/ai/carbon-predict`, payload, {
        withCredentials: true,
      });

      setResult(res.data.data);
      toast.success("Carbon footprint calculated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  const isLowImpact = result?.impact_level?.toUpperCase().includes("LOW");

  const categories = [
    { label: "Transport", icon: Car,       value: result ? (result.annual_carbon_emission_kg * 0.33).toFixed(1) : 0, percent: 33, color: "primary" },
    { label: "Energy",    icon: Zap,       value: result ? (result.annual_carbon_emission_kg * 0.25).toFixed(1) : 0, percent: 25, color: "warning" },
    { label: "Food",      icon: Utensils,  value: result ? (result.annual_carbon_emission_kg * 0.21).toFixed(1) : 0, percent: 21, color: "secondary" },
    { label: "Waste",     icon: ShoppingBag, value: result ? (result.annual_carbon_emission_kg * 0.21).toFixed(1) : 0, percent: 21, color: "destructive" },
  ];

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
                  <Footprints className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">Impact Audit Protocol</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight uppercase">
                Environmental <span className="text-gradient-secondary">Audit</span>
              </h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3 h-3 text-primary" />
                Advanced Algorithmic Tracking Active
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
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:shadow-primary/50 glow-primary transition-all"
              >
                <Activity className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                {showDetails ? "Close " : "Calculate"}
              </motion.button>
            </motion.div>
          </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Carbon Score Card */}
        <GlassCard 
          className="flex flex-col items-center justify-center p-8 relative overflow-hidden" 
          glowColor={result ? (isLowImpact ? "secondary" : "warning") : "primary"} 
          hover={false}
        >
          <div className="absolute top-4 right-4 animate-pulse opacity-20">
             <Globe className="w-12 h-12" />
          </div>
          
          <h3 className="text-sm font-black text-muted-foreground uppercase tracking-[0.3em] mb-10">Carbon Quotient</h3>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-1000" />
            <CircularProgress
              value={result ? result.annual_carbon_emission_kg : 0}
              max={100}
              label="kg CO₂/yr"
              size={220}
              color={result ? (isLowImpact ? "hsl(142, 70%, 50%)" : "hsl(38, 92%, 50%)") : "hsl(217, 91%, 60%)"}
            />
          </div>

          <div className="mt-10 text-center space-y-1">
            <div className={cn(
               "text-4xl font-black tabular-nums tracking-tighter transition-colors",
               result ? (isLowImpact ? "text-secondary" : "text-warning") : "text-primary"
            )}>
              {result ? `${result.annual_carbon_emission_kg.toLocaleString()} kg` : "0.00 kg"}
            </div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Calculated Annual Emission</div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-8 flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all",
              result
                ? (isLowImpact 
                    ? "bg-secondary/10 border-secondary/30 text-secondary shadow-lg shadow-secondary/5" 
                    : "bg-warning/10 border-warning/30 text-warning shadow-lg shadow-warning/5")
                : "bg-white/5 border-white/10 text-muted-foreground"
            )}
          >
            {result
              ? (isLowImpact ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />)
              : <Wind className="w-5 h-5 animate-pulse" />
            }
            {result ? result.impact_level : "Awaiting Operational Data"}
          </motion.div>
        </GlassCard>

        {/* Analytics Breakdown */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
          {/* Sustainability Index */}
          <GlassCard glowColor="secondary" className="sm:col-span-2 p-8 border-secondary/10 overflow-hidden relative gradient-border" hover={false}>
            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
               <Leaf className="w-40 h-40" />
            </div>
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-secondary/20 shadow-inner">
                  <Leaf className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <div className="text-sm font-black text-foreground uppercase tracking-widest">Sustainability Index</div>
                  <div className="text-[10px] font-bold text-muted-foreground opacity-50 uppercase mt-0.5">Efficiency Rating Progress</div>
                </div>
              </div>
              <div className={cn(
                "text-4xl font-black tabular-nums transition-colors",
                result ? "text-secondary" : "text-muted-foreground/30"
              )}>
                {result ? `${(result.sustainability_score * 50).toFixed(0)}%` : "0.0%"}
              </div>
            </div>
            
            <div className="relative h-4 bg-white/5 rounded-full overflow-hidden mb-4 border border-white/10 shadow-inner">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: result ? `${result.sustainability_score * 50}%` : '0%' }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            </div>
            
            <div className="flex justify-between items-center text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1">
               <span>Eco-Baseline</span>
               <span>Target Performance</span>
            </div>
          </GlassCard>

          {/* Vertical Analytics Nodes */}
          {categories.map((c, i) => (
            <div key={c.label} className="card-3d">
            <GlassCard glowColor={c.color as any} delay={i * 0.1} className="p-6 border-white/5 gradient-border" hover>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-xl", `bg-${c.color}/10 text-${c.color}`)}>
                    <c.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-foreground uppercase tracking-wider">{c.label} Node</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase opacity-60 tracking-tighter">Consumption Log</div>
                  </div>
                </div>
                <div className={cn("text-lg font-black tabular-nums", `text-${c.color}`)}>
                   {result ? `${c.value}` : "0.0"} <span className="text-[8px] opacity-50">kg</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("absolute inset-y-0 left-0 rounded-full", `bg-${c.color}`)}
                    initial={{ width: 0 }}
                    animate={{ width: result ? `${c.percent}%` : "0%" }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">{c.percent}% Impact Contribution</span>
                  <span className={cn(result ? `text-${c.color}` : "text-muted-foreground opacity-30")}>
                    {result ? "Analyzed" : "Inactive"}
                  </span>
                </div>
              </div>
            </GlassCard>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Configuration Window */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 40, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 40, height: 0 }}
            className="mt-10 overflow-hidden"
          >
            <GlassCard className="p-8 border-primary/20 glass-strong" hover={false} glowColor="primary">
              <div className="flex items-center justify-between mb-8 border-b border-border/30 pb-6">
                 <div>
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight"> Give Details</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-50">Provide operational metrics for precise impact calculation</p>
                 </div>
                 <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-muted/50 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
                {[
                  { label: "Private Commute (km/wk)", name: "privateVehicleKm", icon: Car },
                  { label: "Public Transit (km/wk)",  name: "publicVehicleKm",  icon: Globe },
                  { label: "Grid Energy (kWh/mo)",      name: "electricityKwh",   icon: Zap },
                  { label: "Meat Meals (nodes/wk)",    name: "meatKg",           icon: Utensils },
                  { label: "Dairy Mass (kg/wk)",       name: "dairyKg",          icon: Leaf },
                  { label: "Vegetarian Mass (kg/wk)",  name: "vegKg",            icon: Leaf },
                  { label: "Polymer Waste (kg/wk)",    name: "plasticWasteKg",   icon: ShoppingBag },
                ].map((field) => (
                  <div key={field.name} className="group/input">
                    <label className="text-[9px] font-black text-muted-foreground mb-2 block uppercase tracking-[0.2em] group-focus-within/input:text-primary transition-colors">
                       {field.label}
                    </label>
                    <div className="relative">
                      <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within/input:text-primary transition-colors" />
                      <input
                        type="number"
                        name={field.name}
                        value={form[field.name as keyof typeof form]}
                        onChange={handleChange}
                        placeholder="0.00"
                        min="0"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm font-black text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 flex border-t border-border/30 pt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCalculate}
                  disabled={loading}
                  className="ml-auto flex items-center gap-3 px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 glow-primary disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  ) : <TrendingDown className="w-4 h-4" />}
                  {loading ? "Processing Algorithms..." : "Calculate Footprint"}
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reduction Intelligence */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        transition={{ delay: 0.2 }}
        className="mt-10"
      >
        <GlassCard hover={false} className="p-8 border-warning/10" glowColor="warning">
          <div className="flex items-center gap-4 mb-8">
             <div className="p-3 bg-warning/10 rounded-2xl">
                <Footprints className="w-8 h-8 text-warning" />
             </div>
             <div>
                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Reduction Intelligence</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 opacity-50">Tactical environmental mitigation strategies</p>
             </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
            {[
              { text: "Dynamic shift to public infrastructure: Projected 30% transport emission drop.", icon: Globe },
              { text: "Nodes-based diet modification: Meat reduction targets ~0.3 tons CO₂/yr.", icon: Utensils },
              { text: "Operational energy optimization: Switch to LED/Smart systems for 15% delta.", icon: Zap },
              { text: "Localized procurement: Hyper-local produce minimizes transit footprint.", icon: ShoppingBag },
            ].map((t, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.1 }}
                className="card-3d flex items-center gap-5 p-4 rounded-2xl hover:bg-white/5 transition-colors group cursor-default gradient-border"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-all">
                  <t.icon className="w-5 h-5 text-warning group-hover:text-white" />
                </div>
                <p className="text-xs font-bold text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">{t.text}</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground/20 ml-auto group-hover:text-warning group-hover:translate-x-1 transition-all" />
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

export default CarbonFootprint;