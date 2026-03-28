import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TreePine, Wind, Thermometer, Droplets, Sun, CloudRain, AlertTriangle, Building2, Info, X, AlertCircle, Activity } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";
import CircularProgress from "@/components/CircularProgress";
import { useAppContext } from "@/context/AppContext";
import { cn } from "@/lib/utils";



const Environment = () => {
  const navigate = useNavigate();
  const { location, environment, loading, error } = useAppContext();
  const [showDetails, setShowDetails] = useState(false);
  const [showRiskAlert, setShowRiskAlert] = useState(true);
  const [forecast, setForecast] = useState<any[]>([]);
  const [forecastLoading, setForecastLoading] = useState(true);
  const riskScore = 45;
  const isHighRisk = riskScore > 40;

  const envMetrics = [
    { label: "AQI", value: environment?.aqi ? environment.aqi.toString() : "N/A", status: environment?.status, icon: Wind, color: "warning" as const },
    { label: "Temperature", value: environment?.temp ? `${environment.temp}°C` : "N/A", status: environment?.tdescription, icon: Thermometer, color: "danger" as const },
    { label: "Humidity", value: environment?.humidity ? `${environment.humidity}%` : "N/A", status: environment?.hdescription, icon: Droplets, color: "secondary" as const },
    { label: "UV Index", value: environment?.uvIndex ? environment.uvIndex.toString() : "N/A", status: environment?.uvDescription, icon: Sun, color: "warning" as const },
  ];

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setForecastLoading(true);
        const lat = location?.lat || 20.2105;
        const lon = location?.lng || 85.6812;
        const response = await fetch(`http://localhost:5000/api/weather/forecast?lat=${lat}&lon=${lon}`);
        const data = await response.json();
        if (data.status === 'success') {
          setForecast(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch forecast:", err);
      } finally {
        setForecastLoading(false);
      }
    };

    fetchForecast();
  }, [location]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-primary"></div>
              <motion.div 
                 animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
              />
            </div>
            <p className="mt-8 text-muted-foreground font-black tracking-[0.4em] uppercase text-[10px] animate-pulse">Synchronizing Data Modules...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10 p-4 sm:p-8 max-w-7xl mx-auto space-y-12">
          {/* High Risk Popup */}
          <AnimatePresence>
            {isHighRisk && showRiskAlert && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="mb-8"
              >
                <div 
                   onClick={() => navigate("/hospital")}
                   className="bg-destructive/10 border border-destructive/20 rounded-3xl p-6 flex items-center gap-6 cursor-pointer hover:bg-destructive/15 transition-all shadow-xl shadow-destructive/10 group overflow-hidden relative"
                >
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-32 h-32 text-destructive" />
                  </div>
                  <div className="p-4 bg-destructive/20 rounded-2xl group-hover:scale-110 transition-transform z-10">
                    <AlertTriangle className="w-8 h-8 text-destructive px-0.5" />
                  </div>
                  <div className="flex-1 z-10">
                    <h4 className="font-black text-destructive text-lg uppercase tracking-tight">Environmental Hazard Alert</h4>
                    <p className="text-xs font-bold text-destructive/70 max-w-2xl uppercase tracking-widest mt-1">Geospatial risk score exceeded safety threshold. Immediate surveillance recommended.</p>
                  </div>
                  <div className="flex flex-col items-center gap-2 z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowRiskAlert(false); }}
                      className="p-2 hover:bg-destructive/20 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-destructive/60" />
                    </button>
                    <div className="text-[10px] font-bold text-destructive/40 uppercase tracking-tighter">Dismiss Scan</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8 p-6 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-xs font-black uppercase tracking-widest flex items-center gap-4"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-3 text-primary mb-1">
                <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">Atmosphere Monitoring Protocol</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight uppercase">
                Environment <span className="text-gradient-secondary">Monitor</span>
              </h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Sun className="w-3 h-3 text-primary" />
                Global Geospatial Synchronized Active
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
                <Building2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                {showDetails ? "Hide Configuration" : "Refine Geospatial"}
              </motion.button>
            </motion.div>
          </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <GlassCard className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white/5 to-transparent gradient-border" hover={false} glowColor="secondary">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mb-8">Risk Index</h3>
          <div className="relative">
            <CircularProgress value={riskScore} label="Risk" size={200} color={isHighRisk ? "hsl(0, 77%, 62%)" : "hsl(158, 100%, 50%)"} />
            <motion.div 
               animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
               transition={{ repeat: Infinity, duration: 3 }}
               className="absolute inset-0 bg-secondary/5 rounded-full blur-3xl -z-10"
            />
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className={cn(
              "mt-8 flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg",
              isHighRisk ? "bg-destructive/20 text-destructive shadow-destructive/10" : "bg-secondary/20 text-secondary shadow-secondary/10"
            )}
          >
            <TreePine className="w-4 h-4" />
            {isHighRisk ? "Action Recommended" : "Stable Environment"}
          </motion.div>
        </GlassCard>

        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
          {envMetrics.map((m, i) => (
            <div key={m.label} className="card-3d">
            <GlassCard glowColor={m.color} delay={i * 0.1} className="h-full flex flex-col justify-between p-6 group gradient-border">
              <div className="flex items-center justify-between mb-6">
                <div className={cn(
                  "p-3 rounded-xl transition-transform group-hover:scale-110",
                  m.color === "warning" ? "bg-warning/10 text-warning" : 
                  m.color === "danger" ? "bg-destructive/10 text-destructive" : "bg-secondary/10 text-secondary"
                )}>
                  <m.icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter",
                  m.color === "danger" ? "bg-destructive/10 text-destructive" : 
                  m.color === "warning" ? "bg-warning/10 text-warning" : "bg-secondary/10 text-secondary"
                )}>
                  {m.status}
                </span>
              </div>
              <div>
                <div className="text-4xl font-black text-foreground mb-1 group-hover:translate-x-1 transition-transform">{m.value}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{m.label}</div>
              </div>
            </GlassCard>
            </div>
          ))}
        </div>
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
          {showDetails ? "Hide Location Precision" : "Refine Location Data"}
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
                <h3 className="text-lg font-bold text-foreground mb-6">Geospatial Configuration</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "City", placeholder: "Enter city", icon: Building2 },
                    { label: "Pin Code", placeholder: "Enter pin", type: "number" },
                    { label: "Latitude", placeholder: "e.g. 28.6139", type: "number" },
                    { label: "Longitude", placeholder: "e.g. 77.2090", type: "number" }
                  ].map((field, idx) => (
                    <motion.div 
                      key={field.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <label className="text-[10px] font-bold text-muted-foreground mb-1.5 block uppercase tracking-[0.2em] ml-1">{field.label}</label>
                      <div className="relative group/input">
                        {field.icon && <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within/input:text-primary transition-colors" />}
                        <input 
                          type={field.type || "text"}
                          className={cn(
                            "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-white/20",
                            field.icon && "pl-11"
                          )}
                          placeholder={field.placeholder} 
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.button 
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   className="mt-8 px-8 py-3 rounded-2xl bg-secondary text-secondary-foreground font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 group shadow-lg shadow-secondary/10"
                >
                  <Sun className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                  Override Geospatial Data
                </motion.button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true }} 
        className="mt-12"
      >
        <GlassCard hover={false} className="p-8 overflow-hidden" glowColor="primary">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
              <CloudRain className="w-6 h-6 text-primary" />
              Meteorological Forecast
            </h3>
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.3em] bg-white/5 px-4 py-2 rounded-full border border-white/10">7-Day Outlook</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {forecastLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Calculating Projections...</p>
              </div>
            ) : forecast && forecast.length > 0 ? (
              forecast.map((day, i) => {
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.05)" }}
                    className="card-3d flex flex-col items-center gap-4 py-6 rounded-2xl border border-primary/10 transition-all bg-white/5 gradient-border"
                  >
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{dayName}</span>
                    <span className="text-3xl filter drop-shadow-md">{day.condition.icon}</span>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-black text-foreground">{Math.round(day.maxTemp)}°</span>
                      <span className="text-[10px] font-bold text-muted-foreground opacity-60">{Math.round(day.minTemp)}°</span>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 px-6 rounded-2xl border border-dashed border-border/30">
                <Activity className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-sm font-medium text-muted-foreground opacity-50">Global forecast vectors are currently unavailable</p>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Environment;
