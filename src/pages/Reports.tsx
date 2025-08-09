
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer 
} from 'recharts';
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Users, School, MapPin, AlertCircle } from "lucide-react";

const Reports = () => {
  // Fetch all necessary data
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

  const { data: applications } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("*");
      return data || [];
    }
  });

  const { data: invoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data } = await supabase.from("invoices").select("*");
      return data || [];
    }
  });

  // Calculate metrics
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF99E6'];

  // 1. Plan Distribution
  const planDistribution = creches?.reduce((acc, creche) => {
    const plan = creche.plan || 'free';
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const planData = Object.entries(planDistribution || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  // 2. Monthly Revenue
  const monthlyRevenue = invoices?.reduce((acc, invoice) => {
    const month = new Date(invoice.created_at).getMonth();
    const amount = Number(invoice.total_amount) || 0;
    acc[month] = (acc[month] || 0) + amount;
    return acc;
  }, {} as Record<number, number>);

  const monthlyRevenueData = Array.from({ length: 12 }, (_, i) => ({
    name: new Date(2024, i).toLocaleString('default', { month: 'short' }),
    revenue: monthlyRevenue?.[i] || 0
  }));

  // 3. Registration Status
  const registeredCreches = creches?.filter(c => c.registered).length || 0;
  const totalCreches = creches?.length || 0;
  const pendingCreches = totalCreches - registeredCreches;

  // 4. Application Status Distribution
  const applicationStatus = applications?.reduce((acc, app) => {
    const status = app.application_status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const applicationStatusData = Object.entries(applicationStatus || {}).map(([name, value]) => ({
    name,
    value
  }));

  // 5. Provincial Coverage
  const provincialCoverage = creches?.reduce((acc, creche) => {
    const province = creche.province || 'Unknown';
    const existing = acc.find(p => p.province === province);
    
    if (existing) {
      existing.creches += 1;
      existing.students += students?.filter(s => s.creche_id === creche.id).length || 0;
    } else {
      acc.push({
        province,
        creches: 1,
        students: students?.filter(s => s.creche_id === creche.id).length || 0
      });
    }
    return acc;
  }, [] as any[]) || [];

  // 6. System health metrics
  const totalCapacity = creches?.reduce((sum, c) => sum + (c.capacity || 0), 0) || 0;
  const utilizationRate = totalCapacity > 0 ? (students?.length || 0) / totalCapacity * 100 : 0;
  const totalRevenue = invoices?.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0) || 0;

  return (
    <div className="p-8 pt-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Reports Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive system analytics and insights</p>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Creches</p>
                <p className="text-3xl font-bold">{totalCreches}</p>
              </div>
              <School className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {registeredCreches} registered, {pendingCreches} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold">{students?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">
                {utilizationRate.toFixed(1)}% utilization
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <p className="text-3xl font-bold">{applications?.length || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {applicationStatus?.['New'] || 0} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">R{totalRevenue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">15% vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />
      
      {/* Charts */}
      <div className="space-y-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`R${value.toLocaleString()}`, 'Revenue']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution & Provincial Coverage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {planData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Provincial Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={provincialCoverage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="province" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="creches" fill="#8884d8" name="Creches" />
                  <Bar dataKey="students" fill="#82ca9d" name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Application Status */}
        <Card>
          <CardHeader>
            <CardTitle>Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={applicationStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
