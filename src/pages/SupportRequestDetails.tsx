
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Building, 
  User, 
  ArrowLeft,
  Mail,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const SupportRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: request, isLoading } = useQuery({
    queryKey: ["support_request", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_requests")
        .select(`
          *,
          creche:creche_id(id, name),
          user:user_id(first_name, last_name, email)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleConvertToTicket = async () => {
    try {
      const { data: ticket, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({
          title: request.title,
          description: request.message,
          priority: request.priority || 'medium',
          creche_id: request.creche?.id,
          source: 'support_request',
          status_id: '1'
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

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

      navigate('/support');
    } catch (error) {
      console.error("Error converting request:", error);
      toast({
        title: "Error",
        description: "Failed to convert request to ticket",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!request) {
    return <div className="p-8">Request not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-8">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate('/support')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Support
        </Button>

        <Card className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{request.title}</h1>
              <Badge>{request.status}</Badge>
            </div>
            {!request.converted_at && (
              <Button onClick={handleConvertToTicket}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Convert to Ticket
              </Button>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-2">Message</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{request.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {request.creche && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-2">Creche</h2>
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    {request.creche.name}
                  </div>
                </div>
              )}

              {request.user && (
                <>
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-2">Submitted By</h2>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {request.user.first_name} {request.user.last_name}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-gray-500 mb-2">Contact Email</h2>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {request.user.email}
                    </div>
                  </div>
                </>
              )}

              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-2">Created</h2>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {format(new Date(request.created_at), 'PPpp')}
                </div>
              </div>

              {request.converted_at && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500 mb-2">Converted</h2>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {format(new Date(request.converted_at), 'PPpp')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SupportRequestDetails;
