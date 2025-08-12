import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Brain, Loader2, TrendingUp, AlertTriangle, CheckCircle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

interface DetailedAnalysisResult {
  patterns: string[];
  progress: string[];
  recommendations: string[];
  overallTrend: 'improving' | 'stable' | 'concerning';
}

export default function DetailedAnalysisButton() {
  const [analysis, setAnalysis] = useState<DetailedAnalysisResult | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const analysisMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/thought-journals/detailed-analysis", {});
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data.analysis);
      setShowAnalysis(true);
    },
    onError: (error) => {
      console.error("Failed to get detailed analysis:", error);
    }
  });

  const handleAnalyze = () => {
    if (showAnalysis) {
      setShowAnalysis(false);
    } else if (analysis) {
      setShowAnalysis(true);
    } else {
      analysisMutation.mutate();
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'concerning':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'concerning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleAnalyze}
        disabled={analysisMutation.isPending}
        className="w-full gradient-bg hover:opacity-90"
      >
        {analysisMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing Your Journey...
          </>
        ) : (
          <>
            <Brain className="w-4 h-4 mr-2" />
            {showAnalysis ? 'Hide' : analysis ? 'Show' : 'Get AI Journey Analysis'}
          </>
        )}
      </Button>

      {showAnalysis && analysis && (
        <div className="mt-4 space-y-4">
          {/* Overall Trend */}
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center space-x-2">
                  {getTrendIcon(analysis.overallTrend)}
                  <span>Overall Progress</span>
                </span>
                <Badge className={`${getTrendColor(analysis.overallTrend)} border`}>
                  {analysis.overallTrend}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Patterns */}
          {analysis.patterns.length > 0 && (
            <Card className="bg-white/70">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span>Patterns Discovered</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.patterns.map((pattern, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {pattern}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          {analysis.progress.length > 0 && (
            <Card className="bg-white/70">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span>Your Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.progress.map((progress, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {progress}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <Card className="bg-white/70">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span>Personalized Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}