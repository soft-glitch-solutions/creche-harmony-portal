
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopNav } from "@/components/layout/TopNav";
import Index from "./pages/Index";
import Creches from "./pages/Creches";
import CreheDetails from "./pages/CreheDetails";
import UserManagement from "./pages/UserManagement";
import RolesPermissions from "./pages/RolesPermissions";
import Settings from "./pages/Settings";
import System from "./pages/System";
import Reports from "./pages/Reports";
import FinancialOverview from "./pages/reports/FinancialOverview";
import CrehePerformance from "./pages/reports/CrehePerformance";
import StatMaps from "./pages/StatMaps";
import Support from "./pages/Support";
import SupportDetails from "./pages/SupportDetails";
import SupportRequestDetails from "./pages/SupportRequestDetails";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
              <AppSidebar />
              <main className="flex-1">
                <TopNav />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/creches" element={<Creches />} />
                  <Route path="/creches/:id" element={<CreheDetails />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/roles" element={<RolesPermissions />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/system" element={<System />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/reports/financial-overview" element={<FinancialOverview />} />
                  <Route path="/reports/creche-performance" element={<CrehePerformance />} />
                  <Route path="/stat-maps" element={<StatMaps />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/support/:id" element={<SupportDetails />} />
                  <Route path="/support-requests/:id" element={<SupportRequestDetails />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/auth" element={<Auth />} />
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
