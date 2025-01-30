import { Home, PieChart, Users, Settings, Map, FileText, Tool } from "lucide-react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const reportItems = [
  { title: "Overview Reports", url: "/reports" },
  { title: "Performance Reports", url: "/reports/performance" },
  { title: "Financial Reports", url: "/reports/financial" },
];

const settingItems = [
  { title: "General Settings", url: "/settings" },
  { title: "User Management", url: "/settings/users" },
  { title: "Notifications", url: "/settings/notifications" },
];

export function TopNav() {
  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary-800">CrecheAdmin</h1>
          </div>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-primary-800 px-4 py-2">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="flex items-center space-x-2 text-gray-600">
                  <PieChart className="h-4 w-4" />
                  <span>Reports</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-48 gap-1 p-2">
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
                <Link to="/creches" className="flex items-center space-x-2 text-gray-600 hover:text-primary-800 px-4 py-2">
                  <Users className="h-4 w-4" />
                  <span>Creches</span>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/statmaps" className="flex items-center space-x-2 text-gray-600 hover:text-primary-800 px-4 py-2">
                  <Map className="h-4 w-4" />
                  <span>StatMaps</span>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="flex items-center space-x-2 text-gray-600">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-48 gap-1 p-2">
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
        </div>
      </div>
    </nav>
  );
}