import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Trophy, Target, Zap, TrendingUp, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            AI-Powered Study Companion
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Transform Your Study Journey with{" "}
            <span className="text-primary">Growth GPT</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Track your progress, compete with peers, and master any topic with AI-generated quizzes. 
            Your personal study companion that grows with you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => window.location.href = "/auth"}
              data-testid="button-get-started"
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 hover-elevate transition-all duration-200">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Generated Quizzes</h3>
            <p className="text-muted-foreground">
              Get personalized MCQ questions based on your study topics. Master concepts through active recall.
            </p>
          </Card>

          <Card className="p-6 hover-elevate transition-all duration-200">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Your Progress</h3>
            <p className="text-muted-foreground">
              Visualize your study time and scores with beautiful charts. See your growth over the last 7 days.
            </p>
          </Card>

          <Card className="p-6 hover-elevate transition-all duration-200">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Set & Achieve Goals</h3>
            <p className="text-muted-foreground">
              Create daily and weekly study goals. Celebrate milestones with satisfying animations.
            </p>
          </Card>

          <Card className="p-6 hover-elevate transition-all duration-200">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Build Study Streaks</h3>
            <p className="text-muted-foreground">
              Maintain consistency with streak tracking. Every day counts toward your success.
            </p>
          </Card>

          <Card className="p-6 hover-elevate transition-all duration-200">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Compete & Excel</h3>
            <p className="text-muted-foreground">
              See where you stand on the leaderboard. Friendly competition drives excellence.
            </p>
          </Card>

          <Card className="p-6 hover-elevate transition-all duration-200">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Community Growth</h3>
            <p className="text-muted-foreground">
              View other students' progress and get inspired. We grow together.
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <Card className="p-12 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Growth Journey?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join students worldwide who are achieving their learning goals with Growth GPT.
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => window.location.href = "/auth"}
              data-testid="button-cta-start"
            >
              Start Learning Now
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
