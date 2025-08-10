import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import ActivityTracker from "@/pages/activity-tracker";
import NutritionLog from "@/pages/nutrition-log";
import SocialTracker from "@/pages/social-tracker";
import ThoughtJournal from "@/pages/thought-journal";
import Progress from "@/pages/progress";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/activity" component={ActivityTracker} />
      <Route path="/nutrition" component={NutritionLog} />
      <Route path="/social" component={SocialTracker} />
      <Route path="/journal" component={ThoughtJournal} />
      <Route path="/progress" component={Progress} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
