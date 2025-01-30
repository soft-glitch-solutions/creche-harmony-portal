import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Users, School, Clock, AlertCircle } from "lucide-react";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, Admin</p>
            </div>
            <SidebarTrigger />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Creches"
              value="24"
              icon={<School className="h-5 w-5" />}
              trend={{ value: 12, isPositive: true }}
            />
            <MetricCard
              title="Active Children"
              value="486"
              icon={<Users className="h-5 w-5" />}
              trend={{ value: 8, isPositive: true }}
            />
            <MetricCard
              title="Pending Applications"
              value="12"
              icon={<Clock className="h-5 w-5" />}
            />
            <MetricCard
              title="Issues Reported"
              value="3"
              icon={<AlertCircle className="h-5 w-5" />}
              trend={{ value: 2, isPositive: false }}
            />
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Coming soon: Activity feed and notifications</p>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;