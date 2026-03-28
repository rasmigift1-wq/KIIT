import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Building2, Navigation, Phone, Clock, Star, X, Search, Activity, Heart, ShieldAlert } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { getCurrentPosition } from "@/lib/geolocation";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";
import { useAppContext } from "@/context/AppContext";
import { cn } from "@/lib/utils";

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userLocationSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">
    <path d="M20 0 C9 0 0 9 0 20 C0 34 20 50 20 50 C20 50 40 34 40 20 C40 9 31 0 20 0Z" fill="#3b82f6" stroke="#2563eb" stroke-width="1.5"/>
    <circle cx="20" cy="20" r="7" fill="white"/>
    <circle cx="20" cy="20" r="4" fill="#3b82f6"/>
  </svg>
`);

const userLocationIcon = new L.Icon({
  iconUrl: `data:image/svg+xml,${userLocationSvg}`,
  iconSize: [30, 38], iconAnchor: [15, 38], popupAnchor: [0, -40],
});

const hospitalLocationSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">
    <path d="M20 0 C9 0 0 9 0 20 C0 34 20 50 20 50 C20 50 40 34 40 20 C40 9 31 0 20 0Z" fill="#ef4444" stroke="#dc2626" stroke-width="1.5"/>
    <rect x="17" y="11" width="6" height="18" fill="white"/>
    <rect x="11" y="17" width="18" height="6" fill="white"/>
  </svg>
`);

const hospitalIcon = new L.Icon({
  iconUrl: `data:image/svg+xml,${hospitalLocationSvg}`,
  iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -42],
});

