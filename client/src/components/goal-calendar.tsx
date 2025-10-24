import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Plus, Check } from "lucide-react";
import type { Goal } from "@shared/schema";
import confetti from "canvas-confetti";

interface GoalCalendarProps {
  goals: Goal[];
}

export function GoalCalendar({ goals }: GoalCalendarProps) {
  const { toast } = useToast();
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalType, setNewGoalType] = useState<"daily" | "weekly">("daily");

  const createGoalMutation = useMutation({
    mutationFn: async (data: { title: string; type: string; targetDate: string }) => {
      await apiRequest("POST", "/api/goals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal Created!",
        description: "Your study goal has been added.",
      });
      setNewGoalTitle("");
      setShowAddGoal(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const completeGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      await apiRequest("PATCH", `/api/goals/${goalId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast({
        title: "🎉 Goal Completed!",
        description: "Amazing work! Keep up the great progress!",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to complete goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a goal title.",
        variant: "destructive",
      });
      return;
    }

    const targetDate = new Date();
    if (newGoalType === "weekly") {
      targetDate.setDate(targetDate.getDate() + 7);
    }

    createGoalMutation.mutate({
      title: newGoalTitle,
      type: newGoalType,
      targetDate: targetDate.toISOString().split("T")[0],
    });
  };

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Goals
        </CardTitle>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowAddGoal(!showAddGoal)}
          data-testid="button-toggle-add-goal"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddGoal && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <Input
              placeholder="Goal title..."
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              data-testid="input-goal-title"
            />
            <Select value={newGoalType} onValueChange={(v: any) => setNewGoalType(v)}>
              <SelectTrigger data-testid="select-goal-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Goal</SelectItem>
                <SelectItem value="weekly">Weekly Goal</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddGoal}
              disabled={createGoalMutation.isPending}
              className="w-full"
              data-testid="button-create-goal"
            >
              {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
            </Button>
          </div>
        )}

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="space-y-2">
            {activeGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover-elevate transition-all duration-200"
                data-testid={`goal-${goal.id}`}
              >
                <Button
                  size="icon"
                  variant="outline"
                  className="shrink-0 w-8 h-8"
                  onClick={() => completeGoalMutation.mutate(goal.id)}
                  disabled={completeGoalMutation.isPending}
                  data-testid="button-complete-goal"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{goal.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {goal.type === "daily" ? "Daily" : "Weekly"} •{" "}
                    {new Date(goal.targetDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              Completed
            </p>
            {completedGoals.slice(0, 3).map((goal) => (
              <div
                key={goal.id}
                className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30 opacity-60"
              >
                <div className="shrink-0 w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-through">{goal.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Completed {goal.completedAt && new Date(goal.completedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeGoals.length === 0 && completedGoals.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No goals yet</p>
            <p className="text-xs mt-1">Set daily or weekly study goals!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
