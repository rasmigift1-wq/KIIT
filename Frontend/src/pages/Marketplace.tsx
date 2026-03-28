import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, Search, Plus, Filter, Package, Tag, Trash2, CheckCircle,
  AlertCircle, X, History, TrendingUp, Store, MapPin, Phone, Mail, 
  ArrowRight, Sparkles, LayoutGrid, Heart, Info, ChevronRight, Activity, Globe, Wind
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";
import { useAppContext } from "@/context/AppContext";
import { cn } from "@/lib/utils";
import axios from 'axios';
import { toast } from 'sonner';

const categories = ['All', 'Plastic', 'Metal', 'Glass', 'Paper', 'Others'];

const Marketplace = () => {
  const { token, user, location: userLocation } = useAppContext();
  const [products, setProducts] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [myPurchases, setMyPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-activity'>('browse');
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNearbyFilterActive, setIsNearbyFilterActive] = useState(false);
  const [radius, setRadius] = useState(10); // Default 10km
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [sellerContact, setSellerContact] = useState<any>(null);
  const [loadingContact, setLoadingContact] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Plastic',
    condition: 'Used',
    image: null as File | null
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/products`);
      if (data.status === 'success') {
        setProducts(data.data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyActivity = async () => {
    try {
      // Fetch Listings
      const resList = await axios.get(`${API_URL}/api/products/my-listings`, { withCredentials: true });
      if (resList.data.status === 'success') setMyListings(resList.data.data);

      // Fetch Purchases
      const resPurch = await axios.get(`${API_URL}/api/products/my-purchases`, { withCredentials: true });
      if (resPurch.data.status === 'success') setMyPurchases(resPurch.data.data);
    } catch (err) {
      console.error("Error fetching activity:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isNearbyFilterActive && userLocation) {
        fetchNearbyProducts();
      } else {
        fetchProducts();
      }
    }, 300); // 300ms debounce
    
    if (token) fetchMyActivity();
    return () => clearTimeout(timer);
  }, [token, isNearbyFilterActive, radius]);

  const fetchNearbyProducts = async () => {
    if (!userLocation) return;
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/api/products/nearby`, {
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: radius
      });
      if (data.status === 'success') {
        setProducts(data.data);
      }
    } catch (err) {
      console.error("Error fetching nearby products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('description', formData.description);
      dataToSend.append('price', formData.price);
      dataToSend.append('category', formData.category);
      dataToSend.append('condition', formData.condition);
      
      // Use current location
      if (userLocation) {
        dataToSend.append('lat', String(userLocation.lat));
        dataToSend.append('lng', String(userLocation.lng));
      } else {
        // Fallback for Bhubaneswar if no location
        dataToSend.append('lat', "20.296");
        dataToSend.append('lng', "85.824");
      }

      if (formData.image) {
        dataToSend.append('image', formData.image);
      }

      const { data } = await axios.post(`${API_URL}/api/products`, dataToSend, {
        withCredentials: true
      });

      if (data.status === 'success') {
        setShowAddModal(false);
        setFormData({ name: '', description: '', price: '', category: 'Plastic', condition: 'Used', image: null });
        fetchProducts();
        fetchMyActivity();
        toast.success("Listing initialized successfully!");
      }
    } catch (err: any) {
      console.error("Error creating product:", err);
      toast.error(err.response?.data?.message || "Failed to initialize listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyProduct = async (productId: string) => {
    if (!token) {
      alert('Please login to view seller contact details');
      return;
    }

    try {
      setLoadingContact(true);
      const { data } = await axios.get(`${API_URL}/api/products/${productId}/contact`, {
        withCredentials: true
      });
      
      if (data.status === 'success') {
        setSelectedProduct(products.find(p => p._id === productId));
        setSellerContact(data.data.seller);
        setShowContactModal(true);
      }
    } catch (err: any) {
      console.error("Error fetching seller contact:", err);
      alert(err.response?.data?.message || "Failed to fetch seller contact details");
    } finally {
      setLoadingContact(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!selectedProduct) return;

    try {
      const { data } = await axios.patch(`${API_URL}/api/products/${selectedProduct._id}/buy`);
      if (data.status === 'success') {
        setShowContactModal(false);
        setSelectedProduct(null);
        setSellerContact(null);
        fetchProducts();
        fetchMyActivity();
      }
    } catch (err: any) {
      console.error("Error buying product:", err);
      alert(err.response?.data?.message || "Failed to buy product");
    }
  };

  const filteredProducts = products.filter(p => 
    (filter === 'All' || p.category === filter) &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Eco-Exchange Hub</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl font-black text-foreground tracking-tight flex items-center gap-4"
            >
              Sustainable Marketplace
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground font-medium max-w-xl"
            >
              Revolutionizing waste management through a premium circular economy platform.
            </motion.p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all border border-primary/10"
          >
            <Plus className="w-4 h-4" />
            Launch Listing
          </motion.button>
        </div>

        {/* Dynamic Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: "Global Inventory", value: products.length, icon: Store, color: "primary", description: "Units currently in orbit" },
            { label: "My Purchases", value: myPurchases.length, icon: CheckCircle, color: "secondary", description: "Your acquired resources" },
            { label: "My Listings", value: myListings.length, icon: TrendingUp, color: "warning", description: "Your market contributions" }
          ].map((stat, i) => (
            <GlassCard key={stat.label} className="p-6 relative overflow-hidden group" glowColor={stat.color as any} delay={i * 0.1}>
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon className="w-24 h-24" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className={cn("p-3 rounded-2xl", `bg-${stat.color}/10 text-${stat.color}`)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                  <div className="text-2xl font-black tabular-nums tracking-tighter">{stat.value}</div>
                </div>
              </div>
              <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">{stat.description}</div>
            </GlassCard>
          ))}
        </div>

        {/* Navigation & Filtering Interface */}
        <div className="space-y-8">
          <div className="flex items-center gap-2 p-1.5 bg-white/5 backdrop-blur-3xl rounded-2xl w-fit border border-white/10 shadow-2xl">
            {(['browse', 'my-activity'] as const).map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group",
                  activeTab === tab 
                    ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <span className="relative z-10">{tab.replace('-', ' ')}</span>
                {activeTab === tab && (
                  <motion.div layoutId="tab-glow" className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 animate-shimmer" />
                )}
              </button>
            ))}
          </div>

          {activeTab === 'browse' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row gap-6 p-6 rounded-3xl bg-white/5 border border-white/10 shadow-inner"
            >
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Scan marketplace for resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-primary/40 outline-none text-sm font-bold tracking-tight transition-all placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.2em] shadow-inner"
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => setIsNearbyFilterActive(!isNearbyFilterActive)}
                  className={cn(
                    "px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 border shadow-lg hover:y-[-2px]",
                    isNearbyFilterActive 
                      ? "bg-secondary border-secondary/20 text-secondary-foreground shadow-secondary/20" 
                      : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <MapPin className={cn("w-4 h-4", isNearbyFilterActive && "animate-bounce text-secondary-foreground")} />
                  {isNearbyFilterActive ? 'Nearby Mode' : 'Global Mode'}
                </button>
                
                <AnimatePresence>
                  {isNearbyFilterActive && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: -10 }}
                      className="flex items-center gap-6 bg-secondary/10 px-6 py-4 rounded-2xl border border-secondary/20 shadow-inner"
                    >
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-secondary uppercase tracking-widest">Radius</span>
                        <span className="text-xs font-black tabular-nums">{radius}km</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={radius}
                        onChange={(e) => setRadius(parseInt(e.target.value))}
                        className="w-32 h-1.5 bg-secondary/20 rounded-lg appearance-none cursor-pointer accent-secondary"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="h-10 w-px bg-border/30 mx-2 hidden lg:block" />
                
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {categories.map(cat => (
                    <button 
                      key={cat}
                      disabled={isNearbyFilterActive && cat !== 'All'}
                      onClick={() => setFilter(cat)}
                      className={cn(
                        "px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                        filter === cat 
                          ? "bg-primary/20 border-primary/30 text-primary" 
                          : "bg-muted/20 border-border/30 text-muted-foreground hover:bg-muted/40",
                        isNearbyFilterActive && cat !== 'All' && "opacity-30 cursor-not-allowed border-dashed"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Dynamic Products Grid */}
        {activeTab === 'browse' ? (
          loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6 bg-muted/5 rounded-3xl border border-dashed border-border/20">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <Activity className="w-12 h-12 text-primary animate-spin relative z-10" />
              </div>
              <div className="text-center">
                <p className="text-foreground font-black uppercase tracking-[0.2em] text-xs">Synchronizing Inventory</p>
                <p className="text-muted-foreground text-[10px] font-bold mt-1 uppercase tracking-widest">Accessing decentralized marketplace nodes...</p>
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                >
                  <GlassCard className="group h-full flex flex-col p-0 overflow-hidden border-white/10 bg-transparent" hover={true} glowColor={product.category === 'Plastic' ? 'primary' : 'secondary'}>
                    <div className="aspect-[5/4] bg-muted/10 relative overflow-hidden">
                      {product.image ? (
                        <motion.img 
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/10">
                          <Package className="w-20 h-20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className="px-3 py-1.5 bg-black/60 backdrop-blur-xl rounded-lg text-[9px] font-black text-white uppercase tracking-widest border border-white/10 shadow-2xl">
                          {product.category}
                        </span>
                        <div className={cn(
                          "px-3 py-1.5 bg-black/60 backdrop-blur-xl rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2",
                          product.condition === 'New' ? 'text-secondary' : 'text-warning'
                        )}>
                          <div className={cn("w-1 h-1 rounded-full animate-pulse", product.condition === 'New' ? 'bg-secondary' : 'bg-warning')} />
                          {product.condition}
                        </div>
                      </div>
                      
                      <div className="absolute bottom-4 right-4 flex flex-col items-end">
                         <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">Exchange Value</div>
                         <div className="text-2xl font-black text-white tabular-nums tracking-tighter drop-shadow-2xl">₹{product.price}</div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-2 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground leading-relaxed mb-6 line-clamp-2 italic opacity-60">
                        {product.description}
                      </p>
                      
                      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                              {product.seller?.name?.charAt(0) || 'U'}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-foreground uppercase tracking-tighter">
                                 {product.seller?.name || 'Authorized Seller'}
                              </span>
                              <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-[0.1em]">Identity Verified</span>
                           </div>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.1, x: 5 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleBuyProduct(product._id)}
                          disabled={loadingContact}
                          className="p-2.5 bg-white/10 hover:bg-primary hover:text-primary-foreground rounded-xl transition-all border border-white/20 text-muted-foreground"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-muted/5 rounded-[40px] border-2 border-dashed border-border/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Package className="w-20 h-20 text-muted-foreground/10 mx-auto mb-6 scale-90 group-hover:scale-110 transition-transform duration-500" />
              <h3 className="text-xl font-black text-foreground opacity-50 uppercase tracking-[0.2em]">Inventory Depleted</h3>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-2 max-w-xs mx-auto">No resources match your current search parameters. Initialize new listing protocol?</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="mt-8 text-[10px] font-black text-primary border-b border-primary/30 uppercase tracking-[0.3em] hover:tracking-[0.5em] transition-all"
              >
                Create Listing
              </button>
            </div>
          )
        ) : (
          /* Advanced Activity View */
          <div className="grid lg:grid-cols-2 gap-10">
            {/* My Listings Node */}
            <div className="space-y-6">
               <div className="flex items-center justify-between px-2">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                    <Activity className="w-4 h-4 text-warning" />
                    Market Placed
                 </h3>
                 <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{myListings.length} Active</span>
               </div>
               <div className="space-y-4">
                  {myListings.length > 0 ? (
                    myListings.map((p, i) => (
                      <motion.div 
                        key={p._id} 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <GlassCard className="p-5 flex items-center justify-between border-white/5 bg-white/5 group" hover={true} glowColor="warning">
                          <div className="flex items-center gap-5">
                             <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center border border-warning/20 shadow-inner group-hover:bg-warning group-hover:text-white transition-all">
                                <Package className="w-6 h-6 text-warning group-hover:text-white" />
                             </div>
                             <div>
                                <div className="text-xs font-black text-foreground uppercase tracking-widest mb-1">{p.name}</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                                   <span className="text-warning">₹{p.price}</span>
                                   <div className="w-1 h-1 rounded-full bg-border" />
                                   <span className="opacity-50 tracking-tighter">{p.category}</span>
                                </div>
                             </div>
                          </div>
                          <div className={cn(
                            "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                            p.status === 'Available' ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-muted/10 border-border/20 text-muted-foreground'
                          )}>
                             {p.status}
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-12 text-center bg-muted/5 rounded-[30px] border border-dashed border-border/10">
                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Node Inactive: No Listings Detected</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Acquisition History */}
            <div className="space-y-6">
               <div className="flex items-center justify-between px-2">
                 <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                    <History className="w-4 h-4 text-secondary" />
                    Purchased History
                 </h3>
                 <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{myPurchases.length} Transactions</span>
               </div>
               <div className="space-y-4">
                  {myPurchases.length > 0 ? (
                    myPurchases.map((p, i) => (
                      <motion.div 
                        key={p._id} 
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <GlassCard className="p-5 flex items-center justify-between border-white/5 bg-white/5 group" hover={true} glowColor="secondary">
                          <div className="flex items-center gap-5">
                             <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-inner group-hover:bg-secondary group-hover:text-white transition-all">
                                <CheckCircle className="w-6 h-6 text-secondary group-hover:text-white" />
                             </div>
                             <div>
                                <div className="text-xs font-black text-foreground uppercase tracking-widest mb-1">{p.name}</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                                   <span className="text-secondary">₹{p.price}</span>
                                   <div className="w-1 h-1 rounded-full bg-border" />
                                   <span className="opacity-50">Authorized: {p.seller?.name || 'Global User'}</span>
                                </div>
                             </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                        </GlassCard>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-12 text-center bg-muted/5 rounded-[30px] border border-dashed border-border/10">
                      <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Transaction History Offline</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}

        {/* Premium Add Product Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl"
              >
                <GlassCard className="p-8 sm:p-10 overflow-hidden border-white/10 bg-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)]" glowColor="primary">
                  <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-primary">
                        <ShoppingBag className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Market Protocol</span>
                      </div>
                      <h2 className="text-3xl font-black text-white tracking-tight uppercase">Launch Asset</h2>
                    </div>
                    <motion.button 
                      whileHover={{ rotate: 90, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowAddModal(false)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/10"
                    >
                      <X className="w-6 h-6 text-white/50" />
                    </motion.button>
                  </div>

                  <form onSubmit={handleCreateProduct} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                          <Package className="w-3 h-3" /> Asset Name
                        </label>
                        <input 
                          required
                          type="text" 
                          placeholder="Ex: Refined Plastic Pellets"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                          <Tag className="w-3 h-3" /> Classification
                        </label>
                        <select 
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:ring-2 focus:ring-primary/40 outline-none transition-all appearance-none cursor-pointer"
                        >
                          {categories.filter(c => c !== 'All').map(cat => (
                            <option key={cat} value={cat} className="bg-background text-foreground">{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                           Exchange Value (₹)
                        </label>
                        <input 
                          required
                          type="number" 
                          placeholder="0.00"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary/40 outline-none transition-all tabular-nums"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                           Asset Condition
                        </label>
                        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                          {['New', 'Refurbished', 'Used'].map((cond) => (
                            <button
                              key={cond}
                              type="button"
                              onClick={() => setFormData({...formData, condition: cond})}
                              className={cn(
                                "flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                formData.condition === cond ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5"
                              )}
                            >
                              {cond}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                          Technical Specifications
                        </label>
                        <textarea 
                          required
                          rows={4}
                          placeholder="Describe the material quality and environmental impact..."
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary/40 outline-none transition-all resize-none"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                          <Package className="w-3 h-3" /> Asset Visualization (Image)
                        </label>
                        <div className="relative group/file">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setFormData({...formData, image: e.target.files?.[0] || null})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:ring-2 focus:ring-primary/40 outline-none transition-all file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-primary/20 file:text-primary hover:file:bg-primary/30 file:uppercase file:tracking-widest"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                          <MapPin className="w-3 h-3" /> Logistics Node
                        </label>
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                           <Globe className="w-4 h-4 text-primary animate-pulse" />
                           <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
                             {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Detecting Uplink...'}
                           </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                      >
                        Abort
                      </button>
                      <button 
                         type="submit"
                         disabled={isSubmitting}
                         className="flex-[2] bg-primary text-primary-foreground py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isSubmitting ? <Activity className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Initialize Listing
                      </button>
                    </div>
                  </form>
                </GlassCard>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Premium Contact Seller Modal */}
        <AnimatePresence>
          {showContactModal && sellerContact && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowContactModal(false)}
                className="absolute inset-0 bg-black/90 backdrop-blur-3xl"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative w-full max-w-lg"
              >
                <GlassCard className="p-10 border-white/10 bg-white/5 overflow-hidden" glowColor="secondary">
                  <div className="absolute top-0 right-0 p-8">
                    <motion.button 
                      whileHover={{ rotate: 90 }}
                      onClick={() => setShowContactModal(false)}
                      className="text-white/20 hover:text-white transition-colors"
                    >
                      <X className="w-8 h-8" />
                    </motion.button>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-8">
                      <div className="absolute inset-0 bg-secondary/20 blur-2xl rounded-full scale-150 animate-pulse" />
                      <div className="w-24 h-24 rounded-[40px] bg-secondary/10 flex items-center justify-center border border-secondary/20 relative z-10 shadow-2xl">
                         <Store className="w-10 h-10 text-secondary" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center border-2 border-background z-20">
                         <CheckCircle className="w-4 h-4 text-secondary" />
                      </div>
                    </div>

                    <div className="space-y-2 mb-10">
                       <h2 className="text-2xl font-black text-white uppercase tracking-widest">{sellerContact.name}</h2>
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-4">Verified Exchange Partner</p>
                       <div className="flex items-center gap-2 justify-center px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20 w-fit mx-auto">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                          <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Active Connection</span>
                       </div>
                    </div>

                    <div className="w-full space-y-4 mb-10">
                       <div className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-colors">
                          <div className="p-3 bg-secondary/10 rounded-2xl text-secondary group-hover:bg-secondary group-hover:text-white transition-all shadow-inner">
                             <Phone className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                             <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Tele-Protocol</div>
                             <div className="text-sm font-black text-white tracking-widest">{sellerContact.mobile || 'NODE_NOT_FOUND'}</div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-colors">
                          <div className="p-3 bg-secondary/10 rounded-2xl text-secondary group-hover:bg-secondary group-hover:text-white transition-all shadow-inner">
                             <Mail className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                             <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Ether-Mail</div>
                             <div className="text-sm font-black text-white tracking-tight italic opacity-80">{sellerContact.email}</div>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-warning/5 rounded-2xl border border-warning/10 text-left">
                       <AlertCircle className="w-5 h-5 text-warning shrink-0" />
                       <p className="text-[9px] font-bold text-warning leading-relaxed uppercase tracking-tighter">Secure connection established. Please follow exchange protocols for resource acquisition.</p>
                    </div>

                    <div className="flex gap-4 w-full mt-10">
                       <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowContactModal(false)}
                        className="flex-1 py-5 bg-white/5 hover:bg-white/10 rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] text-white border border-white/10 transition-all"
                      >
                         Abort
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConfirmPurchase}
                        className="flex-[2] py-5 bg-primary text-primary-foreground rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 transition-all"
                      >
                         Finalize Exchange
                      </motion.button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Marketplace;
