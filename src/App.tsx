import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import DataVault from "./pages/DataVault";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import ProfitLoss from "./pages/ProfitLoss";
import Inventory from "./pages/Inventory";
import MultiProperty from "./pages/MultiProperty";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "inventory") return <Navigate to="/inventory" replace />;
  return <Navigate to="/dashboard" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RootRedirect />} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["manager", "direction"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/pl" element={<ProtectedRoute allowedRoles={["manager", "direction"]}><ProfitLoss /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute allowedRoles={["manager", "direction"]}><Insights /></ProtectedRoute>} />
            <Route path="/data" element={<ProtectedRoute allowedRoles={["manager", "inventory"]}><DataVault /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute allowedRoles={["inventory"]}><Inventory /></ProtectedRoute>} />
            <Route path="/multi-property" element={<ProtectedRoute allowedRoles={["manager", "direction"]}><MultiProperty /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
