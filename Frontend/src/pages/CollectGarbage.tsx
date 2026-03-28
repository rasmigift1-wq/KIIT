import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Navigation, 
  Route, 
  Truck, 
  Leaf, 
  Info, 
  Loader2, 
  AlertCircle, 
  Activity, 
  TrendingUp, 
  LayoutGrid, 
  ChevronRight,
  RefreshCw,
  Edit2,
  Plus,
  X,
  Trash2
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";
import { cn } from "@/lib/utils";

// Custom CSS to hide routing machine UI elements
const customRoutingStyles = `
  .leaflet-routing-container { display: none !important; }
  .leaflet-routing-collapse-btn { display: none !important; }
  .leaflet-routing-error { display: none !important; }
  .leaflet-routing-geocoder { display: none !important; }
  .leaflet-routing-alternatives-container { display: none !important; }
  .leaflet-routing-line { pointer-events: none !important; }
`;

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const truckSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 40" width="50" height="40">
    <rect x="5" y="10" width="35" height="20" fill="#3b82f6" stroke="#1e40af" stroke-width="2" rx="2"/>
    <rect x="35" y="12" width="10" height="16" fill="#2563eb" stroke="#1e40af" stroke-width="2" rx="1"/>
    <circle cx="12" cy="32" r="4" fill="#1f2937" stroke="#111827" stroke-width="1"/>
    <circle cx="38" cy="32" r="4" fill="#1f2937" stroke="#111827" stroke-width="1"/>
    <rect x="37" y="14" width="7" height="6" fill="#60a5fa" stroke="#3b82f6" stroke-width="1" rx="1"/>
    <text x="22" y="23" text-anchor="middle" fill="white" font-size="8" font-weight="bold">UNIT-01</text>
  </svg>
`);

const truckIcon = new L.Icon({
  iconUrl: `data:image/svg+xml,${truckSvg}`,
  iconSize: [50, 40],
  iconAnchor: [25, 40],
  popupAnchor: [0, -40],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [51, 41],
});

const emptyDustbinSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
    <rect x="8" y="12" width="24" height="20" rx="4" fill="#10b981" stroke="#059669" stroke-width="2"/>
    <path d="M12 12V8h16v4" stroke="#059669" stroke-width="2" fill="none"/>
  </svg>
`);

const fullDustbinSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
    <rect x="8" y="12" width="24" height="20" rx="4" fill="#ef4444" stroke="#dc2626" stroke-width="2"/>
    <path d="M12 12V8h16v4" stroke="#dc2626" stroke-width="2" fill="none"/>
  </svg>
`);

const midDustbinSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
    <rect x="8" y="12" width="24" height="20" rx="4" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>
    <path d="M12 12V8h16v4" stroke="#d97706" stroke-width="2" fill="none"/>
  </svg>
`);

