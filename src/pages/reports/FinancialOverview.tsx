import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
} from "recharts";

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

      // Process data for charts using total_amount field
      const monthlyRevenue = invoices?.reduce((acc: any[], invoice) => {
        const month = new Date(invoice.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        
        const existing = acc.find(item => item.month === month);
        if (existing) {
          existing.revenue += invoice.total_amount;
        } else {
          acc.push({
            month,
            revenue: invoice.total_amount,
          });
        }
        return acc;
      }, []) || [];

      // Revenue by creche using total_amount field
      const revenueByCreche = invoices?.reduce((acc: any[], invoice) => {
        const crecheName = invoice.creche?.name || 'Unknown';
        
        const existing = acc.find(item => item.name === crecheName);
        if (existing) {
          existing.value += invoice.total_amount;
        } else {
          acc.push({
            name: crecheName,
            value: invoice.total_amount,
          });
        }
        return acc;
      }, []) || [];

      const totalRevenue = invoices?.reduce((sum, invoice) => sum + invoice.total_amount, 0) || 0;
      const totalInvoices = invoices?.length || 0;
      const averageInvoiceAmount = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

      return {
        monthlyRevenue,
        revenueByCreche,
        totalRevenue,
        totalInvoices,
        averageInvoiceAmount,
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
        <h1 className="text-2xl font-bold">Financial Overview</h1>
        <DateRangePicker
          date={{
            from: dateRange.from,
            to: dateRange.to,
          }}
          onDateChange={handleDateRangeChange}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{financialData?.totalRevenue?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialData?.totalInvoices || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{financialData?.averageInvoiceAmount?.toFixed(2) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData?.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`R${value.toLocaleString()}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
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
      </div>
    </div>
  );
};

export default FinancialOverview;
