import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { StudyActivity } from "@shared/schema";

interface ProgressChartProps {
  activity: StudyActivity[];
}

export function ProgressChart({ activity }: ProgressChartProps) {
  const chartData = useMemo(() => {
    // Get last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    return last7Days.map((date) => {
      const dayActivity = activity.find((a) => a.date === date);
      return {
        date: new Date(date).toLocaleDateString("en-US", {
          weekday: "short",
          month: "numeric",
          day: "numeric",
        }),
        score: dayActivity?.score || 0,
        studyTime: dayActivity?.studyTime || 0,
      };
    });
  }, [activity]);

  return (
    <div className="w-full h-80">
      {chartData.every((d) => d.score === 0 && d.studyTime === 0) ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <p className="mb-2">No activity yet</p>
            <p className="text-sm">Complete study sessions to see your progress!</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
            />
            <Legend />
            <Bar
              dataKey="score"
              fill="hsl(var(--primary))"
              name="Score"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="studyTime"
              fill="hsl(var(--muted))"
              name="Study Time (min)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
