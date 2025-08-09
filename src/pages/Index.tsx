import { useState } from "react";
import { SystemOverview } from "@/components/dashboard/SystemOverview";
import { CrecheSelector } from "@/components/dashboard/CrecheSelector";
import { EnrollmentStats } from "@/components/dashboard/EnrollmentStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

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

  const { data: creches } = useQuery({
    queryKey: ["creches"],
    queryFn: async () => {
      const { data } = await supabase.from("creches").select("*");
      return data || [];
    }
  });

  const { data: students } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*");
      return data || [];
    }
  });

  // Calculate enrollment stats by province
  const enrollmentByProvince = creches?.reduce((acc: any[], creche) => {
    const provinceStats = acc.find(p => p.province === creche.province);
    if (provinceStats) {
      provinceStats.creches += 1;
      provinceStats.students += students?.filter(s => s.creche_id === creche.id).length || 0;
    } else {
      acc.push({
        province: creche.province || 'Unknown',
        creches: 1,
        students: students?.filter(s => s.creche_id === creche.id).length || 0
      });
    }
    return acc;
  }, []) || [];

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

          <EnrollmentStats data={enrollmentByProvince} />
        </div>
      </main>
    </div>
  );
};

export default Index;
