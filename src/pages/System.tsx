import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const System = () => {
  return (
    <div className="p-8 pt-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h1>
      
      <Tabs defaultValue="user-management" className="space-y-6">
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
              <p className="text-gray-600">System logs functionality coming soon...</p>
              {/* Placeholder for log display */}
              <div className="border p-4 rounded-lg bg-gray-50 mt-4">
                <h3 className="font-semibold">Recent Activity Logs</h3>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-600">User "JohnDoe" logged in at 10:15 AM</li>
                  <li className="text-sm text-gray-600">System update applied at 09:30 AM</li>
                  <li className="text-sm text-gray-600">Admin "AdminUser" changed settings at 09:00 AM</li>
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
