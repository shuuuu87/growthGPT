import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Lock, Trophy, Target, Zap, TrendingUp, Users, Clock, Star, Sparkles } from "lucide-react";
import type { AchievementWithProgress } from "@shared/schema";

const rarityColors = {
  common: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
  uncommon: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
  rare: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
  epic: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
  legendary: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
};

const categoryIcons: Record<string, any> = {
  milestone: Target,
  accuracy: Trophy,
  streak: Zap,
  volume: TrendingUp,
  improvement: Star,
  leaderboard: Users,
  speed: Clock,
  special: Sparkles,
  fun: Star,
};

export default function Achievements() {
  const { data: achievements = [], isLoading } = useQuery<AchievementWithProgress[]>({
    queryKey: ["/api/achievements/me"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  const rarityStats = {
    common: achievements.filter((a) => a.rarity === "common" && a.unlocked).length,
    uncommon: achievements.filter((a) => a.rarity === "uncommon" && a.unlocked).length,
    rare: achievements.filter((a) => a.rarity === "rare" && a.unlocked).length,
    epic: achievements.filter((a) => a.rarity === "epic" && a.unlocked).length,
    legendary: achievements.filter((a) => a.rarity === "legendary" && a.unlocked).length,
  };

  const categories = [
    "all",
    "milestone",
    "accuracy",
    "streak",
    "volume",
    "improvement",
    "leaderboard",
    "speed",
    "special",
    "fun",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
                Achievements
              </h1>
              <p className="text-muted-foreground mt-2">
                Track your progress and unlock rewards
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary" data-testid="text-achievement-count">
                {unlockedCount}/{totalCount}
              </div>
              <div className="text-sm text-muted-foreground">Unlocked</div>
            </div>
          </div>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2">
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
              <CardDescription>
                {completionPercentage}% Complete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={completionPercentage} className="h-3" data-testid="progress-overall" />
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <Badge className={rarityColors.common}>Common</Badge>
                  <div className="text-2xl font-bold mt-2" data-testid="text-common-count">{rarityStats.common}</div>
                </div>
                <div className="text-center">
                  <Badge className={rarityColors.uncommon}>Uncommon</Badge>
                  <div className="text-2xl font-bold mt-2" data-testid="text-uncommon-count">{rarityStats.uncommon}</div>
                </div>
                <div className="text-center">
                  <Badge className={rarityColors.rare}>Rare</Badge>
                  <div className="text-2xl font-bold mt-2" data-testid="text-rare-count">{rarityStats.rare}</div>
                </div>
                <div className="text-center">
                  <Badge className={rarityColors.epic}>Epic</Badge>
                  <div className="text-2xl font-bold mt-2" data-testid="text-epic-count">{rarityStats.epic}</div>
                </div>
                <div className="text-center">
                  <Badge className={rarityColors.legendary}>Legendary</Badge>
                  <div className="text-2xl font-bold mt-2" data-testid="text-legendary-count">{rarityStats.legendary}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-white/80 dark:bg-gray-800/80 p-2">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="capitalize"
                data-testid={`tab-${cat}`}
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements
                  .filter((a) => category === "all" || a.category === category)
                  .sort((a, b) => {
                    if (a.unlocked && !b.unlocked) return -1;
                    if (!a.unlocked && b.unlocked) return 1;
                    const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
                    return rarityOrder[a.rarity as keyof typeof rarityOrder] - rarityOrder[b.rarity as keyof typeof rarityOrder];
                  })
                  .map((achievement) => {
                    const Icon = categoryIcons[achievement.category] || Trophy;
                    return (
                      <Card
                        key={achievement.id}
                        className={`relative overflow-hidden transition-all hover:scale-105 ${
                          achievement.unlocked
                            ? "bg-white dark:bg-gray-800 border-2 shadow-lg"
                            : "bg-gray-100 dark:bg-gray-900 opacity-60"
                        }`}
                        data-testid={`card-achievement-${achievement.id}`}
                      >
                        {achievement.unlocked && (
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-bl-full" />
                        )}
                        
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`text-4xl ${achievement.unlocked ? "" : "grayscale"}`}>
                                  {achievement.icon}
                                </div>
                                {!achievement.unlocked && (
                                  <Lock className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <CardTitle className="text-lg" data-testid={`text-achievement-name-${achievement.id}`}>
                                {achievement.name}
                              </CardTitle>
                              <CardDescription className="text-sm mt-1">
                                {achievement.description}
                              </CardDescription>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-3">
                            <Badge className={rarityColors[achievement.rarity as keyof typeof rarityColors]}>
                              {achievement.rarity}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              <Icon className="w-3 h-3 mr-1" />
                              {achievement.category}
                            </Badge>
                          </div>
                        </CardHeader>

                        {achievement.unlocked && achievement.unlockedAt && (
                          <CardContent>
                            <div className="text-xs text-muted-foreground">
                              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </div>
                          </CardContent>
                        )}

                        {!achievement.unlocked && achievement.progress !== undefined && achievement.total !== undefined && (
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Progress</span>
                                <span>{achievement.progress}/{achievement.total}</span>
                              </div>
                              <Progress 
                                value={(achievement.progress / achievement.total) * 100} 
                                className="h-2"
                              />
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
