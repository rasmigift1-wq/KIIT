import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';
import ThreeBackground from '@/components/ThreeBackground';
import Navbar from '@/components/Navbar';

const SigninPage = () => {
  const { login } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setAuthLoading(true);
    await login(email, password);
    setAuthLoading(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <ThreeBackground />

      {/* Premium Background Accents */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/8 rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/8 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '6s' }} />
      </div>

      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-20 relative z-10">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hidden lg:flex flex-col gap-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.4em] text-primary w-fit"
            >
              <Zap className="w-4 h-4 animate-pulse" />
              Sentinel Authentication Protocol
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-6xl font-black leading-[0.9] tracking-tighter uppercase italic">
                <span className="text-gradient-secondary neon-text">CLIMA</span>
                <br />
                <span className="text-foreground">CARE</span>
                <span className="text-primary opacity-40">.</span>
              </h1>
              <div className="h-1 w-36 rounded-full bg-gradient-to-r from-primary via-secondary to-accent" />
            </div>

            <p className="text-lg text-muted-foreground max-w-md leading-relaxed font-bold uppercase tracking-wide opacity-80">
              Access your <span className="text-foreground">Geospatial Command Center</span> and contribute to global planetary stabilization.
            </p>

            <div className="grid grid-cols-2 gap-6 mt-8">
              {[
                { val: "98.4%", label: "Accuracy Rate" },
                { val: "50K+", label: "Active Nodes" },
                { val: "SENTINEL", label: "System Status" },
                { val: "SYNCED", label: "Data Pipeline" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="card-3d glass rounded-2xl p-6 gradient-border group"
                >
                  <div className="text-2xl font-black text-gradient-secondary mb-1 group-hover:scale-105 transition-transform italic">{s.val}</div>
                  <div className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="bg-card/30 backdrop-blur-3xl rounded-[2.5rem] p-10 border border-primary/20 shadow-2xl relative overflow-hidden group gradient-border glow-primary">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <Zap className="w-32 h-32 text-primary" />
              </div>

              {/* Header */}
              <div className="mb-10 relative z-10">
                <div className="flex items-center gap-3 text-primary mb-2">
                  <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">Initialize Session</span>
                </div>
                <h2 className="text-4xl font-black text-foreground uppercase tracking-tight">Identity <span className="text-gradient-secondary italic">Verify</span></h2>
                <p className="text-[11px] font-bold text-muted-foreground mt-2 uppercase tracking-widest opacity-60">Establish secure uplink with ClimaCare Sentinel Network</p>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-3"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                {/* Email */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">
                    Neural Uplink ID <span className="text-primary/50">(Email)</span>
                  </label>
                  <div className="relative group/input">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within/input:text-primary transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="identify@sentinel.network"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-bold"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                      Access Token <span className="text-primary/50">(Password)</span>
                    </label>
                    <Link to="/forgot-password" className="text-[10px] font-black text-primary hover:opacity-80 transition-opacity uppercase tracking-widest">
                      Recovery Protocol
                    </Link>
                  </div>
                  <div className="relative group/input">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within/input:text-primary transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-foreground placeholder:text-muted-foreground/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={authLoading}
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full mt-4 px-8 py-5 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:shadow-primary/50 glow-primary transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  {authLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Syncing Neural Link...</span></>
                  ) : (
                    <><span>Authorize Session</span><ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" /></>
                  )}
                </motion.button>
              </form>

              <div className="mt-10 pt-10 border-t border-white/5 text-center relative z-10">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                  New Node in the Network?{' '}
                  <Link to="/signup" className="text-primary font-black hover:underline underline-offset-4 transition-all">
                    Register Entity
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;