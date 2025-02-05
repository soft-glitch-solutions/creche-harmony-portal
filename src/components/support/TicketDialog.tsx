
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TicketDialogProps {
  ticket?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function TicketDialog({ ticket, onClose, onSuccess }: TicketDialogProps) {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: ticket?.title || "",
      description: ticket?.description || "",
      status_id: ticket?.status?.id || "",
      priority: ticket?.priority || "medium",
      organization_id: ticket?.organization_id || "",
      creche_id: ticket?.creche_id || "",
      assigned_to: ticket?.assigned_to || "",
    }
  });

  const { data: statuses } = useQuery({
    queryKey: ["ticket_statuses"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ticket_status")
        .select("*")
        .order("order_index");
      return data || [];
    }
  });

  const { data: organizations } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("organizations")
        .select("*")
        .order("name");
      return data || [];
    }
  });

  const { data: creches } = useQuery({
    queryKey: ["creches"],
    queryFn: async () => {
      const { data } = await supabase
        .from("creches")
        .select("*")
        .order("name");
      return data || [];
    }
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await supabase
        .from("users")
        .select("*")
        .order("email");
      return data || [];
    }
  });

  const onSubmit = async (data: any) => {
    try {
      if (ticket) {
        const { error } = await supabase
          .from("support_tickets")
          .update(data)
          .eq("id", ticket.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Ticket updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("support_tickets")
          .insert([data]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Ticket created successfully",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to save ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register("title", { required: true })}
          className={errors.title ? "border-red-500" : ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description", { required: true })}
          className={errors.description ? "border-red-500" : ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            onValueChange={(value) => register("status_id").onChange({ target: { value } })}
            defaultValue={ticket?.status?.id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statuses?.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select 
            onValueChange={(value) => register("priority").onChange({ target: { value } })}
            defaultValue={ticket?.priority || "medium"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="organization">Organization</Label>
          <Select 
            onValueChange={(value) => register("organization_id").onChange({ target: { value } })}
            defaultValue={ticket?.organization_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations?.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="creche">Creche</Label>
          <Select 
            onValueChange={(value) => register("creche_id").onChange({ target: { value } })}
            defaultValue={ticket?.creche_id}
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

        <div className="space-y-2">
          <Label htmlFor="assigned">Assign To</Label>
          <Select 
            onValueChange={(value) => register("assigned_to").onChange({ target: { value } })}
            defaultValue={ticket?.assigned_to}
          >
            <SelectTrigger>
              <SelectValue placeholder="Assign to user" />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {ticket ? 'Update Ticket' : 'Create Ticket'}
        </Button>
      </div>
    </form>
  );
}
