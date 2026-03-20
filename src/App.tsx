import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login";
import Ledger from "./pages/Ledger";
import MaterialityMatrix from "./pages/MaterialityMatrix";
import CAPEXRoadmap from "./pages/CAPEXRoadmap";
import DataVault from "./pages/DataVault";
import Reporting from "./pages/Reporting";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/ledger" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/materiality" element={<MaterialityMatrix />} />
          <Route path="/roadmap" element={<CAPEXRoadmap />} />
          <Route path="/data" element={<DataVault />} />
          <Route path="/reporting" element={<Reporting />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
