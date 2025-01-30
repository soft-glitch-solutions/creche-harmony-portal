import { Home, PieChart, Users, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", icon: Home, url: "/" },
  { title: "Reports", icon: PieChart, url: "/reports" },
  { title: "Creches", icon: Users, url: "/creches" },
  { title: "Settings", icon: Settings, url: "/settings" },
];

export function TopNav() {
  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary-800">CrecheAdmin</h1>
          </div>
          <div className="flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                to={item.url}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-800"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}