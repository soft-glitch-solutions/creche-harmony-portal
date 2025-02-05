import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreheDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: creche, isLoading: crecheLoading } = useQuery({
    queryKey: ["creche", id],
    queryFn: async () => {
      console.log("Fetching creche details for:", id);
      const { data, error } = await supabase
        .from("creches")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching creche:", error);
        toast({
          title: "Error",
          description: "Failed to load creche details",
          variant: "destructive",
        });
        return null;
      }

      return data;
    },
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["creche-students", id],
    queryFn: async () => {
      console.log("Fetching students for creche:", id);
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("creche_id", id);

      if (error) {
        console.error("Error fetching students:", error);
        toast({
          title: "Error",
          description: "Failed to load students",
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
  });

  if (crecheLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!creche) {
    return <div>Creche not found</div>;
  }

  return (
    <div className="container mx-auto p-6 pt-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{creche.name}</h1>
        <Button asChild variant="outline">
          <a
            href={`https://portal.crechespots.co.za/dashboard/creche/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            View Portal <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={creche.header_image}
                    alt={creche.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Contact Information</h3>
                    <p>📍 {creche.address}</p>
                    <p>📞 {creche.phone_number}</p>
                    <p>✉️ {creche.email}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Operating Details</h3>
                    <p>Capacity: {creche.capacity} children</p>
                    <p>Hours: {creche.operating_hours}</p>
                    <p>Registration Status: {creche.registered ? "Registered" : "Unregistered"}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p>{creche.description}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-700">Monthly Fee</h3>
                  <p className="text-2xl font-bold text-green-800">
                    R{creche.monthly_price}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-700">Weekly Fee</h3>
                  <p className="text-2xl font-bold text-blue-800">
                    R{creche.weekly_price}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-700">Current Plan</h3>
                  <p className="text-2xl font-bold text-purple-800 capitalize">
                    {creche.plan}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardContent className="pt-6">
              {studentsLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold">
                    Total Students: {students?.length || 0}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students?.map((student) => (
                      <div
                        key={student.id}
                        className="p-4 border rounded-lg shadow-sm"
                      >
                        <h4 className="font-semibold">{student.name}</h4>
                        <p className="text-sm text-gray-600">
                          Age: {student.age || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Class: {student.class || "Unassigned"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Registration Status</h3>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        creche.registered
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {creche.registered ? "Registered" : "Not Registered"}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Features</h3>
                    <ul className="space-y-2">
                      {Object.entries(creche.features || {}).map(
                        ([feature, enabled]) => (
                          <li
                            key={feature}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                enabled ? "bg-green-500" : "bg-red-500"
                              }`}
                            />
                            {feature.split("_").join(" ")}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreheDetails;