
import { Card } from "@/components/ui/card";
import { Clock, User, Building } from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: { name: string; color: string };
  created_at: string;
  organization?: { name: string };
  creche?: { name: string };
  assigned_user?: { email: string };
}

interface TicketListProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
}

export const TicketList = ({ tickets, onTicketClick }: TicketListProps) => {
  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Card 
          key={ticket.id} 
          className="p-3 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onTicketClick(ticket)}
        >
          <h3 className="font-medium">{ticket.title}</h3>
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
