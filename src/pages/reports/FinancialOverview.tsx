
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FinancialMetrics } from "@/components/reports/FinancialMetrics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FinancialOverview = () => {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });

  const { data: financialData, isLoading } = useQuery({
    queryKey: ["financial-overview", dateRange],
    queryFn: async () => {
      const { data: invoices, error } = await supabase
        .from("invoices")
        .select(`
          *,
          creche:creche_id(name)
        `)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Process data for charts
      const monthlyRevenue = invoices?.reduce((acc: any[], invoice) => {
        const month = new Date(invoice.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        
        const existing = acc.find(item => item.month === month);
        const amount = Number(invoice.total_amount) || 0;
        
        if (existing) {
          existing.revenue += amount;
          existing.invoices += 1;
        } else {
          acc.push({
            month,
            revenue: amount,
            invoices: 1,
          });
        }
        return acc;
      }, []) || [];

      // Revenue by creche
      const revenueByCreche = invoices?.reduce((acc: any[], invoice) => {
        const crecheName = invoice.creche?.name || 'Unknown';
        const amount = Number(invoice.total_amount) || 0;
        
        const existing = acc.find(item => item.name === crecheName);
        if (existing) {
          existing.value += amount;
        } else {
          acc.push({
            name: crecheName,
            value: amount,
          });
        }
        return acc;
      }, []) || [];

      // Payment status distribution
      const paymentStatus = invoices?.reduce((acc: any[], invoice) => {
        const status = invoice.status || 'draft';
        const existing = acc.find(item => item.name === status);
        
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({
            name: status,
            value: 1,
          });
        }
        return acc;
      }, []) || [];

      const totalRevenue = invoices?.reduce((sum, invoice) => sum + (Number(invoice.total_amount) || 0), 0) || 0;
      const totalInvoices = invoices?.length || 0;
      const averageInvoiceAmount = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
      const paidInvoices = invoices?.filter(inv => inv.status === 'paid').length || 0;
      const paymentRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

      return {
        monthlyRevenue,
        revenueByCreche,
        paymentStatus,
        totalRevenue,
        totalInvoices,
        averageInvoiceAmount,
        paymentRate,
      };
    },
  });

  const handleDateRangeChange = (date: DateRange | undefined) => {
    if (date?.from && date?.to) {
      setDateRange({ from: date.from, to: date.to });
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 px-8">
        <h1 className="text-2xl font-bold mb-8">Financial Overview</h1>
        <div className="animate-pulse">Loading financial data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Financial Overview</h1>
          <p className="text-muted-foreground">Comprehensive financial reporting and analytics</p>
        </div>
        <DateRangePicker
          date={{
            from: dateRange.from,
            to: dateRange.to,
          }}
          onDateChange={handleDateRangeChange}
        />
      </div>

      {/* Financial Metrics */}
      <FinancialMetrics
        totalRevenue={financialData?.totalRevenue || 0}
        totalInvoices={financialData?.totalInvoices || 0}
        averageInvoice={financialData?.averageInvoiceAmount || 0}
        monthlyGrowth={15} // This would be calculated from previous period
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Monthly Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={financialData?.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any, name) => [
                  name === 'revenue' ? `R${value.toLocaleString()}` : value, 
                  name === 'revenue' ? 'Revenue' : 'Invoices'
                ]} />
                <Legend />
                <Bar dataKey="invoices" fill="#82ca9d" name="Invoices" />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Creche */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Creche</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={financialData?.revenueByCreche || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(financialData?.revenueByCreche || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`R${value.toLocaleString()}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData?.paymentStatus || []}>
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

        {/* Payment Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Performance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {financialData?.paymentRate?.toFixed(1) || 0}%
              </div>
              <p className="text-muted-foreground">Payment Success Rate</p>
              <p className="text-sm text-muted-foreground mt-2">
                {financialData?.totalInvoices || 0} total invoices processed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialOverview;
