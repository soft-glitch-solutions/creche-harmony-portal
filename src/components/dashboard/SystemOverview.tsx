
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, School, MapPin, TrendingUp, UserCheck, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SystemOverview = () => {
  const { data: systemStats } = useQuery({
    queryKey: ["system-overview"],
    queryFn: async () => {
      const [crechesResult, studentsResult, usersResult, applicationsResult] = await Promise.all([
        supabase.from("creches").select("*"),
        supabase.from("students").select("*"),
        supabase.from("users").select("*"),
        supabase.from("applications").select("*")
      ]);

      const creches = crechesResult.data || [];
      const students = studentsResult.data || [];
      const users = usersResult.data || [];
      const applications = applicationsResult.data || [];

      const provinces = [...new Set(creches.map(c => c.province).filter(Boolean))];
      const registeredCreches = creches.filter(c => c.registered).length;
      const pendingApplications = applications.filter(a => a.application_status === 'New').length;
      const totalCapacity = creches.reduce((sum, c) => sum + (c.capacity || 0), 0);
      const utilizationRate = totalCapacity > 0 ? (students.length / totalCapacity * 100) : 0;

      // Calculate active users based on recent activity (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const activeUsers = users.filter(u => 
        u.updated_at && new Date(u.updated_at) > new Date(thirtyDaysAgo)
      ).length;

      return {
        totalCreches: creches.length,
        registeredCreches,
        totalStudents: students.length,
        totalUsers: users.length,
        totalProvinces: provinces.length,
        pendingApplications,
        utilizationRate,
        totalCapacity,
        activeUsers
      };
    }
  });

  const stats = [
    {
      title: "Total Creches",
      value: systemStats?.totalCreches || 0,
      icon: School,
      description: `${systemStats?.registeredCreches || 0} registered`,
      color: "text-blue-600"
    },
    {
      title: "Total Students",
      value: systemStats?.totalStudents || 0,
      icon: Users,
      description: `${systemStats?.utilizationRate?.toFixed(1) || 0}% capacity used`,
      color: "text-green-600"
    },
    {
      title: "System Users",
      value: systemStats?.totalUsers || 0,
      icon: UserCheck,
      description: `${systemStats?.activeUsers || 0} active this month`,
      color: "text-purple-600"
    },
    {
      title: "Coverage Area",
      value: systemStats?.totalProvinces || 0,
      icon: MapPin,
      description: "Provinces covered",
      color: "text-orange-600"
    },
    {
      title: "Total Capacity",
      value: systemStats?.totalCapacity || 0,
      icon: TrendingUp,
      description: "Maximum enrollment",
      color: "text-teal-600"
    },
    {
      title: "Pending Applications",
      value: systemStats?.pendingApplications || 0,
      icon: AlertCircle,
      description: "Require attention",
      color: "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
