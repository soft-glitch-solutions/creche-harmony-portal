
import { Home, PieChart, Users, Settings, LifeBuoy, LogOut, Moon, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

const reportItems = [
  { title: "Overview Reports", url: "/reports" },
  { title: "Performance Reports", url: "/reports/performance" },
  { title: "Financial Reports", url: "/reports/financial" },
];

const settingItems = [
  { title: "General Settings", url: "/settings" },
  { title: "User Management", url: "/settings/users" },
  { title: "Roles & Permissions", url: "/settings/roles" },
];

export function TopNav() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

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
                <NavigationMenuItem>
                  <Link to="/" className="flex items-center space-x-2 text-foreground hover:text-primary px-4 py-2">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-menu hover:bg-menu-hover text-white">
                    <div className="flex items-center space-x-2">
                      <PieChart className="h-4 w-4" />
                      <span>Reports</span>
                    </div>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-48 gap-1 p-2 bg-popover">
                      {reportItems.map((item) => (
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

                <NavigationMenuItem>
                  <Link to="/creches" className="flex items-center space-x-2 text-foreground hover:text-primary px-4 py-2">
                    <Users className="h-4 w-4" />
                    <span>Creches</span>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/support" className="flex items-center space-x-2 text-foreground hover:text-primary px-4 py-2">
                    <LifeBuoy className="h-4 w-4" />
                    <span>Support</span>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-menu hover:bg-menu-hover text-white">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
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
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
