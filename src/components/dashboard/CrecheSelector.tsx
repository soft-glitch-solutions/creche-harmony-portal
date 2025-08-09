
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { School, Users, TrendingUp, AlertCircle } from "lucide-react";

interface CrecheSelectorProps {
  onCrecheSelect: (crecheId: string | null) => void;
  selectedCreche: string | null;
}

export const CrecheSelector = ({ onCrecheSelect, selectedCreche }: CrecheSelectorProps) => {
  const { data: creches } = useQuery({
    queryKey: ["creches-selector"],
    queryFn: async () => {
      const { data } = await supabase.from("creches").select("*");
      return data || [];
    }
  });

  const { data: crecheDetails } = useQuery({
    queryKey: ["creche-details", selectedCreche],
    queryFn: async () => {
      if (!selectedCreche) return null;

      const [studentsResult, applicationsResult, invoicesResult] = await Promise.all([
        supabase.from("students").select("*").eq("creche_id", selectedCreche),
        supabase.from("applications").select("*").eq("creche_id", selectedCreche),
        supabase.from("invoices").select("*").eq("creche_id", selectedCreche)
      ]);

      const students = studentsResult.data || [];
      const applications = applicationsResult.data || [];
      const invoices = invoicesResult.data || [];

      return {
        students,
        applications,
        invoices,
        totalRevenue: invoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0),
        pendingApplications: applications.filter(app => app.application_status === 'New').length
      };
    },
    enabled: !!selectedCreche
  });

  const selectedCrecheData = creches?.find(c => c.id === selectedCreche);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Select value={selectedCreche || "all"} onValueChange={(value) => onCrecheSelect(value === "all" ? null : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a creche to view details" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Creches</SelectItem>
              {creches?.map((creche) => (
                <SelectItem key={creche.id} value={creche.id}>
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4" />
                    {creche.name}
                    <Badge variant={creche.registered ? "default" : "secondary"}>
                      {creche.registered ? "Registered" : "Pending"}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCreche && selectedCrecheData && crecheDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{crecheDetails.students.length}</div>
              <p className="text-xs text-muted-foreground">
                of {selectedCrecheData.capacity || 0} capacity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{crecheDetails.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total invoiced</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{crecheDetails.applications.length}</div>
              <p className="text-xs text-muted-foreground">
                {crecheDetails.pendingApplications} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilization</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedCrecheData.capacity ? 
                  Math.round((crecheDetails.students.length / selectedCrecheData.capacity) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Capacity used</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
