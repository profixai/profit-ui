import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, saveLastRoute } from "@/contexts/AuthContext";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import DataVault from "./pages/DataVault";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import ProfitLoss from "./pages/ProfitLoss";
import Inventory from "./pages/Inventory";
import MultiProperty from "./pages/MultiProperty";
import Overview from "./pages/Overview";
import Enterprise from "./pages/Enterprise";
import WhyProfix from "./pages/WhyProfix";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "inventory") return <Navigate to="/inventory" replace />;
  if (user.role === "manager") return <Navigate to="/dashboard" replace />;
  return <Navigate to="/overview" replace />;
};

const RouteTracker = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user && location.pathname !== "/login") {
      saveLastRoute(location.pathname);
    }
  }, [location.pathname, user]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PropertyProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteTracker />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<RootRedirect />} />
              <Route path="/overview" element={<ProtectedRoute allowedRoles={["manager", "direction"]}><Overview /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["manager", "direction"]}><Dashboard /></ProtectedRoute>} />
              <Route path="/pl" element={<ProtectedRoute allowedRoles={["manager", "direction"]}><ProfitLoss /></ProtectedRoute>} />
              <Route path="/insights" element={<ProtectedRoute allowedRoles={["manager", "direction"]}><Insights /></ProtectedRoute>} />
              <Route path="/data" element={<ProtectedRoute allowedRoles={["manager", "inventory"]}><DataVault /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute allowedRoles={["inventory"]}><Inventory /></ProtectedRoute>} />
              <Route path="/multi-property" element={<ProtectedRoute allowedRoles={["manager", "direction"]}><MultiProperty /></ProtectedRoute>} />
              <Route path="/enterprise" element={<ProtectedRoute allowedRoles={["direction"]}><Enterprise /></ProtectedRoute>} />
              <Route path="/why-profix" element={<ProtectedRoute allowedRoles={["direction"]}><WhyProfix /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PropertyProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
