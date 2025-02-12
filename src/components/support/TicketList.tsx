
import { Card } from "@/components/ui/card";
import { Clock, User, Building, Eye, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: { name: string; color: string };
  created_at: string;
  organization?: { name: string };
  creche?: { name: string };
  assigned_user?: { email: string };
  source?: string;
}

interface TicketListProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
}

export const TicketList = ({ tickets, onTicketClick }: TicketListProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Card 
          key={ticket.id} 
          className="p-3 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{ticket.title}</h3>
            <div className="flex space-x-2">
              <Eye 
                className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                onClick={() => navigate(`/support/${ticket.id}`)}
              />
              <Edit 
                className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onTicketClick(ticket);
                }}
              />
              {ticket.source === 'support_request' && (
                <Badge variant="secondary" className="ml-2">Support Request</Badge>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{ticket.description}</p>
          
          <div className="mt-3 space-y-1 text-xs text-gray-500">
            {ticket.assigned_user && (
              <div className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                {ticket.assigned_user.email}
              </div>
            )}
            
            {(ticket.organization?.name || ticket.creche?.name) && (
              <div className="flex items-center">
                <Building className="w-3 h-3 mr-1" />
                {ticket.organization?.name || ticket.creche?.name}
              </div>
            )}
            
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {new Date(ticket.created_at).toLocaleDateString()}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
