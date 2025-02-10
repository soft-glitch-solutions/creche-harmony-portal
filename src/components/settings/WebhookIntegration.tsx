
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const WebhookIntegration = () => {
  const [newWebhookName, setNewWebhookName] = useState('');
  const [selectedCreche, setSelectedCreche] = useState<string>('');
  const [source, setSource] = useState('website');
  const { toast } = useToast();

  const { data: creches } = useQuery({
    queryKey: ['creches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creches')
        .select('id, name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: webhooks, refetch: refetchWebhooks } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_configurations')
        .select('*, creches(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: webhookLogs } = useQuery({
    queryKey: ['webhook-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*, webhook_configurations(name)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  const createWebhook = async () => {
    if (!newWebhookName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a webhook name",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCreche) {
      toast({
        title: "Error",
        description: "Please select a creche",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('webhook_configurations')
      .insert({
        name: newWebhookName,
        creche_id: selectedCreche,
        source: source,
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Webhook created successfully",
    });
    setNewWebhookName('');
    setSelectedCreche('');
    setSource('website');
    refetchWebhooks();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Create New Webhook</h3>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Webhook Name</Label>
            <Input
              id="name"
              placeholder="Enter webhook name"
              value={newWebhookName}
              onChange={(e) => setNewWebhookName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="creche">Select Creche</Label>
            <Select value={selectedCreche} onValueChange={setSelectedCreche}>
              <SelectTrigger>
                <SelectValue placeholder="Select a creche" />
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

          <div className="grid gap-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              placeholder="Enter webhook source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>

          <Button onClick={createWebhook}>Create Webhook</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Active Webhooks</h3>
        <div className="grid gap-4">
          {webhooks?.map((webhook) => (
            <Card key={webhook.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-medium">{webhook.name}</h4>
                  <p className="text-sm text-gray-500">Creche: {webhook.creches?.name}</p>
                  <p className="text-sm text-gray-500">Source: {webhook.source}</p>
                  <p className="text-sm text-gray-500">Key: {webhook.webhook_key}</p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(webhook.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/api/webhook/${webhook.webhook_key}`);
                    toast({
                      title: "Copied!",
                      description: "Webhook URL copied to clipboard",
                    });
                  }}>
                    Copy URL
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Recent Webhook Logs</h3>
        <ScrollArea className="h-[400px] w-full rounded-md border">
          <div className="p-4 space-y-4">
            {webhookLogs?.map((log) => (
              <Card key={log.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {log.webhook_configurations?.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">Status: {log.status}</p>
                  {log.error_message && (
                    <p className="text-sm text-red-500">Error: {log.error_message}</p>
                  )}
                  <details className="text-sm">
                    <summary>View Payload</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded-md overflow-x-auto">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </details>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default WebhookIntegration;
