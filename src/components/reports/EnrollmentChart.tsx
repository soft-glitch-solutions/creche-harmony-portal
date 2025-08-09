
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EnrollmentChartProps {
  data: {
    province: string;
    creches: number;
    students: number;
    capacity: number;
    utilization: number;
  }[];
}

export const EnrollmentChart = ({ data }: EnrollmentChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Provincial Enrollment Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="province" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={(value, name) => [
              name === 'utilization' ? `${value}%` : value,
              name
            ]} />
            <Legend />
            <Bar yAxisId="left" dataKey="creches" fill="#8884d8" name="Creches" />
            <Bar yAxisId="left" dataKey="students" fill="#82ca9d" name="Students" />
            <Bar yAxisId="right" dataKey="utilization" fill="#ffc658" name="Utilization %" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
