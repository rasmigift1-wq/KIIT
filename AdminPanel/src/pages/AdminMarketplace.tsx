import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  Eye,
  Search,
  Filter,
  Package
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const AdminMarketplace = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<any>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/marketplace/listings`, { withCredentials: true });
      if (res.data.status === 'success') {
        setListings(res.data.data);
      }
    } catch (err) {
      console.error("Fetch Marketplace Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      await axios.patch(`${API_URL}/api/admin/marketplace/${id}/moderate`, { action }, { withCredentials: true });
      setSelectedListing(null);
      fetchListings();
    } catch (err) {
      console.error("Moderation Error:", err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-widest">Market Control Hub</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global trade moderation and asset verification</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Filter Assets..." 
              className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-primary/50 transition-colors w-64 uppercase font-bold tracking-widest" 
            />
          </div>
          <button className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="glass-card overflow-hidden bg-black/40 border-white/5">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Asset</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Seller</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Credits</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {listings.map((item) => (
                  <tr key={item._id} className="group hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedListing(item)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 grow-0 shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-xs font-black uppercase tracking-tight">{item.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase">{item.seller?.name || 'Anonymous'}</td>
                    <td className="px-6 py-4 font-mono text-xs text-primary">{item.price} CR</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        item.verificationStatus === 'approved' ? 'bg-primary/10 text-primary border border-primary/20' : 
                        item.verificationStatus === 'rejected' ? 'bg-danger/10 text-danger border border-danger/20' : 
                        'bg-warning/10 text-warning border border-warning/20'
                      }`}>
                        {item.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2 hover:bg-primary/20 rounded-lg text-primary transition-colors"><Check className="w-4 h-4" onClick={(e) => { e.stopPropagation(); handleModerate(item._id, 'approve'); }} /></button>
                         <button className="p-2 hover:bg-danger/20 rounded-lg text-danger transition-colors"><Trash2 className="w-4 h-4" onClick={(e) => { e.stopPropagation(); handleModerate(item._id, 'delete'); }} /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {listings.length === 0 && !loading && (
              <div className="p-20 text-center opacity-30">
                <Package className="w-12 h-12 mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">No assets detected in global market</p>
              </div>
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className="space-y-6">
           <AnimatePresence mode="wait">
             {selectedListing ? (
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="glass-card p-6 bg-black/60 border-primary/20 sticky top-4"
               >
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black uppercase tracking-widest">Asset Analysis</h3>
                    <button onClick={() => setSelectedListing(null)} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-4 h-4" /></button>
                 </div>

                 <img src={selectedListing.image} className="w-full h-48 object-cover rounded-xl border border-white/10 mb-6" alt="Preview" />
                 
                 <div className="space-y-4 mb-8">
                   <div>
                     <div className="text-[8px] font-black text-muted-foreground uppercase mb-1">Asset Protocol</div>
                     <div className="text-sm font-black">{selectedListing.name}</div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <div className="text-[8px] font-black text-muted-foreground uppercase mb-1">Category</div>
                       <div className="text-[10px] font-bold uppercase">{selectedListing.category}</div>
                     </div>
                     <div>
                       <div className="text-[8px] font-black text-muted-foreground uppercase mb-1">Integrity</div>
                       <div className="text-[10px] font-bold uppercase text-secondary">{selectedListing.condition}</div>
                     </div>
                   </div>
                   <div>
                     <div className="text-[8px] font-black text-muted-foreground uppercase mb-1">Description</div>
                     <p className="text-[10px] font-bold text-white/50 leading-relaxed">{selectedListing.description}</p>
                   </div>
                 </div>

                 <div className="flex gap-3">
                   <button 
                    onClick={() => handleModerate(selectedListing._id, 'reject')}
                    className="flex-1 py-3 bg-danger/10 text-danger border border-danger/20 rounded-xl text-[10px] font-black uppercase tracking-widest"
                   >
                     Reject
                   </button>
                   <button 
                    onClick={() => handleModerate(selectedListing._id, 'approve')}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                   >
                     Approve
                   </button>
                 </div>
               </motion.div>
             ) : (
               <div className="glass-card p-12 bg-white/5 border-dashed border-white/10 flex flex-col items-center justify-center text-center opacity-30">
                 <Eye className="w-8 h-8 mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em]">Select an asset<br/>to begin analysis</p>
               </div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminMarketplace;
