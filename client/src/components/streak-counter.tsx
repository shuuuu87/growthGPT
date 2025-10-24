import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface StreakCounterProps {
  streak: number;
}

export function StreakCounter({ streak }: StreakCounterProps) {
  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-primary/10 border-orange-500/20">
      <CardContent className="p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Flame className="w-12 h-12 text-orange-500" />
          <div className="text-6xl font-extrabold" data-testid="text-streak">
            {streak}
          </div>
        </div>
        <p className="text-lg text-muted-foreground font-medium">
          {streak === 1 ? "day streak" : "day streak"}
        </p>
        {streak === 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Complete a study session to start your streak!
          </p>
        )}
        {streak > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Keep it up! Study daily to maintain your streak 🔥
          </p>
        )}
      </CardContent>
    </Card>
  );
}
