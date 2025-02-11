
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type EnrollmentStatsProps = {
  data: {
    province: string;
    creches: number;
    students: number;
  }[];
};

export const EnrollmentStats = ({ data }: EnrollmentStatsProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Enrollment by Province</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="province" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Bar yAxisId="left" dataKey="creches" fill="#8884d8" name="Creches" />
            <Bar yAxisId="right" dataKey="students" fill="#82ca9d" name="Students" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
