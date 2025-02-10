
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer 
} from 'recharts';
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CrehePerformance = () => {
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

  const { data: invoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data } = await supabase.from("invoices").select("*");
      return data || [];
    }
  });

  // Calculate performance metrics
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // 1. Student enrollment trends
  const studentsPerCreche = students?.reduce((acc, student) => {
    acc[student.creche_id] = (acc[student.creche_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const enrollmentData = creches?.map(creche => ({
    name: creche.name,
    students: studentsPerCreche?.[creche.id] || 0,
    capacity: creche.capacity || 0,
    utilization: ((studentsPerCreche?.[creche.id] || 0) / (creche.capacity || 1) * 100).toFixed(1)
  })) || [];

  // 2. Revenue per creche
  const revenuePerCreche = invoices?.reduce((acc, invoice) => {
    if (invoice.creche_id && invoice.total_amount) {
      acc[invoice.creche_id] = (acc[invoice.creche_id] || 0) + Number(invoice.total_amount);
    }
    return acc;
  }, {} as Record<string, number>);

  const revenueData = creches?.map(creche => ({
    name: creche.name,
    revenue: revenuePerCreche?.[creche.id] || 0
  })).sort((a, b) => b.revenue - a.revenue) || [];

  // 3. Occupancy rates
  const occupancyData = creches?.map(creche => ({
    name: creche.name,
    rate: ((studentsPerCreche?.[creche.id] || 0) / (creche.capacity || 1) * 100).toFixed(1)
  })).sort((a, b) => Number(b.rate) - Number(a.rate)) || [];

  return (
    <div className="p-8 pt-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Creche Performance Report</h1>
      
      {/* Top Performing Creches Table */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Top Performing Creches</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creche Name</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollmentData.map((creche) => (
                <TableRow key={creche.name}>
                  <TableCell className="font-medium">{creche.name}</TableCell>
                  <TableCell>{creche.students}</TableCell>
                  <TableCell>{creche.capacity}</TableCell>
                  <TableCell>{creche.utilization}%</TableCell>
                  <TableCell>R{revenuePerCreche?.[creche.name]?.toFixed(2) || '0.00'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Separator className="my-6" />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue by Creche</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Occupancy Rate Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Occupancy Rates</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="rate" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Student Distribution Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Student Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={enrollmentData}
                dataKey="students"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {enrollmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Capacity Utilization Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Capacity Utilization</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="capacity" fill="#8884d8" name="Total Capacity" />
              <Bar dataKey="students" fill="#82ca9d" name="Current Students" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default CrehePerformance;