const HospitalLocator = () => {
  const { hospitals, fetchNearbyHospitals, loading } = useAppContext();
  const [selected, setSelected] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    getCurrentPosition()
      .then(setUserLocation)
      .catch(() => setUserLocation({ lat: 20.132025, lng: 85.596907 }));
  }, []);

  const handleFindNearest = async () => {
    if (!userLocation) return;
    await fetchNearbyHospitals(userLocation.lat, userLocation.lng, 10000);
  };

  const selectedHospital = hospitals.find((h) => h.id === selected);

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
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">Medical Response Protocol</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight uppercase">
                Medical <span className="text-gradient-secondary">Sentinel</span>
              </h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3 h-3 text-primary" />
                Critical Node Surveillance Active
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-wrap gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFindNearest}
                disabled={loading}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:shadow-primary/50 glow-primary transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground" />
                ) : <Navigation className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                {loading ? "Scanning Protocols..." : "Detect Nearest Node"}
              </motion.button>
            </motion.div>
          </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Map Container */}
        <GlassCard className="lg:col-span-2 min-h-[500px] relative overflow-hidden p-0 border-0 gradient-border" hover={false} glowColor="primary">
          <MapContainer {...{ center: userLocation ? [userLocation.lat, userLocation.lng] : [20.365809, 85.7592686], zoom: 14, scrollWheelZoom: true, className: "h-[500px] w-full z-0" } as any}>
            <TileLayer {...{ attribution: "&copy; OpenStreetMap contributors", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" } as any} />
            {userLocation && (
              <Marker {...{ position: [userLocation.lat, userLocation.lng], icon: userLocationIcon } as any}>
                <Popup {...{ className: "premium-popup" } as any}>Dynamic Position</Popup>
              </Marker>
            )}
            {hospitals.map((h) => (
              <Marker {...{ key: h.id, position: [h.lat, h.lon], icon: hospitalIcon, eventHandlers: { click: () => setSelected(h.id) } } as any}>
                <Popup {...{ className: "premium-popup" } as any}>
                  <div className="p-3 w-64">
                    <div className="font-black text-lg mb-2 text-foreground">{h.name}</div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold mb-3">
                       <MapPin className="w-3 h-3 text-primary" />
                       {h.address}
                    </div>
                    <div className="flex gap-2">
                       <button
                          className="flex-1 py-2 bg-white/5 text-foreground rounded-lg text-[10px] font-bold hover:bg-white/10 transition-colors"
                          onClick={() => { setSelected(h.id); setShowDetails(false); }}
                        >Details</button>
                       <button
                          className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lng}&destination=${h.lat},${h.lon}`, "_blank")}
                        >
                          <Navigation className="w-3 h-3" />
                          Route
                        </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </GlassCard>

        {/* Dynamic Hospital List */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              {hospitals.length > 0 ? "Detected Nodes" : "Network Inactive"}
            </h3>
            <span className="text-[10px] font-bold bg-white/10 px-3 py-1 rounded-full">{hospitals.length} Units</span>
          </div>
          
          <div className="space-y-3 max-h-[430px] overflow-y-auto pr-2 custom-scrollbar">
            {hospitals.length === 0 && (
              <div className="text-center py-12 px-6 rounded-3xl border border-dashed border-border/30">
                 <Search className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
                 <p className="text-sm font-medium text-muted-foreground opacity-50 italic">Activate geospatial scan to identify facilities</p>
              </div>
            )}
            {hospitals.map((h, i) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard
                  className={cn(
                    "cursor-pointer p-4 group border-border/10 gradient-border",
                    selected === h.id ? "glow-primary bg-primary/5 border-primary/20" : "hover:bg-white/10"
                  )}
                  hover
                  glowColor="primary"
                >
                  <div onClick={() => setSelected(h.id)} className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl transition-transform group-hover:scale-110",
                      selected === h.id ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-primary/10 text-primary"
                    )}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-black text-foreground group-hover:text-primary transition-colors truncate">{h.name}</div>
                      <div className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5 tracking-tighter truncate">{h.address}</div>
                    </div>
                    <MapPin className={cn(
                       "w-4 h-4 transition-colors",
                       selected === h.id ? "text-primary" : "text-muted-foreground/30"
                    )} />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <GlassCard className="mt-auto p-6 gradient-border" hover={false} glowColor="secondary">
             <div className="flex items-center gap-3 mb-4">
                <Heart className="w-5 h-5 text-secondary animate-pulse" />
                <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Health Sentinel</h4>
             </div>
             <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">Real-time status tracking for emergency response and specialized climate-adaptive care units.</p>
          </GlassCard>
        </div>
      </div>

      {/* Selected Node Profile */}
      <AnimatePresence>
        {selectedHospital && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="mt-10"
          >
            <GlassCard hover={false} glowColor="primary" className="p-8 border-primary/20 glass-strong gradient-border">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="p-4 bg-primary/20 rounded-2xl relative">
                      <Activity className="w-8 h-8 text-primary" />
                      <div className="absolute top-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-background animate-ping" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-foreground tracking-tight">{selectedHospital.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                         <div className="w-2 h-2 rounded-full bg-secondary" />
                         <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Active Facility</span>
                      </div>
                   </div>
                </div>
                <button onClick={() => { setSelected(null); setShowDetails(false); }} className="p-3 hover:bg-white/10 rounded-full transition-colors group">
                  <X className="w-6 h-6 text-muted-foreground group-hover:text-foreground" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                {[
                  { icon: MapPin, label: "Geospatial Address", value: selectedHospital.address },
                  { icon: Phone, label: "Communication Line", value: selectedHospital.phone },
                  { icon: Clock, label: "Operational Window", value: "24/7 Response" },
                  { icon: ShieldAlert, label: "Response Tier", value: "Emergency Grade" }
                ].map((stat) => (
                  <div key={stat.label} className="group/stat">
                    <div className="flex items-center gap-2 mb-3">
                       <stat.icon className="w-3.5 h-3.5 text-primary opacity-60 group-hover/stat:opacity-100 transition-opacity" />
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</span>
                    </div>
                    <div className="text-sm font-bold text-foreground leading-tight group-hover/stat:translate-x-1 transition-transform">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-8 border-t border-border/30">
                <motion.button
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/30 glow-primary transition-all"
                >
                  {showDetails ? "Cancel Request" : "Initiate Appointment"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lng}&destination=${selectedHospital.lat},${selectedHospital.lon}`, "_blank")}
                  className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-secondary text-secondary-foreground font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-secondary/20"
                >
                  <Navigation className="w-4 h-4" />
                  Request Directions
                </motion.button>
              </div>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 32 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden bg-white/5 rounded-3xl p-8 border border-white/10"
                  >
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                         {[
                           { label: "Patient Descriptor", placeholder: "Identity tag" },
                           { label: "Symptomatic Vector", placeholder: "Clinical details" }
                         ].map(f => (
                           <div key={f.label}>
                             <label className="text-[10px] font-black text-muted-foreground mb-2 block uppercase tracking-widest">{f.label}</label>
                             <input className="w-full bg-card/50 border border-border/50 rounded-xl px-5 py-3.5 text-sm text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder={f.placeholder} />
                           </div>
                         ))}
                      </div>
                      <div className="space-y-6">
                        <div>
                           <label className="text-[10px] font-black text-muted-foreground mb-2 block uppercase tracking-widest">Temporal Slot</label>
                           <input type="time" className="w-full bg-card/50 border border-border/50 rounded-xl px-5 py-3.5 text-sm text-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                        </div>
                        <button className="w-full h-[52px] bg-secondary text-secondary-foreground font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-secondary/10">
                          Finalize Transmission
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
</DashboardLayout>
  );
};

export default HospitalLocator;