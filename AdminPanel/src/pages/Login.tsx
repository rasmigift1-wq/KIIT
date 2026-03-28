import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.data.status === 'success') {
        const user = response.data.data.user;
        if (user.role !== 'admin') {
          setError('ACCESS DENIED: Administrative privileges required.');
          return;
        }
        // Redirect to dashboard
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'CRITICAL FAILURE: System authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 transition-all">
        <div className="glass-card p-10 border-primary/20 bg-black/40 backdrop-blur-2xl">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 neon-primary mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-black tracking-[0.3em] uppercase mb-2">Clima<span className="text-primary">Care</span></h1>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Administrative Access Terminal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Identity Override</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@climacare.sys"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:opacity-30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Access Cipher</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:opacity-30"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-danger/10 border border-danger/20 rounded-xl text-[10px] font-black text-danger uppercase tracking-widest animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-5 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
              ) : (
                <>
                  Establish Uplink
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40">
              WARNING: Unauthorized access detected and logged by CLIMACARE Security Core. Protocol 802.1x active.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
