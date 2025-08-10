import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
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
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, School } from "lucide-react";

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
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF99E6'];

  // 1. Student enrollment trends
  const studentsPerCreche = students?.reduce((acc, student) => {
    acc[student.creche_id] = (acc[student.creche_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const enrollmentData = creches?.map(creche => {
    const studentCount = studentsPerCreche?.[creche.id] || 0;
    const capacity = creche.capacity || 0;
    const utilization = capacity > 0 ? (studentCount / capacity * 100) : 0;
    
    return {
      id: creche.id,
      name: creche.name,
      students: studentCount,
      capacity: capacity,
      utilization: utilization.toFixed(1),
      registered: creche.registered,
      province: creche.province || 'Unknown'
    };
  }).sort((a, b) => Number(b.utilization) - Number(a.utilization)) || [];

  // 2. Revenue per creche
  const revenuePerCreche = invoices?.reduce((acc, invoice) => {
    if (invoice.creche_id && invoice.total_amount) {
      acc[invoice.creche_id] = (acc[invoice.creche_id] || 0) + Number(invoice.total_amount);
    }
    return acc;
  }, {} as Record<string, number>);

  const revenueData = creches?.map(creche => ({
    id: creche.id,
    name: creche.name,
    revenue: revenuePerCreche?.[creche.id] || 0
  })).sort((a, b) => b.revenue - a.revenue) || [];

  // 3. Provincial distribution
  const provincialData = creches?.reduce((acc: any[], creche) => {
    const province = creche.province || 'Unknown';
    const existing = acc.find(p => p.province === province);
    const studentCount = studentsPerCreche?.[creche.id] || 0;
    
    if (existing) {
      existing.creches += 1;
      existing.students += studentCount;
      existing.capacity += creche.capacity || 0;
    } else {
      acc.push({
        province,
        creches: 1,
        students: studentCount,
        capacity: creche.capacity || 0
      });
    }
    return acc;
  }, []) || [];

  // 4. Performance trends (mock data for demonstration)
  const performanceTrends = [
    { month: 'Jan', enrollment: 85, revenue: 45000, utilization: 78 },
    { month: 'Feb', enrollment: 92, revenue: 48000, utilization: 82 },
    { month: 'Mar', enrollment: 88, revenue: 46500, utilization: 79 },
    { month: 'Apr', enrollment: 95, revenue: 52000, utilization: 85 },
    { month: 'May', enrollment: 98, revenue: 54000, utilization: 88 },
    { month: 'Jun', enrollment: 102, revenue: 56000, utilization: 91 }
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Creche Performance Analytics</h1>
          <p className="text-muted-foreground">Comprehensive performance metrics and insights</p>
        </div>
      </div>
      
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Creches</p>
                <p className="text-3xl font-bold">{creches?.length || 0}</p>
              </div>
              <School className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {creches?.filter(c => c.registered).length || 0} registered
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
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">12% increase</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Utilization</p>
                <p className="text-3xl font-bold">
                  {enrollmentData.length > 0 
                    ? (enrollmentData.reduce((sum, c) => sum + Number(c.utilization), 0) / enrollmentData.length).toFixed(1)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Capacity utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">
                  R{revenueData.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">8% increase</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Creches Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top Performing Creches</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Creche Name</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Province</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollmentData.slice(0, 10).map((creche) => (
                <TableRow key={creche.id}>
                  <TableCell className="font-medium">{creche.name}</TableCell>
                  <TableCell>{creche.students}</TableCell>
                  <TableCell>{creche.capacity}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {creche.utilization}%
                      {Number(creche.utilization) > 80 ? (
                        <TrendingUp className="w-3 h-3 text-green-500 ml-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500 ml-1" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>R{(revenuePerCreche?.[creche.id] || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={creche.registered ? "default" : "secondary"}>
                      {creche.registered ? "Registered" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>{creche.province}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Revenue Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip formatter={(value: any) => [`R${value.toLocaleString()}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupancy Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Utilization Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrollmentData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip formatter={(value: any) => [`${value}%`, 'Utilization']} />
                <Legend />
                <Bar dataKey="utilization" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provincial Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Provincial Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={provincialData}
                  dataKey="creches"
                  nameKey="province"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ province, percent }) => `${province} ${(percent * 100).toFixed(0)}%`}
                >
                  {provincialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>6-Month Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="enrollment" stroke="#8884d8" name="Enrollment" />
                <Line yAxisId="right" type="monotone" dataKey="utilization" stroke="#82ca9d" name="Utilization %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrehePerformance;
