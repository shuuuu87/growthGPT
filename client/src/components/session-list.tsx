import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, CheckCircle2, Award } from "lucide-react";
import type { StudySessionWithScore } from "@shared/schema";

interface SessionListProps {
  sessions: StudySessionWithScore[];
  onCompleteSession: (sessionId: string) => void;
}

export function SessionList({ sessions, onCompleteSession }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Study Sessions Yet</h3>
        <p className="text-muted-foreground mb-4">
          Start your learning journey by creating your first study session!
        </p>
      </div>
    );
  }

  const activeSessions = sessions.filter((s) => !s.completed);
  const completedSessions = sessions.filter((s) => s.completed);

  return (
    <div className="space-y-6">
      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Active Sessions
          </h3>
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="p-4 border rounded-lg hover-elevate transition-all duration-200"
              data-testid={`session-${session.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-lg" data-testid="text-topic">
                      {session.topic}
                    </h4>
                    <Badge variant="secondary" data-testid="badge-subject">
                      {session.subject}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{session.estimatedTime} min</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => onCompleteSession(session.id)}
                  data-testid="button-mark-complete"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Sessions */}
      {completedSessions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Completed Sessions
          </h3>
          {completedSessions.map((session) => (
            <div
              key={session.id}
              className="p-4 border rounded-lg bg-muted/30"
              data-testid={`session-completed-${session.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-lg text-muted-foreground">
                      {session.topic}
                    </h4>
                    <Badge variant="secondary">{session.subject}</Badge>
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div>
                      {session.completedAt &&
                        new Date(session.completedAt).toLocaleDateString()}
                    </div>
                    {session.score !== undefined && session.totalQuestions !== undefined && (
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span data-testid={`score-${session.id}`}>
                          Score: {session.score}/{session.totalQuestions} ({Math.round((session.score / session.totalQuestions) * 100)}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
