import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SouthAfricaMap } from "@/components/map/SouthAfricaMap";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Creches = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showRegisteredOnly, setShowRegisteredOnly] = useState(false);
  const { toast } = useToast();

  const { data: creches, isLoading } = useQuery({
    queryKey: ["creches"],
    queryFn: async () => {
      try {
        console.log("Fetching creches...");
        const { data, error } = await supabase
          .from("creches")
          .select("*")
          .order("name");

        if (error) {
          console.error("Supabase error:", error);
          toast({
            title: "Error",
            description: "Failed to load creches. Please try again later.",
            variant: "destructive",
          });
          return [];
        }

        console.log("Fetched creches successfully:", data);
        return data || [];
      } catch (error) {
        console.error("Error in query function:", error);
        toast({
          title: "Error",
          description: "Failed to load creches. Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  const filteredCreches = creches?.filter((creche) => {
    const matchesSearch = creche.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRegistered = showRegisteredOnly ? creche.registered : true;
    return matchesSearch && matchesRegistered;
  });

  return (
    <div className="p-8 pt-20">
      <div className="flex flex-col space-y-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Creches</h1>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <Input
            placeholder="Search creches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center space-x-2">
            <Switch
              id="registered"
              checked={showRegisteredOnly}
              onCheckedChange={setShowRegisteredOnly}
            />
            <Label htmlFor="registered">Show registered only</Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : filteredCreches?.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No creches found
          </div>
        ) : (
          filteredCreches?.map((creche) => (
            <Card key={creche.id} className="overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img
                  src={creche.header_image || "/placeholder.svg"}
                  alt={creche.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{creche.name}</span>
                  {creche.registered && (
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                      Registered
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{creche.address}</p>
                <p className="text-sm text-gray-600">
                  {creche.phone_number && (
                    <span className="block">📞 {creche.phone_number}</span>
                  )}
                  {creche.email && (
                    <span className="block">✉️ {creche.email}</span>
                  )}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Creche Locations</h2>
        <SouthAfricaMap />
      </Card>
    </div>
  );
};

export default Creches;