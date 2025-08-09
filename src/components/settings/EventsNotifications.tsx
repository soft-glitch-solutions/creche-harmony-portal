
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
import { Badge } from "@/components/ui/badge";

const EventsNotifications = () => {
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: '',
    end_time: '',
    creche_id: '',
    priority: 'medium',
    color_code: '#3b82f6'
  });

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    creche_id: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch creches for dropdown
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

  // Fetch recent events
  const { data: events } = useQuery({
    queryKey: ['recent-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          creches!creche_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: typeof newEvent) => {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...eventData,
          end_time: eventData.end_time,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Event Created",
        description: "The event has been successfully created.",
      });
      setNewEvent({
        title: '',
        description: '',
        start: '',
        end_time: '',
        creche_id: '',
        priority: 'medium',
        color_code: '#3b82f6'
      });
      queryClient.invalidateQueries({ queryKey: ['recent-events'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create event.",
      });
    }
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (notificationData: typeof newNotification) => {
      // Get users associated with the creche
      const { data: users, error: usersError } = await supabase
        .from('user_creche')
        .select('user_id')
        .eq('creche_id', notificationData.creche_id);

      if (usersError) throw usersError;

      // Create notifications for all users
      const notifications = users.map(user => ({
        user_id: user.user_id,
        title: notificationData.title,
        message: notificationData.message,
        sender_id: (await supabase.auth.getUser()).data.user?.id
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Notification Sent",
        description: "The notification has been sent to all creche users.",
      });
      setNewNotification({
        title: '',
        message: '',
        creche_id: '',
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send notification.",
      });
    }
  });

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.start || !newEvent.creche_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    createEventMutation.mutate(newEvent);
  };

  const handleSendNotification = () => {
    if (!newNotification.title || !newNotification.message || !newNotification.creche_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    sendNotificationMutation.mutate(newNotification);
  };

  return (
    <div className="space-y-6">
      {/* Create Event */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="eventTitle">Event Title *</Label>
              <Input
                id="eventTitle"
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Creche *</Label>
              <Select 
                value={newEvent.creche_id} 
                onValueChange={(value) => setNewEvent(prev => ({ ...prev, creche_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select creche" />
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
              <Label htmlFor="eventStart">Start Date & Time *</Label>
              <Input
                id="eventStart"
                type="datetime-local"
                value={newEvent.start}
                onChange={(e) => setNewEvent(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="eventEnd">End Date & Time</Label>
              <Input
                id="eventEnd"
                type="datetime-local"
                value={newEvent.end_time}
                onChange={(e) => setNewEvent(prev => ({ ...prev, end_time: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select 
                value={newEvent.priority} 
                onValueChange={(value) => setNewEvent(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="eventColor">Color</Label>
              <Input
                id="eventColor"
                type="color"
                value={newEvent.color_code}
                onChange={(e) => setNewEvent(prev => ({ ...prev, color_code: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="eventDescription">Description</Label>
            <Textarea
              id="eventDescription"
              placeholder="Event description"
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          
          <Button 
            onClick={handleCreateEvent}
            disabled={createEventMutation.isPending}
          >
            {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
          </Button>
        </CardContent>
      </Card>

      {/* Send Notification */}
      <Card>
        <CardHeader>
          <CardTitle>Send Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="notificationTitle">Notification Title *</Label>
              <Input
                id="notificationTitle"
                placeholder="Notification title"
                value={newNotification.title}
                onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Target Creche *</Label>
              <Select 
                value={newNotification.creche_id} 
                onValueChange={(value) => setNewNotification(prev => ({ ...prev, creche_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select creche" />
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
              <Label htmlFor="notificationMessage">Message *</Label>
              <Textarea
                id="notificationMessage"
                placeholder="Notification message"
                value={newNotification.message}
                onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>
            
            <Button 
              onClick={handleSendNotification}
              disabled={sendNotificationMutation.isPending}
            >
              {sendNotificationMutation.isPending ? 'Sending...' : 'Send Notification'}
            </Button>
          </div>
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
                <TableHead>Start Date</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events?.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.creches?.name}</TableCell>
                  <TableCell>
                    {new Date(event.start).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={event.priority === 'high' ? 'destructive' : 
                                  event.priority === 'medium' ? 'default' : 'secondary'}>
                      {event.priority}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsNotifications;
