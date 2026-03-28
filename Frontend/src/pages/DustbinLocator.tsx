import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { getCurrentPosition } from "@/lib/geolocation";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, Navigation, X, Info, Edit2, Trash2, Filter, Activity, Camera, RefreshCw, Check } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";
import CameraCapture from "@/components/CameraCapture";
import { cn } from "@/lib/utils";

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Color-coded dustbin icons
const emptyDustbinSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
    <rect x="5" y="10" width="30" height="25" fill="#22c55e" stroke="#16a34a" stroke-width="2" rx="3"/>
    <rect x="8" y="5" width="6" height="8" fill="#22c55e" stroke="#16a34a" stroke-width="1" rx="1"/>
    <rect x="26" y="5" width="6" height="8" fill="#22c55e" stroke="#16a34a" stroke-width="1" rx="1"/>
    <text x="20" y="25" text-anchor="middle" fill="white" font-size="8" font-weight="bold">E</text>
  </svg>
`);

const midDustbinSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
    <rect x="5" y="10" width="30" height="25" fill="#f59e0b" stroke="#d97706" stroke-width="2" rx="3"/>
    <rect x="8" y="5" width="6" height="8" fill="#f59e0b" stroke="#d97706" stroke-width="1" rx="1"/>
    <rect x="26" y="5" width="6" height="8" fill="#f59e0b" stroke="#d97706" stroke-width="1" rx="1"/>
    <text x="20" y="25" text-anchor="middle" fill="white" font-size="8" font-weight="bold">M</text>
  </svg>
`);

const fullDustbinSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
    <rect x="5" y="10" width="30" height="25" fill="#dc2626" stroke="#b91c1c" stroke-width="2" rx="3"/>
    <rect x="8" y="5" width="6" height="8" fill="#dc2626" stroke="#b91c1c" stroke-width="1" rx="1"/>
    <rect x="26" y="5" width="6" height="8" fill="#dc2626" stroke="#b91c1c" stroke-width="1" rx="1"/>
    <text x="20" y="25" text-anchor="middle" fill="white" font-size="8" font-weight="bold">F</text>
  </svg>
`);

const emptyDustbinIcon = new L.Icon({
  iconUrl: `data:image/svg+xml,${emptyDustbinSvg}`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const midDustbinIcon = new L.Icon({
  iconUrl: `data:image/svg+xml,${midDustbinSvg}`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const fullDustbinIcon = new L.Icon({
  iconUrl: `data:image/svg+xml,${fullDustbinSvg}`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const dustbinIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
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

const selectedLocationSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">
    <path d="M20 0 C9 0 0 9 0 20 C0 34 20 50 20 50 C20 50 40 34 40 20 C40 9 31 0 20 0Z" fill="#16a34a" stroke="#15803d" stroke-width="1.5"/>
    <circle cx="20" cy="20" r="7" fill="white"/>
    <circle cx="20" cy="20" r="4" fill="#16a34a"/>
  </svg>
`);

const selectedLocationIcon = new L.Icon({
  iconUrl: `data:image/svg+xml,${selectedLocationSvg}`,
  iconSize: [30, 38], iconAnchor: [15, 38], popupAnchor: [0, -40],
});

