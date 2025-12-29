import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertTriangle, 
  HandHeart, 
  Lightbulb, 
  Plus, 
  Users, 
  Clock, 
  TrendingUp,
  ArrowLeft,
  Mail,
  MapPin,
  MoreVertical,
  CheckCircle2,
  Link2,
  PlayCircle,
  XCircle,
  Loader2
} from "lucide-react";
import type { Submission, DashboardStats, SubmissionCategory, SubmissionStatus, MatchSuggestion } from "@shared/schema";
import { neighborhoods, submissionStatuses } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/theme-toggle";

const categoryConfig: Record<SubmissionCategory, {
  label: string;
  icon: typeof AlertTriangle;
  color: string;
  bgColor: string;
  badgeVariant: "default" | "secondary" | "outline";
}> = {
  need: {
    label: "Need Help",
    icon: AlertTriangle,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    badgeVariant: "default",
  },
  offer: {
    label: "Offering Help",
    icon: HandHeart,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    badgeVariant: "secondary",
  },
  idea: {
    label: "Idea",
    icon: Lightbulb,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    badgeVariant: "outline",
  },
};

const statusConfig: Record<SubmissionStatus, {
  label: string;
  icon: typeof CheckCircle2;
  color: string;
}> = {
  open: { label: "Open", icon: PlayCircle, color: "text-blue-500" },
  in_progress: { label: "In Progress", icon: Clock, color: "text-amber-500" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "text-emerald-500" },
  matched: { label: "Matched", icon: Link2, color: "text-purple-500" },
};

