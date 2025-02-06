import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "./UserManagement";

const Settings = () => {
  return (
    <div className="p-8 pt-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <Tabs defaultValue="user-management" className="space-y-6">
        <TabsList>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
          <TabsTrigger value="roles-permissions">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default Settings;