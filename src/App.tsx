
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Creches from "./pages/Creches";
import CreheDetails from "./pages/CreheDetails";
import Reports from "./pages/Reports";
import CrehePerformance from "./pages/reports/CrehePerformance";
import FinancialOverview from "./pages/reports/FinancialOverview";
import StatMaps from "./pages/StatMaps";
import UserManagement from "./pages/UserManagement";
import RolesPermissions from "./pages/RolesPermissions";
import Support from "./pages/Support";
import SupportDetails from "./pages/SupportDetails";
import SupportRequestDetails from "./pages/SupportRequestDetails";
import Settings from "./pages/Settings";
import System from "./pages/System";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/creches" element={<Creches />} />
                  <Route path="/creches/:id" element={<CreheDetails />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/reports/creche-performance" element={<CrehePerformance />} />
                  <Route path="/reports/financial-overview" element={<FinancialOverview />} />
                  <Route path="/stat-maps" element={<StatMaps />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/roles" element={<RolesPermissions />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/support/:id" element={<SupportDetails />} />
                  <Route path="/support-requests/:id" element={<SupportRequestDetails />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/settings/system" element={<System />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
