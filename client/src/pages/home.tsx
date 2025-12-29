import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, HandHeart, Lightbulb, ArrowRight, Users, Clock, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { DashboardStats } from "@shared/schema";
import { ThemeToggle } from "@/components/theme-toggle";

function StatCard({ icon: Icon, value, label, color }: { 
  icon: typeof Users; 
  value: number | string; 
  label: string; 
  color: string;
}) {
  return (
    <Card className="hover-elevate">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-md ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-3xl font-bold" data-testid={`stat-value-${label.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionCard({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  bgColor,
  href,
  testId
}: { 
  title: string; 
  description: string; 
  icon: typeof AlertTriangle; 
  color: string;
  bgColor: string;
  href: string;
  testId: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full hover-elevate active-elevate-2 cursor-pointer group" data-testid={testId}>
        <CardContent className="p-8 flex flex-col h-full">
          <div className={`w-16 h-16 rounded-md ${bgColor} flex items-center justify-center mb-6`}>
            <Icon className={`h-8 w-8 ${color}`} />
          </div>
          <h3 className="text-xl font-semibold mb-3">{title}</h3>
          <p className="text-muted-foreground flex-1 mb-6">{description}</p>
          <div className="flex items-center gap-2 text-primary font-medium">
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Home() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  return (
    <div className="min-h-screen pt-16">
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-chart-2/10 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Your Voice Matters
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join your community in making positive change. Report issues, offer help, 
            or share ideas to improve our city together.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="px-8" data-testid="button-view-dashboard">
              View Community Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {stats && (
        <section className="py-12 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                icon={Users} 
                value={stats.totalParticipants} 
                label="Participants" 
                color="bg-primary/10 text-primary"
              />
              <StatCard 
                icon={Clock} 
                value={`${stats.totalHoursOffered}h`} 
                label="Hours Offered" 
                color="bg-chart-2/10 text-chart-2"
              />
              <StatCard 
                icon={TrendingUp} 
                value={`~${stats.estimatedCitizenHours}h`} 
                label="Est. Citizen Hours" 
                color="bg-chart-3/10 text-chart-3"
              />
            </div>
          </div>
        </section>
      )}

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How Can You Help?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Choose how you'd like to participate in your community today
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ActionCard
              title="Report a Problem"
              description="Need help or want to report an issue in your community? Let us know what needs attention."
              icon={AlertTriangle}
              color="text-emerald-600 dark:text-emerald-400"
              bgColor="bg-emerald-100 dark:bg-emerald-900/30"
              href="/submit?category=need"
              testId="card-report-problem"
            />
            <ActionCard
              title="Offer Your Help"
              description="Have time to volunteer? Your skills and time can make a real difference in someone's life."
              icon={HandHeart}
              color="text-blue-600 dark:text-blue-400"
              bgColor="bg-blue-100 dark:bg-blue-900/30"
              href="/submit?category=offer"
              testId="card-offer-help"
            />
            <ActionCard
              title="Share an Idea"
              description="Got a brilliant idea to improve our city? We want to hear your creative solutions."
              icon={Lightbulb}
              color="text-amber-600 dark:text-amber-400"
              bgColor="bg-amber-100 dark:bg-amber-900/30"
              href="/submit?category=idea"
              testId="card-share-idea"
            />
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>CitizenVoice - Empowering communities to create positive change together</p>
        </div>
      </footer>
    </div>
  );
}
