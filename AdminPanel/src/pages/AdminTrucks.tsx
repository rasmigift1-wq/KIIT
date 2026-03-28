import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import { 
  Navigation, 
  Route, 
  Truck, 
  Leaf, 
  Info, 
  Loader2, 
  Activity, 
  TrendingUp, 
  LayoutGrid, 
  ChevronRight,
  RefreshCw,
  Edit2,
  X,
  Trash2
} from "lucide-react";

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
    <text x="22" y="23" text-anchor="middle" fill="white" font-size="8" font-weight="bold">ADM-01</text>
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
  imageUrl: string;
}

interface Waypoint {
  lat: number;
  lng: number;
}

const RoutingMachine = ({ waypoints }: { waypoints: Waypoint[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || waypoints.length < 2) return;

    map.eachLayer((layer) => {
      if ((layer as any)._routingControl) {
        map.removeControl(layer as any);
      }
    });

    try {
      const routingControl = (L as any).Routing.control({
        waypoints: waypoints.map(wp => L.latLng(wp.lat, wp.lng)),
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
            { color: '#1e40af', weight: 8, opacity: 0.3 }
          ]
        }
      });
      routingControl.addTo(map);

      (routingControl as any)._routingControl = true;
      
      return () => {
        if (map && (routingControl as any)._routingControl) {
          map.removeControl(routingControl as any);
        }
      };
    } catch (err) {
      console.error("Routing error:", err);
    }
  }, [map, waypoints]);

  return null;
};

