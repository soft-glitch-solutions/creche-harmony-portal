import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { toast } from "sonner";

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: users, error } = await supabase
        .from("users")
        .select(`
          *,
          roles:role_id(role_name),
          user_creche:user_creche(
            creche:creche_id(name)
          )
        `);

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      return users;
    },
  });

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const filteredUsers = users?.filter((user) =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset email sent successfully");
    } catch (error) {
      console.error("Error sending password reset:", error);
      toast.error("Failed to send password reset email");
    }
  };

  const handleUpdateRole = async (userId: string, roleId: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ role_id: roleId })
        .eq("id", userId);
      
      if (error) throw error;
      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading users...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center space-x-2">
        <Search className="w-5 h-5 text-gray-500" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Creche</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                {user.first_name} {user.last_name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <select
                  className="border rounded p-1"
                  value={user.role_id || ""}
                  onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                >
                  <option value="">Select role</option>
                  {roles?.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell>
                {user.user_creche?.map((uc: any) => (
                  <Badge key={uc.creche?.id} variant="secondary" className="mr-1">
                    {uc.creche?.name}
                  </Badge>
                ))}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendPasswordReset(user.email)}
                >
                  Reset Password
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagement;