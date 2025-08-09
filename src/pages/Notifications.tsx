import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, Settings, Users, Calendar, AlertTriangle, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Notifications = () => {
  const [newRule, setNewRule] = useState({
    name: '',
    trigger: '',
    condition: '',
    action: '',
    target: '',
    message: '',
    enabled: true
  });

  const { toast } = useToast();

  const { data: creches } = useQuery({
    queryKey: ["creches-for-notifications"],
    queryFn: async () => {
      const { data } = await supabase.from("creches").select("id, name");
      return data || [];
    }
  });

  const { data: notificationRules } = useQuery({
    queryKey: ["notification-rules"],
    queryFn: async () => {
      // In a real app, this would come from a notification_rules table
      return [
        {
          id: '1',
          name: 'New Application Alert',
          trigger: 'application_created',
          condition: 'status = new',
          action: 'send_email',
          target: 'creche_owners',
          message: 'New application received for {{creche_name}}',
          enabled: true,
          creche_id: null
        },
        {
          id: '2',
          name: 'Payment Reminder',
          trigger: 'invoice_due',
          condition: 'days_until_due = 3',
          action: 'send_sms',
          target: 'parents',
          message: 'Payment due in 3 days for {{student_name}}',
          enabled: true,
          creche_id: null
        }
      ];
    }
  });

  const { data: processFlows } = useQuery({
    queryKey: ["process-flows"],
    queryFn: async () => {
      return [
        {
          id: '1',
          name: 'Application Processing',
          steps: ['Submit', 'Review', 'Interview', 'Accept/Reject'],
          current_step: 'Review',
          creche_id: null
        },
        {
          id: '2',
          name: 'Student Enrollment',
          steps: ['Application', 'Documentation', 'Payment', 'Enrollment'],
          current_step: 'Documentation',
          creche_id: null
        }
      ];
    }
  });

  const triggerTypes = [
    { value: 'application_created', label: 'New Application' },
    { value: 'invoice_due', label: 'Invoice Due' },
    { value: 'student_absent', label: 'Student Absent' },
    { value: 'payment_received', label: 'Payment Received' },
    { value: 'capacity_full', label: 'Capacity Reached' }
  ];

  const actionTypes = [
    { value: 'send_email', label: 'Send Email' },
    { value: 'send_sms', label: 'Send SMS' },
    { value: 'create_task', label: 'Create Task' },
    { value: 'update_status', label: 'Update Status' }
  ];

  const targetTypes = [
    { value: 'creche_owners', label: 'Creche Owners' },
    { value: 'parents', label: 'Parents' },
    { value: 'staff', label: 'Staff' },
    { value: 'administrators', label: 'Administrators' }
  ];

  const handleCreateRule = () => {
    if (!newRule.name || !newRule.trigger || !newRule.action) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields."
      });
      return;
    }

    toast({
      title: "Rule Created",
      description: `Notification rule "${newRule.name}" has been created successfully.`
    });

    setNewRule({
      name: '',
      trigger: '',
      condition: '',
      action: '',
      target: '',
      message: '',
      enabled: true
    });
  };

  return (
    <div className="min-h-screen pt-20 px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notification Management</h1>
          <p className="text-muted-foreground">Manage automated notifications and process flows</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      </div>

      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rules">Notification Rules</TabsTrigger>
          <TabsTrigger value="flows">Process Flows</TabsTrigger>
          <TabsTrigger value="history">Notification History</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-6">
          {/* Create New Rule */}
          <Card>
            <CardHeader>
              <CardTitle>Create Notification Rule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input
                    id="rule-name"
                    value={newRule.name}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter rule name"
                  />
                </div>
                <div>
                  <Label htmlFor="trigger">Trigger Event</Label>
                  <Select value={newRule.trigger} onValueChange={(value) => setNewRule(prev => ({ ...prev, trigger: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map(trigger => (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          {trigger.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="action">Action</Label>
                  <Select value={newRule.action} onValueChange={(value) => setNewRule(prev => ({ ...prev, action: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map(action => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target">Target Audience</Label>
                  <Select value={newRule.target} onValueChange={(value) => setNewRule(prev => ({ ...prev, target: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent>
                      {targetTypes.map(target => (
                        <SelectItem key={target.value} value={target.value}>
                          {target.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="condition">Condition (Optional)</Label>
                <Input
                  id="condition"
                  value={newRule.condition}
                  onChange={(e) => setNewRule(prev => ({ ...prev, condition: e.target.value }))}
                  placeholder="e.g., days_until_due = 3"
                />
              </div>

              <div>
                <Label htmlFor="message">Message Template</Label>
                <Textarea
                  id="message"
                  value={newRule.message}
                  onChange={(e) => setNewRule(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter message template with {{variables}}"
                  rows={3}
                />
              </div>

              <Button onClick={handleCreateRule}>Create Rule</Button>
            </CardContent>
          </Card>

          {/* Existing Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Active Notification Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationRules?.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <Badge variant={rule.enabled ? "default" : "secondary"}>
                          {rule.enabled ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        When <strong>{rule.trigger}</strong> → {rule.action} to {rule.target}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{rule.message}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">
                        {rule.enabled ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Process Flows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processFlows?.map((flow) => (
                  <div key={flow.id} className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{flow.name}</h3>
                    <div className="flex items-center gap-2">
                      {flow.steps.map((step, index) => (
                        <div key={index} className="flex items-center">
                          <Badge 
                            variant={step === flow.current_step ? "default" : "outline"}
                            className={step === flow.current_step ? "bg-blue-500" : ""}
                          >
                            {step}
                          </Badge>
                          {index < flow.steps.length - 1 && (
                            <div className="w-4 h-px bg-border mx-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="font-medium">New Application Alert</p>
                      <p className="text-sm text-muted-foreground">Sent to Sunrise Creche owners</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>2 hours ago</p>
                    <Badge variant="outline" className="text-green-600">Delivered</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="font-medium">Payment Reminder</p>
                      <p className="text-sm text-muted-foreground">Sent to 15 parents</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>1 day ago</p>
                    <Badge variant="outline" className="text-green-600">Delivered</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
