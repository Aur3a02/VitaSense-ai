import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/components/theme-provider";
import { AnalysisProvider } from "@/lib/analysis-context";
import { useAuth } from "@workspace/replit-auth-web";

import Home from "@/pages/home";
import Analyze from "@/pages/analyze";
import Results from "@/pages/results";
import Dashboard from "@/pages/dashboard";
import History from "@/pages/history";
import Chatbot from "@/pages/chatbot";
import Profile from "@/pages/profile";
import Nearby from "@/pages/nearby";
import HealthTips from "@/pages/health-tips";
import WeeklyCheckup from "@/pages/weekly-checkup";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading VitaSense...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/analyze" component={isAuthenticated ? Analyze : Home} />
      <Route path="/results" component={isAuthenticated ? Results : Home} />
      <Route path="/dashboard" component={isAuthenticated ? Dashboard : Home} />
      <Route path="/history" component={isAuthenticated ? History : Home} />
      <Route path="/chatbot" component={isAuthenticated ? Chatbot : Home} />
      <Route path="/profile" component={isAuthenticated ? Profile : Home} />
      <Route path="/nearby" component={isAuthenticated ? Nearby : Home} />
      <Route path="/health-tips" component={isAuthenticated ? HealthTips : Home} />
      <Route path="/weekly-checkup" component={isAuthenticated ? WeeklyCheckup : Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vitasense-theme">
      <QueryClientProvider client={queryClient}>
        <AnalysisProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AnalysisProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
