import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Flame, Medal } from "lucide-react";
import { UserProgressModal } from "@/components/user-progress-modal";

interface LeaderboardUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  totalScore: number;
  streak: number;
}

export default function Leaderboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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

  // Fetch leaderboard data
  const { data: leaderboard = [] } = useQuery<LeaderboardUser[]>({
    queryKey: ["/api/leaderboard"],
    enabled: isAuthenticated,
  });

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Medal className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getDisplayName = (user: LeaderboardUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    return "Student";
  };

  const getInitials = (user: LeaderboardUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) return user.firstName[0].toUpperCase();
    return "S";
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            Competition Leaderboard
          </div>
          <h1 className="text-4xl font-bold mb-2">Top Students</h1>
          <p className="text-muted-foreground">
            See where you stand among your peers
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No students on the leaderboard yet. Be the first to study!
              </div>
            ) : (
              <div className="divide-y">
                {leaderboard.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-4 hover-elevate cursor-pointer transition-all duration-200"
                    onClick={() => setSelectedUserId(user.id)}
                    data-testid={`leaderboard-user-${index}`}
                  >
                    {/* Rank */}
                    <div className="w-12 flex items-center justify-center">
                      {getMedalIcon(index + 1) || (
                        <span className="text-lg font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Avatar and Name */}
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={user.profileImageUrl || undefined}
                          alt={getDisplayName(user)}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-lg" data-testid={`text-username-${index}`}>
                        {getDisplayName(user)}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Score</div>
                        <div className="text-2xl font-bold text-primary" data-testid={`text-score-${index}`}>
                          {user.totalScore}
                        </div>
                      </div>

                      {/* Streak */}
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="text-xl font-bold" data-testid={`text-streak-${index}`}>
                          {user.streak}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Progress Modal */}
      {selectedUserId && (
        <UserProgressModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}
