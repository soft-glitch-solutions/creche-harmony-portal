
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const SupportDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [newNote, setNewNote] = useState("");

  const { data: ticket, isLoading: ticketLoading } = useQuery({
    queryKey: ["support_ticket", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select(`
          *,
          status:status_id(id, name, color),
          organization:organization_id(name),
          creche:creche_id(name),
          assigned_user:users(email, first_name, last_name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: notes, isLoading: notesLoading, refetch: refetchNotes } = useQuery({
    queryKey: ["ticket_notes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_notes")
        .select(`
          *,
          user:users(first_name, last_name, email)
        `)
        .eq("ticket_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const { error } = await supabase
        .from("ticket_notes")
        .insert([
          {
            ticket_id: id,
            note: newNote,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note added successfully",
      });

      setNewNote("");
      refetchNotes();
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    }
  };

  if (ticketLoading || notesLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!ticket) {
    return <div className="p-8">Ticket not found</div>;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-500 bg-red-100';
      case 'medium':
        return 'text-yellow-500 bg-yellow-100';
      case 'low':
        return 'text-green-500 bg-green-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-8">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-4">{ticket.title}</h1>
            <p className="text-gray-600 mb-6">{ticket.description}</p>
            
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Notes</h2>
              <div className="space-y-4 mb-6">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="mb-2"
                />
                <Button onClick={handleAddNote}>Add Note</Button>
              </div>
              
              <div className="space-y-4">
                {notes?.map((note) => (
                  <Card key={note.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">
                        {note.user?.first_name} {note.user?.last_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <p className="text-gray-600">{note.note}</p>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Ticket Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <div>
                  <Badge style={{ backgroundColor: ticket.status?.color }}>
                    {ticket.status?.name}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Priority</label>
                <div>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Assigned To</label>
                <div className="font-medium">
                  {ticket.assigned_user?.email || "Unassigned"}
                </div>
              </div>

              {ticket.organization?.name && (
                <div>
                  <label className="text-sm text-gray-500">Organization</label>
                  <div className="font-medium">{ticket.organization.name}</div>
                </div>
              )}

              {ticket.creche?.name && (
                <div>
                  <label className="text-sm text-gray-500">Creche</label>
                  <div className="font-medium">{ticket.creche.name}</div>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-500">Created</label>
                <div className="font-medium">
                  {format(new Date(ticket.created_at), "MMM d, yyyy")}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupportDetails;
