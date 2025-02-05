import { Link, useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
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

const settingItems = [
  { title: "General Settings", url: "/settings" },
  { title: "User Management", url: "/settings/users" },
  { title: "Roles & Permissions", url: "/settings/roles" },
  { title: "System Configuration", url: "/settings/system" },
  { title: "Notifications", url: "/settings/notifications" },
  { title: "Billing & Subscriptions", url: "/settings/billing" },
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

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*, roles(role_name)')
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

  return (
    <nav className="bg-background border-b border-border fixed w-full z-30 top-0">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary">CrecheAdmin</Link>
          </div>
          
          <div className="flex items-center gap-4">
            <NavigationMenu>
              <NavigationMenuList>
                {menuItems.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    <Link to={item.path} className="flex items-center space-x-2 text-foreground hover:text-primary px-4 py-2">
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
                  </NavigationMenuItem>
                ))}

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-accent text-foreground">
                    <div className="flex items-center space-x-2">
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
                    </div>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-48 gap-1 p-2 bg-popover">
                      {settingItems.map((item) => (
                        <li key={item.title}>
                          <Link
                            to={item.url}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{item.title}</div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <img
                    src="/images/icons/user.png"
                    alt="User Icon"
                    className="h-5 w-5"
                  />
                  <span>{userProfile?.first_name || 'User'}</span>
                  <img
                    src="/images/icons/chevron-down.png"
                    alt="Expand Icon"
                    className="h-4 w-4"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem disabled>
                  Role: {userProfile?.roles?.role_name || 'Loading...'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <img src="/images/icons/logout.png" alt="Logout Icon" className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
