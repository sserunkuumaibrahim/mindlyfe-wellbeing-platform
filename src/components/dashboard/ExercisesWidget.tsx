
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ExercisesWidget({ exercises }: { exercises: any[] }) {
  return (
    <Card className="rounded-3xl glass-morphism p-6 animate-fade-in xl:col-span-2">
      <div className="font-semibold text-lg mb-2">My exercises</div>
      <div className="text-muted-foreground text-sm mb-4">Exercises to help maintain good physical health and support the progress of therapy</div>
      <div className="space-y-4">
        {exercises.map((ex, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl bg-white/60 px-4 py-3 shadow-sm hover:scale-101">
            <span className="text-2xl">{ex.icon}</span>
            <div className="flex-1">
              <div className="font-medium">{ex.label}</div>
              <Progress value={ex.progress} className="h-2 mt-1 w-32 rounded bg-muted" />
            </div>
            <div className="text-sm text-muted-foreground">{ex.duration}</div>
            <div className="text-sm">{ex.category}</div>
            <div className="flex items-center gap-3 text-sm ml-4">
              <span>✅ {ex.actions.completed}</span>
              <span>💬 {ex.actions.comments}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
