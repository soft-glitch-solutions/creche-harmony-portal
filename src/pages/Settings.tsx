
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "./UserManagement";
import WebhookIntegration from "@/components/settings/WebhookIntegration";
import SystemMonitoring from "@/components/settings/SystemMonitoring";
import FeatureManagement from "@/components/settings/FeatureManagement";
import EventsNotifications from "@/components/settings/EventsNotifications";
import ReportsManagement from "@/components/settings/ReportsManagement";

const Settings = () => {
  return (
    <div className="p-8 pt-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <Tabs defaultValue="user-management" className="space-y-6">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="user-management">Users</TabsTrigger>
          <TabsTrigger value="roles-permissions">Roles</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="integrations">Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="user-management">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>

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

        <TabsContent value="monitoring">
          <SystemMonitoring />
        </TabsContent>

        <TabsContent value="features">
          <FeatureManagement />
        </TabsContent>

        <TabsContent value="events">
          <EventsNotifications />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsManagement />
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <WebhookIntegration />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
