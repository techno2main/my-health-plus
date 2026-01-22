import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UpdateNotification } from "./components/UpdateNotification";
import { NotificationSchedulerProvider } from "./components/NotificationSchedulerProvider";
import { ProfileCompletionProvider } from "./contexts/ProfileCompletionContext";
import { useAutoRegenerateIntakes } from "./hooks/useAutoRegenerateIntakes";
import { useAutoArchiveTreatments } from "./hooks/useAutoArchiveTreatments";

// Lazy loading des pages
const Index = lazy(() => import("./pages/index/Index"));
const Auth = lazy(() => import("./pages/auth/Auth"));
const Treatments = lazy(() => import("./pages/treatments/Treatments"));
const Calendar = lazy(() => import("./pages/calendar/Calendar"));
const Stock = lazy(() => import("./pages/stocks/Stock"));
const Prescriptions = lazy(() => import("./pages/prescriptions/Prescriptions"));
const Settings = lazy(() => import("./pages/settings/Settings"));
const History = lazy(() => import("./pages/history/History"));
const TreatmentForm = lazy(() => import("./pages/treatment-form/TreatmentForm"));
const StockForm = lazy(() => import("./pages/stocks/StockForm"));
const Referentials = lazy(() => import("./pages/referentials/Referentials"));
const Profile = lazy(() => import("./pages/profile/Profile"));
const About = lazy(() => import("./pages/about/About"));
const StockDetails = lazy(() => import("./pages/stocks/StockDetails"));
const TreatmentEdit = lazy(() => import("./pages/treatment-edit/TreatmentEdit"));
const ProfileExport = lazy(() => import("./pages/profile-export/ProfileExport"));
const NotificationDebug = lazy(() => import("./pages/admin/NotificationDebug"));
const SettingsSectionOrder = lazy(() => import("./pages/settings/SettingsSectionOrder"));
const Personnalisation = lazy(() => import("./pages/settings/Personnalisation"));
const Reglages = lazy(() => import("./pages/settings/Reglages"));
const NotFound = lazy(() => import("./pages/not-found/NotFound"));
const Rattrapage = lazy(() => import("./pages/rattrapage/Rattrapage"));
const Onboarding = lazy(() => import("./pages/onboarding/Onboarding"));
const GettingStarted = lazy(() => import("./pages/getting-started/GettingStarted"));

const queryClient = new QueryClient();

const App = () => {
  // Régénération automatique des prises toutes les 6h
  useAutoRegenerateIntakes();
  
  // Archivage automatique des traitements expirés au démarrage
  useAutoArchiveTreatments();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <UpdateNotification />
        <BrowserRouter>
          <ProfileCompletionProvider>
            <NotificationSchedulerProvider>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>}>
            <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/getting-started" element={<ProtectedRoute><GettingStarted /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/treatments" element={<ProtectedRoute><Treatments /></ProtectedRoute>} />
            <Route path="/treatments/new" element={<ProtectedRoute><TreatmentForm /></ProtectedRoute>} />
            <Route path="/stocks" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
            <Route path="/stocks/new" element={<ProtectedRoute><StockForm /></ProtectedRoute>} />
            <Route path="/stocks/adjust" element={<ProtectedRoute><StockForm /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/profile-export" element={<ProtectedRoute><ProfileExport /></ProtectedRoute>} />
            <Route path="/prescriptions" element={<ProtectedRoute><Prescriptions /></ProtectedRoute>} />
            <Route path="/referentials" element={<ProtectedRoute><Referentials /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/sections-order" element={<ProtectedRoute><SettingsSectionOrder /></ProtectedRoute>} />
            <Route path="/settings/personnalisation" element={<ProtectedRoute><Personnalisation /></ProtectedRoute>} />
            <Route path="/settings/reglages" element={<ProtectedRoute><Reglages /></ProtectedRoute>} />
            <Route path="/notifications/debug" element={<ProtectedRoute><NotificationDebug /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="/stocks/:id" element={<ProtectedRoute><StockDetails /></ProtectedRoute>} />
            <Route path="/treatments/:id/edit" element={<ProtectedRoute><TreatmentEdit /></ProtectedRoute>} />
            <Route path="/rattrapage" element={<ProtectedRoute><Rattrapage /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </NotificationSchedulerProvider>
          </ProfileCompletionProvider>
        </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
