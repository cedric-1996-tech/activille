import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Submit from "@/pages/submit";
import NotFound from "@/pages/not-found";

function Header() {
  const [location] = useLocation();
  const isHomePage = location === "/";
  
  if (!isHomePage) return null;
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer" data-testid="logo-link">
            <div className="p-1.5 bg-primary rounded-md">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">CitizenVoice</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" data-testid="nav-dashboard">
              Dashboard
            </Button>
          </Link>
          <Link href="/submit">
            <Button data-testid="nav-submit">
              Submit
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/submit" component={Submit} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Header />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
