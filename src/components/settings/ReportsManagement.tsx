
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const ReportsManagement = () => {
  const { toast } = useToast();

  // Fetch report statistics
  const { data: reportStats } = useQuery({
    queryKey: ['report-statistics'],
    queryFn: async () => {
      const [crechesResult, studentsResult, invoicesResult, applicationsResult] = await Promise.all([
        supabase.from('creches').select('id, name, plan').order('created_at'),
        supabase.from('students').select('id, creche_id').order('created_at'),
        supabase.from('invoices').select('id, total_amount, status, creche_id').order('created_at'),
        supabase.from('applications').select('id, application_status, creche_id').order('created_at')
      ]);

      return {
        creches: crechesResult.data || [],
        students: studentsResult.data || [],
        invoices: invoicesResult.data || [],
        applications: applicationsResult.data || []
      };
    },
  });

  const generateReport = async (reportType: string) => {
    try {
      toast({
        title: "Generating Report",
        description: `${reportType} report is being generated...`,
      });
      
      // In a real app, this would trigger report generation
      setTimeout(() => {
        toast({
          title: "Report Generated",
          description: `${reportType} report has been generated successfully.`,
        });
      }, 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report.",
      });
    }
  };

  const emailReport = async (reportType: string) => {
    try {
      toast({
        title: "Sending Report",
        description: `${reportType} report is being emailed...`,
      });
      
      // In a real app, this would trigger email sending
      setTimeout(() => {
        toast({
          title: "Report Emailed",
          description: `${reportType} report has been sent to your email.`,
        });
      }, 1500);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to email report.",
      });
    }
  };

  const reportTypes = [
    {
      name: "Financial Overview",
      description: "Revenue, invoices, and payment statistics",
      route: "/reports/financial-overview",
      icon: FileText,
      color: "bg-blue-500"
    },
    {
      name: "Creche Performance",
      description: "Enrollment, capacity, and utilization metrics",
      route: "/reports/creche-performance", 
      icon: FileText,
      color: "bg-green-500"
    },
    {
      name: "General Dashboard",
      description: "Overall system statistics and trends",
      route: "/reports",
      icon: FileText,
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Report Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Creches</p>
                <p className="text-2xl font-bold">{reportStats?.creches?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Students</p>
                <p className="text-2xl font-bold">{reportStats?.students?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Invoices</p>
                <p className="text-2xl font-bold">{reportStats?.invoices?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Applications</p>
                <p className="text-2xl font-bold">{reportStats?.applications?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {reportTypes.map((report) => (
              <div key={report.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${report.color} rounded-lg flex items-center justify-center`}>
                    <report.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{report.name}</h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={report.route}>
                      <FileText className="w-4 h-4 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generateReport(report.name)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => emailReport(report.name)}
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Report Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-16"
              onClick={() => generateReport("Daily Summary")}
            >
              <FileText className="w-5 h-5 mr-2" />
              Generate Daily Summary
            </Button>
            <Button 
              variant="outline"
              className="h-16"
              onClick={() => generateReport("Weekly Report")}
            >
              <Download className="w-5 h-5 mr-2" />
              Weekly Report Export
            </Button>
            <Button 
              variant="outline"
              className="h-16"
              onClick={() => emailReport("Monthly Report")}
            >
              <Mail className="w-5 h-5 mr-2" />
              Email Monthly Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsManagement;
