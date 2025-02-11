
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer 
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF99E6'];

const FinancialOverview = () => {
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [selectedCreche, setSelectedCreche] = useState<string>('all');

  const { data: creches } = useQuery({
    queryKey: ['creches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creches')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: invoices } = useQuery({
    queryKey: ['invoices', dateRange, selectedCreche],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          creches (
            name
          )
        `)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (selectedCreche !== 'all') {
        query = query.eq('creche_id', selectedCreche);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate financial metrics
  const totalRevenue = invoices?.reduce((sum, invoice) => sum + (Number(invoice.total_amount) || 0), 0) || 0;
  const averageInvoiceAmount = totalRevenue / (invoices?.length || 1);
  const paidInvoices = invoices?.filter(inv => inv.status === 'paid').length || 0;
  const pendingInvoices = invoices?.filter(inv => inv.status === 'pending').length || 0;

  // Revenue by creche
  const revenueByCreche = invoices?.reduce((acc, invoice) => {
    const crecheName = invoice.creches?.name || 'Unknown';
    acc[crecheName] = (acc[crecheName] || 0) + Number(invoice.total_amount || 0);
    return acc;
  }, {} as Record<string, number>);

  const revenueByChecheData = Object.entries(revenueByCreche || {}).map(([name, value]) => ({
    name,
    revenue: value
  }));

  // Monthly revenue trend
  const monthlyRevenue = invoices?.reduce((acc, invoice) => {
    const month = new Date(invoice.created_at).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + Number(invoice.total_amount || 0);
    return acc;
  }, {} as Record<string, number>);

  const monthlyRevenueData = Object.entries(monthlyRevenue || {}).map(([month, revenue]) => ({
    month,
    revenue
  }));

  // Invoice status distribution
  const invoiceStatusData = [
    { name: 'Paid', value: paidInvoices },
    { name: 'Pending', value: pendingInvoices },
  ];

  return (
    <div className="p-8 pt-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
        <div className="flex gap-4">
          <Select value={selectedCreche} onValueChange={setSelectedCreche}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select creche" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Creches</SelectItem>
              {creches?.map((creche) => (
                <SelectItem key={creche.id} value={creche.id}>
                  {creche.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold">R{totalRevenue.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Average Invoice Amount</h3>
          <p className="text-2xl font-bold">R{averageInvoiceAmount.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Paid Invoices</h3>
          <p className="text-2xl font-bold">{paidInvoices}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Pending Invoices</h3>
          <p className="text-2xl font-bold">{pendingInvoices}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue by Creche</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByChecheData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Invoice Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={invoiceStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {invoiceStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Invoices Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Invoices</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Creche</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices?.slice(0, 10).map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.id.slice(0, 8)}</TableCell>
                <TableCell>{invoice.creches?.name}</TableCell>
                <TableCell>R{Number(invoice.total_amount).toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status}
                  </span>
                </TableCell>
                <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default FinancialOverview;
