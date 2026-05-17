import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/components/theme-provider";
import { AnalysisProvider } from "@/lib/analysis-context";
import { Layout } from "@/components/layout";

import Home from "@/pages/home";
import Analyze from "@/pages/analyze";
import Results from "@/pages/results";
import Dashboard from "@/pages/dashboard";
import History from "@/pages/history";
import Chatbot from "@/pages/chatbot";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/analyze" component={Analyze} />
        <Route path="/results" component={Results} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/history" component={History} />
        <Route path="/chatbot" component={Chatbot} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

const queryClient = new QueryClient();

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
