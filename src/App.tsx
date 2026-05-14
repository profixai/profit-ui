import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, saveLastRoute } from "@/contexts/AuthContext";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { BackendStatusProvider } from "@/contexts/BackendStatusContext";
import { LiveClockProvider } from "@/contexts/LiveClockContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DataVault from "./pages/DataVault";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import ProfitLoss from "./pages/ProfitLoss";
import InvoiceDetail from "./pages/InvoiceDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to="/data" replace />;
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
        <LiveClockProvider>
        <BackendStatusProvider>
        <PropertyProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteTracker />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<RootRedirect />} />
              {/* ── Simplified MVP Routes ──────────────────────
                  Single user model. Surfaces: Data Vault (invoices),
                  Invoice Detail, monthly cost-only P&L, Settings. */}
              <Route path="/data" element={<ProtectedRoute><DataVault /></ProtectedRoute>} />
              <Route path="/pl" element={<ProtectedRoute><ProfitLoss /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/invoices" element={<Navigate to="/invoices/INV-2024-001" replace />} />
              <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetail /></ProtectedRoute>} />
              {/* Non-MVP routes (dashboard, overview, insights, why-profix,
                  inventory, multi-property, ESG, CAPEX, ledger, materiality,
                  reporting, roadmap, enterprise, upload) intentionally
                  removed from active routing for the simplified MVP. The
                  page files remain in src/pages/ in case they are revived;
                  any URL hits fall through to NotFound. */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PropertyProvider>
        </BackendStatusProvider>
        </LiveClockProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