const getDustbinIcon = (status: string) => {
  const svg = status === 'full' ? fullDustbinSvg : status === 'mid' ? midDustbinSvg : emptyDustbinSvg;
  return new L.Icon({
    iconUrl: `data:image/svg+xml,${svg}`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

interface RouteImpact {
  distanceKm: number;
  carbonSavedKg: number;
  efficiencyGain: string;
  binsSkipped: number;
  naiveDistanceKm: number;
  eligibleBins: number;
  totalBins: number;
  fullBins: number;
  midBins: number;
  emptyBins: number;
}

interface Dustbin {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  status: string;
  reportedBy: string;
  imageUrl: string;
  createdAt: string;
  color: string;
  priority: string;
  stopNumber: number;
}

interface Waypoint {
  lat: number;
  lng: number;
}

const RoutingMachine = ({ waypoints }: { waypoints: Waypoint[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || waypoints.length < 2) return;

    if (!(L as any).Routing) {
      const positions = waypoints.map(wp => [wp.lat, wp.lng] as [number, number]);
      L.polyline(positions, { color: '#3b82f6', weight: 6, opacity: 0.8 }).addTo(map);
      return;
    }

    map.eachLayer((layer) => {
      if ((layer as any)._routingControl) {
        map.removeControl(layer);
      }
    });

    try {
      const validWaypoints = waypoints
        .map(wp => L.latLng(wp.lat, wp.lng))
        .filter(wp => wp !== null);

      if (validWaypoints.length < 2) return;

      const routingControl = (L as any).Routing.control({
        waypoints: validWaypoints,
        router: (L as any).Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving'
        }),
        createMarker: () => null,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: false,
        lineOptions: {
          styles: [
            { color: '#3b82f6', weight: 6, opacity: 0.9 },
            { color: '#1e40af', weight: 8, opacity: 0.3 },
            { color: '#60a5fa', weight: 2, opacity: 0.8, dashArray: '10, 10' }
          ]
        }
      }).addTo(map);

      routingControl.on('routingerror', () => {
        const positions = waypoints.map(wp => [wp.lat, wp.lng] as [number, number]);
        L.polyline(positions, { color: '#ef4444', weight: 4, dashArray: '5, 10' }).addTo(map);
      });

      (routingControl as any)._routingControl = true;
      
      return () => {
        if (map && (routingControl as any)._routingControl) {
          map.removeControl(routingControl);
        }
      };
    } catch (err) {
      console.error("Routing error:", err);
    }
  }, [map, waypoints]);

  return null;
};

