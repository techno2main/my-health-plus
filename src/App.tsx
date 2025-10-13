import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Treatments from "./pages/Treatments";
import Calendar from "./pages/Calendar";
import Pros from "./pages/Pros";
import Stock from "./pages/Stock";
import Prescriptions from "./pages/Prescriptions";
import Settings from "./pages/Settings";
import History from "./pages/History";
import TreatmentForm from "./pages/TreatmentForm";
import StockForm from "./pages/StockForm";
import PrescriptionForm from "./pages/PrescriptionForm";
import ProForm from "./pages/ProForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/treatments" element={<Treatments />} />
          <Route path="/treatments/new" element={<TreatmentForm />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/stock/new" element={<StockForm />} />
          <Route path="/stock/adjust" element={<StockForm />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/pros" element={<Pros />} />
          <Route path="/pros/new" element={<ProForm />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/prescriptions/new" element={<PrescriptionForm />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history" element={<History />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
