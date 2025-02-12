
import { Card } from "@/components/ui/card";
import { TicketList } from "./TicketList";

interface StatusColumnProps {
  title: string;
  color: string;
  tickets: any[];
  onTicketClick: (ticket: any) => void;
}

export const StatusColumn = ({ title, color, tickets, onTicketClick }: StatusColumnProps) => {
  return (
    <Card className="p-4">
      <h2 className="font-semibold text-lg mb-4" style={{ color }}>
        {title}
      </h2>
      <TicketList tickets={tickets} onTicketClick={onTicketClick} />
    </Card>
  );
};
