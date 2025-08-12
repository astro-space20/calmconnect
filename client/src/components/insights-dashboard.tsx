import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Lightbulb, Target } from "lucide-react";

export default function InsightsDashboard() {
  const { data: insights, isLoading } = useQuery<{ insights: string }>({
    queryKey: ["/api/thought-journals/insights"],
  });

  if (isLoading) {
    return (
      <Card className="card-shadow">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights?.insights) {
    return (
      <Card className="card-shadow border-0 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>Your Journey Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">
              Start journaling to get personalized insights about your thought patterns and progress.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow border-0 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base">
          <Brain className="w-5 h-5 text-purple-600" />
          <span>Your Journey Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 leading-relaxed">
              {insights.insights}
            </p>
            <div className="mt-3 flex items-center space-x-1 text-xs text-purple-600">
              <Target className="w-3 h-3" />
              <span>AI-powered analysis based on your entries</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}