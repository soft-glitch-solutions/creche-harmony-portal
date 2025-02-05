
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Clock, User, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TicketDialog } from "@/components/support/TicketDialog";
import { TicketList } from "@/components/support/TicketList";
import { useState } from "react";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: { id: string; name: string; color: string };
  priority: string;
  created_by: string;
  assigned_to?: string;
  organization_id?: string;
  creche_id?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  organization?: { name: string };
  creche?: { name: string };
  assigned_user?: { email: string };
}

const Support = () => {
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: tickets, isLoading, refetch } = useQuery({
    queryKey: ["support_tickets"],
    queryFn: async () => {
      try {
        console.log("Fetching support tickets...");
        const { data, error } = await supabase
          .from("support_tickets")
          .select(`
            *,
            status:status_id(id, name, color),
            organization:organization_id(name),
            creche:creche_id(name),
            assigned_user:assigned_to(email)
          `)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          toast({
            title: "Error",
            description: "Failed to load support tickets. Please try again later.",
            variant: "destructive",
          });
          return [];
        }

        console.log("Fetched support tickets successfully:", data);
        return data || [];
      } catch (error) {
        console.error("Error in query function:", error);
        toast({
          title: "Error",
          description: "Failed to load support tickets. Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  const ticketsByStatus = {
    new: tickets?.filter(ticket => ticket.status?.name === 'New') || [],
    in_progress: tickets?.filter(ticket => ticket.status?.name === 'In Progress') || [],
    on_hold: tickets?.filter(ticket => ticket.status?.name === 'On Hold') || [],
    resolved: tickets?.filter(ticket => ticket.status?.name === 'Resolved') || [],
    closed: tickets?.filter(ticket => ticket.status?.name === 'Closed') || [],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Support Tickets</h1>
        <div className="animate-pulse">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {selectedTicket ? 'Edit Ticket' : 'Create New Ticket'}
              </DialogTitle>
            </DialogHeader>
            <TicketDialog 
              ticket={selectedTicket}
              onClose={() => {
                setIsDialogOpen(false);
                setSelectedTicket(null);
              }}
              onSuccess={() => {
                refetch();
                setIsDialogOpen(false);
                setSelectedTicket(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-4 text-red-600">New</h2>
          <TicketList 
            tickets={ticketsByStatus.new} 
            onTicketClick={(ticket) => {
              setSelectedTicket(ticket);
              setIsDialogOpen(true);
            }}
          />
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-4 text-yellow-600">In Progress</h2>
          <TicketList 
            tickets={ticketsByStatus.in_progress}
            onTicketClick={(ticket) => {
              setSelectedTicket(ticket);
              setIsDialogOpen(true);
            }}
          />
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-4 text-indigo-600">On Hold</h2>
          <TicketList 
            tickets={ticketsByStatus.on_hold}
            onTicketClick={(ticket) => {
              setSelectedTicket(ticket);
              setIsDialogOpen(true);
            }}
          />
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-4 text-green-600">Resolved</h2>
          <TicketList 
            tickets={ticketsByStatus.resolved}
            onTicketClick={(ticket) => {
              setSelectedTicket(ticket);
              setIsDialogOpen(true);
            }}
          />
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-4 text-gray-600">Closed</h2>
          <TicketList 
            tickets={ticketsByStatus.closed}
            onTicketClick={(ticket) => {
              setSelectedTicket(ticket);
              setIsDialogOpen(true);
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default Support;
