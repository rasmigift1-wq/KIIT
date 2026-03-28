import { useEffect, useState } from 'react';
import { 
  Users,
  Trash2, 
  AlertCircle,
  TrendingUp, 
  Zap,
  ArrowUpRight,
  Monitor
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import axios from 'axios';

const StatsCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="glass-card p-6 flex items-start gap-4">
    <div className={`p-4 rounded-2xl bg-${color}/10 border border-${color}/20`}>
      <Icon className={`w-6 h-6 text-${color}`} />
    </div>
    <div className="flex-1">
      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{title}</div>
      <div className="text-3xl font-black">{value}</div>
      <div className={`text-[10px] font-black mt-2 flex items-center gap-1 ${trend > 0 ? 'text-primary' : 'text-danger'}`}>
        <TrendingUp className={`w-3 h-3 ${trend < 0 && 'rotate-180'}`} />
        {Math.abs(trend)}% vs Last Update
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/stats`, { withCredentials: true });
      if (res.data.status === 'success') {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Dashboard Stats Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">Syncing Protocols</div>
        </div>
      </div>
    );
  }

  const chartData = stats?.charts?.dailySubmissions || [];
  const statusData = [
    { name: 'Approved', value: stats?.stats?.verifiedDustbins || 0, color: '#22c55e' },
    { name: 'Pending', value: stats?.stats?.pendingRequests || 0, color: '#f59e0b' },
    { name: 'Rejected', value: stats?.stats?.rejectedRequests || 0, color: '#ef4444' },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Nodes" value={stats?.stats?.totalDustbins || 0} icon={Trash2} trend={8} color="primary" />
        <StatsCard title="Personnel" value={stats?.stats?.totalUsers || 0} icon={Users} trend={12} color="secondary" />
        <StatsCard title="Sync Latency" value="12ms" icon={Zap} trend={-2} color="warning" />
        <StatsCard title="Active Systems" value="98.2%" icon={Monitor} trend={0.5} color="primary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-8 bg-black/40">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black uppercase tracking-widest">Temporal Growth</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Network scaling over the last orbital cycle</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold">
              Real-time Feed <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
          
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="day" stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff30" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#22c55e', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" stroke="#22c55e" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="glass-card p-8 bg-black/40">
          <div className="mb-8">
            <h3 className="text-xl font-black uppercase tracking-widest">Node Status</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Operational classification protocol</p>
          </div>

          <div className="h-[300px] mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff30" fontSize={8} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: '#050505', border: '1px solid #ffffff10' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{item.name} Units</span>
                </div>
                <div className="text-sm font-black">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="glass-card p-6 border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="p-3 bg-primary/20 rounded-2xl">
            <AlertCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Environmental Alert Protocol</div>
            <div className="text-sm font-bold opacity-70">Current system integrity is optimal. No critical failures detected in GC routes.</div>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2">
          Review Cluster <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
