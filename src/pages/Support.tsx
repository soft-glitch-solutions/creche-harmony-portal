import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SupportTicket {
  id: number;
  title: string;
  description: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
  creche_id: number;
}

const Support = () => {
  const { toast } = useToast();
  
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["support_tickets"],
    queryFn: async () => {
      try {
        console.log("Fetching support tickets...");
        const { data, error } = await supabase
          .from("support_tickets")
          .select("*")
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
    new: tickets?.filter(ticket => ticket.status === 'new') || [],
    in_progress: tickets?.filter(ticket => ticket.status === 'in_progress') || [],
    resolved: tickets?.filter(ticket => ticket.status === 'resolved') || [],
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
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Support Tickets</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* New Tickets */}
        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-4 text-red-600">New</h2>
          <div className="space-y-4">
            {ticketsByStatus.new.map((ticket) => (
              <Card key={ticket.id} className="p-3 hover:shadow-md transition-shadow">
                <h3 className="font-medium">{ticket.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{ticket.description}</p>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* In Progress Tickets */}
        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-4 text-yellow-600">In Progress</h2>
          <div className="space-y-4">
            {ticketsByStatus.in_progress.map((ticket) => (
              <Card key={ticket.id} className="p-3 hover:shadow-md transition-shadow">
                <h3 className="font-medium">{ticket.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{ticket.description}</p>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Resolved Tickets */}
        <Card className="p-4">
          <h2 className="font-semibold text-lg mb-4 text-green-600">Resolved</h2>
          <div className="space-y-4">
            {ticketsByStatus.resolved.map((ticket) => (
              <Card key={ticket.id} className="p-3 hover:shadow-md transition-shadow">
                <h3 className="font-medium">{ticket.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{ticket.description}</p>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Support;