
import { useState } from "react";
import { SystemOverview } from "@/components/dashboard/SystemOverview";
import { CrecheSelector } from "@/components/dashboard/CrecheSelector";
import { EnrollmentStats } from "@/components/dashboard/EnrollmentStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, School, DollarSign, AlertCircle, Calendar } from "lucide-react";

const Index = () => {
  const [selectedCreche, setSelectedCreche] = useState<string | null>(null);

  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('users')
        .select('first_name, last_name, roles:role_id(role_name)')
        .eq('id', user.id)
        .single();
      
      return data;
    }
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const [crechesResult, studentsResult, applicationsResult, invoicesResult, eventsResult] = await Promise.all([
        supabase.from("creches").select("*"),
        supabase.from("students").select("*"),
        supabase.from("applications").select("*").order('created_at', { ascending: false }).limit(5),
        supabase.from("invoices").select("*"),
        supabase.from("events").select("*").gte('start', new Date().toISOString()).order('start').limit(5)
      ]);

      const creches = crechesResult.data || [];
      const students = studentsResult.data || [];
      const applications = applicationsResult.data || [];
      const invoices = invoicesResult.data || [];
      const events = eventsResult.data || [];

      // Calculate growth metrics
      const thisMonth = new Date();
      const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1);
      
      const thisMonthApplications = applications.filter(app => 
        new Date(app.created_at) >= lastMonth
      ).length;
      
      const totalRevenue = invoices.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
      const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
      const paymentRate = invoices.length > 0 ? (paidInvoices / invoices.length) * 100 : 0;

      // Province distribution
      const provinceStats = creches.reduce((acc: any[], creche) => {
        const province = creche.province || 'Unknown';
        const existing = acc.find(p => p.province === province);
        const crecheStudents = students.filter(s => s.creche_id === creche.id).length;
        
        if (existing) {
          existing.creches += 1;
          existing.students += crecheStudents;
        } else {
          acc.push({
            province,
            creches: 1,
            students: crecheStudents,
            capacity: creche.capacity || 0
          });
        }
        return acc;
      }, []);

      return {
        recentApplications: applications,
        upcomingEvents: events,
        thisMonthApplications,
        totalRevenue,
        paymentRate,
        provinceStats
      };
    }
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [applicationsResult, invoicesResult] = await Promise.all([
        supabase
          .from("applications")
          .select("created_at, application_status")
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at'),
        supabase
          .from("invoices")
          .select("created_at, total_amount")
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at')
      ]);

      // Group by week for the chart
      const weeklyData = [];
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - ((i - 1) * 7));

        const weekApplications = applicationsResult.data?.filter(app => {
          const appDate = new Date(app.created_at);
          return appDate >= weekStart && appDate < weekEnd;
        }).length || 0;

        const weekRevenue = invoicesResult.data?.filter(inv => {
          const invDate = new Date(inv.created_at);
          return invDate >= weekStart && invDate < weekEnd;
        }).reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0;

        weeklyData.unshift({
          week: `Week ${4 - i}`,
          applications: weekApplications,
          revenue: weekRevenue
        });
      }

      return weeklyData;
    }
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8 pt-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              System Overview Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {userData?.first_name || 'User'} - {userData?.roles?.role_name || 'Loading...'}
            </p>
          </div>
        </div>

        {/* System-wide metrics */}
        <SystemOverview />

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.thisMonthApplications || 0}</div>
              <p className="text-xs text-muted-foreground">New applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{(dashboardData?.totalRevenue || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(dashboardData?.paymentRate || 0).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Success rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.upcomingEvents?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Next 7 days</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <CrecheSelector 
            selectedCreche={selectedCreche}
            onCrecheSelect={setSelectedCreche}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Recent Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity (Last 4 Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={recentActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="applications" fill="#8884d8" name="Applications" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue (R)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Provincial Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Provincial Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData?.provinceStats || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ province, percent }) => `${province} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="creches"
                  >
                    {(dashboardData?.provinceStats || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentApplications?.map((app: any) => (
                  <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{app.parent_name}</p>
                      <p className="text-sm text-muted-foreground">{app.parent_email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{app.application_status}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )) || <p className="text-muted-foreground">No recent applications</p>}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.upcomingEvents?.map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(event.start).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.start).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )) || <p className="text-muted-foreground">No upcoming events</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <EnrollmentStats data={dashboardData?.provinceStats || []} />
      </main>
    </div>
  );
};

export default Index;
