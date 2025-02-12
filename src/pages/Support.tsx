
import { useQuery } from "@tanstack/react-query";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TicketDialog } from "@/components/support/TicketDialog";
import { StatusColumn } from "@/components/support/StatusColumn";
import { SupportRequestList } from "@/components/support/SupportRequestList";
import { useState } from "react";

const Support = () => {
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ["support_tickets"],
    queryFn: async () => {
      const { data: tickets, error: ticketsError } = await supabase
        .from("support_tickets")
        .select(`
          *,
          status:status_id(id, name, color),
          organization:organization_id(name),
          creche:creche_id(name),
          assigned_user:users(email)
        `)
        .order("created_at", { ascending: false });

      if (ticketsError) {
        console.error("Error fetching tickets:", ticketsError);
        throw ticketsError;
      }

      return tickets || [];
    },
    retry: 2,
    retryDelay: 1000,
  });

  const { data: requests = [], refetch: refetchRequests } = useQuery({
    queryKey: ["support_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_requests")
        .select(`
          *,
          creche:creche_id(id, name)
        `)
        .is('converted_at', null)
        .eq('status', 'open');

      if (error) {
        console.error("Error fetching support requests:", error);
        throw error;
      }

      return data || [];
    },
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

  const handleRequestConverted = () => {
    refetch();
    refetchRequests();
  };

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

      {requests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Support Requests</h2>
          <SupportRequestList 
            requests={requests}
            onRequestConverted={handleRequestConverted}
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatusColumn
          title="New"
          color="#EF4444"
          tickets={ticketsByStatus.new}
          onTicketClick={(ticket) => {
            setSelectedTicket(ticket);
            setIsDialogOpen(true);
          }}
        />

        <StatusColumn
          title="In Progress"
          color="#F59E0B"
          tickets={ticketsByStatus.in_progress}
          onTicketClick={(ticket) => {
            setSelectedTicket(ticket);
            setIsDialogOpen(true);
          }}
        />

        <StatusColumn
          title="On Hold"
          color="#6366F1"
          tickets={ticketsByStatus.on_hold}
          onTicketClick={(ticket) => {
            setSelectedTicket(ticket);
            setIsDialogOpen(true);
          }}
        />

        <StatusColumn
          title="Resolved"
          color="#10B981"
          tickets={ticketsByStatus.resolved}
          onTicketClick={(ticket) => {
            setSelectedTicket(ticket);
            setIsDialogOpen(true);
          }}
        />

        <StatusColumn
          title="Closed"
          color="#6B7280"
          tickets={ticketsByStatus.closed}
          onTicketClick={(ticket) => {
            setSelectedTicket(ticket);
            setIsDialogOpen(true);
          }}
        />
      </div>
    </div>
  );
};

export default Support;
