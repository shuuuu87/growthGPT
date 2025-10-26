import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Flame, Calendar as CalendarIcon, TrendingUp } from "lucide-react";
import type { StudySessionWithScore, QuizResult, Goal, StudyActivity } from "@shared/schema";
import { AddSessionDialog } from "@/components/add-session-dialog";
import { SessionList } from "@/components/session-list";
import { ProgressChart } from "@/components/progress-chart";
import { StreakCounter } from "@/components/streak-counter";
import { GoalCalendar } from "@/components/goal-calendar";
import { QuizModal } from "@/components/quiz-modal";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [addSessionOpen, setAddSessionOpen] = useState(false);
  const [quizSessionId, setQuizSessionId] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  // Fetch study sessions
  const { data: sessions = [] } = useQuery<StudySessionWithScore[]>({
    queryKey: ["/api/sessions"],
    enabled: isAuthenticated,
  });

  // Fetch 7-day activity
  const { data: activity = [] } = useQuery<StudyActivity[]>({
    queryKey: ["/api/activity/me"],
    enabled: isAuthenticated,
  });

  // Fetch goals
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
    enabled: isAuthenticated,
  });

  // Fetch streak
  const { data: streakData } = useQuery<{ streak: number }>({
    queryKey: ["/api/streak"],
    enabled: isAuthenticated,
  });

  const handleCompleteSession = (sessionId: string) => {
    setQuizSessionId(sessionId);
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Study Sessions Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
                <CardTitle className="text-2xl font-bold">Study Sessions</CardTitle>
                <Button
                  onClick={() => setAddSessionOpen(true)}
                  data-testid="button-add-session"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Session
                </Button>
              </CardHeader>
              <CardContent>
                <SessionList
                  sessions={sessions}
                  onCompleteSession={handleCompleteSession}
                />
              </CardContent>
            </Card>

            {/* Progress Chart Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  7-Day Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressChart activity={activity} />
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Streak Counter */}
            <StreakCounter streak={streakData?.streak || 0} />

            {/* Goal Calendar */}
            <GoalCalendar goals={goals} />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AddSessionDialog
        open={addSessionOpen}
        onOpenChange={setAddSessionOpen}
      />

      {quizSessionId && (
        <QuizModal
          sessionId={quizSessionId}
          onClose={() => setQuizSessionId(null)}
        />
      )}
    </div>
  );
}
