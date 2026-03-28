import type { ReactNode } from 'react';
import { 
  LayoutDashboard, 
  Trash2, 
  Truck, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  ShieldCheck,
  Zap,
  Bell
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Node Overview', icon: LayoutDashboard },
  { path: '/dustbins', label: 'Dustbin Cluster', icon: Trash2 },
  { path: '/trucks', label: 'Fleet Systems', icon: Truck },
  { path: '/marketplace', label: 'Market Control', icon: ShoppingBag },
  { path: '/settings', label: 'Core Config', icon: Settings },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();

  const handleLogout = () => {
    // Clear cookies by setting a past expiry date (browser might not allow this for HttpOnly)
    // The best way is to have a backend endpoint that clears the cookie
    // But we can also just redirect to login; the ProtectedRoute will handle the rest if the cookie is gone or invalid
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "atoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/50 backdrop-blur-xl flex flex-col z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 neon-primary">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-[0.3em] uppercase leading-none">Clima<span className="text-primary">Care</span></h1>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Admin OS</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary p-[1px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-black">AD</div>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[10px] font-black truncate">Super Admin</div>
              <div className="text-[8px] font-bold text-muted-foreground truncate uppercase">Root Access</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-2 text-muted-foreground hover:text-danger hover:bg-danger/5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
          >
            Logout Systems <LogOut className="w-3 h-3" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] pointer-events-none opacity-20" />

        {/* Top Header */}
        <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Network Online</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <Zap className="w-3 h-3 text-secondary" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Syncing...</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer">
              <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full border-2 border-background" />
            </div>
            <div className="h-8 w-[1px] bg-white/5" />
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-widest">UTC-5 Protocol</div>
              <div className="text-[14px] font-mono opacity-50">{new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
