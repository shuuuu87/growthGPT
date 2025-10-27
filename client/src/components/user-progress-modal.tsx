import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy } from "lucide-react";
import { ProgressChart } from "./progress-chart";
import type { StudyActivity, User, AchievementWithProgress } from "@shared/schema";

interface UserProgressModalProps {
  userId: string;
  onClose: () => void;
}

export function UserProgressModal({ userId, onClose }: UserProgressModalProps) {
  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/users", userId],
  });

  // Fetch user's 7-day activity
  const { data: activity = [], isLoading: activityLoading } = useQuery<StudyActivity[]>({
    queryKey: ["/api/activity", userId],
  });

  // Fetch user's achievements
  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<AchievementWithProgress[]>({
    queryKey: ["/api/achievements/user", userId],
  });

  const getDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) return user.firstName;
    return "Student";
  };

  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) return user.firstName[0].toUpperCase();
    return "S";
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500";
      case "uncommon":
        return "bg-green-500";
      case "rare":
        return "bg-blue-500";
      case "epic":
        return "bg-purple-500";
      case "legendary":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-user-progress">
        {userLoading || activityLoading || achievementsLoading ? (
          <>
            <DialogHeader>
              <DialogTitle>Loading Progress...</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </>
        ) : user ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
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
                <span>{getDisplayName(user)}'s Progress</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div>
                <h3 className="font-semibold mb-4">7-Day Activity</h3>
                <ProgressChart activity={activity} />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold">
                    Achievements ({unlockedAchievements.length})
                  </h3>
                </div>
                {unlockedAchievements.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {unlockedAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="p-3 border rounded-lg bg-card hover-elevate transition-all"
                        data-testid={`achievement-${achievement.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{achievement.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm truncate">
                                {achievement.name}
                              </h4>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${getRarityColor(achievement.rarity)} text-white`}
                              >
                                {achievement.rarity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {achievement.description}
                            </p>
                            {achievement.unlockedAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No achievements unlocked yet
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>User Not Found</DialogTitle>
            </DialogHeader>
            <div className="py-8 text-center text-muted-foreground">
              User not found
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
