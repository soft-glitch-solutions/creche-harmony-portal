
import { Card } from "@/components/ui/card";
import { SouthAfricaMap } from "@/components/map/SouthAfricaMap";

const StatMaps = () => {
  return (
    <div className="p-8 pt-20">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Statistical Maps</h1>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">South Africa Regions</h2>
        <div className="relative h-[400px]">
          <SouthAfricaMap />
        </div>
      </Card>
    </div>
  );
};

export default StatMaps;
