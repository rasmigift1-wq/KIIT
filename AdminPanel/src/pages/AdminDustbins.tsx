import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  Check, 
  X, 
  MapPin, 
  Shield, 
  Cpu, 
  Clock, 
  Eye, 
  AlertTriangle,
  Info
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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

const AdminDustbins = () => {
  const [dustbins, setDustbins] = useState<any[]>([]);
  const [pendingBins, setPendingBins] = useState<any[]>([]);
  const [selectedBin, setSelectedBin] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDustbins();
  }, []);

  const fetchDustbins = async () => {
    try {
      const [allRes, pendingRes] = await Promise.all([
        axios.get(`${API_URL}/api/dustbins?includeRejected=true`, { withCredentials: true }),
        axios.get(`${API_URL}/api/admin/dustbins/pending`, { withCredentials: true })
      ]);
      setDustbins(allRes.data);
      setPendingBins(pendingRes.data.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(true);
    try {
      await axios.patch(`${API_URL}/api/admin/dustbins/${id}/${action}`, {}, { withCredentials: true });
      setSelectedBin(null);
      fetchDustbins();
    } catch (err) {
      console.error("Action Error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-widest">Node Verification Cluster</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">High accuracy moderation required for route synchronization</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-warning/10 border border-warning/20 rounded-xl flex items-center gap-3">
             <AlertTriangle className="w-4 h-4 text-warning" />
             <span className="text-[10px] font-black uppercase tracking-widest">{pendingBins.length} Pending Approval</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-3 gap-8 min-h-0">
        {/* Map View */}
        <div className="lg:col-span-2 glass-card relative overflow-hidden p-0 border-0">
          <MapContainer 
            {...{ center: [20.317, 85.731], zoom: 13, className: "h-full w-full z-0" } as any}
          >
            <TileLayer {...{ url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" } as any} />
            {dustbins.map((bin) => (
              <Marker 
                {...{ 
                  key: bin._id, 
                  position: [bin.lat, bin.lng], 
                  icon: getDustbinIcon(bin.status || 'empty'),
                  eventHandlers: { click: () => setSelectedBin(bin) } 
                } as any}
              >
                <Popup {...{ className: "premium-popup" } as any}>
                   <div className="p-2 w-48 bg-black/90 text-white rounded-xl">
                      <div className="font-black text-xs uppercase mb-1">{bin.name}</div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase">{bin.verificationStatus} Node</div>
                   </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar Moderation Panel */}
        <div className="flex flex-col gap-6 overflow-hidden">
          <div className="glass-card flex-1 flex flex-col bg-black/40 overflow-hidden">
            <div className="p-6 border-b border-white/5 shrink-0 flex items-center justify-between bg-white/5">
              <h3 className="text-xs font-black uppercase tracking-widest">Incoming Stream</h3>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {pendingBins.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-30">
                  <Shield className="w-12 h-12 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No unverified packets in buffer</p>
                </div>
              ) : (
                pendingBins.map((bin) => (
                  <motion.div 
                    key={bin._id}
                    layoutId={bin._id}
                    onClick={() => setSelectedBin(bin)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                      selectedBin?._id === bin._id 
                      ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 group-hover:border-primary/30 transition-colors">
                        <img src={bin.imageUrl} alt={bin.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="text-xs font-black truncate">{bin.name}</div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase mt-1">AI: {(bin.aiScore * 100).toFixed(0)}% Match</div>
                      </div>
                      <Eye className={`w-4 h-4 mt-1 transition-colors ${selectedBin?._id === bin._id ? 'text-primary' : 'text-muted-foreground/30'}`} />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedBin && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="glass-card p-6 bg-black/60 border-primary/20"
              >
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-2">
                     <Shield className="w-4 h-4 text-primary" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Protocol Review</span>
                   </div>
                   <button onClick={() => setSelectedBin(null)} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-4 h-4" /></button>
                </div>

                <div className="space-y-6">
                  <div className="relative group">
                    <img src={selectedBin.imageUrl} alt="Review" className="w-full h-40 object-cover rounded-xl border border-white/10" />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl flex justify-between items-end">
                       <div className="text-[8px] font-black text-white/50 uppercase tracking-widest">Captured Assets</div>
                       <Info className="w-3 h-3 text-white/50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border ${selectedBin.isAIDetectedValid ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-danger/5 border-danger/20 text-danger'}`}>
                       <Cpu className="w-4 h-4 mb-2" />
                       <div className="text-[8px] font-black uppercase mb-0.5">Neural Scan</div>
                       <div className="text-[10px] font-bold">{selectedBin.isAIDetectedValid ? 'Passed' : 'Failed'}</div>
                    </div>
                    <div className={`p-4 rounded-xl border ${selectedBin.exifValid ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-danger/5 border-danger/20 text-danger'}`}>
                       <MapPin className="w-4 h-4 mb-2" />
                       <div className="text-[8px] font-black uppercase mb-0.5">EXIF Lock</div>
                       <div className="text-[10px] font-bold">{selectedBin.exifValid ? 'Verified' : 'Spoofed'}</div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      disabled={actionLoading}
                      onClick={() => handleAction(selectedBin._id, 'reject')}
                      className="flex-1 py-4 bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                    >
                      Purge Node
                    </button>
                    <button 
                      disabled={actionLoading}
                      onClick={() => handleAction(selectedBin._id, 'approve')}
                      className="flex-[2] py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      {actionLoading ? "Syncing..." : <>Finalize Verif <Check className="w-3.5 h-3.5" /></>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminDustbins;
