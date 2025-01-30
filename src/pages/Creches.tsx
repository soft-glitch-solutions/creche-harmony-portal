import { Card } from "@/components/ui/card";
import { SouthAfricaMap } from "@/components/map/SouthAfricaMap";

const Creches = () => {
  return (
    <div className="p-8 pt-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Creches</h1>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Creche Locations</h2>
        <SouthAfricaMap />
      </Card>
    </div>
  );
};

export default Creches;