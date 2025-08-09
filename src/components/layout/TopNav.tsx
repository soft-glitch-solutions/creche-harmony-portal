import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useState, useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog"; // Dialog component import

const settingItems = [
  { title: "General Settings", url: "/settings" },
  { title: "User Management", url: "/settings/users" },
  { title: "Roles & Permissions", url: "/settings/roles" },
  { title: "System Configuration", url: "/settings/system" },
  { title: "Notifications", url: "/settings/notifications" },
  { title: "Billing & Subscriptions", url: "/settings/billing" },
];

const reportItems = [
  { title: "Creche Performance Report", url: "/reports/creche-performance" },
  { title: "Daycare Center Utilization", url: "/reports/daycare-utilization" },
  { title: "Enrollment Statistics", url: "/reports/enrollment-statistics" },
  { title: "Staffing & Operations", url: "/reports/staffing-operations" },
  { title: "Financial Overview", url: "/reports/financial-overview" },
];

const menuItems = [
  { label: "Dashboard", path: "/", icon: "/assets/icon/home.png", bgColor: "#F684A3" },
  { label: "Creches", path: "/creches", icon: "/assets/icon/block.png", bgColor: "#84A7F6" },
  { label: "Support", path: "/support", icon: "/assets/icon/help.png", bgColor: "#9CDBC8" },
];

export function TopNav() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const availableRoles = ['Admin', 'Manager', 'Staff', 'Viewer'];

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*, roles(role_name), profile_picture_url')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }
    };
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "Successfully signed out."
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleRoleChange = async () => {
    if (userProfile) {
      try {
        // Update the user's role in a separate user_roles table or similar
        // For now, we'll just show a success message
        toast({
          title: 'Success',
          description: `Role would be changed to ${selectedRole}`,
        });
        setOpenRoleDialog(false);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to change role',
        });
      }
    }
  };

  return (
    <nav className="bg-background border-b border-border fixed w-full z-30 top-0">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary">CrecheAdmin</Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Main Navigation Menu Items */}
            <div className="flex items-center space-x-4">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className="flex items-center space-x-2 text-foreground hover:text-primary px-4 py-2"
                >
                  <div
                    className="h-8 w-8 flex items-center justify-center rounded-md"
                    style={{ backgroundColor: item.bgColor }}
                  >
                    <div
                      className="h-6 w-6 bg-cover bg-center"
                      style={{ backgroundImage: `url(${item.icon})` }}
                    />
                  </div>
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Reports Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 flex items-center justify-center rounded-md"
                      style={{ backgroundColor: "#F6A85C" }}
                    >
                      <div
                        className="h-6 w-6 bg-cover bg-center"
                        style={{ backgroundImage: `url(/assets/icon/report.png)` }}
                      />
                    </div>
                    <span>Reports</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 mt-2  shadow-lg rounded-md">
                  <DropdownMenuLabel>Reports</DropdownMenuLabel>
                  {reportItems.map((item) => (
                    <DropdownMenuItem key={item.title}>
                      <Link
                        to={item.url}
                        className="block p-2 text-sm text-foreground hover:bg-accent rounded-md"
                      >
                        {item.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Settings Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 flex items-center justify-center rounded-md"
                      style={{ backgroundColor: "#F7CD85" }}
                    >
                      <div
                        className="h-6 w-6 bg-cover bg-center"
                        style={{ backgroundImage: `url(/assets/icon/settings.png)` }}
                      />
                    </div>
                    <span>Settings</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 mt-2 shadow-lg rounded-md">
                  <DropdownMenuLabel>Settings</DropdownMenuLabel>
                  {settingItems.map((item) => (
                    <DropdownMenuItem key={item.title}>
                      <Link
                        to={item.url}
                        className="block p-2 text-sm text-foreground hover:bg-accent rounded-md"
                      >
                        {item.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="mr-2"
            >
              <img
                src={theme === 'dark' ? "/assets/icon/sun.png" : "/assets/icon/moon.png"}
                alt="Theme Icon"
                className="h-4 w-4"
              />
            </Button>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  {/* Profile Image */}
                  <img
                    src={userProfile?.profile_picture_url || '/assets/icon/user-placeholder.png'}
                    alt="User Icon"
                    className="h-5 w-5 rounded-full"
                  />
                  <span>{userProfile?.first_name || 'User'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem disabled>
                  Role: {userProfile?.roles?.role_name || 'Loading...'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpenRoleDialog(true)}>
                  <Button variant="outline" size="sm">Switch Role</Button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <img src="/images/icons/logout.png" alt="Logout Icon" className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Role Dialog */}
      <Dialog open={openRoleDialog} onOpenChange={setOpenRoleDialog}>
        <DialogContent>
          <DialogHeader>Change User Role</DialogHeader>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2"
          >
            <option value="">Select a role</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenRoleDialog(false)}>Cancel</Button>
            <Button onClick={handleRoleChange}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
