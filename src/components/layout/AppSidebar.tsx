
import {
  Home,
  School,
  Users,
  Settings,
  BarChart3,
  Map,
  HelpCircle,
  Bell,
  Shield,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Creches",
    url: "/creches",
    icon: School,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Reports",
    icon: BarChart3,
    items: [
      {
        title: "Overview",
        url: "/reports",
      },
      {
        title: "Financial Overview",
        url: "/reports/financial-overview",
      },
      {
        title: "Creche Performance",
        url: "/reports/creche-performance",
      },
    ],
  },
  {
    title: "Maps",
    url: "/stat-maps",
    icon: Map,
  },
  {
    title: "User Management",
    url: "/users",
    icon: Users,
  },
  {
    title: "Roles & Permissions",
    url: "/roles",
    icon: Shield,
  },
  {
    title: "Support",
    url: "/support",
    icon: HelpCircle,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold mb-4">
            <img src="/assets/logo.png" alt="Logo" className="w-8 h-8 inline mr-2" />
            CrecheSpots
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                if (item.items) {
                  return (
                    <Collapsible key={item.title} asChild defaultOpen>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip={item.title}>
                          <CollapsibleTrigger asChild>
                            <Link to="#" className="flex items-center">
                              <item.icon />
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </Link>
                          </CollapsibleTrigger>
                        </SidebarMenuButton>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton 
                                  asChild
                                  isActive={location.pathname === subItem.url}
                                >
                                  <Link to={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      tooltip={item.title}
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url!}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
