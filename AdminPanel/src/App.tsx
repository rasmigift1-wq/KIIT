import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminDustbins from './pages/AdminDustbins';
import AdminTrucks from './pages/AdminTrucks';
import AdminMarketplace from './pages/AdminMarketplace';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Simple Settings Placeholder
const AdminSettings = () => (
  <div className="glass-card p-12 text-center opacity-30">
    <div className="text-xl font-black uppercase tracking-widest mb-4">Core System Config</div>
    <p className="text-[10px] font-bold uppercase tracking-widest">Administrative parameters locked by root protocol</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout><Outlet /></AdminLayout>}>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/dustbins" element={<AdminDustbins />} />
            <Route path="/trucks" element={<AdminTrucks />} />
            <Route path="/marketplace" element={<AdminMarketplace />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
