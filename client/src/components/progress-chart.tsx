import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

interface ProgressChartProps {
  data: Array<{
    date: string;
    activities?: number;
    energy?: number;
    nutrition?: number;
  }>;
  type: "line" | "bar";
  dataKey: string;
  color: string;
}

export default function ProgressChart({ data, type, dataKey, color }: ProgressChartProps) {
  const Chart = type === "line" ? LineChart : BarChart;
  
  return (
    <ResponsiveContainer width="100%" height={200}>
      <Chart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <XAxis 
          dataKey="date" 
          fontSize={12}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
        />
        <YAxis fontSize={12} />
        <Tooltip 
          labelFormatter={(value) => new Date(value).toLocaleDateString()}
          formatter={(value, name) => [value, name]}
        />
        {type === "line" ? (
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
          />
        ) : (
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        )}
      </Chart>
    </ResponsiveContainer>
  );
}
