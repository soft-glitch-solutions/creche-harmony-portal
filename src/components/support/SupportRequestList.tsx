
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SupportRequest {
  id: string;
  title: string;
  message: string;
  created_at: string;
  creche?: { id: string; name: string };
}

interface SupportRequestListProps {
  requests: SupportRequest[];
  onRequestConverted: () => void;
}

export const SupportRequestList = ({ requests, onRequestConverted }: SupportRequestListProps) => {
  const { toast } = useToast();

  const handleConvertToTicket = async (request: SupportRequest) => {
    try {
      // First create the ticket
      const { data: ticket, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({
          title: request.title,
          description: request.message,
          priority: 'medium',
          creche_id: request.creche?.id,
          source: 'support_request',
          status_id: '1' // Assuming '1' is the ID for 'New' status
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Then mark the request as converted
      const { error: updateError } = await supabase
        .from("support_requests")
        .update({
          converted_at: new Date().toISOString(),
          converted_ticket_id: ticket.id
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Support request converted to ticket successfully",
      });

      onRequestConverted();
    } catch (error) {
      console.error("Error converting request:", error);
      toast({
        title: "Error",
        description: "Failed to convert request to ticket",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id} className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{request.title}</h3>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => handleConvertToTicket(request)}
            >
              Convert to Ticket
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-3">{request.message}</p>
          <div className="text-xs text-gray-500 space-y-1">
            {request.creche && (
              <div className="flex items-center">
                <Building className="w-3 h-3 mr-1" />
                {request.creche.name}
              </div>
            )}
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {new Date(request.created_at).toLocaleDateString()}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
