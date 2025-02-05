
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function RolesPermissions() {
  const { toast } = useToast();

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: permissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("permissions").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: rolePermissions } = useQuery({
    queryKey: ["role_permissions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("role_permissions").select("*");
      if (error) throw error;
      return data;
    },
  });

  const handlePermissionChange = async (roleId: string, permissionId: string, checked: boolean) => {
    try {
      if (checked) {
        const { error } = await supabase
          .from("role_permissions")
          .insert({ role_id: roleId, permission_id: permissionId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("role_permissions")
          .delete()
          .match({ role_id: roleId, permission_id: permissionId });
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Permission updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const hasPermission = (roleId: string, permissionId: string) => {
    return rolePermissions?.some(
      (rp) => rp.role_id === roleId && rp.permission_id === permissionId
    );
  };

  return (
    <div className="p-8 pt-20">
      <h1 className="text-2xl font-bold text-foreground mb-6">Roles & Permissions</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Role</th>
                  {permissions?.map((permission) => (
                    <th key={permission.id} className="text-center p-2">
                      {permission.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles?.map((role) => (
                  <tr key={role.id} className="border-t">
                    <td className="p-2">{role.role_name}</td>
                    {permissions?.map((permission) => (
                      <td key={permission.id} className="text-center p-2">
                        <Checkbox
                          checked={hasPermission(role.id, permission.id)}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(role.id, permission.id, checked as boolean)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
