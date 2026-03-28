import { Routes, Route, Navigate } from "react-router-dom";
import { useAppContext } from "./context/AppContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import WasteClassification from "./pages/WasteClassification";
import Environment from "./pages/Environment";
import CarbonFootprint from "./pages/CarbonFootprint";
import DustbinLocator from "./pages/DustbinLocator";

import CollectGarbage from "./pages/CollectGarbage";

import HospitalLocator from "./pages/HospitalLocator"
import Profile from "./pages/Profile";
import Marketplace from "./pages/Marketplace";
import NotFound from "./pages/NotFound";
import SignupPage from "./pages/SignupPage";
import SigninPage from "./pages/SigninPage";

const App = () => {
  const { token } = useAppContext();

  return (
    <Routes>
      {/* Public Routes - accessible only when NOT logged in */}
      <Route path="/" element={!token ? <Index /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!token ? <SignupPage /> : <Navigate to="/dashboard" />} />
      <Route path="/signin" element={!token ? <SigninPage /> : <Navigate to="/dashboard" />} />

      {/* Protected Routes - accessible only when logged in */}
      <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/signin" />} />
      <Route path="/waste" element={token ? <WasteClassification /> : <Navigate to="/signin" />} />
      <Route path="/environment" element={token ? <Environment /> : <Navigate to="/signin" />} />
      <Route path="/hospital" element={token?<HospitalLocator />:<Navigate to="/signin" />} />
      <Route path="/carbon" element={token ? <CarbonFootprint /> : <Navigate to="/signin" />} />
      <Route path="/dustbin" element={token ? <DustbinLocator /> : <Navigate to="/signin" />} />

      <Route path="/collect" element={token ? <CollectGarbage /> : <Navigate to="/signin" />} />

      <Route path="/profile" element={token ? <Profile /> : <Navigate to="/signin" />} />
      <Route path="/marketplace" element={token ? <Marketplace /> : <Navigate to="/signin" />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;