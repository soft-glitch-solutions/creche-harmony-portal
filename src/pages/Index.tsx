
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Users, School, Clock, AlertCircle, TrendingUp, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { data: creches } = useQuery({
    queryKey: ["creches"],
    queryFn: async () => {
      const { data } = await supabase.from("creches").select("*");
      return data || [];
    }
  });

  const { data: students } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data } = await supabase.from("students").select("*");
      return data || [];
    }
  });

  const { data: applications } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("*");
      return data || [];
    }
  });

  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('users')
        .select('first_name, last_name, roles:roles(role_name)')
        .eq('id', user.id)
        .single();
      
      return data;
    }
  });

  const registeredCreches = creches?.filter(c => c.registered).length || 0;
  const totalCreches = creches?.length || 0;
  const totalStudents = students?.length || 0;
  const pendingApplications = applications?.filter(a => a.application_status === 'New').length || 0;
  const monthlyRevenue = creches?.reduce((acc, creche) => acc + (creche.monthly_price || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="p-8 pt-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {userData?.first_name || 'User'}
            </h1>
            <p className="text-muted-foreground">{userData?.roles?.role_name || 'Loading...'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Creches"
            value={totalCreches}
            icon={<School className="h-5 w-5" />}
            trend={{ value: 12, isPositive: true }}
          />
          <MetricCard
            title="Active Students"
            value={totalStudents}
            icon={<Users className="h-5 w-5" />}
            trend={{ value: 8, isPositive: true }}
          />
          <MetricCard
            title="Pending Applications"
            value={pendingApplications}
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            title="Monthly Revenue"
            value={`R${monthlyRevenue}`}
            icon={<DollarSign className="h-5 w-5" />}
            trend={{ value: 15, isPositive: true }}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
