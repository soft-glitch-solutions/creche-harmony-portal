
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const EventsNotifications = () => {
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_date: '',
    creche_id: '',
    send_notification: true
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    daily_digest: true
  });

  const { toast } = useToast();

  const { data: creches } = useQuery({
    queryKey: ['creches-for-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creches')
        .select('id, name');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: events, refetch: refetchEvents } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          creche:creche_id(name)
        `)
        .order('event_date', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.event_date || !eventForm.creche_id) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert([{
          title: eventForm.title,
          description: eventForm.description,
          event_date: eventForm.event_date,
          creche_id: eventForm.creche_id
        }])
        .select()
        .single();

      if (eventError) throw eventError;

      if (eventForm.send_notification) {
        // In a real app, this would trigger notification sending
        console.log('Sending notifications for event:', event.id);
      }

      toast({
        title: "Success",
        description: "Event created successfully.",
      });

      setEventForm({
        title: '',
        description: '',
        event_date: '',
        creche_id: '',
        send_notification: true
      });

      refetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create event.",
      });
    }
  };

  const handleSendBulkNotification = async () => {
    try {
      // In a real app, this would send bulk notifications
      console.log('Sending bulk notification to all users');
      
      toast({
        title: "Notification Sent",
        description: "Bulk notification has been sent to all users.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send bulk notification.",
      });
    }
  };

  const handleSaveNotificationSettings = async () => {
    try {
      // In a real app, this would save to user preferences or system settings
      console.log('Saving notification settings:', notificationSettings);
      
      toast({
        title: "Settings Saved",
        description: "Notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save notification settings.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Event */}
      <Card>
        <CardHeader>
          <CardTitle>Create Event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="event-title">Event Title *</Label>
              <Input
                id="event-title"
                value={eventForm.title}
                onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter event title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="event-date">Event Date *</Label>
              <Input
                id="event-date"
                type="datetime-local"
                value={eventForm.event_date}
                onChange={(e) => setEventForm(prev => ({ ...prev, event_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="event-creche">Select Creche *</Label>
            <Select value={eventForm.creche_id} onValueChange={(value) => setEventForm(prev => ({ ...prev, creche_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a creche" />
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
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              value={eventForm.description}
              onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Event description..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="send-notification">Send Notification</Label>
            <Switch
              id="send-notification"
              checked={eventForm.send_notification}
              onCheckedChange={(checked) => setEventForm(prev => ({ ...prev, send_notification: checked }))}
            />
          </div>

          <Button onClick={handleCreateEvent} className="w-full">
            Create Event
          </Button>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Creche</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events?.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.creche?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {new Date(event.event_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Active</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bulk Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Send Bulk Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Notification Message</Label>
            <Textarea
              placeholder="Enter your notification message here..."
              rows={4}
            />
          </div>
          <Button onClick={handleSendBulkNotification}>
            Send to All Users
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch
                id="email-notifications"
                checked={notificationSettings.email_notifications}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ 
                  ...prev, 
                  email_notifications: checked 
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <Switch
                id="sms-notifications"
                checked={notificationSettings.sms_notifications}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ 
                  ...prev, 
                  sms_notifications: checked 
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <Switch
                id="push-notifications"
                checked={notificationSettings.push_notifications}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ 
                  ...prev, 
                  push_notifications: checked 
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="daily-digest">Daily Digest</Label>
              <Switch
                id="daily-digest"
                checked={notificationSettings.daily_digest}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ 
                  ...prev, 
                  daily_digest: checked 
                }))}
              />
            </div>
          </div>
          
          <Button onClick={handleSaveNotificationSettings}>
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsNotifications;