const MapClickHandler = ({ enabled, onLocationPick }: { enabled: boolean; onLocationPick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      if (enabled) onLocationPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const DustbinLocator = () => {
  const { dustbins, addDustbin, fetchNearbyDustbins, loading, error, token, user } = useAppContext();
  const [selected, setSelected] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [addForm, setAddForm] = useState({ name: "", image: null, status: "empty" });
  const [addLoading, setAddLoading] = useState(false);
  const [nearest, setNearest] = useState<any[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedData, setCapturedData] = useState<{ file: File; location: { lat: number; lng: number }; capturedAt: string } | null>(null);

  const [editingDustbin, setEditingDustbin] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", status: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const [pickingLocation, setPickingLocation] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    getCurrentPosition()
      .then(setUserLocation)
      .catch(() => setUserLocation({ lat: 20.317, lng: 85.731 }));
  }, []);

  const handleAddDustbinClick = () => {
    setShowCamera(true);
    setPickedLocation(null);
    setShowAddForm(false);
  };

  const handleCameraCapture = (file: File, location: { lat: number; lng: number }, capturedAt: string) => {
    setCapturedData({ file, location, capturedAt });
    setPickedLocation(location);
    setShowCamera(false);
    setShowAddForm(true);
  };

  const handleAddDustbin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !capturedData || !pickedLocation) {
      import('sonner').then(({ toast }) => toast.error('Incomplete data. Please ensure photo and location are captured.'));
      return;
    }
    
    setAddLoading(true);
    const formData = new FormData();
    formData.append("name", addForm.name);
    formData.append("lat", String(pickedLocation.lat));
    formData.append("lng", String(pickedLocation.lng));
    formData.append("image", capturedData.file);
    formData.append("status", addForm.status);
    formData.append("capturedAt", capturedData.capturedAt);
    formData.append("capturedLocation", JSON.stringify(capturedData.location));
    formData.append("reportedBy", user?.name || "Anonymous");

    await addDustbin(formData);
    
    setShowAddForm(false);
    setPickedLocation(null);
    setCapturedData(null);
    setAddForm({ name: "", image: null, status: "empty" });
    setAddLoading(false);
  };

  const handleFindNearest = async () => {
    if (!userLocation) return;
    try {
      const bins = await fetchNearbyDustbins(userLocation.lat, userLocation.lng);
      if (bins && bins.length > 0) {
        setNearest(bins);
        import('sonner').then(({ toast }) => toast.success(`Found ${bins.length} dustbins within tracking range.`));
      } else {
        setNearest([]);
        import('sonner').then(({ toast }) => toast.info('No nearby dustbins detected within 5km radius.'));
      }
    } catch (err) {
      import('sonner').then(({ toast }) => toast.error('Environmental scan failed. Please try again.'));
    }
  };

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
        window.location.reload();
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
    if (!window.confirm(`Delete "${dustbin.name}"?`)) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dustbins/${dustbin._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.status === 'success') {
        window.location.reload();
      }
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const getDustbinIcon = (status: string) => {
    switch (status) {
      case 'full': return fullDustbinIcon;
      case 'mid': return midDustbinIcon;
      default: return emptyDustbinIcon;
    }
  };

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
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">Gis Node Protocol</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight uppercase">
                Dustbin <span className="text-gradient-secondary">Locator</span>
              </h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3 h-3 text-primary" />
                Real-time Network Synchronization Active
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
                onClick={handleAddDustbinClick}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:shadow-primary/50 glow-primary transition-all"
              >
                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                Add Dustbin
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFindNearest}
                disabled={loading}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-foreground border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/30 border-t-primary" />
                ) : <Navigation className="w-4 h-4" />}
                {loading ? "Searching......" : "Find Neaerest"}
              </motion.button>
            </motion.div>
          </div>

          <AnimatePresence>
            {pickingLocation && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-warning/10 border border-warning/20 rounded-2xl flex items-center justify-between shadow-xl shadow-warning/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-warning/20 rounded-xl animate-pulse">
                      <MapPin className="w-6 h-6 text-warning" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-warning uppercase tracking-widest">Add Dustbins</p>
                      <p className="text-[10px] font-bold text-warning/60 uppercase tracking-tighter">Select precise coordinates of the Dustbin on map</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPickingLocation(false)}
                    className="p-2 hover:bg-warning/20 rounded-full text-warning transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-8">
        <GlassCard className={cn("lg:col-span-2 min-h-[500px] relative overflow-hidden p-0 border-0 gradient-border", pickingLocation && "ring-4 ring-warning/30 cursor-crosshair")} hover={false} glowColor={pickingLocation ? "warning" : "primary"}>
          <MapContainer {...{ center: userLocation ? [userLocation.lat, userLocation.lng] : [20.365908, 85.7592686], zoom: 15, scrollWheelZoom: true, className: "h-[500px] w-full z-0" } as any}>
            <TileLayer {...{ attribution: "&copy; OpenStreetMap contributors", url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" } as any} />
            <MapClickHandler enabled={pickingLocation} onLocationPick={(lat, lng) => setPickedLocation({ lat, lng })} />
            {userLocation && <Marker {...{ position: [userLocation.lat, userLocation.lng], icon: userLocationIcon } as any}><Popup>Current Position</Popup></Marker>}
            {pickedLocation && <Marker {...{ position: [pickedLocation.lat, pickedLocation.lng], icon: selectedLocationIcon } as any}><Popup>New Point</Popup></Marker>}
            {(nearest.length > 0 ? nearest : dustbins).map((d: any) => (
              <Marker {...{ key: d._id, position: [d.lat, d.lng], icon: getDustbinIcon(d.status), eventHandlers: { click: () => setSelected(d._id) } } as any}>
                <Popup {...{ className: "premium-popup" } as any}>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="p-1 w-[280px] text-foreground"
                  >
                     <div className="relative rounded-2xl overflow-hidden mb-4 group border border-white/10 shadow-2xl">
                       <img src={d.imageUrl} alt={d.name} className="w-full h-36 object-cover transition-transform duration-700 group-hover:scale-110" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                       <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                         <div>
                           <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-1">Node Identifier</div>
                           <div className="font-black text-xl text-white leading-none tracking-tight shadow-black drop-shadow-md">{d.name}</div>
                         </div>
                       </div>
                     </div>

                     <div className="px-1 mb-5">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <Activity className="w-3 h-3" /> Capacity Level
                          </span>
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", 
                             d.status === 'full' ? 'text-destructive' : d.status === 'mid' ? 'text-warning' : 'text-primary'
                          )}>{d.status === 'full' ? 'Critical' : d.status === 'mid' ? 'Moderate' : 'Optimal'}</span>
                       </div>
                       
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: d.status === 'full' ? '100%' : d.status === 'mid' ? '50%' : '15%' }}
                            transition={{ duration: 1, delay: 0.1, type: "spring" }}
                            className={cn("h-full rounded-full shadow-[0_0_10px_currentColor]", 
                              d.status === 'full' ? 'bg-destructive' : d.status === 'mid' ? 'bg-warning' : 'bg-primary'
                            )}
                          />
                       </div>
                     </div>

                     <div className="flex gap-2 px-1">
                        {token && (
                           <motion.button 
                              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2" 
                              onClick={(e) => { e.stopPropagation(); handleEditDustbin(d); }}
                           >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                           </motion.button>
                        )}
                        <motion.button 
                           whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                           className="flex-[2] py-3 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest glow-primary shadow-xl shadow-primary/20 flex items-center justify-center gap-2" 
                           onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lng}&destination=${d.lat},${d.lng}`, "_blank"); }}
                        >
                           <Navigation className="w-3.5 h-3.5" /> Navigate
                        </motion.button>
                     </div>
                  </motion.div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </GlassCard>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{nearest.length > 0 ? "Nearer Dustbin" : "All Dustbins"}</h3>
            <span className="text-[10px] font-bold bg-white/10 px-3 py-1 rounded-full">{(nearest.length > 0 ? nearest : dustbins).length} Units</span>
          </div>
          <div className="space-y-3 max-h-[430px] overflow-y-auto pr-2 custom-scrollbar">
            {(nearest.length > 0 ? nearest : dustbins).map((d: any, i: number) => (
              <motion.div key={d._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard className={cn("cursor-pointer p-4 group", selected === d._id ? "glow-primary bg-primary/5" : "hover:bg-white/10")} hover glowColor={d.status === 'full' ? 'danger' : d.status === 'mid' ? 'warning' : 'secondary'}>
                  <div onClick={() => setSelected(d._id)} className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl", d.status === 'full' ? 'bg-destructive/10 text-destructive' : d.status === 'mid' ? 'bg-warning/10 text-warning' : 'bg-secondary/10 text-secondary')}>
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-foreground">{d.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-tighter">Status: {d.status}</div>
                    </div>
                    <MapPin className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
          <motion.button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 text-white/50 font-bold text-xs uppercase tracking-widest border border-white/10">
            <Filter className="w-3.5 h-3.5" /> {showDetails ? "Hide" : "Filter"}
          </motion.button>
          <AnimatePresence>
            {showDetails && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <GlassCard className="mt-3 p-5" hover={false} glowColor="primary">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Stability", options: ["Any", "New", "Good"] },
                      { label: "Vector", options: ["Distance", "Volume"] }
                    ].map((f) => (
                      <div key={f.label}>
                        <label className="text-[9px] font-bold text-muted-foreground mb-1 block uppercase">{f.label}</label>
                        <select className="w-full bg-muted/30 rounded-lg px-3 py-2 text-[10px] outline-none">
                          {f.options.map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddForm(false)} className="absolute inset-0 bg-background/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative w-full max-w-lg">
              <GlassCard hover={false} className="glass-strong p-8" glowColor="primary">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3"><div className="p-3 bg-primary/20 rounded-2xl"><Plus className="w-6 h-6 text-primary" /></div><div><h3 className="text-xl font-black text-foreground">Add Dustbin</h3><p className="text-xs text-muted-foreground">Broadcast a new waste collection point</p></div></div>
                  <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-muted rounded-full"><X className="w-6 h-6" /></button>
                </div>
                <form className="space-y-6" onSubmit={handleAddDustbin}>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div><label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase">Name</label><input className="w-full bg-muted/30 rounded-xl px-4 py-3 text-sm outline-none" placeholder="e.g. Park Gate" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} required /></div>
                    <div><label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase">Status</label><select className="w-full bg-muted/30 rounded-xl px-4 py-3 text-sm outline-none" value={addForm.status} onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))}><option value="empty">Empty</option><option value="mid">Partial</option><option value="full">Critical</option></select></div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase">Verification Assets</label>
                    <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-black/40 aspect-video flex items-center justify-center group">
                      {capturedData ? (
                        <>
                          <img src={URL.createObjectURL(capturedData.file)} className="w-full h-full object-cover opacity-60" alt="Captured" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                            <Check className="w-8 h-8 text-primary mb-2" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Visual Evidence Locked</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setShowCamera(true)}
                            className="absolute bottom-4 right-4 p-2 bg-black/60 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-6">
                           <Camera className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">System requires real-time<br/>camera verification</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-muted/30 rounded-xl px-5 py-3 border border-secondary/20 font-mono">
                    <MapPin className="w-5 h-5 text-secondary animate-pulse" />
                    <span className="text-xs font-black tracking-tight">{pickedLocation ? `${pickedLocation.lat.toFixed(6)}, ${pickedLocation.lng.toFixed(6)}` : "Location Signal Missing"}</span>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    type="submit" 
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase shadow-xl shadow-primary/20 disabled:opacity-30 glow-primary transition-all" 
                    disabled={addLoading || !capturedData}
                  >
                    {addLoading ? "Broadcasting to Node..." : "Initiate Verification"}
                  </motion.button>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingDustbin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingDustbin(null)} className="absolute inset-0 bg-background/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative w-full max-w-lg">
              <GlassCard hover={false} className="glass-strong p-8" glowColor="warning">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3"><div className="p-3 bg-warning/20 rounded-2xl"><Edit2 className="w-6 h-6 text-warning" /></div><div><h3 className="text-xl font-black text-foreground">Edit Dustbin</h3><p className="text-xs text-muted-foreground">Adjust system parameters</p></div></div>
                  <button onClick={() => setEditingDustbin(null)} className="p-2 hover:bg-muted rounded-full"><X className="w-6 h-6" /></button>
                </div>
                <form className="space-y-6" onSubmit={handleUpdateDustbin}>
                  <div><label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase">Name</label><input className="w-full bg-muted/30 rounded-xl px-4 py-3 text-sm outline-none" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required /></div>
                  <div><label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase">Status</label><select className="w-full bg-muted/30 rounded-xl px-4 py-3 text-sm outline-none" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}><option value="empty">Empty</option><option value="mid">Mid Level</option><option value="full">Critical (Full)</option></select></div>
                  {editError && <div className="text-destructive text-xs font-bold">{editError}</div>}
                  <div className="flex gap-4">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase shadow-xl" disabled={editLoading}>{editLoading ? "Updating..." : "Update"}</motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => setEditingDustbin(null)} className="flex-1 py-4 rounded-2xl bg-muted text-foreground font-black text-sm uppercase">Cancel</motion.button>
                  </div>
                  <button type="button" onClick={() => handleDeleteDustbin(editingDustbin)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-destructive/30 text-destructive text-xs font-bold hover:bg-destructive/10 transition-colors mt-4"><Trash2 className="w-4 h-4" /> Remove from System</button>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {showCamera && (
          <CameraCapture 
            onCapture={handleCameraCapture} 
            onClose={() => setShowCamera(false)} 
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default DustbinLocator;