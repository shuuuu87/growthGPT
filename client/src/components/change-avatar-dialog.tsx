import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { defaultAvatars } from "@shared/avatars";
import { Check } from "lucide-react";
import type { User } from "@shared/schema";

interface ChangeAvatarDialogProps {
  open: boolean;
  onClose: () => void;
  currentUser: User;
}

export function ChangeAvatarDialog({ open, onClose, currentUser }: ChangeAvatarDialogProps) {
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.profileImageUrl || defaultAvatars[0]);

  const updateAvatarMutation = useMutation({
    mutationFn: async (avatarUrl: string) => {
      const res = await apiRequest("PATCH", "/api/user/avatar", { profileImageUrl: avatarUrl });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success!",
        description: "Your profile image has been updated.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile image",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateAvatarMutation.mutate(selectedAvatar);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="dialog-change-avatar">
        <DialogHeader>
          <DialogTitle>Change Profile Image</DialogTitle>
          <DialogDescription>
            Select an avatar from the options below
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4">
          {defaultAvatars.map((avatarUrl, index) => (
            <button
              key={index}
              onClick={() => setSelectedAvatar(avatarUrl)}
              className={`relative p-2 rounded-lg border-2 transition-all hover:border-primary/50 ${
                selectedAvatar === avatarUrl
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
              data-testid={`avatar-option-${index}`}
            >
              <Avatar className="w-full h-auto aspect-square">
                <AvatarImage
                  src={avatarUrl}
                  alt={`Avatar ${index + 1}`}
                  className="object-cover"
                />
                <AvatarFallback>A{index + 1}</AvatarFallback>
              </Avatar>
              {selectedAvatar === avatarUrl && (
                <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={updateAvatarMutation.isPending}
            data-testid="button-cancel-avatar"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateAvatarMutation.isPending}
            data-testid="button-save-avatar"
          >
            {updateAvatarMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
