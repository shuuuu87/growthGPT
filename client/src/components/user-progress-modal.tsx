import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { ProgressChart } from "./progress-chart";
import type { StudyActivity, User } from "@shared/schema";

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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl" data-testid="dialog-user-progress">
        {userLoading || activityLoading ? (
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

            <div className="py-4">
              <h3 className="font-semibold mb-4">7-Day Activity</h3>
              <ProgressChart activity={activity} />
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