function StatCard({ icon: Icon, value, label, color }: { 
  icon: typeof Users; 
  value: number | string; 
  label: string; 
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-md ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold" data-testid={`dashboard-stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SubmissionCard({ submission, onStatusChange }: { 
  submission: Submission; 
  onStatusChange: (id: string, status: SubmissionStatus) => void;
}) {
  const config = categoryConfig[submission.category];
  const Icon = config.icon;
  const statusInfo = statusConfig[submission.status];
  const StatusIcon = statusInfo.icon;
  const createdAt = new Date(submission.createdAt);
  
  return (
    <Card className="hover-elevate" data-testid={`submission-card-${submission.id}`}>
      <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`p-1.5 rounded-md ${config.bgColor}`}>
            <Icon className={`h-4 w-4 ${config.color}`} />
          </div>
          <Badge variant={config.badgeVariant} className="text-xs">
            {config.label}
          </Badge>
          <Badge variant="outline" className={`text-xs ${statusInfo.color}`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`menu-${submission.id}`}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {submissionStatuses.map((status) => (
                <DropdownMenuItem 
                  key={status}
                  onClick={() => onStatusChange(submission.id, status)}
                  data-testid={`status-${status}-${submission.id}`}
                >
                  {statusConfig[status].icon && (
                    <span className={`mr-2 ${statusConfig[status].color}`}>
                      {(() => {
                        const SIcon = statusConfig[status].icon;
                        return <SIcon className="h-4 w-4" />;
                      })()}
                    </span>
                  )}
                  Mark as {statusConfig[status].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <h3 className="font-semibold mb-2 line-clamp-2">{submission.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {submission.description}
        </p>
        
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {submission.neighborhood && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {submission.neighborhood}
            </span>
          )}
          {submission.contactName && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {submission.contactName}
            </span>
          )}
          {submission.contactEmail && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {submission.contactEmail}
            </span>
          )}
          {submission.hoursOffered && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {submission.hoursOffered}h offered
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SubmissionSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

function EmptyState({ filter }: { filter: string }) {
  const messages: Record<string, { title: string; description: string }> = {
    all: {
      title: "No submissions yet",
      description: "Be the first to contribute! Report a problem, offer help, or share an idea.",
    },
    need: {
      title: "No help requests",
      description: "No one has requested help yet. If you need assistance, let the community know!",
    },
    offer: {
      title: "No volunteer offers",
      description: "Be the first to offer your time and skills to help the community.",
    },
    idea: {
      title: "No ideas shared",
      description: "Have a brilliant idea to improve the city? Share it with the community!",
    },
  };

  const { title, description } = messages[filter] || messages.all;

  return (
    <div className="col-span-full text-center py-16">
      <div className="w-16 h-16 mx-auto mb-6 rounded-md bg-muted flex items-center justify-center">
        <Lightbulb className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      <Link href="/submit">
        <Button data-testid="button-empty-submit">
          <Plus className="h-4 w-4 mr-2" />
          Make a Submission
        </Button>
      </Link>
    </div>
  );
}

function MatchSuggestionsPanel({ suggestions, onMatch }: { 
  suggestions: MatchSuggestion[]; 
  onMatch: (needId: string, offerId: string) => void;
}) {
  if (suggestions.length === 0) return null;

  return (
    <Card className="mb-8 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold">Match Suggestions</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Connect volunteers with people who need help
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.slice(0, 3).map((suggestion) => (
          <div key={suggestion.need.id} className="p-4 bg-background rounded-md border">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                <AlertTriangle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{suggestion.need.title}</p>
                <p className="text-xs text-muted-foreground">
                  {suggestion.need.neighborhood && `${suggestion.need.neighborhood} • `}
                  {formatDistanceToNow(new Date(suggestion.need.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="pl-8 space-y-2">
              <p className="text-xs text-muted-foreground mb-2">Potential volunteers:</p>
              {suggestion.offers.map((offer) => (
                <div key={offer.id} className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2 min-w-0">
                    <HandHeart className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="text-sm truncate">{offer.title}</span>
                    {offer.hoursOffered && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        {offer.hoursOffered}h
                      </Badge>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onMatch(suggestion.need.id, offer.id)}
                    data-testid={`match-${suggestion.need.id}-${offer.id}`}
                  >
                    <Link2 className="h-3 w-3 mr-1" />
                    Match
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [filter, setFilter] = useState<"all" | SubmissionCategory>("all");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: submissions, isLoading: submissionsLoading } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
  });

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: matchSuggestions } = useQuery<MatchSuggestion[]>({
    queryKey: ["/api/match-suggestions"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SubmissionStatus }) => {
      return apiRequest("PATCH", `/api/submissions/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/match-suggestions"] });
      toast({
        title: "Status updated",
        description: "The submission status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const matchMutation = useMutation({
    mutationFn: async ({ needId, offerId }: { needId: string; offerId: string }) => {
      return apiRequest("POST", `/api/submissions/${needId}/match/${offerId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/match-suggestions"] });
      toast({
        title: "Match created!",
        description: "The volunteer has been matched with the request.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to match",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id: string, status: SubmissionStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleMatch = (needId: string, offerId: string) => {
    matchMutation.mutate({ needId, offerId });
  };

  const filteredSubmissions = submissions?.filter((s) => {
    if (filter !== "all" && s.category !== filter) return false;
    if (neighborhoodFilter !== "all" && s.neighborhood !== neighborhoodFilter) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  }) ?? [];

  const categoryCounts = {
    all: submissions?.length ?? 0,
    need: submissions?.filter((s) => s.category === "need").length ?? 0,
    offer: submissions?.filter((s) => s.category === "offer").length ?? 0,
    idea: submissions?.filter((s) => s.category === "idea").length ?? 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-home">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Community Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/submit">
              <Button data-testid="button-new-submission">
                <Plus className="h-4 w-4 mr-2" />
                New Submission
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {stats && (
          <section className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <StatCard 
                icon={Users} 
                value={stats.totalParticipants} 
                label="Participants" 
                color="bg-primary/10 text-primary"
              />
              <StatCard 
                icon={AlertTriangle} 
                value={stats.totalNeedsReported} 
                label="Needs" 
                color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              />
              <StatCard 
                icon={HandHeart} 
                value={stats.totalVolunteersOffered} 
                label="Volunteers" 
                color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              />
              <StatCard 
                icon={CheckCircle2} 
                value={stats.resolvedCount} 
                label="Resolved" 
                color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              />
              <StatCard 
                icon={Link2} 
                value={stats.matchedCount} 
                label="Matched" 
                color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              />
              <StatCard 
                icon={TrendingUp} 
                value={`~${stats.estimatedCitizenHours}h`} 
                label="Citizen Hours" 
                color="bg-chart-3/10 text-chart-3"
              />
            </div>
          </section>
        )}

        {matchSuggestions && matchSuggestions.length > 0 && (
          <MatchSuggestionsPanel 
            suggestions={matchSuggestions} 
            onMatch={handleMatch}
          />
        )}

        <section>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold">Submissions</h2>
              <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <TabsList data-testid="filter-tabs">
                  <TabsTrigger value="all" data-testid="filter-all">
                    All ({categoryCounts.all})
                  </TabsTrigger>
                  <TabsTrigger value="need" data-testid="filter-needs">
                    Needs ({categoryCounts.need})
                  </TabsTrigger>
                  <TabsTrigger value="offer" data-testid="filter-offers">
                    Offers ({categoryCounts.offer})
                  </TabsTrigger>
                  <TabsTrigger value="idea" data-testid="filter-ideas">
                    Ideas ({categoryCounts.idea})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select value={neighborhoodFilter} onValueChange={setNeighborhoodFilter}>
                <SelectTrigger className="w-[180px]" data-testid="filter-neighborhood">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All neighborhoods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All neighborhoods</SelectItem>
                  {neighborhoods.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]" data-testid="filter-status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {submissionStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusConfig[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissionsLoading ? (
              <>
                <SubmissionSkeleton />
                <SubmissionSkeleton />
                <SubmissionSkeleton />
              </>
            ) : filteredSubmissions.length === 0 ? (
              <EmptyState filter={filter} />
            ) : (
              filteredSubmissions.map((submission) => (
                <SubmissionCard 
                  key={submission.id} 
                  submission={submission} 
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
