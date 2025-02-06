import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface LogEntry {
  timestamp: string;
  event: string;
  details: string;
  type: 'info' | 'error' | 'warning';
}

const System = () => {
  const [activeLogTab, setActiveLogTab] = useState<'database' | 'auth' | 'storage' | 'edge'>('database');

  const { data: databaseLogs, isLoading: isLoadingDbLogs } = useQuery({
    queryKey: ['database-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('_http_log')
        .select('*')
        .order('request_time', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching database logs:', error);
        return [];
      }

      return data;
    },
  });

  return (
    <div className="p-8 pt-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h1>
      
      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
          <TabsTrigger value="roles-permissions">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="system-status">System Status</TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="user-management">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">User management functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles-permissions">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Admin</h3>
                  <p className="text-sm text-gray-600">Full system access including user management and configuration</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Manager</h3>
                  <p className="text-sm text-gray-600">Can manage creches and view reports</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">User</h3>
                  <p className="text-sm text-gray-600">Basic access to view creches and submit reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">General settings functionality coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeLogTab} onValueChange={(value) => setActiveLogTab(value as any)}>
                <TabsList className="mb-4">
                  <TabsTrigger value="database">Database</TabsTrigger>
                  <TabsTrigger value="auth">Authentication</TabsTrigger>
                  <TabsTrigger value="storage">Storage</TabsTrigger>
                  <TabsTrigger value="edge">Edge Functions</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[600px] rounded-md border">
                  <div className="p-4 space-y-4">
                    {isLoadingDbLogs ? (
                      <div className="text-center py-4">Loading logs...</div>
                    ) : (
                      databaseLogs?.map((log: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {new Date(log.request_time).toLocaleString()}
                            </span>
                            <Badge variant={log.status >= 400 ? "destructive" : "default"}>
                              {log.status}
                            </Badge>
                          </div>
                          <div>
                            <span className="font-medium">{log.method}</span>
                            <span className="text-gray-600 ml-2">{log.path}</span>
                          </div>
                          {log.error && (
                            <div className="text-red-500 text-sm mt-2">
                              Error: {log.error}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </Tabs>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Log Management</h3>
                <p className="text-sm text-gray-600">
                  View detailed logs in Supabase Dashboard:
                </p>
                <ul className="list-disc list-inside text-sm text-blue-600 mt-2">
                  <li>
                    <a 
                      href="https://supabase.com/dashboard/project/bqydopqekazcedqvpxzo/database/logs" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Database Logs
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://supabase.com/dashboard/project/bqydopqekazcedqvpxzo/auth/logs" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Auth Logs
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://supabase.com/dashboard/project/bqydopqekazcedqvpxzo/storage/logs" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Storage Logs
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://supabase.com/dashboard/project/bqydopqekazcedqvpxzo/functions" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Edge Functions Logs
                    </a>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Status Tab */}
        <TabsContent value="system-status">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">System status functionality coming soon...</p>
              {/* Placeholder for system health display */}
              <div className="border p-4 rounded-lg bg-gray-50 mt-4">
                <h3 className="font-semibold">Current System Health</h3>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-600">Database: <span className="text-green-500">Online</span></li>
                  <li className="text-sm text-gray-600">API: <span className="text-yellow-500">Degraded</span></li>
                  <li className="text-sm text-gray-600">Storage: <span className="text-green-500">Online</span></li>
                  <li className="text-sm text-gray-600">Cache: <span className="text-green-500">Online</span></li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default System;
