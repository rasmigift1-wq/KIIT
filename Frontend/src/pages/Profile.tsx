import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Edit3, 
  LogOut, 
  Phone,
  Activity,
  Leaf
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";
import { useAppContext } from "@/context/AppContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const Profile = () => {
  const { user, logout } = useAppContext();
  const [profileData, setProfileData] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || ""
  });

  useEffect(() => {
    setProfileData(user);
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
      mobile: user?.mobile || ""
    });
  }, [user]);

  const handleEditProfile = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setProfileData(data.data.user);
        setIsEditing(false);
        // Update user in context
        if (window.location.pathname === '/profile') {
          window.location.reload();
        }
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: profileData?.name || "",
      email: profileData?.email || "",
      mobile: profileData?.mobile || ""
    });
  };

  if (!profileData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
                  <User className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">User Protocol</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight uppercase">
                Profile <span className="text-gradient-secondary">Dashboard</span>
              </h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3 h-3 text-primary" />
                Secure ID: {profileData._id?.slice(-8).toUpperCase() || "UNLINKED"}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-black text-[10px] uppercase tracking-[0.2em] hover:bg-destructive hover:text-destructive-foreground transition-all shadow-xl shadow-destructive/10"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Terminate Session
              </motion.button>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Column: Avatar & Quick Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-4 space-y-8"
            >
              <GlassCard className="p-10 flex flex-col items-center text-center border-primary/20 overflow-hidden group gradient-border" glowColor="primary">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary via-primary/80 to-secondary p-1">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center border-4 border-background overflow-hidden relative group-hover:rotate-6 transition-transform">
                      <User className="w-16 h-16 text-primary" />
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-2 -right-2 p-3 bg-secondary rounded-2xl border-4 border-background text-secondary-foreground shadow-xl"
                  >
                    <Edit3 className="w-4 h-4" />
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">{profileData.name}</h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                    Climate Advocate
                  </div>
                </div>

                <div className="mt-8 w-full pt-8 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">
                    <span>Account Tier</span>
                    <span className="text-foreground">Premium Node</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
                    />
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  <Calendar className="w-4 h-4 text-primary" />
                  Registry: {new Date(profileData.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </GlassCard>

              <GlassCard className="p-8 border-secondary/20 overflow-hidden gradient-border card-3d" glowColor="secondary">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                       <Activity className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Impact Score</h4>
                       <p className="text-xl font-black text-foreground">8,420 <span className="text-xs opacity-40">IPS</span></p>
                    </div>
                 </div>
                 <div className="h-[100px] flex items-end gap-2 px-2">
                  {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                       <motion.div 
                         key={i}
                         initial={{ height: 0 }}
                         animate={{ height: `${h}%` }}
                         transition={{ delay: 0.5 + i * 0.1 }}
                         className="flex-1 rounded-t-lg hover:opacity-100 transition-all"
                         style={{ background: `hsl(${142 - i * 10} 72% ${44 + i * 3}%)`, opacity: 0.6 }}
                       />
                     ))}
                 </div>
              </GlassCard>
            </motion.div>

            {/* Right Column: Personal Info & Edit */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-8"
            >
              <GlassCard className="p-10 border-primary/20 h-full gradient-border" hover={false} glowColor="primary">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/10">
                      <Edit3 className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-[0.3em]">Personal Intelligence</h3>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {!isEditing ? (
                      <motion.button 
                        key="edit"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                      >
                        Modify Protocol
                      </motion.button>
                    ) : (
                      <motion.div 
                        key="actions"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex gap-3"
                      >
                        <button 
                          onClick={handleEditProfile}
                          className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
                        >
                          Sync Changes
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-foreground border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                        >
                          Abort
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                        <User className="w-3 h-3 text-primary" /> Full Name
                      </label>
                      <div className={cn(
                        "group relative transition-all duration-300",
                        isEditing ? "scale-[1.02]" : ""
                      )}>
                        <input
                          disabled={!isEditing}
                          type="text"
                          value={isEditing ? editForm.name : profileData.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className={cn(
                            "w-full bg-white/5 border rounded-2xl px-6 py-5 text-sm font-bold transition-all outline-none",
                            isEditing 
                              ? "border-primary/50 bg-primary/5 text-foreground ring-4 ring-primary/10" 
                              : "border-white/5 text-foreground/70"
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                        <Mail className="w-3 h-3 text-primary" /> Core Email
                      </label>
                      <div className={cn(
                        "group relative transition-all duration-300",
                        isEditing ? "scale-[1.02]" : ""
                      )}>
                        <input
                          disabled={!isEditing}
                          type="email"
                          value={isEditing ? editForm.email : profileData.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className={cn(
                            "w-full bg-white/5 border rounded-2xl px-6 py-5 text-sm font-bold transition-all outline-none",
                            isEditing 
                              ? "border-primary/50 bg-primary/5 text-foreground ring-4 ring-primary/10" 
                              : "border-white/5 text-foreground/70"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                        <Phone className="w-3 h-3 text-primary" /> Uplink Mobile
                      </label>
                      <div className={cn(
                        "group relative transition-all duration-300",
                        isEditing ? "scale-[1.02]" : ""
                      )}>
                        <input
                          disabled={!isEditing}
                          type="tel"
                          value={isEditing ? editForm.mobile : (profileData.mobile || 'NOT CONFIGURED')}
                          onChange={(e) => setEditForm({...editForm, mobile: e.target.value})}
                          placeholder="XXXXXXXXXX"
                          maxLength={10}
                          className={cn(
                            "w-full bg-white/5 border rounded-2xl px-6 py-5 text-sm font-bold transition-all outline-none",
                            isEditing 
                              ? "border-primary/50 bg-primary/5 text-foreground ring-4 ring-primary/10" 
                              : "border-white/5 text-foreground/70"
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                        <MapPin className="w-3 h-3 text-primary" /> Region
                      </label>
                      <div className="w-full bg-white/10 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-foreground/40 cursor-not-allowed">
                        INDIA PROVINCE (Global North-East)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-8 bg-primary/5 border border-primary/10 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                         <Leaf className="w-6 h-6" />
                      </div>
                      <div>
                         <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Next Milestone</h5>
                         <p className="text-xs font-bold text-muted-foreground">Neutralize 500kg CO₂ to reach Level 5</p>
                      </div>
                   </div>
                   <button className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all">
                      View Progress
                   </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
