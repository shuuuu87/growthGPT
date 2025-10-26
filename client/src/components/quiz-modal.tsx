import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Trophy, Target } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizModalProps {
  sessionId: string;
  onClose: () => void;
}

export function QuizModal({ sessionId, onClose }: QuizModalProps) {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState<{ score: number; total: number } | null>(null);

  // Fetch quiz questions
  const { data: quizData, isLoading } = useQuery<{ questions: Question[] }>({
    queryKey: ["/api/quiz", sessionId],
    retry: false,
  });

  // Submit quiz mutation
  const submitMutation = useMutation({
    mutationFn: async (answers: Record<number, number>) => {
      const result = await apiRequest("POST", `/api/quiz/${sessionId}/submit`, {
        answers,
      });
      return result;
    },
    onSuccess: (data: any) => {
      const score = Number(data.score) || 0;
      const total = Number(data.totalQuestions) || 1;
      setQuizScore({ score, total });
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/streak"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
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
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  const handleNext = () => {
    if (quizData && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    submitMutation.mutate(selectedAnswers);
  };

  const getEncouragingMessage = (percentage: number) => {
    if (percentage === 100) return "Perfect score! Outstanding! 🎉";
    if (percentage >= 80) return "Excellent work! Keep it up! 🌟";
    if (percentage >= 60) return "Good job! You're making progress! 👏";
    if (percentage >= 40) return "Nice try! Review and try again! 💪";
    return "Keep learning! Every attempt makes you better! 📚";
  };

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl" data-testid="dialog-quiz">
          <DialogHeader>
            <DialogTitle>Generating Quiz</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Generating your quiz...</p>
            <p className="text-sm text-muted-foreground">AI is creating personalized questions</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent data-testid="dialog-quiz-error">
          <DialogHeader>
            <DialogTitle>Quiz Generation Failed</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-muted-foreground mb-4">
              We couldn't generate questions for this topic. Please try again.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const totalQuestions = quizData.questions.length;
  const allAnswered = Object.keys(selectedAnswers).length === totalQuestions;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="dialog-quiz">
        {showResults && quizScore ? (
          // Results View
          <>
            <DialogHeader>
              <DialogTitle>Quiz Complete!</DialogTitle>
            </DialogHeader>
            <div className="py-8 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              <div className="text-6xl font-extrabold text-primary my-6" data-testid="text-quiz-score">
                {quizScore.total > 0 ? Math.round((quizScore.score / quizScore.total) * 100) : 0}%
              </div>
              <p className="text-lg mb-2">
                {quizScore.score} out of {quizScore.total} correct
              </p>
              <p className="text-muted-foreground mb-8">
                {getEncouragingMessage(quizScore.total > 0 ? (quizScore.score / quizScore.total) * 100 : 0)}
              </p>
              <Button onClick={onClose} size="lg" data-testid="button-close-results">
                Continue
              </Button>
            </div>
          </>
        ) : (
          // Quiz View
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                <div className="flex gap-1">
                  {Array.from({ length: totalQuestions }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        idx in selectedAnswers
                          ? "bg-primary"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="py-6">
              <h3 className="text-xl font-semibold mb-6" data-testid="text-question">
                {currentQuestion.question}
              </h3>

              <RadioGroup
                value={selectedAnswers[currentQuestionIndex]?.toString()}
                onValueChange={(value) =>
                  handleAnswerSelect(currentQuestionIndex, parseInt(value))
                }
              >
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedAnswers[currentQuestionIndex] === idx
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-primary/5"
                      }`}
                      onClick={() => handleAnswerSelect(currentQuestionIndex, idx)}
                      data-testid={`option-${idx}`}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                        <Label
                          htmlFor={`option-${idx}`}
                          className="flex-1 cursor-pointer text-base"
                        >
                          {option}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex-1"
                data-testid="button-previous"
              >
                Previous
              </Button>
              {currentQuestionIndex < totalQuestions - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!(currentQuestionIndex in selectedAnswers)}
                  className="flex-1"
                  data-testid="button-next"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!allAnswered || submitMutation.isPending}
                  className="flex-1"
                  data-testid="button-submit-quiz"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Quiz"}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
