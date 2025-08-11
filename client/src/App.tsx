import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import ProtectedRoute from "@/components/protected-route";
import Dashboard from "@/pages/dashboard";
import ActivityTracker from "@/pages/activity-tracker";
import NutritionLog from "@/pages/nutrition-log";
import SocialTracker from "@/pages/social-tracker";
import ThoughtJournal from "@/pages/thought-journal";
import Progress from "@/pages/progress";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/activity">
        <ProtectedRoute>
          <ActivityTracker />
        </ProtectedRoute>
      </Route>
      <Route path="/nutrition">
        <ProtectedRoute>
          <NutritionLog />
        </ProtectedRoute>
      </Route>
      <Route path="/social">
        <ProtectedRoute>
          <SocialTracker />
        </ProtectedRoute>
      </Route>
      <Route path="/journal">
        <ProtectedRoute>
          <ThoughtJournal />
        </ProtectedRoute>
      </Route>
      <Route path="/progress">
        <ProtectedRoute>
          <Progress />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