const AdminTrucks = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [userLocation] = useState<{ lat: number; lng: number } | null>({ lat: 20.2520, lng: 85.8530 });
  const [allDustbins, setAllDustbins] = useState<Dustbin[]>([]);
  const [optimizedRoute, setOptimizedRoute] = useState<Dustbin[]>([]);
  const [routeImpact, setRouteImpact] = useState<RouteImpact | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingDustbins, setFetchingDustbins] = useState(false);
  const [mapCenter] = useState<[number, number]>([20.2520, 85.8530]);

  const [editingDustbin, setEditingDustbin] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", status: "" });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = customRoutingStyles;
    document.head.appendChild(styleElement);
    fetchAllDustbins();
    return () => { document.head.removeChild(styleElement); };
  }, []);

  const fetchAllDustbins = async () => {
    try {
      setFetchingDustbins(true);
      const res = await axios.get(`${API_URL}/api/dustbins?includeRejected=true`);
      if (res.data) setAllDustbins(res.data);
    } catch (err) {
      console.error("Dustbins sync failed.");
    } finally {
      setFetchingDustbins(false);
    }
  };

  const getOptimizedRoute = async () => {
    if (!userLocation) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/routes/optimize`, { 
        lat: userLocation.lat, 
        lng: userLocation.lng 
      });
      if (res.data.status === 'success') {
        setOptimizedRoute(res.data.route);
        setRouteImpact(res.data.impact);
      }
    } catch (err: any) {
      console.error("Route computation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditDustbin = (dustbin: any) => {
    setEditingDustbin(dustbin);
    setEditForm({ name: dustbin.name, status: dustbin.status });
  };

  const handleUpdateDustbin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDustbin) return;
    setEditLoading(true);
    try {
      await axios.patch(`${API_URL}/api/dustbins/${editingDustbin._id}`, editForm, { withCredentials: true });
      fetchAllDustbins();
      setEditingDustbin(null);
    } catch (err) {
      console.error('Failed to update dustbin');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteDustbin = async (dustbin: any) => {
    if (!window.confirm(`Delete "${dustbin.name}"?`)) return;
    try {
      await axios.delete(`${API_URL}/api/dustbins/${dustbin._id}`, { withCredentials: true });
      fetchAllDustbins();
      setEditingDustbin(null);
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const routeCoordinates = userLocation && optimizedRoute.length > 0 
    ? [{ lat: userLocation.lat, lng: userLocation.lng }, ...optimizedRoute.map(bin => ({ lat: bin.lat, lng: bin.lng }))]
    : [];

  return (
    <div className="h-full flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 text-primary mb-1">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">Fleet Logistics Protocol</span>
          </div>
          <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">
            Fleet Systems <span className="text-primary">Control</span>
          </h2>
          <div className="flex flex-wrap gap-4 mt-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3 h-3 text-primary" />
              AI Route Optimization Module Active
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-wrap gap-3">
          <button
            onClick={getOptimizedRoute}
            disabled={loading || allDustbins.length === 0}
            className="px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Route className="w-4 h-4" />}
            Compute Best Route
          </button>
          
          <button
            onClick={fetchAllDustbins}
            disabled={fetchingDustbins}
            className="px-6 py-4 bg-white/5 hover:bg-white/10 text-foreground border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3"
          >
            {fetchingDustbins ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sync Network
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-0 flex-1">
        <div className="lg:col-span-8 h-full min-h-[500px]">
          <div className="glass-card h-full p-2 overflow-hidden relative border-primary/20">
            <div className="h-full rounded-[1.5rem] overflow-hidden relative">
              <MapContainer {...{ center: mapCenter, zoom: 14, scrollWheelZoom: true, className: "h-full w-full" } as any}>
                <TileLayer {...{ url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" } as any} />
                
                {userLocation && (
                  <Marker {...{ position: [userLocation.lat, userLocation.lng], icon: truckIcon } as any}>
                    <Popup {...{ className: "premium-popup" } as any}>
                      <div className="p-4 text-center space-y-3 bg-black/90 rounded-xl">
                         <div className="flex items-center justify-center gap-2 text-primary">
                            <Truck className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">ADM-01 MONITOR</span>
                         </div>
                         <div className="text-[9px] text-muted-foreground italic border-t border-white/5 pt-2 italic">
                           Tracking optimized vector...
                         </div>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {allDustbins.map((bin) => (
                  <Marker key={bin._id} {...{ position: [bin.lat, bin.lng], icon: getDustbinIcon(bin.status) } as any}>
                    <Popup {...{ className: "premium-popup" } as any}>
                        <div className="p-1 w-[240px] text-foreground">
                           <div className="relative rounded-xl overflow-hidden mb-3 group border border-white/10">
                             <img src={bin.imageUrl} alt={bin.name} className="w-full h-28 object-cover" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                             <div className="absolute bottom-2 left-3">
                                <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Node</div>
                                <div className="font-black text-sm text-white">{bin.name}</div>
                             </div>
                           </div>
                           <div className="flex items-center justify-between mb-4 px-1">
                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Status</span>
                              <span className={`text-[9px] font-black uppercase tracking-widest ${
                                 bin.status === 'full' ? 'text-danger' : bin.status === 'mid' ? 'text-secondary' : 'text-primary'
                              }`}>{bin.status}</span>
                           </div>
                           <div className="flex gap-2">
                              <button 
                                 className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-foreground rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10 flex items-center justify-center gap-2" 
                                 onClick={() => handleEditDustbin(bin)}
                              >
                                 <Edit2 className="w-3 h-3" /> Edit
                              </button>
                              <button 
                                 className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2" 
                                 onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${bin.lat},${bin.lng}`, "_blank")}
                              >
                                 <Navigation className="w-3 h-3" /> Navi
                              </button>
                           </div>
                        </div>
                    </Popup>
                  </Marker>
                ))}

                {routeCoordinates.length > 1 && <RoutingMachine waypoints={routeCoordinates} />}
              </MapContainer>
            </div>
            
            {/* Map UI Overlays */}
            <div className="absolute top-6 left-6 z-[1000]">
               <div className="px-4 py-2 flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">{allDustbins.length} Nodes Online</span>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
          {/* Stats Cards */}
          <div className="glass-card p-6 border-secondary/20 shrink-0">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
              <Leaf className="w-4 h-4 text-secondary" />
              Efficiency metrics
            </h3>
            {routeImpact ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                   <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-[9px] font-black opacity-40 uppercase block mb-1 tracking-widest">Radius</span>
                      <div className="text-lg font-black">{routeImpact.distanceKm.toFixed(2)}<span className="text-[10px] ml-1 opacity-40">KM</span></div>
                   </div>
                   <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-secondary">
                      <span className="text-[9px] font-black opacity-40 uppercase block mb-1 tracking-widest">Carbon Offset</span>
                      <div className="text-lg font-black">{routeImpact.carbonSavedKg.toFixed(2)}<span className="text-[10px] ml-1 opacity-40">KG</span></div>
                   </div>
                </div>
                <div className="p-4 bg-secondary/10 rounded-xl border border-secondary/20 flex items-center justify-between text-secondary">
                   <div>
                      <span className="text-[9px] font-black uppercase opacity-60 block tracking-widest">Gain Ratio</span>
                      <div className="text-xl font-black">{routeImpact.efficiencyGain}</div>
                   </div>
                   <TrendingUp className="w-6 h-6 opacity-50" />
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                 <Route className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed italic">Optimization required.<br/>Initiate vector computation.</p>
              </div>
            )}
          </div>

          <div className="glass-card p-6 border-primary/20 shrink-0">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
               <LayoutGrid className="w-4 h-4 text-primary" />
               Node Health Condition
            </h3>
            <div className="space-y-3">
              {[
                { label: "Full", count: allDustbins.filter(b => b.status === 'full').length, color: "text-danger", bg: "bg-danger/10" },
                { label: "Mid", count: allDustbins.filter(b => b.status === 'mid').length, color: "text-secondary", bg: "bg-secondary/10" },
                { label: "Empty", count: allDustbins.filter(b => b.status === 'empty').length, color: "text-primary", bg: "bg-primary/10" }
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/5">
                   <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${stat.color === 'text-danger' ? 'bg-danger' : stat.color === 'text-secondary' ? 'bg-secondary' : 'bg-primary'}`} />
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</span>
                   </div>
                   <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest ${stat.bg} ${stat.color}`}>{stat.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 border-white/5 flex-1 min-h-0 overflow-y-auto">
             <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Info className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-4">Directives</p>
                  <ul className="space-y-3">
                    {[
                      "Blue vector tracking active.",
                      "Priority-based node dispatch.",
                      "Bypassing optimal clusters.",
                      "Sequence validation locked."
                    ].map((guideline, i) => (
                      <li key={i} className="flex gap-2 text-[9px] font-bold text-muted-foreground uppercase opacity-70">
                        <ChevronRight className="w-3 h-3 text-primary shrink-0" />
                        {guideline}
                      </li>
                    ))}
                  </ul>
                </div>
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editingDustbin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingDustbin(null)} className="absolute inset-0 bg-background/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md">
              <div className="glass-card p-8 border-secondary/30">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-secondary/20 rounded-xl"><Edit2 className="w-5 h-5 text-secondary" /></div>
                     <h3 className="text-lg font-black uppercase tracking-tight text-white">Modify Node</h3>
                  </div>
                  <button onClick={() => setEditingDustbin(null)} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                <form className="space-y-6" onSubmit={handleUpdateDustbin}>
                  <div><label className="text-[10px] font-black text-muted-foreground mb-2 block uppercase tracking-widest">Name</label><input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-1 focus:ring-secondary/50" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required /></div>
                  <div><label className="text-[10px] font-black text-muted-foreground mb-2 block uppercase tracking-widest">Status</label><select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-1 focus:ring-secondary/50" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}><option value="empty">Empty (Bypass)</option><option value="mid">Mid Level</option><option value="full">Critical (Collect)</option></select></div>
                  <div className="flex gap-4">
                    <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest" disabled={editLoading}>{editLoading ? "Syncing..." : "Update"}</button>
                    <button type="button" onClick={() => setEditingDustbin(null)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 font-black text-[10px] uppercase tracking-widest">Cancel</button>
                  </div>
                  <button type="button" onClick={() => handleDeleteDustbin(editingDustbin)} className="w-full py-3 rounded-xl border border-danger/30 text-danger text-[10px] font-black uppercase tracking-widest hover:bg-danger/5 transition-all mt-2 flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /> Decommission</button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTrucks;