const CollectGarbage = () => {
  const { token } = useAppContext();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [allDustbins, setAllDustbins] = useState<Dustbin[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<Dustbin[]>([]);
  const [routeImpact, setRouteImpact] = useState<RouteImpact | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingDustbins, setFetchingDustbins] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.2520, 85.8530]);

  const [editingDustbin, setEditingDustbin] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", status: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const handleEditDustbin = (dustbin: any) => {
    setEditingDustbin(dustbin);
    setEditForm({ name: dustbin.name, status: dustbin.status });
    setEditError("");
  };

  const handleUpdateDustbin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDustbin) return;
    setEditLoading(true);
    setEditError("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dustbins/${editingDustbin._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });
      const data = await response.json();
      if (data.status === 'success') {
        fetchAllDustbins();
        setEditingDustbin(null);
        import('sonner').then(({ toast }) => toast.success('Dustbin parameters updated successfully.'));
      } else {
        setEditError(data.message || 'Failed to update dustbin');
      }
    } catch (err) {
      setEditError('Failed to update dustbin');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteDustbin = async (dustbin: any) => {
    if (!window.confirm(`Delete "${dustbin.name}"? This action is irreversible.`)) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dustbins/${dustbin._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.status === 'success') {
        fetchAllDustbins();
        setEditingDustbin(null);
        import('sonner').then(({ toast }) => toast.success('Dustbin removed from network.'));
      }
    } catch (err) {
      alert('Failed to delete');
    }
  };


  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = customRoutingStyles;
    document.head.appendChild(styleElement);
    return () => { document.head.removeChild(styleElement); };
  }, []);

  useEffect(() => {
    fetchUserLocation();
    fetchAllDustbins();
  }, []);

  const fetchUserLocation = async () => {
    try {
      const location = { lat: 20.2520, lng: 85.8530 };
      setUserLocation(location);
      setMapCenter([location.lat, location.lng]);
    } catch (err: any) {
      setError("Unable to set location protocol.");
    }
  };

  const fetchAllDustbins = async () => {
    try {
      setFetchingDustbins(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dustbins`);
      if (response.ok) {
        const dustbins = await response.json();
        setAllDustbins(dustbins);
      }
    } catch (err) {
      setError("Dustbins sync failed.");
    } finally {
      setFetchingDustbins(false);
    }
  };

  const getOptimizedRoute = async () => {
    if (!userLocation) return;
    setLoading(true); setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/routes/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: userLocation.lat, lng: userLocation.lng })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setOptimizedRoute(data.route);
        setRouteImpact(data.impact);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Route computation failed.");
    } finally {
      setLoading(false);
    }
  };

  const routeCoordinates = userLocation && optimizedRoute.length > 0 
    ? [
        { lat: userLocation.lat, lng: userLocation.lng },
        ...optimizedRoute.map(bin => ({ lat: bin.lat, lng: bin.lng }))
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10 p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-3 text-primary mb-1">
                <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">Logistics Protocol</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight uppercase">
                Garbage <span className="text-gradient-secondary">Collection</span>
              </h1>
              <div className="flex flex-wrap gap-4 mt-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-3 h-3 text-primary" />
                  AI-Powered Route Optimization Active
                </p>
                {userLocation && (
                   <span className="text-[10px] font-black text-primary/60 uppercase tracking-tighter">
                      📍 GPS Locked: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                   </span>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={getOptimizedRoute}
                disabled={loading || !userLocation || allDustbins.length === 0}
                className="px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:shadow-primary/50 glow-primary transition-all flex items-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Route className="w-4 h-4" />}
                {loading ? "Calculating..." : "Compute Best Route"}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchAllDustbins}
                disabled={fetchingDustbins}
                className="px-6 py-4 bg-white/5 hover:bg-white/10 text-foreground border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3"
              >
                {fetchingDustbins ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Sync Dustbins
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchUserLocation}
                className="px-6 py-4 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3"
              >
                <Navigation className="w-4 h-4" />
                Reset GPS
              </motion.button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <GlassCard className="h-[700px] p-2 overflow-hidden border-primary/20 gradient-border" glowColor="primary">
                <div className="h-full rounded-[2.5rem] overflow-hidden relative border border-white/5">
                  {mapCenter && (
                    <MapContainer {...{ center: mapCenter, zoom: 14, scrollWheelZoom: true, className: "h-full w-full" } as any}>
                      <TileLayer {...{ attribution: '&copy; OpenStreetMap contributors', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" } as any} />
                      
                      {userLocation && (
                        <Marker {...{ position: [userLocation.lat, userLocation.lng], icon: truckIcon } as any}>
                          <Popup {...{ className: "premium-popup" } as any}>
                            <div className="p-4 text-center space-y-3 bg-gray-950/20">
                               <div className="flex items-center justify-center gap-2 text-primary">
                                  <Truck className="w-6 h-6" />
                                  <span className="text-sm font-black uppercase tracking-[0.2em]">Mobile Unit-01</span>
                               </div>
                               <div className="space-y-1">
                                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Current Position</div>
                                  <div className="text-[10px] font-black text-primary uppercase">GPS Signal High</div>
                               </div>
                               <div className="text-[9px] text-muted-foreground italic border-t border-white/5 pt-2">
                                 Ready for collection protocol
                               </div>
                            </div>
                          </Popup>
                        </Marker>
                      )}

                      {allDustbins.map((bin) => (
                        <Marker key={bin._id} {...{ position: [bin.lat, bin.lng], icon: getDustbinIcon(bin.status) } as any}>
                          <Popup {...{ className: "premium-popup" } as any}>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="p-1 w-[280px] text-foreground"
                  >
                     <div className="relative rounded-2xl overflow-hidden mb-4 group border border-white/10 shadow-2xl">
                       <img src={bin.imageUrl} alt={bin.name} className="w-full h-36 object-cover transition-transform duration-700 group-hover:scale-110" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                       <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                         <div>
                           <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-1">Node Identifier</div>
                           <div className="font-black text-xl text-white leading-none tracking-tight shadow-black drop-shadow-md">{bin.name}</div>
                         </div>
                       </div>
                     </div>

                     <div className="px-1 mb-5">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <Activity className="w-3 h-3" /> Capacity Level
                          </span>
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", 
                             bin.status === 'full' ? 'text-destructive' : bin.status === 'mid' ? 'text-warning' : 'text-primary'
                          )}>{bin.status === 'full' ? 'Critical' : bin.status === 'mid' ? 'Moderate' : 'Optimal'}</span>
                       </div>
                       
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: bin.status === 'full' ? '100%' : bin.status === 'mid' ? '50%' : '15%' }}
                            transition={{ duration: 1, delay: 0.1, type: "spring" }}
                            className={cn("h-full rounded-full shadow-[0_0_10px_currentColor]", 
                              bin.status === 'full' ? 'bg-destructive' : bin.status === 'mid' ? 'bg-warning' : 'bg-primary'
                            )}
                          />
                       </div>
                     </div>

                     <div className="flex gap-2 px-1">
                        {token && (
                           <motion.button 
                              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2" 
                              onClick={(e) => { e.stopPropagation(); handleEditDustbin(bin); }}
                           >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                           </motion.button>
                        )}
                        <motion.button 
                           whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                           className="flex-[2] py-3 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest glow-primary shadow-xl shadow-primary/20 flex items-center justify-center gap-2" 
                           onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lng}&destination=${bin.lat},${bin.lng}`, "_blank"); }}
                        >
                           <Navigation className="w-3.5 h-3.5" /> Navigate
                        </motion.button>
                     </div>
                  </motion.div>
                </Popup>
                        </Marker>
                      ))}

                      {routeCoordinates.length > 1 && <RoutingMachine waypoints={routeCoordinates} />}
                    </MapContainer>
                  )}
                  <div className="absolute top-6 left-6 z-[1000]">
                     <GlassCard className="px-5 py-3 flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10" hover={false}>
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{allDustbins.length} Dustbins</span>
                     </GlassCard>
                  </div>
                </div>
              </GlassCard>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <GlassCard className="p-8 border-secondary/20 gradient-border" glowColor="secondary">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                  <Leaf className="w-5 h-5 text-secondary" />
                  Route Impact
                </h2>
                {routeImpact ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-white">
                          <span className="text-[10px] font-black opacity-40 uppercase block mb-1">Distance</span>
                          <div className="text-xl font-black tracking-tighter">{routeImpact.distanceKm.toFixed(2)}<span className="text-xs ml-1 opacity-40">KM</span></div>
                       </div>
                       <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-secondary">
                          <span className="text-[10px] font-black opacity-40 uppercase block mb-1">CO₂ Offset</span>
                          <div className="text-xl font-black tracking-tighter">{routeImpact.carbonSavedKg.toFixed(2)}<span className="text-xs ml-1 opacity-40">KG</span></div>
                       </div>
                    </div>
                    
                    <div className="p-5 bg-secondary/10 rounded-2xl border border-secondary/20 flex items-center justify-between text-secondary">
                       <div>
                          <span className="text-[10px] font-black uppercase opacity-60 block mb-1">Efficiency Ratio</span>
                          <div className="text-2xl font-black tracking-tighter">{routeImpact.efficiencyGain}</div>
                       </div>
                       <TrendingUp className="w-8 h-8 opacity-50" />
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Collection Sequence</h3>
                        <div className="space-y-3">
                           {optimizedRoute.slice(0, 4).map((bin, i) => (
                              <div key={bin._id} className="flex items-center gap-3">
                                 <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                                    {i + 1}
                                 </div>
                                 <div className="text-[11px] font-bold text-foreground/80 truncate uppercase tracking-tighter">{bin.name}</div>
                              </div>
                           ))}
                           {optimizedRoute.length > 4 && (
                              <p className="text-[9px] text-muted-foreground italic pl-9">
                                + {optimizedRoute.length - 4} additional Dustbins...
                              </p>
                           )}
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 text-center bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10 group transition-all">
                     <Route className="w-12 h-12 text-muted-foreground/10 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-relaxed">System Idle.<br/>Compute optimal path for Garbage Collection.</p>
                  </div>
                )}
              </GlassCard>

              <GlassCard className="p-8 border-primary/20 gradient-border" glowColor="primary">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3 mb-8">
                   <LayoutGrid className="w-5 h-5 text-primary" />
                   Conditon of Dustbins
                </h2>
                <div className="space-y-4">
                  {[
                    { label: "Full", count: allDustbins.filter(b => b.status === 'full').length, color: "text-destructive", bg: "bg-destructive/10" },
                    { label: "Mid", count: allDustbins.filter(b => b.status === 'mid').length, color: "text-warning", bg: "bg-warning/10" },
                    { label: "Empty", count: allDustbins.filter(b => b.status === 'empty').length, color: "text-primary", bg: "bg-primary/10" }
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-transparent rounded-2xl border border-white/5 group hover:bg-white/5 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className={cn("w-2 h-2 rounded-full", stat.color.replace('text', 'bg'))} />
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</span>
                       </div>
                       <span className={cn("px-3 py-1 rounded-lg text-xs font-black tracking-widest", stat.bg, stat.color)}>{stat.count}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-8 border-white/5 gradient-border text-white" hover={false}>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary"><Info className="w-4 h-4" /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-4">Operational Directives</p>
                    <ul className="space-y-4">
                      {[
                        "Blue path indicates AI-optimized road navigation.",
                        "Node prioritization based on fill-level and priority.",
                        "Empty Dustbins are bypassed to minimize carbon footprint.",
                        "Sequential stops validated for maximum transit efficiency."
                      ].map((guideline, i) => (
                        <li key={i} className="flex gap-3 text-[10px] font-bold text-muted-foreground uppercase leading-tight tracking-wider opacity-70">
                          <ChevronRight className="w-3 h-3 text-primary shrink-0 transition-transform group-hover:translate-x-1" />
                          {guideline}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
          <AnimatePresence>
        {editingDustbin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingDustbin(null)} className="absolute inset-0 bg-background/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative w-full max-w-lg">
              <GlassCard hover={false} className="glass-strong p-8" glowColor="warning">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3"><div className="p-3 bg-warning/20 rounded-2xl"><Edit2 className="w-6 h-6 text-warning" /></div><div><h3 className="text-xl font-black text-foreground uppercase tracking-tight">Edit Bin Node</h3><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Adjust status parameters</p></div></div>
                  <button onClick={() => setEditingDustbin(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6 text-muted-foreground" /></button>
                </div>
                <form className="space-y-6" onSubmit={handleUpdateDustbin}>
                  <div><label className="text-[10px] font-black text-muted-foreground mb-2 block uppercase tracking-widest px-1">Node Identifier</label><input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-warning/50 transition-all" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required /></div>
                  <div><label className="text-[10px] font-black text-muted-foreground mb-2 block uppercase tracking-widest px-1">Condition Protocol</label><select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-warning/50 transition-all" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}><option value="empty" className="bg-background">Empty (Optimized)</option><option value="mid" className="bg-background">Mid Level (Monitoring)</option><option value="full" className="bg-background">Critical (Immediate Collection)</option></select></div>
                  {editError && <div className="text-destructive text-[10px] font-black uppercase tracking-widest bg-destructive/10 p-3 rounded-lg border border-destructive/20">{editError}</div>}
                  <div className="flex gap-4">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 glow-primary transition-all" disabled={editLoading}>{editLoading ? "Syncing..." : "Update Node"}</motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => setEditingDustbin(null)} className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-foreground border border-white/10 font-black text-[10px] uppercase tracking-[0.2em] transition-all">Cancel</motion.button>
                  </div>
                  <button type="button" onClick={() => handleDeleteDustbin(editingDustbin)} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-destructive/30 text-destructive text-[10px] font-black uppercase tracking-[0.2em] hover:bg-destructive/10 transition-all mt-4"><Trash2 className="w-4 h-4" /> Decommission Node</button>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
      </div>
    </DashboardLayout>
  );
};

export default CollectGarbage;
