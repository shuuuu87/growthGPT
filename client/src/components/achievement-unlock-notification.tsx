import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import type { Achievement } from "@shared/schema";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AchievementUnlockNotificationProps {
  achievementIds: string[];
  onClose: () => void;
}

const rarityColors = {
  common: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300",
  uncommon: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-400",
  rare: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-400",
  epic: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-400",
  legendary: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-500",
};

export function AchievementUnlockNotification({
  achievementIds,
  onClose,
}: AchievementUnlockNotificationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const { data: allAchievements = [] } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const achievements = achievementIds
    .map((id) => allAchievements.find((a) => a.id === id))
    .filter((a): a is Achievement => !!a);

  useEffect(() => {
    if (achievements.length === 0) return;

    setIsVisible(true);

    const rarityConfetti: Record<string, any> = {
      common: {
        particleCount: 50,
        spread: 60,
        colors: ["#9CA3AF", "#D1D5DB"],
      },
      uncommon: {
        particleCount: 75,
        spread: 70,
        colors: ["#10B981", "#34D399"],
      },
      rare: {
        particleCount: 100,
        spread: 80,
        colors: ["#3B82F6", "#60A5FA"],
      },
      epic: {
        particleCount: 150,
        spread: 90,
        colors: ["#8B5CF6", "#A78BFA"],
      },
      legendary: {
        particleCount: 200,
        spread: 100,
        colors: ["#FCD34D", "#FBBF24", "#F59E0B"],
        shapes: ["star"],
      },
    };

    const achievement = achievements[currentIndex];
    if (achievement) {
      const confettiConfig = rarityConfetti[achievement.rarity] || rarityConfetti.common;

      confetti({
        ...confettiConfig,
        origin: { y: 0.6 },
      });

      if (achievement.rarity === "legendary") {
        setTimeout(() => {
          confetti({
            ...confettiConfig,
            origin: { x: 0.2, y: 0.6 },
          });
        }, 200);
        setTimeout(() => {
          confetti({
            ...confettiConfig,
            origin: { x: 0.8, y: 0.6 },
          });
        }, 400);
      }
    }
  }, [currentIndex, achievements]);

  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }
  };

  if (achievements.length === 0 || !isVisible) return null;

  const achievement = achievements[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <Card
        className={`w-full max-w-md mx-4 animate-in zoom-in slide-in-from-bottom-4 border-4 ${
          rarityColors[achievement.rarity as keyof typeof rarityColors]
        }`}
        data-testid="card-achievement-unlock"
      >
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            data-testid="button-close-achievement"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="text-center space-y-2">
            <div className="text-6xl animate-bounce">{achievement.icon}</div>
            <Badge
              className={`${rarityColors[achievement.rarity as keyof typeof rarityColors]} text-base px-4 py-1`}
            >
              {achievement.rarity.toUpperCase()}
            </Badge>
            <CardTitle className="text-2xl text-gray-900 dark:text-white">
              Achievement Unlocked!
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2" data-testid="text-achievement-title">
              {achievement.name}
            </h3>
            <p className="text-muted-foreground">{achievement.description}</p>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleNext}
              className="w-full"
              data-testid="button-next-achievement"
            >
              {currentIndex < achievements.length - 1
                ? `Next (${currentIndex + 1}/${achievements.length})`
                : "Awesome!"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
