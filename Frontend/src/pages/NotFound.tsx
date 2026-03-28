import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Home, ArrowLeft, Zap } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-4">
      <ThreeBackground />

      {/* Premium Background Accents */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/8 rounded-full blur-[180px] animate-pulse" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-secondary/6 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="bg-card/30 backdrop-blur-3xl rounded-[3rem] p-12 border border-primary/20 shadow-2xl text-center relative overflow-hidden group gradient-border glow-primary">
          <div className="absolute -top-10 -right-10 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <AlertTriangle className="w-48 h-48 text-primary" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-8 ml-auto mr-auto"
          >
            <Zap className="w-4 h-4 animate-pulse" />
            System Exclusion Error
          </motion.div>

          <h1 className="text-8xl font-black text-foreground mb-4 tracking-tighter italic">
            404<span className="text-primary opacity-50">.</span>
          </h1>
          
          <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-4">
            Coordinate <span className="text-gradient-secondary italic">Not Found</span>
          </h2>
          
          <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed mb-10 opacity-70">
            The requested neural path <code className="text-primary bg-primary/10 px-2 py-0.5 rounded text-[10px]">{location.pathname}</code> does not exist within the ClimaCare Sentinel grid.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/30 glow-primary flex items-center gap-3 w-full sm:w-auto justify-center"
              >
                <Home className="w-4 h-4" />
                Return to Base
              </motion.button>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-foreground font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
              Pre-Uplink State
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
