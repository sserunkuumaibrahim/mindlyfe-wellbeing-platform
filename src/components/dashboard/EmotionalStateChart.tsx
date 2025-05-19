
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  Bar,
  Tooltip,
} from "recharts";

interface Props {
  emotionalData: { name: string; value: number }[];
}

export default function EmotionalStateChart({ emotionalData }: Props) {
  return (
    <Card className="rounded-3xl glass-morphism p-6 xl:col-span-2 animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <div className="font-bold">Emotional State</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl">
            Week
          </Button>
          <Button variant="ghost" size="sm" className="rounded-xl">
            Month
          </Button>
          <Button variant="ghost" size="sm" className="rounded-xl">
            Year
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground text-sm mb-2">
        Based on data collected during sessions with a therapist, self-tests and feedback
      </p>
      <div className="w-full h-[180px]">
        <ChartContainer
          config={{
            mood: { label: "Mood", color: "#21A9E1" }
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emotionalData}>
              <XAxis dataKey="name" />
              <Bar dataKey="value" fill="#21A9E1" radius={[8, 8, 0, 0]} />
              <Tooltip content={<ChartTooltip />} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  );
}
