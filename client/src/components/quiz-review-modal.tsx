import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface DetailedResult {
  question: string;
  options: string[];
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
}

interface QuizReviewModalProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function QuizReviewModal({ sessionId, isOpen, onClose }: QuizReviewModalProps) {
  const { data, isLoading } = useQuery<{
    score: number;
    totalQuestions: number;
    percentage: number;
    detailedResults: DetailedResult[];
  }>({
    queryKey: ['/api/quiz', sessionId, 'results'],
    enabled: isOpen && !!sessionId,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Quiz Review
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : data ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Your Score</div>
                  <div className="text-2xl font-bold">
                    {data.score}/{data.totalQuestions}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Percentage</div>
                  <div className="text-2xl font-bold text-primary">{data.percentage}%</div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-6" data-testid="quiz-review-content">
              {data.detailedResults.map((result, idx) => (
                <div
                  key={idx}
                  className={`border-2 rounded-lg p-4 ${
                    result.isCorrect
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : "border-red-500 bg-red-50 dark:bg-red-950/20"
                  }`}
                  data-testid={`review-question-${idx}`}
                >
                  <div className="flex items-start gap-2 mb-3">
                    {result.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                        Question {idx + 1}: {result.question}
                      </h4>

                      <div className="space-y-2 mb-3">
                        {result.options.map((option, optIdx) => {
                          const isUserAnswer = optIdx === result.userAnswer;
                          const isCorrectAnswer = optIdx === result.correctAnswer;

                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-md text-sm ${
                                isCorrectAnswer
                                  ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-gray-900 dark:text-gray-100"
                                  : isUserAnswer
                                  ? "bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-gray-900 dark:text-gray-100"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                              }`}
                              data-testid={`review-option-${idx}-${optIdx}`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{option}</span>
                                {isCorrectAnswer && (
                                  <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                                    ✓ Correct Answer
                                  </span>
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                                    ✗ Your Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-3 rounded">
                        <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                          EXPLANATION
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {result.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={onClose} className="flex-1" data-testid="button-close-review">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No quiz results found for this session.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
