import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/feature-card";
import { StepCard } from "@/components/step-card";
import { Brain, CheckCircle, Calendar, TrendingUp, Zap } from "lucide-react";

export default async function HomePage() {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If authenticated, redirect to dashboard
  if (session) {
    redirect("/today");
  }

  // Otherwise, show landing page
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Brain className="size-7 text-primary" />
            <span>RecallForge</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Master LeetCode with{" "}
              <span className="text-primary">Spaced Repetition</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Never forget a coding pattern again. RecallForge uses science-backed
              spaced repetition to help you retain algorithm patterns and ace
              your coding interviews.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/sign-up">
                <Zap className="size-5 mr-2" />
                Start for Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-32 scroll-mt-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Built for Interview Success
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Track problems by pattern, get reminded at optimal intervals, and
              build lasting mastery of algorithms.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={Calendar}
              title="Smart Scheduling"
              description="Problems are scheduled for review at 3, 10, and 30-day intervals based on your performance."
            />
            <FeatureCard
              icon={CheckCircle}
              title="Pattern Recognition"
              description="Organize problems by 25+ canonical patterns like Two Pointers, Sliding Window, and more."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Progress Tracking"
              description="Monitor your mastery across different patterns and identify areas needing attention."
            />
          </div>
        </section>

        {/* How It Works */}
        <section className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <StepCard
              step={1}
              title="Add Problems"
              description="Save LeetCode problems you want to master."
            />
            <StepCard
              step={2}
              title="Get Reminded"
              description="Receive daily emails when problems are due."
            />
            <StepCard
              step={3}
              title="Practice & Mark"
              description="Solve problems and mark as solved or failed."
            />
            <StepCard
              step={4}
              title="Build Mastery"
              description="Progress through stages until mastered."
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-32 text-center">
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-12 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Never Forget a Pattern?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join RecallForge and start building lasting mastery of coding
              patterns today.
            </p>
            <Button size="lg" asChild>
              <Link href="/sign-up">Create Free Account</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-20 border-t">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Brain className="size-5" />
            <span className="font-medium">RecallForge</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with spaced repetition science for interview success.
          </p>
        </div>
      </footer>
    </div>
  );
}
