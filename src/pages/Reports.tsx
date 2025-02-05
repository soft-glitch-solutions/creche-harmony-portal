
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Reports = () => {
  const { data: creches } = useQuery({
    queryKey: ["creches"],
    queryFn: async () => {
      const { data } = await supabase.from("creches").select("*");
      return data || [];
    }
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const planDistribution = creches?.reduce((acc, creche) => {
    acc[creche.plan] = (acc[creche.plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const planData = Object.entries(planDistribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  const monthlyData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
  ];

  const registeredCreches = creches?.filter(c => c.registered).length || 0;
  const totalCreches = creches?.length || 0;

  return (
    <div className="p-8 pt-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
          <LineChart width={500} height={300} data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          </LineChart>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Plan Distribution</h2>
          <PieChart width={400} height={300}>
            <Pie
              data={planData}
              cx={200}
              cy={150}
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
        </Card>
      </div>

      <div className="mt-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Registration Status</h2>
          <BarChart width={1000} height={300} data={[
            { name: 'Registered', value: registeredCreches },
            { name: 'Unregistered', value: totalCreches - registeredCreches }
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
