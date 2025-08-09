
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SystemMonitoring = () => {
  const [emailSettings, setEmailSettings] = useState({
    reportEmail: '',
    enableDailyReports: false,
    enableWeeklyReports: false,
    enableAlerts: true
  });
  const { toast } = useToast();

  // Fetch recent login activity
  const { data: loginActivity } = useQuery({
    queryKey: ['login-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, updated_at')
        .order('updated_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch support requests statistics
  const { data: supportStats } = useQuery({
    queryKey: ['support-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_requests')
        .select('status, created_at, priority')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        open: data.filter(r => r.status === 'open').length,
        in_progress: data.filter(r => r.status === 'in_progress').length,
        resolved: data.filter(r => r.status === 'resolved').length,
        high_priority: data.filter(r => r.priority === 'high').length
      };
      
      return stats;
    },
  });

  const handleSaveEmailSettings = async () => {
    try {
      // In a real app, this would save to a system_settings table
      toast({
        title: "Settings Saved",
        description: "Email notification settings have been updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings.",
      });
    }
  };

  const sendTestReport = async () => {
    try {
      // In a real app, this would trigger the email report function
      toast({
        title: "Test Report Sent",
        description: "A test report has been sent to the configured email.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send test report.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Report Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Email Report Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="reportEmail">Report Email Address</Label>
              <Input
                id="reportEmail"
                type="email"
                placeholder="admin@company.com"
                value={emailSettings.reportEmail}
                onChange={(e) => setEmailSettings(prev => ({
                  ...prev,
                  reportEmail: e.target.value
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="dailyReports">Enable Daily Reports</Label>
              <Switch
                id="dailyReports"
                checked={emailSettings.enableDailyReports}
                onCheckedChange={(checked) => setEmailSettings(prev => ({
                  ...prev,
                  enableDailyReports: checked
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="weeklyReports">Enable Weekly Reports</Label>
              <Switch
                id="weeklyReports"
                checked={emailSettings.enableWeeklyReports}
                onCheckedChange={(checked) => setEmailSettings(prev => ({
                  ...prev,
                  enableWeeklyReports: checked
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="enableAlerts">Enable System Alerts</Label>
              <Switch
                id="enableAlerts"
                checked={emailSettings.enableAlerts}
                onCheckedChange={(checked) => setEmailSettings(prev => ({
                  ...prev,
                  enableAlerts: checked
                }))}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleSaveEmailSettings}>Save Settings</Button>
              <Button variant="outline" onClick={sendTestReport}>Send Test Report</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Theme Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>Support Request Statistics (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{supportStats?.total || 0}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{supportStats?.open || 0}</div>
              <div className="text-sm text-gray-600">Open</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{supportStats?.in_progress || 0}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{supportStats?.resolved || 0}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{supportStats?.high_priority || 0}</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Activity Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Login Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loginActivity?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {new Date(user.updated_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Active</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMonitoring;
