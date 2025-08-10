
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CrecheSettingsTabProps {
  crecheId: string;
}

export const CrecheSettingsTab = ({ crecheId }: CrecheSettingsTabProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: creche, isLoading } = useQuery({
    queryKey: ['creche-settings', crecheId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creches')
        .select('*')
        .eq('id', crecheId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const updateCrecheMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('creches')
        .update(updates)
        .eq('id', crecheId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creche-settings', crecheId] });
      queryClient.invalidateQueries({ queryKey: ['creche', crecheId] });
      toast({
        title: "Settings Updated",
        description: "Creche settings have been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update settings. Please try again.",
      });
    }
  });

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    if (!creche) return;

    const currentFeatures = creche.features as Record<string, boolean> || {};
    const updatedFeatures = {
      ...currentFeatures,
      [feature]: enabled
    };

    updateCrecheMutation.mutate({ features: updatedFeatures });
  };

  const handleBasicInfoUpdate = (field: string, value: any) => {
    updateCrecheMutation.mutate({ [field]: value });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!creche) {
    return <div>Creche not found</div>;
  }

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
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={creche.capacity || ''}
                onChange={(e) => handleBasicInfoUpdate('capacity', parseInt(e.target.value) || 0)}
                placeholder="Enter capacity"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly_price">Monthly Price (R)</Label>
              <Input
                id="monthly_price"
                type="number"
                value={creche.monthly_price || ''}
                onChange={(e) => handleBasicInfoUpdate('monthly_price', parseFloat(e.target.value) || 0)}
                placeholder="Enter monthly price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekly_price">Weekly Price (R)</Label>
              <Input
                id="weekly_price"
                type="number"
                value={creche.weekly_price || ''}
                onChange={(e) => handleBasicInfoUpdate('weekly_price', parseFloat(e.target.value) || 0)}
                placeholder="Enter weekly price"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_day">Payment Day (1-31)</Label>
              <Input
                id="payment_day"
                type="number"
                min="1"
                max="31"
                value={creche.payment_day || ''}
                onChange={(e) => handleBasicInfoUpdate('payment_day', parseInt(e.target.value) || null)}
                placeholder="Enter payment day"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="operating_hours">Operating Hours</Label>
            <Input
              id="operating_hours"
              value={creche.operating_hours || ''}
              onChange={(e) => handleBasicInfoUpdate('operating_hours', e.target.value)}
              placeholder="e.g., 7:00 AM - 6:00 PM"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={creche.description || ''}
              onChange={(e) => handleBasicInfoUpdate('description', e.target.value)}
              placeholder="Enter creche description"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Feature Management */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {features.map((feature) => {
              const featuresObj = creche.features as Record<string, boolean> || {};
              return (
                <div key={feature.key} className="flex items-center justify-between">
                  <Label htmlFor={feature.key}>{feature.label}</Label>
                  <Switch
                    id={feature.key}
                    checked={featuresObj[feature.key] || false}
                    onCheckedChange={(checked) => handleFeatureToggle(feature.key, checked)}
                    disabled={updateCrecheMutation.isPending}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Registration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Registration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="registered">Registered Status</Label>
            <Switch
              id="registered"
              checked={creche.registered || false}
              onCheckedChange={(checked) => handleBasicInfoUpdate('registered', checked)}
              disabled={updateCrecheMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={creche.phone_number || ''}
                onChange={(e) => handleBasicInfoUpdate('phone_number', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={creche.email || ''}
                onChange={(e) => handleBasicInfoUpdate('email', e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <Input
                id="whatsapp_number"
                value={creche.whatsapp_number || ''}
                onChange={(e) => handleBasicInfoUpdate('whatsapp_number', e.target.value)}
                placeholder="Enter WhatsApp number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                value={creche.website_url || ''}
                onChange={(e) => handleBasicInfoUpdate('website_url', e.target.value)}
                placeholder="Enter website URL"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={creche.address || ''}
              onChange={(e) => handleBasicInfoUpdate('address', e.target.value)}
              placeholder="Enter full address"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
