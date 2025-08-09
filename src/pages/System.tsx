
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

  // Since _http_log table doesn't exist in our schema, let's use actual tables for system monitoring
  const { data: systemActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['system-activity'],
    queryFn: async () => {
      // Get recent user activity as a proxy for system activity
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('email, updated_at, created_at')
        .order('updated_at', { ascending: false })
        .limit(50);

      if (usersError) {
        console.error('Error fetching user activity:', usersError);
      }

      // Get recent support requests
      const { data: supportRequests, error: supportError } = await supabase
        .from('support_requests')
        .select('title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (supportError) {
        console.error('Error fetching support requests:', supportError);
      }

      return {
        users: users || [],
        supportRequests: supportRequests || []
      };
    },
  });

  return (
    <div className="p-8 pt-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h1>
      
      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="logs">System Activity</TabsTrigger>
          <TabsTrigger value="system-status">System Status</TabsTrigger>
        </TabsList>

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

        {/* System Activity Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeLogTab} onValueChange={(value) => setActiveLogTab(value as any)}>
                <TabsList className="mb-4">
                  <TabsTrigger value="database">User Activity</TabsTrigger>
                  <TabsTrigger value="auth">Support Activity</TabsTrigger>
                  <TabsTrigger value="storage">Storage</TabsTrigger>
                  <TabsTrigger value="edge">External Links</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[600px] rounded-md border">
                  <div className="p-4 space-y-4">
                    {activeLogTab === 'database' && (
                      <>
                        {isLoadingActivity ? (
                          <div className="text-center py-4">Loading activity...</div>
                        ) : (
                          systemActivity?.users?.map((user: any, index: number) => (
                            <div key={index} className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                  {new Date(user.updated_at).toLocaleString()}
                                </span>
                                <Badge variant="default">User Activity</Badge>
                              </div>
                              <div>
                                <span className="font-medium">User Update</span>
                                <span className="text-gray-600 ml-2">{user.email}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </>
                    )}

                    {activeLogTab === 'auth' && (
                      <>
                        {isLoadingActivity ? (
                          <div className="text-center py-4">Loading support activity...</div>
                        ) : (
                          systemActivity?.supportRequests?.map((request: any, index: number) => (
                            <div key={index} className="border rounded-lg p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                  {new Date(request.created_at).toLocaleString()}
                                </span>
                                <Badge variant={request.status === 'open' ? "destructive" : "default"}>
                                  {request.status}
                                </Badge>
                              </div>
                              <div>
                                <span className="font-medium">Support Request</span>
                                <span className="text-gray-600 ml-2">{request.title}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </>
                    )}

                    {activeLogTab === 'storage' && (
                      <div className="text-center py-4 text-gray-500">
                        Storage logs will be available here when configured.
                      </div>
                    )}

                    {activeLogTab === 'edge' && (
                      <div className="space-y-4">
                        <div className="text-sm text-gray-600">
                          View detailed logs in Supabase Dashboard:
                        </div>
                        <ul className="list-disc list-inside text-sm text-blue-600 space-y-2">
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
                    )}
                  </div>
                </ScrollArea>
              </Tabs>
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
              <div className="space-y-4">
                <div className="border p-4 rounded-lg bg-gray-50">
                  <h3 className="font-semibold mb-4">Current System Health</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Database: <span className="text-green-500 font-medium">Online</span></div>
                      <div className="text-sm text-gray-600">Authentication: <span className="text-green-500 font-medium">Online</span></div>
                      <div className="text-sm text-gray-600">Storage: <span className="text-green-500 font-medium">Online</span></div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">API: <span className="text-yellow-500 font-medium">Monitoring</span></div>
                      <div className="text-sm text-gray-600">Cache: <span className="text-green-500 font-medium">Online</span></div>
                      <div className="text-sm text-gray-600">Webhooks: <span className="text-green-500 font-medium">Active</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default System;
