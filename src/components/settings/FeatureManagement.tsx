
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FeatureSettings {
  creche_id: string;
  features: {
    event_calendar: boolean;
    staff_management: boolean;
    reports_analytics: boolean;
    financial_tracking: boolean;
    attendance_tracking: boolean;
    parent_communication: boolean;
    inventory_management: boolean;
    incident_reporting: boolean;
  };
}

const FeatureManagement = () => {
  const [selectedCreche, setSelectedCreche] = useState<string>('');
  const { toast } = useToast();

  const { data: creches } = useQuery({
    queryKey: ['creches-for-features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creches')
        .select('id, name, features');
      
      if (error) throw error;
      return data;
    },
  });

  const selectedCrecheData = creches?.find(c => c.id === selectedCreche);

  const handleFeatureToggle = async (feature: string, enabled: boolean) => {
    if (!selectedCreche) return;

    try {
      const currentFeatures = selectedCrecheData?.features || {};
      const updatedFeatures = {
        ...currentFeatures,
        [feature]: enabled
      };

      const { error } = await supabase
        .from('creches')
        .update({ features: updatedFeatures })
        .eq('id', selectedCreche);

      if (error) throw error;

      toast({
        title: "Feature Updated",
        description: `${feature.replace('_', ' ')} has been ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update feature settings.",
      });
    }
  };

  const features = [
    { key: 'event_calendar', label: 'Event Calendar' },
    { key: 'staff_management', label: 'Staff Management' },
    { key: 'reports_analytics', label: 'Reports & Analytics' },
    { key: 'financial_tracking', label: 'Financial Tracking' },
    { key: 'attendance_tracking', label: 'Attendance Tracking' },
    { key: 'parent_communication', label: 'Parent Communication' },
    { key: 'inventory_management', label: 'Inventory Management' },
    { key: 'incident_reporting', label: 'Incident Reporting' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Feature Management by Creche</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Select Creche</Label>
              <Select value={selectedCreche} onValueChange={setSelectedCreche}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a creche to manage features" />
                </SelectTrigger>
                <SelectContent>
                  {creches?.map((creche) => (
                    <SelectItem key={creche.id} value={creche.id}>
                      {creche.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCreche && selectedCrecheData && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold">
                  Features for {selectedCrecheData.name}
                </h3>
                <div className="grid gap-4">
                  {features.map((feature) => (
                    <div key={feature.key} className="flex items-center justify-between">
                      <Label htmlFor={feature.key}>{feature.label}</Label>
                      <Switch
                        id={feature.key}
                        checked={selectedCrecheData.features?.[feature.key] || false}
                        onCheckedChange={(checked) => handleFeatureToggle(feature.key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureManagement;
