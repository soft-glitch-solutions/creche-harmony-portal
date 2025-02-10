
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer 
} from 'recharts';
import { Separator } from "@/components/ui/separator";

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
    acc[creche.plan] = (acc[creche.plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const planData = Object.entries(planDistribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  // 2. Monthly Revenue
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = invoices?.reduce((acc, invoice) => {
    const month = new Date(invoice.created_at).getMonth();
    acc[month] = (acc[month] || 0) + Number(invoice.total_amount || 0);
    return acc;
  }, {} as Record<number, number>);

  const monthlyRevenueData = Array.from({ length: 12 }, (_, i) => ({
    name: new Date(2024, i).toLocaleString('default', { month: 'short' }),
    revenue: monthlyRevenue?.[i] || 0
  }));

  // 3. Registration Status
  const registeredCreches = creches?.filter(c => c.registered).length || 0;
  const totalCreches = creches?.length || 0;

  // 4. Application Status Distribution
  const applicationStatus = applications?.reduce((acc, app) => {
    acc[app.application_status] = (acc[app.application_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const applicationStatusData = Object.entries(applicationStatus || {}).map(([name, value]) => ({
    name,
    value
  }));

  // 5. Student Age Distribution
  const ageDistribution = students?.reduce((acc, student) => {
    const age = student.age || 0;
    const ageGroup = `${Math.floor(age/2)*2}-${Math.floor(age/2)*2+2}`;
    acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ageDistributionData = Object.entries(ageDistribution || {}).sort().map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="p-8 pt-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Creches</h3>
          <p className="text-2xl font-bold">{totalCreches}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Registered Creches</h3>
          <p className="text-2xl font-bold">{registeredCreches}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
          <p className="text-2xl font-bold">{students?.length || 0}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Applications</h3>
          <p className="text-2xl font-bold">{applications?.length || 0}</p>
        </Card>
      </div>

      <Separator className="my-6" />
      
      {/* Charts */}
      <div className="space-y-6">
        {/* Revenue Trend */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Plan Distribution & Application Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Plan Distribution</h2>
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
                >
                  {planData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Application Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={applicationStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {applicationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Student Age Distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Student Age Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
